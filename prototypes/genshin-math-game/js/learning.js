// 儿童数学学习系统：纯数据与纯逻辑，可在浏览器和 Node 测试中复用。
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.LearningSystems = api;
})(typeof window !== 'undefined' ? window : globalThis, function() {
  'use strict';

  const DIAGNOSTIC_QUESTIONS = [
    {
      id: 'diag-add', skill: 'anemo',
      text: '风场里原有 7 颗风种，又飞来 5 颗。现在一共有多少颗？',
      options: [10, 11, 12, 13], answer: 12
    },
    {
      id: 'diag-perimeter', skill: 'geo',
      text: '长方形长 6 米、宽 4 米，它的周长是多少米？',
      options: [10, 20, 24, 48], answer: 20
    },
    {
      id: 'diag-percent', skill: 'pyro',
      text: '80 的 25% 是多少？',
      options: [15, 20, 25, 40], answer: 20
    }
  ];

  // 风语原纵向切片：每个任务都包含预测、操作、表达、检验和迁移。
  const WIND_MISSIONS = {
    '0-0': {
      id: 'wind-one-to-one',
      type: 'match',
      title: '唤醒风车 · 一一配对',
      story: '沉睡的风车有 6 个风槽。先猜会不会正好放满，再亲手让每颗风种找到唯一的位置。',
      prediction: {
        text: '6 颗风种放进 6 个风槽，最后会怎样？',
        options: ['正好放满', '会多出风种', '会空出风槽'],
        answer: '正好放满'
      },
      primary: {
        type: 'match', prompt: '拖动或点击风种，把它们逐个送入空风槽。点击已填风槽可以取回。',
        itemEmoji: '🍃', slotEmoji: '🌀', itemLabel: '风种', slotLabel: '风槽', count: 6, slots: 6
      },
      expression: {
        prompt: '哪句话最准确地描述刚才的操作？',
        options: ['6 颗风种和 6 个风槽一一对应', '6 颗风种只需要 5 个风槽', '每个风槽要放 2 颗风种'],
        answer: '6 颗风种和 6 个风槽一一对应'
      },
      formal: '6 颗风种 ↔ 6 个风槽。两边各有 6 个，每颗只配一个位置，所以没有重复、没有遗漏，也没有剩余。',
      transfer: {
        type: 'match', story: '迁移任务：夜风吹散了 4 只风鸟。让它们分别回到 4 个鸟巢。',
        prompt: '画面换了，但关系相同：一只风鸟只能回一个鸟巢。',
        itemEmoji: '🐦', slotEmoji: '🪺', itemLabel: '风鸟', slotLabel: '鸟巢', count: 4, slots: 4
      },
      hints: {
        operate: ['先数一数两边各有几个。', '每次只拿一颗风种，放入一个还空着的风槽。', '用想象中的线连接每一对，检查有没有对象被连了两次。'],
        express: ['找出同时说明“数量相同”和“每个只配一个”的句子。', '回看操作：有没有风种或风槽被重复使用？', '一一对应要求两边对象逐个成对，不能重复也不能遗漏。'],
        transfer: ['不要被风鸟和鸟巢的新画面干扰，先看两边数量。', '仍然一次完成一对。', '4 ↔ 4 与刚才的 6 ↔ 6 使用同一种关系。']
      },
      worldChange: 'windmillRestored'
    },
    '0-1': {
      id: 'wind-part-whole',
      type: 'partWhole',
      title: '汇合风流 · 部分与整体',
      story: '两股风流要汇成一个稳定风核。先预测整体，再把新增的一部分亲手合进去。',
      prediction: {
        text: '风核原有 4 点风力，又汇入 3 点。整体会是多少？',
        options: [1, 7, 12], answer: 7
      },
      primary: {
        type: 'partWhole', prompt: '把右侧 3 点新风力逐个汇入原有的 4 点风核。',
        operation: 'combine', startCount: 4, changeCount: 3, target: 7,
        itemEmoji: '✦', startLabel: '原有风力', changeLabel: '新风力', resultLabel: '现在的整体'
      },
      expression: {
        prompt: '哪个算式描述了“4 点原有风力和 3 点新风力合起来”？',
        options: ['4 + 3 = 7', '7 - 3 = 10', '4 × 3 = 12'], answer: '4 + 3 = 7'
      },
      formal: '原有的 4 和新来的 3 是两个部分，合起来得到整体 7，所以用加法表示：4 + 3 = 7。',
      transfer: {
        type: 'partWhole', story: '迁移任务：护盾原有 9 点能量，修复道路用掉 4 点。请移走用掉的部分。',
        prompt: '这次不是合入，而是从整体中去掉一部分。',
        operation: 'remove', startCount: 9, changeCount: 4, target: 5,
        itemEmoji: '◆', startLabel: '原有能量', changeLabel: '需要用掉', resultLabel: '剩余能量'
      },
      hints: {
        operate: ['先分清“原有”和“新来”是哪两部分。', '点击新风力，让它一次汇入一点。', '合并时整体会变大，目标是保留原有 4 点并加入 3 点。'],
        express: ['刚才的动作是合起来，不是拿走或重复分组。', '把两个部分的数量按操作顺序写出来。', '部分合成整体用加法：4 + 3 = 7。'],
        transfer: ['先说清原有、用掉和剩余分别是什么。', '点击能量，从原有整体中逐个移走。', '从 9 中去掉 4，剩余用 9 - 4 表示。']
      }
    },
    '0-2': {
      id: 'wind-array',
      type: 'array',
      title: '架设风阵 · 几组与每组',
      story: '风塔需要整齐的阵列才能稳定。先预测总数，再分别调整排数和每排数量。',
      prediction: {
        text: '3 排风灯，每排 4 盏，一共有多少盏？',
        options: [7, 12, 16], answer: 12
      },
      primary: {
        type: 'array', prompt: '调整成 3 排、每排 4 盏。每次只改变一个量，观察总数怎样变化。',
        targetRows: 3, targetCols: 4, maxRows: 5, maxCols: 6, itemEmoji: '🏮', rowLabel: '排', colLabel: '每排'
      },
      expression: {
        prompt: '哪个表达同时说明了“3 排”和“每排 4 盏”？',
        options: ['3 × 4 = 12', '3 + 4 = 7', '12 ÷ 3 = 12'], answer: '3 × 4 = 12'
      },
      formal: '3 排、每排 4 盏，就是 3 个 4：4 + 4 + 4 = 12，也可以写成 3 × 4 = 12。',
      transfer: {
        type: 'array', story: '迁移任务：搭建 2 层观测台，每层安装 5 个风铃。',
        prompt: '把阵列调整成 2 层、每层 5 个风铃。',
        targetRows: 2, targetCols: 5, maxRows: 5, maxCols: 6, itemEmoji: '🔔', rowLabel: '层', colLabel: '每层'
      },
      hints: {
        operate: ['先只调排数，再只调每排数量。', '左边控制有几排，右边控制每排几个。', '到达 3 排、每排 4 个后，再按“检验阵列”。'],
        express: ['找出同时保留两个量的表达。', '“3 排，每排 4 个”表示 3 个 4 相加。', '3 个 4 可以写作 3 × 4，结果是 12。'],
        transfer: ['画面变成观测台，但仍要找“几层”和“每层几个”。', '先调到 2 层，再把每层调成 5 个。', '2 个 5 形成 2 × 5 的阵列。']
      }
    },
    '0-3': {
      id: 'wind-equal-share',
      type: 'split',
      title: '疏通风道 · 平均分',
      story: '三条救援风道需要同样多的风种。先预测每份数量，再亲手分配。',
      prediction: {
        text: '12 颗平均分进 3 条风道，每条应该有几颗？',
        options: [3, 4, 6], answer: 4
      },
      primary: {
        type: 'split', prompt: '把 12 颗风种分完，并让三条风道同样多。',
        itemEmoji: '✨', total: 12, groups: 3, groupLabels: ['北风道', '东风道', '西风道']
      },
      expression: {
        prompt: '哪个算式描述了“12 颗平均分成 3 份，每份 4 颗”？',
        options: ['12 ÷ 3 = 4', '12 - 3 = 9', '12 + 3 = 15'], answer: '12 ÷ 3 = 4'
      },
      formal: '平均分有两个条件：全部分完，而且每份同样多。12 颗分成 3 份，每份 4 颗：12 ÷ 3 = 4。',
      transfer: {
        type: 'split', story: '迁移任务：把 15 份补给平均送给 5 支巡逻队。',
        prompt: '仍然要同时满足“分完”和“每队一样多”。',
        itemEmoji: '🎒', total: 15, groups: 5, groupLabels: ['一队', '二队', '三队', '四队', '五队']
      },
      hints: {
        operate: ['先看有没有全部分完，再比较三条风道。', '可以逐轮给每条风道各放一颗。', '平均分必须同时满足总量守恒和每份相等。'],
        express: ['算式要同时出现总数、份数和每份数。', '“平均分成 3 份”对应除以 3。', '12 ÷ 3 = 4 描述每份得到 4。'],
        transfer: ['先不要计算，试着逐轮给每队一个。', '每轮依次给五队各一份，直到补给分完。', '15 份分给 5 队，每队数量必须相同。']
      },
      worldChange: 'bridgeOpened'
    },
    '0-4': {
      id: 'wind-balance-finale',
      type: 'balance',
      title: '风暴核心 · 等量平衡',
      story: '最终风暴的两侧压力不同。先判断该补哪一边，再通过操作恢复平衡。',
      prediction: {
        text: '左侧 3 点、右侧 6 点。要让两边相等，应该怎样做？',
        options: ['左侧补 3 点', '右侧补 3 点', '两侧各补 3 点'], answer: '左侧补 3 点'
      },
      primary: {
        type: 'balance', prompt: '从备用风力中取出能量，补到需要的一侧。也可以点已补入的能量撤回。',
        leftStart: 3, rightStart: 6, pool: 3, target: 6, itemEmoji: '◈', leftLabel: '左侧风压', rightLabel: '右侧风压'
      },
      expression: {
        prompt: '哪句话解释了为什么风暴现在平衡？',
        options: ['左侧 3 + 3 = 6，与右侧相等', '右侧 6 + 3 = 9，所以更强', '只要备用风力用完就一定平衡'],
        answer: '左侧 3 + 3 = 6，与右侧相等'
      },
      formal: '平衡不等于“把东西用完”，而是两侧数量相等。左侧从 3 补到 6，与右侧的 6 相同。',
      transfer: {
        type: 'balance', story: '迁移任务：风向反转，现在左侧 8 点、右侧 5 点。',
        prompt: '这一次需要补另一侧。让两边都达到 8 点。',
        leftStart: 8, rightStart: 5, pool: 3, target: 8, itemEmoji: '◇', leftLabel: '左侧风压', rightLabel: '右侧风压'
      },
      hints: {
        operate: ['先比较左右哪一侧更少。', '只把备用风力补给较少的一侧。', '两边都显示 6 时才满足相等关系。'],
        express: ['解释必须说明两侧最后为什么相等。', '左侧原来 3，需要再增加 3 才到 6。', '3 + 3 = 6，左侧结果与右侧 6 相等。'],
        transfer: ['风向已经反转，重新比较两侧，不要照搬上一次的位置。', '这次右侧更少，把备用风力补到右侧。', '右侧 5 再补 3 才能和左侧 8 相等。']
      },
      worldChange: 'stormCalmed'
    }
  };

  // 兼容 v3 的名称和调试入口。
  const WIND_PUZZLES = WIND_MISSIONS;

  const SKILL_HINTS = {
    anemo: [
      '先把对象一个对一个地配起来，观察有没有多余或缺少。',
      '画出两排对应位置，再判断要合起来、拿走还是平均分。'
    ],
    geo: [
      '先用手指沿边界走一圈，区分“边界长度”和“铺满多少格”。',
      '周长看四周，面积看内部；把图形拆成你熟悉的部分。'
    ],
    electro: [
      '先统一单位，再让每一份使用同一种尺度。',
      '圈出单位关系，写出从大单位到小单位需要乘多少。'
    ],
    dendro: [
      '先读图或摆出数据，预测哪个更大，再计算检验。',
      '平均数是把总量重新分得一样多；概率看目标份数占总份数多少。'
    ],
    hydro: [
      '把等号想成一架平衡的天平，两边必须同时做同一件事。',
      '先找未知量和不变的等量关系，再列式。'
    ],
    pyro: [
      '先确定“把谁看作一整份”，再比较两种量。',
      '比和百分数都在描述相对于单位 1 的大小。'
    ],
    cryo: [
      '先固定其他条件，只改变一个量，观察另一个量怎样变化。',
      '把综合问题拆成已知关系，一步一步检验单位与条件。'
    ]
  };

  const MISCONCEPTIONS = {
    '0-0': { id: 'one-to-one', label: '一一对应时漏配或重复计数', recovery: '重新把两边排成两列，用线一对一连接。' },
    '0-1': { id: 'part-whole', label: '没有分清部分与整体', recovery: '先说清原来、变化和现在分别是哪一部分。' },
    '0-2': { id: 'groups-size', label: '混淆组数与每组数量', recovery: '用“几组、每组几个”各说一遍，再写乘法。' },
    '0-3': { id: 'equal-share', label: '只分完了，但没有分得同样多', recovery: '逐轮给每一组各放一个，直到全部分完。' },
    '0-4': { id: 'equality-balance', label: '把“用完”误当成“相等”', recovery: '比较两侧最终数量，而不是只检查备用量是否用完。' },
    '1-1': { id: 'perimeter-area', label: '混淆周长与面积', recovery: '周长沿边界走一圈，面积是在内部铺方格。' },
    '2-1': { id: 'unit-carry', label: '单位换算时忘记进率', recovery: '先全部换成最小单位，计算后再换回来。' },
    '3-1': { id: 'average-total', label: '混淆平均数与总数', recovery: '把总量重新平均分，检查总量是否守恒。' },
    '4-1': { id: 'equation-balance', label: '解方程时没有保持两边平衡', recovery: '等号两边同时做相同的逆运算。' },
    '5-1': { id: 'unit-one', label: '百分数问题中单位 1 不清楚', recovery: '先圈出“谁的百分之几”，被比较的整体就是单位 1。' },
    '6-2': { id: 'multi-step', label: '综合题中跳过了关系或单位检查', recovery: '每次只处理一个关系，并在下一步前检查单位。' }
  };

  const EVIDENCE_KINDS = ['prediction', 'model', 'explanation', 'verification', 'transfer'];
  const ERROR_TYPES = ['operation', 'representation', 'language'];
  const MISSION_PHASES = ['prediction', 'operate', 'express', 'verify', 'transfer'];

  function createLearningState() {
    return {
      diagnosticDone: false,
      diagnosticScore: 0,
      suggestedRegion: 0,
      chosenStartRegion: 0,
      mastery: {},
      misconceptions: {},
      completedPuzzles: [],
      reflectionNotes: [],
      missionCheckpoints: {},
      evidence: [],
      errorLog: [],
      totalAnswers: 0,
      totalCorrect: 0
    };
  }

  function cleanEvidence(item) {
    return {
      levelId: typeof item.levelId === 'string' ? item.levelId : '',
      kind: EVIDENCE_KINDS.includes(item.kind) ? item.kind : 'model',
      success: item.success === true,
      independent: item.independent === true,
      hintTier: Math.max(0, Math.min(3, Math.floor(Number(item.hintTier) || 0))),
      errorType: ERROR_TYPES.includes(item.errorType) ? item.errorType : null,
      at: Number(item.at) || 0
    };
  }

  function cleanError(item) {
    return {
      levelId: typeof item.levelId === 'string' ? item.levelId : '',
      type: ERROR_TYPES.includes(item.type) ? item.type : 'representation',
      expected: String(item.expected || '').slice(0, 120),
      observed: String(item.observed || '').slice(0, 120),
      recovery: String(item.recovery || '').slice(0, 180),
      at: Number(item.at) || 0
    };
  }

  function cleanInteraction(interaction) {
    const value = interaction && typeof interaction === 'object' ? interaction : {};
    return {
      type: typeof value.type === 'string' ? value.type : '',
      assignments: Array.isArray(value.assignments)
        ? value.assignments.slice(0, 30).map(item => item === null ? null : Math.max(0, Math.floor(Number(item) || 0))) : [],
      moved: Math.max(0, Math.floor(Number(value.moved) || 0)),
      rows: Math.max(0, Math.floor(Number(value.rows) || 0)),
      cols: Math.max(0, Math.floor(Number(value.cols) || 0)),
      left: Math.max(0, Math.floor(Number(value.left) || 0)),
      right: Math.max(0, Math.floor(Number(value.right) || 0)),
      pool: Math.max(0, Math.floor(Number(value.pool) || 0)),
      leftAdded: Math.max(0, Math.floor(Number(value.leftAdded) || 0)),
      rightAdded: Math.max(0, Math.floor(Number(value.rightAdded) || 0))
    };
  }

  function cleanCheckpoint(levelId, checkpoint) {
    if (!WIND_MISSIONS[levelId] || !checkpoint || typeof checkpoint !== 'object') return null;
    return {
      missionId: WIND_MISSIONS[levelId].id,
      phase: MISSION_PHASES.includes(checkpoint.phase) ? checkpoint.phase : 'prediction',
      prediction: ['string', 'number'].includes(typeof checkpoint.prediction) ? checkpoint.prediction : null,
      predictionCorrect: checkpoint.predictionCorrect === true,
      interaction: cleanInteraction(checkpoint.interaction),
      expressionAttempts: Math.max(0, Math.floor(Number(checkpoint.expressionAttempts) || 0)),
      expressionCorrect: checkpoint.expressionCorrect === true,
      hintTier: Math.max(0, Math.min(3, Math.floor(Number(checkpoint.hintTier) || 0))),
      transferAttempts: Math.max(0, Math.floor(Number(checkpoint.transferAttempts) || 0)),
      primaryErrors: Math.max(0, Math.floor(Number(checkpoint.primaryErrors) || 0)),
      errorCount: Math.max(0, Math.floor(Number(checkpoint.errorCount) || 0)),
      updatedAt: Number(checkpoint.updatedAt) || 0
    };
  }

  function normalizeLearning(raw) {
    const base = createLearningState();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
    base.diagnosticDone = raw.diagnosticDone === true;
    base.diagnosticScore = Number.isInteger(raw.diagnosticScore)
      ? Math.max(0, Math.min(DIAGNOSTIC_QUESTIONS.length, raw.diagnosticScore)) : 0;
    base.suggestedRegion = [0, 2, 4].includes(raw.suggestedRegion) ? raw.suggestedRegion : 0;
    base.chosenStartRegion = [0, 2, 4].includes(raw.chosenStartRegion) ? raw.chosenStartRegion : 0;
    base.completedPuzzles = Array.isArray(raw.completedPuzzles)
      ? [...new Set(raw.completedPuzzles.filter(id => Object.values(WIND_MISSIONS).some(mission => mission.id === id)))] : [];
    base.reflectionNotes = Array.isArray(raw.reflectionNotes)
      ? raw.reflectionNotes.filter(note => note && typeof note === 'object').slice(-30) : [];
    base.evidence = Array.isArray(raw.evidence)
      ? raw.evidence.filter(item => item && typeof item === 'object').slice(-120).map(cleanEvidence) : [];
    base.errorLog = Array.isArray(raw.errorLog)
      ? raw.errorLog.filter(item => item && typeof item === 'object').slice(-40).map(cleanError) : [];
    base.totalAnswers = Number.isInteger(raw.totalAnswers) ? Math.max(0, raw.totalAnswers) : 0;
    base.totalCorrect = Number.isInteger(raw.totalCorrect)
      ? Math.max(0, Math.min(base.totalAnswers, raw.totalCorrect)) : 0;

    if (raw.missionCheckpoints && typeof raw.missionCheckpoints === 'object' && !Array.isArray(raw.missionCheckpoints)) {
      Object.entries(raw.missionCheckpoints).forEach(([levelId, checkpoint]) => {
        const clean = cleanCheckpoint(levelId, checkpoint);
        if (clean) base.missionCheckpoints[levelId] = clean;
      });
    }
    if (raw.mastery && typeof raw.mastery === 'object' && !Array.isArray(raw.mastery)) {
      Object.entries(raw.mastery).forEach(([skill, value]) => {
        if (!value || typeof value !== 'object') return;
        const attempts = Math.max(0, Math.floor(Number(value.attempts) || 0));
        const correct = Math.min(attempts, Math.max(0, Math.floor(Number(value.correct) || 0)));
        base.mastery[skill] = {
          attempts,
          correct,
          independent: Math.min(correct, Math.max(0, Math.floor(Number(value.independent) || 0))),
          transfer: Math.max(0, Math.floor(Number(value.transfer) || 0)),
          explained: Math.max(0, Math.floor(Number(value.explained) || 0)),
          recovered: Math.max(0, Math.floor(Number(value.recovered) || 0)),
          score: Math.max(0, Math.min(100, Number(value.score) || 0)),
          lastPlayed: Number(value.lastPlayed) || 0
        };
      });
    }
    if (raw.misconceptions && typeof raw.misconceptions === 'object' && !Array.isArray(raw.misconceptions)) {
      Object.entries(raw.misconceptions).forEach(([id, count]) => {
        const safeCount = Math.max(0, Math.floor(Number(count) || 0));
        if (safeCount) base.misconceptions[id] = safeCount;
      });
    }
    return base;
  }

  function recommendRegion(score) {
    if (score >= 3) return 4;
    if (score >= 2) return 2;
    return 0;
  }

  function recordAttempt(learning, attempt) {
    const next = normalizeLearning(learning);
    const skill = attempt.skill || 'unknown';
    const current = next.mastery[skill] || {
      attempts: 0, correct: 0, independent: 0, transfer: 0, explained: 0, recovered: 0, score: 0, lastPlayed: 0
    };
    current.attempts++;
    next.totalAnswers++;
    if (attempt.correct) {
      current.correct++;
      next.totalCorrect++;
      if (attempt.firstTry && (attempt.hintTier || 0) < 3) current.independent++;
      if (attempt.kind === 'transfer') current.transfer++;
      if (attempt.kind === 'explanation') current.explained++;
      if (!attempt.firstTry) current.recovered++;
      const bonus = attempt.kind === 'transfer' ? 4 : attempt.kind === 'explanation' ? 2 : 0;
      current.score = Math.min(100, current.score + (attempt.firstTry ? 10 : 6) + bonus);
    } else {
      current.score = Math.max(0, current.score - 3);
      const misconception = MISCONCEPTIONS[attempt.levelId];
      if (misconception) {
        next.misconceptions[misconception.id] = (next.misconceptions[misconception.id] || 0) + 1;
      }
    }
    current.lastPlayed = Number(attempt.now) || Date.now();
    next.mastery[skill] = current;
    return next;
  }

  function calculateStars(result) {
    const count = Math.max(1, Number(result.questionCount) || 1);
    let stars = 1;
    if ((Number(result.independentCorrect) || 0) >= Math.ceil(count * 2 / 3)) stars = 2;
    if (stars >= 2 && result.transferFirstTry && (Number(result.transferHintTier) || 0) < 3) stars = 3;
    return stars;
  }

  function getTieredHint(skill, question, tier) {
    const hints = SKILL_HINTS[skill] || SKILL_HINTS.anemo;
    if (tier <= 1) return `看一看：${hints[0]}`;
    if (tier === 2) return `试一试：${hints[1]}`;
    return `形式检验：${question?.hint || '把你的预测代回题目条件逐项检查。'}`;
  }

  function getMissionHint(mission, phase, tier) {
    const hints = mission?.hints?.[phase] || mission?.hints?.operate || [];
    const safeTier = Math.max(1, Math.min(3, Math.floor(Number(tier) || 1)));
    const prefixes = ['看一看', '试一试', '形式检验'];
    return `${prefixes[safeTier - 1]}：${hints[safeTier - 1] || '比较你的预测、操作结果和任务条件，找出哪一处还没有对应。'}`;
  }

  function recordEvidence(learning, evidence) {
    const next = normalizeLearning(learning);
    const entry = cleanEvidence({ ...evidence, at: Number(evidence.at) || Date.now() });
    next.evidence.push(entry);
    next.evidence = next.evidence.slice(-120);
    if (!entry.success && entry.errorType) {
      next.errorLog.push(cleanError({
        levelId: entry.levelId,
        type: entry.errorType,
        expected: evidence.expected,
        observed: evidence.observed,
        recovery: evidence.recovery,
        at: entry.at
      }));
      next.errorLog = next.errorLog.slice(-40);
    }
    return next;
  }

  function setMissionCheckpoint(learning, levelId, checkpoint) {
    const next = normalizeLearning(learning);
    if (!WIND_MISSIONS[levelId]) return next;
    const clean = cleanCheckpoint(levelId, checkpoint);
    if (clean) next.missionCheckpoints[levelId] = clean;
    return next;
  }

  function clearMissionCheckpoint(learning, levelId) {
    const next = normalizeLearning(learning);
    delete next.missionCheckpoints[levelId];
    return next;
  }

  function summarizeEvidence(learning) {
    const next = normalizeLearning(learning);
    const successful = next.evidence.filter(item => item.success);
    const independent = successful.filter(item => item.independent).length;
    const transfer = successful.filter(item => item.kind === 'transfer').length;
    const explanations = successful.filter(item => item.kind === 'explanation').length;
    const recovered = next.evidence.filter((error, index) => {
      if (error.success) return false;
      const nextErrorIndex = next.evidence.findIndex((item, later) => later > index
        && item.levelId === error.levelId && !item.success);
      return next.evidence.some((item, later) => later > index
        && (nextErrorIndex < 0 || later < nextErrorIndex)
        && item.levelId === error.levelId && item.success);
    }).length;
    return {
      evidenceCount: next.evidence.length,
      independent,
      transfer,
      explanations,
      recovered,
      latestError: next.errorLog[next.errorLog.length - 1] || null
    };
  }

  function appendEvent(events, type, data = {}, now = Date.now(), limit = 500) {
    const safeEvents = Array.isArray(events) ? events.slice(-(limit - 1)) : [];
    safeEvents.push({ type: String(type), at: Number(now), data: { ...data } });
    return safeEvents;
  }

  return {
    DIAGNOSTIC_QUESTIONS,
    WIND_MISSIONS,
    WIND_PUZZLES,
    SKILL_HINTS,
    MISCONCEPTIONS,
    createLearningState,
    normalizeLearning,
    recommendRegion,
    recordAttempt,
    calculateStars,
    getTieredHint,
    getMissionHint,
    recordEvidence,
    setMissionCheckpoint,
    clearMissionCheckpoint,
    summarizeEvidence,
    appendEvent
  };
});
