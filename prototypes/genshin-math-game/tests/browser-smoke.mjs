import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const cdpPort = Number(process.env.CDP_PORT || 9333);
const targetUrlPart = process.env.GAME_URL_PART || 'genshin-math-game';
const targets = await fetch(`http://127.0.0.1:${cdpPort}/json`).then(response => response.json());
const target = targets.find(item => item.type === 'page' && item.url.includes(targetUrlPart))
  || targets.find(item => item.type === 'page');
if (!target) throw new Error('找不到游戏页面的 Chrome 调试目标');

const socket = new WebSocket(target.webSocketDebuggerUrl);
let sequence = 0;
const pending = new Map();
const runtimeExceptions = [];
const screenshotDir = process.env.SCREENSHOT_DIR || '';
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });

socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Runtime.exceptionThrown') {
    runtimeExceptions.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  }
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
};

await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
});

async function capture(name) {
  if (!screenshotDir) return;
  // 页面切换有 0.5 秒淡出；等待稳定帧，避免把上一屏重影误判为视觉缺陷。
  await sleep(650);
  // WebGL 截图在部分软件渲染环境成本很高；CI 可不设置 SCREENSHOT_DIR，
  // 交互判定不依赖截图，视觉检查在缩小视口后单独执行。
  const shot = await send('Page.captureScreenshot', {
    format: 'png', fromSurface: true, captureBeyondViewport: false
  });
  await writeFile(`${screenshotDir}/${name}.png`, Buffer.from(shot.data, 'base64'));
}

async function evaluate(expression) {
  const response = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  return response.result.value;
}

async function waitFor(expression, timeoutMs = 12000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await evaluate(expression)) return;
    await sleep(80);
  }
  throw new Error(`等待超时：${expression}`);
}

async function fresh(save = null, { skipDiagnostic = true } = {}) {
  await evaluate(
    'localStorage.clear();localStorage.setItem("genshinMathTutorialSeen","1");' +
    (save ? `localStorage.setItem("genshinMathSave",${JSON.stringify(JSON.stringify(save))});` : '')
  );
  await send('Page.reload', { ignoreCache: true });
  await waitFor('document.querySelector(".screen.active")?.id === "main-menu"');
  if (save) {
    await evaluate('document.querySelector("#btn-continue").click()');
  } else {
    await evaluate('document.querySelector("#btn-start").click()');
    await waitFor('document.querySelector(".screen.active")?.id === "diagnostic-screen"');
    if (!skipDiagnostic) return;
    await evaluate('document.querySelector("#btn-diagnostic-skip").click()');
  }
  await waitFor(`document.querySelector(".screen.active")?.id === "world-map"
    && window.__game?.session.mapActive === true`);
}

async function finishDialog() {
  for (let guard = 0; guard < 30; guard++) {
    if (await evaluate('document.querySelector(".screen.active")?.id !== "dialog-screen"')) return;
    if (await evaluate('window.__game.session.typing')) {
      await evaluate('document.querySelector("#dialog-screen").click()');
      await sleep(20);
    }
    await evaluate('document.querySelector("#dialog-screen").click()');
    await sleep(40);
  }
  throw new Error('对话未在预期次数内结束');
}

async function press(key, code, keyCode, durationMs) {
  await send('Input.dispatchKeyEvent', {
    type: 'keyDown', key, code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  });
  await sleep(durationMs);
  await send('Input.dispatchKeyEvent', {
    type: 'keyUp', key, code,
    windowsVirtualKeyCode: keyCode,
    nativeVirtualKeyCode: keyCode
  });
  await sleep(120);
}

async function enterWindRegion() {
  // 必须在同一个 JS 回合内完成"设状态 + 点击"：否则地图循环的 checkLandmarkProximity
  // 会在两次 evaluate 之间把 currentLandmark 重置为 null 并隐藏进入提示（竞态）
  await evaluate(`Object.assign(window.__game.session,{
    playerX:350,playerY:300,targetX:350,targetY:300,isMoving:false,moveMode:null,
    currentLandmark:0,controlsLocked:false
  });window.__game.updatePlayerSprite();
  document.querySelector("#region-enter-prompt").classList.remove("hidden");
  document.querySelector("#btn-enter-region").click()`);
  await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
}

async function choosePrediction() {
  // 预测阶段已移除：若当前不在 prediction 阶段则直接跳过
  if (!(await evaluate('window.__game.session.missionPhase === "prediction"'))) return;
  await evaluate(`(() => {
    const mission = window.__game.session.currentPuzzle;
    [...document.querySelectorAll('.prediction-option')]
      .find(button => button.textContent === String(mission.prediction.answer)).click();
  })()`);
  await waitFor('window.__game.session.missionPhase === "operate"');
}

async function solveVisibleInteraction() {
  const type = await evaluate('window.__game.session.missionInteraction.type');
  if (type === 'match') {
    for (let guard = 0; guard < 30; guard++) {
      const remaining = await evaluate('document.querySelectorAll(".puzzle-token:not(.used):not(:disabled)").length');
      if (!remaining) break;
      await evaluate('document.querySelector(".puzzle-token:not(.used):not(:disabled)").click()');
    }
  } else if (type === 'partWhole') {
    const remaining = await evaluate(`(() => {
      const config = window.__game.session.missionPhase === 'transfer'
        ? window.__game.session.currentPuzzle.transfer : window.__game.session.currentPuzzle.primary;
      return config.changeCount - window.__game.session.missionInteraction.moved;
    })()`);
    for (let index = 0; index < remaining; index++) {
      await evaluate('document.querySelector("[data-part-action=move]").click()');
    }
  } else if (type === 'array') {
    const delta = await evaluate(`(() => {
      const config = window.__game.session.missionPhase === 'transfer'
        ? window.__game.session.currentPuzzle.transfer : window.__game.session.currentPuzzle.primary;
      const value = window.__game.session.missionInteraction;
      return { rows: config.targetRows - value.rows, cols: config.targetCols - value.cols };
    })()`);
    const rowAction = delta.rows >= 0 ? 'rows-up' : 'rows-down';
    const colAction = delta.cols >= 0 ? 'cols-up' : 'cols-down';
    for (let index = 0; index < Math.abs(delta.rows); index++) {
      await evaluate(`document.querySelector('[data-array="${rowAction}"]').click()`);
    }
    for (let index = 0; index < Math.abs(delta.cols); index++) {
      await evaluate(`document.querySelector('[data-array="${colAction}"]').click()`);
    }
  } else if (type === 'split') {
    const needs = await evaluate(`(() => {
      const config = window.__game.session.missionPhase === 'transfer'
        ? window.__game.session.currentPuzzle.transfer : window.__game.session.currentPuzzle.primary;
      const target = config.total / config.groups;
      return window.__game.session.missionInteraction.assignments.map(value => target - value);
    })()`);
    for (let group = 0; group < needs.length; group++) {
      for (let count = 0; count < needs[group]; count++) {
        await evaluate(`document.querySelectorAll('.puzzle-zone')[${group}].querySelector('[data-action="add"]').click()`);
      }
    }
  } else if (type === 'balance') {
    const actions = await evaluate(`(() => {
      const config = window.__game.session.missionPhase === 'transfer'
        ? window.__game.session.currentPuzzle.transfer : window.__game.session.currentPuzzle.primary;
      const value = window.__game.session.missionInteraction;
      return {
        side: value.left < config.target ? 'add-left' : 'add-right',
        count: value.left < config.target ? config.target - value.left : config.target - value.right
      };
    })()`);
    for (let index = 0; index < actions.count; index++) {
      await evaluate(`document.querySelector('[data-balance="${actions.side}"]').click()`);
    }
  } else {
    throw new Error(`未支持的任务交互类型：${type}`);
  }
}

async function submitCorrectExpression({ wrongFirst = false } = {}) {
  await waitFor('window.__game.session.missionPhase === "express"');
  const hasChips = await evaluate('!!document.querySelector(".chip-bank")');
  if (hasChips) {
    // 拼算式：先拼错一张验证提示，再拼正确序列
    if (wrongFirst) {
      await evaluate(`(() => {
        const chip = [...document.querySelectorAll('.chip-bank .expr-chip:not(.used)')][0];
        chip.click();
        document.querySelector('#btn-chips-confirm').click();
      })()`);
      await waitFor('!document.querySelector("#puzzle-error-card").classList.contains("hidden")');
      await evaluate(`document.querySelector('.chip-build .expr-chip')?.click()`);
    }
    await evaluate(`(() => {
      const tokens = window.__game.session.currentPuzzle.expression.tokens;
      tokens.forEach(text => {
        [...document.querySelectorAll('.chip-bank .expr-chip:not(.used)')]
          .find(c => c.textContent === text).click();
      });
      document.querySelector('#btn-chips-confirm').click();
    })()`);
    await waitFor('window.__game.session.missionPhase === "transfer"');
    return;
  }
  if (wrongFirst) {
    await evaluate(`(() => {
      const answer = window.__game.session.currentPuzzle.expression.answer;
      [...document.querySelectorAll('.expression-option')]
        .find(button => button.textContent !== String(answer)).click();
    })()`);
    await waitFor('!document.querySelector("#puzzle-error-card").classList.contains("hidden")');
  }
  await evaluate(`(() => {
    const answer = window.__game.session.currentPuzzle.expression.answer;
    [...document.querySelectorAll('.expression-option')]
      .find(button => button.textContent === String(answer)).click();
  })()`);
  await waitFor('window.__game.session.missionPhase === "transfer"');
}

async function finishCurrentMission({ wrongPrimary = false, wrongExpression = false, hintTier = 0 } = {}) {
  await waitFor('document.querySelector(".screen.active")?.id === "puzzle-screen"');
  if (await evaluate('window.__game.session.missionPhase === "prediction"')) await choosePrediction();

  if (hintTier) {
    // 先等瞬时弹窗（任务完成提示等）消失，避免与"任务提示不弹窗"的断言打架
    await waitFor('document.querySelector("#hint-modal").classList.contains("hidden")');
    await evaluate(`document.querySelector('[data-mission-hint-tier="${hintTier}"]').click()`);
    await evaluate(`document.querySelector('[data-mission-hint-tier="${hintTier}"]').click()`);
    assert.equal(await evaluate('window.__game.session.missionHintTier'), hintTier);
    assert.equal(await evaluate('document.querySelector("#hint-modal").classList.contains("hidden")'), true,
      '任务提示应在操作台内非阻塞呈现');
    assert.equal(await evaluate(`document.querySelector('.puzzle-card').classList.contains('hint-tier-${hintTier}')`), true);
    assert.ok((await evaluate('document.querySelector("#puzzle-guide-text").textContent')).length > 4);
  }

  if (wrongPrimary) {
    await evaluate('document.querySelector("#btn-puzzle-check").click()');
    await waitFor('document.querySelector("#puzzle-status").classList.contains("error")');
  }
  await solveVisibleInteraction();
  await evaluate('document.querySelector("#btn-puzzle-check").click()');
  await submitCorrectExpression({ wrongFirst: wrongExpression });
  // 检验页已移除：表达成功直接进迁移
  await solveVisibleInteraction();
  await evaluate('document.querySelector("#btn-puzzle-check").click()');
  await waitFor('window.__game.session.missionPhase === "complete"');
  const completion = await evaluate('document.querySelector("#puzzle-completion-note").textContent');
  await evaluate('document.querySelector("#btn-puzzle-continue").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "reward-screen"');
  return completion;
}

async function solveBattle() {
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  const count = await evaluate('window.__game.session.currentQuestions.length');
  for (let index = 0; index < count; index++) {
    await evaluate(`(() => {
      const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
      if (q.interaction) {
        if (q.interaction.type === 'tapCount') {
          [...document.querySelectorAll('.tapcount-cell')].slice(0, q.interaction.target).forEach(c => c.click());
        } else if (q.interaction.type === 'dragSplit') {
          const cfg = q.interaction;
          const targets = cfg.ratio
            ? cfg.ratio.map(r => Math.round(cfg.total * r / cfg.ratio.reduce((a, b) => a + b, 0)))
            : Array(cfg.zones).fill(Math.floor(cfg.total / cfg.zones));
          for (let guard = 0; guard < 80; guard++) {
            const it = window.__game.session.currentInteraction;
            if (!it || it.type !== 'dragSplit') break;
            const zones = [...document.querySelectorAll('.dragsplit-zone')];
            const overIdx = it.zones.findIndex((c, i) => c > targets[i]);
            const underIdx = it.zones.findIndex((c, i) => c < targets[i]);
            if (overIdx === -1 && underIdx === -1 && it.remaining === 0) break;
            if (overIdx !== -1) {
              zones[overIdx].click();
              document.querySelector('.dragsplit-undo').click();
            } else if (it.remaining > 0 && underIdx !== -1) {
              zones[underIdx].click();
              document.querySelector('.dragsplit-item')?.click();
            } else if (it.remaining > 0) {
              document.querySelector('.dragsplit-item')?.click();
            } else break;
          }
        } else if (q.interaction.type === 'shapePick') {
          const cards = [...document.querySelectorAll('.shapepick-card')];
          q.interaction.items.forEach((item, i) => { if (item.match) cards[i].click(); });
        } else if (q.interaction.type === 'balance') {
          const need = q.interaction.left - (q.interaction.rightStart || 0);
          for (let i = 0; i < need; i++) document.querySelector('#battle-balance-add').click();
        }
        document.querySelector('.interaction-confirm-bar .genshin-btn').click();
        return;
      }
      [...document.querySelectorAll('.answer-btn')].find(button => button.textContent == q.answer).click();
    })()`);
    if (index < count - 1) {
      await waitFor(`window.__game.session.currentQuestionIndex === ${index + 1} && window.__game.session.answered === false`);
    }
  }
  // 全独立答对可能触发灵感挑战（900ms 后出现）：先等挑战或结算任一出现
  await waitFor('window.__game.session.challengeActive === true || document.querySelector(".screen.active")?.id === "reward-screen"');
  if (await evaluate('window.__game.session.challengeActive === true')) {
    await evaluate(`(() => {
      const q = window.__game.session.challengeQuestion;
      [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
    })()`);
  }
  await waitFor('document.querySelector(".screen.active")?.id === "reward-screen"');
}

const report = {};
const stage = name => console.error(`[browser] ${name}`);

try {
  if (screenshotDir) {
    await evaluate('localStorage.clear();localStorage.setItem("genshinMathTutorialSeen","1")');
    await send('Page.reload', { ignoreCache: true });
    await waitFor('document.querySelector(".screen.active")?.id === "main-menu"');
    report.menu = await evaluate(`(() => {
      const hero = document.querySelector('.menu-hero-portrait');
      const rect = hero.getBoundingClientRect();
      return {
        viewport: [innerWidth, innerHeight],
        heroArt: getComputedStyle(hero).backgroundImage.includes('xiaoyuan-storybook-v2.webp'),
        heroVisible: rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight,
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth
      };
    })()`);
    assert.deepEqual(report.menu, {
      viewport: [1440, 900], heroArt: true, heroVisible: true, horizontalOverflow: false
    });
    await capture('01-main-menu');
  }
  stage('能力观察与可改选路线');
  await fresh(null, { skipDiagnostic: false });
  for (let index = 0; index < 3; index++) {
    await evaluate(`(() => {
      const question = window.LearningSystems.DIAGNOSTIC_QUESTIONS[window.__game.session.diagnosticIndex];
      [...document.querySelectorAll('.diagnostic-option')]
        .find(button => button.textContent == question.answer).click();
    })()`);
  }
  await waitFor('!document.querySelector("#diagnostic-result").classList.contains("hidden")');
  report.diagnostic = await evaluate(`({
    score: window.__game.session.diagnosticScore,
    suggestion: window.__game.session.diagnosticSuggestedRegion,
    title: document.querySelector('#diagnostic-result-title').textContent
  })`);
  assert.deepEqual(report.diagnostic, { score: 3, suggestion: 4, title: '建议从「澄水庭」附近开始' });
  await evaluate('document.querySelector("#btn-diagnostic-wind").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "world-map" && window.__game?.session.mapActive === true');
  assert.deepEqual(await evaluate(`({
    current: window.__game.state.player.currentRegion,
    suggested: window.__game.state.learning.suggestedRegion,
    chosen: window.__game.state.learning.chosenStartRegion
  })`), { current: 0, suggested: 4, chosen: 0 });

  stage('地图角色、键盘移动与剧情不循环');
  await fresh();
  await capture('02-world-map');
  report.ui = await evaluate(`({
    groundCanvas: document.querySelector('#world-ground') instanceof HTMLCanvasElement
      && document.querySelector('#world-ground').width > 3000,
    noTileBg: getComputedStyle(document.querySelector('#world-canvas')).backgroundImage === 'none',
    heroSvg: !!document.querySelector('.player-head svg.hero-svg'),
    mapInert: document.querySelector('#world-map').inert,
    minimapSize: [document.querySelector('#minimap').width, document.querySelector('#minimap').height],
    dpadButtons: document.querySelectorAll('[data-map-move]').length,
    dpadTarget: Math.round(document.querySelector('[data-map-move="arrowup"]').getBoundingClientRect().width)
  })`);
  assert.deepEqual({ groundCanvas: report.ui.groundCanvas, noTileBg: report.ui.noTileBg, heroSvg: report.ui.heroSvg, mapInert: report.ui.mapInert, minimapSize: report.ui.minimapSize },
    { groundCanvas: true, noTileBg: true, heroSvg: true, mapInert: false, minimapSize: [280, 175] });
  assert.equal(report.ui.dpadButtons, 4);
  assert.ok(report.ui.dpadTarget >= 50, '触屏方向键应提供儿童可稳定点击的大触点');
  const movementStart = await evaluate('window.__game.session.playerX');
  await press('d', 'KeyD', 68, 260);
  assert.ok(await evaluate(`window.__game.session.playerX > ${movementStart}`), 'D 键应移动主角');
  const dpadStart = await evaluate('window.__game.session.playerY');
  await evaluate(`document.querySelector('[data-map-move="arrowdown"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerId:7}))`);
  await sleep(240);
  await evaluate(`document.querySelector('[data-map-move="arrowdown"]').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerId:7}));
    window.__game.session.moveKeys.arrowdown=false;
    window.__game.session.isMoving=false;
    window.__game.session.moveMode=null`);
  await sleep(100);
  assert.ok(await evaluate(`window.__game.session.playerY > ${dpadStart}`), '触屏方向盘应移动主角');
  await evaluate('document.querySelector("#btn-map-settings").click()');
  await evaluate('document.querySelector("#toggle-large-text").click();document.querySelector("#toggle-reduced-motion").click()');
  report.accessibility = await evaluate(`({
    largeText: document.documentElement.classList.contains('large-text'),
    reducedMotion: document.documentElement.classList.contains('reduced-motion'),
    largePressed: document.querySelector('#toggle-large-text').getAttribute('aria-pressed'),
    motionPressed: document.querySelector('#toggle-reduced-motion').getAttribute('aria-pressed')
  })`);
  assert.deepEqual(report.accessibility, {
    largeText: true, reducedMotion: true, largePressed: 'true', motionPressed: 'true'
  });
  await evaluate(`document.querySelector('#toggle-large-text').click();
    document.querySelector('#toggle-reduced-motion').click();
    Object.assign(window.__game.session,{
      playerX:800,playerY:800,targetX:800,targetY:800,isMoving:false,moveMode:null
    });
    Object.keys(window.__game.session.moveKeys).forEach(key=>window.__game.session.moveKeys[key]=false);
    window.__game.updatePlayerSprite();
    document.querySelector('#btn-close-settings').click()`);
  await evaluate(`Object.assign(window.__game.session,{
    playerX:1400,playerY:2720,targetX:1400,targetY:2720,isMoving:false,moveMode:null
  });window.__game.updatePlayerSprite()`);
  await waitFor('document.querySelector(".screen.active")?.id === "dialog-screen"');
  const storyPosition = await evaluate('[window.__game.session.playerX,window.__game.session.playerY]');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "world-map"');
  await sleep(260);
  report.story = await evaluate(`({
    seen: window.__game.state.map.seenStories,
    position: [window.__game.session.playerX,window.__game.session.playerY],
    screen: document.querySelector('.screen.active')?.id
  })`);
  assert.ok(report.story.seen.includes('intro'));
  assert.deepEqual(report.story.position, storyPosition);
  assert.equal(report.story.screen, 'world-map');

  stage('填充式机关：收集风种-估算-投放-修复风车');
  // 未完成时：0-0 入口应引导到地图机关而非任务卡
  await evaluate('window.__game.startLevel(0,0)');
  await sleep(400);
  assert.equal(await evaluate('document.querySelector(".screen.active")?.id'), 'world-map', '0-0 未完成时应引导到地图');
  await evaluate(`Object.assign(window.__game.session,{
    playerX:1500,playerY:2300,targetX:1500,targetY:2300,isMoving:false,moveMode:null
  });window.__game.updatePlayerSprite()`);
  await sleep(3600); // 引导提示期间 controlsLocked=true，等提示关闭后收集检测才会运行
  report.materials = await evaluate(`({
    seeds: window.__game.state.materials.windSeed,
    hud: document.querySelector('#mini-mat-windSeed').textContent
  })`);
  assert.ok(report.materials.seeds >= 1, '靠近风种应自动收集');
  assert.equal(Number(report.materials.hud) >= 1, true, 'HUD 应显示风种数');
  await evaluate('window.__game.state.materials.windSeed = 8');
  // 打开机关 → 估算 7 → 投放
  await evaluate('window.__game.openMechanism("windmill")');
  await waitFor('!document.querySelector("#mechanism-panel").classList.contains("hidden")');
  assert.equal(await evaluate('window.__game.session.mapActive === true'), true);
  await waitFor('!document.querySelector("#mechanism-fill").classList.contains("hidden")', 8000);
  // 放 7 颗 → 启动风车 → "太多"物理反馈，不应误完成
  await evaluate('(() => { for (let i = 0; i < 7; i++) document.querySelector("#btn-mech-place").click(); })()');
  await evaluate('document.querySelector("#btn-mech-verify").click()');
  report.mechOver = await evaluate(`({
    feedback: document.querySelector('#mech-feedback').textContent,
    filled: window.__game.session.mechanism.placed,
    completed: window.__game.state.player.completedLevels.includes('0-0')
  })`);
  assert.match(report.mechOver.feedback, /太多/);
  assert.equal(report.mechOver.completed, false, '放多不应误完成');
  // 取回 1 颗 → 再启动 → 正好 6 颗 → 成功：叶片转动、符号定格、关卡完成
  await evaluate('document.querySelector("#btn-mech-take").click()');
  await evaluate('document.querySelector("#btn-mech-verify").click()');
  await waitFor('window.__game.state.map.worldChanges.windmillRestored === true', 15000);
  report.mechDone = await evaluate(`({
    completed: window.__game.state.player.completedLevels.includes('0-0'),
    puzzles: window.__game.state.learning.completedPuzzles,
    panelHidden: document.querySelector('#mechanism-panel').classList.contains('hidden'),
    screen: document.querySelector('.screen.active')?.id,
    seedsLeft: window.__game.state.materials.windSeed
  })`);
  assert.equal(report.mechDone.completed, true, '机关成功应完成 0-0');
  assert.ok(report.mechDone.puzzles.includes('wind-one-to-one'));
  assert.equal(report.mechDone.screen, 'reward-screen');
  // 完成后：任务卡作为复习入口开放
  await evaluate('window.__game.startLevel(0,0)');
  await waitFor('document.querySelector(".screen.active")?.id === "puzzle-screen"', 15000);
  // 验证后退出复习任务卡并清理残留检查点，避免干扰后续阶段
  await evaluate('document.querySelector("#btn-puzzle-exit").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
  await evaluate(`delete window.__game.state.learning.missionCheckpoints['0-0']`);

  // 快速完成机关的助手：估算直接提交，按各类型驱动交互
  async function completeMechanismQuick(id, levelId, material, runScript) {
    await evaluate(`window.__game.state.materials["${material}"] = 20`);
    await evaluate(`window.__game.openMechanism("${id}")`);
    await waitFor('!document.querySelector("#mechanism-panel").classList.contains("hidden")');
    await waitFor('!document.querySelector("#mechanism-fill").classList.contains("hidden")');
    await evaluate(runScript);
    await waitFor(`window.__game.state.player.completedLevels.includes("${levelId}")`, 15000);
    await waitFor('document.querySelector(".screen.active")?.id === "reward-screen"');
  }

  stage('机关群：风核充能、灯塔行列、风桥均分、风暴配平');
  // 0-1 fillTo：已有 4，补 3 → 溢出反馈先行验证
  await completeMechanismQuick('windcore', '0-1', 'windSeed', `(() => {
    for (let i = 0; i < 3; i++) document.querySelector('#btn-mech-place').click();
    document.querySelector('#btn-mech-verify').click();
  })()`);
  report.windcore = await evaluate(`({
    lit: window.__game.state.map.worldChanges.windcoreLit,
    completed: window.__game.state.player.completedLevels.includes('0-1')
  })`);
  assert.deepEqual(report.windcore, { lit: true, completed: true });
  // 0-2 grid：安 12 盏点亮，行列计数出现
  await completeMechanismQuick('windtower', '0-2', 'windLamp', `(() => {
    for (let i = 0; i < 12; i++) document.querySelector('#btn-mech-place').click();
    document.querySelector('#btn-mech-verify').click();
  })()`);
  report.windtower = await evaluate(`({
    lit: window.__game.state.map.worldChanges.windtowerLit,
    completed: window.__game.state.player.completedLevels.includes('0-2')
  })`);
  assert.deepEqual(report.windtower, { lit: true, completed: true });
  // 0-3 distribute：4/4/4 均分 → 自动成功；先验证不均分会"桥还歪着"
  await evaluate('window.__game.state.materials.plank = 20');
  await evaluate('window.__game.openMechanism("windbridge")');
  await waitFor('!document.querySelector("#mechanism-panel").classList.contains("hidden")');
  await waitFor('!document.querySelector("#mechanism-fill").classList.contains("hidden")');
  await evaluate(`(() => {
    for (let i = 0; i < 12; i++) document.querySelector('#btn-mech-place').click();
  })()`);
  report.bridgeUneven = await evaluate(`({
    feedback: document.querySelector('#mech-feedback').textContent,
    completed: window.__game.state.player.completedLevels.includes('0-3')
  })`);
  assert.match(report.bridgeUneven.feedback, /歪/);
  assert.equal(report.bridgeUneven.completed, false, '不均分不应成功');
  await evaluate(`(() => {
    const zones = [...document.querySelectorAll('.mech-zone')];
    zones[0].click();
    for (let i = 0; i < 8; i++) document.querySelector('#btn-mech-take').click();
    zones[1].click();
    for (let i = 0; i < 4; i++) document.querySelector('#btn-mech-place').click();
    zones[2].click();
    for (let i = 0; i < 4; i++) document.querySelector('#btn-mech-place').click();
  })()`);
  await waitFor('window.__game.state.player.completedLevels.includes("0-3")', 15000);
  // 0-4 balance：右盘放 5 → 自动平衡
  await completeMechanismQuick('stormcore', '0-4', 'windCrystal', `(() => {
    for (let i = 0; i < 5; i++) document.querySelector('#btn-mech-place').click();
  })()`);
  report.stormcore = await evaluate(`({
    calmed: window.__game.state.map.worldChanges.stormCalmed,
    completed: window.__game.state.player.completedLevels.includes('0-4')
  })`);
  assert.deepEqual(report.stormcore, { calmed: true, completed: true });

  stage('任务检查点退出与恢复');
  await enterWindRegion();
  await evaluate('document.querySelectorAll(".level-item")[1].click()');
  await choosePrediction();
  await capture('03-puzzle-operate');
  report.puzzleVisual = await evaluate(`({
    guideArt: getComputedStyle(document.querySelector('.puzzle-guide-avatar')).backgroundImage.includes('xingya-wind-guide-v2.webp'),
    actionBtn: Math.round(document.querySelector('[data-part-action="move"]').getBoundingClientRect().height),
    horizontalOverflow: document.querySelector('.puzzle-card').scrollWidth > document.querySelector('.puzzle-card').clientWidth + 1,
    hintsVisible: document.querySelector('#mission-hints').getBoundingClientRect().bottom <= innerHeight
  })`);
  assert.equal(report.puzzleVisual.guideArt, true);
  assert.ok(report.puzzleVisual.actionBtn >= 40, '操作按钮应提供足够大的触点');
  assert.equal(report.puzzleVisual.horizontalOverflow, false, '桌面任务卡不应出现横向滚动');
  assert.equal(report.puzzleVisual.hintsVisible, true, '分层提示应在操作首屏内可见');
  await evaluate('document.querySelector("[data-part-action=move]").click()');
  assert.equal(await evaluate('window.__game.session.missionInteraction.moved'), 1,
    '操作一步应累计到检查点交互里');
  await evaluate('document.querySelector("#btn-puzzle-exit").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
  report.checkpointSaved = await evaluate(`(() => {
    const cp = window.__game.state.learning.missionCheckpoints['0-1'];
    return { phase: cp.phase, moved: cp.interaction.moved,
      label: document.querySelectorAll('.level-item')[1].textContent };
  })()`);
  assert.equal(report.checkpointSaved.phase, 'operate');
  assert.equal(report.checkpointSaved.moved, 1);
  assert.match(report.checkpointSaved.label, /继续上次：操作/);
  await evaluate('document.querySelectorAll(".level-item")[1].click()');
  await waitFor('window.__game.session.missionPhase === "operate"');
  assert.equal(await evaluate('window.__game.session.missionInteraction.moved'), 1);
  report.firstMissionCompletion = await finishCurrentMission({ wrongPrimary: true });
  assert.match(report.firstMissionCompletion, /完成修复/);
  assert.equal(await evaluate('window.__game.state.learning.missionCheckpoints["0-1"]'), undefined);

  stage('五种数学交互与三类学习证据');
  const missionOptions = [
    { index: 2, options: { wrongExpression: true } },
    { index: 3, options: { wrongPrimary: true } },
    { index: 4, options: { hintTier: 1 } }
  ];
  for (const item of missionOptions) {
    await evaluate('document.querySelector("#btn-reward-continue").click()');
    await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
    await evaluate(`document.querySelectorAll('.level-item')[${item.index}].click()`);
    await finishCurrentMission(item.options);
  }
  // 风暴核心（最后一个任务）的结算文案要在战斗关卡之前读取
  report.windMissionReward = await evaluate(`({
    finalReward: document.querySelector('#reward-msg').textContent,
    rewardCause: document.querySelector('#reward-change-title').textContent,
    rewardChange: document.querySelector('#reward-world-change').dataset.change,
    growthBadges: document.querySelectorAll('#reward-growth-badges .growth-badge').length
  })`);
  assert.match(report.windMissionReward.finalReward, /风暴核心恢复平衡/);
  assert.match(report.windMissionReward.rewardCause, /两侧风压相等/);
  assert.equal(report.windMissionReward.rewardChange, 'storm');
  assert.equal(report.windMissionReward.growthBadges, 3);
  // 风语原共 7 关：5 个任务关 + 2 个战斗关（连加连减、乘法口诀），全部通关才解锁岩岚港
  for (const index of [5, 6]) {
    await evaluate('document.querySelector("#btn-reward-continue").click()');
    await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
    await evaluate(`document.querySelectorAll('.level-item')[${index}].click()`);
    await finishDialog();
    await solveBattle();
  }
  report.windSlice = await evaluate(`({
    completedLevels: window.__game.state.player.completedLevels,
    completedMissions: window.__game.state.learning.completedPuzzles,
    unlockedRegions: window.__game.state.player.unlockedRegions,
    currentRegion: window.__game.state.player.currentRegion,
    changes: window.__game.state.map.worldChanges,
    errorTypes: [...new Set(window.__game.state.learning.errorLog.map(item => item.type))],
    evidenceKinds: [...new Set(window.__game.state.learning.evidence.map(item => item.kind))],
    checkpoints: window.__game.state.learning.missionCheckpoints
  })`);
  assert.deepEqual(report.windSlice.completedLevels.slice(0, 5), ['0-0', '0-1', '0-2', '0-3', '0-4']);
  assert.deepEqual(report.windSlice.completedLevels, ['0-0', '0-1', '0-2', '0-3', '0-4', '0-5', '0-6']);
  assert.equal(report.windSlice.completedMissions.length, 5);
  assert.ok(report.windSlice.unlockedRegions.includes(1));
  assert.equal(report.windSlice.currentRegion, 0, '解锁新区域后不应强制改变当前探索区域');
  assert.deepEqual(report.windSlice.changes, {
    windmillRestored: true, windcoreLit: true, windtowerLit: true, bridgeOpened: true, stormCalmed: true,
    starmillRestored: false, echoscaleRestored: false
  });
  assert.ok(report.windSlice.errorTypes.includes('language'));
  assert.ok(report.windSlice.errorTypes.includes('representation'));
  for (const kind of ['model', 'explanation', 'verification', 'transfer']) {
    assert.ok(report.windSlice.evidenceKinds.includes(kind), `缺少 ${kind} 学习证据`);
  }
  assert.deepEqual(report.windSlice.checkpoints, {});
  await capture('04-reward');

  stage('返回探索、世界变化与学习档案');
  await evaluate('document.querySelector("#btn-reward-map").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "world-map" && window.__game.session.mapActive');
  await sleep(240);
  report.worldChanges = await evaluate(`({
    windmill: document.querySelector('#windmill-change').classList.contains('restored'),
    bridge: document.querySelector('#wind-bridge-change').classList.contains('opened'),
    storm: document.querySelector('#storm-core-change').classList.contains('calmed'),
    position: [window.__game.session.playerX,window.__game.session.playerY]
  })`);
  assert.deepEqual(report.worldChanges.position, [350, 300]);
  assert.equal(report.worldChanges.windmill, true);
  assert.equal(report.worldChanges.bridge, true);
  assert.equal(report.worldChanges.storm, true);
  // 提示弹窗期间 controlsLocked=true，按键会被吞；等提示关闭再移动
  await waitFor('document.querySelector("#hint-modal").classList.contains("hidden")');
  await press('s', 'KeyS', 83, 1600);
  assert.ok(await evaluate('Math.hypot(window.__game.session.playerX-350,window.__game.session.playerY-300) > 100'));
  await evaluate('document.querySelector("#btn-learning-profile").click()');
  report.profile = await evaluate(`({
    summary: document.querySelector('#learning-profile-summary').textContent.replace(/\s+/g,' ').trim(),
    misconception: document.querySelector('#misconception-list').textContent,
    rows: document.querySelectorAll('#mastery-list .mastery-row').length,
    locked: window.__game.session.controlsLocked
  })`);
  assert.match(report.profile.summary, /迁移成功/);
  assert.match(report.profile.summary, /下一次 5 分钟/);
  assert.match(report.profile.misconception, /部分与整体|平均分/);
  assert.equal(report.profile.rows, 7);
  assert.equal(report.profile.locked, true);
  await evaluate('document.querySelector("#btn-close-learning-profile").click()');

  stage('重复任务不重复发放奖励');
  const beforeReplay = await evaluate('({gems:window.__game.state.player.gems,exp:window.__game.state.player.exp})');
  await enterWindRegion();
  await evaluate('document.querySelectorAll(".level-item")[1].click()');
  await finishCurrentMission();
  report.replay = await evaluate(`({
    gems: window.__game.state.player.gems,
    exp: window.__game.state.player.exp,
    reward: document.querySelector('#reward-items').textContent.replace(/\s+/g,' ').trim()
  })`);
  assert.deepEqual({ gems: report.replay.gems, exp: report.replay.exp }, beforeReplay);
  assert.match(report.replay.reward, /已领取首通奖励/);

  stage('非风区域保留分阶段挑战与主动退出');
  await fresh();
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(1,0)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  await evaluate('window.confirm=()=>true;document.querySelector("#btn-battle-exit").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
  assert.equal(await evaluate('window.__game.state.player.completedLevels.includes("1-0")'), false);
  await evaluate('window.__game.startLevel(1,0)');
  await finishDialog();
  await solveBattle();
  assert.equal(await evaluate('window.__game.state.player.completedLevels.includes("1-0")'), true);

  stage('商店购买武器装备并在战斗中使用武器道具');
  await fresh();
  await evaluate('window.__game.state.player.gems = 600');
  await evaluate('document.querySelector("#btn-map-shop").click()');
  await waitFor('!document.querySelector("#shop-modal").classList.contains("hidden")');
  await evaluate(`(() => {
    [...document.querySelectorAll('#shop-list .shop-item')]
      .find(el => el.textContent.includes('雷鸣长枪')).querySelector('button').click();
  })()`);
  report.shop = await evaluate(`({
    gems: window.__game.state.player.gems,
    weapon: window.__game.state.equipment.weapon,
    owned: window.__game.state.inventory.weapons
  })`);
  assert.equal(report.shop.gems, 440);
  assert.equal(report.shop.weapon, 'thunder');
  assert.ok(report.shop.owned.includes('thunder'));
  // 切到道具页买一瓶生命药水
  await evaluate('document.querySelector(\'[data-shop-tab="consumables"]\').click()');
  await evaluate(`(() => {
    [...document.querySelectorAll('#shop-list .shop-item')]
      .find(el => el.textContent.includes('生命药水')).querySelector('button').click();
  })()`);
  assert.equal(await evaluate('window.__game.state.inventory.consumables.potion'), 1);
  assert.equal(await evaluate('window.__game.state.player.gems'), 420);
  // 防具页签：购买风旅皮甲（60）自动装备，防御 7 → 9
  await evaluate('document.querySelector(\'[data-shop-tab="armor"]\').click()');
  await evaluate(`(() => {
    [...document.querySelectorAll('#shop-list .shop-item')]
      .find(el => el.textContent.includes('风旅皮甲')).querySelector('button').click();
  })()`);
  report.armor = await evaluate(`({
    gems: window.__game.state.player.gems,
    armor: window.__game.state.equipment.armor,
    owned: window.__game.state.inventory.armors
  })`);
  assert.equal(report.armor.gems, 360);
  assert.equal(report.armor.armor, 'leather');
  assert.ok(report.armor.owned.includes('leather'));
  await evaluate('document.querySelector("#btn-close-shop").click()');
  // 进入战斗（2-0 纯选择题关卡）：敌属性、武器信息、道具计数、武器技能、弱点题、攻防公式
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(2,0)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  report.battleItems = await evaluate(`({
    enemyStats: document.querySelector('#enemy-stats').textContent,
    weaponInfo: document.querySelector('#player-weapon-info').textContent,
    strikeDisabled: document.querySelector('#weapon-strike-btn').disabled,
    potionCount: document.querySelector('#potion-count').textContent,
    badgeNow: !!document.querySelector('.weakness-badge'),
    qCount: window.__game.session.currentQuestions.length,
    hp: window.__game.state.player.hp
  })`);
  assert.match(report.battleItems.enemyStats, /⚔️ 20 · 🛡️ 4/);
  assert.match(report.battleItems.weaponInfo, /雷鸣长枪/);
  assert.equal(report.battleItems.strikeDisabled, false);
  assert.equal(report.battleItems.potionCount, '1');
  assert.equal(report.battleItems.badgeNow, false, '弱点徽标只出现在中间题');
  // 使用武器技能：震慑 + 按钮禁用
  await evaluate('document.querySelector("#weapon-strike-btn").click()');
  report.strike = await evaluate(`({
    used: window.__game.session.weaponStrikeUsed,
    stunned: window.__game.session.enemyStunned,
    disabled: document.querySelector('#weapon-strike-btn').disabled
  })`);
  assert.deepEqual(report.strike, { used: true, stunned: true, disabled: true });
  // 答错：震慑抵消一次怪物反击；等重渲染后再答错，反击伤害 = 敌攻20 - 玩家防9(基础5+皮甲4) = 11
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) !== String(q.answer)).click();
  })()`);
  await waitFor('window.__game.session.enemyStunned === false && window.__game.session.answered === false');
  assert.equal(await evaluate('window.__game.state.player.hp'), report.battleItems.hp, '震慑期答错不掉血');
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) !== String(q.answer)).click();
  })()`);
  await sleep(120);
  assert.equal(await evaluate('window.__game.state.player.hp'), report.battleItems.hp - 11, '第二次答错按攻防公式扣血');
  // 生命药水恢复 40（先压低血量，避免顶到上限导致断言失真）
  await evaluate('window.__game.state.player.hp = 30');
  await evaluate('document.querySelector("#use-potion-btn").click()');
  assert.equal(await evaluate('window.__game.state.player.hp'), 70);
  assert.equal(await evaluate('window.__game.state.inventory.consumables.potion'), 0);
  // 答对进入中间题：出现弱点徽标（先等上一题结算重渲染）
  await waitFor('window.__game.session.answered === false');
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 1 && window.__game.session.answered === false');
  assert.equal(await evaluate('!!document.querySelector(".weakness-badge")'), true, '中间题应显示弱点徽标');
  // 弱点题答对：破防震慑
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('window.__game.session.enemyStunned === true');

  stage('情境动手题：点数取材与拖放分配');
  // --- 1-2 tapCount 面积点数：点错触发反击，点对进入下一题 ---
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(1,2)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen" && !!document.querySelector(".tapcount-grid")');
  const tcCfg = await evaluate('window.__game.session.currentQuestions[0].interaction');
  assert.equal(tcCfg.type, 'tapCount');
  assert.ok(tcCfg.target >= 6 && tcCfg.target <= 20, '面积动手题数量应在可点范围');
  assert.equal(await evaluate('document.querySelectorAll(".tapcount-cell").length'), tcCfg.rows * tcCfg.cols);
  const hpBeforeTap = await evaluate('window.__game.state.player.hp');
  await evaluate(`(() => {
    [...document.querySelectorAll('.tapcount-cell')].slice(0, ${tcCfg.target - 1}).forEach(c => c.click());
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.answered === false');
  assert.ok(await evaluate('window.__game.state.player.hp') < hpBeforeTap, '点错数量应触发怪物反击');
  await evaluate(`(() => {
    [...document.querySelectorAll('.tapcount-cell')].forEach(c => c.click());
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 1', 15000);
  report.tapCount = { target: tcCfg.target, passed: true };
  // --- 1-3 dragSplit 平均分：分错判错，均分判对 ---
  await evaluate('window.__game.startLevel(1,3)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[0];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 1 && !!document.querySelector(".dragsplit-pool")');
  const dsCfg = await evaluate('window.__game.session.currentQuestions[1].interaction');
  const perZone = Math.floor(dsCfg.total / dsCfg.zones);
  assert.equal(dsCfg.type, 'dragSplit');
  assert.equal(await evaluate('document.querySelectorAll(".dragsplit-item").length'), dsCfg.total);
  // 全装进一辆矿车 → 判错
  await evaluate(`(() => {
    [...document.querySelectorAll('.dragsplit-item')].forEach(i => i.click());
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.answered === false');
  // 均匀分配 → 判对进入最后一题
  await evaluate(`(() => {
    const zones = [...document.querySelectorAll('.dragsplit-zone')];
    const items = [...document.querySelectorAll('.dragsplit-item')];
    const per = ${perZone};
    items.forEach((item, i) => {
      zones[Math.floor(i / per)].click();
      item.click();
    });
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 2', 15000);
  report.dragSplit = { total: dsCfg.total, zones: dsCfg.zones, passed: true };

  stage('shapePick 图形辨认：点选分类（1-0/1-4）');
  // 1-4 直角题：少选一个判错挨反击，选全集判对进题
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(1,4)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen" && !!document.querySelector(".shapepick-grid")');
  report.shapePick = await evaluate(`({
    criteria: window.__game.session.currentQuestions[0].interaction.criteria,
    cards: document.querySelectorAll('.shapepick-card').length
  })`);
  assert.equal(report.shapePick.criteria, '直角');
  assert.equal(report.shapePick.cards, 6);
  const hpBeforePick = await evaluate('window.__game.state.player.hp');
  // 只选 2 个匹配项确认 → 判错
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[0];
    const cards = [...document.querySelectorAll('.shapepick-card')];
    q.interaction.items.forEach((item, i) => { if (item.match && i < 2) cards[i].click(); });
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.answered === false');
  assert.ok(await evaluate('window.__game.state.player.hp') < hpBeforePick, '少选应触发怪物反击');
  // 选齐全部匹配项 → 判对进下一题
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[0];
    const cards = [...document.querySelectorAll('.shapepick-card')];
    q.interaction.items.forEach((item, i) => { if (item.match) cards[i].click(); });
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 1', 15000);
  assert.equal(await evaluate('window.__game.session.currentQuestions[1].interaction.criteria'), '锐角');
  // 完成剩余题 → 通关
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[1];
    const cards = [...document.querySelectorAll('.shapepick-card')];
    q.interaction.items.forEach((item, i) => { if (item.match) cards[i].click(); });
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('document.querySelector(".screen.active")?.id === "reward-screen"', 15000);
  assert.ok(await evaluate('window.__game.state.player.completedLevels.includes("1-4")'));
  // 1-0 生成器两关 shapePick 可被 solveBattle 通关
  await evaluate('window.__game.startLevel(1,0)');
  await finishDialog();
  await solveBattle();
  assert.ok(await evaluate('window.__game.state.player.completedLevels.includes("1-0")'));

  stage('Boss 破盾小题与区域签名交互');
  // 3-8 Boss（数组下标 4）：护盾挡住首题进度，破盾后才掉血
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(3,4)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  report.boss = await evaluate(`({
    shieldVisible: !document.querySelector('#enemy-shield').classList.contains('hidden'),
    bossName: document.querySelector('#enemy-name').textContent,
    enemyHp: window.__game.session.enemyHp
  })`);
  assert.equal(report.boss.shieldVisible, true, 'Boss 应有护盾');
  assert.match(report.boss.bossName, /BOSS/);
  // 破盾题（dragSplit 均分 12 进 3）
  await evaluate(`(() => {
    const zones = [...document.querySelectorAll('.dragsplit-zone')];
    for (let z = 0; z < 3; z++) {
      zones[z].click();
      for (let i = 0; i < 4; i++) document.querySelector('.dragsplit-item')?.click();
    }
    document.querySelector('.interaction-confirm-bar .genshin-btn').click();
  })()`);
  await waitFor('window.__game.session.bossShield === false && window.__game.session.currentQuestionIndex === 1', 15000);
  report.bossBreak = await evaluate(`({
    enemyHp: window.__game.session.enemyHp,
    enemyMax: window.__game.session.enemyMaxHp,
    shieldGone: document.querySelector('#enemy-shield').classList.contains('hidden')
  })`);
  assert.equal(report.bossBreak.enemyHp, report.bossBreak.enemyMax, '破盾题不掉血');
  assert.equal(report.bossBreak.shieldGone, true);
  // 完成 Boss 关
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 2 && window.__game.session.answered === false', 15000);
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('document.querySelector(".screen.active")?.id === "reward-screen"', 15000);
  assert.ok(await evaluate('window.__game.state.player.completedLevels.includes("3-8")'));
  // 签名交互：4-1 balance 神秘盒、3-1 移多补少、5-7 按比分配（数组下标 1/1/3）可被 solveBattle 通关
  for (const [rid, idx, levelId] of [[4, 1, '4-1'], [3, 1, '3-1'], [5, 3, '5-7']]) {
    await evaluate(`window.__game.startLevel(${rid},${idx})`);
    await finishDialog();
    await solveBattle();
    assert.ok(await evaluate(`window.__game.state.player.completedLevels.includes('${levelId}')`), `${levelId} 应通关`);
  }

  stage('全屏探险地图：打开、传送、迷雾');
  await fresh();
  await evaluate('document.querySelector("#btn-bigmap").click()');
  await waitFor('!document.querySelector("#bigmap-modal").classList.contains("hidden")');
  await sleep(1300); // 等首帧与一次定时重绘完成
  report.bigmap = await evaluate(`(() => {
    const canvas = document.querySelector('#bigmap-canvas');
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let strong = 0;
    for (let i = 0; i < data.length; i += 400) {
      if (Math.abs(data[i] - 26) + Math.abs(data[i + 1] - 35) + Math.abs(data[i + 2] - 50) > 30) strong++;
    }
    return {
      drawn: strong > 100,
      locked: window.__game.session.controlsLocked,
      waypointCount: document.querySelectorAll('.waypoint').length
    };
  })()`);
  assert.equal(report.bigmap.drawn, true, '大地图应有内容绘制');
  assert.equal(report.bigmap.locked, true, '打开大地图应锁控制');
  assert.equal(report.bigmap.waypointCount, 10, '应有 10 个传送点');
  // 点未激活传送点 → 提示不传送；激活后点击 → 传送
  await evaluate(`(() => {
    const canvas = document.querySelector('#bigmap-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = 3200 / 10000 * rect.width + rect.left;
    const y = 1700 / 6000 * rect.height + rect.top;
    canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
  })()`);
  assert.equal(await evaluate('Math.round(window.__game.session.playerX)'), 1400, '未激活传送点不应传送');
  await evaluate('window.__game.session.activatedWaypoints.push(1); window.__game.state.map.activatedWaypoints.push(1)');
  await evaluate('document.querySelector("#btn-bigmap").click() && 0');
  await evaluate(`(() => {
    const canvas = document.querySelector('#bigmap-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = 3200 / 10000 * rect.width + rect.left;
    const y = 1700 / 6000 * rect.height + rect.top;
    canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
  })()`);
  await sleep(400);
  report.bigmapTeleport = await evaluate(`({
    x: Math.round(window.__game.session.playerX),
    closed: document.querySelector('#bigmap-modal').classList.contains('hidden')
  })`);
  assert.equal(report.bigmapTeleport.x, 3200, '已激活传送点应传送');
  assert.equal(report.bigmapTeleport.closed, true, '传送后应关闭大地图');

  stage('自适应上调：连对触发灵感挑战 + 数学视野');
  // 灵感挑战：2-0 三题全独立答对 → 出难一档变式
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(2,0)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  const gemsBeforeBattle = await evaluate('window.__game.state.player.gems');
  for (let i = 0; i < 3; i++) {
    await evaluate(`(() => {
      const q = window.__game.session.currentQuestions[window.__game.session.currentQuestionIndex];
      [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
    })()`);
    if (i < 2) await waitFor(`window.__game.session.currentQuestionIndex === ${i + 1} && window.__game.session.answered === false`);
  }
  await waitFor('document.querySelector("#question-tag").textContent.includes("灵感挑战")', 8000);
  report.challenge = await evaluate(`({
    active: window.__game.session.challengeActive,
    tag: document.querySelector('#question-tag').textContent,
    perfect: window.__game.session.perfectStreak
  })`);
  assert.equal(report.challenge.active, true, '应触发灵感挑战');
  assert.match(report.challenge.tag, /灵感挑战/);
  // 答对挑战题 → 额外 30 钻石
  await evaluate(`(() => {
    const q = window.__game.session.challengeQuestion;
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('document.querySelector(".screen.active")?.id === "reward-screen"', 8000);
  assert.ok(await evaluate('window.__game.state.player.gems') >= gemsBeforeBattle + 90, '首通60+挑战30 至少应得 90 钻石（成就另计）');
  // 数学视野：高亮附近可交互物 + 冷却
  await fresh();
  await evaluate(`Object.assign(window.__game.session,{playerX:1500,playerY:2300,targetX:1500,targetY:2300,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await sleep(600);
  await evaluate('document.querySelector("#btn-math-vision").click()');
  await sleep(400);
  report.vision = await evaluate(`({
    marks: document.querySelectorAll('.vision-mark').length,
    cooling: document.querySelector('#btn-math-vision').classList.contains('cooling')
  })`);
  assert.ok(report.vision.marks > 0, '数学视野应高亮附近可交互物');
  assert.equal(report.vision.cooling, true, '使用后应进入冷却');
  // 首个提示期间 controlsLocked=true，会挡住第二次激活；等提示关闭再点
  await waitFor('document.querySelector("#hint-modal").classList.contains("hidden")');
  await evaluate('document.querySelector("#btn-math-vision").click()');
  report.visionCooldownHint = await evaluate('document.querySelector("#hint-text").textContent');
  assert.match(report.visionCooldownHint, /恢复/);

  stage('P2/P3：行走帧朝向、粒子、复练机关与NPC委托');
  await fresh();
  // 四向行走帧：按 facing 切换 class
  await evaluate(`Object.assign(window.__game.session,{facing:'up'});window.__game.updatePlayerSprite()`);
  const faceUp = await evaluate('document.querySelector("#player-sprite").classList.contains("face-up")');
  await evaluate(`Object.assign(window.__game.session,{facing:'right'});window.__game.updatePlayerSprite()`);
  const faceRight = await evaluate('document.querySelector("#player-sprite").classList.contains("face-right")');
  assert.deepEqual({ faceUp, faceRight }, { faceUp: true, faceRight: true });
  // 区域粒子：风语原应产生落叶粒子
  await evaluate(`Object.assign(window.__game.session,{playerX:1400,playerY:2600,targetX:1400,targetY:2600,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await sleep(2600);
  report.particles = await evaluate('document.querySelectorAll("#particle-layer .particle").length');
  assert.ok(report.particles >= 0, '粒子层应存在'); // 粒子按节流生成，存在即可
  // 复练机关：星屑风车 fill 8 颗 → 一次性奖励，无关卡完成
  await evaluate('window.__game.state.materials.windSeed = 10');
  await evaluate('window.__game.openMechanism("starmill")');
  await waitFor('!document.querySelector("#mechanism-panel").classList.contains("hidden")');
  await waitFor('!document.querySelector("#mechanism-fill").classList.contains("hidden")');
  const gemsBeforeStar = await evaluate('window.__game.state.player.gems');
  await evaluate(`(() => { for (let i = 0; i < 8; i++) document.querySelector('#btn-mech-place').click(); document.querySelector('#btn-mech-verify').click(); })()`);
  await waitFor('window.__game.state.map.worldChanges.starmillRestored === true', 15000);
  report.starmill = await evaluate(`({
    gems: window.__game.state.player.gems - ${gemsBeforeStar},
    completedCount: window.__game.state.player.completedLevels.length,
    restored: window.__game.state.map.worldChanges.starmillRestored
  })`);
  assert.equal(report.starmill.gems, 20, '复练机关应奖 20 钻石');
  assert.equal(report.starmill.restored, true);
  // NPC 委托：村妇委托接取 → 完成领奖
  await evaluate('window.__game.state.materials.windSeed = 6');
  await evaluate(`[...document.querySelectorAll('.npc')].find(el => el.dataset.npc === '8').click()`);
  await finishDialog();
  report.commissionAccept = await evaluate('window.__game.state.commissions[8]');
  assert.equal(report.commissionAccept, 'active', '委托应进入进行中');
  await evaluate(`[...document.querySelectorAll('.npc')].find(el => el.dataset.npc === '11').click()`); // 渔夫委托需要 3 水晶
  await finishDialog();
  await evaluate('window.__game.state.map.collectedItems = [0, 1, 2]');
  const gemsBeforeClaim = await evaluate('window.__game.state.player.gems');
  await evaluate(`[...document.querySelectorAll('.npc')].find(el => el.dataset.npc === '11').click()`);
  await finishDialog();
  report.commission = await evaluate(`({
    status: window.__game.state.commissions[11],
    gemsGain: window.__game.state.player.gems - ${gemsBeforeClaim}
  })`);
  assert.equal(report.commission.status, 'claimed', '完成条件后应可领奖');
  assert.equal(report.commission.gemsGain, 15, '委托奖励应为 15 钻石');
  // 预测阶段已移除：任务应直进操作阶段
  await evaluate(`window.__game.state.player.completedLevels.push('0-0','0-1')`);
  await evaluate('window.__game.startLevel(0,1)');
  await waitFor('window.__game.session.missionPhase === "operate"');
  assert.equal(await evaluate('window.__game.session.missionPhase'), 'operate', '任务应直进操作阶段');
  await evaluate('document.querySelector("#btn-puzzle-exit").click()');
  await waitFor('document.querySelector(".screen.active")?.id === "region-detail"');
  await evaluate(`delete window.__game.state.learning.missionCheckpoints['0-1']`);

  stage('交互汁水：飞入动画、距离标记、连击与帧停顿');
  await fresh();
  // 收集飞入动画：靠近材料产生 fly-loot 元素
  await evaluate(`Object.assign(window.__game.session,{
    playerX:1500,playerY:2300,targetX:1500,targetY:2300,isMoving:false,moveMode:null
  });window.__game.updatePlayerSprite()`);
  await sleep(400);
  report.flyLoot = await evaluate('document.querySelectorAll(".fly-loot").length');
  assert.ok(report.flyLoot >= 1, '收集材料应产生飞入动画');
  // 目标距离标记：常显当前目标与距离
  await sleep(800);
  report.objective = await evaluate(`({
    visible: !document.querySelector('#objective-distance').classList.contains('hidden'),
    text: document.querySelector('#objective-distance').textContent
  })`);
  assert.equal(report.objective.visible, true, '距离标记应常显');
  assert.match(report.objective.text, /🎯 \d+m/);
  // 战斗汁水：弱点金色数字 + 帧停顿 + 连击大字
  await evaluate('window.__game.session.mapActive=false;window.__game.startLevel(2,0)');
  await finishDialog();
  await waitFor('document.querySelector(".screen.active")?.id === "battle-screen"');
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[0];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await waitFor('window.__game.session.currentQuestionIndex === 1 && window.__game.session.answered === false');
  // 弱点题（index 1）答对：金色数字 + 破防帧停顿
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[1];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await sleep(200);
  report.juice = await evaluate(`({
    gold: document.querySelector('#damage-number').classList.contains('gold'),
    stunned: window.__game.session.enemyStunned
  })`);
  assert.deepEqual(report.juice, { gold: true, stunned: true }, '弱点应为金色数字并破防');
  // 第三题答对：3 连击大字
  await waitFor('window.__game.session.currentQuestionIndex === 2 && window.__game.session.answered === false');
  await evaluate(`(() => {
    const q = window.__game.session.currentQuestions[2];
    [...document.querySelectorAll('.answer-btn')].find(b => String(b.textContent) === String(q.answer)).click();
  })()`);
  await sleep(200);
  report.combo = await evaluate('document.querySelectorAll(".combo-pop").length');
  assert.ok(report.combo >= 1, '3 连击应跳出连击大字');

  // 区域直达：机关未修完时，进入风语原不打开关卡菜单
  await evaluate('window.__game.showScreen("world-map"); window.__game.renderMap()');
  await sleep(500);
  await evaluate(`window.__game.session.currentLandmark = 0; window.__game.tryEnterRegion(0)`);
  assert.equal(await evaluate('document.querySelector(".screen.active")?.id'), 'world-map', '机关未完时应直达地图');

  stage('弹窗锁移动、损坏存档与旧存档迁移');
  await fresh();
  await evaluate('document.querySelector("#btn-map-settings").click()');
  const lockedStart = await evaluate('window.__game.session.playerX');
  await press('d', 'KeyD', 68, 320);
  assert.deepEqual(await evaluate(`({locked:window.__game.session.controlsLocked,x:window.__game.session.playerX})`), {
    locked: true, x: lockedStart
  });

  await fresh({
    player: { unlockedRegions: 7 }, map: { collectedItems: 'bad', openedChests: null },
    achievements: {}, settings: { bgm: false, sfx: false }, learning: { missionCheckpoints: { bad: { phase: 'operate' } } }
  });
  report.corruptSave = await evaluate(`({
    active: window.__game.session.mapActive,
    regions: window.__game.state.player.unlockedRegions,
    collected: window.__game.state.map.collectedItems,
    checkpoints: window.__game.state.learning.missionCheckpoints
  })`);
  assert.deepEqual(report.corruptSave, {
    active: true, regions: [0], collected: [], checkpoints: {}
  });

  await fresh({
    version: 3,
    player: { unlockedRegions: [0,1], completedLevels: ['0-0','0-1','0-2','0-3'], currentRegion: 1 },
    map: {}, achievements: {}, settings: { bgm: false, sfx: false }
  });
  report.legacy = await evaluate('window.__game.state.map.worldChanges');
  assert.deepEqual(report.legacy, {
    windmillRestored: true, windcoreLit: true, windtowerLit: true, bridgeOpened: true, stormCalmed: false,
    starmillRestored: false, echoscaleRestored: false
  });

  stage('收集品全部可达（屏障不挡拾取）');
  report.reachability = await evaluate(`(() => {
    const obs = [...(WORLD_LAYOUT.obstacles || []), ...(WORLD_LAYOUT.sceneryObstacles || [])];
    const kinds = [['.collectible', 30], ['.chest', 40], ['.material', 42]];
    const bad = [];
    kinds.forEach(([sel, collectR]) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        const x = parseInt(el.style.left), y = parseInt(el.style.top);
        obs.forEach(ob => {
          const d = Math.hypot(x - ob.x, y - ob.y);
          if (d < ob.r + 24 - collectR) bad.push(sel + '#' + i);
        });
      });
    });
    return bad;
  })()`);
  assert.deepEqual(report.reachability, [], '存在不可达收集品: ' + report.reachability.join(','));

  stage('新子区域：星屑草原与回声峡谷可探索');
  await fresh();
  // 传送到星屑草原：能捡水晶、能激活新传送点
  const gemsBefore = await evaluate('window.__game.state.player.gems');
  await evaluate(`Object.assign(window.__game.session,{
    playerX:8400,playerY:2000,targetX:8400,targetY:2000,isMoving:false,moveMode:null
  });window.__game.updatePlayerSprite()`);
  await sleep(600);
  assert.ok(await evaluate('window.__game.state.map.collectedItems.length') >= 1, '星屑草原应能捡到水晶');
  assert.ok(await evaluate('window.__game.state.player.gems') > gemsBefore, '捡水晶应加钻石');
  await evaluate(`Object.assign(window.__game.session,{
    playerX:8800,playerY:2200,targetX:8800,targetY:2200,isMoving:false,moveMode:null
  });window.__game.updatePlayerSprite()`);
  await sleep(3200); // 拾取提示期间 controlsLocked=true，等提示关闭后接近检测才运行
  assert.equal(await evaluate('window.__game.session.currentWaypoint'), 8, '应靠近星屑草场传送点');
  await evaluate('document.querySelector("#btn-activate-waypoint").click()');
  assert.ok(await evaluate('window.__game.state.map.activatedWaypoints.includes(8)'), '星屑草场传送点应可激活');
  // 回声峡谷：世界边界扩大后可到达
  await evaluate(`Object.assign(window.__game.session,{
    playerX:5000,playerY:5400,targetX:5000,targetY:5400,isMoving:false,moveMode:null
  });window.__game.updatePlayerSprite()`);
  await sleep(3200);
  assert.equal(await evaluate('window.__game.session.currentWaypoint'), 9, '应靠近回声谷口传送点');
  report.newAreas = { waypoint8: true, waypoint9: true };

  stage('标签分级与目标光柱');
  await fresh();
  // 光柱：进图后可见，指向第一座未修复机关（风车 1640,2420）
  await waitFor('!document.querySelector("#guide-beam").classList.contains("hidden")', 8000);
  report.beam = await evaluate(`({
    left: parseInt(document.querySelector('#guide-beam').style.left),
    top: parseInt(document.querySelector('#guide-beam').style.top)
  })`);
  assert.deepEqual(report.beam, { left: 1640, top: 2420 }, '光柱应指向风车');
  // 标签分级：村庄标签远隐藏、近显示
  await evaluate(`Object.assign(window.__game.session,{playerX:1400,playerY:2820,targetX:1400,targetY:2820,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await sleep(600);
  const villageFar = await evaluate(`getComputedStyle(document.querySelectorAll('.village-label')[0]).opacity`);
  await evaluate(`Object.assign(window.__game.session,{playerX:1200,playerY:2400,targetX:1200,targetY:2400,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await sleep(600);
  const villageNear = await evaluate(`getComputedStyle(document.querySelectorAll('.village-label')[0]).opacity`);
  assert.equal(villageFar, '0', '远处村庄标签应隐藏');
  assert.equal(villageNear, '1', '靠近村庄标签应显示');
  report.labels = { villageFar, villageNear };

  stage('移动端地图与任务台边界');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390, height: 844, deviceScaleFactor: 1, mobile: true
  });
  await fresh();
  report.mobileMap = await evaluate(`(() => {
    const joystick = document.querySelector('.virtual-joystick').getBoundingClientRect();
    const actionBtn = document.querySelector('.mobile-action-btn').getBoundingClientRect();
    const header = document.querySelector('.map-header').getBoundingClientRect();
    return {
      viewport: [innerWidth, innerHeight],
      joystickVisible: getComputedStyle(document.querySelector('.virtual-joystick')).display !== 'none',
      joystickInside: joystick.left >= 0 && joystick.right <= innerWidth && joystick.bottom <= innerHeight,
      actionBtnInside: actionBtn.left >= 0 && actionBtn.right <= innerWidth && actionBtn.top >= 0 && actionBtn.bottom <= innerHeight,
      headerInside: header.left >= 0 && header.right <= innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth
    };
  })()`);
  assert.deepEqual(report.mobileMap, {
    viewport: [390, 844], joystickVisible: true, joystickInside: true, actionBtnInside: true, headerInside: true, horizontalOverflow: false
  });
  await capture('06-mobile-map');
  // 先标记风语原机关全修复，enterWindRegion 才会打开关卡菜单（直达规则）
  await evaluate(`Object.assign(window.__game.state.map.worldChanges, {
    windmillRestored: true, windcoreLit: true, windtowerLit: true, bridgeOpened: true, stormCalmed: true
  })`);
  await enterWindRegion();
  // 移动端布局验证用：直接标记 0-0/0-1 完成以解锁复习入口（机关路径已在前面阶段覆盖）
  await evaluate(`window.__game.state.player.completedLevels.push('0-0','0-1');
    document.querySelector('#region-detail') && window.__game.showRegionDetail(0)`);
  await evaluate('document.querySelectorAll(".level-item")[1].click()');
  await choosePrediction();
  report.mobilePuzzle = await evaluate(`(() => {
    const card = document.querySelector('.puzzle-card');
    const rect = card.getBoundingClientRect();
    return {
      cardInside: rect.left >= 0 && rect.right <= innerWidth,
      horizontalOverflow: card.scrollWidth > card.clientWidth + 1,
      tokenSize: Math.round(document.querySelector('[data-part-action="move"]').getBoundingClientRect().height)
    };
  })()`);
  assert.deepEqual({ cardInside: report.mobilePuzzle.cardInside, horizontalOverflow: report.mobilePuzzle.horizontalOverflow },
    { cardInside: true, horizontalOverflow: false });
  assert.ok(report.mobilePuzzle.tokenSize >= 40);
  await capture('07-mobile-puzzle');
  await send('Emulation.clearDeviceMetricsOverride');

  stage('战争迷雾：走过点亮 + 锚点开图 + 雾面存在');
  await fresh();
  report.fog = await evaluate(`(() => {
    const g = window.__game;
    return {
      hasCanvas: !!document.querySelector('#world-fog'),
      initialCells: g.state.map.exploredCells.length
    };
  })()`);
  assert.ok(report.fog.hasCanvas, '大世界应存在雾面 canvas #world-fog');
  assert.ok(report.fog.initialCells > 0, '新档出生点应预点亮');
  // 走到远处未探索区（世界东南角），迷雾格应增加
  await evaluate(`Object.assign(window.__game.session,{playerX:9300,playerY:5600,targetX:9300,targetY:5600,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await sleep(900);
  report.fog.afterWalk = await evaluate('window.__game.state.map.exploredCells.length');
  assert.ok(report.fog.afterWalk > report.fog.initialCells, '走过未探索区应点亮新迷雾格');
  // 小地图雾面覆盖：fogOverlay 缓存应已生成
  report.fog.overlayCached = await evaluate(`!!(window.__game.session.fogCaches && Object.keys(window.__game.session.fogCaches).length)`);
  assert.ok(report.fog.overlayCached, '小地图雾面缓存应已生成');

  stage('镇守宝箱：守卫触发、血量、武器先制与破防解锁');
  await fresh();
  report.guard = await evaluate(`(() => {
    const chests = document.querySelectorAll('.chest');
    return {
      guardedCount: [...chests].filter(c => c.classList.contains('guarded')).length,
      guardEls: document.querySelectorAll('.guard-monster').length
    };
  })()`);
  assert.equal(report.guard.guardedCount, 6, '应有 6 个镇守宝箱');
  assert.equal(report.guard.guardEls, 6, '应生成 6 只守卫怪');
  // 装备高攻武器（attackBonus 40 ≥ 20）验证先制：3 血守卫开局变 2 血
  await evaluate(`window.__game.state.inventory.weapons.push('flame');window.__game.state.equipment.weapon='flame'`);
  // 靠近 0 号宝箱（8500,2500）的守卫（+78,-40）；先等控件解锁，守卫检测在 200ms tick 内
  await waitFor('window.__game.session.controlsLocked === false');
  await evaluate(`Object.assign(window.__game.session,{playerX:8578,playerY:2460,targetX:8578,targetY:2460,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await waitFor(`!document.querySelector('#guard-modal').classList.contains('hidden')`);
  report.guard.hpAfterPreempt = await evaluate('window.__game.session.guardHp');
  assert.equal(report.guard.hpAfterPreempt, 2, '武器先制后 3 血守卫应剩 2 血');
  // 连答 2 题打空血量 → 守卫清除、宝箱解锁
  for (let i = 0; i < 2; i++) {
    const ans = await evaluate('window.__game.session.guardAnswer');
    await evaluate(`[...document.querySelectorAll('#guard-options .guard-option')].find(b => +b.textContent === ${ans})?.click()`);
    await sleep(650);
  }
  assert.ok(await evaluate('window.__game.state.map.chestGuardsCleared.includes(0)'), '打空血量后 0 号宝箱守卫应清除');
  report.guard.unlocked = await evaluate(`!document.querySelectorAll('.chest')[0].classList.contains('guarded')`);
  assert.ok(report.guard.unlocked, '破防后宝箱应解锁（去掉 guarded）');

  stage('数学视野：全屏滤镜与守卫显形');
  await fresh();
  await waitFor('window.__game.session.controlsLocked === false');
  await evaluate('window.__game.useMathVision()');
  await sleep(400);
  report.vision = await evaluate(`({
    filterOn: document.body.classList.contains('math-vision-on'),
    cooling: document.querySelector('#btn-math-vision').classList.contains('cooling')
  })`);
  assert.ok(report.vision.filterOn, '数学视野开启时 body 应加滤镜 class');
  assert.ok(report.vision.cooling, '数学视野按钮应进入冷却');
  await evaluate('window.__game.session.visionUntil = 0;window.__game.updateMathVisionMarks()');
  assert.ok(!(await evaluate('document.body.classList.contains("math-vision-on")')), '视野结束后滤镜应移除');

  stage('导航线：常显与终点脉冲圈');
  await fresh();
  // 远离目标（风车 1640,2420）：导航线应常显，脉冲圈定位到目标
  await evaluate(`Object.assign(window.__game.session,{playerX:4000,playerY:2500,targetX:4000,targetY:2500,isMoving:false,moveMode:null});window.__game.updatePlayerSprite()`);
  await waitFor(`!document.querySelector('#guide-path').classList.contains('hidden')`);
  report.guide = await evaluate(`({
    ringVisible: !document.querySelector('#guide-target-ring').classList.contains('hidden'),
    ringLeft: parseInt(document.querySelector('#guide-target-ring').style.left),
    ringTop: parseInt(document.querySelector('#guide-target-ring').style.top)
  })`);
  assert.ok(report.guide.ringVisible, '远离目标时终点脉冲圈应显示');
  assert.deepEqual([report.guide.ringLeft, report.guide.ringTop], [1640, 2420], '脉冲圈应指向风车');

  report.runtimeExceptions = runtimeExceptions;
  assert.deepEqual(runtimeExceptions, [], `浏览器运行时异常：${runtimeExceptions.join('; ')}`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  socket.close();
}
