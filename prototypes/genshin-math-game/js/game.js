// 数境远征：游戏主逻辑

// 全局错误捕获（便于调试）
window.addEventListener('error', function(e) {
  console.error('Global error:', e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled rejection:', e.reason);
});

(function() {
  'use strict';

  // DOM 缓存
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const Learning = window.LearningSystems;
  if (!Learning) throw new Error('LearningSystems 未加载');

  const EVENT_LOG_KEY = 'genshinMathEventsV1';
  const VISUAL_ASSETS = {
    world: 'assets/world/aetheria-storybook-overworld-v2.webp',
    traveler: 'assets/characters/xiaoyuan-storybook-v2.webp',
    windScholar: 'assets/characters/xingya-wind-guide-v2.webp',
    windGuardian: 'assets/characters/balance-guardian-v2.webp'
  };
  const DIALOG_PORTRAITS = {
    '小远': VISUAL_ASSETS.traveler,
    '风精灵': VISUAL_ASSETS.windScholar
  };
  const REGION_BACKGROUND_POSITIONS = [
    '18% 20%', '50% 17%', '84% 19%', '17% 60%', '84% 58%', '21% 86%', '78% 86%'
  ];

  // 开放世界尺寸与布局（WORLD_LAYOUT 在 data.js 中定义，加载失败时退化为裸尺寸常量）
  const WORLD = { W: 10000, H: 6000 };
  const LAYOUT = typeof WORLD_LAYOUT !== 'undefined' ? WORLD_LAYOUT : null;
  const COSMETICS = [
    { id: 'default', name: '旅行微光', emoji: '· · ·', cost: 0, className: '' },
    { id: 'breeze', name: '风语轨迹', emoji: '🍃 ･ﾟ', cost: 20, className: 'trail-breeze' },
    { id: 'starlight', name: '星辉轨迹', emoji: '✨ ･ﾟ', cost: 40, className: 'trail-starlight' },
    { id: 'rainbow', name: '虹光轨迹', emoji: '🌈 ･ﾟ', cost: 60, className: 'trail-rainbow' }
  ];

  // 商店商品：武器（永久装备，提升攻击力与武器技能效果）+ 道具（战斗中的一次性消耗品）。
  // 设计约束：武器不改变"必须答对全部题目才能获胜"的学习约束，只增强生存与表现。
  const WEAPONS = [
    { id: 'wooden', name: '木枝短剑', emoji: '🗡️', cost: 0, attackBonus: 5, desc: '旅行者的第一把武器' },
    { id: 'breeze', name: '风旅轻剑', emoji: '🍃', cost: 30, attackBonus: 7, desc: '轻得像一阵风' },
    { id: 'wind', name: '风灵之剑', emoji: '⚔️', cost: 60, attackBonus: 10, desc: '轻盈如风，出手更快' },
    { id: 'rock', name: '岩心重锤', emoji: '🔨', cost: 100, attackBonus: 15, desc: '沉稳有力，震慑强敌' },
    { id: 'starshort', name: '星辉短刃', emoji: '🔪', cost: 130, attackBonus: 18, desc: '映着星光的短刃' },
    { id: 'thunder', name: '雷鸣长枪', emoji: '🔱', cost: 160, attackBonus: 20, desc: '雷电附着的锋利枪尖' },
    { id: 'forest', name: '森语法杖', emoji: '🪄', cost: 220, attackBonus: 25, desc: '凝聚森林智慧的法杖' },
    { id: 'stormaxe', name: '风暴战斧', emoji: '🪓', cost: 260, attackBonus: 28, desc: '挥动时带着雷鸣' },
    { id: 'water', name: '澄水晶弓', emoji: '🏹', cost: 300, attackBonus: 30, desc: '澄澈水元素凝成的长弓' },
    { id: 'flame', name: '赤焰大剑', emoji: '🗡️', cost: 400, attackBonus: 40, desc: '燃烧着赤焰的双手大剑' },
    { id: 'snow', name: '雪境圣剑', emoji: '⚔️', cost: 520, attackBonus: 50, desc: '传说中的终极武器' }
  ];
  const CONSUMABLES = [
    { id: 'potion', name: '生命药水', emoji: '🧪', cost: 20, desc: '战斗中恢复 40 点生命' },
    { id: 'shield', name: '护盾符文', emoji: '🛡️', cost: 30, desc: '战斗中抵挡一次怪物攻击' },
    { id: 'scroll', name: '智慧卷轴', emoji: '📜', cost: 25, desc: '战斗中免费查看当前题的完整提示' }
  ];
  // 防具：提供防御加成，降低怪物反击伤害（布衣免费，其余钻石购买）
  const ARMORS = [
    { id: 'cloth', name: '新手布衣', emoji: '🧥', cost: 0, defenseBonus: 2, desc: '旅行者的第一件防具' },
    { id: 'leather', name: '风旅皮甲', emoji: '🥋', cost: 60, defenseBonus: 4, desc: '轻便结实的皮甲' },
    { id: 'rockmail', name: '岩心铠甲', emoji: '🛡️', cost: 140, defenseBonus: 7, desc: '岩岚港工匠的杰作' }
  ];
  // 主动战斗技能：钻石购买的纯战斗增益，每场战斗限用一次；提示类元素技能永远免费
  const ACTIVE_SKILLS = [
    { id: 'gustStun', name: '风压震慑', emoji: '💨', cost: 80, desc: '震慑怪物，它的下一次反击落空' },
    { id: 'healWave', name: '治疗波动', emoji: '💚', cost: 100, desc: '立即恢复 30 点生命' },
    { id: 'chargeHit', name: '蓄势打击', emoji: '🔥', cost: 120, desc: '接下来 2 题答对能量翻倍' }
  ];
  // 材料兑换汇率：1 材料 = 2 钻石（保守，防止刷崩商店经济）
  const MATERIAL_SELL_RATE = 2;
  const MATERIAL_INFO = [
    { id: 'windSeed', name: '风种', emoji: '🍃' },
    { id: 'windLamp', name: '风灯', emoji: '🏮' },
    { id: 'plank', name: '木板', emoji: '🪵' },
    { id: 'windCrystal', name: '风压晶', emoji: '🔮' }
  ];

  // 填充式机关：地图上的数学实体。收集材料 → 估算数量 → 投放 → 物理反馈（不够/正好/多了/歪了）→ 符号定格
  // type 说明：
  //   fill       精确数量填充（0-0 风车）
  //   fillTo     带初始量填充，体会"部分+部分=整体"（0-1 风核）
  //   grid       行列安放，体会"每行×行数=总数"（0-2 风灯塔）
  //   distribute N 个材料均分到 M 个区域，倾斜实时反馈（0-3 风桥）
  //   balance    双盘配平，横梁实时反馈（0-4 风暴核心）
  const MECHANISMS = {
    windmill: {
      id: 'windmill', levelId: '0-0', type: 'fill',
      elementId: 'windmill-change',
      x: 1640, y: 2420, radius: 170,
      title: '沉睡的风车', actionLabel: '修复',
      material: 'windSeed', itemEmoji: '🍃', slotEmoji: '🌀',
      need: 6,
      entityEmoji: '🏠', subEmoji: '✣',
      estimatePrompt: '大概要几颗？',
      estimateTarget: 6,
      restored: () => state.map.worldChanges.windmillRestored,
      restoreText: '风车转得正欢！去别处冒险吧',
      symbols: ['🍃×6 → 🌀×6', '一一对应！'],
      applyWorldChange: () => { state.map.worldChanges.windmillRestored = true; }
    },
    windcore: {
      id: 'windcore', levelId: '0-1', type: 'fillTo',
      elementId: 'windcore-change',
      x: 1350, y: 2350, radius: 170,
      title: '黯淡的风核', actionLabel: '充能',
      material: 'windSeed', itemEmoji: '🍃', slotEmoji: '✦',
      start: 4, need: 7,
      entityEmoji: '🔮', subEmoji: '✦',
      estimatePrompt: '还要补几颗？',
      estimateTarget: 3,
      restored: () => state.map.worldChanges.windcoreLit,
      restoreText: '风核亮着呢！去别处冒险吧',
      symbols: ['4 + 3 = 7', '部分+部分=整体'],
      applyWorldChange: () => { state.map.worldChanges.windcoreLit = true; }
    },
    windtower: {
      id: 'windtower', levelId: '0-2', type: 'grid',
      elementId: 'windtower-change',
      x: 1850, y: 2650, radius: 170,
      title: '熄灭的风灯塔', actionLabel: '点亮',
      material: 'windLamp', itemEmoji: '🏮', slotEmoji: '○',
      rows: 3, cols: 4,
      entityEmoji: '🗼', subEmoji: '🏮',
      estimatePrompt: '一共要多少盏？',
      estimateTarget: 12,
      restored: () => state.map.worldChanges.windtowerLit,
      restoreText: '灯塔亮着呢！去别处冒险吧',
      symbols: ['3 行 × 4 列 = 12', '每行×行数=总数'],
      applyWorldChange: () => { state.map.worldChanges.windtowerLit = true; }
    },
    windbridge: {
      id: 'windbridge', levelId: '0-3', type: 'distribute',
      elementId: 'wind-bridge-change',
      x: 1720, y: 2700, radius: 170,
      title: '断裂的风桥', actionLabel: '铺设',
      material: 'plank', itemEmoji: '🪵', zoneEmoji: '＝',
      total: 12, zones: 3, zoneName: '桥段',
      entityEmoji: '🌉', subEmoji: '🪵',
      estimatePrompt: '每段桥几块？',
      estimateTarget: 4,
      restored: () => state.map.worldChanges.bridgeOpened,
      restoreText: '风桥平平的，可以通行！',
      symbols: ['12 ÷ 3 = 4', '一样多才平稳'],
      applyWorldChange: () => { state.map.worldChanges.bridgeOpened = true; }
    },
    stormcore: {
      id: 'stormcore', levelId: '0-4', type: 'balance',
      elementId: 'storm-core-change',
      x: 1170, y: 2710, radius: 170,
      title: '失衡的风暴核心', actionLabel: '配平',
      material: 'windCrystal', itemEmoji: '🔮', slotEmoji: '◌',
      leftStart: 5, need: 5,
      entityEmoji: '⚖️', subEmoji: '◉',
      estimatePrompt: '右盘放几颗？',
      estimateTarget: 5,
      restored: () => state.map.worldChanges.stormCalmed,
      restoreText: '风暴核心很安静。去别处冒险吧',
      symbols: ['5 = 5', '两边相等就平衡'],
      applyWorldChange: () => { state.map.worldChanges.stormCalmed = true; }
    },
    // 复练机关：同样的结构换一组参数，做"单变量迁移"练习（一次性奖励）
    starmill: {
      id: 'starmill', levelId: null, type: 'fill',
      elementId: 'starmill-change',
      x: 8800, y: 2350, radius: 170,
      title: '星屑风车', actionLabel: '修复',
      material: 'windSeed', itemEmoji: '🍃', slotEmoji: '🌀',
      need: 8,
      entityEmoji: '🏠', subEmoji: '✣',
      estimatePrompt: '这座要几颗？',
      estimateTarget: 8,
      restored: () => state.map.worldChanges.starmillRestored,
      restoreText: '星屑风车转着呢！',
      symbols: ['🍃×8 → 🌀×8', '换一座也会修！'],
      applyWorldChange: () => { state.map.worldChanges.starmillRestored = true; }
    },
    echoscale: {
      id: 'echoscale', levelId: null, type: 'balance',
      elementId: 'echoscale-change',
      x: 5000, y: 5550, radius: 170,
      title: '回声天平', actionLabel: '配平',
      material: 'windCrystal', itemEmoji: '🔮', slotEmoji: '◌',
      leftStart: 9, need: 9,
      entityEmoji: '⚖️', subEmoji: '🏜️',
      estimatePrompt: '右盘放几颗？',
      estimateTarget: 9,
      restored: () => state.map.worldChanges.echoscaleRestored,
      restoreText: '回声天平很稳。',
      symbols: ['9 = 9', '换个数也会配！'],
      applyWorldChange: () => { state.map.worldChanges.echoscaleRestored = true; }
    }
  };

  // 每日/每周任务题库：metric 对应 recordQuestProgress 的埋点，mode 为 'max' 时进度取历史最大值
  const QUEST_POOLS = {
    daily: [
      { id: 'd-levels', metric: 'level', target: 2, name: '完成 2 个关卡', reward: 15 },
      { id: 'd-correct', metric: 'correct', target: 10, name: '答对 10 道题', reward: 15 },
      { id: 'd-crystal', metric: 'crystal', target: 3, name: '收集 3 个水晶', reward: 10 },
      { id: 'd-chest', metric: 'chest', target: 1, name: '开启 1 个宝箱', reward: 10 },
      { id: 'd-burst', metric: 'burst', target: 1, name: '使用 1 次元素爆发', reward: 10 },
      { id: 'd-streak', metric: 'streak', mode: 'max', target: 3, name: '连续答对 3 题', reward: 10 },
      { id: 'd-area', metric: 'area', target: 1, name: '发现 1 处隐藏区域', reward: 15 }
    ],
    weekly: [
      { id: 'w-levels', metric: 'level', target: 6, name: '完成 6 个关卡', reward: 40 },
      { id: 'w-correct', metric: 'correct', target: 40, name: '答对 40 道题', reward: 40 },
      { id: 'w-crystal', metric: 'crystal', target: 8, name: '收集 8 个水晶', reward: 30 },
      { id: 'w-chest', metric: 'chest', target: 2, name: '开启 2 个宝箱', reward: 30 },
      { id: 'w-burst', metric: 'burst', target: 3, name: '使用 3 次元素爆发', reward: 25 },
      { id: 'w-streak', metric: 'streak', mode: 'max', target: 5, name: '连续答对 5 题', reward: 30 },
      { id: 'w-area', metric: 'area', target: 2, name: '发现 2 处隐藏区域', reward: 35 },
      { id: 'w-waypoint', metric: 'waypoint', target: 1, name: '激活 1 个传送点', reward: 25 }
    ]
  };

  // 区域环境音：每个区域一组不同的音调组合，用 Web Audio 现场合成
  const REGION_BGM = [
    { tones: [220, 330, 440], noise: 400, lfo: 0.1, type: 'sine' },      // 风语原：流动的风
    { tones: [110, 165, 220], noise: 220, lfo: 0.06, type: 'triangle' }, // 岩岚港：沉稳的山岩
    { tones: [262, 392, 523], noise: 800, lfo: 0.18, type: 'triangle' }, // 雷鸣群岛：急促的雷电
    { tones: [196, 294, 392], noise: 500, lfo: 0.08, type: 'sine' },     // 森语城：生长的密林
    { tones: [247, 370, 494], noise: 600, lfo: 0.12, type: 'sine' },     // 澄水庭：流动的水波
    { tones: [147, 220, 294], noise: 300, lfo: 0.15, type: 'sawtooth' }, // 赤焰谷：灼热的烈焰
    { tones: [330, 495, 660], noise: 900, lfo: 0.05, type: 'sine' }      // 雪境宫：清澈的冰雪
  ];

  const REFLECTIONS = {
    '0-0': ['每个对象只能配一个位置', '配完要检查有没有剩余', '相等数量可以一一对应'],
    '0-1': ['加法把部分合成整体', '减法从整体拿走一部分', '先分清原来、变化和现在'],
    '0-2': ['乘法表示几个相同的数相加', '要分清几组和每组几个', '行数乘列数得到总数'],
    '0-3': ['平均分不仅要分完，还要一样多', '可以逐轮每组放一个', '总数 ÷ 份数 = 每份数'],
    '0-4': ['平衡要比较两侧最终数量', '风向改变后要重新观察', '较少的一侧需要补足差值']
  };

  // 风语原的数学对象使用统一的世界内物件，不再依赖各平台外观不一致的 emoji。
  const MATH_OBJECT_STYLES = {
    '🍃': { kind: 'wind-seed', label: '风种' },
    '🐦': { kind: 'wind-bird', label: '风鸟' },
    '✦': { kind: 'wind-light', label: '风力' },
    '◆': { kind: 'energy-gem', label: '能量' },
    '🏮': { kind: 'wind-lantern', label: '风灯' },
    '🔔': { kind: 'wind-bell', label: '风铃' },
    '✨': { kind: 'wind-spark', label: '风种' },
    '🎒': { kind: 'supply-pack', label: '补给' },
    '◈': { kind: 'balance-rune', label: '风压' },
    '◇': { kind: 'balance-rune pale', label: '风压' }
  };
  const MATH_SLOT_STYLES = {
    '🌀': { kind: 'wind-slot', label: '风槽' },
    '🪺': { kind: 'bird-nest', label: '鸟巢' }
  };

  // 游戏状态
  const defaultState = {
    version: 4.4,
    player: {
      name: '小远',
      level: 1,
      exp: 0,
      hp: 100,
      maxHp: 100,
      energy: 0,
      maxEnergy: 100,
      gems: 0,
      answerStreak: 0,
      burstsUsed: 0,
      reactionsTriggered: 0,
      unlockedRegions: [0],
      completedLevels: [], // 存储 level.id
      levelStars: {},
      currentRegion: 0
    },
    map: {
      collectedItems: [],
      openedChests: [],
      activatedWaypoints: [],
      seenStories: [],
      discoveredAreas: [],
      collectedMaterials: [],
      worldChanges: {
        windmillRestored: false,
        windcoreLit: false,
        windtowerLit: false,
        bridgeOpened: false,
        stormCalmed: false,
        starmillRestored: false,
        echoscaleRestored: false
      }
    },
    achievements: {
      firstClear: false,
      streak5: false,
      unlock3Regions: false,
      collect10Gems: false,
      open2Chests: false,
      activate3Waypoints: false,
      allClear: false,
      streak10: false,
      perfectLevel: false,
      firstBurst: false,
      burst10: false,
      firstReaction: false,
      reaction5: false,
      clearRegion0: false,
      clearRegion1: false,
      clearRegion2: false,
      clearRegion3: false,
      clearRegion4: false,
      clearRegion5: false,
      clearRegion6: false,
      unlockAllRegions: false,
      collectAllGems: false,
      open5Chests: false,
      activate5Waypoints: false,
      explorer4: false,
      skill1: false,
      skillAll: false
    },
    passives: [], // 技能树：已解锁的被动技能 id
    quests: {
      daily: null,  // { date: 'YYYY-MM-DD', tasks: [{ id, progress, claimed }] }，按当天日期生成
      weekly: null  // { week: 'YYYY-Www', tasks: [{ id, progress, claimed }] }，按 ISO 周生成
    },
    settings: {
      bgm: false,
      sfx: true,
      largeText: false,
      reducedMotion: false
    },
    learning: Learning.createLearningState(),
    commissions: {},
    cosmetics: {
      owned: ['default'],
      selected: 'default'
    },
    // 背包：已购武器 id 列表与道具数量；装备：当前使用的武器
    inventory: {
      weapons: ['wooden'],
      armors: ['cloth'],
      consumables: { potion: 0, shield: 0, scroll: 0 },
      activeSkills: []
    },
    equipment: {
      weapon: 'wooden',
      armor: 'cloth'
    },
    // 收集材料：机关的运算对象（风种修风车、木板铺风桥……）
    materials: {
      windSeed: 0,
      windLamp: 0,
      plank: 0,
      windCrystal: 0
    }
  };

  // 成就定义
  const ACHIEVEMENTS = {
    firstClear: { name: '初露锋芒', desc: '完成第一个关卡', icon: '⭐', reward: 10 },
    streak5: { name: '连战连捷', desc: '连续答对 5 题', icon: '🔥', reward: 20 },
    unlock3Regions: { name: '探索者', desc: '解锁 3 个区域', icon: '🗺️', reward: 30 },
    collect10Gems: { name: '拾荒者', desc: '收集 10 个水晶', icon: '💎', reward: 20 },
    open2Chests: { name: '寻宝家', desc: '开启 2 个宝箱', icon: '🎁', reward: 30 },
    activate3Waypoints: { name: '传送大师', desc: '激活 3 个传送点', icon: '💠', reward: 20 },
    allClear: { name: '数理大师', desc: '通关所有区域', icon: '👑', reward: 100 },
    streak10: { name: '百战不殆', desc: '连续答对 10 题', icon: '⚡', reward: 40 },
    perfectLevel: { name: '无懈可击', desc: '零失误通过任意关卡', icon: '🛡️', reward: 30 },
    firstBurst: { name: '灵感初绽', desc: '首次使用灵感共鸣', icon: '✨', reward: 10 },
    burst10: { name: '共鸣常客', desc: '累计使用 10 次灵感共鸣', icon: '🌟', reward: 40 },
    firstReaction: { name: '元素新手', desc: '首次触发元素反应', icon: '💫', reward: 15 },
    reaction5: { name: '反应大师', desc: '累计触发 5 次元素反应', icon: '🧪', reward: 40 },
    clearRegion0: { name: '风语行者', desc: '通关风语原全部关卡', icon: '🌪️', reward: 30 },
    clearRegion1: { name: '岩港工匠', desc: '通关岩岚港全部关卡', icon: '⛰️', reward: 30 },
    clearRegion2: { name: '雷鸣度量师', desc: '通关雷鸣群岛全部关卡', icon: '🌩️', reward: 30 },
    clearRegion3: { name: '森语统计员', desc: '通关森语城全部关卡', icon: '🌿', reward: 30 },
    clearRegion4: { name: '澄水代数家', desc: '通关澄水庭全部关卡', icon: '💧', reward: 30 },
    clearRegion5: { name: '赤焰比例师', desc: '通关赤焰谷全部关卡', icon: '🔥', reward: 30 },
    clearRegion6: { name: '雪境征服者', desc: '通关雪境宫全部关卡', icon: '❄️', reward: 40 },
    unlockAllRegions: { name: '大陆行者', desc: '解锁全部 7 个区域', icon: '🧭', reward: 50 },
    collectAllGems: { name: '水晶收藏家', desc: '收集地图上全部水晶', icon: '💠', reward: 40 },
    open5Chests: { name: '宝藏猎人', desc: '开启全部 5 个宝箱', icon: '🏆', reward: 40 },
    activate5Waypoints: { name: '传送网络', desc: '激活全部 5 个传送点', icon: '🌐', reward: 30 },
    explorer4: { name: '秘境探索者', desc: '发现全部 4 个隐藏区域', icon: '🔭', reward: 40 },
    skill1: { name: '初窥门径', desc: '在技能树解锁 1 个被动技能', icon: '📖', reward: 15 },
    skillAll: { name: '融会贯通', desc: '解锁全部被动技能', icon: '🎓', reward: 60 }
  };

  // 技能树：用钻石解锁的被动技能
  const SKILL_TREE = [
    { id: 'energyStart', name: '元素充盈', icon: '⚡', cost: 80, desc: '每场战斗开始时能量 +30' },
    { id: 'hpBoost', name: '生命祝福', icon: '❤️', cost: 80, desc: '战斗中生命上限 +25' },
    { id: 'energyGain', name: '能量涌动', icon: '🌊', cost: 100, desc: '答对题目获得的能量提升 50%' },
    { id: 'streakGuard', name: '连击守护', icon: '🛡️', cost: 120, desc: '每关一次，答错不清零连击数' },
    { id: 'revive', name: '复苏之风', icon: '🍃', cost: 150, desc: '每场战斗一次，生命归零时恢复 35 点继续战斗' },
    { id: 'gemFind', name: '拾荒直觉', icon: '💎', cost: 120, desc: '首次通关额外获得 15 钻石' }
  ];

  // 使用非本关元素技能的能量消耗
  const OFF_ELEMENT_SKILL_COST = 15;

  // 元素反应：连续使用两种不同元素技能触发组合效果（键为两个元素 id 排序后拼接）
  const ELEMENTAL_REACTIONS = {
    'anemo+pyro': { name: '扩散', effect: 'energy', value: 30, desc: '风火扩散，能量 +30' },
    'anemo+electro': { name: '扩散·雷', effect: 'energy', value: 30, desc: '风雷扩散，能量 +30' },
    'anemo+hydro': { name: '扩散·水', effect: 'energy', value: 30, desc: '风水扩散，能量 +30' },
    'anemo+cryo': { name: '扩散·冰', effect: 'energy', value: 30, desc: '风冰扩散，能量 +30' },
    'electro+hydro': { name: '感电', effect: 'doubleEnergy', value: 2, desc: '水雷感电，接下来 2 题答对能量翻倍' },
    'cryo+electro': { name: '超导', effect: 'shield', value: 1, desc: '冰雷超导，获得护盾抵挡一次答错伤害' },
    'cryo+pyro': { name: '融化', effect: 'heal', value: 25, desc: '冰火融化，恢复 25 点生命' },
    'hydro+pyro': { name: '蒸发', effect: 'doubleEnergy', value: 1, desc: '水火蒸发，下一题答对能量翻倍' },
    'dendro+pyro': { name: '燃烧', effect: 'energy', value: 20, desc: '草木燃烧，能量 +20' },
    'dendro+hydro': { name: '绽放', effect: 'heal', value: 15, desc: '水草绽放，恢复 15 点生命' },
    'dendro+electro': { name: '激化', effect: 'doubleEnergy', value: 1, desc: '草雷激化，下一题答对能量翻倍' }
  };
  const DEFAULT_REACTION = { name: '元素共鸣', effect: 'energy', value: 10, desc: '元素共鸣，能量 +10' };

  // 灵感挑战：连续 3 题独立答对后触发的难一档变式题（只上调，答错无惩罚）
  const CHALLENGE_QUESTIONS = {
    anemo: [
      { text: '灵感挑战：48 + 37 + 25 = ?', options: [100, 105, 110, 120], answer: 110, hint: '先凑整：48 + 25 = 73… 73 + 37 = 110。' },
      { text: '灵感挑战：7 × 8 + 16 = ?', options: [56, 62, 72, 80], answer: 72, hint: '7 × 8 = 56，56 + 16 = 72。' }
    ],
    geo: [
      { text: '灵感挑战：长方形长 9 宽 6，剪掉一个边长 2 的正方形，剩下的面积是多少？', options: [50, 52, 54, 56], answer: 50, hint: '9 × 6 = 54，2 × 2 = 4，54 - 4 = 50。' },
      { text: '灵感挑战：一个三角形两条边是 5cm 和 7cm，第三条边可能是多长？', options: ['1cm', '2cm', '5cm', '13cm'], answer: '5cm', hint: '两边之和大于第三边：5 + 5 > 7 可以，1、2、13 都不行。' }
    ],
    electro: [
      { text: '灵感挑战：2.5 千克等于多少克？', options: [250, 2500, 2050, 5000], answer: 2500, hint: '1 千克 = 1000 克，2.5 × 1000 = 2500。' },
      { text: '灵感挑战：1 元 3 角 5 分 + 6 角 5 分 = ？元', options: [1.4, 1.7, 2, 2.1], answer: 2, hint: '3 角 5 分 + 6 角 5 分 = 1 元，1 + 1 = 2 元。' }
    ],
    dendro: [
      { text: '灵感挑战：4、5、8、x 四个数的平均数是 6，x 是多少？', options: [5, 6, 7, 8], answer: 7, hint: '总数 6 × 4 = 24，24 - 4 - 5 - 8 = 7。' },
      { text: '灵感挑战：袋子里有 3 红球 2 白球，摸一个球是红球的可能性是多少？', options: ['1/2', '2/5', '3/5', '3/4'], answer: '3/5', hint: '3 ÷ (3+2) = 3/5。' }
    ],
    hydro: [
      { text: '灵感挑战：2x + 4 = 18，x = ?', options: [5, 6, 7, 8], answer: 7, hint: '2x = 14，x = 7。' },
      { text: '灵感挑战：-6 + 13 - 4 = ?', options: ['-3', '3', '7', '11'], answer: '3', hint: '-6 + 13 = 7，7 - 4 = 3。' }
    ],
    pyro: [
      { text: '灵感挑战：240 的 35% 是多少？', options: [70, 80, 84, 96], answer: 84, hint: '240 × 0.35 = 84。' },
      { text: '灵感挑战：一本书 120 页，第一天看了 1/4，第二天看了 1/3，还剩多少页？', options: [40, 50, 60, 70], answer: 50, hint: '120 - 30 - 40 = 50。' }
    ],
    cryo: [
      { text: '灵感挑战：早晨 -4℃，中午上升 11℃，夜里又降 8℃，夜里多少度？', options: ['-1', '0', '1', '3'], answer: '-1', hint: '-4 + 11 = 7，7 - 8 = -1。' },
      { text: '灵感挑战：圆柱底面半径 2cm、高 5cm，体积是多少？（π 取 3）', options: [40, 50, 60, 80], answer: 60, hint: '3 × 2² × 5 = 60。' }
    ]
  };

  let state = JSON.parse(JSON.stringify(defaultState));

  // 当前会话状态（不持久化）
  let session = {
    currentRegionId: null,
    currentLevel: null,
    currentQuestionIndex: 0,
    enemyHp: 100,
    enemyMaxHp: 100,
    dialogQueue: [],
    dialogIndex: 0,
    typing: false,
    answered: false,
    // 开放世界移动状态
    playerX: 4000,
    playerY: 2500,
    targetX: 4000,
    targetY: 2500,
    isMoving: false,
    moveMode: null,
    moveKeys: { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false },
    velX: 0, velY: 0,           // 移动速度向量（起步加速/松手滑行）
    // 虚拟摇杆向量（-1 ~ 1）
    joystick: { x: 0, y: 0, active: false },
    // 冲刺与体力（原神式：按住 Shift 加速，体力耗尽则无法冲刺）
    sprintKey: false,
    stamina: 100,
    // 世界构建/区域发现（会话级，不持久化）
    worldBuilt: false,
    currentRegionArea: null,
    shownRegionBanners: [],
    currentLandmark: null,
    currentWaypoint: null,
    mobileActionTarget: null,
    cameraX: 0,
    cameraY: 0,
    mapActive: false,
    collectedItems: [],
    openedChests: [],
    activatedWaypoints: [],
    facing: 'up',
    walkCycle: 0,
    correctStreak: 0,
    wrongAnswers: 0,
    hintsUsed: 0,
    battleResolved: false,
    controlsLocked: false,
    storyInProgress: null,
    dialogToken: 0,
    dialogTimer: null,
    diagnosticIndex: 0,
    diagnosticScore: 0,
    currentPuzzle: null,
    puzzlePrediction: null,
    missionPhase: null,
    missionInteraction: null,
    missionPredictionCorrect: false,
    missionExpressionAttempts: 0,
    missionExpressionCorrect: false,
    missionHintTier: 0,
    missionTransferAttempts: 0,
    missionPrimaryErrors: 0,
    missionErrorCount: 0,
    missionResumed: false,
    questionAttempts: [],
    questionHintTiers: [],
    independentCorrect: 0,
    transferFirstTry: false,
    transferHintTier: 0,
    answerTimer: null,
    // 元素反应与被动技能的战斗内状态
    lastElement: null,
    buffShield: false,
    buffDoubleEnergy: 0,
    streakGuardUsed: false,
    reviveUsed: false,
    // 武器/道具战斗内状态
    weaponStrikeUsed: false,   // 武器技能每场战斗一次
    itemShield: false,         // 护盾符文：抵挡一次怪物攻击
    enemyStunned: false,       // 弱点破防/武器震慑：怪物下一次攻击无效
    usedActiveSkills: [],      // 本场战斗已用的主动技能
    bossShield: false,         // Boss 护盾：首题（破盾题）答对前不掉血
    perfectStreak: 0,          // 连续独立答对（无提示且首次尝试），>=3 触发灵感挑战
    challengeActive: false,    // 灵感挑战题进行中
    challengeDone: false,      // 本场战斗已出过灵感挑战
    challengeQuestion: null,
    // 目标光柱（会话级，不持久化）
    beamUntil: 0,
    beamCooldownUntil: 0,
    lastProgressAt: 0,
    // 填充式机关会话状态（不持久化）
    currentMechanism: null,
    mechanism: null            // { id, estimate, filled, failCount, resolved }
  };

  function readEventLog() {
    try {
      const value = JSON.parse(localStorage.getItem(EVENT_LOG_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (error) {
      return [];
    }
  }

  function trackEvent(type, data = {}) {
    try {
      const events = Learning.appendEvent(readEventLog(), type, data);
      localStorage.setItem(EVENT_LOG_KEY, JSON.stringify(events));
    } catch (error) {
      console.warn('event log error', error);
    }
  }

  // 音效（简单提示音）
  const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
  function ensureAudioReady() {
    if (audioCtx?.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }
  function playTone(freq, duration, type = 'sine') {
    if (!state.settings.sfx || !audioCtx) return;
    try {
      ensureAudioReady();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  }
  function sfx(name) {
    switch (name) {
      case 'click': playTone(600, 0.08); break;
      case 'correct': playTone(880, 0.15); setTimeout(() => playTone(1100, 0.2), 100); break;
      case 'wrong': playTone(200, 0.25, 'sawtooth'); break;
      case 'burst': playTone(440, 0.4); setTimeout(() => playTone(660, 0.5), 150); setTimeout(() => playTone(880, 0.6), 350); break;
      case 'win': playTone(523, 0.2); setTimeout(() => playTone(659, 0.2), 200); setTimeout(() => playTone(784, 0.4), 400); break;
      case 'step': playTone(300 + Math.random() * 100, 0.05, 'triangle'); break;
      case 'collect': playTone(1200, 0.1); setTimeout(() => playTone(1600, 0.15), 80); break;
      case 'streak': playTone(660, 0.1, 'triangle'); setTimeout(() => playTone(880, 0.1, 'triangle'), 80); setTimeout(() => playTone(1320, 0.18, 'triangle'), 160); break;
      case 'lose': playTone(330, 0.3, 'sawtooth'); setTimeout(() => playTone(220, 0.35, 'sawtooth'), 250); setTimeout(() => playTone(165, 0.5, 'sawtooth'), 500); break;
      case 'quest': playTone(784, 0.12); setTimeout(() => playTone(988, 0.12), 100); setTimeout(() => playTone(1175, 0.22), 200); break;
      case 'bird': playTone(1180, 0.08, 'sine'); setTimeout(() => playTone(1540, 0.09, 'sine'), 85); setTimeout(() => playTone(1320, 0.12, 'sine'), 170); break;
    }
  }

  // 区域环境音：风声底噪 + 每个区域不同的音调组合（见 REGION_BGM）
  let ambientNodes = null;
  let ambientRegionId = null;
  function currentBgmRegion() {
    if (Number.isInteger(session.currentRegionId)) return session.currentRegionId;
    return state.player.currentRegion || 0;
  }
  function startAmbient(regionId = currentBgmRegion()) {
    if (!audioCtx) return;
    stopAmbient();
    try {
      ensureAudioReady();
      const config = REGION_BGM[regionId] || REGION_BGM[0];
      // 创建风声（滤波噪声），中心频率随区域变化
      const noise = audioCtx.createBufferSource();
      const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = config.noise;
      noiseFilter.Q.value = 0.5;

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.03;

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);

      // 区域音调组合：多个振荡器叠加成轻柔的和弦
      const voices = config.tones.map(freq => {
        const osc = audioCtx.createOscillator();
        osc.type = config.type;
        osc.frequency.value = freq;
        const voiceGain = audioCtx.createGain();
        voiceGain.gain.value = 0.012;
        osc.connect(voiceGain);
        voiceGain.connect(audioCtx.destination);
        return osc;
      });

      // 低频振荡器调制第一个音调，让声音缓慢起伏
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = config.lfo;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 30;
      lfo.connect(lfoGain);
      if (voices[0]) lfoGain.connect(voices[0].frequency);

      noise.start();
      voices.forEach(osc => osc.start());
      lfo.start();

      ambientNodes = { noise, voices, lfo };
      ambientRegionId = regionId;
    } catch (e) {}
  }
  function stopAmbient() {
    if (!ambientNodes) return;
    try {
      ambientNodes.noise?.stop();
      ambientNodes.voices?.forEach(osc => osc.stop());
      ambientNodes.lfo?.stop();
    } catch (e) {}
    ambientNodes = null;
    ambientRegionId = null;
  }
  // 切换区域时换成该区域的环境音；BGM 关闭或未播放时不主动启动
  function setAmbientRegion(regionId) {
    if (!state.settings.bgm || !audioCtx || !ambientNodes) return;
    if (ambientRegionId === regionId) return;
    startAmbient(regionId);
  }

  // 持久化
  function saveGame() {
    try { localStorage.setItem('genshinMathSave', JSON.stringify(state)); } catch (e) {}
  }

  function cloneDefaultState() {
    return JSON.parse(JSON.stringify(defaultState));
  }

  function replaceState(nextState) {
    Object.keys(state).forEach(key => delete state[key]);
    Object.assign(state, nextState);
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function finiteNumber(value, fallback, min = -Infinity, max = Infinity) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function uniqueValues(values, predicate) {
    if (!Array.isArray(values)) return [];
    return [...new Set(values.filter(predicate))];
  }

  function normalizeState(rawState) {
    const normalized = cloneDefaultState();
    if (!isPlainObject(rawState)) return normalized;

    const rawPlayer = isPlainObject(rawState.player) ? rawState.player : {};
    const rawMap = isPlainObject(rawState.map) ? rawState.map : {};
    const rawAchievements = isPlainObject(rawState.achievements) ? rawState.achievements : {};
    const rawSettings = isPlainObject(rawState.settings) ? rawState.settings : {};
    const rawCosmetics = isPlainObject(rawState.cosmetics) ? rawState.cosmetics : {};
    const validLevelIds = new Set(LEVELS.flat().map(level => level.id));
    const validStoryIds = new Set(Object.keys(STORY_TRIGGERS));
    const validAreaIds = new Set(['forest-clearing', 'mountain-peak', 'desert-oasis', 'swamp-secret', 'star-meadow-secret', 'echo-cave-secret']);

    normalized.player.name = typeof rawPlayer.name === 'string' && rawPlayer.name.trim()
      ? rawPlayer.name.slice(0, 24)
      : defaultState.player.name;
    normalized.player.level = Math.floor(finiteNumber(rawPlayer.level, 1, 1, 100));
    normalized.player.exp = Math.floor(finiteNumber(rawPlayer.exp, 0, 0));
    normalized.player.maxHp = Math.floor(finiteNumber(rawPlayer.maxHp, 100, 1));
    normalized.player.hp = Math.floor(finiteNumber(rawPlayer.hp, normalized.player.maxHp, 0, normalized.player.maxHp));
    normalized.player.maxEnergy = Math.floor(finiteNumber(rawPlayer.maxEnergy, 100, 1));
    normalized.player.energy = Math.floor(finiteNumber(rawPlayer.energy, 0, 0, normalized.player.maxEnergy));
    normalized.player.gems = Math.floor(finiteNumber(rawPlayer.gems, 0, 0));
    normalized.player.answerStreak = Math.floor(finiteNumber(rawPlayer.answerStreak, 0, 0));
    normalized.player.burstsUsed = Math.floor(finiteNumber(rawPlayer.burstsUsed, 0, 0));
    normalized.player.reactionsTriggered = Math.floor(finiteNumber(rawPlayer.reactionsTriggered, 0, 0));
    normalized.player.unlockedRegions = uniqueValues(
      rawPlayer.unlockedRegions,
      value => Number.isInteger(value) && value >= 0 && value < REGIONS.length
    ).sort((a, b) => a - b);
    if (!normalized.player.unlockedRegions.includes(0)) normalized.player.unlockedRegions.unshift(0);
    normalized.player.completedLevels = uniqueValues(rawPlayer.completedLevels, value => validLevelIds.has(value));
    normalized.player.currentRegion = Number.isInteger(rawPlayer.currentRegion)
      && normalized.player.unlockedRegions.includes(rawPlayer.currentRegion)
      ? rawPlayer.currentRegion
      : normalized.player.unlockedRegions[normalized.player.unlockedRegions.length - 1];
    if (isPlainObject(rawPlayer.levelStars)) {
      Object.entries(rawPlayer.levelStars).forEach(([levelId, stars]) => {
        if (validLevelIds.has(levelId)) {
          normalized.player.levelStars[levelId] = Math.floor(finiteNumber(stars, 1, 1, 3));
        }
      });
    }

    normalized.map.collectedItems = uniqueValues(rawMap.collectedItems, Number.isInteger).filter(value => value >= 0);
    normalized.map.openedChests = uniqueValues(rawMap.openedChests, Number.isInteger).filter(value => value >= 0);
    normalized.map.activatedWaypoints = uniqueValues(
      rawMap.activatedWaypoints,
      value => Number.isInteger(value) && value >= 0 && value < (LAYOUT?.waypoints?.length ?? 16)
    );
    normalized.map.seenStories = uniqueValues(rawMap.seenStories, value => validStoryIds.has(value));
    normalized.map.discoveredAreas = uniqueValues(rawMap.discoveredAreas, value => validAreaIds.has(value));
    normalized.map.collectedMaterials = uniqueValues(rawMap.collectedMaterials, Number.isInteger).filter(value => value >= 0);
    const rawWorldChanges = isPlainObject(rawMap.worldChanges) ? rawMap.worldChanges : {};
    // 兼容 v2.x 存档：已经完成对应挑战的玩家不应在升级后看到世界倒退。
    normalized.map.worldChanges.windmillRestored = rawWorldChanges.windmillRestored === true
      || normalized.player.completedLevels.includes('0-0');
    normalized.map.worldChanges.windcoreLit = rawWorldChanges.windcoreLit === true
      || normalized.player.completedLevels.includes('0-1');
    normalized.map.worldChanges.windtowerLit = rawWorldChanges.windtowerLit === true
      || normalized.player.completedLevels.includes('0-2');
    normalized.map.worldChanges.bridgeOpened = rawWorldChanges.bridgeOpened === true
      || ['0-0', '0-1', '0-2', '0-3'].every(id => normalized.player.completedLevels.includes(id));
    normalized.map.worldChanges.stormCalmed = rawWorldChanges.stormCalmed === true
      || normalized.player.completedLevels.includes('0-4');
    normalized.map.worldChanges.starmillRestored = rawWorldChanges.starmillRestored === true;
    normalized.map.worldChanges.echoscaleRestored = rawWorldChanges.echoscaleRestored === true;

    Object.keys(defaultState.achievements).forEach(id => {
      normalized.achievements[id] = rawAchievements[id] === true;
    });
    const validPassives = new Set(SKILL_TREE.map(skill => skill.id));
    normalized.passives = uniqueValues(rawState.passives, value => validPassives.has(value));
    const rawQuests = isPlainObject(rawState.quests) ? rawState.quests : {};
    normalized.quests.daily = sanitizeQuestSet(rawQuests.daily, 'daily');
    normalized.quests.weekly = sanitizeQuestSet(rawQuests.weekly, 'weekly');
    normalized.settings.bgm = rawSettings.bgm === true;
    normalized.settings.sfx = rawSettings.sfx !== false;
    normalized.settings.largeText = rawSettings.largeText === true;
    normalized.settings.reducedMotion = rawSettings.reducedMotion === true;
    normalized.learning = Learning.normalizeLearning(rawState.learning);
    // NPC 委托状态：只保留合法 NPC 与合法状态
    const rawCommissions = isPlainObject(rawState.commissions) ? rawState.commissions : {};
    Object.keys(COMMISSIONS).forEach(npcId => {
      const status = rawCommissions[npcId];
      if (['active', 'claimed'].includes(status)) normalized.commissions[npcId] = status;
    });
    const validCosmetics = new Set(COSMETICS.map(item => item.id));
    normalized.cosmetics.owned = uniqueValues(rawCosmetics.owned, value => validCosmetics.has(value));
    if (!normalized.cosmetics.owned.includes('default')) normalized.cosmetics.owned.unshift('default');
    normalized.cosmetics.selected = normalized.cosmetics.owned.includes(rawCosmetics.selected)
      ? rawCosmetics.selected : 'default';

    // 背包与装备：旧存档没有这两个字段时给默认值，损坏字段丢弃
    const rawInventory = isPlainObject(rawState.inventory) ? rawState.inventory : {};
    const rawEquipment = isPlainObject(rawState.equipment) ? rawState.equipment : {};
    const validWeaponIds = new Set(WEAPONS.map(item => item.id));
    const validArmorIds = new Set(ARMORS.map(item => item.id));
    const validConsumableIds = new Set(CONSUMABLES.map(item => item.id));
    normalized.inventory.weapons = uniqueValues(rawInventory.weapons, value => validWeaponIds.has(value));
    if (!normalized.inventory.weapons.includes('wooden')) normalized.inventory.weapons.unshift('wooden');
    normalized.inventory.armors = uniqueValues(rawInventory.armors, value => validArmorIds.has(value));
    if (!normalized.inventory.armors.includes('cloth')) normalized.inventory.armors.unshift('cloth');
    const validActiveSkillIds = new Set(ACTIVE_SKILLS.map(item => item.id));
    normalized.inventory.activeSkills = uniqueValues(rawInventory.activeSkills, value => validActiveSkillIds.has(value));
    const rawConsumables = isPlainObject(rawInventory.consumables) ? rawInventory.consumables : {};
    Object.entries(rawConsumables).forEach(([id, count]) => {
      if (validConsumableIds.has(id)) {
        normalized.inventory.consumables[id] = Math.floor(finiteNumber(count, 0, 0, 99));
      }
    });
    normalized.equipment.weapon = normalized.inventory.weapons.includes(rawEquipment.weapon)
      ? rawEquipment.weapon : 'wooden';
    normalized.equipment.armor = normalized.inventory.armors.includes(rawEquipment.armor)
      ? rawEquipment.armor : 'cloth';

    // 材料：旧存档缺省时给 0，损坏字段丢弃
    const rawMaterials = isPlainObject(rawState.materials) ? rawState.materials : {};
    Object.keys(normalized.materials).forEach(id => {
      normalized.materials[id] = Math.floor(finiteNumber(rawMaterials[id], 0, 0, 99));
    });
    return normalized;
  }

  function loadGame() {
    let hasSave = false;
    try {
      const saved = localStorage.getItem('genshinMathSave');
      if (saved) {
        replaceState(normalizeState(JSON.parse(saved)));
        hasSave = true;
      }
    } catch (e) {
      console.warn('存档损坏，已使用安全的初始状态。', e);
      replaceState(cloneDefaultState());
    }
    return hasSave;
  }

  function resetSessionForNewGame() {
    if (session.mapLoopId) cancelAnimationFrame(session.mapLoopId);
    if (session.landmarkTimer) clearTimeout(session.landmarkTimer);
    if (session.dialogTimer) clearTimeout(session.dialogTimer);
    if (session.answerTimer) clearTimeout(session.answerTimer);
    Object.assign(session, {
      currentRegionId: null,
      currentLevel: null,
      currentQuestionIndex: 0,
      currentQuestions: null,
      enemyHp: 100,
      enemyMaxHp: 100,
      playerX: 4000,
      playerY: 2500,
      targetX: 4000,
      targetY: 2500,
      lastMapX: undefined,
      lastMapY: undefined,
      isMoving: false,
      moveMode: null,
      moveKeys: { w: false, a: false, s: false, d: false, arrowup: false, arrowdown: false, arrowleft: false, arrowright: false },
      velX: 0, velY: 0,
      joystick: { x: 0, y: 0, active: false },
      sprintKey: false,
      stamina: 100,
      currentRegionArea: null,
      shownRegionBanners: [],
      currentLandmark: null,
      currentWaypoint: null,
      mobileActionTarget: null,
      mapActive: false,
      bumpAt: 0,
      collectedItems: [],
      openedChests: [],
      activatedWaypoints: [],
      correctStreak: 0,
      wrongAnswers: 0,
      hintsUsed: 0,
      battleResolved: false,
      controlsLocked: false,
      storyInProgress: null,
      dialogQueue: [],
      dialogIndex: 0,
      dialogOnComplete: null,
      typing: false,
      dialogToken: session.dialogToken + 1,
      dialogTimer: null,
      diagnosticIndex: 0,
      diagnosticScore: 0,
      currentPuzzle: null,
      puzzlePrediction: null,
      missionPhase: null,
      missionInteraction: null,
      missionPredictionCorrect: false,
      missionExpressionAttempts: 0,
      missionExpressionCorrect: false,
      missionHintTier: 0,
      missionTransferAttempts: 0,
      missionPrimaryErrors: 0,
      missionErrorCount: 0,
      missionResumed: false,
      questionAttempts: [],
      questionHintTiers: [],
      independentCorrect: 0,
      transferFirstTry: false,
      transferHintTier: 0,
      answerTimer: null,
      lastElement: null,
      buffShield: false,
      buffDoubleEnergy: 0,
      streakGuardUsed: false,
      reviveUsed: false,
      weaponStrikeUsed: false,
      itemShield: false,
      enemyStunned: false,
      usedActiveSkills: [],
      bossShield: false,
      perfectStreak: 0,
      challengeActive: false,
      challengeDone: false,
      challengeQuestion: null,
      beamUntil: 0,
      beamCooldownUntil: 0,
      lastProgressAt: 0,
      currentMechanism: null,
      mechanism: null
    });
  }

  function resetGame() {
    replaceState(cloneDefaultState());
    resetSessionForNewGame();
    applyAccessibilityPreferences();
    saveGame();
    $$('.collectible').forEach(item => item.classList.remove('collected'));
    $$('.chest').forEach(chest => chest.classList.remove('opened'));
    $$('.material').forEach(item => item.classList.remove('collected'));
    $$('.hidden-area').forEach(area => area.classList.remove('discovered'));
    $$('.story-trigger').forEach(trigger => { trigger.dataset.triggered = 'false'; });
    ['settings-modal', 'achievements-modal', 'hint-modal', 'teleport-menu', 'learning-profile-modal', 'wardrobe-modal', 'skill-tree-modal', 'quests-modal', 'shop-modal', 'mechanism-panel', 'bigmap-modal'].forEach(id => {
      $('#' + id)?.classList.add('hidden');
    });
    updateMapHud();
  }

  // 屏幕切换
  function showScreen(id) {
    $$('.screen').forEach(el => {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
      el.inert = true;
    });
    const target = $('#' + id);
    if (target) {
      target.classList.add('active');
      target.setAttribute('aria-hidden', 'false');
      target.inert = false;
    }
  }

  function stopMapMovement() {
    Object.keys(session.moveKeys).forEach(key => { session.moveKeys[key] = false; });
    session.sprintKey = false;
    session.isMoving = false;
    session.moveMode = null;
    session.velX = 0;
    session.velY = 0;
    session.targetX = session.playerX;
    session.targetY = session.playerY;
  }

  function syncControlsLock() {
    const overlayIds = ['settings-modal', 'achievements-modal', 'hint-modal', 'teleport-menu', 'learning-profile-modal', 'wardrobe-modal', 'skill-tree-modal', 'quests-modal', 'shop-modal', 'mechanism-panel', 'bigmap-modal'];
    session.controlsLocked = overlayIds.some(id => !$('#' + id)?.classList.contains('hidden'));
    if (session.controlsLocked) stopMapMovement();
  }

  function updateContinueButton() {
    const button = $('#btn-continue');
    if (!button) return;
    button.disabled = !session.hasSave;
    button.title = session.hasSave ? '读取上次保存的旅程' : '还没有可继续的存档';
    button.classList.toggle('primary', session.hasSave);
    $('#btn-start')?.classList.toggle('primary', !session.hasSave);
  }

  // 初始化
  function init() {
    session.hasSave = loadGame();
    if (ensureQuests()) saveGame(); // 跨天/跨周打开游戏时刷新任务
    applyAccessibilityPreferences();
    applyInputHints();
    bindEvents();
    updateContinueButton();
    runLoading();
    trackEvent('session_start', { hasSave: session.hasSave, version: state.version });
    // 如果设置中开启了 BGM，启动环境音（需要用户交互后才能真正播放）
    if (state.settings.bgm) {
      document.body.addEventListener('click', function once() {
        startAmbient();
        document.body.removeEventListener('click', once);
      }, { once: true });
    }

    // 首次进入显示教程（非阻塞浮卡）
    if (!localStorage.getItem('genshinMathTutorialSeen')) {
      setTimeout(() => {
        $('#tutorial-card')?.classList.remove('hidden');
      }, 500);
    }

    // 健康检查：确认游戏正确加载
    setTimeout(() => {
      if (typeof startMapLoop !== 'function') {
        console.error('游戏加载异常：startMapLoop 未定义');
      }
      if (!document.querySelector('#player-sprite')) {
        console.error('游戏加载异常：主角元素不存在');
      }
    }, 1000);
  }

  // 输入设备提示切换：触屏和键鼠显示不同的操作引导
  function applyInputHints() {
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const hint = $('.control-hint');
    if (hint) {
      hint.innerHTML = isTouch
        ? '<strong>探索方式</strong><span>摇杆拖动 / 点击地图 / 点「交互」按钮</span>'
        : '<strong>探索方式</strong><span>WASD / 方向键 / 点击地图 · M 地图 · V 视野</span>';
    }
    const tutorialItems = isTouch
      ? ['👆 摇杆拖动 移动', '🖐️ 点击地图 自动寻路', '🔘 点「交互」 修机关/对话', '✨ 靠近发光区域 触发剧情', '💎 收集水晶材料 换钻石']
      : ['⌨️ WASD / 方向键 移动', '🖱️ 点击地图 自动寻路', '🗺️ M 打开探险地图 · V 数学视野', '🏛️ 靠近地标 点击“进入”挑战', '💎 收集水晶材料 换钻石'];
    const body = $('#tutorial-card .tutorial-body');
    if (body) {
      body.innerHTML = tutorialItems.map(text => `<div class="tutorial-item">${text}</div>`).join('');
    }
  }

  // 加载动画
  function runLoading() {
    const bar = $('.loading-progress');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        // 加载完成后进入主菜单，让“开始”和“继续”语义明确。
        setTimeout(() => {
          showScreen('main-menu');
        }, 400);
      }
      if (bar) bar.style.width = p + '%';
    }, 200);
  }

  function startDiagnostic() {
    session.mapActive = false;
    session.diagnosticIndex = 0;
    session.diagnosticScore = 0;
    $('#diagnostic-result').classList.add('hidden');
    $('#diagnostic-question').classList.remove('hidden');
    $('#diagnostic-options').classList.remove('hidden');
    $('#diagnostic-progress').classList.remove('hidden');
    $('#btn-diagnostic-skip').classList.remove('hidden');
    showScreen('diagnostic-screen');
    renderDiagnosticQuestion();
    trackEvent('diagnostic_start');
  }

  function renderDiagnosticQuestion() {
    const question = Learning.DIAGNOSTIC_QUESTIONS[session.diagnosticIndex];
    if (!question) {
      finishDiagnostic();
      return;
    }
    $('#diagnostic-progress').textContent = `第 ${session.diagnosticIndex + 1} / ${Learning.DIAGNOSTIC_QUESTIONS.length} 题`;
    $('#diagnostic-question').textContent = question.text;
    const area = $('#diagnostic-options');
    area.innerHTML = '';
    question.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'diagnostic-option';
      button.textContent = option;
      button.addEventListener('click', () => {
        const correct = String(option) === String(question.answer);
        if (correct) session.diagnosticScore++;
        trackEvent('diagnostic_answer', { id: question.id, correct });
        session.diagnosticIndex++;
        renderDiagnosticQuestion();
      });
      area.appendChild(button);
    });
  }

  function finishDiagnostic() {
    const suggested = Learning.recommendRegion(session.diagnosticScore);
    session.diagnosticSuggestedRegion = suggested;
    $('#diagnostic-question').classList.add('hidden');
    $('#diagnostic-options').classList.add('hidden');
    $('#diagnostic-progress').classList.add('hidden');
    $('#btn-diagnostic-skip').classList.add('hidden');
    $('#diagnostic-result').classList.remove('hidden');
    $('#diagnostic-result-title').textContent = `建议从「${REGIONS[suggested].name}」附近开始`;
    $('#diagnostic-result-text').textContent = session.diagnosticScore === 3
      ? '你对基础关系很熟悉，可以从代数思维附近出发；风语原仍可随时回来体验。'
      : session.diagnosticScore === 2
        ? '你的基础运算较稳定，建议从测量与单位附近开始，同时保留前面区域作为复习支线。'
        : '先从风语原建立清楚的数量图像最合适。这只是路线建议，不是能力标签。';
    trackEvent('diagnostic_complete', { score: session.diagnosticScore, suggestedRegion: suggested });
  }

  function completeDiagnostic(startRegion) {
    const safeRegion = [0, 2, 4].includes(startRegion) ? startRegion : 0;
    const suggestedRegion = [0, 2, 4].includes(session.diagnosticSuggestedRegion)
      ? session.diagnosticSuggestedRegion
      : Learning.recommendRegion(session.diagnosticScore);
    state.learning.diagnosticDone = true;
    state.learning.diagnosticScore = session.diagnosticScore;
    state.learning.suggestedRegion = suggestedRegion;
    state.learning.chosenStartRegion = safeRegion;
    state.player.unlockedRegions = Array.from({ length: safeRegion + 1 }, (_, index) => index);
    state.player.currentRegion = safeRegion;
    const landmark = $(`#landmark-${safeRegion}`);
    if (landmark) {
      session.lastMapX = parseInt(landmark.style.left);
      // 落点要看得见目标，但不能压在地标/剧情触发圈里，否则刚进地图就被夺走控制权。
      session.lastMapY = Math.min(WORLD.H - 60, parseInt(landmark.style.top) + 220);
    }
    saveGame();
    showScreen('world-map');
    renderMap();
    trackEvent('journey_start', { startRegion: safeRegion });
  }

  // 事件绑定
  function focusWorldMap() {
    const mapScreen = $('#world-map');
    if (!mapScreen) return;
    try { mapScreen.focus({ preventScroll: true }); } catch (e) { mapScreen.focus(); }
  }

  function bindEvents() {
    document.body.addEventListener('pointerdown', ensureAudioReady, { once: true });
    $('#btn-start').addEventListener('click', () => {
      sfx('click');
      if (session.hasSave && !confirm('开始新冒险会覆盖当前进度，确定继续吗？')) return;
      resetGame();
      session.hasSave = true;
      updateContinueButton();
      startDiagnostic();
    });
    $('#btn-continue').addEventListener('click', () => {
      if (!session.hasSave) return;
      sfx('click');
      showScreen('world-map');
      renderMap();
      trackEvent('continue_game', { region: state.player.currentRegion });
    });
    $('#btn-settings').addEventListener('click', () => { sfx('click'); openSettings(); });
    $('#btn-achievements').addEventListener('click', () => { sfx('click'); openAchievements(); });
    $('#btn-close-achievements').addEventListener('click', closeAchievements);
    $('#achievements-overlay').addEventListener('click', closeAchievements);
    $('#btn-close-settings').addEventListener('click', closeSettings);
    $('#settings-overlay').addEventListener('click', closeSettings);
    $('#btn-reset').addEventListener('click', () => {
      if (confirm('确定要重置所有进度吗？')) {
        resetGame();
        session.hasSave = true;
        updateContinueButton();
        updateSettingsUI();
        startDiagnostic();
      }
    });
    $('#toggle-bgm').addEventListener('click', toggleBgm);
    $('#toggle-sfx').addEventListener('click', toggleSfx);
    $('#toggle-large-text').addEventListener('click', toggleLargeText);
    $('#toggle-reduced-motion').addEventListener('click', toggleReducedMotion);
    $('#btn-map-back').addEventListener('click', () => {
      sfx('click'); session.mapActive = false; showScreen('main-menu'); trackEvent('return_menu');
    });
    $('#btn-diagnostic-skip').addEventListener('click', () => completeDiagnostic(0));
    $('#btn-diagnostic-wind').addEventListener('click', () => completeDiagnostic(0));
    $('#btn-diagnostic-suggested').addEventListener('click', () => completeDiagnostic(session.diagnosticSuggestedRegion));
    $('#btn-learning-profile').addEventListener('click', openLearningProfile);
    $('#btn-close-learning-profile').addEventListener('click', closeLearningProfile);
    $('#learning-profile-overlay').addEventListener('click', closeLearningProfile);
    $('#btn-wardrobe').addEventListener('click', openWardrobe);
    $('#btn-shop').addEventListener('click', () => { sfx('click'); openShop('weapons'); });
    $('#btn-map-shop').addEventListener('click', () => { sfx('click'); openShop('weapons'); });
    $('#btn-bigmap')?.addEventListener('click', () => { sfx('click'); openBigmap(); });
    $('#btn-math-vision')?.addEventListener('click', () => { sfx('click'); useMathVision(); });
    $('#btn-close-bigmap')?.addEventListener('click', closeBigmap);
    $('#bigmap-overlay')?.addEventListener('click', closeBigmap);
    $('#bigmap-canvas')?.addEventListener('click', handleBigmapClick);
    $('#btn-close-shop').addEventListener('click', closeShop);
    $('#shop-overlay').addEventListener('click', closeShop);
    $$('.shop-tab').forEach(btn => {
      btn.addEventListener('click', () => { sfx('click'); shopActiveTab = btn.dataset.shopTab; renderShop(); });
    });
    $('#btn-close-wardrobe').addEventListener('click', closeWardrobe);
    $('#wardrobe-overlay').addEventListener('click', closeWardrobe);
    $('#btn-skill-tree').addEventListener('click', () => { sfx('click'); openSkillTree(); });
    $('#btn-close-skill-tree').addEventListener('click', closeSkillTree);
    $('#skill-tree-overlay').addEventListener('click', closeSkillTree);
    $('#btn-quests').addEventListener('click', () => { sfx('click'); openQuests(); });
    $('#btn-map-quests').addEventListener('click', () => { sfx('click'); openQuests(); });
    $('#btn-close-quests').addEventListener('click', closeQuests);
    $('#quests-overlay').addEventListener('click', closeQuests);
    $('#btn-map-achievements').addEventListener('click', () => { sfx('click'); openAchievements(); });
    $('#btn-map-settings').addEventListener('click', () => { sfx('click'); openSettings(); });
    $('#btn-detail-back').addEventListener('click', () => { sfx('click'); returnToWorldMap(); });
    $('#btn-reward-continue').addEventListener('click', () => {
      sfx('click');
      if (session.currentRegionId !== null) {
        showRegionDetail(session.currentRegionId);
      } else {
        showScreen('world-map'); renderMap();
      }
    });
    $('#btn-reward-map').addEventListener('click', () => {
      sfx('click');
      returnToWorldMap();
    });
    $('#hint-overlay').addEventListener('click', closeHint);
    $('#btn-close-hint').addEventListener('click', closeHint);
    $$('[data-hint-tier]').forEach(button => {
      button.addEventListener('click', () => useTieredHint(Number(button.dataset.hintTier)));
    });
    $$('[data-mission-hint-tier]').forEach(button => {
      button.addEventListener('click', () => useMissionHint(Number(button.dataset.missionHintTier)));
    });
    $('#btn-puzzle-check').addEventListener('click', checkMissionInteraction);
    $('#btn-puzzle-continue').addEventListener('click', advanceLearningMission);
    $('#btn-puzzle-exit').addEventListener('click', () => leaveChallenge('puzzle'));
    $('#btn-skip-prediction').addEventListener('click', skipMissionPrediction);
    $('#btn-battle-exit').addEventListener('click', () => leaveChallenge('battle'));

    // 开放世界：点击地图移动（兼容触屏）
    function handleMapClick(e) {
      if (!session.mapActive || session.controlsLocked) return;
      if (e.target.closest('.landmark, .waypoint, .npc, .map-header, .region-enter-prompt, .virtual-joystick, .mobile-action-btn, .map-controls')) return;
      focusWorldMap();
      const rect = $('#world-canvas').getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      session.targetX = x;
      session.targetY = y;
      session.isMoving = true;
      session.moveMode = 'target';
    }
    $('#open-world').addEventListener('click', handleMapClick);
    $('#open-world').addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        handleMapClick(e.touches[0]);
      }
    }, { passive: true });

    // 开放世界：键盘移动。优先使用物理键码，避免输入法或键盘布局改变 e.key。
    const moveKeyByCode = {
      KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd',
      ArrowUp: 'arrowup', ArrowDown: 'arrowdown', ArrowLeft: 'arrowleft', ArrowRight: 'arrowright'
    };
    function getMoveKey(e) {
      if (moveKeyByCode[e.code]) return moveKeyByCode[e.code];
      const key = String(e.key || '').toLowerCase();
      return Object.prototype.hasOwnProperty.call(session.moveKeys, key) ? key : null;
    }
    function stopKeyboardMovement() { stopMapMovement(); }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') session.sprintKey = true;
      if (!session.mapActive || session.controlsLocked) return;
      const key = getMoveKey(e);
      if (key) {
        e.preventDefault();
        session.moveKeys[key] = true;
        session.isMoving = true;
        session.moveMode = 'keyboard';
      }
      const actionKey = String(e.key || '').toLowerCase();
      if (actionKey === 'm' && session.mapActive && !session.controlsLocked) {
        e.preventDefault();
        openBigmap();
        return;
      }
      if (actionKey === 'v' && session.mapActive && !session.controlsLocked) {
        e.preventDefault();
        useMathVision();
        return;
      }
      if (actionKey === 'enter' || actionKey === ' ') {
        if (!session.enterPromptHidden && session.currentLandmark !== null) {
          e.preventDefault();
          tryEnterRegion(session.currentLandmark);
        } else if (session.currentMechanism) {
          e.preventDefault();
          openMechanism(session.currentMechanism);
        }
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') session.sprintKey = false;
      const key = getMoveKey(e);
      if (key) {
        if (session.mapActive) e.preventDefault();
        session.moveKeys[key] = false;
        const anyMoveKeyPressed = Object.values(session.moveKeys).some(Boolean);
        if (!anyMoveKeyPressed && session.moveMode === 'keyboard') {
          // 松手不立即停：moveMode 清空后由 updateMovement 的滑行衰减收尾
          session.moveMode = null;
        }
      }
    });
    window.addEventListener('blur', stopKeyboardMovement);

    // 触屏方向盘：按住移动，松手即停；它和键盘共用同一套世界状态机。
    $$('[data-map-move]').forEach(button => {
      const moveKey = button.dataset.mapMove;
      const stop = () => {
        session.moveKeys[moveKey] = false;
        button.classList.remove('pressed');
        if (session.moveMode === 'dpad' && !Object.values(session.moveKeys).some(Boolean)) {
          // 松手滑行收尾，不立即停
          session.moveMode = null;
        }
      };
      button.addEventListener('pointerdown', event => {
        if (!session.mapActive || session.controlsLocked) return;
        event.preventDefault();
        focusWorldMap();
        session.moveKeys[moveKey] = true;
        session.isMoving = true;
        session.moveMode = 'dpad';
        button.classList.add('pressed');
        try { button.setPointerCapture(event.pointerId); } catch (error) {}
      });
      button.addEventListener('pointerup', stop);
      button.addEventListener('pointercancel', stop);
      button.addEventListener('lostpointercapture', stop);
    });

    // 虚拟摇杆：拖动控制移动，松手复位
    // 关键：阻止事件冒泡到地图，防止按摇杆变成“点击地图自动寻路”。
    (function setupJoystick() {
      const joystick = $('#virtual-joystick');
      const stick = $('#joystick-stick');
      if (!joystick || !stick) return;

      const maxRadius = 34; // 摇杆最大偏移（像素）
      let dragging = false;
      let centerX = 0;
      let centerY = 0;
      let currentPointerId = null;

      function resetStick() {
        dragging = false;
        currentPointerId = null;
        session.joystick.active = false;
        session.joystick.x = 0;
        session.joystick.y = 0;
        stick.style.transform = 'translate(0px, 0px)';
        joystick.classList.remove('active');
      }

      function updateStick(clientX, clientY) {
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist > maxRadius) {
          dx = (dx / dist) * maxRadius;
          dy = (dy / dist) * maxRadius;
        }
        stick.style.transform = `translate(${dx}px, ${dy}px)`;
        session.joystick.x = dx / maxRadius;
        session.joystick.y = dy / maxRadius;
        session.joystick.active = dist > 2;
      }

      function startJoystick(clientX, clientY) {
        if (!session.mapActive || session.controlsLocked) return;
        dragging = true;
        // 开始使用摇杆时，立即取消之前的点击目标，防止摇杆和自动寻路冲突
        session.targetX = session.playerX;
        session.targetY = session.playerY;
        session.isMoving = false;
        session.moveMode = null;
        const rect = joystick.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
        joystick.classList.add('active');
        updateStick(clientX, clientY);
      }

      function moveJoystick(clientX, clientY) {
        if (!dragging) return;
        updateStick(clientX, clientY);
      }

      function endJoystick() {
        if (!dragging) return;
        resetStick();
      }

      // Pointer Events（现代浏览器主路径）
      function onPointerDown(event) {
        if (!session.mapActive || session.controlsLocked) return;
        event.preventDefault();
        event.stopPropagation();
        currentPointerId = event.pointerId;
        try { joystick.setPointerCapture(event.pointerId); } catch (e) {}
        startJoystick(event.clientX, event.clientY);
      }

      function onPointerMove(event) {
        if (!dragging || event.pointerId !== currentPointerId) return;
        event.preventDefault();
        event.stopPropagation();
        moveJoystick(event.clientX, event.clientY);
      }

      function onPointerUp(event) {
        if (!dragging || event.pointerId !== currentPointerId) return;
        event.preventDefault();
        event.stopPropagation();
        endJoystick();
      }

      joystick.addEventListener('pointerdown', onPointerDown);
      joystick.addEventListener('pointermove', onPointerMove);
      joystick.addEventListener('pointerup', onPointerUp);
      joystick.addEventListener('pointercancel', onPointerUp);
      joystick.addEventListener('lostpointercapture', onPointerUp);

      // 安全网：某些浏览器 pointer capture 丢失后没有正确触发 pointerup，
      // 在 window 层面再监听一次同 id 的 pointerup。
      window.addEventListener('pointerup', event => {
        if (dragging && event.pointerId === currentPointerId) endJoystick();
      }, { passive: false });
      window.addEventListener('pointercancel', event => {
        if (dragging && event.pointerId === currentPointerId) endJoystick();
      }, { passive: false });

      // Touch Events 兜底（兼容旧版 Safari 或 pointer events 异常时）
      joystick.addEventListener('touchstart', event => {
        if (!session.mapActive || session.controlsLocked) return;
        event.preventDefault();
        event.stopPropagation();
        if (event.touches.length > 0) {
          const t = event.touches[0];
          currentPointerId = 'touch-' + t.identifier;
          startJoystick(t.clientX, t.clientY);
        }
      }, { passive: false });

      joystick.addEventListener('touchmove', event => {
        if (!dragging) return;
        event.preventDefault();
        event.stopPropagation();
        const t = event.changedTouches[0];
        if (t && currentPointerId === 'touch-' + t.identifier) {
          moveJoystick(t.clientX, t.clientY);
        }
      }, { passive: false });

      function onTouchEnd(event) {
        if (!dragging) return;
        event.preventDefault();
        event.stopPropagation();
        const t = event.changedTouches[0];
        if (!t || currentPointerId === 'touch-' + t.identifier) {
          endJoystick();
        }
      }
      joystick.addEventListener('touchend', onTouchEnd, { passive: false });
      joystick.addEventListener('touchcancel', onTouchEnd, { passive: false });
    })();

    // 移动端交互按钮：靠近可交互目标时高亮，点击触发对应操作
    (function setupMobileAction() {
      const btn = $('#mobile-action-btn');
      if (!btn) return;
      function handleStart(event) {
        event.preventDefault();
        event.stopPropagation();
        btn.style.transform = 'scale(0.94)';
      }
      function handleEnd(event) {
        event.preventDefault();
        event.stopPropagation();
        btn.style.transform = 'scale(1)';
        triggerMobileAction();
      }
      function handleCancel() {
        btn.style.transform = 'scale(1)';
      }
      btn.addEventListener('pointerdown', handleStart);
      btn.addEventListener('pointerup', handleEnd);
      btn.addEventListener('pointercancel', handleCancel);
      btn.addEventListener('lostpointercapture', handleCancel);
      btn.addEventListener('touchstart', event => {
        event.preventDefault();
        event.stopPropagation();
      }, { passive: false });
      btn.addEventListener('touchend', event => {
        event.preventDefault();
        event.stopPropagation();
        triggerMobileAction();
      }, { passive: false });
    })();

    // 进入区域按钮
    $('#btn-enter-region').addEventListener('click', () => {
      if (session.currentLandmark !== null) {
        tryEnterRegion(session.currentLandmark);
      }
    });
    // 关卡列表（复习入口）：任何时候都能打开
    $('#btn-review-levels')?.addEventListener('click', () => {
      if (session.currentLandmark !== null) {
        sfx('click');
        session.lastMapX = session.playerX;
        session.lastMapY = session.playerY;
        session.mapActive = false;
        $('#region-enter-prompt').classList.add('hidden');
        showRegionDetail(session.currentLandmark);
      }
    });

    // 教程关闭
    $('#btn-close-tutorial').addEventListener('click', () => {
      $('#tutorial-card').classList.add('hidden');
      localStorage.setItem('genshinMathTutorialSeen', '1');
      focusWorldMap();
    });

    // 传送点激活按钮
    $('#btn-activate-waypoint').addEventListener('click', () => {
      if (session.currentWaypoint !== null) {
        activateWaypoint(session.currentWaypoint);
      }
    });

    // 传送菜单关闭
    $('#btn-close-teleport').addEventListener('click', () => {
      $('#teleport-menu').classList.add('hidden');
      syncControlsLock();
    });

    // 点击传送点打开传送菜单
    $$('.waypoint').forEach(wp => {
      wp.addEventListener('click', (e) => {
        e.stopPropagation();
        const wid = parseInt(wp.dataset.waypoint);
        if (session.activatedWaypoints.includes(wid)) {
          showTeleportMenu();
        } else if (session.currentWaypoint === wid) {
          activateWaypoint(wid);
        }
      });
    });

    // NPC 点击对话
    $$('.npc').forEach(npcEl => {
      npcEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const npcId = parseInt(npcEl.dataset.npc);
        startNpcDialog(npcId);
      });
    });

    // 对话点击继续
    $('#dialog-screen').addEventListener('click', (e) => {
      if (e.target.closest('.dialog-choice')) return;
      if (e.target.closest('#btn-dialog-skip')) return;
      if (session.typing) {
        // 跳过打字
        finishTypingImmediately();
        return;
      }
      advanceDialog();
    });
    // 一键跳过整段对话
    $('#btn-dialog-skip')?.addEventListener('click', (e) => {
      e.stopPropagation();
      sfx('click');
      trackEvent('dialog_skip', { remaining: session.dialogQueue.length - session.dialogIndex });
      completeDialog();
    });

    // 技能按钮
    $$('.skill-btn').forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (btn.id === 'burst-btn') {
          useBurst();
        } else {
          useSkill(idx);
        }
      });
    });

    // 战斗道具与武器技能
    $('#weapon-strike-btn')?.addEventListener('click', useWeaponStrike);
    $('#use-potion-btn')?.addEventListener('click', () => useConsumable('potion'));
    $('#use-shield-btn')?.addEventListener('click', () => useConsumable('shield'));
    $('#use-scroll-btn')?.addEventListener('click', () => useConsumable('scroll'));
    ACTIVE_SKILLS.forEach(skill => {
      $(`#active-skill-${skill.id}`)?.addEventListener('click', () => useActiveSkill(skill.id));
    });

    // 填充式机关：面板按钮与风车实体点击
    $('#estimate-minus')?.addEventListener('click', () => {
      const m = session.mechanism;
      if (!m) return;
      m.estimateValue = Math.max(1, (m.estimateValue || 5) - 1);
      $('#estimate-value').textContent = String(m.estimateValue);
      sfx('click');
    });
    $('#estimate-plus')?.addEventListener('click', () => {
      const m = session.mechanism;
      if (!m) return;
      m.estimateValue = Math.min(20, (m.estimateValue || 5) + 1);
      $('#estimate-value').textContent = String(m.estimateValue);
      sfx('click');
    });
    $('#btn-estimate-commit')?.addEventListener('click', commitEstimate);
    $('#btn-mechanism-close')?.addEventListener('click', closeMechanism);
    // 机关实体点击：近处直接开面板，远处自动寻路（原神式点击移动）
    Object.values(MECHANISMS).forEach(mech => {
      document.getElementById(mech.elementId)?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!session.mapActive || session.controlsLocked) return;
        if (session.currentMechanism === mech.id) {
          openMechanism(mech.id);
        } else {
          // 注意顺序：showHint 会短暂锁控制并重置移动目标，必须先提示再设寻路
          showHint(`正在走向${mech.title}…`, 1500);
          session.targetX = mech.x;
          session.targetY = mech.y + 140;
          session.isMoving = true;
          session.moveMode = 'target';
        }
      });
    });
  }

  // 设置
  function openSettings() {
    $('#settings-modal').classList.remove('hidden');
    syncControlsLock();
    updateSettingsUI();
  }
  function closeSettings() {
    $('#settings-modal').classList.add('hidden');
    syncControlsLock();
  }
  function updateSettingsUI() {
    $('#toggle-bgm').textContent = state.settings.bgm ? 'ON' : 'OFF';
    $('#toggle-sfx').textContent = state.settings.sfx ? 'ON' : 'OFF';
    $('#toggle-large-text').textContent = state.settings.largeText ? 'ON' : 'OFF';
    $('#toggle-reduced-motion').textContent = state.settings.reducedMotion ? 'ON' : 'OFF';
    $('#toggle-large-text').setAttribute('aria-pressed', String(state.settings.largeText));
    $('#toggle-reduced-motion').setAttribute('aria-pressed', String(state.settings.reducedMotion));
  }
  function applyAccessibilityPreferences() {
    document.documentElement.classList.toggle('large-text', state.settings.largeText === true);
    document.documentElement.classList.toggle('reduced-motion', state.settings.reducedMotion === true);
  }
  function toggleBgm() {
    state.settings.bgm = !state.settings.bgm;
    if (state.settings.bgm) {
      startAmbient();
    } else {
      stopAmbient();
    }
    updateSettingsUI(); saveGame();
  }
  function toggleSfx() {
    state.settings.sfx = !state.settings.sfx;
    updateSettingsUI(); saveGame();
  }
  function toggleLargeText() {
    state.settings.largeText = !state.settings.largeText;
    applyAccessibilityPreferences();
    updateSettingsUI();
    saveGame();
  }
  function toggleReducedMotion() {
    state.settings.reducedMotion = !state.settings.reducedMotion;
    applyAccessibilityPreferences();
    updateSettingsUI();
    saveGame();
  }

  function openLearningProfile() {
    const learning = Learning.normalizeLearning(state.learning);
    const evidence = Learning.summarizeEvidence(learning);
    const nextPractice = evidence.latestError?.recovery
      || '任选一个已完成任务，先不看提示，用不同物体重新讲一遍数量关系。';
    $('#learning-profile-summary').innerHTML = `
      <div class="learning-summary-card">
        <strong>${learning.diagnosticDone ? `建议起点：${REGIONS[learning.suggestedRegion].name} · 实际起点：${REGIONS[learning.chosenStartRegion].name}` : '尚未完成能力观察'}</strong><br>
        学习证据 ${evidence.evidenceCount} 条 · 独立完成 ${evidence.independent} 次 · 迁移成功 ${evidence.transfer} 次<br>
        能讲清 ${evidence.explanations} 次 · 从错误中恢复 ${evidence.recovered} 次<br>
        <span class="next-practice"><strong>下一次 5 分钟：</strong>${nextPractice}</span><br>
        这里只显示可行动的练习线索，不给学习者贴能力标签。
      </div>
    `;

    const masteryList = $('#mastery-list');
    masteryList.innerHTML = '<h4>方法掌握度</h4>';
    ELEMENTS.forEach(element => {
      const mastery = learning.mastery[element.id] || { attempts: 0, score: 0 };
      const row = document.createElement('div');
      row.className = 'mastery-row';
      row.innerHTML = `
        <div class="mastery-row-head"><span>${element.emoji} ${element.name}</span><span>${Math.round(mastery.score)} / 100 · 独立 ${mastery.independent || 0} · 迁移 ${mastery.transfer || 0}</span></div>
        <div class="mastery-track"><div class="mastery-fill" style="width:${mastery.score}%"></div></div>
      `;
      masteryList.appendChild(row);
    });

    const misconceptionList = $('#misconception-list');
    misconceptionList.innerHTML = '<h4>值得重新观察的图像</h4>';
    const entries = Object.entries(learning.misconceptions).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      misconceptionList.innerHTML += '<div class="misconception-item">还没有稳定出现的错因。继续尝试即可。</div>';
    } else {
      entries.slice(0, 4).forEach(([id, count]) => {
        const definition = Object.values(Learning.MISCONCEPTIONS).find(item => item.id === id);
        if (!definition) return;
        misconceptionList.innerHTML += `<div class="misconception-item"><strong>${definition.label}</strong> · ${count} 次<br>${definition.recovery}</div>`;
      });
    }
    $('#learning-profile-modal').classList.remove('hidden');
    syncControlsLock();
    trackEvent('learning_profile_open');
  }

  function closeLearningProfile() {
    $('#learning-profile-modal').classList.add('hidden');
    syncControlsLock();
  }

  function applySelectedCosmetic() {
    const trail = $('#player-trail');
    if (!trail) return;
    COSMETICS.forEach(item => {
      if (item.className) trail.classList.remove(item.className);
    });
    const selected = COSMETICS.find(item => item.id === state.cosmetics.selected);
    if (selected?.className) trail.classList.add(selected.className);
  }

  function openWardrobe() {
    const list = $('#wardrobe-list');
    list.innerHTML = '';
    COSMETICS.forEach(cosmetic => {
      const owned = state.cosmetics.owned.includes(cosmetic.id);
      const selected = state.cosmetics.selected === cosmetic.id;
      const item = document.createElement('div');
      item.className = 'wardrobe-item';
      item.innerHTML = `
        <div class="wardrobe-preview">${cosmetic.emoji}</div>
        <div class="wardrobe-name">${cosmetic.name}</div>
        <div class="wardrobe-cost">${owned ? '已拥有' : `${cosmetic.cost} 💎`}</div>
      `;
      const button = document.createElement('button');
      button.className = 'genshin-btn small';
      button.textContent = selected ? '使用中' : (owned ? '使用' : '解锁');
      button.disabled = selected;
      button.addEventListener('click', () => {
        if (!owned) {
          if (state.player.gems < cosmetic.cost) {
            showHint(`还需要 ${cosmetic.cost - state.player.gems} 钻石。装扮不会影响能力或战斗。`);
            return;
          }
          state.player.gems -= cosmetic.cost;
          state.cosmetics.owned.push(cosmetic.id);
          trackEvent('cosmetic_unlock', { id: cosmetic.id, cost: cosmetic.cost });
        }
        state.cosmetics.selected = cosmetic.id;
        applySelectedCosmetic();
        updateMapHud();
        saveGame();
        openWardrobe();
        trackEvent('cosmetic_select', { id: cosmetic.id });
      });
      item.appendChild(button);
      list.appendChild(item);
    });
    $('#wardrobe-modal').classList.remove('hidden');
    syncControlsLock();
  }

  function closeWardrobe() {
    $('#wardrobe-modal').classList.add('hidden');
    syncControlsLock();
  }

  // ========== 商店：武器与道具 ==========
  let shopActiveTab = 'weapons';

  function openShop(tab = shopActiveTab) {
    shopActiveTab = tab;
    renderShop();
    $('#shop-modal').classList.remove('hidden');
    syncControlsLock();
    trackEvent('shop_open', { tab });
  }

  function closeShop() {
    $('#shop-modal').classList.add('hidden');
    syncControlsLock();
  }

  function renderShop() {
    $('#shop-gems').textContent = state.player.gems;
    $$('.shop-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.shopTab === shopActiveTab));
    const list = $('#shop-list');
    list.innerHTML = '';

    if (shopActiveTab === 'weapons' || shopActiveTab === 'armor') {
      const isWeapon = shopActiveTab === 'weapons';
      const items = isWeapon ? WEAPONS : ARMORS;
      items.forEach(gear => {
        const ownedList = isWeapon ? state.inventory.weapons : state.inventory.armors;
        const equippedId = isWeapon ? state.equipment.weapon : state.equipment.armor;
        const owned = ownedList.includes(gear.id);
        const equipped = equippedId === gear.id;
        const item = document.createElement('div');
        item.className = 'shop-item' + (equipped ? ' equipped' : '');
        item.innerHTML = `
          <div class="shop-item-icon">${gear.emoji}</div>
          <div class="shop-item-name">${gear.name}</div>
          <div class="shop-item-desc">${gear.desc}</div>
          <div class="shop-item-stat">${isWeapon ? `⚔️ 攻击 +${gear.attackBonus}` : `🛡️ 防御 +${gear.defenseBonus}`}</div>
        `;
        const button = document.createElement('button');
        button.className = 'genshin-btn small' + (equipped ? ' primary' : '');
        button.textContent = equipped ? '使用中' : (owned ? '装备' : `购买 ${gear.cost} 💎`);
        button.disabled = equipped || (!owned && state.player.gems < gear.cost);
        button.addEventListener('click', () => {
          if (!owned) {
            if (state.player.gems < gear.cost) {
              showHint(`还需要 ${gear.cost - state.player.gems} 钻石才能购买「${gear.name}」。`);
              return;
            }
            state.player.gems -= gear.cost;
            ownedList.push(gear.id);
            sfx('collect');
            showHint(`${gear.emoji} 购入「${gear.name}」！已自动装备。`);
            trackEvent(isWeapon ? 'shop_buy_weapon' : 'shop_buy_armor', { id: gear.id, cost: gear.cost });
          } else {
            sfx('click');
          }
          if (isWeapon) state.equipment.weapon = gear.id;
          else state.equipment.armor = gear.id;
          updateMapHud();
          saveGame();
          renderShop();
        });
        item.appendChild(button);
        list.appendChild(item);
      });
    } else if (shopActiveTab === 'skills') {
      ACTIVE_SKILLS.forEach(skill => {
        const owned = state.inventory.activeSkills.includes(skill.id);
        const item = document.createElement('div');
        item.className = 'shop-item' + (owned ? ' equipped' : '');
        item.innerHTML = `
          <div class="shop-item-icon">${skill.emoji}</div>
          <div class="shop-item-name">${skill.name}</div>
          <div class="shop-item-desc">${skill.desc}</div>
          <div class="shop-item-stat">每场战斗限用 1 次</div>
        `;
        const button = document.createElement('button');
        button.className = 'genshin-btn small' + (owned ? ' primary' : '');
        button.textContent = owned ? '已学会' : `学习 ${skill.cost} 💎`;
        button.disabled = owned || state.player.gems < skill.cost;
        button.addEventListener('click', () => {
          if (state.player.gems < skill.cost) {
            showHint(`还需要 ${skill.cost - state.player.gems} 钻石才能学习「${skill.name}」。`);
            return;
          }
          state.player.gems -= skill.cost;
          state.inventory.activeSkills.push(skill.id);
          sfx('collect');
          showHint(`${skill.emoji} 学会「${skill.name}」！战斗中可以使用。`);
          trackEvent('shop_buy_skill', { id: skill.id, cost: skill.cost });
          updateMapHud();
          saveGame();
          renderShop();
        });
        item.appendChild(button);
        list.appendChild(item);
      });
    } else if (shopActiveTab === 'exchange') {
      MATERIAL_INFO.forEach(mat => {
        const count = state.materials[mat.id] || 0;
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
          <div class="shop-item-icon">${mat.emoji}</div>
          <div class="shop-item-name">${mat.name}</div>
          <div class="shop-item-desc">修机关剩下的材料，可以换成钻石</div>
          <div class="shop-owned-count">已拥有 ×${count}</div>
        `;
        const button = document.createElement('button');
        button.className = 'genshin-btn small';
        button.textContent = `卖 1 个 (+${MATERIAL_SELL_RATE} 💎)`;
        button.disabled = count <= 0;
        button.addEventListener('click', () => {
          if ((state.materials[mat.id] || 0) <= 0) return;
          state.materials[mat.id]--;
          state.player.gems += MATERIAL_SELL_RATE;
          sfx('collect');
          trackEvent('shop_sell_material', { id: mat.id, rate: MATERIAL_SELL_RATE });
          updateMapHud();
          saveGame();
          renderShop();
        });
        item.appendChild(button);
        list.appendChild(item);
      });
    } else {
      CONSUMABLES.forEach(goods => {
        const count = state.inventory.consumables[goods.id] || 0;
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.innerHTML = `
          <div class="shop-item-icon">${goods.emoji}</div>
          <div class="shop-item-name">${goods.name}</div>
          <div class="shop-item-desc">${goods.desc}</div>
          <div class="shop-owned-count">已拥有 ×${count}</div>
        `;
        const button = document.createElement('button');
        button.className = 'genshin-btn small';
        button.textContent = `购买 ${goods.cost} 💎`;
        button.disabled = state.player.gems < goods.cost;
        button.addEventListener('click', () => {
          if (state.player.gems < goods.cost) {
            showHint(`还需要 ${goods.cost - state.player.gems} 钻石才能购买「${goods.name}」。`);
            return;
          }
          state.player.gems -= goods.cost;
          state.inventory.consumables[goods.id] = (state.inventory.consumables[goods.id] || 0) + 1;
          sfx('collect');
          showHint(`${goods.emoji} 购入「${goods.name}」，战斗中可以使用！`);
          trackEvent('shop_buy_consumable', { id: goods.id, cost: goods.cost });
          updateMapHud();
          saveGame();
          renderShop();
        });
        item.appendChild(button);
        list.appendChild(item);
      });
    }
  }

  // NPC 委托：对话接小任务，完成后回来领奖（材料/机关/收集三类）
  const COMMISSIONS = {
    8: {
      speaker: '村妇', emoji: '👩‍🌾',
      title: '帮忙捡风种', text: '帮我捡 5 颗风种回来吧，修风车要用。',
      need: { material: 'windSeed', count: 5 }, reward: 15
    },
    9: {
      speaker: '农夫', emoji: '👨‍🌾',
      title: '机关修理课', text: '听说你在修机关？修好 2 座给我看看！',
      need: { mechanisms: 2 }, reward: 15
    },
    11: {
      speaker: '湖畔渔夫', emoji: '🧜',
      title: '亮晶晶的东西', text: '帮我捡 3 颗水晶吧，小孩子最喜欢亮晶晶的。',
      need: { collectibles: 3 }, reward: 15
    }
  };

  function checkCommissionDone(npcId) {
    const c = COMMISSIONS[npcId];
    if (!c) return false;
    if (c.need.material) return (state.materials[c.need.material] || 0) >= c.need.count;
    if (c.need.mechanisms) return Object.values(MECHANISMS).filter(m => m.restored()).length >= c.need.mechanisms;
    if (c.need.collectibles) return state.map.collectedItems.length >= c.need.collectibles;
    return false;
  }

  // 技能树：被动技能
  function hasPassive(id) {
    return Array.isArray(state.passives) && state.passives.includes(id);
  }

  function getEffectiveMaxHp() {
    return state.player.maxHp + (hasPassive('hpBoost') ? 25 : 0);
  }

  // 玩家攻防：基础值随等级成长，武器提供攻击加成，防具提供防御加成
  function getEquippedWeapon() {
    return WEAPONS.find(item => item.id === state.equipment.weapon) || WEAPONS[0];
  }
  function getEquippedArmor() {
    return ARMORS.find(item => item.id === state.equipment.armor) || ARMORS[0];
  }
  function getPlayerAttack() {
    return 10 + (state.player.level - 1) * 2 + getEquippedWeapon().attackBonus;
  }
  function getPlayerDefense() {
    return 5 + Math.floor((state.player.level - 1) / 2) + getEquippedArmor().defenseBonus;
  }
  function getEnemyAttack() {
    return REGIONS[session.currentRegionId]?.enemyAttack ?? 12;
  }
  function getEnemyDefense() {
    return REGIONS[session.currentRegionId]?.enemyDefense ?? 0;
  }

  function updateSkillPointsBadge() {
    const badge = $('#skill-points-badge');
    if (badge) badge.textContent = `${state.passives.length}/${SKILL_TREE.length}`;
  }

  function openSkillTree() {
    const list = $('#skill-tree-list');
    if (!list) return;
    updateSkillPointsBadge();
    if ($('#skill-tree-gems')) $('#skill-tree-gems').textContent = state.player.gems;
    if ($('#skill-tree-count')) $('#skill-tree-count').textContent = state.passives.length;
    list.innerHTML = '';
    SKILL_TREE.forEach(skill => {
      const unlocked = hasPassive(skill.id);
      const item = document.createElement('div');
      item.className = 'skill-node' + (unlocked ? ' unlocked' : '');
      item.innerHTML = `
        <div class="skill-node-icon">${skill.icon}</div>
        <div class="skill-node-info">
          <div class="skill-node-name">${skill.name}</div>
          <div class="skill-node-desc">${skill.desc}</div>
        </div>
      `;
      const button = document.createElement('button');
      button.className = 'genshin-btn small';
      button.textContent = unlocked ? '已激活' : `解锁 ${skill.cost} 💎`;
      button.disabled = unlocked || state.player.gems < skill.cost;
      button.addEventListener('click', () => unlockPassive(skill));
      item.appendChild(button);
      list.appendChild(item);
    });
    $('#skill-tree-modal').classList.remove('hidden');
    syncControlsLock();
  }

  function closeSkillTree() {
    $('#skill-tree-modal').classList.add('hidden');
    syncControlsLock();
  }

  function unlockPassive(skill) {
    if (hasPassive(skill.id)) return;
    if (state.player.gems < skill.cost) {
      showHint(`还需要 ${skill.cost - state.player.gems} 钻石才能解锁「${skill.name}」。`);
      return;
    }
    state.player.gems -= skill.cost;
    state.passives.push(skill.id);
    sfx('collect');
    showHint(`🌟 被动技能「${skill.name}」已激活：${skill.desc}`);
    trackEvent('passive_unlock', { id: skill.id, cost: skill.cost });
    updateMapHud();
    updateHud();
    saveGame();
    checkAchievements();
    openSkillTree();
  }

  // 成就面板
  function openAchievements() {
    const list = $('#achievements-list');
    list.innerHTML = '';
    Object.entries(ACHIEVEMENTS).forEach(([id, ach]) => {
      const unlocked = state.achievements[id];
      const item = document.createElement('div');
      item.className = 'achievement-item' + (unlocked ? ' unlocked' : ' locked');
      item.innerHTML = `
        <div class="achievement-item-icon">${ach.icon}</div>
        <div class="achievement-item-info">
          <div class="achievement-item-name">${ach.name}</div>
          <div class="achievement-item-desc">${ach.desc}</div>
        </div>
        <div class="achievement-item-reward">+${ach.reward} 💎</div>
      `;
      list.appendChild(item);
    });
    $('#achievements-modal').classList.remove('hidden');
    syncControlsLock();
  }
  function closeAchievements() {
    $('#achievements-modal').classList.add('hidden');
    syncControlsLock();
  }

  // 提示弹窗
  let hintTimer = null;
  function showHint(text, duration = 2500) {
    $('#hint-text').textContent = text;
    $('#hint-modal').classList.remove('hidden');
    syncControlsLock();
    if (hintTimer) clearTimeout(hintTimer);
    hintTimer = setTimeout(closeHint, duration);
  }
  function closeHint() {
    $('#hint-modal').classList.add('hidden');
    syncControlsLock();
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
  }

  // 撞墙/撞建筑轻反馈：一点尘土，不阻断操作
  function showBumpEffect(x, y) {
    if (!session.mapActive) return;
    const el = document.createElement('div');
    el.className = 'bump-dust';
    el.textContent = '💨';
    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y - 24) + 'px';
    const canvas = $('#world-canvas');
    if (canvas) canvas.appendChild(el);
    setTimeout(() => el.remove(), 360);
  }

  // 成就通知
  let achievementTimer = null;
  function updateMapHud() {
    if ($('#mini-level')) $('#mini-level').textContent = state.player.level;
    if ($('#mini-gems')) $('#mini-gems').textContent = state.player.gems;
    ['windSeed', 'windLamp', 'plank', 'windCrystal'].forEach(id => {
      const el = $(`#mini-mat-${id}`);
      if (el) el.textContent = state.materials?.[id] || 0;
    });
  }

  function addExperience(amount) {
    const gained = Math.max(0, Math.floor(Number(amount) || 0));
    state.player.exp += gained;
    let levelsGained = 0;
    while (state.player.level < 100) {
      const required = state.player.level * 150;
      if (state.player.exp < required) break;
      state.player.exp -= required;
      state.player.level++;
      state.player.maxHp += 20;
      state.player.hp = state.player.maxHp;
      levelsGained++;
    }
    return levelsGained;
  }

  function grantRewards({ gems = 0, exp = 0 } = {}) {
    state.player.gems += Math.max(0, Math.floor(Number(gems) || 0));
    const levelsGained = addExperience(exp);
    updateMapHud();
    return levelsGained;
  }

  function showAchievement(id) {
    const ach = ACHIEVEMENTS[id];
    if (!ach) return;
    const notif = document.createElement('div');
    notif.className = 'achievement-notif';
    notif.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-info">
        <div class="achievement-name">成就解锁：${ach.name}</div>
        <div class="achievement-desc">${ach.desc} · +${ach.reward} 钻石</div>
      </div>
    `;
    document.body.appendChild(notif);
    setTimeout(() => notif.classList.add('show'), 10);
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 500);
    }, 3000);
    sfx('win');
    grantRewards({ gems: ach.reward });
    saveGame();
  }

  // 解锁单个成就（幂等）
  function unlockAchievement(id) {
    if (!ACHIEVEMENTS[id] || state.achievements[id]) return;
    state.achievements[id] = true;
    showAchievement(id);
  }

  // 检查成就
  function checkAchievements() {
    const a = state.achievements;
    const p = state.player;
    const m = state.map;

    if (!a.firstClear && p.completedLevels.length >= 1) unlockAchievement('firstClear');
    if (!a.streak5 && p.answerStreak >= 5) unlockAchievement('streak5');
    if (!a.streak10 && p.answerStreak >= 10) unlockAchievement('streak10');
    if (!a.unlock3Regions && p.unlockedRegions.length >= 3) unlockAchievement('unlock3Regions');
    if (!a.unlockAllRegions && p.unlockedRegions.length >= REGIONS.length) unlockAchievement('unlockAllRegions');
    if (!a.collect10Gems && m.collectedItems.length >= 10) unlockAchievement('collect10Gems');
    if (!a.collectAllGems && m.collectedItems.length >= 12) unlockAchievement('collectAllGems');
    if (!a.open2Chests && m.openedChests.length >= 2) unlockAchievement('open2Chests');
    if (!a.open5Chests && m.openedChests.length >= 5) unlockAchievement('open5Chests');
    if (!a.activate3Waypoints && m.activatedWaypoints.length >= 3) unlockAchievement('activate3Waypoints');
    if (!a.activate5Waypoints && m.activatedWaypoints.length >= 5) unlockAchievement('activate5Waypoints');
    if (!a.explorer4 && m.discoveredAreas.length >= 4) unlockAchievement('explorer4');
    if (!a.firstBurst && p.burstsUsed >= 1) unlockAchievement('firstBurst');
    if (!a.burst10 && p.burstsUsed >= 10) unlockAchievement('burst10');
    if (!a.firstReaction && p.reactionsTriggered >= 1) unlockAchievement('firstReaction');
    if (!a.reaction5 && p.reactionsTriggered >= 5) unlockAchievement('reaction5');
    if (!a.skill1 && state.passives.length >= 1) unlockAchievement('skill1');
    if (!a.skillAll && state.passives.length >= SKILL_TREE.length) unlockAchievement('skillAll');
    LEVELS.forEach((levels, rid) => {
      const id = `clearRegion${rid}`;
      if (!a[id] && levels.length > 0 && levels.every(lv => p.completedLevels.includes(lv.id))) {
        unlockAchievement(id);
      }
    });
    if (!a.allClear) {
      const allLevels = LEVELS.flat().map(l => l.id);
      const allDone = allLevels.every(id => p.completedLevels.includes(id));
      if (allDone) unlockAchievement('allClear');
    }
  }

  // ========== 每日/每周任务 ==========
  function questPeriodKeys(now = new Date()) {
    const pad = value => String(value).padStart(2, '0');
    const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    // ISO 周：以周四确定这一周属于哪一年
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
    const firstThursday = new Date(date.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);
    const week = 1 + Math.round((date - firstThursday) / (7 * 24 * 3600 * 1000));
    return { day, week: `${date.getFullYear()}-W${pad(week)}` };
  }

  // 用周期字符串做随机种子，同一天/同一周的任务组合在当天内保持稳定
  function seededPicker(seedText) {
    let seed = 0;
    for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
    return () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 4294967296);
  }

  function pickQuests(pool, count, seedText) {
    const random = seededPicker(seedText);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count).map(def => ({ id: def.id, progress: 0, claimed: false }));
  }

  function sanitizeQuestSet(rawSet, kind) {
    if (!isPlainObject(rawSet)) return null;
    const periodKey = kind === 'daily' ? 'date' : 'week';
    if (typeof rawSet[periodKey] !== 'string' || !rawSet[periodKey]) return null;
    const pool = QUEST_POOLS[kind];
    const seen = new Set();
    const tasks = (Array.isArray(rawSet.tasks) ? rawSet.tasks : [])
      .map(task => {
        const def = isPlainObject(task) ? pool.find(item => item.id === task.id) : null;
        if (!def || seen.has(def.id)) return null;
        seen.add(def.id);
        return {
          id: def.id,
          progress: Math.floor(finiteNumber(task.progress, 0, 0, def.target)),
          claimed: task.claimed === true
        };
      })
      .filter(Boolean);
    if (!tasks.length) return null;
    return { [periodKey]: rawSet[periodKey], tasks };
  }

  // 日期或周变化时重新生成任务；返回是否有重建
  function ensureQuests() {
    const { day, week } = questPeriodKeys();
    let regenerated = false;
    if (!state.quests.daily || state.quests.daily.date !== day) {
      state.quests.daily = { date: day, tasks: pickQuests(QUEST_POOLS.daily, 3, `daily:${day}`) };
      regenerated = true;
    }
    if (!state.quests.weekly || state.quests.weekly.week !== week) {
      state.quests.weekly = { week, tasks: pickQuests(QUEST_POOLS.weekly, 5, `weekly:${week}`) };
      regenerated = true;
    }
    return regenerated;
  }

  // 记录任务进度，返回本轮新完成的任务定义（用于提示）
  function recordQuestProgress(metric, value = 1) {
    ensureQuests();
    const completed = [];
    ['daily', 'weekly'].forEach(kind => {
      state.quests[kind].tasks.forEach(task => {
        const def = QUEST_POOLS[kind].find(item => item.id === task.id);
        if (!def || def.metric !== metric || task.claimed) return;
        const before = Math.min(task.progress, def.target);
        task.progress = def.mode === 'max'
          ? Math.max(task.progress, value)
          : Math.min(def.target, task.progress + value);
        if (before < def.target && task.progress >= def.target) {
          completed.push(def);
          trackEvent('quest_complete', { kind, id: def.id });
        }
      });
    });
    if (completed.length) {
      sfx('quest');
      saveGame();
    }
    return completed;
  }

  function questCompletionNote(completed) {
    if (!completed.length) return '';
    return ` 📜 任务完成：${completed.map(def => def.name).join('、')}，可在任务面板领取奖励！`;
  }

  function claimQuest(kind, taskId) {
    const task = state.quests[kind]?.tasks.find(item => item.id === taskId);
    const def = QUEST_POOLS[kind]?.find(item => item.id === taskId);
    if (!task || !def || task.claimed || task.progress < def.target) return;
    task.claimed = true;
    grantRewards({ gems: def.reward });
    sfx('collect');
    showHint(`🎉 领取任务奖励：${def.reward} 钻石！`);
    trackEvent('quest_claim', { kind, id: def.id, reward: def.reward });
    saveGame();
    renderQuestList();
  }

  function renderQuestGroup(kind, container) {
    if (!container) return;
    container.innerHTML = '';
    state.quests[kind].tasks.forEach(task => {
      const def = QUEST_POOLS[kind].find(item => item.id === task.id);
      if (!def) return;
      const done = task.progress >= def.target;
      const shown = Math.min(task.progress, def.target);
      const pct = Math.round((shown / def.target) * 100);
      const row = document.createElement('div');
      row.className = 'quest-task' + (task.claimed ? ' claimed' : done ? ' done' : '');
      row.innerHTML = `
        <div class="quest-task-info">
          <div class="quest-task-name">${def.name}</div>
          <div class="quest-task-track"><div class="quest-task-fill" style="width:${pct}%"></div></div>
          <div class="quest-task-progress">${shown}/${def.target} · 奖励 ${def.reward} 💎</div>
        </div>
      `;
      const button = document.createElement('button');
      button.className = 'genshin-btn small';
      button.textContent = task.claimed ? '已领取' : done ? '领取' : '进行中';
      button.disabled = task.claimed || !done;
      button.addEventListener('click', () => claimQuest(kind, task.id));
      row.appendChild(button);
      container.appendChild(row);
    });
  }

  function renderQuestList() {
    ensureQuests();
    renderQuestGroup('daily', $('#daily-task-list'));
    renderQuestGroup('weekly', $('#weekly-task-list'));
    if ($('#daily-quest-note')) $('#daily-quest-note').textContent = '每天刷新 3 个';
    if ($('#weekly-quest-note')) $('#weekly-quest-note').textContent = '每周刷新 5 个';
  }

  function openQuests() {
    renderQuestList();
    $('#quests-modal').classList.remove('hidden');
    syncControlsLock();
    trackEvent('quests_open');
  }
  function closeQuests() {
    $('#quests-modal').classList.add('hidden');
    syncControlsLock();
  }

  // 渲染世界地图（开放世界）
  function renderMap() {
    try {
      try { buildWorld(); } catch (e) { console.warn('buildWorld error', e); }
      updateMapHud();
      applySelectedCosmetic();
      // 大地图播放当前进度所属区域的环境音
      setAmbientRegion(state.player.currentRegion || 0);

      const windmill = $('#windmill-change');
      const bridge = $('#wind-bridge-change');
      const stormCore = $('#storm-core-change');
      const windcore = $('#windcore-change');
      const windtower = $('#windtower-change');
      windmill?.classList.toggle('restored', state.map.worldChanges.windmillRestored);
      windcore?.classList.toggle('lit', state.map.worldChanges.windcoreLit);
      windtower?.classList.toggle('lit', state.map.worldChanges.windtowerLit);
      bridge?.classList.toggle('opened', state.map.worldChanges.bridgeOpened);
      stormCore?.classList.toggle('calmed', state.map.worldChanges.stormCalmed);
      const windmillLabel = windmill?.querySelector('.world-change-label');
      const bridgeLabel = bridge?.querySelector('.world-change-label');
      const stormLabel = stormCore?.querySelector('.world-change-label');
      const windcoreLabel = windcore?.querySelector('.world-change-label');
      const windtowerLabel = windtower?.querySelector('.world-change-label');
      if (windmillLabel) windmillLabel.textContent = state.map.worldChanges.windmillRestored ? '重新转动的风车' : '沉睡的风车';
      if (windcoreLabel) windcoreLabel.textContent = state.map.worldChanges.windcoreLit ? '明亮的风核' : '黯淡的风核';
      if (windtowerLabel) windtowerLabel.textContent = state.map.worldChanges.windtowerLit ? '闪亮的风灯塔' : '熄灭的风灯塔';
      if (bridgeLabel) bridgeLabel.textContent = state.map.worldChanges.bridgeOpened ? '贯通的风桥' : '断裂的风桥';
      if (stormLabel) stormLabel.textContent = state.map.worldChanges.stormCalmed ? '平静的风暴核心' : '失衡的风暴核心';

      // 更新地标状态
      $$('.landmark').forEach(lm => {
        const rid = parseInt(lm.dataset.region);
        lm.classList.remove('locked', 'current');
        if (!state.player.unlockedRegions.includes(rid)) {
          lm.classList.add('locked');
        } else if (rid === (state.player.currentRegion || 0)) {
          lm.classList.add('current');
        }
      });

      // 更新任务日志
      try { updateQuestLog(); } catch (e) { console.warn('updateQuestLog error', e); }

      // 初始化玩家位置并启动循环
      if (!session.mapActive) {
        const spawn = LAYOUT?.spawn || { x: 1400, y: 2600 };
        const startX = Number.isFinite(session.lastMapX) ? Math.max(60, Math.min(WORLD.W - 60, session.lastMapX)) : spawn.x;
        const startY = Number.isFinite(session.lastMapY) ? Math.max(60, Math.min(WORLD.H - 60, session.lastMapY)) : spawn.y;
        session.playerX = startX;
        session.playerY = startY;
        session.targetX = startX;
        session.targetY = startY;
        session.isMoving = false;
        session.moveMode = null;
        session.velX = 0;
        session.velY = 0;
        Object.keys(session.moveKeys).forEach(key => { session.moveKeys[key] = false; });
        session.currentLandmark = null;
        session.currentWaypoint = null;
        // 同步地图收集状态
        session.collectedItems = Array.isArray(state.map?.collectedItems) ? [...state.map.collectedItems] : [];
        session.openedChests = Array.isArray(state.map?.openedChests) ? [...state.map.openedChests] : [];
        session.activatedWaypoints = Array.isArray(state.map?.activatedWaypoints) ? [...state.map.activatedWaypoints] : [];
        // 应用已收集/已开启状态
        $$('.collectible').forEach((item, idx) => {
          item.classList.toggle('collected', session.collectedItems.includes(idx));
        });
        $$('.chest').forEach((chest, idx) => {
          chest.classList.toggle('opened', session.openedChests.includes(idx));
        });
        const collectedMaterials = Array.isArray(state.map?.collectedMaterials) ? state.map.collectedMaterials : [];
        $$('.material').forEach((item, idx) => {
          item.classList.toggle('collected', collectedMaterials.includes(idx));
        });
        const discoveredAreas = Array.isArray(state.map?.discoveredAreas) ? state.map.discoveredAreas : [];
        $$('.hidden-area').forEach(area => {
          area.classList.toggle('discovered', discoveredAreas.includes(area.dataset.area));
        });
        // 已看过的地图剧情不再自动触发，避免对话结束后原地循环。
        const seenStories = Array.isArray(state.map?.seenStories) ? state.map.seenStories : [];
        $$('.story-trigger').forEach(trigger => {
          trigger.dataset.triggered = seenStories.includes(trigger.dataset.story) ? 'true' : 'false';
        });
        $('#region-enter-prompt').classList.add('hidden');
        $('#waypoint-prompt').classList.add('hidden');
        updatePlayerSprite();
        updateCamera();
        // 只有初始化完整成功后才激活地图，避免一次异常让后续渲染无法重试。
        session.mapActive = true;
        session.lastProgressAt = performance.now();
        showGuideBeam(8000); // 进入地图时亮一次目标光柱
        startMapLoop();
        setTimeout(() => {
          if ($('#tutorial-overlay')?.classList.contains('hidden')) {
            const mapScreen = $('#world-map');
            try { mapScreen?.focus({ preventScroll: true }); } catch (e) { mapScreen?.focus(); }
          }
        }, 0);
      }
    } catch (e) {
      session.mapActive = false;
      console.error('renderMap error', e);
    }
  }

  // 固定种子 PRNG，保证每次构建出的装饰布局一致
  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 首次渲染地图时构建一次世界底层：烘焙全图唯一的大陆底图 + 道路 SVG + 程序化装饰（幂等）
  function buildWorld() {
    if (session.worldBuilt) return;
    const canvas = $('#world-canvas');
    if (!canvas || !LAYOUT) return;

    // ① 大陆底图：离屏 canvas 一次性烘焙（底色 + 手绘纹理 + 地形渐变 + 颗粒），
    //    全图唯一、无平铺接缝，替代旧的可平铺 webp 背景与 blur div。
    const ground = document.createElement('canvas');
    ground.id = 'world-ground';
    const SCALE = 0.48; // 3840×2400，兼顾内存与清晰度
    ground.width = Math.round(WORLD.W * SCALE);
    ground.height = Math.round(WORLD.H * SCALE);
    const ctx = ground.getContext('2d');
    const bakeRand = mulberry32(20260723);
    const hexToRgba = (hex, alpha) => {
      const value = parseInt(hex.slice(1), 16);
      return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
    };
    // 基底：童话草地对角渐变
    const base = ctx.createLinearGradient(0, 0, ground.width, ground.height);
    base.addColorStop(0, '#c8e0ba');
    base.addColorStop(0.5, '#bcd9bd');
    base.addColorStop(1, '#aed0c2');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, ground.width, ground.height);
    // 手绘纹理：复用 overworld webp，降饱和后整幅铺开（只作纹理，不再可读出"一幅画"）
    const texture = new Image();
    const bakeTexture = () => {
      if (!texture.complete || !texture.naturalWidth) return;
      ctx.save();
      // 手绘全景插画作为地面主底：覆盖铺满（cover），插画的区域色彩天然对应各区域
      const coverScale = Math.max(ground.width / texture.naturalWidth, ground.height / texture.naturalHeight);
      const drawW = texture.naturalWidth * coverScale;
      const drawH = texture.naturalHeight * coverScale;
      ctx.globalAlpha = 0.72;
      ctx.drawImage(texture, (ground.width - drawW) / 2, (ground.height - drawH) / 2, drawW, drawH);
      ctx.restore();
      bakeTerrain();
    };
    texture.src = VISUAL_ASSETS.world;
    // 地形与颗粒（纹理未缓存时先出素底，纹理就绪后覆盖重绘）
    const bakeTerrain = () => {
      const KIND_ALPHA = { ground: 0.2, sea: 0.32, island: 0.28, lake: 0.3, land: 0.3, mountain: 0.3, snow: 0.28, canyon: 0.28 };
      LAYOUT.blobs.forEach(b => {
        const x = b.x * SCALE, y = b.y * SCALE, rx = b.rx * SCALE, ry = b.ry * SCALE;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((b.rot * Math.PI) / 180);
        ctx.scale(1, ry / rx);

        if (b.kind === 'mountain') {
          // 山体棱线：锯齿轮廓 + 左亮右暗双色，替代 fuzzy 色斑
          const peaks = 6 + (Math.abs(b.x) % 3);
          ctx.beginPath();
          for (let i = 0; i <= peaks; i++) {
            const t = i / peaks;
            const px = -rx + t * 2 * rx;
            const py = -ry * (0.35 + 0.55 * Math.abs(Math.sin(t * Math.PI * 2.5 + b.x * 0.01)));
            if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
          }
          ctx.lineTo(rx, ry * 0.9);
          ctx.lineTo(-rx, ry * 0.9);
          ctx.closePath();
          const g = ctx.createLinearGradient(-rx, -ry, rx, ry);
          g.addColorStop(0, hexToRgba('#b09a80', KIND_ALPHA.mountain + 0.12));
          g.addColorStop(1, hexToRgba('#463c34', KIND_ALPHA.mountain + 0.12));
          ctx.fillStyle = g;
          ctx.fill();
          // 棱线高光
          ctx.strokeStyle = 'rgba(255,244,210,0.35)';
          ctx.lineWidth = 2.2 * SCALE;
          ctx.stroke();
          ctx.restore();
          return;
        }

        if (b.kind === 'sea' || b.kind === 'lake') {
          // 岸线：浅滩圈 + 水体 + 水波线
          ctx.beginPath();
          ctx.arc(0, 0, rx * 1.07, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba('#e6d5a7', 0.4);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(0, 0, rx, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(0, 0, Math.min(rx, ry) * 0.15, 0, 0, rx);
          grad.addColorStop(0, hexToRgba(b.color, KIND_ALPHA[b.kind]));
          grad.addColorStop(1, hexToRgba(b.color, 0.1));
          ctx.fillStyle = grad;
          ctx.fill();
          // 水波线：岸线内侧一圈亮线
          ctx.beginPath();
          ctx.arc(0, 0, rx * 0.96, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 2.5 * SCALE;
          ctx.stroke();
          ctx.restore();
          return;
        }

        const grad = ctx.createRadialGradient(0, 0, Math.min(rx, ry) * 0.15, 0, 0, Math.max(rx, ry));
        grad.addColorStop(0, hexToRgba(b.color, KIND_ALPHA[b.kind] ?? 0.5));
        grad.addColorStop(1, hexToRgba(b.color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      // 大尺度色彩起伏：打破均匀感
      const washes = ['#7fb069', '#a5c23b', '#8fbf9f', '#c9d89a'];
      for (let i = 0; i < 16; i++) {
        const x = bakeRand() * ground.width, y = bakeRand() * ground.height;
        const r = 150 + bakeRand() * 420;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, hexToRgba(washes[Math.floor(bakeRand() * washes.length)], 0.1));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 值噪声细节层：小网格生成后放大叠加，全图有机斑驳（固定种子可复现）
      const noiseRand = mulberry32(20260725);
      const gw = 24, gh = 14;
      const lattice = Array.from({ length: (gw + 1) * (gh + 1) }, () => noiseRand());
      const gw2 = 48, gh2 = 28;
      const lattice2 = Array.from({ length: (gw2 + 1) * (gh2 + 1) }, () => noiseRand());
      const sampleNoise = (lattice, gw2x, gh2x, nx, ny) => {
        const x0 = Math.floor(nx), y0 = Math.floor(ny);
        const fx = nx - x0, fy = ny - y0;
        const sx = (1 - Math.cos(fx * Math.PI)) / 2;
        const sy = (1 - Math.cos(fy * Math.PI)) / 2;
        const i00 = y0 * (gw2x + 1) + x0;
        const top = lattice[i00] + (lattice[i00 + 1] - lattice[i00]) * sx;
        const bottom = lattice[i00 + gw2x + 1] + (lattice[i00 + gw2x + 2] - lattice[i00 + gw2x + 1]) * sx;
        return top + (bottom - top) * sy;
      };
      const nw = 240, nh = 144;
      const noiseC = document.createElement('canvas');
      noiseC.width = nw; noiseC.height = nh;
      const nctx = noiseC.getContext('2d');
      const img = nctx.createImageData(nw, nh);
      for (let py = 0; py < nh; py++) {
        for (let px = 0; px < nw; px++) {
          const v1 = sampleNoise(lattice, gw, gh, (px / nw) * gw, (py / nh) * gh);
          const v2 = sampleNoise(lattice2, gw2, gh2, (px / nw) * gw2, (py / nh) * gh2);
          const v = (v1 * 0.65 + v2 * 0.35) - 0.5; // -0.5..0.5
          const idx = (py * nw + px) * 4;
          const base = 128 + v * 90;
          img.data[idx] = base;
          img.data[idx + 1] = base;
          img.data[idx + 2] = base;
          img.data[idx + 3] = 255;
        }
      }
      nctx.putImageData(img, 0, 0);
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.55;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(noiseC, 0, 0, ground.width, ground.height);
      ctx.restore();

      // 颗粒噪点：增加地表细节
      for (let i = 0; i < 4500; i++) {
        const x = bakeRand() * ground.width, y = bakeRand() * ground.height;
        ctx.fillStyle = bakeRand() < 0.5
          ? `rgba(42,75,58,${0.02 + bakeRand() * 0.05})`
          : `rgba(255,251,224,${0.02 + bakeRand() * 0.05})`;
        ctx.beginPath();
        ctx.arc(x, y, 0.6 + bakeRand() * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // 方向光：左上暖光、右下冷影，全图立体感
      const light = ctx.createLinearGradient(0, 0, ground.width, ground.height);
      light.addColorStop(0, 'rgba(255,244,200,0.12)');
      light.addColorStop(0.55, 'rgba(255,255,255,0)');
      light.addColorStop(1, 'rgba(28,48,80,0.14)');
      ctx.fillStyle = light;
      ctx.fillRect(0, 0, ground.width, ground.height);
    };
    if (texture.complete && texture.naturalWidth) bakeTexture();
    else {
      bakeTerrain();
      texture.addEventListener('load', bakeTexture, { once: true });
    }
    canvas.insertBefore(ground, canvas.firstChild);

    // ② 道路层：内联 SVG 折线（原神式土路）
    const svgNS = 'http://www.w3.org/2000/svg';
    const roadSvg = document.createElementNS(svgNS, 'svg');
    roadSvg.setAttribute('id', 'world-roads');
    roadSvg.setAttribute('viewBox', `0 0 ${WORLD.W} ${WORLD.H}`);
    roadSvg.setAttribute('width', WORLD.W);
    roadSvg.setAttribute('height', WORLD.H);
    LAYOUT.roads.forEach(road => {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', road.map((p, i) => `${i ? 'L' : 'M'} ${p[0]} ${p[1]}`).join(' '));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#c8b08a');
      path.setAttribute('stroke-width', '16');
      path.setAttribute('opacity', '0.3');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      roadSvg.appendChild(path);
    });
    canvas.insertBefore(roadSvg, ground.nextSibling);

    // ③ 程序化装饰层：按区域元素撒布 + 全图野生 + 道路沿线
    const rand = mulberry32(20260723);
    const decoLayer = document.createElement('div');
    decoLayer.id = 'world-decos';
    const ELEMENT_DECOS = {
      anemo: ['🌾', '🍃', '🌼', '💐'],
      geo: ['🪨', '🌵'],
      electro: ['⚡', '🍄'],
      dendro: ['🌲', '🌳', '🍄', '🌿'],
      hydro: ['🐚', '🌿'],
      pyro: ['🌵', '🪨'],
      cryo: ['❄️', '🌲']
    };
    const clampX = v => Math.max(60, Math.min(WORLD.W - 60, v));
    const clampY = v => Math.max(60, Math.min(WORLD.H - 60, v));
    const pick = arr => arr[Math.floor(rand() * arr.length)];
    const addDeco = (x, y, emoji) => {
      const el = document.createElement('div');
      const roll = rand(); // 大:中:小 ≈ 1:1.4:1（聚簇里大物为主）
      el.className = roll < 0.25 ? 'deco-large' : roll < 0.6 ? 'deco-medium' : 'deco-small';
      el.style.left = Math.round(clampX(x)) + 'px';
      el.style.top = Math.round(clampY(y)) + 'px';
      el.textContent = emoji;
      decoLayer.appendChild(el);
    };
    // 每个区域 12-16 个聚簇（每簇 3-5 个），少而大，成片的生态感
    LAYOUT.regions.forEach(rg => {
      const pool = ELEMENT_DECOS[REGIONS[rg.id]?.element] || ELEMENT_DECOS.anemo;
      const clusters = 12 + Math.floor(rand() * 5);
      for (let c = 0; c < clusters; c++) {
        const cAng = rand() * Math.PI * 2;
        const cDist = Math.sqrt(rand()) * 880;
        const cx = rg.x + Math.cos(cAng) * cDist;
        const cy = rg.y + Math.sin(cAng) * cDist * 0.85;
        const n = 3 + Math.floor(rand() * 3);
        const anchor = pick(pool);
        for (let i = 0; i < n; i++) {
          const ang = rand() * Math.PI * 2;
          const d = Math.sqrt(rand()) * 150;
          addDeco(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d, rand() < 0.55 ? anchor : pick(pool));
        }
      }
    });
    // 全图稀疏野生装饰 40 个（减半，且两三成对出现）
    const wild = ['🌾', '🍃', '🌼', '🌱', '🍄', '🌿', '🌸', '🪨'];
    for (let i = 0; i < 40; i++) {
      const wx = 100 + rand() * (WORLD.W - 200);
      const wy = 100 + rand() * (WORLD.H - 200);
      const wemoji = pick(wild);
      addDeco(wx, wy, wemoji);
      if (rand() < 0.4) addDeco(wx + 30 + rand() * 60, wy + 30 + rand() * 60, wemoji);
    }
    // 道路沿线每 ~250px 点缀（带抖动）
    LAYOUT.roads.forEach(road => {
      for (let i = 0; i < road.length - 1; i++) {
        const [ax, ay] = road[i];
        const [bx, by] = road[i + 1];
        const len = Math.hypot(bx - ax, by - ay);
        for (let d = 125; d < len; d += 250) {
          const t = d / len;
          const jx = (rand() - 0.5) * 140;
          const jy = (rand() - 0.5) * 140;
          addDeco(ax + (bx - ax) * t + jx, ay + (by - ay) * t + jy, rand() < 0.5 ? '🌲' : '🌾');
        }
      }
    });
    canvas.insertBefore(decoLayer, roadSvg.nextSibling);

    session.worldBuilt = true;
  }

  // 更新任务日志
  function updateQuestLog() {
    const currentRegion = state.player.currentRegion || 0;
    const regionLevels = LEVELS[currentRegion] || [];
    const completed = regionLevels.filter(lv => state.player.completedLevels.includes(lv.id)).length;
    const total = regionLevels.length;
    const region = REGIONS[currentRegion];

    const questCurrent = $('#quest-current');
    const questProgress = $('#quest-progress');
    if (!questCurrent || !questProgress) return;

    if (completed === total && currentRegion < REGIONS.length - 1) {
      const nextRegion = REGIONS[currentRegion + 1];
      questCurrent.textContent = `前往${nextRegion.name}，继续冒险`;
      questProgress.textContent = `${completed}/${total}`;
    } else if (completed === total && currentRegion === REGIONS.length - 1) {
      questCurrent.textContent = '恭喜！你已通关所有区域！';
      questProgress.textContent = '完成';
    } else {
      questCurrent.textContent = `通关${region.name}（${completed}/${total}）`;
      questProgress.textContent = `${completed}/${total}`;
    }
  }

  // 启动地图循环
  function startMapLoop() {
    if (session.mapLoopId) cancelAnimationFrame(session.mapLoopId);
    let lastTime = performance.now();
    function loop(now) {
      if (!session.mapActive) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!session.controlsLocked) {
        try { updateMovement(dt); } catch (e) { console.warn('updateMovement error', e); }
        try { checkLandmarkProximity(); } catch (e) { console.warn('checkLandmarkProximity error', e); }
        try { checkWaypointProximity(); } catch (e) { console.warn('checkWaypointProximity error', e); }
        try { checkCollectibles(); } catch (e) { console.warn('checkCollectibles error', e); }
        try { checkHiddenAreas(); } catch (e) { console.warn('checkHiddenAreas error', e); }
        try { checkStoryTriggers(); } catch (e) { console.warn('checkStoryTriggers error', e); }
        try { checkRegionDiscovery(); } catch (e) { console.warn('checkRegionDiscovery error', e); }
        try { checkMaterials(); } catch (e) { console.warn('checkMaterials error', e); }
        try { checkMechanismProximity(); } catch (e) { console.warn('checkMechanismProximity error', e); }
        try { updateMobileActionButton(); } catch (e) { console.warn('updateMobileActionButton error', e); }
        try { updateParticles(dt); } catch (e) { console.warn('updateParticles error', e); }
        // 动画静默化：只有玩家靠近的实体才播放动画（节流 200ms）
        session.animTick = (session.animTick || 0) + dt;
        if (session.animTick > 0.2) {
          session.animTick = 0;
          try { updateProximityAnimations(); } catch (e) { console.warn('updateProximityAnimations error', e); }
          try { updateGuideBeam(); } catch (e) { console.warn('updateGuideBeam error', e); }
          try { updateMathVisionMarks(); } catch (e) { console.warn('updateMathVisionMarks error', e); }
        }
      }
      try { updateCompass(); } catch (e) { console.warn('updateCompass error', e); }
      try { drawMinimap(); } catch (e) { console.warn('drawMinimap error', e); }
      session.mapLoopId = requestAnimationFrame(loop);
    }
    session.mapLoopId = requestAnimationFrame(loop);
  }

  // 更新移动
  function updateMovement(dt) {
    // 冲刺：按住 Shift 且体力充足时加速 240 → 400；冲刺耗体力，停止后恢复
    const sprinting = session.sprintKey && session.stamina > 0 && session.isMoving;
    const speed = sprinting ? 400 : 240; // 像素/秒
    if (sprinting) session.stamina = Math.max(0, session.stamina - 18 * dt);
    else session.stamina = Math.min(100, session.stamina + 12 * dt);
    let dx = 0, dy = 0;

    // 键盘移动
    if (session.moveKeys.w || session.moveKeys.arrowup) dy -= 1;
    if (session.moveKeys.s || session.moveKeys.arrowdown) dy += 1;
    if (session.moveKeys.a || session.moveKeys.arrowleft) dx -= 1;
    if (session.moveKeys.d || session.moveKeys.arrowright) dx += 1;

    // 虚拟摇杆输入（与键盘叠加后统一归一化，防止对角超速）
    if (session.joystick.active) {
      dx += session.joystick.x;
      dy += session.joystick.y;
    }

    if (dx !== 0 || dy !== 0) {
      // 直接控制移动：加速曲线逼近目标速度（起步有肉感，不是瞬时满速）
      session.isMoving = true;
      session.moveMode = 'keyboard';
      const len = Math.hypot(dx, dy);
      const tx = (dx / len) * speed;
      const ty = (dy / len) * speed;
      const t = Math.min(1, dt * 10);
      session.velX += (tx - session.velX) * t;
      session.velY += (ty - session.velY) * t;
      // 记录方向
      if (Math.abs(dx) > Math.abs(dy)) {
        session.facing = dx > 0 ? 'right' : 'left';
      } else {
        session.facing = dy > 0 ? 'down' : 'up';
      }
      session.walkCycle += dt * 8;
    } else if (session.isMoving && session.moveMode === 'target') {
      // 点击移动：同样走加速曲线
      const diffX = session.targetX - session.playerX;
      const diffY = session.targetY - session.playerY;
      const dist = Math.hypot(diffX, diffY);
      const stopDist = Math.max(6, speed * dt + 4);
      if (dist > stopDist) {
        const tx = (diffX / dist) * speed;
        const ty = (diffY / dist) * speed;
        const t = Math.min(1, dt * 10);
        session.velX += (tx - session.velX) * t;
        session.velY += (ty - session.velY) * t;
        if (Math.abs(diffX) > Math.abs(diffY)) {
          session.facing = diffX > 0 ? 'right' : 'left';
        } else {
          session.facing = diffY > 0 ? 'down' : 'up';
        }
        session.walkCycle += dt * 8;
      } else {
        session.playerX = session.targetX;
        session.playerY = session.targetY;
        session.velX = 0;
        session.velY = 0;
        session.isMoving = false;
        session.moveMode = null;
      }
    } else {
      // 松手滑行：指数衰减（约 27px），低速时停稳（原神式急停回弹感）
      const decay = Math.exp(-9 * dt);
      session.velX *= decay;
      session.velY *= decay;
      if (Math.hypot(session.velX, session.velY) < 10) {
        session.velX = 0;
        session.velY = 0;
        session.isMoving = false;
        if (session.moveMode === 'keyboard') {
          session.moveMode = null;
          session.targetX = session.playerX;
          session.targetY = session.playerY;
        }
      }
    }

    // 速度积分
    session.playerX += session.velX * dt;
    session.playerY += session.velY * dt;
    // 滑行中保持行走动画
    if (!session.isMoving && Math.hypot(session.velX, session.velY) >= 10) session.isMoving = true;

    // 冲刺视野外扩（镜头容器轻推 3%，起跑的推进感）
    $('#open-world')?.classList.toggle('sprint-zoom', sprinting);

    // 边界限制：整片数境大陆可走
    session.playerX = Math.max(60, Math.min(WORLD.W - 60, session.playerX));
    session.playerY = Math.max(60, Math.min(WORLD.H - 60, session.playerY));

    // 障碍物：山体 + 场景物件（风车、村庄等）圆形推出，原神式"不可穿"
    let bumped = false;
    if (LAYOUT) {
      const playerRadius = 24;
      const pushOut = list => {
        if (!Array.isArray(list)) return;
        list.forEach(ob => {
          const ox = session.playerX - ob.x;
          const oy = session.playerY - ob.y;
          const dist = Math.hypot(ox, oy);
          const minDist = ob.r + playerRadius;
          if (dist > 0 && dist < minDist) {
            session.playerX = ob.x + (ox / dist) * minDist;
            session.playerY = ob.y + (oy / dist) * minDist;
            bumped = true;
          }
        });
      };
      pushOut(LAYOUT.obstacles);
      pushOut(LAYOUT.sceneryObstacles);
      // 轻反馈：撞墙时冒一下尘土，300ms 内不重复触发
      if (bumped && session.isMoving) {
        const now = performance.now();
        if (!session.bumpAt || now - session.bumpAt > 300) {
          session.bumpAt = now;
          showBumpEffect(session.playerX, session.playerY);
        }
      }
    }

    // 体力条：仅体力不满时显示
    const staminaBar = $('#stamina-bar');
    if (staminaBar) {
      staminaBar.classList.toggle('hidden', session.stamina >= 100);
      const fill = $('#stamina-fill');
      if (fill) fill.style.width = Math.round(session.stamina) + '%';
    }

    // 脚步声
    if (session.isMoving && state.settings.sfx) {
      session.stepTimer = (session.stepTimer || 0) + dt;
      if (session.stepTimer > 0.35) {
        session.stepTimer = 0;
        sfx('step');
      }
    }

    updatePlayerSprite();
    updateCamera();
  }

  // 更新玩家精灵
  function updatePlayerSprite() {
    const el = $('#player-sprite');
    if (!el) return;
    el.style.left = session.playerX + 'px';
    el.style.top = session.playerY + 'px';
    el.classList.toggle('moving', session.isMoving);

    // 四向行走帧：按 facing 切换 SVG 朝向
    el.classList.remove('face-up', 'face-down', 'face-left', 'face-right');
    const faceClass = { up: 'face-up', down: 'face-down', left: 'face-left', right: 'face-right' }[session.facing] || 'face-down';
    el.classList.add(faceClass);

    // 方向指示
    const dirEl = $('#player-direction');
    if (dirEl) {
      const dirMap = { up: '▲', down: '▼', left: '◀', right: '▶' };
      dirEl.textContent = dirMap[session.facing] || '▲';
    }

    // 走路动画：根据 walkCycle 做上下浮动
    if (session.isMoving) {
      const bob = Math.sin(session.walkCycle) * 3;
      el.style.transform = `translateY(${bob}px)`;
    } else {
      el.style.transform = 'translateY(0)';
    }
  }

  // 更新镜头
  function updateCamera() {
    const viewport = $('#open-world');
    if (!viewport) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const worldW = WORLD.W;
    const worldH = WORLD.H;

    // 镜头居中玩家 + 向移动方向 lookahead（原神式预瞄）
    let camX = session.playerX + (session.velX || 0) * 0.25 - vw / 2;
    let camY = session.playerY + (session.velY || 0) * 0.25 - vh / 2;

    // 限制镜头边界
    camX = Math.max(0, Math.min(worldW - vw, camX));
    camY = Math.max(0, Math.min(worldH - vh, camY));

    // 平滑过渡（更快的跟随）
    session.cameraX += (camX - session.cameraX) * 0.2;
    session.cameraY += (camY - session.cameraY) * 0.2;

    $('#world-canvas').style.transform = `translate(${-session.cameraX}px, ${-session.cameraY}px)`;
  }

  // 动画静默化：只有玩家靠近的实体才播动画，远处一律静止（参考原神：静态世界，动态焦点）
  function updateProximityAnimations() {
    const px = session.playerX;
    const py = session.playerY;
    const groups = [
      ['.collectible', 300],
      ['.chest', 300],
      ['.material', 300],
      ['.npc', 170],
      ['.waypoint', 230],
      ['.hidden-area', 260],
      ['.village', 210],
      ['.region-gate', 200]
    ];
    groups.forEach(([sel, radius]) => {
      $$(sel).forEach(el => {
        const x = parseInt(el.style.left);
        const y = parseInt(el.style.top);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        el.classList.toggle('near', Math.hypot(px - x, py - y) < radius);
      });
    });
  }

  // 目标光柱：当前目标 = 第一座未修复的机关；全修复则指向当前区域地标。
  // 出现时机：进入地图时亮 8 秒；完成关卡后指向下一个目标；卡住 60 秒无进展时亮 8 秒。
  function currentObjectiveTarget() {
    const nextMech = Object.values(MECHANISMS).find(m => !m.restored());
    if (nextMech) return { x: nextMech.x, y: nextMech.y };
    const lm = $(`#landmark-${state.player.currentRegion || 0}`);
    if (lm) return { x: parseInt(lm.style.left), y: parseInt(lm.style.top) };
    return null;
  }

  function showGuideBeam(durationMs = 8000) {
    session.beamUntil = performance.now() + durationMs;
  }

  function updateGuideBeam() {
    const beam = $('#guide-beam');
    if (!beam) return;
    const now = performance.now();
    const target = currentObjectiveTarget();
    // 目标距离标记：常显（不依赖光柱是否点亮）
    updateObjectiveMarker(target);
    // 卡住检测：60 秒无任何关卡/机关进展，且冷却结束
    if (target && session.lastProgressAt && now - session.lastProgressAt > 60000 && now > session.beamCooldownUntil) {
      session.beamUntil = now + 8000;
      session.beamCooldownUntil = now + 90000;
    }
    const beamActive = target && session.beamUntil && now < session.beamUntil;
    if (beamActive) {
      beam.style.left = target.x + 'px';
      beam.style.top = target.y + 'px';
      beam.classList.remove('hidden');
    } else {
      beam.classList.add('hidden');
    }
    // 地面引导虚线：与光柱同时出现（卡住 60 秒或新目标时），平时收起
    updateGuidePath(beamActive ? target : null);
  }

  // 目标头顶距离标记：孩子随时知道"还有多远"
  function updateObjectiveMarker(target) {
    const el = $('#objective-distance');
    if (!el) return;
    if (!target) {
      el.classList.add('hidden');
      return;
    }
    const dist = Math.round(Math.hypot(session.playerX - target.x, session.playerY - target.y) / 10);
    el.textContent = `🎯 ${dist}m`;
    el.style.left = target.x + 'px';
    el.style.top = (target.y - 56) + 'px';
    el.classList.remove('hidden');
  }

  // 地面引导虚线：玩家 → 目标，蚂蚁线流向目标方向
  function updateGuidePath(target) {
    const svg = $('#guide-path');
    const line = $('#guide-path-line');
    if (!svg || !line) return;
    if (!target) {
      svg.classList.add('hidden');
      return;
    }
    const midX = (session.playerX + target.x) / 2;
    const midY = (session.playerY + target.y) / 2 - 40;
    line.setAttribute('d', `M ${session.playerX} ${session.playerY} Q ${midX} ${midY} ${target.x} ${target.y}`);
    svg.classList.remove('hidden');
  }

  // ========== 数学视野：一键高亮附近可交互物（30 秒冷却，只提示附近范围） ==========
  function useMathVision() {
    if (!session.mapActive || session.controlsLocked) return;
    const now = performance.now();
    if (now < (session.visionCooldownUntil || 0)) {
      showHint(`数学视野还在恢复（${Math.ceil((session.visionCooldownUntil - now) / 1000)} 秒）`);
      return;
    }
    session.visionUntil = now + 6000;
    session.visionCooldownUntil = now + 30000;
    sfx('burst');
    showHint('👁️ 数学视野：附近的发光物都显形了！');
    trackEvent('math_vision');
    updateMathVisionMarks();
  }

  // 视野范围：只高亮附近，远处仍需自己探索
  function updateMathVisionMarks() {
    const now = performance.now();
    const active = now < (session.visionUntil || 0);
    const px = session.playerX;
    const py = session.playerY;
    const groups = [
      ['.collectible', 520],
      ['.chest', 520],
      ['.material', 560],
      ['.hidden-area', 520]
    ];
    groups.forEach(([sel, radius]) => {
      $$(sel).forEach(el => {
        const x = parseInt(el.style.left);
        const y = parseInt(el.style.top);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        el.classList.toggle('vision-mark', active && Math.hypot(px - x, py - y) < radius);
      });
    });
    // 未修复机关：范围更大，是孩子最该找到的目标
    Object.values(MECHANISMS).forEach(mech => {
      if (mech.restored()) return;
      const el = document.getElementById(mech.elementId);
      if (!el) return;
      el.classList.toggle('vision-mark', active && Math.hypot(px - mech.x, py - mech.y) < 900);
    });
    // 冷却中的按钮样式
    $('#btn-math-vision')?.classList.toggle('cooling', now < (session.visionCooldownUntil || 0));
  }

  // ========== 区域粒子氛围：飘叶/飘雪/飞尘，按所在区域切换 ==========
  const REGION_PARTICLES = [
    { emojis: ['🍃', '🌾'], drift: 'fall', interval: 700 },    // 风语原：落叶
    { emojis: ['🪨', '✨'], drift: 'fall', interval: 900 },    // 岩岚港：岩尘
    { emojis: ['⚡'], drift: 'flash', interval: 1600 },        // 雷鸣群岛：电光
    { emojis: ['🌿', '🍄'], drift: 'float', interval: 800 },   // 森语城：孢子
    { emojis: ['💧', '⚪'], drift: 'rise', interval: 800 },    // 澄水庭：水泡
    { emojis: ['🔥', '✨'], drift: 'rise', interval: 650 },    // 赤焰谷：火星
    { emojis: ['❄️'], drift: 'fall', interval: 550 }           // 雪境宫：飘雪
  ];

  function nearestRegionId() {
    let best = state.player.currentRegion || 0;
    let bestDist = Infinity;
    (LAYOUT?.regions || []).forEach(r => {
      const d = Math.hypot(session.playerX - r.x, session.playerY - r.y);
      if (d < bestDist) { bestDist = d; best = r.id; }
    });
    return bestDist < 1600 ? best : null;
  }

  function updateParticles(dt) {
    const layer = $('#particle-layer');
    if (!layer) return;
    session.particleTick = (session.particleTick || 0) + dt;
    const regionId = nearestRegionId();
    if (regionId === null) return;
    if (session.particleTick < REGION_PARTICLES[regionId].interval / 1000) return;
    session.particleTick = 0;
    if (layer.childElementCount >= 10) return;
    const cfg = REGION_PARTICLES[regionId];
    const world = $('#open-world');
    const vw = world?.clientWidth || 800;
    const vh = world?.clientHeight || 600;
    const el = document.createElement('div');
    el.className = `particle drift-${cfg.drift}`;
    el.textContent = cfg.emojis[Math.floor(Math.random() * cfg.emojis.length)];
    el.style.left = (vw / 2 + (Math.random() - 0.5) * vw * 0.9) + 'px';
    el.style.top = (vh / 2 + (Math.random() - 0.5) * vh * 0.8) + 'px';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  // 检测地标距离：靠近后显示入口，由玩家点击按钮或按 Enter 确认进入。
  function checkLandmarkProximity() {
    const enterRadius = 100;
    let nearest = null;
    let nearestDist = Infinity;

    $$('.landmark').forEach(lm => {
      const rid = parseInt(lm.dataset.region);
      const lx = parseInt(lm.style.left);
      const ly = parseInt(lm.style.top);
      const dist = Math.hypot(session.playerX - lx, session.playerY - ly);
      if (dist < enterRadius && dist < nearestDist) {
        nearest = rid;
        nearestDist = dist;
      }
    });

    if (nearest !== session.currentLandmark) {
      if (session.landmarkTimer) {
        clearTimeout(session.landmarkTimer);
        session.landmarkTimer = null;
      }
      session.currentLandmark = nearest;
      const prompt = $('#region-enter-prompt');
      if (nearest === null) {
        prompt.classList.add('hidden');
      } else {
        const region = REGIONS[nearest];
        $('#prompt-text').textContent = `进入 ${region.name} · ${region.theme}`;
        prompt.classList.remove('hidden');
      }
    }
  }

  // 检测传送点距离
  function checkWaypointProximity() {
    const enterRadius = 80;
    let nearest = null;
    let nearestDist = Infinity;

    $$('.waypoint').forEach(wp => {
      const wid = parseInt(wp.dataset.waypoint);
      const wx = parseInt(wp.style.left);
      const wy = parseInt(wp.style.top);
      const dist = Math.hypot(session.playerX - wx, session.playerY - wy);
      if (dist < enterRadius && dist < nearestDist) {
        nearest = wid;
        nearestDist = dist;
      }
    });

    if (nearest !== session.currentWaypoint) {
      session.currentWaypoint = nearest;
      const prompt = $('#waypoint-prompt');
      if (nearest === null) {
        prompt.classList.add('hidden');
      } else if (!session.activatedWaypoints.includes(nearest)) {
        prompt.classList.remove('hidden');
      } else {
        prompt.classList.add('hidden');
        // 已激活的传送点直接打开传送菜单
        showTeleportMenu();
      }
    }
  }

  // 移动端交互按钮：检测最近的可交互目标并更新按钮状态
  function updateMobileActionButton() {
    const btn = $('#mobile-action-btn');
    if (!btn) return;
    if (!session.mapActive || session.controlsLocked) {
      btn.classList.add('hidden');
      return;
    }

    const candidates = [];

    $$('.landmark').forEach(lm => {
      const rid = parseInt(lm.dataset.region);
      const lx = parseInt(lm.style.left);
      const ly = parseInt(lm.style.top);
      const dist = Math.hypot(session.playerX - lx, session.playerY - ly);
      if (dist < 100) candidates.push({ type: 'landmark', id: rid, dist, label: '进入' });
    });

    $$('.waypoint').forEach(wp => {
      const wid = parseInt(wp.dataset.waypoint);
      const wx = parseInt(wp.style.left);
      const wy = parseInt(wp.style.top);
      const dist = Math.hypot(session.playerX - wx, session.playerY - wy);
      if (dist < 80) {
        const activated = session.activatedWaypoints.includes(wid);
        candidates.push({ type: 'waypoint', id: wid, dist, label: activated ? '传送' : '激活' });
      }
    });

    $$('.npc').forEach(npc => {
      const npcId = parseInt(npc.dataset.npc);
      const nx = parseInt(npc.style.left);
      const ny = parseInt(npc.style.top);
      const dist = Math.hypot(session.playerX - nx, session.playerY - ny);
      if (dist < 90) candidates.push({ type: 'npc', id: npcId, dist, label: '对话' });
    });

    Object.values(MECHANISMS).forEach(mech => {
      if (mech.restored()) return;
      const dist = Math.hypot(session.playerX - mech.x, session.playerY - mech.y);
      if (dist < mech.radius) candidates.push({ type: 'mechanism', id: mech.id, dist, label: mech.actionLabel || '修复' });
    });

    const target = candidates.sort((a, b) => a.dist - b.dist)[0] || null;
    if (target) {
      btn.classList.remove('hidden');
      const label = btn.querySelector('.action-btn-label');
      if (label) label.textContent = target.label;
      session.mobileActionTarget = target;
    } else {
      btn.classList.add('hidden');
      session.mobileActionTarget = null;
    }
  }

  function triggerMobileAction() {
    const target = session.mobileActionTarget;
    if (!target) return;
    sfx('click');
    if (target.type === 'landmark') {
      tryEnterRegion(target.id);
    } else if (target.type === 'waypoint') {
      if (session.activatedWaypoints.includes(target.id)) {
        showTeleportMenu();
      } else {
        activateWaypoint(target.id);
      }
    } else if (target.type === 'npc') {
      startNpcDialog(target.id);
    } else if (target.type === 'mechanism') {
      openMechanism(target.id);
    }
  }

  // ========== 收集飞入动画：拾取物沿抛物线飞进 HUD，数字弹跳（原神式拾取反馈） ==========
  function flyLootToHud(worldX, worldY, emoji, targetSel) {
    const world = $('#open-world');
    const target = $(targetSel);
    if (!world || !target) return;
    const startX = worldX - session.cameraX;
    const startY = worldY - session.cameraY;
    const rect = target.getBoundingClientRect();
    const worldRect = world.getBoundingClientRect();
    const endX = rect.left + rect.width / 2 - worldRect.left;
    const endY = rect.top + rect.height / 2 - worldRect.top;
    const el = document.createElement('div');
    el.className = 'fly-loot';
    el.textContent = emoji;
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';
    world.appendChild(el);
    const duration = 600;
    const t0 = performance.now();
    const peakY = Math.min(startY, endY) - 80;
    function step(now) {
      const t = Math.min(1, (now - t0) / duration);
      const inv = 1 - t;
      const midX = (startX + endX) / 2;
      const x = inv * inv * startX + 2 * inv * t * midX + t * t * endX;
      const y = inv * inv * startY + 2 * inv * t * peakY + t * t * endY;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = `scale(${1 - t * 0.5})`;
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        el.remove();
        target.classList.remove('hud-bounce');
        void target.offsetWidth;
        target.classList.add('hud-bounce');
        setTimeout(() => target.classList.remove('hud-bounce'), 420);
      }
    }
    requestAnimationFrame(step);
  }

  // ========== 材料收集 ==========
  function checkMaterials() {
    $$('.material').forEach((item, idx) => {
      if (state.map.collectedMaterials.includes(idx)) return;
      const mx = parseInt(item.style.left);
      const my = parseInt(item.style.top);
      if (Math.hypot(session.playerX - mx, session.playerY - my) >= 42) return;
      const kind = item.dataset.material || 'windSeed';
      state.map.collectedMaterials.push(idx);
      state.materials[kind] = (state.materials[kind] || 0) + 1;
      item.classList.add('collected');
      sfx('collect');
      const matEmoji = { windSeed: '🍃', windLamp: '🏮', plank: '🪵', windCrystal: '🔮' }[kind] || '🍃';
      flyLootToHud(mx, my, matEmoji, `#mini-mat-${kind}`);
      saveGame();
      updateMapHud();
      trackEvent('material_collect', { kind, total: state.materials[kind] });
    });
  }

  // ========== 填充式机关 ==========
  function checkMechanismProximity() {
    let nearest = null;
    let nearestDist = Infinity;
    Object.values(MECHANISMS).forEach(mech => {
      const dist = Math.hypot(session.playerX - mech.x, session.playerY - mech.y);
      if (dist < mech.radius && dist < nearestDist) {
        nearest = mech.id;
        nearestDist = dist;
      }
    });
    session.currentMechanism = nearest;
  }

  function openMechanism(id) {
    const mech = MECHANISMS[id];
    if (!mech) return;
    if (!session.mechanism || session.mechanism.id !== id) {
      session.mechanism = {
        id,
        estimate: null,
        estimateValue: Math.max(1, (mech.estimateTarget || 5) - 2),
        placed: 0,
        placedCells: mech.type === 'grid' ? Array(mech.rows * mech.cols).fill(false) : null,
        zones: mech.type === 'distribute' ? Array(mech.zones).fill(0) : null,
        activeZone: 0,
        failCount: 0,
        resolved: false
      };
    }
    if (mech.restored()) {
      session.mechanism.resolved = true;
    }
    stopMapMovement();
    renderMechanism();
    $('#mechanism-panel').classList.remove('hidden');
    syncControlsLock();
    trackEvent('mechanism_open', { id });
  }

  function closeMechanism() {
    $('#mechanism-panel').classList.add('hidden');
    syncControlsLock();
    focusWorldMap();
  }

  const MECH_VERIFY_LABELS = { fill: '启动风车！', fillTo: '启动风核！', grid: '点亮灯塔！' };
  const MECH_PLACE_LABELS = { fill: '放一颗', fillTo: '放一颗', grid: '安一盏', distribute: '放一块', balance: '放一颗' };
  const MECH_TAKE_LABELS = { fill: '取回一颗', fillTo: '取回一颗', grid: '取一盏', distribute: '退回一块', balance: '取一颗' };

  function mechInv(mech) { return state.materials[mech.material] || 0; }

  function mechWobble() {
    const sub = $('#mech-entity-sub');
    if (!sub) return;
    sub.classList.remove('wobble');
    void sub.offsetWidth;
    sub.classList.add('wobble');
  }

  function mechButton(label, primary, onClick, disabled, id) {
    const b = document.createElement('button');
    b.className = primary ? 'genshin-btn primary' : 'genshin-btn small';
    b.textContent = label;
    b.disabled = !!disabled;
    if (id) b.id = id;
    b.addEventListener('click', onClick);
    return b;
  }

  function setMechFeedback(text, warn) {
    const fb = $('#mech-feedback');
    fb.className = 'mech-feedback' + (warn ? ' warn' : '');
    fb.textContent = text;
  }

  // 机关面板实体图标：SVG 化（平台无关渲染，修好后变金色）
  function mechEntitySvg(mech) {
    const lit = mech.restored();
    const glow = lit ? '#ffd964' : '#9fb4c8';
    if (mech.type === 'fillTo') {
      return `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="14" fill="${lit ? '#ffd964' : '#3b5a74'}" stroke="${glow}" stroke-width="2"/><circle cx="24" cy="24" r="20" fill="none" stroke="${glow}" stroke-width="1" opacity="0.55"/></svg>`;
    }
    if (mech.type === 'fill') {
      return `<svg viewBox="0 0 48 48"><path d="M20 46 L24 18 L28 46 Z" fill="#8a6f4d"/><path d="M24 18 L24 4 M24 18 L40 13 M24 18 L8 13 M24 18 L24 32" stroke="${glow}" stroke-width="4.5" stroke-linecap="round"/><circle cx="24" cy="18" r="4" fill="#e8d49a"/></svg>`;
    }
    if (mech.type === 'grid') {
      return `<svg viewBox="0 0 48 48"><rect x="18" y="20" width="12" height="26" fill="#8a6f4d"/><circle cx="24" cy="14" r="8" fill="${lit ? '#ffd964' : '#3b5a74'}" stroke="${glow}" stroke-width="2"/></svg>`;
    }
    if (mech.type === 'distribute') {
      return `<svg viewBox="0 0 48 48"><path d="M6 34 Q24 20 42 34" stroke="${glow}" stroke-width="5" fill="none" stroke-linecap="round"/><line x1="10" y1="39" x2="38" y2="39" stroke="${glow}" stroke-width="3" stroke-linecap="round"/></svg>`;
    }
    return `<svg viewBox="0 0 48 48"><line x1="24" y1="6" x2="24" y2="40" stroke="${glow}" stroke-width="3"/><line x1="8" y1="14" x2="40" y2="14" stroke="${glow}" stroke-width="3"/><path d="M4 14 L12 14 L8 25 Z" fill="#8a6f4d"/><path d="M36 14 L44 14 L40 25 Z" fill="#8a6f4d"/><rect x="15" y="40" width="18" height="4" rx="2" fill="#8a6f4d"/></svg>`;
  }

  function renderMechanism() {
    const mech = MECHANISMS[session.mechanism?.id];
    if (!mech) return;
    const m = session.mechanism;
    $('#mech-entity-emoji').innerHTML = mechEntitySvg(mech);
    const sub = $('#mech-entity-sub');
    sub.textContent = mech.subEmoji;
    sub.classList.toggle('spinning', mech.restored());
    sub.classList.toggle('lit', mech.restored());
    $('#mechanism-title').textContent = mech.title;
    $('#mech-symbol-freeze').classList.add('hidden');

    if (mech.restored()) {
      $('#mechanism-estimate').classList.add('hidden');
      $('#mechanism-fill').classList.remove('hidden');
      $('#mech-interaction').innerHTML = '';
      $('#mech-actions').innerHTML = '';
      setMechFeedback(mech.restoreText, false);
      $('#mech-inventory').textContent = `${mech.itemEmoji} × ${mechInv(mech)}`;
      return;
    }

    // 估算步骤已移除：开面板直接进投放，物理反馈说话
    $('#mechanism-estimate').classList.add('hidden');
    $('#mechanism-fill').classList.remove('hidden');
    renderMechInteraction(mech, m);
  }

  function renderMechInteraction(mech, m) {
    if (mech.type === 'fill' || mech.type === 'fillTo') renderFillInteract(mech, m);
    else if (mech.type === 'grid') renderGridInteract(mech, m);
    else if (mech.type === 'distribute') renderDistributeInteract(mech, m);
    else if (mech.type === 'balance') renderBalanceInteract(mech, m);
    $('#mech-inventory').textContent = `${mech.itemEmoji} × ${mechInv(mech)}`;
  }

  // ---------- fill / fillTo：槽位填充（fillTo 有锁定初始量） ----------
  function renderFillInteract(mech, m, feedback) {
    const start = mech.start || 0;
    const zone = $('#mech-interaction');
    zone.innerHTML = '';
    const slotsEl = document.createElement('div');
    slotsEl.className = 'mech-slots';
    const total = Math.max(mech.need, start + m.placed);
    for (let i = 0; i < total; i++) {
      const slot = document.createElement('div');
      const prefilled = i < start;
      const filled = i < start + m.placed;
      slot.className = 'mech-slot' + (prefilled ? ' prefilled' : '') + (filled && !prefilled ? ' filled' : '');
      if (!filled && feedback === 'short') slot.classList.add('empty-glow');
      slot.textContent = filled ? mech.itemEmoji : mech.slotEmoji;
      slotsEl.appendChild(slot);
    }
    zone.appendChild(slotsEl);

    const actions = $('#mech-actions');
    actions.innerHTML = '';
    actions.appendChild(mechButton(MECH_VERIFY_LABELS[mech.type] || '启动！', true, verifyMechanism, false, 'btn-mech-verify'));
    actions.appendChild(mechButton(MECH_PLACE_LABELS[mech.type], false, placeMaterial,
      mechInv(mech) <= 0 || start + m.placed >= mech.need + 2, 'btn-mech-place'));
    actions.appendChild(mechButton(MECH_TAKE_LABELS[mech.type], false, takeMaterial, m.placed <= 0, 'btn-mech-take'));

    if (feedback === 'short') setMechFeedback(`还差 ${mech.need - start - m.placed} 颗！去收集`, true);
    else if (feedback === 'over') setMechFeedback('太多了！取回几颗', true);
    else setMechFeedback(`${start + m.placed} / ${mech.need}`, false);
  }

  // ---------- grid：行列安放 ----------
  function renderGridInteract(mech, m, feedback) {
    const zone = $('#mech-interaction');
    zone.innerHTML = '';
    const total = mech.rows * mech.cols;
    const grid = document.createElement('div');
    grid.className = 'mech-grid';
    grid.style.gridTemplateColumns = `repeat(${mech.cols}, 1fr)`;
    m.placedCells.forEach((filled, i) => {
      const cell = document.createElement('div');
      const row = Math.floor(i / mech.cols);
      const rowFull = m.placedCells.slice(row * mech.cols, (row + 1) * mech.cols).every(Boolean);
      cell.className = 'mech-grid-cell' + (filled ? ' filled' : '') + (!filled && feedback === 'short' && !rowFull ? ' empty-glow' : '');
      cell.textContent = filled ? mech.itemEmoji : mech.slotEmoji;
      grid.appendChild(cell);
    });
    zone.appendChild(grid);
    // 行列计数：完成几行就显示几次"每行×行数"
    const doneRows = Math.floor(m.placedCells.filter(Boolean).length / mech.cols);
    const counter = document.createElement('div');
    counter.className = 'mech-grid-counter';
    counter.textContent = doneRows > 0
      ? `${mech.cols} × ${doneRows} = ${mech.cols * doneRows}（${mech.rows} 行共 ${total}）`
      : `${mech.rows} 行 ${mech.cols} 列，共 ${total} 盏`;
    zone.appendChild(counter);

    const placedCount = m.placedCells.filter(Boolean).length;
    const actions = $('#mech-actions');
    actions.innerHTML = '';
    actions.appendChild(mechButton(MECH_VERIFY_LABELS.grid, true, verifyMechanism, false, 'btn-mech-verify'));
    actions.appendChild(mechButton(MECH_PLACE_LABELS.grid, false, placeMaterial,
      mechInv(mech) <= 0 || placedCount >= total, 'btn-mech-place'));
    actions.appendChild(mechButton(MECH_TAKE_LABELS.grid, false, takeMaterial, placedCount <= 0, 'btn-mech-take'));

    if (feedback === 'short') setMechFeedback('还有空位！继续安', true);
    else setMechFeedback(`${placedCount} / ${total}`, false);
  }

  // ---------- distribute：均分，桥面实时倾斜 ----------
  function renderDistributeInteract(mech, m, feedback) {
    const zone = $('#mech-interaction');
    zone.innerHTML = '';
    // 桥面：按两端差值倾斜
    const tilt = Math.max(-14, Math.min(14, (m.zones[0] - m.zones[m.zones.length - 1]) * 4));
    const bridge = document.createElement('div');
    bridge.className = 'mech-bridge';
    bridge.style.transform = `rotate(${tilt}deg)`;
    bridge.textContent = '🌉';
    zone.appendChild(bridge);

    const zonesEl = document.createElement('div');
    zonesEl.className = 'mech-zones';
    m.zones.forEach((count, z) => {
      const zoneBtn = document.createElement('button');
      zoneBtn.className = 'mech-zone' + (z === m.activeZone ? ' active' : '');
      zoneBtn.innerHTML = `${mech.zoneName}${z + 1}<br><strong>${'▰'.repeat(count) || '空'}</strong><br><span>${count} 块</span>`;
      zoneBtn.addEventListener('click', () => {
        m.activeZone = z;
        sfx('click');
        renderMechInteraction(mech, m);
      });
      zonesEl.appendChild(zoneBtn);
    });
    zone.appendChild(zonesEl);

    const sum = m.zones.reduce((a, b) => a + b, 0);
    const actions = $('#mech-actions');
    actions.innerHTML = '';
    actions.appendChild(mechButton(MECH_PLACE_LABELS.distribute, true, placeMaterial,
      mechInv(mech) <= 0 || sum >= mech.total, 'btn-mech-place'));
    actions.appendChild(mechButton(MECH_TAKE_LABELS.distribute, false, takeMaterial, m.zones[m.activeZone] <= 0, 'btn-mech-take'));

    if (feedback === 'uneven') setMechFeedback('桥还歪着…调整下', true);
    else setMechFeedback(`已铺 ${sum} / ${mech.total}`, false);
  }

  // ---------- balance：双盘配平，横梁实时倾斜 ----------
  function renderBalanceInteract(mech, m) {
    const zone = $('#mech-interaction');
    zone.innerHTML = '';
    const tilt = Math.max(-16, Math.min(16, (mech.leftStart - m.placed) * 4));
    const beam = document.createElement('div');
    beam.className = 'mech-beam';
    beam.style.transform = `rotate(${tilt}deg)`;
    beam.innerHTML = `<span class="mech-pan">${mech.itemEmoji.repeat(mech.leftStart)}<small>左 ${mech.leftStart}</small></span>` +
      `<span class="mech-pivot">⚖️</span>` +
      `<span class="mech-pan">${mech.itemEmoji.repeat(m.placed) || '◌'}<small>右 ${m.placed}</small></span>`;
    zone.appendChild(beam);

    const actions = $('#mech-actions');
    actions.innerHTML = '';
    actions.appendChild(mechButton(MECH_PLACE_LABELS.balance, true, placeMaterial,
      mechInv(mech) <= 0 || m.placed >= mech.leftStart + 3, 'btn-mech-place'));
    actions.appendChild(mechButton(MECH_TAKE_LABELS.balance, false, takeMaterial, m.placed <= 0, 'btn-mech-take'));
    setMechFeedback(m.placed === mech.leftStart ? '平衡了！' : `左 ${mech.leftStart} · 右 ${m.placed}`, false);
  }

  function commitEstimate() {
    const mech = MECHANISMS[session.mechanism?.id];
    const m = session.mechanism;
    if (!mech || !m || m.estimate !== null) return;
    m.estimate = m.estimateValue || 5;
    sfx('click');
    trackEvent('mechanism_estimate', { id: mech.id, estimate: m.estimate, target: mech.estimateTarget });
    renderMechanism();
    showHint('猜完啦？放进去验证吧');
  }

  function placeMaterial() {
    const mech = MECHANISMS[session.mechanism?.id];
    const m = session.mechanism;
    if (!mech || !m || m.resolved || mech.restored() || mechInv(mech) <= 0) return;
    sfx('click');
    if (mech.type === 'fill' || mech.type === 'fillTo') {
      if ((mech.start || 0) + m.placed >= mech.need + 2) return;
      state.materials[mech.material]--;
      m.placed++;
      renderMechInteraction(mech, m);
    } else if (mech.type === 'grid') {
      const index = m.placedCells.indexOf(false);
      if (index === -1) return;
      state.materials[mech.material]--;
      m.placedCells[index] = true;
      renderMechInteraction(mech, m);
      // 行列结构即时反馈：刚安满一行就报一次"每行×行数"
      const placedCount = m.placedCells.filter(Boolean).length;
      if (placedCount % mech.cols === 0) {
        setMechFeedback(`${mech.cols} × ${placedCount / mech.cols} = ${placedCount}`, false);
      }
    } else if (mech.type === 'distribute') {
      const sum = m.zones.reduce((a, b) => a + b, 0);
      if (sum >= mech.total) return;
      state.materials[mech.material]--;
      m.zones[m.activeZone]++;
      checkDistribute(mech, m);
    } else if (mech.type === 'balance') {
      if (m.placed >= mech.leftStart + 3) return;
      state.materials[mech.material]--;
      m.placed++;
      checkBalance(mech, m);
    }
    updateMapHud();
    saveGame();
  }

  function takeMaterial() {
    const mech = MECHANISMS[session.mechanism?.id];
    const m = session.mechanism;
    if (!mech || !m || m.resolved || mech.restored()) return;
    sfx('click');
    if (mech.type === 'fill' || mech.type === 'fillTo') {
      if (m.placed <= 0) return;
      m.placed--;
      state.materials[mech.material]++;
      renderMechInteraction(mech, m);
    } else if (mech.type === 'grid') {
      const index = m.placedCells.lastIndexOf(true);
      if (index === -1) return;
      m.placedCells[index] = false;
      state.materials[mech.material]++;
      renderMechInteraction(mech, m);
    } else if (mech.type === 'distribute') {
      if (m.zones[m.activeZone] <= 0) return;
      m.zones[m.activeZone]--;
      state.materials[mech.material]++;
      checkDistribute(mech, m, true);
    } else if (mech.type === 'balance') {
      if (m.placed <= 0) return;
      m.placed--;
      state.materials[mech.material]++;
      checkBalance(mech, m);
    }
    updateMapHud();
    saveGame();
  }

  // 孩子主动检验（fill/fillTo/grid）：物理反馈"不够/正好/太多"
  function verifyMechanism() {
    const mech = MECHANISMS[session.mechanism?.id];
    const m = session.mechanism;
    if (!mech || !m || m.resolved || mech.restored()) return;
    let ok = false;
    let short = true;
    if (mech.type === 'fill' || mech.type === 'fillTo') {
      const placedTotal = (mech.start || 0) + m.placed;
      ok = placedTotal === mech.need;
      short = placedTotal < mech.need;
    } else if (mech.type === 'grid') {
      ok = m.placedCells.every(Boolean);
      short = true;
    }
    if (ok) {
      updateMapHud();
      saveGame();
      resolveMechanismSuccess(mech, m);
      return;
    }
    m.failCount++;
    sfx('wrong');
    mechWobble();
    renderMechInteraction(mech, m);
    if (mech.type === 'grid') renderGridInteract(mech, m, 'short');
    else renderFillInteract(mech, m, short ? 'short' : 'over');
    trackEvent(short ? 'mechanism_short' : 'mechanism_over', { id: mech.id, need: mech.need });
  }

  // distribute 实时检验：全部铺完且均分 → 成功；桥面随时按差值倾斜
  function checkDistribute(mech, m, fromUndo = false) {
    const sum = m.zones.reduce((a, b) => a + b, 0);
    if (sum === mech.total) {
      const per = mech.total / m.zones.length;
      if (m.zones.every(count => count === per)) {
        updateMapHud();
        saveGame();
        resolveMechanismSuccess(mech, m);
        return;
      }
      if (!fromUndo) {
        m.failCount++;
        sfx('wrong');
        mechWobble();
      }
      renderDistributeInteract(mech, m, 'uneven');
      trackEvent('mechanism_uneven', { id: mech.id, zones: [...m.zones] });
      return;
    }
    renderMechInteraction(mech, m);
  }

  // balance 实时检验：左右相等 → 成功
  function checkBalance(mech, m) {
    if (m.placed === mech.leftStart) {
      updateMapHud();
      saveGame();
      resolveMechanismSuccess(mech, m);
      return;
    }
    renderMechInteraction(mech, m);
  }

  // 成功：实体点亮 + 符号定格 + 估算对照，然后走关卡完成链路
  function resolveMechanismSuccess(mech, m) {
    if (m.resolved) return;
    m.resolved = true;
    sfx('win');
    renderMechInteraction(mech, m);
    const sub = $('#mech-entity-sub');
    sub.classList.add('spinning', 'lit');
    const freeze = $('#mech-symbol-freeze');
    freeze.innerHTML = mech.symbols.join('<br>');
    freeze.classList.remove('hidden');
    trackEvent('mechanism_success', { id: mech.id, failCount: m.failCount });
    setTimeout(() => {
      closeMechanism();
      showHint('修好啦！', 2500);
      finishMechanism(mech, m);
    }, 1800);
  }

  // 机关完成 → 复用关卡完成链路（星级、奖励、世界变化、成就、任务）
  function finishMechanism(mech, m) {
    // 复练机关（levelId 为空）：一次性奖励，无关卡完成链路
    if (!mech.levelId) {
      mech.applyWorldChange();
      grantRewards({ gems: 20, exp: 30 });
      sfx('win');
      showHint(`${mech.title}修好了！+20 💎 +30 经验`, 3000);
      checkAchievements();
      saveGame();
      trackEvent('practice_mechanism_complete', { id: mech.id, failCount: m.failCount });
      return;
    }
    const regionId = LEVELS.findIndex(list => list.some(item => item.id === mech.levelId));
    const level = regionId >= 0 ? LEVELS[regionId].find(item => item.id === mech.levelId) : null;
    if (!level) return;
    const region = REGIONS[regionId];
    const firstClear = !state.player.completedLevels.includes(level.id);
    const independentCorrect = m.failCount === 0 ? 2 : (m.failCount <= 2 ? 1 : 0);
    const starsThisRun = Learning.calculateStars({
      questionCount: 2,
      independentCorrect,
      transferFirstTry: m.failCount === 0,
      transferHintTier: 0
    });
    state.player.levelStars[level.id] = Math.max(state.player.levelStars[level.id] || 0, starsThisRun);
    const missionId = Learning.WIND_MISSIONS[level.id]?.id;
    if (missionId && !state.learning.completedPuzzles.includes(missionId)) {
      state.learning.completedPuzzles.push(missionId);
    }
    state.learning = Learning.clearMissionCheckpoint(state.learning, level.id);
    mech.applyWorldChange();
    const levelQuestNote = questCompletionNote(recordQuestProgress('level', 1));
    if (levelQuestNote) showHint(levelQuestNote, 3000);
    const rewards = firstClear ? { gems: 60 + (hasPassive('gemFind') ? 15 : 0), exp: 100 } : { gems: 0, exp: 0 };
    let levelsGained = 0;
    if (firstClear) {
      state.player.completedLevels.push(level.id);
      levelsGained = grantRewards(rewards);
    }
    const allCompleted = LEVELS[regionId].every(item => state.player.completedLevels.includes(item.id));
    let newlyUnlockedRegion = null;
    if (allCompleted && regionId < REGIONS.length - 1 && !state.player.unlockedRegions.includes(regionId + 1)) {
      state.player.unlockedRegions.push(regionId + 1);
      newlyUnlockedRegion = regionId + 1;
    }
    checkAchievements();
    saveGame();
    session.lastProgressAt = performance.now();
    showGuideBeam(8000); // 完成后亮光柱，指向下一个目标
    trackEvent('level_complete', { levelId: level.id, source: 'mechanism', firstClear, stars: starsThisRun });
    showReward(level, region, {
      rewards,
      stars: starsThisRun,
      firstClear,
      allCompleted,
      newlyUnlockedRegion,
      levelsGained,
      completionSource: 'mechanism'
    });
  }

  // ========== 全屏探险地图 ==========
  let worldMapImage = null;
  function getWorldMapImage() {
    if (!worldMapImage) {
      worldMapImage = new Image();
      worldMapImage.src = VISUAL_ASSETS.world;
    }
    return worldMapImage;
  }

  function openBigmap() {
    drawBigmap();
    $('#bigmap-modal').classList.remove('hidden');
    syncControlsLock();
    // 目标脉动圈需要重绘：打开期间 500ms 刷新一次
    if (session.bigmapTimer) clearInterval(session.bigmapTimer);
    session.bigmapTimer = setInterval(() => {
      if ($('#bigmap-modal').classList.contains('hidden')) {
        clearInterval(session.bigmapTimer);
        session.bigmapTimer = null;
        return;
      }
      drawBigmap();
    }, 500);
    trackEvent('bigmap_open');
  }

  function closeBigmap() {
    $('#bigmap-modal').classList.add('hidden');
    if (session.bigmapTimer) {
      clearInterval(session.bigmapTimer);
      session.bigmapTimer = null;
    }
    syncControlsLock();
    focusWorldMap();
  }

  function drawBigmap() {
    const canvas = $('#bigmap-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const scaleX = w / WORLD.W;
    const scaleY = h / WORLD.H;
    const hexToRgba = (hex, alpha) => {
      const value = parseInt(hex.slice(1), 16);
      return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
    };

    // 手绘全景插画为底（与大世界地面同一张图，孩子一眼认出"这就是我跑的地方"）
    const worldImg = getWorldMapImage();
    if (worldImg.complete && worldImg.naturalWidth) {
      const coverScale = Math.max(w / worldImg.naturalWidth, h / worldImg.naturalHeight);
      const drawW = worldImg.naturalWidth * coverScale;
      const drawH = worldImg.naturalHeight * coverScale;
      ctx.drawImage(worldImg, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
      // 轻微压暗让标记更醒目
      ctx.fillStyle = 'rgba(10,16,26,0.28)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#1a2332';
      ctx.fillRect(0, 0, w, h);
      // 图片未就绪时先出素底，加载完成后重绘
      worldImg.addEventListener('load', () => {
        if (!$('#bigmap-modal').classList.contains('hidden')) drawBigmap();
      }, { once: true });
    }
    // 插画已提供地形，不再叠色块

    // 道路
    ctx.strokeStyle = 'rgba(200,176,138,0.6)';
    ctx.lineWidth = 2;
    if (LAYOUT && Array.isArray(LAYOUT.roads)) {
      LAYOUT.roads.forEach(road => {
        ctx.beginPath();
        road.forEach((p, i) => {
          const x = p[0] * scaleX;
          const y = p[1] * scaleY;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        });
        ctx.stroke();
      });
    }

    // 未解锁区域迷雾：暗色罩住，只露轮廓
    $$('.landmark').forEach(lm => {
      const rid = parseInt(lm.dataset.region);
      if (state.player.unlockedRegions.includes(rid)) return;
      const x = parseInt(lm.style.left) * scaleX;
      const y = parseInt(lm.style.top) * scaleY;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 60);
      grad.addColorStop(0, 'rgba(5,10,16,0.75)');
      grad.addColorStop(1, 'rgba(5,10,16,0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, 60, 0, Math.PI * 2); ctx.fill();
    });

    // 地标：大图标 + 名称（未解锁灰显带锁）
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    $$('.landmark').forEach(lm => {
      const rid = parseInt(lm.dataset.region);
      const x = parseInt(lm.style.left) * scaleX;
      const y = parseInt(lm.style.top) * scaleY;
      const unlocked = state.player.unlockedRegions.includes(rid);
      const region = REGIONS[rid];
      ctx.font = '22px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = unlocked ? 1 : 0.35;
      ctx.fillText(region?.emoji || '❔', x, y);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = unlocked ? '#fff4d6' : '#77808c';
      ctx.fillText(region?.name || '未知', x, y + 23);
      if (!unlocked) {
        ctx.font = '12px sans-serif';
        ctx.fillText('🔒', x + 18, y - 14);
      }
      ctx.globalAlpha = 1;
    });
    ctx.shadowBlur = 0;

    // 机关：未修复的只画 🔧 图标（机关密集，名字会糊成一团，详情靠小地图和光柱）
    Object.values(MECHANISMS).forEach(mech => {
      if (mech.restored()) return;
      const x = mech.x * scaleX;
      const y = mech.y * scaleY;
      ctx.font = '15px sans-serif';
      ctx.fillText('🔧', x, y);
    });

    // 传送点：💠 + 名称；已激活亮色，未激活暗色
    $$('.waypoint').forEach(wp => {
      const wid = parseInt(wp.dataset.waypoint);
      const x = parseInt(wp.style.left) * scaleX;
      const y = parseInt(wp.style.top) * scaleY;
      const active = session.activatedWaypoints.includes(wid);
      const label = wp.querySelector('.waypoint-label')?.textContent || '';
      ctx.font = '15px sans-serif';
      ctx.globalAlpha = active ? 1 : 0.45;
      ctx.fillText('💠', x, y);
      ctx.font = '10px sans-serif';
      ctx.fillStyle = active ? '#9fd6e3' : '#77808c';
      ctx.fillText(label, x, y + 15);
      ctx.globalAlpha = 1;
      if (active) {
        ctx.strokeStyle = 'rgba(82,184,198,0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.stroke();
      }
    });

    // 当前目标：金色脉动圈（与光柱同一目标）
    const target = currentObjectiveTarget();
    if (target) {
      const x = target.x * scaleX;
      const y = target.y * scaleY;
      const pulse = (performance.now() % 1200) / 1200;
      ctx.strokeStyle = `rgba(231,185,87,${0.8 - pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 12 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
    }

    // 玩家位置：金色圆点 + 白圈
    const px = session.playerX * scaleX;
    const py = session.playerY * scaleY;
    ctx.fillStyle = '#ffd964';
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.stroke();
  }

  // 点击已激活传送点传送
  function teleportToWaypoint(wid) {
    const wp = $(`#waypoint-${wid}`);
    if (!wp) return;
    const wx = parseInt(wp.style.left);
    const wy = parseInt(wp.style.top);
    session.playerX = Math.max(60, Math.min(WORLD.W - 60, wx));
    session.playerY = Math.max(60, Math.min(WORLD.H - 60, wy + 90));
    session.targetX = session.playerX;
    session.targetY = session.playerY;
    session.isMoving = false;
    session.moveMode = null;
    session.velX = 0;
    session.velY = 0;
    updatePlayerSprite();
    updateCamera();
    closeBigmap();
    sfx('burst');
    showHint(`已传送到「${wp.querySelector('.waypoint-label')?.textContent || '传送点'}」！`);
    trackEvent('waypoint_teleport', { waypoint: wid });
  }

  function handleBigmapClick(e) {
    const canvas = $('#bigmap-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const worldX = ((e.clientX - rect.left) * scaleX) / (canvas.width / WORLD.W);
    const worldY = ((e.clientY - rect.top) * scaleY) / (canvas.height / WORLD.H);
    let hit = null;
    let hitDist = Infinity;
    $$('.waypoint').forEach(wp => {
      const wid = parseInt(wp.dataset.waypoint);
      const x = parseInt(wp.style.left);
      const y = parseInt(wp.style.top);
      const dist = Math.hypot(worldX - x, worldY - y);
      if (dist < 260 && dist < hitDist) {
        hit = wid;
        hitDist = dist;
      }
    });
    if (hit === null) return;
    if (!session.activatedWaypoints.includes(hit)) {
      showHint('这个传送点还没激活，先跑到它旁边点亮吧！');
      return;
    }
    teleportToWaypoint(hit);
  }

  // 激活传送点
  function activateWaypoint(wid) {
    if (!session.activatedWaypoints.includes(wid)) {
      session.activatedWaypoints.push(wid);
      state.map.activatedWaypoints = [...session.activatedWaypoints];
      sfx('correct');
      // 每日/每周任务：激活传送点计数
      showHint(`💠 传送点已激活！以后可以随时传送到这里。${questCompletionNote(recordQuestProgress('waypoint', 1))}`);
      $('#waypoint-prompt').classList.add('hidden');
      saveGame();
      checkAchievements();
    }
  }

  // 显示传送菜单
  function showTeleportMenu() {
    const menu = $('#teleport-menu');
    const list = $('#teleport-list');
    list.innerHTML = '';

    // 添加当前位置选项（关闭菜单）
    const regions = REGIONS.map((r, i) => ({ ...r, id: i }));
    regions.forEach(region => {
      const unlocked = state.player.unlockedRegions.includes(region.id);
      const item = document.createElement('div');
      item.className = 'teleport-item' + (unlocked ? '' : ' locked');
      item.innerHTML = `
        <div class="tp-icon">${region.emoji}</div>
        <div class="tp-name">${region.name}</div>
        <div class="tp-theme">${region.theme}</div>
      `;
      if (unlocked) {
        item.addEventListener('click', () => {
          teleportToRegion(region.id);
        });
      }
      list.appendChild(item);
    });

    menu.classList.remove('hidden');
    syncControlsLock();
  }

  // 传送到区域
  function teleportToRegion(rid) {
    const lm = $(`#landmark-${rid}`);
    if (!lm) return;
    const lx = parseInt(lm.style.left);
    const ly = parseInt(lm.style.top);
    session.playerX = Math.max(60, Math.min(WORLD.W - 60, lx));
    session.playerY = Math.max(60, Math.min(WORLD.H - 60, ly + 130));
    session.targetX = session.playerX;
    session.targetY = session.playerY;
    session.isMoving = false;
    session.moveMode = null;
    session.velX = 0;
    session.velY = 0;
    updatePlayerSprite();
    updateCamera();
    $('#teleport-menu').classList.add('hidden');
    syncControlsLock();
    sfx('burst');
    showHint(`已传送到 ${REGIONS[rid].name}！`);
  }

  // 检测收集品
  function checkCollectibles() {
    const radius = 30;
    $$('.collectible').forEach((item, idx) => {
      if (session.collectedItems.includes(idx)) return;
      const cx = parseInt(item.style.left);
      const cy = parseInt(item.style.top);
      const dist = Math.hypot(session.playerX - cx, session.playerY - cy);
      if (dist < radius) {
        session.collectedItems.push(idx);
        item.classList.add('collected');
        const gems = parseInt(item.dataset.gem) || 5;
        grantRewards({ gems });
        flyLootToHud(cx, cy, '💎', '.mini-gems');
        state.map.collectedItems = [...session.collectedItems];
        saveGame();
        sfx('correct');
        // 每日/每周任务：收集水晶计数，完成提示并入本次拾取提示
        showHint(`💎 获得 ${gems} 钻石！${questCompletionNote(recordQuestProgress('crystal', 1))}`);
        updateMinimap();
        checkAchievements();
      }
    });

    // 宝箱
    $$('.chest').forEach((chest, idx) => {
      if (session.openedChests.includes(idx)) return;
      const cx = parseInt(chest.style.left);
      const cy = parseInt(chest.style.top);
      const dist = Math.hypot(session.playerX - cx, session.playerY - cy);
      if (dist < radius + 10) {
        session.openedChests.push(idx);
        chest.classList.add('opened');
        const levelsGained = grantRewards({ gems: 20, exp: 30 });
        state.map.openedChests = [...session.openedChests];
        saveGame();
        sfx('win');
        // 每日/每周任务：开启宝箱计数
        showHint(`🎁 打开宝箱！获得 20 钻石和 30 经验！${levelsGained ? ` 等级提升到 ${state.player.level}！` : ''}${questCompletionNote(recordQuestProgress('chest', 1))}`);
        updateMinimap();
        checkAchievements();
      }
    });
  }

  function checkHiddenAreas() {
    const areaNames = {
      'forest-clearing': '林间空地',
      'mountain-peak': '群山之巅',
      'desert-oasis': '荒漠绿洲',
      'swamp-secret': '沼泽秘境',
      'star-meadow-secret': '星屑秘境',
      'echo-cave-secret': '回声密室'
    };
    if (!Array.isArray(state.map.discoveredAreas)) state.map.discoveredAreas = [];
    $$('.hidden-area').forEach(area => {
      const areaId = area.dataset.area;
      if (state.map.discoveredAreas.includes(areaId)) return;
      const x = parseInt(area.style.left);
      const y = parseInt(area.style.top);
      if (Math.hypot(session.playerX - x, session.playerY - y) >= 45) return;
      state.map.discoveredAreas.push(areaId);
      area.classList.add('discovered');
      grantRewards({ gems: 10 });
      saveGame();
      sfx('collect');
      // 每日/每周任务：发现隐藏区域计数
      showHint(`✨ 发现隐藏区域「${areaNames[areaId] || areaId}」，获得 10 钻石！${questCompletionNote(recordQuestProgress('area', 1))}`);
      checkAchievements();
    });
  }

  // 绘制小地图
  function drawMinimap() {
    const canvas = $('#minimap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const scaleX = w / WORLD.W;
    const scaleY = h / WORLD.H;
    const hexToRgba = (hex, alpha) => {
      const value = parseInt(hex.slice(1), 16);
      return `rgba(${(value >> 16) & 255},${(value >> 8) & 255},${value & 255},${alpha})`;
    };

    // 深色底
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, w, h);

    // 区域地形简图（低透明度，用于辨认区域）
    if (LAYOUT && Array.isArray(LAYOUT.blobs)) {
      LAYOUT.blobs.forEach(b => {
        const alpha = b.kind === 'sea' ? 0.55 : b.kind === 'lake' ? 0.5 : b.kind === 'mountain' ? 0.35 : b.kind === 'snow' ? 0.35 : b.kind === 'canyon' ? 0.25 : 0.18;
        const x = b.x * scaleX, y = b.y * scaleY;
        const rx = b.rx * scaleX, ry = b.ry * scaleY;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((b.rot * Math.PI) / 180);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(rx, ry));
        grad.addColorStop(0, hexToRgba(b.color, alpha));
        grad.addColorStop(1, hexToRgba(b.color, 0));
        ctx.fillStyle = grad;
        ctx.scale(1, ry / rx);
        ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
    }

    // 道路：实线，浅土黄，比虚线清晰
    ctx.strokeStyle = 'rgba(200,176,138,0.65)';
    ctx.lineWidth = 2;
    if (LAYOUT && Array.isArray(LAYOUT.roads)) {
      LAYOUT.roads.forEach(road => {
        ctx.beginPath();
        road.forEach((p, i) => {
          const x = p[0] * scaleX;
          const y = p[1] * scaleY;
          if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        });
        ctx.stroke();
      });
    }

    const diamond = (x, y, s) => {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
    };

    // 任务目标区域（与罗盘条一致）
    const currentRegion = state.player.currentRegion || 0;
    const regionLevels = LEVELS[currentRegion] || [];
    const completed = regionLevels.filter(lv => state.player.completedLevels.includes(lv.id)).length;
    const targetRid = (completed === regionLevels.length && currentRegion < REGIONS.length - 1) ? currentRegion + 1 : currentRegion;

    // 地标：区域色菱形 + emoji + 当前/目标高亮
    $$('.landmark').forEach(lm => {
      const rid = parseInt(lm.dataset.region);
      const x = parseInt(lm.style.left) * scaleX;
      const y = parseInt(lm.style.top) * scaleY;
      const unlocked = state.player.unlockedRegions.includes(rid);
      const region = REGIONS[rid];
      const color = region?.color || '#888';
      const size = rid === targetRid ? 7 : 5;

      ctx.fillStyle = unlocked ? color : '#888';
      diamond(x, y, size);
      ctx.fill();

      if (region?.emoji) {
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(region.emoji, x, y + 0.5);
      }

      // 当前区域：金色内圈
      if (rid === currentRegion) {
        ctx.strokeStyle = '#e7b957';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
      }
      // 任务目标：金色脉动外圈
      if (rid === targetRid) {
        const pulse = (performance.now() % 1200) / 1200;
        ctx.strokeStyle = `rgba(231,185,87,${0.6 - pulse * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 9 + pulse * 5, 0, Math.PI * 2); ctx.stroke();
      }
    });

    // 传送点：菱形，空心/实心区分已激活
    $$('.waypoint').forEach(wp => {
      const wid = parseInt(wp.dataset.waypoint);
      const x = parseInt(wp.style.left) * scaleX;
      const y = parseInt(wp.style.top) * scaleY;
      const active = session.activatedWaypoints.includes(wid);
      ctx.strokeStyle = active ? '#52b8c6' : '#a6d4e0';
      ctx.lineWidth = 1.5;
      diamond(x, y, 4);
      ctx.stroke();
      if (active) {
        ctx.fillStyle = '#52b8c6';
        diamond(x, y, 2.2);
        ctx.fill();
      }
    });

    // 玩家：黄色箭头，指向前进方向
    const px = session.playerX * scaleX;
    const py = session.playerY * scaleY;
    const headingMap = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
    const angle = headingMap[session.facing] || 0;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    ctx.fillStyle = '#fff8df';
    ctx.shadowColor = '#fff8df';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(5, 5);
    ctx.lineTo(-5, 5);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#287963';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // 视野框
    const viewW = ($('#open-world')?.clientWidth || 1280) * scaleX;
    const viewH = ($('#open-world')?.clientHeight || 720) * scaleY;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(session.cameraX * scaleX, session.cameraY * scaleY, viewW, viewH);
    ctx.setLineDash([]);

    // 北标
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', w / 2, 12);
  }

  function updateMinimap() {
    drawMinimap();
  }

  // 罗盘条：N 方向 + 当前任务目标区域 + 1500px 内未激活传送点，按相对方位角定位
  function updateCompass() {
    const bar = $('#compass-bar');
    if (!bar || !LAYOUT) return;
    const headingMap = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };
    const heading = headingMap[session.facing] || 0;
    const fov = (75 * Math.PI) / 180;
    const halfW = (bar.clientWidth || 420) / 2;
    const place = (el, tx, ty) => {
      if (!el) return;
      const bearing = Math.atan2(tx - session.playerX, -(ty - session.playerY)); // 世界 y 向下，北为 -y
      let rel = bearing - heading;
      while (rel > Math.PI) rel -= Math.PI * 2;
      while (rel < -Math.PI) rel += Math.PI * 2;
      if (Math.abs(rel) > fov) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.style.left = (halfW + (rel / fov) * (halfW - 16)) + 'px';
    };

    // N 方向标记
    place($('#compass-n'), session.playerX, session.playerY - 1000);

    // 当前任务目标区域地标（与任务日志同一逻辑：本区通关则指向下一区）
    const currentRegion = state.player.currentRegion || 0;
    const regionLevels = LEVELS[currentRegion] || [];
    const completed = regionLevels.filter(lv => state.player.completedLevels.includes(lv.id)).length;
    let targetRid = currentRegion;
    if (completed === regionLevels.length && currentRegion < REGIONS.length - 1) targetRid = currentRegion + 1;
    const objEl = $('#compass-objective');
    if (objEl) {
      const anchor = LAYOUT.regions[targetRid];
      if (anchor) {
        objEl.textContent = REGIONS[targetRid]?.emoji || '🚩';
        place(objEl, anchor.x, anchor.y);
      }
    }

    // 1500px 内未激活传送点（marker 池按需创建）
    if (!session.compassWpMarkers) session.compassWpMarkers = [];
    $$('.waypoint').forEach((wp, idx) => {
      let el = session.compassWpMarkers[idx];
      if (!el) {
        el = document.createElement('div');
        el.className = 'compass-marker compass-waypoint';
        el.textContent = '💠';
        bar.appendChild(el);
        session.compassWpMarkers[idx] = el;
      }
      const wid = parseInt(wp.dataset.waypoint);
      const wx = parseInt(wp.style.left);
      const wy = parseInt(wp.style.top);
      const dist = Math.hypot(session.playerX - wx, session.playerY - wy);
      if (session.activatedWaypoints.includes(wid) || dist > 1500) { el.style.display = 'none'; return; }
      place(el, wx, wy);
    });
  }

  // 区域发现：以区域锚点为圆心、半径 900；进入新区域时显示大横幅（每区域每会话一次）
  function checkRegionDiscovery() {
    if (!LAYOUT) return;
    let current = null;
    LAYOUT.regions.forEach(rg => {
      if (Math.hypot(session.playerX - rg.x, session.playerY - rg.y) < 900) current = rg.id;
    });
    if (current !== session.currentRegionArea) {
      session.currentRegionArea = current;
      if (current !== null && !session.shownRegionBanners.includes(current)) {
        session.shownRegionBanners.push(current);
        showRegionBanner(current);
      }
    }
  }

  function showRegionBanner(rid) {
    const banner = $('#region-banner');
    const region = REGIONS[rid];
    if (!banner || !region) return;
    $('#region-banner-name').textContent = region.name;
    $('#region-banner-theme').textContent = region.theme;
    banner.classList.remove('show');
    void banner.offsetWidth; // 强制重排，重启动画
    banner.classList.add('show');
    sfx('collect');
  }

  function returnToWorldMap() {
    session.mapActive = false;
    stopMapMovement();
    showScreen('world-map');
    renderMap();
    trackEvent('return_to_map', {
      region: session.currentRegionId,
      levelId: session.currentLevel?.id || null,
      x: Math.round(session.playerX),
      y: Math.round(session.playerY)
    });
  }

  // 尝试进入区域
  function tryEnterRegion(rid) {
    if (session.controlsLocked) return;
    if (!state.player.unlockedRegions.includes(rid)) {
      sfx('wrong');
      showHint('这片区域还未解锁。先完成前面的区域吧！');
      return;
    }
    sfx('click');
    // 风语原直达：还有没修好的机关时不开关卡菜单，直接留在地图上，光柱指路
    if (rid === 0 && Object.values(MECHANISMS).some(m => m.levelId && !m.restored())) {
      $('#region-enter-prompt').classList.add('hidden');
      showGuideBeam(8000);
      showHint('跟着光柱走！', 2500);
      trackEvent('region_enter_direct', { region: rid });
      return;
    }
    // 保存当前位置，返回地图时恢复
    session.lastMapX = session.playerX;
    session.lastMapY = session.playerY;
    session.mapActive = false;
    $('#region-enter-prompt').classList.add('hidden');
    trackEvent('region_enter', { region: rid });
    showRegionDetail(rid);
  }

  // 区域详情
  function showRegionDetail(rid) {
    session.currentRegionId = rid;
    const region = REGIONS[rid];
    setAmbientRegion(rid); // 进入区域，切换为该地区的环境音
    $('#detail-title').textContent = region.name;
    $('#detail-theme').textContent = region.theme;
    $('#region-story').innerHTML = `<p>${region.story}</p>`;
    const detailBg = $('.region-detail-bg');
    detailBg.style.backgroundImage = `linear-gradient(135deg, ${region.color}55, rgba(7,12,18,0.82)), url("${VISUAL_ASSETS.world}")`;
    detailBg.style.backgroundPosition = `center, ${REGION_BACKGROUND_POSITIONS[rid] || 'center'}`;
    detailBg.style.backgroundSize = 'cover, 200% auto';

    const list = $('#levels-list');
    list.innerHTML = '';
    const levels = LEVELS[rid] || [];
    levels.forEach((lv, idx) => {
      const prev = idx > 0 ? levels[idx - 1] : null;
      const unlocked = idx === 0 || state.player.completedLevels.includes(prev?.id);
      const completed = state.player.completedLevels.includes(lv.id);
      const checkpoint = state.learning.missionCheckpoints?.[lv.id];
      const earnedStars = completed ? (state.player.levelStars?.[lv.id] || 1) : 0;
      const stars = '⭐'.repeat(earnedStars) + '☆'.repeat(3 - earnedStars);
      const el = document.createElement('div');
      el.className = 'level-item' + (unlocked ? '' : ' locked');
      el.innerHTML = `
        <div class="level-num">${idx + 1}</div>
        <div class="level-info">
          <div class="level-name">${lv.name}</div>
          <div class="level-desc">${lv.desc}</div>
          ${checkpoint ? `<div class="level-checkpoint">继续上次：${missionPhaseName(checkpoint.phase)}</div>` : ''}
        </div>
        <div class="level-stars">${stars}</div>
      `;
      el.addEventListener('click', () => {
        if (!unlocked) { sfx('wrong'); showHint('先完成前面的关卡吧！'); return; }
        sfx('click');
        startLevel(rid, idx);
      });
      list.appendChild(el);
    });

    showScreen('region-detail');
  }

  function missionPhaseName(phase) {
    return ({ prediction: '预测', operate: '操作', express: '表达', verify: '检验', transfer: '迁移' })[phase] || '任务';
  }

  // 开始关卡
  function startLevel(rid, idx) {
    const level = LEVELS[rid]?.[idx];
    if (!level) return;
    if (session.answerTimer) clearTimeout(session.answerTimer);
    session.currentLevel = level;
    session.currentRegionId = rid;
    session.currentQuestionIndex = 0;
    session.correctStreak = 0;
    session.wrongAnswers = 0;
    session.hintsUsed = 0;
    session.battleResolved = false;
    session.questionAttempts = [];
    session.questionHintTiers = [];
    session.independentCorrect = 0;
    session.transferFirstTry = false;
    session.transferHintTier = 0;
    session.answerTimer = null;
    session.currentPuzzle = null;
    session.missionPhase = null;
    session.missionInteraction = null;
    session.missionPredictionCorrect = false;
    session.missionExpressionAttempts = 0;
    session.missionExpressionCorrect = false;
    session.missionHintTier = 0;
    session.missionTransferAttempts = 0;
    session.missionPrimaryErrors = 0;
    session.missionErrorCount = 0;
    session.missionResumed = false;
    session.lastElement = null;
    session.buffShield = false;
    session.buffDoubleEnergy = 0;
    session.streakGuardUsed = false;
    session.reviveUsed = false;
    session.weaponStrikeUsed = false;
    session.itemShield = false;
    session.enemyStunned = false;
    session.usedActiveSkills = [];
    session.bossShield = level.boss === true;
    session.perfectStreak = 0;
    session.challengeActive = false;
    session.challengeDone = false;
    session.challengeQuestion = null;

    // 使用动态生成的题目（如果有），否则用静态题目
    let questions = null;
    if (typeof generateQuestions === 'function') {
      try {
        questions = generateQuestions(level.id);
      } catch (error) {
        console.error(`动态题目生成失败（${level.id}），已回退到静态题库。`, error);
      }
    }
    session.currentQuestions = questions || level.questions;

    session.enemyMaxHp = session.currentQuestions.length * 30;
    session.enemyHp = session.enemyMaxHp;
    state.player.hp = getEffectiveMaxHp();
    state.player.energy = hasPassive('energyStart') ? 30 : 0;
    saveGame();
    trackEvent('level_start', { levelId: level.id, region: rid });

    const mission = Learning.WIND_MISSIONS[level.id];
    // 机关化关卡：未完成时不再打开任务卡，引导孩子去地图上的实体机关
    const mechForLevel = Object.values(MECHANISMS).find(item => item.levelId === level.id);
    if (mechForLevel && !state.player.completedLevels.includes(level.id)) {
      showScreen('world-map');
      renderMap();
      session.playerX = Math.max(60, mechForLevel.x - 140);
      session.playerY = Math.min(WORLD.H - 60, mechForLevel.y + 150);
      session.targetX = session.playerX;
      session.targetY = session.playerY;
      session.isMoving = false;
      session.moveMode = null;
      session.velX = 0;
      session.velY = 0;
      updatePlayerSprite();
      updateCamera();
      showHint(`去${mechForLevel.title}${mechForLevel.actionLabel}它！先收集周围材料`, 3000);
      trackEvent('mechanism_guide', { levelId: level.id });
      return;
    }
    if (rid === 0 && mission) {
      startLearningMission(mission);
      return;
    }
    launchLevelIntro(rid, level);
  }

  function launchLevelIntro(rid, level) {
    // 拼接剧情
    const region = REGIONS[rid];
    const intro = level.intro.map(line => ({ ...line }));
    intro.push({ speaker: '系统', emoji: region.enemyEmoji, text: `前方出现 ${region.enemyName}！准备进入“数理对决”！` });
    startDialog(intro, () => {
      showScreen('battle-screen');
      initBattle();
    });
  }

  // ========== 风语原学习任务：操作 → 表达 → 检验 → 迁移（去预测化：直接动手） ==========
  function startLearningMission(mission) {
    const levelId = session.currentLevel.id;
    const checkpoint = state.learning.missionCheckpoints?.[levelId] || null;
    session.currentPuzzle = mission;
    session.puzzlePrediction = null;
    session.missionPredictionCorrect = false;
    session.missionExpressionAttempts = checkpoint?.expressionAttempts || 0;
    session.missionExpressionCorrect = checkpoint?.expressionCorrect === true;
    session.missionHintTier = checkpoint?.hintTier || 0;
    session.missionTransferAttempts = checkpoint?.transferAttempts || 0;
    session.missionPrimaryErrors = checkpoint?.primaryErrors || 0;
    session.missionErrorCount = checkpoint?.errorCount || 0;
    // 预测阶段已移除：任何停留在 prediction 的旧检查点都落到操作阶段
    const checkpointPhase = checkpoint?.phase;
    session.missionPhase = (checkpointPhase && checkpointPhase !== 'prediction') ? checkpointPhase : 'operate';
    session.missionResumed = Boolean(checkpointPhase && checkpointPhase !== 'prediction' && checkpointPhase !== 'operate');
    const activeConfig = session.missionPhase === 'transfer' ? mission.transfer : mission.primary;
    session.missionInteraction = ['operate', 'express', 'transfer'].includes(session.missionPhase)
      ? createMissionInteraction(activeConfig, checkpoint?.interaction)
      : null;

    $('#puzzle-title').textContent = mission.title;
    $('#puzzle-story').textContent = mission.story;
    $('#btn-puzzle-exit').classList.remove('hidden');
    $('#puzzle-error-card').classList.add('hidden');
    $('#puzzle-completion-note').classList.add('hidden');
    showScreen('puzzle-screen');

    if (session.missionPhase === 'express') showMissionExpression({ resumed: true });
    else if (session.missionPhase === 'verify') showMissionVerification({ resumed: true });
    else renderMissionWorkspace();

    trackEvent('mission_start', {
      missionId: mission.id,
      levelId,
      resumed: session.missionResumed,
      phase: session.missionPhase
    });
  }

  function createMissionInteraction(config, saved = null) {
    if (!config) return null;
    if (config.type === 'match') {
      const raw = Array.isArray(saved?.assignments) ? saved.assignments : [];
      const assignments = Array.from({ length: config.slots }, (_, index) => {
        const token = raw[index];
        return Number.isInteger(token) && token >= 0 && token < config.count ? token : null;
      });
      const seen = new Set();
      assignments.forEach((token, index) => {
        if (token === null || seen.has(token)) assignments[index] = null;
        else seen.add(token);
      });
      return { type: 'match', assignments };
    }
    if (config.type === 'partWhole') {
      return {
        type: 'partWhole',
        moved: Math.min(config.changeCount, Math.max(0, Number(saved?.moved) || 0))
      };
    }
    if (config.type === 'array') {
      return {
        type: 'array',
        rows: Math.min(config.maxRows, Math.max(1, Number(saved?.rows) || 1)),
        cols: Math.min(config.maxCols, Math.max(1, Number(saved?.cols) || 1))
      };
    }
    if (config.type === 'split') {
      const assignments = Array.from({ length: config.groups }, (_, index) => {
        return Math.max(0, Math.floor(Number(saved?.assignments?.[index]) || 0));
      });
      if (assignments.reduce((sum, value) => sum + value, 0) > config.total) assignments.fill(0);
      return { type: 'split', assignments };
    }
    if (config.type === 'balance') {
      let leftAdded = Math.max(0, Math.floor(Number(saved?.leftAdded) || 0));
      let rightAdded = Math.max(0, Math.floor(Number(saved?.rightAdded) || 0));
      if (leftAdded + rightAdded > config.pool) {
        leftAdded = 0;
        rightAdded = 0;
      }
      return {
        type: 'balance',
        leftAdded,
        rightAdded,
        left: config.leftStart + leftAdded,
        right: config.rightStart + rightAdded,
        pool: config.pool - leftAdded - rightAdded
      };
    }
    return { type: config.type };
  }

  function missionConfig() {
    const mission = session.currentPuzzle;
    return session.missionPhase === 'transfer' ? mission?.transfer : mission?.primary;
  }

  function persistMissionCheckpoint() {
    const levelId = session.currentLevel?.id;
    if (!levelId || !session.currentPuzzle || session.missionPhase === 'complete') return;
    state.learning = Learning.setMissionCheckpoint(state.learning, levelId, {
      phase: session.missionPhase,
      prediction: session.puzzlePrediction,
      predictionCorrect: session.missionPredictionCorrect,
      interaction: session.missionInteraction || {},
      expressionAttempts: session.missionExpressionAttempts,
      expressionCorrect: session.missionExpressionCorrect,
      hintTier: session.missionHintTier,
      transferAttempts: session.missionTransferAttempts,
      primaryErrors: session.missionPrimaryErrors,
      errorCount: session.missionErrorCount,
      updatedAt: Date.now()
    });
    saveGame();
  }

  function setPuzzleStep(activeIndex) {
    $$('#puzzle-stepper span').forEach((step, index) => {
      step.classList.toggle('active', index === activeIndex);
      step.classList.toggle('done', index < activeIndex);
    });
  }

  function setMissionStep(index, label) {
    setPuzzleStep(index);
    $('#puzzle-phase-label').textContent = label;
  }

  function hideMissionPanels() {
    $('#puzzle-prediction').classList.add('hidden');
    $('#puzzle-workspace').classList.add('hidden');
    $('#puzzle-expression').classList.add('hidden');
    $('#puzzle-formal').classList.add('hidden');
    $('#mission-hints').classList.add('hidden');
  }

  function updateMissionHintButtons() {
    $$('[data-mission-hint-tier]').forEach(button => {
      const tier = Number(button.dataset.missionHintTier);
      button.classList.toggle('used', tier <= session.missionHintTier);
      button.disabled = !['operate', 'express', 'transfer'].includes(session.missionPhase);
    });
  }

  function showMissionPrediction() {
    const mission = session.currentPuzzle;
    session.missionPhase = 'prediction';
    hideMissionPanels();
    $('#puzzle-prediction').classList.remove('hidden');
    $('#puzzle-story').textContent = mission.story;
    $('#puzzle-prediction-text').textContent = mission.prediction.text;
    setMissionStep(0, '先允许自己猜一猜，暂时不公布对错');
    setPuzzleGuide('curious', '先猜一猜', '选一个想法，动手验证。');
    applyMissionHintVisual();
    const options = $('#puzzle-prediction-options');
    options.innerHTML = '';
    mission.prediction.options.forEach(option => {
      const button = document.createElement('button');
      button.className = 'prediction-option';
      button.textContent = option;
      button.addEventListener('click', () => chooseMissionPrediction(option));
      options.appendChild(button);
    });
    persistMissionCheckpoint();
  }

  function chooseMissionPrediction(option) {
    const mission = session.currentPuzzle;
    if (!mission || session.missionPhase !== 'prediction') return;
    session.puzzlePrediction = option;
    session.missionPredictionCorrect = String(option) === String(mission.prediction.answer);
    state.learning = Learning.recordEvidence(state.learning, {
      levelId: session.currentLevel.id,
      kind: 'prediction',
      success: session.missionPredictionCorrect,
      independent: true
    });
    trackEvent('mission_prediction', {
      missionId: mission.id,
      correct: session.missionPredictionCorrect
    });
    session.missionPhase = 'operate';
    session.missionInteraction = createMissionInteraction(mission.primary);
    renderMissionWorkspace();
  }

  // 跳过预测：不想先猜也可以，直接动手（学习证据记为跳过，不评对错）
  function skipMissionPrediction() {
    const mission = session.currentPuzzle;
    if (!mission || session.missionPhase !== 'prediction') return;
    session.puzzlePrediction = null;
    session.missionPredictionCorrect = false;
    trackEvent('prediction_skip', { missionId: mission.id });
    session.missionPhase = 'operate';
    session.missionInteraction = createMissionInteraction(mission.primary);
    renderMissionWorkspace();
  }

  function renderMissionWorkspace() {
    const config = missionConfig();
    if (!config || !session.missionInteraction) return;
    hideMissionPanels();
    $('#puzzle-workspace').classList.remove('hidden');
    $('#mission-hints').classList.remove('hidden');
    $('#puzzle-error-card').classList.add('hidden');
    $('#puzzle-story').textContent = session.missionPhase === 'transfer'
      ? session.currentPuzzle.transfer.story : session.currentPuzzle.story;
    $('#puzzle-status').classList.remove('error', 'success');
    $('#btn-puzzle-check').classList.remove('hidden');
    setMissionStep(
      session.missionPhase === 'transfer' ? 3 : 0,
      session.missionPhase === 'transfer' ? '换了情境，重新观察关系' : '亲手改变对象，随时可以撤回'
    );
    setPuzzleGuide(
      session.missionPhase === 'transfer' ? 'surprised' : 'curious',
      session.missionPhase === 'transfer' ? '物件变了，关系还在吗？' : '亲手试一试',
      session.missionPhase === 'transfer' ? '别照搬，重新摆一次。' : '放错了也能取回。'
    );

    if (config.type === 'match') renderMissionMatch(config);
    else if (config.type === 'partWhole') renderMissionPartWhole(config);
    else if (config.type === 'array') renderMissionArray(config);
    else if (config.type === 'split') renderMissionSplit(config);
    else if (config.type === 'balance') renderMissionBalance(config);
    updateMissionHintButtons();
    applyMissionHintVisual();
    persistMissionCheckpoint();
  }

  function mathObjectSpec(config) {
    return MATH_OBJECT_STYLES[config?.itemEmoji] || { kind: 'wind-light', label: config?.itemLabel || '数学物件' };
  }

  function mathObjectMarkup(config, extraClass = '') {
    const spec = mathObjectSpec(config);
    return `<span class="math-object ${spec.kind} ${extraClass}" aria-hidden="true"><span></span></span>`;
  }

  function mathObjectsMarkup(config, count, extraClass = '') {
    return Array.from({ length: Math.max(0, count) }, () => mathObjectMarkup(config, extraClass)).join('');
  }

  function mathSlotMarkup(config, filled) {
    const spec = MATH_SLOT_STYLES[config?.slotEmoji] || { kind: 'wind-slot', label: config?.slotLabel || '位置' };
    return `<span class="math-slot ${spec.kind} ${filled ? 'occupied' : ''}" aria-hidden="true"></span>`;
  }

  function setPuzzleGuide(mood, title, text) {
    const panel = $('#puzzle-guide-panel');
    if (!panel) return;
    panel.dataset.mood = mood;
    $('#puzzle-guide-mood').textContent = title;
    $('#puzzle-guide-text').textContent = text;
  }

  function applyMissionHintVisual() {
    const card = $('.puzzle-card');
    if (!card) return;
    card.classList.remove('hint-tier-1', 'hint-tier-2', 'hint-tier-3');
    if (session.missionHintTier > 0) card.classList.add(`hint-tier-${session.missionHintTier}`);
  }

  function renderMissionMatch(config) {
    const assignments = session.missionInteraction.assignments;
    const used = new Set(assignments.filter(value => value !== null));
    const pool = $('#puzzle-pool');
    const zones = $('#puzzle-zones');
    pool.innerHTML = `<span class="puzzle-pool-label">${config.prompt}</span><span class="direct-manipulation-tip">可以点击，也可以拖到发光位置</span>`;
    zones.innerHTML = '';
    for (let tokenIndex = 0; tokenIndex < config.count; tokenIndex++) {
      const token = document.createElement('button');
      token.className = 'puzzle-token' + (used.has(tokenIndex) ? ' used' : '');
      token.innerHTML = mathObjectMarkup(config);
      token.disabled = used.has(tokenIndex);
      token.draggable = !used.has(tokenIndex);
      token.dataset.tokenIndex = String(tokenIndex);
      token.setAttribute('aria-label', `第 ${tokenIndex + 1} 个${config.itemLabel}`);
      token.addEventListener('click', () => {
        const empty = assignments.findIndex(value => value === null);
        if (empty < 0) return;
        assignments[empty] = tokenIndex;
        sfx('collect');
        renderMissionWorkspace();
      });
      token.addEventListener('dragstart', event => {
        event.dataTransfer?.setData('text/plain', String(tokenIndex));
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        token.classList.add('dragging');
      });
      token.addEventListener('dragend', () => token.classList.remove('dragging'));
      pool.appendChild(token);
    }
    assignments.forEach((tokenIndex, zoneIndex) => {
      const zone = document.createElement('button');
      zone.className = 'puzzle-zone match-zone' + (tokenIndex !== null ? ' filled snap-in' : ' magnetic-target');
      zone.innerHTML = `<div class="puzzle-zone-title">${config.slotLabel} ${zoneIndex + 1}</div><div class="puzzle-zone-items">${mathSlotMarkup(config, tokenIndex !== null)}${tokenIndex !== null ? mathObjectMarkup(config, 'paired') : '<span class="slot-question" aria-hidden="true">＋</span>'}</div>`;
      zone.setAttribute('aria-label', tokenIndex === null
        ? `${config.slotLabel} ${zoneIndex + 1}，空着`
        : `${config.slotLabel} ${zoneIndex + 1}，已有${config.itemLabel}，点击取回`);
      zone.addEventListener('click', () => {
        if (tokenIndex === null) return;
        assignments[zoneIndex] = null;
        renderMissionWorkspace();
      });
      zone.addEventListener('dragover', event => {
        if (tokenIndex !== null) return;
        event.preventDefault();
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', event => {
        if (tokenIndex !== null) return;
        event.preventDefault();
        const draggedIndex = Number(event.dataTransfer?.getData('text/plain'));
        if (!Number.isInteger(draggedIndex) || draggedIndex < 0 || draggedIndex >= config.count || used.has(draggedIndex)) return;
        assignments[zoneIndex] = draggedIndex;
        sfx('collect');
        renderMissionWorkspace();
      });
      zones.appendChild(zone);
    });
    const filled = assignments.filter(value => value !== null).length;
    $('#puzzle-status').textContent = filled === config.slots
      ? `已经配成 ${filled} 对。现在检查：没有空位，也没有对象被重复使用。`
      : `已经配成 ${filled} / ${config.slots} 对，还有 ${config.slots - filled} 个位置在等待。`;
    $('#btn-puzzle-check').textContent = '检验一一对应';
  }

  function renderMissionPartWhole(config) {
    const value = session.missionInteraction;
    const result = config.operation === 'combine'
      ? config.startCount + value.moved : config.startCount - value.moved;
    const remaining = config.changeCount - value.moved;
    const verb = config.operation === 'combine' ? '汇入一点' : '移走一点';
    $('#puzzle-pool').innerHTML = `<span class="puzzle-pool-label">${config.prompt}</span>`;
    $('#puzzle-zones').innerHTML = `
      <div class="part-whole-board">
        <div class="math-quantity-card">
          <div class="quantity-label">${config.startLabel}</div>
          <div class="quantity-items">${mathObjectsMarkup(config, config.startCount)}</div>
          <div class="quantity-count">${config.startCount}</div>
        </div>
        <div class="math-quantity-card actionable">
          <div class="quantity-label">${config.changeLabel} · 还需操作 ${remaining}</div>
          <div class="quantity-items">${mathObjectsMarkup(config, remaining) || '<span class="quantity-complete">已经全部操作</span>'}</div>
          <button class="quantity-action" data-part-action="move" ${remaining === 0 ? 'disabled' : ''}>${verb}</button>
        </div>
        <div class="math-quantity-card">
          <div class="quantity-label">${config.resultLabel}</div>
          <div class="quantity-items">${mathObjectsMarkup(config, result)}</div>
          <div class="quantity-count">${result}</div>
          <button class="quantity-action" data-part-action="undo" ${value.moved === 0 ? 'disabled' : ''}>撤回一步</button>
        </div>
      </div>`;
    $('[data-part-action="move"]').addEventListener('click', () => {
      if (value.moved < config.changeCount) value.moved++;
      sfx('collect');
      renderMissionWorkspace();
    });
    $('[data-part-action="undo"]').addEventListener('click', () => {
      if (value.moved > 0) value.moved--;
      renderMissionWorkspace();
    });
    $('#puzzle-status').textContent = config.operation === 'combine'
      ? `原有 ${config.startCount}，已汇入 ${value.moved}，现在整体是 ${result}。`
      : `原有 ${config.startCount}，已移走 ${value.moved}，现在剩余 ${result}。`;
    $('#btn-puzzle-check').textContent = '检验部分与整体';
  }

  function renderMissionArray(config) {
    const value = session.missionInteraction;
    $('#puzzle-pool').innerHTML = `<span class="puzzle-pool-label">${config.prompt}</span>`;
    const total = value.rows * value.cols;
    $('#puzzle-zones').innerHTML = `
      <div class="array-board">
        <div class="array-controls">
          <div class="array-control"><div class="array-control-label">${config.rowLabel}数</div><div class="array-stepper"><button data-array="rows-down">−</button><strong>${value.rows}</strong><button data-array="rows-up">＋</button></div></div>
          <div class="array-control"><div class="array-control-label">${config.colLabel}数量</div><div class="array-stepper"><button data-array="cols-down">−</button><strong>${value.cols}</strong><button data-array="cols-up">＋</button></div></div>
        </div>
        <div class="array-grid-preview" style="grid-template-columns:repeat(${value.cols},42px)">${Array(total).fill(`<span class="array-cell">${mathObjectMarkup(config, 'compact')}</span>`).join('')}</div>
      </div>`;
    $$('[data-array]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.array;
        if (action === 'rows-down') value.rows = Math.max(1, value.rows - 1);
        if (action === 'rows-up') value.rows = Math.min(config.maxRows, value.rows + 1);
        if (action === 'cols-down') value.cols = Math.max(1, value.cols - 1);
        if (action === 'cols-up') value.cols = Math.min(config.maxCols, value.cols + 1);
        renderMissionWorkspace();
      });
    });
    $('#puzzle-status').textContent = `现在是 ${value.rows} ${config.rowLabel}、${config.colLabel} ${value.cols} 个，总数 ${total}。`;
    $('#btn-puzzle-check').textContent = '检验阵列';
  }

  function renderMissionSplit(config) {
    const assignments = session.missionInteraction.assignments;
    const assigned = assignments.reduce((sum, count) => sum + count, 0);
    const remaining = config.total - assigned;
    $('#puzzle-pool').innerHTML = `<span class="puzzle-pool-label">${config.prompt}<br>待分配 ${remaining} / ${config.total}</span><div class="math-object-row">${mathObjectsMarkup(config, remaining, 'compact')}</div>`;
    const zones = $('#puzzle-zones');
    zones.innerHTML = '';
    assignments.forEach((count, groupIndex) => {
      const zone = document.createElement('div');
      zone.className = 'puzzle-zone' + (count > 0 ? ' filled' : '');
      zone.innerHTML = `
        <div class="puzzle-zone-title">${config.groupLabels[groupIndex]}</div>
        <div class="puzzle-zone-items">${mathObjectsMarkup(config, count, 'compact') || '<span class="empty-group">还没有</span>'}</div>
        <div class="puzzle-zone-count">${count}</div>
        <div class="puzzle-zone-actions"><button data-action="remove" ${count === 0 ? 'disabled' : ''}>−</button><button data-action="add" ${remaining === 0 ? 'disabled' : ''}>＋</button></div>`;
      zone.querySelector('[data-action="add"]').addEventListener('click', () => {
        if (assignments.reduce((sum, value) => sum + value, 0) < config.total) assignments[groupIndex]++;
        sfx('collect');
        renderMissionWorkspace();
      });
      zone.querySelector('[data-action="remove"]').addEventListener('click', () => {
        if (assignments[groupIndex] > 0) assignments[groupIndex]--;
        renderMissionWorkspace();
      });
      zones.appendChild(zone);
    });
    $('#puzzle-status').textContent = remaining
      ? `还剩 ${remaining} 份。可以逐轮给每组各放一个。`
      : `已经分完：${assignments.join('、')}。现在检查每组是否同样多。`;
    $('#btn-puzzle-check').textContent = '检验平均分';
  }

  function renderMissionBalance(config) {
    const value = session.missionInteraction;
    value.left = config.leftStart + value.leftAdded;
    value.right = config.rightStart + value.rightAdded;
    value.pool = config.pool - value.leftAdded - value.rightAdded;
    const balanced = value.left === value.right;
    $('#puzzle-pool').innerHTML = `<span class="puzzle-pool-label">${config.prompt}</span>`;
    $('#puzzle-zones').innerHTML = `
      <div class="balance-board">
        <div class="balance-side actionable ${balanced ? 'balanced' : ''}"><div class="quantity-label">${config.leftLabel}</div><div class="quantity-items">${mathObjectsMarkup(config, value.left, 'compact')}</div><div class="quantity-count">${value.left}</div><button class="quantity-action" data-balance="add-left" ${value.pool === 0 ? 'disabled' : ''}>补到左侧</button><button class="quantity-action" data-balance="undo-left" ${value.leftAdded === 0 ? 'disabled' : ''}>撤回一步</button></div>
        <div class="balance-beam ${balanced ? 'balanced' : ''}" aria-label="${balanced ? '两侧相等' : '两侧还不相等'}"><span class="balance-pan left"></span><span class="balance-center"></span><span class="balance-pan right"></span></div>
        <div class="balance-side actionable ${balanced ? 'balanced' : ''}"><div class="quantity-label">${config.rightLabel}</div><div class="quantity-items">${mathObjectsMarkup(config, value.right, 'compact')}</div><div class="quantity-count">${value.right}</div><button class="quantity-action" data-balance="add-right" ${value.pool === 0 ? 'disabled' : ''}>补到右侧</button><button class="quantity-action" data-balance="undo-right" ${value.rightAdded === 0 ? 'disabled' : ''}>撤回一步</button></div>
        <div class="balance-pool">备用风力 <span class="math-object-row">${mathObjectsMarkup(config, value.pool, 'compact')}</span><strong>${value.pool}</strong></div>
      </div>`;
    $$('[data-balance]').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.dataset.balance;
        if (action === 'add-left' && value.pool > 0) value.leftAdded++;
        if (action === 'add-right' && value.pool > 0) value.rightAdded++;
        if (action === 'undo-left' && value.leftAdded > 0) value.leftAdded--;
        if (action === 'undo-right' && value.rightAdded > 0) value.rightAdded--;
        renderMissionWorkspace();
      });
    });
    $('#puzzle-status').textContent = balanced
      ? `两侧都是 ${value.left}，现在相等。还要检验备用风力和目标条件。`
      : `左侧 ${value.left}，右侧 ${value.right}。比较哪边更少。`;
    $('#btn-puzzle-check').textContent = '检验两侧平衡';
  }

  function validateMissionInteraction(config, value) {
    if (config.type === 'match') {
      const filled = value.assignments.filter(item => item !== null).length;
      const unique = new Set(value.assignments.filter(item => item !== null)).size;
      return {
        correct: filled === config.slots && unique === config.count,
        expected: `${config.count} 个对象与 ${config.slots} 个位置逐个配对`,
        observed: `目前完成 ${filled} 对`,
        errorType: 'operation',
        recovery: '每次只完成一对，并检查有没有空位或重复对象。'
      };
    }
    if (config.type === 'partWhole') {
      const result = config.operation === 'combine' ? config.startCount + value.moved : config.startCount - value.moved;
      return {
        correct: value.moved === config.changeCount && result === config.target,
        expected: `变化 ${config.changeCount} 次后得到 ${config.target}`,
        observed: `目前变化 ${value.moved} 次，结果是 ${result}`,
        errorType: 'operation',
        recovery: config.operation === 'combine' ? '把新来的一部分全部合入，但不要改变原有部分。' : '只移走题目指定的部分，再检查剩余整体。'
      };
    }
    if (config.type === 'array') {
      return {
        correct: value.rows === config.targetRows && value.cols === config.targetCols,
        expected: `${config.targetRows} ${config.rowLabel}、${config.colLabel} ${config.targetCols} 个`,
        observed: `${value.rows} ${config.rowLabel}、${config.colLabel} ${value.cols} 个`,
        errorType: 'representation',
        recovery: `分别检查“有几${config.rowLabel}”和“${config.colLabel}几个”，一次只调整一个量。`
      };
    }
    if (config.type === 'split') {
      const assigned = value.assignments.reduce((sum, count) => sum + count, 0);
      const target = config.total / config.groups;
      return {
        correct: assigned === config.total && value.assignments.every(count => count === target),
        expected: `${config.total} 份全部分完，每组都是 ${target}`,
        observed: `已分 ${assigned} 份，各组为 ${value.assignments.join('、')}`,
        errorType: 'representation',
        recovery: assigned < config.total ? '先把总量分完，再比较每组。' : '逐轮给每组各一个，保持每组同步增加。'
      };
    }
    if (config.type === 'balance') {
      return {
        correct: value.left === config.target && value.right === config.target && value.pool === 0,
        expected: `左右都为 ${config.target}，备用风力为 0`,
        observed: `左 ${value.left}、右 ${value.right}、备用 ${value.pool}`,
        errorType: 'representation',
        recovery: '不要只看备用风力是否用完；重新比较左右两侧的最终数量。'
      };
    }
    return { correct: false, expected: '满足任务条件', observed: '尚未完成', errorType: 'operation', recovery: '重新观察任务条件。' };
  }

  function checkMissionInteraction() {
    if (!['operate', 'transfer'].includes(session.missionPhase)) return;
    const config = missionConfig();
    const result = validateMissionInteraction(config, session.missionInteraction);
    const isTransfer = session.missionPhase === 'transfer';
    if (isTransfer) session.missionTransferAttempts++;
    const firstTry = isTransfer ? session.missionTransferAttempts === 1 : session.missionErrorCount === 0;
    const kind = isTransfer ? 'transfer' : 'model';

    state.learning = Learning.recordEvidence(state.learning, {
      levelId: session.currentLevel.id,
      kind,
      success: result.correct,
      independent: result.correct && firstTry && session.missionHintTier < 3,
      hintTier: session.missionHintTier,
      errorType: result.correct ? null : result.errorType,
      expected: result.expected,
      observed: result.observed,
      recovery: result.recovery
    });
    state.learning = Learning.recordAttempt(state.learning, {
      skill: session.currentLevel.skill,
      levelId: session.currentLevel.id,
      kind,
      correct: result.correct,
      firstTry,
      hintTier: session.missionHintTier
    });
    // 「检验我的操作」成功本身就是一次检验证据（检验页已并入操作反馈）
    if (result.correct && !isTransfer) {
      state.learning = Learning.recordEvidence(state.learning, {
        levelId: session.currentLevel.id,
        kind: 'verification',
        success: true,
        independent: firstTry && session.missionHintTier < 3,
        hintTier: session.missionHintTier
      });
    }
    trackEvent('mission_interaction_check', {
      levelId: session.currentLevel.id,
      phase: session.missionPhase,
      correct: result.correct,
      observed: result.observed
    });

    if (!result.correct) {
      session.missionErrorCount++;
      if (!isTransfer) session.missionPrimaryErrors++;
      sfx('wrong');
      $('#puzzle-status').classList.add('error');
      $('#puzzle-status').textContent = `还没有满足条件。${result.observed}。${result.recovery}`;
      setPuzzleGuide('thinking', '发现线索', `${result.observed}。${result.recovery}`);
      persistMissionCheckpoint();
      return;
    }

    sfx('correct');
    $('#puzzle-status').classList.add('success');
    if (isTransfer) completeMissionTransfer();
    else showMissionExpression();
  }

  function showMissionExpression({ resumed = false } = {}) {
    const mission = session.currentPuzzle;
    session.missionPhase = 'express';
    hideMissionPanels();
    $('#puzzle-expression').classList.remove('hidden');
    $('#mission-hints').classList.remove('hidden');
    $('#puzzle-story').textContent = '把刚才的动作拼成算式。';
    $('#puzzle-expression-text').textContent = mission.expression.prompt;
    $('#puzzle-error-card').classList.add('hidden');
    setMissionStep(1, '把动作翻译成语言和符号');
    setPuzzleGuide('listening', '讲给我听', '点卡片拼出你刚才的操作。');
    const area = $('#puzzle-expression-options');
    area.innerHTML = '';
    if (Array.isArray(mission.expression.tokens)) {
      renderMissionChips(mission, area);
    } else {
      mission.expression.options.forEach(option => {
        const button = document.createElement('button');
        button.className = 'expression-option';
        button.textContent = option;
        button.addEventListener('click', () => chooseMissionExpression(option, button));
        area.appendChild(button);
      });
    }
    updateMissionHintButtons();
    persistMissionCheckpoint();
    if (resumed) trackEvent('mission_checkpoint_resumed', { levelId: session.currentLevel.id, phase: 'express' });
  }

  // 表达结算（选项选择与拼算式共用）
  function resolveMissionExpression(correct, observed) {
    const mission = session.currentPuzzle;
    session.missionExpressionAttempts++;
    const firstTry = session.missionExpressionAttempts === 1;
    state.learning = Learning.recordEvidence(state.learning, {
      levelId: session.currentLevel.id,
      kind: 'explanation',
      success: correct,
      independent: correct && firstTry && session.missionHintTier < 3,
      hintTier: session.missionHintTier,
      errorType: correct ? null : 'language',
      expected: mission.expression.equation || mission.expression.answer,
      observed,
      recovery: '回想刚才实际做的是配对、合并、分组、平均分，还是让两侧相等。'
    });
    state.learning = Learning.recordAttempt(state.learning, {
      skill: session.currentLevel.skill,
      levelId: session.currentLevel.id,
      kind: 'explanation',
      correct,
      firstTry,
      hintTier: session.missionHintTier
    });
    trackEvent('mission_expression', { levelId: session.currentLevel.id, correct, firstTry });
    if (!correct) {
      session.missionErrorCount++;
      sfx('wrong');
      persistMissionCheckpoint();
      return false;
    }
    session.missionExpressionCorrect = true;
    sfx('correct');
    saveGame();
    // 检验页已移除：表达成功直接进迁移，算式在迁移完成时定格
    setTimeout(() => startMissionTransfer(), 320);
    return true;
  }

  // 拼算式：从卡片池点选，拼出与操作一致的等式（搭，不是选）
  function renderMissionChips(mission, area) {
    const cfg = mission.expression;
    const tokens = cfg.tokens;
    const bank = [...tokens, ...(cfg.distractors || [])].map(text => ({ text, used: false }));
    for (let i = bank.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bank[i], bank[j]] = [bank[j], bank[i]];
    }
    const built = [];
    let fails = 0;

    const wrap = document.createElement('div');
    wrap.className = 'chip-expr';
    const buildEl = document.createElement('div');
    buildEl.className = 'chip-build';
    const bankEl = document.createElement('div');
    bankEl.className = 'chip-bank';
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'genshin-btn primary';
    confirmBtn.id = 'btn-chips-confirm';
    confirmBtn.textContent = '拼好啦！';

    function refresh() {
      buildEl.innerHTML = built.length ? '' : '<span class="chip-placeholder">点下面的卡片拼算式</span>';
      built.forEach((bankIndex, pos) => {
        const chip = bank[bankIndex];
        const b = document.createElement('button');
        b.className = 'expr-chip built';
        b.textContent = chip.text;
        b.addEventListener('click', () => {
          built.splice(pos, 1);
          chip.used = false;
          sfx('click');
          refresh();
        });
        buildEl.appendChild(b);
      });
      bankEl.innerHTML = '';
      bank.forEach((chip, bankIndex) => {
        const b = document.createElement('button');
        b.className = 'expr-chip' + (chip.used ? ' used' : '');
        b.textContent = chip.text;
        b.disabled = chip.used;
        // 两次失败后的磁吸引导：下一张正确卡片发光
        if (fails >= 2 && !chip.used && chip.text === tokens[built.length]) b.classList.add('magnetic');
        b.addEventListener('click', () => {
          chip.used = true;
          built.push(bankIndex);
          sfx('click');
          refresh();
        });
        bankEl.appendChild(b);
      });
    }

    confirmBtn.addEventListener('click', () => {
      if (!built.length) return;
      const builtStr = built.map(i => bank[i].text).join('');
      const correct = builtStr === cfg.equation;
      if (!correct) {
        fails++;
        $('#puzzle-error-type').textContent = '算式还没对上';
        $('#puzzle-error-text').textContent = fails >= 2 ? '发光的卡片是下一张要放的。' : '回想你刚才操作的数量，再拼一次。';
        $('#puzzle-error-card').classList.remove('hidden');
        refresh();
      } else {
        $('#puzzle-error-card').classList.add('hidden');
        confirmBtn.disabled = true;
        $$('.expr-chip').forEach(chip => { chip.disabled = true; });
      }
      resolveMissionExpression(correct, builtStr);
    });

    wrap.appendChild(buildEl);
    wrap.appendChild(bankEl);
    wrap.appendChild(confirmBtn);
    area.appendChild(wrap);
    refresh();
  }

  function chooseMissionExpression(option, button) {
    if (session.missionPhase !== 'express') return;
    const mission = session.currentPuzzle;
    const correct = String(option) === String(mission.expression.answer);
    const ok = resolveMissionExpression(correct, option);
    if (!ok) {
      button.classList.add('wrong');
      button.disabled = true;
      $('#puzzle-error-type').textContent = '语言与动作没有对应上';
      $('#puzzle-error-text').textContent = '这个表达没有完整描述刚才的操作。回看对象之间的关系，再选一次。';
      $('#puzzle-error-card').classList.remove('hidden');
      setPuzzleGuide('thinking', '少了一点关系', '回想你刚才是配对、合并、分组还是配平。');
      return;
    }
    button.classList.add('correct');
    $$('.expression-option').forEach(item => { item.disabled = true; });
  }

  function showMissionVerification({ resumed = false } = {}) {
    const mission = session.currentPuzzle;
    session.missionPhase = 'verify';
    hideMissionPanels();
    $('#puzzle-formal').classList.remove('hidden');
    $('#puzzle-story').textContent = '看看你的操作结果。';
    $('.puzzle-success').textContent = '模型通过检验';
    if (session.puzzlePrediction === null || session.puzzlePrediction === undefined) {
      // 跳过预测的：不展示对比文案，直接给结论
      $('#puzzle-prediction-compare').classList.add('hidden');
    } else {
      $('#puzzle-prediction-compare').classList.remove('hidden');
      $('#puzzle-prediction-compare').textContent = session.missionPredictionCorrect
        ? `你最初预测“${session.puzzlePrediction}”，操作结果支持这个预测。`
        : `你最初预测“${session.puzzlePrediction}”。操作显示“${mission.prediction.answer}”，旧图像已经被新证据修正。`;
    }
    $('#puzzle-formal-text').textContent = mission.formal;
    $('#puzzle-completion-note').classList.add('hidden');
    $('#btn-puzzle-continue').textContent = '进入迁移任务';
    setMissionStep(2, '用条件和算式校准刚才的直觉');
    setPuzzleGuide('proud', '预测和证据见面了', session.missionPredictionCorrect
      ? '猜对了！算式把它说得更准。'
      : '原来的预测已经被新证据修正。能找到哪里需要改变，就是一次真正的进步。');
    if (!resumed) {
      state.learning = Learning.recordEvidence(state.learning, {
        levelId: session.currentLevel.id,
        kind: 'verification',
        success: true,
        independent: session.missionExpressionAttempts === 1 && session.missionHintTier < 3,
        hintTier: session.missionHintTier
      });
    }
    persistMissionCheckpoint();
    if (resumed) trackEvent('mission_checkpoint_resumed', { levelId: session.currentLevel.id, phase: 'verify' });
  }

  function startMissionTransfer() {
    session.missionPhase = 'transfer';
    session.missionInteraction = createMissionInteraction(session.currentPuzzle.transfer);
    renderMissionWorkspace();
    trackEvent('mission_transfer_start', { levelId: session.currentLevel.id });
  }

  function completeMissionTransfer() {
    session.missionPhase = 'complete';
    hideMissionPanels();
    $('#puzzle-formal').classList.remove('hidden');
    $('#puzzle-story').textContent = session.currentPuzzle.transfer.story;
    $('.puzzle-success').textContent = '迁移成功，世界开始改变';
    $('#puzzle-prediction-compare').classList.add('hidden');
    // 检验页已并入此刻：算式在这里定格
    $('#puzzle-formal-text').textContent = session.currentPuzzle.formal;
    const independentExplanation = session.missionExpressionAttempts === 1 && session.missionHintTier < 3;
    const independentTransfer = session.missionTransferAttempts === 1 && session.missionHintTier < 3;
    $('#puzzle-completion-note').textContent = `完成修复 ✓　讲清关系 ${independentExplanation ? '✓' : '△'}　独立迁移 ${independentTransfer ? '✓' : '△'}`;
    $('#puzzle-completion-note').classList.remove('hidden');
    $('#btn-puzzle-continue').textContent = '完成任务并查看世界变化';
    $('#btn-puzzle-exit').classList.add('hidden');
    setMissionStep(3, '能在新情境中重建，才算真正理解');
    setPuzzleGuide('celebrating', '带到了新地方', '换了情境，关系没变。');
    saveGame();
    sfx('win');
    trackEvent('mission_transfer_complete', {
      levelId: session.currentLevel.id,
      firstTry: session.missionTransferAttempts === 1,
      hintTier: session.missionHintTier
    });
  }

  function advanceLearningMission() {
    if (session.missionPhase === 'verify') {
      startMissionTransfer();
      return;
    }
    if (session.missionPhase === 'complete') finishLearningMission();
  }

  function finishLearningMission() {
    const mission = session.currentPuzzle;
    const level = session.currentLevel;
    const region = REGIONS[session.currentRegionId];
    if (!mission || !level || session.battleResolved) return;
    session.battleResolved = true;
    session.lastProgressAt = performance.now();
    showGuideBeam(8000); // 任务完成后亮光柱，指向下一个目标
    const firstClear = !state.player.completedLevels.includes(level.id);
    const independentCorrect = (session.missionPrimaryErrors === 0 ? 1 : 0)
      + (session.missionExpressionAttempts === 1 && session.missionHintTier < 3 ? 1 : 0);
    const starsThisRun = Learning.calculateStars({
      questionCount: 2,
      independentCorrect,
      transferFirstTry: session.missionTransferAttempts === 1,
      transferHintTier: session.missionHintTier
    });
    state.player.levelStars[level.id] = Math.max(state.player.levelStars[level.id] || 0, starsThisRun);
    if (!state.learning.completedPuzzles.includes(mission.id)) state.learning.completedPuzzles.push(mission.id);
    state.learning = Learning.clearMissionCheckpoint(state.learning, level.id);
    if (mission.worldChange) state.map.worldChanges[mission.worldChange] = true;
    // 每日/每周任务：完成关卡计数
    const levelQuestNote = questCompletionNote(recordQuestProgress('level', 1));
    if (levelQuestNote) showHint(levelQuestNote, 3000);

    const rewards = firstClear ? { gems: 60 + (hasPassive('gemFind') ? 15 : 0), exp: 100 } : { gems: 0, exp: 0 };
    let levelsGained = 0;
    if (firstClear) {
      state.player.completedLevels.push(level.id);
      levelsGained = grantRewards(rewards);
    }
    const allCompleted = LEVELS[session.currentRegionId].every(item => state.player.completedLevels.includes(item.id));
    let newlyUnlockedRegion = null;
    if (allCompleted && session.currentRegionId < REGIONS.length - 1) {
      const next = session.currentRegionId + 1;
      if (!state.player.unlockedRegions.includes(next)) {
        state.player.unlockedRegions.push(next);
        newlyUnlockedRegion = next;
      }
    }
    checkAchievements();
    saveGame();
    trackEvent('mission_complete', {
      missionId: mission.id,
      levelId: level.id,
      firstClear,
      stars: starsThisRun,
      errors: session.missionErrorCount,
      hints: session.missionHintTier,
      transferAttempts: session.missionTransferAttempts
    });
    trackEvent('level_complete', {
      levelId: level.id,
      source: 'mission',
      firstClear,
      stars: starsThisRun
    });
    showReward(level, region, {
      rewards,
      stars: starsThisRun,
      firstClear,
      allCompleted,
      newlyUnlockedRegion,
      levelsGained,
      completionSource: 'mission'
    });
  }

  function useMissionHint(tier) {
    const mission = session.currentPuzzle;
    if (!mission || !['operate', 'express', 'transfer'].includes(session.missionPhase) || tier < 1 || tier > 3) return;
    if (tier > session.missionHintTier) session.missionHintTier = tier;
    const phase = session.missionPhase === 'transfer' ? 'transfer' : session.missionPhase;
    const hint = Learning.getMissionHint(mission, phase, tier);
    const titles = ['找到了关键对象', '先看一个动作', '一起核对数学条件'];
    setPuzzleGuide('helping', titles[tier - 1], hint);
    updateMissionHintButtons();
    applyMissionHintVisual();
    persistMissionCheckpoint();
    trackEvent('mission_hint_used', { levelId: session.currentLevel.id, phase, tier });
  }

  function leaveChallenge(source) {
    if (source === 'battle' && !confirm('退出后本次战斗进度不会保留，确定返回关卡选择吗？')) return;
    if (source === 'puzzle' && session.currentPuzzle && session.missionPhase && session.missionPhase !== 'complete') {
      persistMissionCheckpoint();
      trackEvent('mission_checkpoint_saved', {
        levelId: session.currentLevel?.id || null,
        phase: session.missionPhase
      });
    }
    if (session.answerTimer) clearTimeout(session.answerTimer);
    session.answerTimer = null;
    session.battleResolved = true;
    session.answered = true;
    session.currentPuzzle = null;
    session.missionPhase = null;
    session.missionInteraction = null;
    closeHint();
    trackEvent('challenge_exit', { source, levelId: session.currentLevel?.id || null });
    if (session.currentRegionId !== null) showRegionDetail(session.currentRegionId);
    else returnToWorldMap();
  }

  // 对话系统
  function startDialog(lines, onComplete) {
    cancelDialogTyping();
    session.dialogQueue = Array.isArray(lines) ? lines : [];
    session.dialogIndex = 0;
    session.dialogOnComplete = typeof onComplete === 'function' ? onComplete : null;
    showScreen('dialog-screen');
    renderDialogLine();
  }

  function cancelDialogTyping() {
    if (session.dialogTimer) clearTimeout(session.dialogTimer);
    session.dialogTimer = null;
    session.typing = false;
    session.dialogToken++;
  }

  function renderDialogLine() {
    const line = session.dialogQueue[session.dialogIndex];
    if (!line) {
      completeDialog();
      return;
    }
    cancelDialogTyping();
    $('#dialog-speaker').textContent = line.speaker;
    const character = $('#dialog-character');
    const portrait = DIALOG_PORTRAITS[line.speaker];
    character.classList.toggle('has-portrait', Boolean(portrait));
    character.style.backgroundImage = portrait ? `url("${portrait}")` : '';
    character.textContent = portrait ? '' : (line.emoji || '👤');
    $('#dialog-text').textContent = '';
    $('#dialog-choices').innerHTML = '';
    $('#dialog-tip').style.display = 'block';
    session.typing = true;
    const token = session.dialogToken;
    typeWriter(String(line.text || ''), 0, token);
  }

  function typeWriter(text, idx, token) {
    if (!session.typing || token !== session.dialogToken) return;
    if (idx < text.length) {
      $('#dialog-text').textContent += text[idx];
      session.dialogTimer = setTimeout(() => typeWriter(text, idx + 1, token), 28);
    } else {
      session.typing = false;
      session.dialogTimer = null;
    }
  }

  function finishTypingImmediately() {
    const line = session.dialogQueue[session.dialogIndex];
    cancelDialogTyping();
    $('#dialog-text').textContent = line?.text || '';
  }

  function completeDialog() {
    cancelDialogTyping();
    const onComplete = session.dialogOnComplete;
    session.dialogOnComplete = null;
    session.dialogQueue = [];
    if (onComplete) onComplete();
  }

  function advanceDialog() {
    if (session.dialogIndex < session.dialogQueue.length - 1) {
      session.dialogIndex++;
      renderDialogLine();
    } else {
      completeDialog();
    }
  }

  // NPC 对话
  function rememberMapPosition() {
    session.lastMapX = session.playerX;
    session.lastMapY = session.playerY;
    session.targetX = session.playerX;
    session.targetY = session.playerY;
    session.isMoving = false;
    session.moveMode = null;
  }

  function startNpcDialog(npcId) {
    // NPC 委托：优先处理（接取 → 进行中 → 领奖）
    const commission = COMMISSIONS[npcId];
    if (commission) {
      const status = state.commissions[npcId] || 'none';
      if (status !== 'claimed') {
        rememberMapPosition();
        session.mapActive = false;
        if (status === 'none') {
          state.commissions[npcId] = 'active';
          saveGame();
          trackEvent('commission_accept', { npc: npcId });
          startDialog([
            { speaker: commission.speaker, emoji: commission.emoji, text: commission.text },
            { speaker: commission.speaker, emoji: commission.emoji, text: `这是「${commission.title}」委托，完成后回来找我领 ${commission.reward} 💎！` }
          ], () => { showScreen('world-map'); renderMap(); });
          return;
        }
        if (checkCommissionDone(npcId)) {
          state.commissions[npcId] = 'claimed';
          grantRewards({ gems: commission.reward });
          sfx('quest');
          saveGame();
          checkAchievements();
          trackEvent('commission_claim', { npc: npcId, reward: commission.reward });
          startDialog([
            { speaker: commission.speaker, emoji: commission.emoji, text: `委托完成！太感谢了，这是谢礼 ${commission.reward} 💎。` }
          ], () => { showScreen('world-map'); renderMap(); });
          return;
        }
        startDialog([
          { speaker: commission.speaker, emoji: commission.emoji, text: `委托还在进行哦：${commission.text}` }
        ], () => { showScreen('world-map'); renderMap(); });
        return;
      }
    }
    const dialogs = npcId === 1 && state.map.worldChanges.windmillRestored
      ? [
          { speaker: '风精灵', emoji: '🌪️', text: '听，风车重新转起来了。你刚才不是只算出了 6，而是让 6 颗风种和 6 个风槽真正一一对应。' },
          { speaker: '风精灵', emoji: '🌪️', text: state.map.worldChanges.bridgeOpened
            ? '风桥也已经贯通。风语原会保留你的改变，去别处探索后随时可以回来。'
            : '等你理解平均分，断裂的风桥也会重新连通。' }
        ]
      : (NPC_DIALOGS[npcId] || NPC_DIALOGS_EXTENDED[npcId]);
    if (!dialogs) return;
    rememberMapPosition();
    session.mapActive = false;
    startDialog(dialogs, () => {
      showScreen('world-map');
      renderMap();
    });
  }

  // 剧情触发
  function checkStoryTriggers() {
    $$('.story-trigger').forEach(trigger => {
      if (trigger.dataset.triggered === 'true') return;
      const rect = trigger.getBoundingClientRect();
      const triggerX = parseInt(trigger.style.left) + rect.width / 2;
      const triggerY = parseInt(trigger.style.top) + rect.height / 2;
      const dist = Math.hypot(session.playerX - triggerX, session.playerY - triggerY);
      if (dist < 80) {
        const storyId = trigger.dataset.story;
        const story = STORY_TRIGGERS[storyId];
        if (story) {
          trigger.dataset.triggered = 'true';
          session.storyInProgress = storyId;
          rememberMapPosition();
          session.mapActive = false;
          startDialog(story, () => {
            if (!Array.isArray(state.map.seenStories)) state.map.seenStories = [];
            if (!state.map.seenStories.includes(storyId)) {
              state.map.seenStories.push(storyId);
              saveGame();
            }
            session.storyInProgress = null;
            showScreen('world-map');
            renderMap();
          });
        }
      }
    });
  }

  // 战斗系统
  function initBattle() {
    const level = session.currentLevel;
    const region = REGIONS[session.currentRegionId];
    $('#battle-bg').style.backgroundImage = `linear-gradient(180deg, ${region.color}33, rgba(5,10,16,0.88)), url("${VISUAL_ASSETS.world}")`;
    $('#battle-bg').style.backgroundPosition = `center, ${REGION_BACKGROUND_POSITIONS[session.currentRegionId] || 'center'}`;
    $('#battle-bg').style.backgroundSize = 'cover, 190% auto';
    $('#enemy-name').textContent = region.enemyName;
    const enemySprite = $('#enemy-sprite');
    const hasWindPortrait = session.currentRegionId === 0;
    enemySprite.classList.toggle('has-portrait', hasWindPortrait);
    enemySprite.style.backgroundImage = hasWindPortrait ? `url("${VISUAL_ASSETS.windGuardian}")` : '';
    enemySprite.textContent = hasWindPortrait ? '' : region.enemyEmoji;
    $('#enemy-element').textContent = region.emoji;
    $('#enemy-sprite').classList.remove('shake', 'defeated', 'stunned');
    const enemyStatsEl = $('#enemy-stats');
    if (enemyStatsEl) enemyStatsEl.textContent = `⚔️ ${getEnemyAttack()} · 🛡️ ${getEnemyDefense()}`;
    // Boss 护盾：首题答对前不掉血
    const shieldEl = $('#enemy-shield');
    if (shieldEl) shieldEl.classList.toggle('hidden', !session.bossShield);
    if (session.bossShield) {
      $('#enemy-name').textContent = `${region.enemyName} · BOSS`;
    }
    $('#question-tag').textContent = ELEMENTS.find(e => e.id === level.skill)?.name || '数学思维';
    $('#question-tag').style.background = ELEMENTS.find(e => e.id === level.skill)?.color || '#74c2a8';
    // 全部元素技能保持可点：本关元素给出专属提示，其他元素消耗能量，用于连续触发元素反应
    $$('.skill-btn:not(.burst-btn)').forEach((button, index) => {
      const relevant = ELEMENTS[index]?.id === level.skill;
      button.disabled = false;
      button.classList.toggle('context-disabled', !relevant);
      button.classList.toggle('active-context', relevant);
    });
    updateSkillPointsBadge();
    updateHud();
    renderBattleQuestion();
  }

  function updateHud() {
    const effectiveMaxHp = getEffectiveMaxHp();
    const hpPct = Math.max(0, (state.player.hp / effectiveMaxHp) * 100);
    const enPct = Math.max(0, (state.player.energy / state.player.maxEnergy) * 100);
    $('#player-hp-fill').style.width = hpPct + '%';
    $('#player-energy-fill').style.width = enPct + '%';
    $('#player-hp-text').textContent = `${Math.ceil(state.player.hp)}/${effectiveMaxHp}`;
    $('#player-energy-text').textContent = `${Math.floor(state.player.energy)}/${state.player.maxEnergy}`;

    const enemyPct = Math.max(0, (session.enemyHp / session.enemyMaxHp) * 100);
    $('#enemy-hp-fill').style.width = enemyPct + '%';
    $('#enemy-hp-text').textContent = `${Math.ceil(session.enemyHp)}/${session.enemyMaxHp}`;

    const burst = $('#burst-btn');
    if (state.player.energy >= state.player.maxEnergy) {
      burst.classList.remove('disabled');
    } else {
      burst.classList.add('disabled');
    }

    // 武器与道具状态
    const weapon = getEquippedWeapon();
    const armor = getEquippedArmor();
    const weaponInfo = $('#player-weapon-info');
    if (weaponInfo) weaponInfo.textContent = `${weapon.emoji} ${weapon.name} ⚔️${getPlayerAttack()} ${armor.emoji} 🛡️${getPlayerDefense()}`;
    const strikeBtn = $('#weapon-strike-btn');
    if (strikeBtn) {
      strikeBtn.disabled = session.weaponStrikeUsed;
      strikeBtn.classList.toggle('used', session.weaponStrikeUsed);
      $('#weapon-strike-emoji').textContent = weapon.emoji;
      $('#weapon-strike-count').textContent = session.weaponStrikeUsed ? '0' : '1';
    }
    const itemButtons = { potion: '#use-potion-btn', shield: '#use-shield-btn', scroll: '#use-scroll-btn' };
    Object.entries(itemButtons).forEach(([id, selector]) => {
      const btn = $(selector);
      if (!btn) return;
      const count = state.inventory.consumables[id] || 0;
      const countEl = $(`#${id}-count`);
      if (countEl) countEl.textContent = count;
      btn.disabled = count <= 0;
    });
    // 主动技能：已学习的显示，用过的禁用
    ACTIVE_SKILLS.forEach(skill => {
      const btn = $(`#active-skill-${skill.id}`);
      if (!btn) return;
      const owned = state.inventory.activeSkills.includes(skill.id);
      btn.classList.toggle('hidden', !owned);
      btn.disabled = !owned || session.usedActiveSkills.includes(skill.id);
      btn.classList.toggle('used', session.usedActiveSkills.includes(skill.id));
    });
  }

  // 弱点题：每场战斗中间那道题为怪物弱点，答对可"破防"震慑怪物
  function getWeaknessIndex() {
    return Math.floor((session.currentQuestions.length - 1) / 2);
  }

  function renderBattleQuestion() {
    const q = session.currentQuestions[session.currentQuestionIndex];
    if (!q) return;
    session.answered = false;
    const questionIndex = session.currentQuestionIndex;
    if (!Number.isInteger(session.questionAttempts[questionIndex])) session.questionAttempts[questionIndex] = 0;
    if (!Number.isInteger(session.questionHintTiers[questionIndex])) session.questionHintTiers[questionIndex] = 0;
    renderBattleStages();
    const questionTextEl = $('#question-text');
    questionTextEl.textContent = q.text;
    const oldBadge = questionTextEl.parentElement.querySelector('.weakness-badge');
    if (oldBadge) oldBadge.remove();
    if (questionIndex === getWeaknessIndex()) {
      const badge = document.createElement('span');
      badge.className = 'weakness-badge';
      badge.textContent = '⚡ 怪物弱点';
      questionTextEl.appendChild(badge);
    }
    $('#question-visual').innerHTML = '';
    if (q.visual) renderVisual(q.visual);

    const area = $('#answer-area');
    area.innerHTML = '';
    session.currentInteraction = null;
    if (q.interaction) {
      area.classList.add('has-interaction');
      renderBattleInteraction(q.interaction, area);
    } else {
      area.classList.remove('has-interaction');
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => handleAnswer(opt, btn));
        area.appendChild(btn);
      });
    }
    $$('[data-hint-tier]').forEach(button => {
      const tier = Number(button.dataset.hintTier);
      button.classList.toggle('used', tier <= session.questionHintTiers[questionIndex]);
      button.disabled = false;
    });
    trackEvent('question_shown', {
      levelId: session.currentLevel.id,
      questionIndex,
      attempt: session.questionAttempts[questionIndex] + 1
    });
  }

  function renderBattleStages() {
    const count = session.currentQuestions.length;
    const names = count === 3
      ? ['观察与预测', '计算与检验', '迁移与解释']
      : Array.from({ length: count }, (_, index) => {
          if (index === 0) return '观察与预测';
          if (index === count - 1) return '迁移与解释';
          return `推理与检验 ${index}`;
        });
    const progress = $('#battle-stage-progress');
    progress.innerHTML = '';
    names.forEach((name, index) => {
      const chip = document.createElement('div');
      chip.className = 'battle-stage-chip';
      if (index < session.currentQuestionIndex) chip.classList.add('done');
      if (index === session.currentQuestionIndex) chip.classList.add('active');
      chip.textContent = `${index + 1} ${name}`;
      progress.appendChild(chip);
    });
  }

  function renderVisual(visual) {
    const container = $('#question-visual');
    container.style.display = '';
    container.style.gridTemplateColumns = '';
    container.style.gap = '';
    if (visual.type === 'emoji') {
      visual.items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'visual-item';
        el.textContent = item;
        container.appendChild(el);
      });
    } else if (visual.type === 'grid') {
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${visual.cols}, 36px)`;
      container.style.gap = '4px';
      for (let i = 0; i < visual.rows * visual.cols; i++) {
        const el = document.createElement('div');
        el.className = 'visual-item';
        el.style.width = '36px'; el.style.height = '36px';
        el.textContent = visual.emoji || '●';
        container.appendChild(el);
      }
    }
  }

  // ========== 情境动手题模板：把"算一道题"变成"动手做一件事" ==========
  // tapCount 点数取材：点亮正确数量的物件（周长=点边、面积=点格）
  // dragSplit 拖放分配：把 N 个物品平均分到 M 个区域（平均分/除法）
  function renderBattleInteraction(cfg, container) {
    if (cfg.type === 'tapCount') renderTapCount(cfg, container);
    else if (cfg.type === 'dragSplit') renderDragSplit(cfg, container);
    else if (cfg.type === 'shapePick') renderShapePick(cfg, container);
    else if (cfg.type === 'balance') renderBattleBalance(cfg, container);
  }

  // balance 天平配平（战斗版）：左盘锁定，右盘孩子调整，横梁实时倾斜
  function renderBattleBalance(cfg, container) {
    const it = { type: 'balance', placed: cfg.rightStart || 0, cfg };
    session.currentInteraction = it;

    const hint = document.createElement('div');
    hint.className = 'dragsplit-hint';
    hint.textContent = cfg.hintText || '放砝码让天平平衡，再点确认';

    const beam = document.createElement('div');
    beam.className = 'mech-beam';
    const counter = document.createElement('div');
    counter.className = 'tapcount-counter';

    const render = () => {
      const tilt = Math.max(-16, Math.min(16, (cfg.left - it.placed) * 4));
      beam.style.transform = `rotate(${tilt}deg)`;
      beam.innerHTML = `<span class="mech-pan">${cfg.itemEmoji.repeat(cfg.left)}<small>左 ${cfg.left}${cfg.unit || ''}</small></span>` +
        `<span class="mech-pivot">⚖️</span>` +
        `<span class="mech-pan">${cfg.itemEmoji.repeat(it.placed) || '◌'}<small>右 ${it.placed}${cfg.unit || ''}</small></span>`;
      counter.textContent = it.placed === cfg.left ? '平衡了！点确认' : `左 ${cfg.left} · 右 ${it.placed}`;
      addBtn.disabled = session.answered || it.placed >= cfg.left + 3;
      takeBtn.disabled = session.answered || it.placed <= 0;
    };

    const actions = document.createElement('div');
    actions.className = 'mech-actions';
    const addBtn = document.createElement('button');
    addBtn.className = 'genshin-btn small';
    addBtn.id = 'battle-balance-add';
    addBtn.textContent = '放一个';
    addBtn.addEventListener('click', () => {
      if (session.answered || it.placed >= cfg.left + 3) return;
      it.placed++;
      sfx('click');
      render();
    });
    const takeBtn = document.createElement('button');
    takeBtn.className = 'genshin-btn small';
    takeBtn.id = 'battle-balance-take';
    takeBtn.textContent = '取一个';
    takeBtn.addEventListener('click', () => {
      if (session.answered || it.placed <= 0) return;
      it.placed--;
      sfx('click');
      render();
    });
    actions.appendChild(addBtn);
    actions.appendChild(takeBtn);

    container.appendChild(hint);
    container.appendChild(beam);
    container.appendChild(counter);
    container.appendChild(actions);
    render();
    makeInteractionConfirm(container, () => it.placed === cfg.left);
  }

  // shapePick 图形辨认：从一堆物件中点选所有符合特征的（分类思想）
  function renderShapePick(cfg, container) {
    const it = { type: 'shapePick', selected: new Set(), cfg };
    session.currentInteraction = it;

    const hint = document.createElement('div');
    hint.className = 'shapepick-hint';
    hint.textContent = `点选所有「${cfg.criteria}」，不多选也不少选`;

    const grid = document.createElement('div');
    grid.className = 'shapepick-grid';
    const counter = document.createElement('div');
    counter.className = 'shapepick-counter';
    counter.textContent = '已选 0 个';

    cfg.items.forEach((item, index) => {
      const card = document.createElement('button');
      card.className = 'shapepick-card';
      card.innerHTML = `<span class="shapepick-emoji">${item.emoji}</span><span class="shapepick-label">${item.label}</span>`;
      card.addEventListener('click', () => {
        if (session.answered) return;
        if (it.selected.has(index)) {
          it.selected.delete(index);
          card.classList.remove('selected');
        } else {
          it.selected.add(index);
          card.classList.add('selected');
          sfx('click');
        }
        counter.textContent = `已选 ${it.selected.size} 个`;
      });
      grid.appendChild(card);
    });

    container.appendChild(hint);
    container.appendChild(grid);
    container.appendChild(counter);
    makeInteractionConfirm(container, () => {
      const matchCount = cfg.items.filter(item => item.match).length;
      if (it.selected.size !== matchCount) return false;
      return cfg.items.every((item, index) => item.match === it.selected.has(index));
    });
  }

  function makeInteractionConfirm(container, checkFn) {
    const bar = document.createElement('div');
    bar.className = 'interaction-confirm-bar';
    const btn = document.createElement('button');
    btn.className = 'genshin-btn primary';
    btn.textContent = '确认，发起攻击！';
    btn.addEventListener('click', () => {
      if (session.answered) return;
      const correct = checkFn();
      bar.classList.add(correct ? 'confirm-correct' : 'confirm-wrong');
      handleInteractionAnswer(correct);
    });
    bar.appendChild(btn);
    container.appendChild(bar);
    return btn;
  }

  function renderTapCount(cfg, container) {
    const it = { type: 'tapCount', selected: new Set(), cfg };
    session.currentInteraction = it;
    const target = cfg.target;

    const grid = document.createElement('div');
    grid.className = 'tapcount-grid mode-' + (cfg.mode || 'fill');
    grid.style.gridTemplateColumns = `repeat(${cfg.cols}, 1fr)`;

    const cells = [];
    for (let index = 0; index < cfg.rows * cfg.cols; index++) {
      const cell = document.createElement('button');
      cell.className = 'tapcount-cell';
      cell.textContent = cfg.item;
      cell.setAttribute('aria-label', `${cfg.itemName} ${index + 1}`);
      cell.addEventListener('click', () => {
        if (session.answered) return;
        if (it.selected.has(index)) {
          it.selected.delete(index);
          cell.classList.remove('selected');
        } else {
          it.selected.add(index);
          cell.classList.add('selected');
          sfx('click');
        }
        counter.textContent = `已点亮 ${it.selected.size} / 需要 ${target}`;
      });
      grid.appendChild(cell);
      cells.push(cell);
    }

    // 行标：点一下点亮整行（引导孩子发现"每行几个×几行"的乘法结构）
    if (cfg.mode === 'fill' && cfg.rows > 1) {
      const rowBar = document.createElement('div');
      rowBar.className = 'tapcount-rows';
      for (let r = 0; r < cfg.rows; r++) {
        const rowBtn = document.createElement('button');
        rowBtn.className = 'tapcount-row-btn';
        rowBtn.textContent = `第 ${r + 1} 行全点亮`;
        rowBtn.addEventListener('click', () => {
          if (session.answered) return;
          for (let c = 0; c < cfg.cols; c++) {
            const index = r * cfg.cols + c;
            it.selected.add(index);
            cells[index].classList.add('selected');
          }
          sfx('click');
          counter.textContent = `已点亮 ${it.selected.size} / 需要 ${target}`;
        });
        rowBar.appendChild(rowBtn);
      }
      container.appendChild(rowBar);
    }

    const counter = document.createElement('div');
    counter.className = 'tapcount-counter';
    counter.textContent = `已点亮 0 / 需要 ${target}`;

    container.appendChild(grid);
    container.appendChild(counter);
    makeInteractionConfirm(container, () => it.selected.size === target);
  }

  function renderDragSplit(cfg, container) {
    const zoneCount = cfg.zones;
    const perZone = Math.floor(cfg.total / zoneCount);
    const initial = Array.isArray(cfg.initialZones) ? cfg.initialZones : null;
    const it = {
      type: 'dragSplit',
      remaining: cfg.total - (initial ? initial.reduce((a, b) => a + b, 0) : 0),
      zones: initial ? [...initial] : Array.from({ length: zoneCount }, () => 0),
      activeZone: 0,
      cfg
    };
    session.currentInteraction = it;

    const hint = document.createElement('div');
    hint.className = 'dragsplit-hint';
    hint.textContent = Array.isArray(cfg.ratio)
      ? `按 ${cfg.ratio.join(':')} 分：点区域选中，再点物件装入；点「退回」可取出`
      : initial
        ? '有多有少不公平！点区域选中，用「退回」取出多的，再装入少的'
        : `先点一辆矿车选中它，再点岩核装进去。每辆矿车装一样多才公平！`;

    const pool = document.createElement('div');
    pool.className = 'dragsplit-pool';

    const zoneBar = document.createElement('div');
    zoneBar.className = 'dragsplit-zones';
    const zoneEls = [];
    for (let z = 0; z < zoneCount; z++) {
      const zone = document.createElement('button');
      zone.className = 'dragsplit-zone' + (z === 0 ? ' active' : '');
      zone.dataset.zone = z;
      zone.addEventListener('click', () => {
        if (session.answered) return;
        it.activeZone = z;
        zoneEls.forEach((el, i) => el.classList.toggle('active', i === z));
        refresh();
      });
      zoneBar.appendChild(zone);
      zoneEls.push(zone);
    }

    function refresh() {
      // 动态物件池：显示当前可分配的剩余物件
      pool.innerHTML = '';
      for (let index = 0; index < it.remaining; index++) {
        const item = document.createElement('button');
        item.className = 'dragsplit-item';
        item.textContent = cfg.item;
        item.addEventListener('click', () => {
          if (session.answered || it.remaining <= 0) return;
          it.remaining--;
          it.zones[it.activeZone]++;
          sfx('click');
          refresh();
        });
        pool.appendChild(item);
      }
      zoneEls.forEach((el, z) => {
        el.innerHTML = `${cfg.zoneEmoji} ${cfg.zoneName} ${z + 1}<br><strong>${'●'.repeat(it.zones[z]) || '空'}</strong><br><span>${it.zones[z]} 块</span>`;
      });
      undo.disabled = it.zones[it.activeZone] <= 0;
      hint.textContent = Array.isArray(cfg.ratio)
        ? `按 ${cfg.ratio.join(':')} 分（待分 ${it.remaining}）`
        : it.remaining > 0
          ? `还剩 ${it.remaining} 个待分配`
          : '分完了，检查每个区域是不是一样多！';
    }

    const undo = document.createElement('button');
    undo.className = 'genshin-btn small dragsplit-undo';
    undo.textContent = '↩️ 从当前区域退回一个';
    undo.addEventListener('click', () => {
      if (session.answered || it.zones[it.activeZone] <= 0) return;
      it.zones[it.activeZone]--;
      it.remaining++;
      sfx('click');
      refresh();
    });

    container.appendChild(hint);
    container.appendChild(pool);
    container.appendChild(zoneBar);
    container.appendChild(undo);
    refresh();
    makeInteractionConfirm(container, () => {
      if (it.remaining > 0) return false;
      if (Array.isArray(cfg.ratio)) {
        const ratioSum = cfg.ratio.reduce((a, b) => a + b, 0);
        return it.zones.every((count, i) => count === Math.round(cfg.total * cfg.ratio[i] / ratioSum));
      }
      return it.zones.every(count => count === perZone);
    });
  }

  // 结算一次作答（选择题和动手题共用）：记录学习证据、结算战斗效果、推进题目
  function resolveBattleAnswer(correct, questionIndex) {
    const priorAttempts = session.questionAttempts[questionIndex] || 0;
    const firstTry = priorAttempts === 0;
    const hintTier = session.questionHintTiers[questionIndex] || 0;
    session.questionAttempts[questionIndex] = priorAttempts + 1;

    state.learning = Learning.recordAttempt(state.learning, {
      skill: session.currentLevel.skill,
      levelId: session.currentLevel.id,
      correct,
      firstTry,
      hintTier
    });
    trackEvent('answer_submitted', {
      levelId: session.currentLevel.id,
      questionIndex,
      correct,
      firstTry,
      hintTier
    });

    if (correct) {
      // Boss 护盾：首题（破盾题）答对只破盾不掉血，物理演出优先
      if (session.bossShield && questionIndex === 0) {
        session.bossShield = false;
        session.correctStreak++;
        state.player.answerStreak++;
        sfx('burst');
        hitStop(); // 破盾帧停顿
        showStunOverlay('🛡️💥 护盾破碎！');
        $('#enemy-shield')?.classList.add('hidden');
        $('#enemy-sprite').classList.add('shake');
        setTimeout(() => $('#enemy-sprite').classList.remove('shake'), 400);
        trackEvent('boss_shield_break', { levelId: session.currentLevel.id });
        updateHud();
        saveGame();
        session.answerTimer = setTimeout(() => {
          session.answerTimer = null;
          if (session.battleResolved) return;
          session.currentQuestionIndex++;
          renderBattleQuestion();
        }, 900);
        return;
      }
      session.correctStreak++;
      state.player.answerStreak++;
      // 连续独立答对计数（首次尝试且零提示），用于触发灵感挑战
      if (firstTry && hintTier === 0) session.perfectStreak = (session.perfectStreak || 0) + 1;
      else session.perfectStreak = 0;
      const damage = Math.ceil(session.enemyMaxHp / session.currentQuestions.length);
      const remainingQuestions = session.currentQuestions.length - questionIndex - 1;
      // 敌人血量表达学习进度，不允许随机伤害或爆发跳过迁移题。
      session.enemyHp = Math.max(0, remainingQuestions * damage);
      if (firstTry && hintTier < 3) session.independentCorrect++;
      if (questionIndex === session.currentQuestions.length - 1) {
        session.transferFirstTry = firstTry;
        session.transferHintTier = hintTier;
      }

      // 武器加成只改变伤害数字的观感（被怪物防御削弱），不改变题目进度约束
      const weaponBonus = Math.max(0, getEquippedWeapon().attackBonus - getEnemyDefense());
      let shownDamage = damage + weaponBonus;

      // 弱点题答对：破防震慑，怪物下一次攻击无效，额外能量
      const isWeakness = questionIndex === getWeaknessIndex();
      if (isWeakness) {
        session.enemyStunned = true;
        shownDamage *= 2;
        showStunOverlay('⚡ 破防！怪物被震慑');
        $('#enemy-sprite').classList.add('stunned');
        hitStop(); // 重击帧停顿
      }

      if (session.correctStreak >= 3) {
        sfx('streak');
        triggerElementalReaction('resonance');
        showComboPop(session.correctStreak);
      }
      // 每日/每周任务：答对与连击进度
      const answerQuestNote = questCompletionNote([
        ...recordQuestProgress('correct', 1),
        ...recordQuestProgress('streak', state.player.answerStreak)
      ]);
      if (answerQuestNote) showHint(answerQuestNote);
      let energyGain = Math.round(34 * (hasPassive('energyGain') ? 1.5 : 1));
      if (isWeakness) energyGain += 16;
      if (session.buffDoubleEnergy > 0) {
        // 元素反应增益：接下来若干题答对能量翻倍
        energyGain *= 2;
        session.buffDoubleEnergy--;
      }
      state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + energyGain);
      showDamage(shownDamage, isWeakness);
      setTimeout(() => {
        $('#enemy-sprite').classList.add('shake');
        setTimeout(() => $('#enemy-sprite').classList.remove('shake'), 400);
      }, 100);
    } else {
      const notes = [];
      if (hasPassive('streakGuard') && !session.streakGuardUsed) {
        // 连击守护：每关一次，答错不清零连击数
        session.streakGuardUsed = true;
        notes.push('🛡️ 连击守护生效：连击没有被打断');
      } else {
        session.correctStreak = 0;
        state.player.answerStreak = 0;
      }
      session.wrongAnswers++;
      session.perfectStreak = 0;
      // 怪物反击：伤害 = 怪物攻击 − 玩家防御，震慑/护盾可抵挡
      if (session.enemyStunned) {
        session.enemyStunned = false;
        $('#enemy-sprite')?.classList.remove('stunned');
        notes.push('💫 怪物被震慑，这次反击落空了');
      } else if (session.itemShield) {
        session.itemShield = false;
        notes.push('🛡️ 护盾符文抵挡了这次攻击');
      } else if (session.buffShield) {
        // 元素反应护盾：抵挡一次答错伤害
        session.buffShield = false;
        notes.push('✨ 元素护盾抵挡了这次伤害');
      } else {
        const enemyHit = Math.max(1, getEnemyAttack() - getPlayerDefense());
        state.player.hp = Math.max(0, state.player.hp - enemyHit);
        notes.push(`${REGIONS[session.currentRegionId]?.enemyName || '怪物'}反击：-${enemyHit} 生命`);
      }
      const misconception = Learning.MISCONCEPTIONS[session.currentLevel.id];
      if (misconception) notes.push(`再观察一次：${misconception.recovery}`);
      if (notes.length) showHint(notes.join('；'));
    }

    checkAchievements();
    saveGame();
    updateHud();

    session.answerTimer = setTimeout(() => {
      session.answerTimer = null;
      if (session.battleResolved) return;
      if (state.player.hp <= 0 && hasPassive('revive') && !session.reviveUsed) {
        // 复苏之风：每场战斗一次，生命归零时恢复继续战斗
        session.reviveUsed = true;
        state.player.hp = 35;
        sfx('collect');
        showHint('🍃 复苏之风生效：生命恢复 35 点，继续挑战！');
        updateHud();
        renderBattleQuestion();
        return;
      }
      if (state.player.hp <= 0) {
        gameOver();
      } else if (correct && questionIndex === session.currentQuestions.length - 1) {
        // 连续 3 题独立答对：出难一档的灵感挑战题（只上调，答错无惩罚）
        if (session.perfectStreak >= 3 && !session.challengeDone) {
          startChallengeQuestion();
        } else {
          enemyDefeated();
        }
      } else if (correct) {
        session.currentQuestionIndex++;
        renderBattleQuestion();
      } else {
        // 错误是同一阶段内的可恢复尝试，不把玩家偷偷推进到下一题。
        renderBattleQuestion();
      }
    }, 900);
  }

  function handleAnswer(selected, btn) {
    if (session.answered) return;
    session.answered = true;
    const questionIndex = session.currentQuestionIndex;
    const q = session.currentQuestions[questionIndex];
    const correct = selected == q.answer; // 允许数字和字符串比较
    $$('.answer-btn').forEach(b => b.disabled = true);
    if (correct) { sfx('correct'); btn.classList.add('correct'); }
    else { sfx('wrong'); btn.classList.add('wrong'); }
    resolveBattleAnswer(correct, questionIndex);
  }

  // 动手题确认：交互组件判定对错后走同一套结算
  function handleInteractionAnswer(correct) {
    if (session.answered) return;
    session.answered = true;
    const questionIndex = session.currentQuestionIndex;
    if (correct) sfx('correct'); else sfx('wrong');
    resolveBattleAnswer(correct, questionIndex);
  }

  function showDamage(amount, gold = false) {
    const el = $('#damage-number');
    el.textContent = '-' + amount;
    el.classList.remove('show', 'gold');
    void el.offsetWidth; // 触发重排
    if (gold) el.classList.add('gold');
    el.classList.add('show');
  }

  // 战斗汁水：帧停顿（画面冻结 90ms + 白闪），用于破盾/弱点等重击时刻
  function hitStop() {
    const screen = $('#battle-screen');
    if (!screen) return;
    screen.classList.add('hit-stop');
    setTimeout(() => screen.classList.remove('hit-stop'), 90);
  }

  // 连击大字：3 连击起每次答对跳出「N 连击！」
  function showComboPop(streak) {
    const stage = $('.enemy-stage');
    if (!stage || streak < 3) return;
    const el = document.createElement('div');
    el.className = 'combo-pop';
    el.textContent = `${streak} 连击！`;
    stage.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  // 破防/震慑提示：浮现在怪物头顶
  function showStunOverlay(text) {
    const stage = $('.enemy-stage');
    if (!stage) return;
    const el = document.createElement('div');
    el.className = 'stun-overlay';
    el.textContent = text;
    stage.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }

  // 武器技能：每场战斗一次，震慑怪物（下一次反击无效）并造成可观的观感伤害
  function useWeaponStrike() {
    if (session.weaponStrikeUsed) return;
    session.weaponStrikeUsed = true;
    session.enemyStunned = true;
    const weapon = getEquippedWeapon();
    const strikeDamage = getPlayerAttack() + weapon.attackBonus;
    sfx('burst');
    showDamage(strikeDamage, true);
    showStunOverlay(`${weapon.emoji} ${weapon.name}！怪物被震慑`);
    $('#enemy-sprite').classList.add('stunned');
    setTimeout(() => {
      $('#enemy-sprite').classList.add('shake');
      setTimeout(() => $('#enemy-sprite').classList.remove('shake'), 400);
    }, 100);
    trackEvent('weapon_strike', { weapon: weapon.id, levelId: session.currentLevel?.id });
    updateHud();
  }

  // 使用主动战斗技能：商店购买，每场战斗限一次
  function useActiveSkill(id) {
    if (session.usedActiveSkills.includes(id)) return;
    if (!state.inventory.activeSkills.includes(id)) return;
    const skill = ACTIVE_SKILLS.find(item => item.id === id);
    if (!skill) return;
    session.usedActiveSkills.push(id);
    if (id === 'gustStun') {
      session.enemyStunned = true;
      sfx('burst');
      showStunOverlay('💨 风压震慑！怪物反击落空');
      $('#enemy-sprite').classList.add('stunned');
    } else if (id === 'healWave') {
      state.player.hp = Math.min(getEffectiveMaxHp(), state.player.hp + 30);
      sfx('correct');
      showHint('💚 治疗波动：恢复 30 点生命！');
    } else if (id === 'chargeHit') {
      session.buffDoubleEnergy += 2;
      sfx('burst');
      showHint('🔥 蓄势打击：接下来 2 题答对能量翻倍！');
    }
    trackEvent('active_skill_use', { id, levelId: session.currentLevel?.id });
    updateHud();
    saveGame();
  }

  // 使用消耗品：生命药水 / 护盾符文 / 智慧卷轴
  function useConsumable(id) {    if ((state.inventory.consumables[id] || 0) <= 0) return;
    const goods = CONSUMABLES.find(item => item.id === id);
    if (!goods) return;
    state.inventory.consumables[id]--;
    if (id === 'potion') {
      const heal = 40;
      state.player.hp = Math.min(getEffectiveMaxHp(), state.player.hp + heal);
      sfx('correct');
      showHint(`🧪 生命药水：恢复 ${heal} 点生命！`);
    } else if (id === 'shield') {
      session.itemShield = true;
      sfx('collect');
      showHint('🛡️ 护盾符文生效：将抵挡怪物的下一次攻击！');
    } else if (id === 'scroll') {
      useTieredHint(2, 'scroll');
      sfx('collect');
    }
    trackEvent('consumable_use', { id, levelId: session.currentLevel?.id });
    updateHud();
    saveGame();
  }

  // 元素反应特效
  function triggerElementalReaction(type) {
    const overlay = document.createElement('div');
    overlay.className = `elemental-reaction ${type}`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 800);
  }

  function useSkill(idx) {
    const skill = ELEMENTS[idx];
    const q = session.currentQuestions?.[session.currentQuestionIndex];
    if (!skill || !q || session.battleResolved || session.answered) return;
    if (skill.id === session.currentLevel?.skill) {
      // 本关元素：免费给出专属分层提示
      useTieredHint(2, 'element');
      session.lastElement = skill.id;
      return;
    }
    // 其他元素：消耗能量给出通用提示，与上一次使用的元素组合触发元素反应
    if (state.player.energy < OFF_ELEMENT_SKILL_COST) {
      showHint(`能量不足（需要 ${OFF_ELEMENT_SKILL_COST} 点），先答对题目积累能量吧！`);
      return;
    }
    state.player.energy -= OFF_ELEMENT_SKILL_COST;
    useTieredHint(1, 'element');
    tryElementalReaction(session.lastElement, skill.id);
    session.lastElement = skill.id;
    updateHud();
  }

  // 元素反应：连续使用两种不同元素技能触发组合效果（如风+火=扩散、水+雷=感电）
  function tryElementalReaction(prevElement, nextElement) {
    if (!prevElement || prevElement === nextElement) return;
    const key = [prevElement, nextElement].sort().join('+');
    const reaction = ELEMENTAL_REACTIONS[key] || DEFAULT_REACTION;
    applyReactionEffect(reaction);
    state.player.reactionsTriggered++;
    triggerElementalReaction('super');
    sfx('collect');
    showHint(`✨ 元素反应「${reaction.name}」：${reaction.desc}！`);
    trackEvent('elemental_reaction', {
      levelId: session.currentLevel?.id || null,
      pair: key,
      reaction: reaction.name
    });
    checkAchievements();
    saveGame();
  }

  function applyReactionEffect(reaction) {
    if (reaction.effect === 'energy') {
      state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + reaction.value);
    } else if (reaction.effect === 'heal') {
      state.player.hp = Math.min(getEffectiveMaxHp(), state.player.hp + reaction.value);
    } else if (reaction.effect === 'shield') {
      session.buffShield = true;
    } else if (reaction.effect === 'doubleEnergy') {
      session.buffDoubleEnergy += reaction.value;
    }
    updateHud();
  }

  function useTieredHint(tier, source = 'button') {
    const q = session.currentQuestions?.[session.currentQuestionIndex];
    if (!q || session.battleResolved || session.answered || tier < 1 || tier > 3) return;
    const questionIndex = session.currentQuestionIndex;
    const previousTier = session.questionHintTiers[questionIndex] || 0;
    if (tier > previousTier) {
      session.questionHintTiers[questionIndex] = tier;
      session.hintsUsed++;
    }
    $$('[data-hint-tier]').forEach(button => {
      button.classList.toggle('used', Number(button.dataset.hintTier) <= session.questionHintTiers[questionIndex]);
    });
    const hint = Learning.getTieredHint(session.currentLevel.skill, q, tier);
    showHint(source === 'burst' ? `✨ 元素共鸣：${hint}` : hint);
    trackEvent('hint_used', { levelId: session.currentLevel.id, questionIndex, tier, source });
  }

  function useBurst() {
    if (session.battleResolved || session.answered || state.player.energy < state.player.maxEnergy) return;
    sfx('burst');
    state.player.energy = 0;
    state.player.burstsUsed++;

    // 爆发特效
    const overlay = document.createElement('div');
    overlay.className = 'burst-overlay active';
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1200);

    state.player.hp = Math.min(getEffectiveMaxHp(), state.player.hp + 20);
    updateHud();
    recordQuestProgress('burst', 1); // 每日/每周任务：元素爆发计数（不覆盖学习提示）
    // 爆发提供恢复与脚手架，不替代任何一个学习阶段。
    useTieredHint(2, 'burst');
    checkAchievements();
    saveGame();
  }

  function enemyDefeated() {
    if (session.battleResolved) return;
    session.battleResolved = true;
    session.answered = true;
    sfx('win');
    $('#enemy-sprite').classList.add('defeated');
    const level = session.currentLevel;
    const region = REGIONS[session.currentRegionId];

    const firstClear = !state.player.completedLevels.includes(level.id);
    session.lastProgressAt = performance.now();
    showGuideBeam(8000); // 战斗胜利后亮光柱，指向下一个目标
    const starsThisRun = Learning.calculateStars({
      questionCount: session.currentQuestions.length,
      independentCorrect: session.independentCorrect,
      transferFirstTry: session.transferFirstTry,
      transferHintTier: session.transferHintTier
    });
    state.player.levelStars[level.id] = Math.max(state.player.levelStars[level.id] || 0, starsThisRun);

    const rewards = firstClear ? { gems: 60 + (hasPassive('gemFind') ? 15 : 0), exp: 100 } : { gems: 0, exp: 0 };
    let levelsGained = 0;
    if (firstClear) {
      state.player.completedLevels.push(level.id);
      levelsGained = grantRewards(rewards);
    }
    if (session.wrongAnswers === 0) unlockAchievement('perfectLevel');
    // 每日/每周任务：完成关卡计数
    const levelQuestNote = questCompletionNote(recordQuestProgress('level', 1));
    if (levelQuestNote) showHint(levelQuestNote, 3000);

    // 解锁下一个区域
    const allCompleted = LEVELS[session.currentRegionId].every(lv => state.player.completedLevels.includes(lv.id));
    if (session.currentRegionId === 0 && allCompleted) state.map.worldChanges.bridgeOpened = true;
    let newlyUnlockedRegion = null;
    if (allCompleted && session.currentRegionId < REGIONS.length - 1) {
      const next = session.currentRegionId + 1;
      if (!state.player.unlockedRegions.includes(next)) {
        state.player.unlockedRegions.push(next);
        newlyUnlockedRegion = next;
      }
    }
    checkAchievements();
    saveGame();
    trackEvent('level_complete', {
      levelId: level.id,
      firstClear,
      stars: starsThisRun,
      independentCorrect: session.independentCorrect,
      transferFirstTry: session.transferFirstTry,
      hintsUsed: session.hintsUsed,
      wrongAnswers: session.wrongAnswers
    });

    setTimeout(() => {
      showReward(level, region, {
        rewards,
        stars: starsThisRun,
        firstClear,
        allCompleted,
        newlyUnlockedRegion,
        levelsGained
      });
    }, 800);
  }

  // ========== 灵感挑战 ==========
  function startChallengeQuestion() {
    const skill = session.currentLevel?.skill || 'anemo';
    const pool = CHALLENGE_QUESTIONS[skill] || CHALLENGE_QUESTIONS.anemo;
    session.challengeQuestion = pool[Math.floor(Math.random() * pool.length)];
    session.challengeActive = true;
    session.challengeDone = true;
    sfx('streak');
    trackEvent('challenge_start', { levelId: session.currentLevel.id, skill, perfectStreak: session.perfectStreak });
    renderChallengeQuestion();
  }

  function renderChallengeQuestion() {
    const q = session.challengeQuestion;
    if (!q) return;
    session.answered = false;
    $('#question-tag').textContent = '✨ 灵感挑战';
    $('#question-tag').style.background = '#e8c86e';
    $('#question-text').textContent = q.text;
    $('#question-visual').innerHTML = '';
    const area = $('#answer-area');
    area.classList.remove('has-interaction');
    area.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleChallengeAnswer(opt, btn));
      area.appendChild(btn);
    });
  }

  // 灵感挑战判定：答对额外奖励，答错零惩罚直接进入结算
  function handleChallengeAnswer(selected, btn) {
    if (session.answered) return;
    session.answered = true;
    const q = session.challengeQuestion;
    const correct = selected == q.answer;
    $$('.answer-btn').forEach(b => b.disabled = true);
    session.challengeActive = false;
    if (correct) {
      sfx('win');
      btn.classList.add('correct');
      showStunOverlay('✨ 灵感挑战成功！');
      grantRewards({ gems: 30, exp: 50 });
      showHint('✨ 灵感挑战成功！额外 30 钻石 + 50 经验！', 2500);
      trackEvent('challenge_success', { levelId: session.currentLevel.id, skill: session.currentLevel?.skill });
    } else {
      sfx('wrong');
      btn.classList.add('wrong');
      showHint('挑战题答错不扣分，已经很棒了！', 2000);
      trackEvent('challenge_missed', { levelId: session.currentLevel.id });
    }
    updateHud();
    saveGame();
    setTimeout(() => {
      if (!session.battleResolved) enemyDefeated();
    }, 900);
  }

  function gameOver() {
    if (session.battleResolved) return;
    session.battleResolved = true;
    sfx('lose');
    const enemyName = REGIONS[session.currentRegionId]?.enemyName || '怪物';
    const tips = [`💔 被${enemyName}打败了！别灰心，数学就是不断试错。`];
    if ((state.inventory.consumables.potion || 0) > 0) {
      tips.push('背包里有生命药水，下次战斗开始时记得带上使用。');
    } else if (state.player.gems >= 20) {
      tips.push('去商店买一瓶生命药水（20 💎），关键时刻能救命。');
    }
    tips.push('再挑战一次吧！');
    showHint(tips.join(' '), 3500);
    setTimeout(() => {
      closeHint();
      if (session.currentRegionId !== null) {
        showRegionDetail(session.currentRegionId);
      } else {
        showScreen('world-map'); renderMap();
      }
    }, 3500);
  }

  function showReward(level, region, result) {
    showScreen('reward-screen');
    const worldChange = {
      '0-0': { kind: 'windmill', icon: '✣', title: '风种逐个归位，风车重新转起来了' },
      '0-1': { kind: 'wind-core', icon: '✦', title: '两个部分汇合，风核恢复了光亮' },
      '0-2': { kind: 'array', icon: '▦', title: '风灯排成整齐阵列，塔顶被点亮了' },
      '0-3': { kind: 'bridge', icon: '↔', title: '补给被平均送达，断裂的风桥贯通了' },
      '0-4': { kind: 'storm', icon: '◎', title: '两侧风压相等，风暴核心安静下来了' }
    }[level.id] || { kind: 'journey', icon: '✦', title: '你的数学操作改变了这片区域' };
    const changePanel = $('#reward-world-change');
    changePanel.dataset.change = worldChange.kind;
    changePanel.classList.remove('play-restoration');
    void changePanel.offsetWidth;
    changePanel.classList.add('play-restoration');
    $('#reward-change-icon').textContent = worldChange.icon;
    $('#reward-change-title').textContent = worldChange.title;
    $('#reward-title').textContent = ['mission', 'mechanism'].includes(result.completionSource) ? '世界修复完成' : '探索任务完成';
    $('#reward-stars').textContent = '⭐'.repeat(result.stars) + '☆'.repeat(3 - result.stars);
    $('#reward-stars').setAttribute('aria-label', `获得 ${result.stars} 项成长记录，共 3 项`);
    const growthLabels = ['完成修复', '讲清关系', '迁移新情境'];
    $('#reward-growth-badges').innerHTML = growthLabels.map((label, index) => `
      <div class="growth-badge ${index < result.stars ? 'earned' : 'growing'}">
        <span aria-hidden="true">${index < result.stars ? '✓' : '·'}</span>
        <strong>${label}</strong>
        <small>${index < result.stars ? '已经做到' : '下次再练'}</small>
      </div>`).join('');
    $('#reward-items').innerHTML = result.firstClear
      ? `
        <div class="reward-item"><div class="reward-icon">💎</div><div class="reward-count">+${result.rewards.gems}</div></div>
        <div class="reward-item"><div class="reward-icon">✨</div><div class="reward-count">+${result.rewards.exp} EXP</div></div>
      `
      : '<div class="reward-item"><div class="reward-icon">✓</div><div class="reward-count">已领取首通奖励</div></div>';
    let msg = result.completionSource === 'mechanism'
      ? `你先估算、再亲手投放验证，修复了「${level.name}」！`
      : result.completionSource === 'mission'
        ? `你用数学关系解决了「${level.name}」，并完成了新的情境迁移。`
        : `你化解了${region.enemyName}的阻碍，成功掌握了「${level.desc}」！`;
    if (result.newlyUnlockedRegion !== null) {
      msg += `${region.name}已全部净化，${REGIONS[result.newlyUnlockedRegion].name}已解锁！`;
    } else if (result.allCompleted) {
      msg += `${region.name}的挑战已全部完成！`;
    } else {
      msg += '继续挑战下一关吧。';
    }
    if (level.id === '0-0' && state.map.worldChanges.windmillRestored) msg += ' 远处的风车重新转动了。';
    if (level.id === '0-3' && state.map.worldChanges.bridgeOpened) msg += ' 风桥已经贯通，返回地图后可以继续自由探索。';
    if (level.id === '0-4' && state.map.worldChanges.stormCalmed) msg += ' 风暴核心恢复平衡，整个区域的风声安静了下来。';
    if (result.levelsGained) msg += ` 冒险等级提升到 ${state.player.level}！`;
    $('#reward-msg').textContent = msg;
    renderReflectionOptions(level);
  }

  function renderReflectionOptions(level) {
    const options = REFLECTIONS[level.id] || [
      '我先弄清了题目中的关系',
      '我用提示修正了原来的想法',
      '我把结果代回条件检查了一遍'
    ];
    const area = $('#reflection-options');
    area.innerHTML = '';
    let recorded = false;
    options.forEach(text => {
      const button = document.createElement('button');
      button.className = 'reflection-option';
      button.textContent = text;
      button.addEventListener('click', () => {
        if (recorded) return;
        recorded = true;
        button.classList.add('selected');
        $$('#reflection-options .reflection-option').forEach(item => { item.disabled = true; });
        state.learning.reflectionNotes.push({ levelId: level.id, text, at: Date.now() });
        state.learning.reflectionNotes = state.learning.reflectionNotes.slice(-30);
        saveGame();
        trackEvent('reflection_saved', { levelId: level.id, text });
      });
      area.appendChild(button);
    });
  }

  // 启动
  window.addEventListener('DOMContentLoaded', init);

  // 调试接口（开发用）
  window.__game = {
    session,
    state,
    showScreen,
    renderMap,
    showRegionDetail,
    startLevel,
    updatePlayerSprite,
    updateCamera,
    tryEnterRegion,
    openSkillTree,
    openMechanism
  };
})();
