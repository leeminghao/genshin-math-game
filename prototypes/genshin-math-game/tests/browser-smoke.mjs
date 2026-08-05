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
  await waitFor('window.__game.session.missionPhase === "prediction"');
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
  await waitFor('window.__game.session.missionPhase === "verify"');
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
  await evaluate('document.querySelector("#btn-puzzle-continue").click()');
  await waitFor('window.__game.session.missionPhase === "transfer"');
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
          const zones = [...document.querySelectorAll('.dragsplit-zone')];
          const items = [...document.querySelectorAll('.dragsplit-item')];
          const per = Math.floor(q.interaction.total / q.interaction.zones);
          items.forEach((item, i) => { zones[Math.floor(i / per)].click(); item.click(); });
        } else if (q.interaction.type === 'shapePick') {
          const cards = [...document.querySelectorAll('.shapepick-card')];
          q.interaction.items.forEach((item, i) => { if (item.match) cards[i].click(); });
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
    travelerArt: getComputedStyle(document.querySelector('.player-head')).backgroundImage.includes('xiaoyuan-storybook-v2.webp'),
    mapInert: document.querySelector('#world-map').inert,
    minimapSize: [document.querySelector('#minimap').width, document.querySelector('#minimap').height],
    dpadButtons: document.querySelectorAll('[data-map-move]').length,
    dpadTarget: Math.round(document.querySelector('[data-map-move="arrowup"]').getBoundingClientRect().width)
  })`);
  assert.deepEqual({ groundCanvas: report.ui.groundCanvas, noTileBg: report.ui.noTileBg, travelerArt: report.ui.travelerArt, mapInert: report.ui.mapInert, minimapSize: report.ui.minimapSize },
    { groundCanvas: true, noTileBg: true, travelerArt: true, mapInert: false, minimapSize: [280, 175] });
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
  await evaluate(`(() => {
    document.querySelector('#estimate-plus').click();
    document.querySelector('#estimate-plus').click();
    document.querySelector('#estimate-plus').click();
    document.querySelector('#btn-estimate-commit').click();
  })()`);
  await waitFor('!document.querySelector("#mechanism-fill").classList.contains("hidden")');
  assert.equal(await evaluate('window.__game.session.mechanism.estimate'), 7);
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
    await evaluate('document.querySelector("#btn-estimate-commit").click()');
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
  await evaluate('document.querySelector("#btn-estimate-commit").click()');
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
    windmillRestored: true, windcoreLit: true, windtowerLit: true, bridgeOpened: true, stormCalmed: true
  });
  assert.ok(report.windSlice.errorTypes.includes('language'));
  assert.ok(report.windSlice.errorTypes.includes('representation'));
  for (const kind of ['prediction', 'model', 'explanation', 'verification', 'transfer']) {
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
    windmillRestored: true, windcoreLit: true, windtowerLit: true, bridgeOpened: true, stormCalmed: false
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

  report.runtimeExceptions = runtimeExceptions;
  assert.deepEqual(runtimeExceptions, [], `浏览器运行时异常：${runtimeExceptions.join('; ')}`);
  console.log(JSON.stringify(report, null, 2));
} finally {
  socket.close();
}
