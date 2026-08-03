// 数境远征：基于《北师大版小学数学核心方法论骨架》的关卡数据

const ELEMENTS = [
  { id: 'anemo', name: '一一对应', emoji: '🌪️', color: '#74c2a8' },
  { id: 'geo', name: '位值制', emoji: '⛰️', color: '#fab632' },
  { id: 'electro', name: '平均分', emoji: '⚡', color: '#af8ec1' },
  { id: 'dendro', name: '割补转化', emoji: '🌿', color: '#a5c23b' },
  { id: 'hydro', name: '等量关系', emoji: '💧', color: '#4fc3f7' },
  { id: 'pyro', name: '找单位1', emoji: '🔥', color: '#ef7a35' },
  { id: 'cryo', name: '变量关系', emoji: '❄️', color: '#9fd6e3' }
];

const REGIONS = [
  {
    id: 0, name: '风语原', theme: '数与运算', element: 'anemo',
    emoji: '🌪️', color: '#74c2a8',
    story: '风起于青萍之末。在这里，数字不再是枯燥的符号——风精灵会教你“一一对应”，把数和物轻轻配对；风的流动会带你发现加法与减法其实是“部分-整体”的舞蹈。',
    enemyEmoji: '👹', enemyName: '乱流团', enemyAttack: 12, enemyDefense: 0
  },
  {
    id: 1, name: '岩岚港', theme: '图形与几何', element: 'geo',
    emoji: '⛰️', color: '#fab632',
    story: '山契守望者守护的港城，每一块石头都藏着形状的秘密。从实物中抽象出图形，用“单位密铺”丈量土地，再用“割补转化”把不规则变成规则——几何的智慧，如岩元素般稳重。',
    enemyEmoji: '🪨', enemyName: '岩甲巨像', enemyAttack: 16, enemyDefense: 2
  },
  {
    id: 2, name: '雷鸣群岛', theme: '测量与单位', element: 'electro',
    emoji: '⚡', color: '#af8ec1',
    story: '雷光劈开迷雾，精确的度量由此诞生。长度、人民币、质量、时间……单位之间十进千进，如同雷电的节拍。学会“统一标准”，才能看清万物的真实尺度。',
    enemyEmoji: '⚡', enemyName: '雷幕术士', enemyAttack: 20, enemyDefense: 4
  },
  {
    id: 3, name: '森语城', theme: '数据与概率', element: 'dendro',
    emoji: '🌿', color: '#a5c23b',
    story: '智慧的国度里，知识如森林般生长。分类、计数、图表、平均数，是认识世界的眼睛；而“可能性”则像抽枝发芽——有时确定，有时未知，却总可以用分数描述大小。',
    enemyEmoji: '🌲', enemyName: '巨型蕈兽', enemyAttack: 24, enemyDefense: 6
  },
  {
    id: 4, name: '澄水庭', theme: '代数思维', element: 'hydro',
    emoji: '💧', color: '#4fc3f7',
    story: '水流千变万化，却始终遵循等式的平衡。用字母表示未知数，寻找等量关系，就像解开水元素的谜题。运算律、方程、负数、分数——抽象思维的洪流在此汇聚。',
    enemyEmoji: '🌊', enemyName: '水形幻人', enemyAttack: 26, enemyDefense: 8
  },
  {
    id: 5, name: '赤焰谷', theme: '比与比例', element: 'pyro',
    emoji: '🔥', color: '#ef7a35',
    story: '烈焰映照下，两个量之间的关系变得炽热而清晰。比、百分数、正比例与反比例——它们描述着“缩放”与“依存”，是通往函数世界的火种。',
    enemyEmoji: '🔥', enemyName: '熔岩战兽', enemyAttack: 30, enemyDefense: 10
  },
  {
    id: 6, name: '雪境宫', theme: '综合试炼', element: 'cryo',
    emoji: '❄️', color: '#9fd6e3',
    story: '冰雪覆盖的终极殿堂。这里没有单一的元素，所有方法论将交织成最严酷的考验。把“具体数的操作”升华到“抽象关系的把握”，才能成为真正的数境探索者。',
    enemyEmoji: '👿', enemyName: '寒域演算体', enemyAttack: 33, enemyDefense: 12
  }
];

const LEVELS = [
  // 风语原：数与运算
  [
    {
      id: '0-0', name: '风中的苹果', desc: '数物对应：一一配对',
      skill: 'anemo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '小远快看！草地上有好多苹果和盘子，风精灵说只有把苹果和盘子一一对应，才能解开风的封印！' },
        { speaker: '风精灵', emoji: '🌪️', text: '记住：一个苹果对一个盘子，没有剩余，也没有缺口，这就是“一一对应”。' }
      ],
      questions: [
        {
          text: '有 8 个盘子，每个盘子放 1 个苹果，一共需要几个苹果？',
          visual: { type: 'emoji', items: ['🍽️','🍽️','🍽️','🍽️','🍽️','🍽️','🍽️','🍽️'] },
          options: [6, 7, 8, 9], answer: 8,
          hint: '一个盘子配一个苹果，数一数盘子有几个。'
        },
        {
          text: '左边有 5 只小鸟，右边有 5 个鸟窝。如果每只小鸟回一个鸟窝，会剩下几个鸟窝？',
          visual: { type: 'emoji', items: ['🐦','🐦','🐦','🐦','🐦','🏠','🏠','🏠','🏠','🏠'] },
          options: [0, 1, 2, 5], answer: 0,
          hint: '5 只小鸟一一对应 5 个鸟窝，没有剩余。'
        },
        {
          text: '老师发给小朋友每人 1 支铅笔。如果有 7 个小朋友，需要准备几支铅笔？',
          options: [6, 7, 8, 9], answer: 7,
          hint: '7 个小朋友，每人 1 支，就是 7 个 1。'
        }
      ]
    },
    {
      id: '0-1', name: '风场加减法', desc: '合并与去掉：部分-整体',
      skill: 'anemo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '前面有个风场，要想到对岸，得先把被吹散的树叶“合并”起来，再把挡住路的石头“去掉”。' },
        { speaker: '星芽', emoji: '🧚', text: '加法就是“合起来”，减法就是“去掉”。我们试试看！' }
      ],
      questions: [
        {
          text: '草地上有 3 只小松鼠，又跑来 4 只。现在一共有几只小松鼠？',
          visual: { type: 'emoji', items: ['🐿️','🐿️','🐿️','➕','🐿️','🐿️','🐿️','🐿️'] },
          options: [6, 7, 8, 9], answer: 7,
          hint: '合起来用加法：3 + 4 = 7。'
        },
        {
          text: '树上有 12 个苹果，摘掉了 5 个，还剩几个？',
          options: [5, 6, 7, 8], answer: 7,
          hint: '去掉用减法：12 - 5 = 7。'
        },
        {
          text: '小明有 15 元，买书花了 8 元，还剩多少元？',
          options: [6, 7, 8, 9], answer: 7,
          hint: '剩下的 = 原来的 - 花掉的。'
        }
      ]
    },
    {
      id: '0-2', name: '旋风乘法阵', desc: '乘法起源：相同加数累加',
      skill: 'anemo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '好多个风团排成了整齐的方阵！如果一排有 4 只，一共有 3 排，总不能一个一个数吧？' },
        { speaker: '星芽', emoji: '🧚', text: '乘法就是“几个几”的简便算法：3 个 4 相加，可以写成 3 × 4。' }
      ],
      questions: [
        {
          text: '每排有 5 棵树，一共有 4 排。用加法表示是 5+5+5+5，乘法算式是什么？',
          visual: { type: 'grid', rows: 4, cols: 5, emoji: '🌳' },
          options: ['4 × 5', '4 + 5', '5 × 5', '5 + 4'], answer: '4 × 5',
          hint: '4 排，每排 5 棵，就是 4 × 5。'
        },
        {
          text: '一盒铅笔有 6 支，买 3 盒一共有多少支？',
          options: [9, 12, 15, 18], answer: 18,
          hint: '3 个 6 相加，用乘法：3 × 6 = 18。'
        },
        {
          text: '二年级的同学排成 7 行 8 列的方阵，一共有多少人？',
          options: [54, 56, 48, 64], answer: 56,
          hint: '7 行 8 列 = 7 × 8 = 56。'
        }
      ]
    },
    {
      id: '0-3', name: '风的均分', desc: '除法：平均分与包含除',
      skill: 'anemo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '风把糖果吹成了几堆。要把糖果平均分给小伙伴，或者知道每人分几颗能分给几个人，就要用到除法啦！' },
        { speaker: '星芽', emoji: '🧚', text: '平均分：总数 ÷ 份数 = 每份数。包含除：总数 ÷ 每份数 = 份数。' }
      ],
      questions: [
        {
          text: '把 18 颗糖平均分给 3 个小朋友，每人几颗？',
          options: [5, 6, 7, 9], answer: 6,
          hint: '18 ÷ 3 = 6，想乘法口诀：三六十八。'
        },
        {
          text: '每袋装 4 个面包，20 个面包可以装几袋？',
          options: [4, 5, 6, 8], answer: 5,
          hint: '20 里面有几个 4？20 ÷ 4 = 5。'
        },
        {
          text: '有 27 根小棒，每 9 根拼一个三角形，可以拼几个三角形？',
          options: [2, 3, 4, 5], answer: 3,
          hint: '27 ÷ 9 = 3。'
        }
      ]
    },
    {
      id: '0-4', name: '风暴核心', desc: '综合迁移：等量与平衡',
      skill: 'anemo',
      intro: [
        { speaker: '风精灵', emoji: '🌪️', text: '最后的风暴不会被蛮力击退。比较两侧风压，找出缺少的部分，让它们重新相等。' },
        { speaker: '星芽', emoji: '🧚', text: '别照搬上一关的动作。风向会反转，必须重新观察、预测和检验！' }
      ],
      questions: [
        {
          text: '左侧有 3 点风力，右侧有 6 点。左侧补多少点后两边相等？',
          options: [2, 3, 6, 9], answer: 3,
          hint: '比较 3 和 6 的差：6 - 3 = 3。'
        },
        {
          text: '两侧风压都为 8 点时，下面哪句话正确？',
          options: ['左侧更强', '右侧更强', '两侧平衡', '无法比较'], answer: '两侧平衡',
          hint: '平衡表示两侧数量相等。'
        },
        {
          text: '左侧 8 点、右侧 5 点，应该给哪一侧补 3 点？',
          options: ['左侧', '右侧', '两侧都补', '两侧都不补'], answer: '右侧',
          hint: '重新比较两侧，较少的一侧需要补足。'
        }
      ]
    },
    {
      id: '0-5', name: '连加连减', desc: '三个数的连续运算',
      skill: 'anemo',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '风场上的风种会落下、聚集，也会被吹走。我们一边点一边算，就知道最后剩几颗啦！' }],
      questions: [
        {
          text: '风场上先落下 3 颗风种，又落下 4 颗，后来被风吹走 2 颗。点亮现在还留在场上的风种！',
          options: [4, 5, 6, 7], answer: 5,
          hint: '3 + 4 = 7，7 - 2 = 5。把吹走的 2 颗留空，点亮剩下的。',
          interaction: {
            type: 'tapCount', mode: 'fill',
            item: '🍃', itemName: '风种',
            rows: 1, cols: 7, target: 5
          }
        },
        { text: '风车村收集了 23 颗风种，又收集 15 颗，送出 7 颗，还剩多少颗？', options: [21, 31, 35, 45], answer: 31, hint: '23 + 15 = 38，38 - 7 = 31。从左到右依次算。' }
      ]
    },
    {
      id: '0-6', name: '乘法口诀', desc: '口诀记忆与逆用',
      skill: 'anemo',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '风铃挂成整齐的行和列，不用一只只数，乘法口诀一下子就算出来！' }],
      questions: [
        {
          text: '庭院里的风铃挂成 4 行 3 列。点亮全部风铃，看看一共挂了多少只！',
          options: [7, 10, 12, 14], answer: 12,
          hint: '每行 3 只，4 行：3 × 4 = 12。可以点「整行点亮」更快。',
          interaction: {
            type: 'tapCount', mode: 'fill',
            item: '🔔', itemName: '风铃',
            rows: 4, cols: 3, target: 12
          }
        },
        { text: '36 只风铃要平均分挂到 4 个窗口，每个窗口挂几只？（想口诀：四九三十六）', options: [6, 8, 9, 12], answer: 9, hint: '36 ÷ 4 = 9。' }
      ]
    }
  ],
  // 岩岚港：图形与几何
  [
    {
      id: '1-0', name: '岩港识形', desc: '从实物抽象图形',
      skill: 'geo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '岩岚的建筑好漂亮！长方体的柱子、球形的灯笼、圆柱的茶杯……我们来辨认这些图形吧。' },
        { speaker: '岩岚学者', emoji: '📜', text: '几何图形是从生活物品中抽象出来的。先看边、角、面，再归类。' }
      ],
      questions: [
        {
          text: '下面哪个物体最接近“圆柱”？',
          options: ['🎲 骰子', '🥫 罐头', '🎾 网球', '📦 纸箱'], answer: '🥫 罐头',
          hint: '圆柱上下两个底面是圆，侧面是曲面。'
        },
        {
          text: '长方体有几个面？',
          options: [4, 5, 6, 8], answer: 6,
          hint: '长方体有上、下、前、后、左、右 6 个面。'
        },
        {
          text: '下面哪个图形有“四条边相等、四个直角”？',
          options: ['长方形', '正方形', '三角形', '圆形'], answer: '正方形',
          hint: '正方形四条边一样长，四个角都是直角。'
        }
      ]
    },
    {
      id: '1-1', name: '古城墙周长', desc: '周长：边界累加',
      skill: 'geo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '岩岚的城墙要重新丈量长度，也就是“周长”。周长就是图形边界一周的总长度。' },
        { speaker: '工匠', emoji: '🔨', text: '长方形城墙可以用（长+宽）×2，不规则的就把每条边加起来。' }
      ],
      questions: [
        {
          text: '一个长方形长 8 米、宽 5 米，周长是多少米？',
          options: [13, 18, 26, 40], answer: 26,
          hint: '（长+宽）× 2 = (8+5) × 2 = 26。'
        },
        {
          text: '正方形花坛边长 6 米，周长是多少米？',
          options: [12, 18, 24, 36], answer: 24,
          hint: '正方形周长 = 边长 × 4 = 6 × 4 = 24。'
        },
        {
          text: '一个三角形三条边分别是 5cm、7cm、9cm，周长是多少？',
          options: [16, 19, 21, 22], answer: 21,
          hint: '把三条边加起来：5 + 7 + 9 = 21。'
        }
      ]
    },
    {
      id: '1-2', name: '密铺量地', desc: '面积：单位正方形个数',
      skill: 'dendro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '要用同样大小的方砖铺满地面，一共需要多少块？这就是面积的“密铺度量”。' },
        { speaker: '星芽', emoji: '🧚', text: '长方形的面积 = 长 × 宽，其实就是“每行几块 × 有几行”。' }
      ],
      questions: [
        {
          text: '一个长方形长 5cm、宽 3cm，用 1cm² 的小正方形铺满，需要几个？',
          visual: { type: 'grid', rows: 3, cols: 5, emoji: '⬜' },
          options: [8, 12, 15, 18], answer: 15,
          hint: '每行 5 个，3 行：5 × 3 = 15。'
        },
        {
          text: '正方形边长 4cm，面积是多少？',
          options: [8, 12, 16, 20], answer: 16,
          hint: '正方形面积 = 边长 × 边长 = 4 × 4 = 16。'
        },
        {
          text: '长方形菜地长 7 米、宽 4 米，面积是多少平方米？',
          options: [22, 24, 28, 32], answer: 28,
          hint: '7 × 4 = 28。'
        }
      ]
    },
    {
      id: '1-3', name: '割补求山', desc: '割补转化求面积',
      skill: 'dendro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '这座山形石碑不是规则图形，怎么办？岩岚的石匠说：割一割、补一补，就能把未知变成已知。' },
        { speaker: '石匠', emoji: '⛏️', text: '割补转化的核心：不改变面积，只改变形状，让图形变成我们会算的长方形或正方形。' }
      ],
      questions: [
        {
          text: '一个 L 形图形，可以割成两个长方形。如果割成的是一个 4×2 和一个 3×2 的长方形，面积是多少？',
          options: [12, 14, 16, 18], answer: 14,
          hint: '两个长方形面积相加：4×2 + 3×2 = 8 + 6 = 14。'
        },
        {
          text: '平行四边形割补后变成长方形。底 6cm、高 4cm 的平行四边形面积是多少？',
          options: [20, 24, 28, 30], answer: 24,
          hint: '底 × 高 = 6 × 4 = 24。'
        },
        {
          text: '一个不规则图形经过割补，正好拼成一个边长 5cm 的正方形。原图形面积是多少？',
          options: [20, 22, 25, 30], answer: 25,
          hint: '割补不改变面积，所以等于正方形面积 5×5=25。'
        }
      ]
    },
    {
      id: '1-4', name: '角的认识', desc: '锐角、直角、钝角',
      skill: 'geo',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '角有锐角、直角、钝角之分。' }],
      questions: [
        { text: '直角是多少度？', options: ['30°', '60°', '90°', '120°'], answer: '90°', hint: '直角=90°。' },
        { text: '比直角小的角叫？', options: ['锐角', '直角', '钝角', '平角'], answer: '锐角', hint: '锐角<90°。' }
      ]
    },
    {
      id: '1-5', name: '三角形特性', desc: '三边关系与内角和',
      skill: 'geo',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '三角形内角和是180°。' }],
      questions: [
        { text: '三角形内角和是？', options: ['90°', '180°', '270°', '360°'], answer: '180°', hint: '内角和180°。' },
        { text: '等边三角形每个角是？', options: ['45°', '60°', '90°', '120°'], answer: '60°', hint: '180÷3=60。' }
      ]
    }
  ],
  // 雷鸣群岛：测量与单位
  [
    {
      id: '2-0', name: '雷光尺', desc: '长度单位与换算',
      skill: 'electro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '雷岛的工匠用“雷光尺”测量东西。长度单位有毫米、厘米、分米、米，它们之间是十进制。' },
        { speaker: '工匠', emoji: '🔨', text: '大单位化小单位乘 10，小单位化大单位除以 10。' }
      ],
      questions: [
        {
          text: '1 米等于多少厘米？',
          options: [10, 100, 1000, 10000], answer: 100,
          hint: '1 米 = 10 分米 = 100 厘米。'
        },
        {
          text: '3 米 5 厘米等于多少厘米？',
          options: [35, 305, 350, 3005], answer: 305,
          hint: '3 米 = 300 厘米，再加 5 厘米。'
        },
        {
          text: '一根绳子长 2 米 40 厘米，另一根长 160 厘米。两根接在一起是多少厘米？',
          options: [300, 320, 340, 400], answer: 400,
          hint: '2 米 40 厘米 = 240 厘米；240 + 160 = 400 厘米。'
        }
      ]
    },
    {
      id: '2-1', name: '雷神的钱袋', desc: '人民币换算与找零',
      skill: 'electro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '在雷岛买东西要会算钱！1 元 = 10 角 = 100 分，付钱可以正好付，也可以付大额让老板找零。' }
      ],
      questions: [
        {
          text: '一支笔 8 角，付 1 元应找回多少？',
          options: ['1 角', '2 角', '8 角', '1 元 2 角'], answer: '2 角',
          hint: '1 元 = 10 角，10 - 8 = 2 角。'
        },
        {
          text: '一本练习册 3 元 5 角，买 2 本需要多少钱？',
          options: ['6 元', '6 元 5 角', '7 元', '7 元 5 角'], answer: '7 元',
          hint: '3 元 5 角 × 2 = 6 元 10 角 = 7 元。'
        },
        {
          text: '小明有 5 张 1 元、3 张 5 角，一共有多少钱？',
          options: ['5 元 5 角', '6 元', '6 元 5 角', '7 元'], answer: '6 元 5 角',
          hint: '5 元 + 1 元 5 角 = 6 元 5 角。'
        }
      ]
    },
    {
      id: '2-2', name: '千钧之重', desc: '质量单位换算',
      skill: 'electro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '雷岛的铁块好重！质量单位有克、千克、吨，1 千克 = 1000 克，1 吨 = 1000 千克。' }
      ],
      questions: [
        {
          text: '2 千克等于多少克？',
          options: [20, 200, 1000, 2000], answer: 2000,
          hint: '1 千克 = 1000 克，2 千克 = 2000 克。'
        },
        {
          text: '5000 千克等于多少吨？',
          options: [5, 50, 500, 5000], answer: 5,
          hint: '1000 千克 = 1 吨，5000 千克 = 5 吨。'
        },
        {
          text: '一袋大米 25 千克，40 袋大米重多少吨？',
          options: [1, 1.5, 2, 2.5], answer: 1,
          hint: '25 × 40 = 1000 千克 = 1 吨。'
        }
      ]
    },
    {
      id: '2-3', name: '雷电计时', desc: '时间量计算',
      skill: 'electro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '雷暴在几时几分降临？时间单位时、分、秒是 60 进制，计算经过时间要用结束时刻减开始时刻。' }
      ],
      questions: [
        {
          text: '1 时 30 分等于多少分？',
          options: [60, 80, 90, 130], answer: 90,
          hint: '1 时 = 60 分，60 + 30 = 90。'
        },
        {
          text: '一节课从 8:10 上到 8:50，上了多少分钟？',
          options: [30, 40, 50, 60], answer: 40,
          hint: '8:50 - 8:10 = 40 分。'
        },
        {
          text: '小明从 14:20 开始做作业，做了 1 小时 35 分，结束时是几时几分？',
          options: ['15:45', '15:55', '16:05', '16:15'], answer: '15:55',
          hint: '14 时 20 分 + 1 时 35 分 = 15 时 55 分。'
        }
      ]
    },
    {
      id: '2-4', name: '毫米与分米', desc: '更小的长度单位',
      skill: 'electro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '1厘米=10毫米，1分米=10厘米。' }],
      questions: [
        { text: '1厘米=？毫米', options: ['10', '100', '1000', '1'], answer: '10', hint: '1cm=10mm。' },
        { text: '5分米=？厘米', options: ['5', '50', '500', '5000'], answer: '50', hint: '5×10=50。' }
      ]
    },
    {
      id: '2-5', name: '元角分换算', desc: '人民币计算',
      skill: 'electro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '1元=10角，1角=10分。' }],
      questions: [
        { text: '1元5角=？角', options: ['5', '10', '15', '20'], answer: '15', hint: '10+5=15。' },
        { text: '3元2角+2元8角=？', options: ['5元', '6元', '5元10角', '6元10角'], answer: '6元', hint: '2角+8角=1元。' }
      ]
    }
  ],
  // 森语城：数据与概率
  [
    {
      id: '3-0', name: '森林调查员', desc: '分类-计数-呈现',
      skill: 'dendro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '森语的学者要统计森林里不同树木的数量。先确定分类标准，再用符号计数，最后用图表呈现。' }
      ],
      questions: [
        {
          text: '调查班上同学最喜欢的水果：苹果 8 人、香蕉 5 人、西瓜 7 人。喜欢哪种水果的人最多？',
          options: ['苹果', '香蕉', '西瓜', '一样多'], answer: '苹果',
          hint: '8 > 7 > 5，苹果最多。'
        },
        {
          text: '一个“正”字代表 5 票。某游戏得了“正正T”的票数，一共多少票？',
          options: [10, 11, 12, 13], answer: 12,
          hint: '两个“正”字 10 票，再加 2 画，共 12 票。'
        },
        {
          text: '条形图中，纵轴每格代表 2 人。某项目条形高 4 格，表示多少人？',
          options: [2, 4, 6, 8], answer: 8,
          hint: '每格 2 人，4 格 = 4 × 2 = 8 人。'
        }
      ]
    },
    {
      id: '3-1', name: '智慧平均数', desc: '移多补少',
      skill: 'dendro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '平均数就像把多的补给少的，最后大家变得一样多。总数 ÷ 份数 = 平均数。' }
      ],
      questions: [
        {
          text: '小明三天分别读了 20 页、24 页、22 页书，平均每天读多少页？',
          options: [20, 21, 22, 23], answer: 22,
          hint: '总数 66 页，66 ÷ 3 = 22。'
        },
        {
          text: '四个小朋友身高分别是 130cm、132cm、128cm、134cm，平均身高是多少？',
          options: [130, 131, 132, 133], answer: 131,
          hint: '总数 524，524 ÷ 4 = 131。'
        },
        {
          text: '五次测验平均分 90 分，总分是多少？',
          options: [360, 400, 450, 500], answer: 450,
          hint: '平均分 × 次数 = 90 × 5 = 450。'
        }
      ]
    },
    {
      id: '3-2', name: '可能性之种', desc: '概率大小定量描述',
      skill: 'dendro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '森语森林里有些果实是甜的，有些是酸的。可能性大小可以用“有利结果数 ÷ 总结果数”来表示。' }
      ],
      questions: [
        {
          text: '袋子里有 3 个红球、2 个白球，任意摸一个，摸到红球的可能性是多少？',
          options: ['2/5', '3/5', '1/2', '1/3'], answer: '3/5',
          hint: '红球 3 个，总数 5 个，可能性 = 3/5。'
        },
        {
          text: '一枚硬币正面朝上的可能性是多少？',
          options: ['1/3', '1/2', '1/4', '1'], answer: '1/2',
          hint: '硬币有正反两面，正面朝上占 1/2。'
        },
        {
          text: '转盘平均分成 8 份，其中 3 份是奖品区。指针停在奖品区的可能性是多少？',
          options: ['3/8', '5/8', '3/5', '1/3'], answer: '3/8',
          hint: '奖品区 3 份，总 8 份，可能性 = 3/8。'
        }
      ]
    },
    {
      id: '3-7', name: '折线统计图', desc: '看趋势变化',
      skill: 'dendro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '折线图能清楚看出变化趋势。' }],
      questions: [
        { text: '折线图主要表示？', options: ['数量多少', '变化趋势', '比例关系', '平均数'], answer: '变化趋势', hint: '折线图看趋势。' },
        { text: '统计气温变化用？', options: ['条形图', '折线图', '扇形图', '统计表'], answer: '折线图', hint: '气温变化用折线图。' }
      ]
    },
    {
      id: '3-8', name: '平均数应用', desc: '移多补少',
      skill: 'dendro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '平均数=总数÷份数。' }],
      questions: [
        { text: '12、15、18的平均数是？', options: ['12', '15', '18', '20'], answer: '15', hint: '45÷3=15。' },
        { text: '语文90、数学96、英语84，平均分是？', options: ['88', '90', '92', '94'], answer: '90', hint: '270÷3=90。' }
      ]
    }
  ],
  // 澄水庭：代数思维
  [
    {
      id: '4-0', name: '等式天平', desc: '运算律的发现与应用',
      skill: 'hydro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '澄水的法庭上，等式必须保持平衡。运算律就是水元素的规律：交换律、结合律、分配律。' }
      ],
      questions: [
        {
          text: '25 × 17 × 4 = 25 × 4 × 17 运用了什么运算律？',
          options: ['加法交换律', '乘法交换律', '乘法结合律', '乘法分配律'], answer: '乘法交换律',
          hint: '交换了 17 和 4 的位置。'
        },
        {
          text: '99 × 56 + 56 = (99 + 1) × 56 运用了什么运算律？',
          options: ['乘法交换律', '乘法结合律', '乘法分配律', '加法结合律'], answer: '乘法分配律',
          hint: '把相同的 56 提取出来，99 个 56 加 1 个 56 等于 100 个 56。'
        },
        {
          text: '用简便方法计算：125 × 32 × 25',
          options: [10000, 100000, 1000000, 320000], answer: 100000,
          hint: '32 = 8 × 4，125×8=1000，25×4=100，1000×100=100000。'
        }
      ]
    },
    {
      id: '4-1', name: '水形方程', desc: '符号化与等式求解',
      skill: 'hydro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '水会变形，但总量不变。用字母代表未知数，根据等量关系列方程，就像解开水流的密码。' }
      ],
      questions: [
        {
          text: '方程  x + 8 = 15  的解是多少？',
          options: [5, 6, 7, 8], answer: 7,
          hint: 'x = 15 - 8 = 7。'
        },
        {
          text: '3x = 24，x 等于多少？',
          options: [6, 7, 8, 9], answer: 8,
          hint: 'x = 24 ÷ 3 = 8。'
        },
        {
          text: '一个数的 5 倍减去 7 等于 18，这个数是多少？（列方程解）',
          options: [4, 5, 6, 7], answer: 5,
          hint: '设这个数为 x：5x - 7 = 18，5x = 25，x = 5。'
        }
      ]
    },
    {
      id: '4-2', name: '正负两极', desc: '负数与相反意义量',
      skill: 'hydro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '澄水的水下世界有高压和低压。零上、零下；存入、支出；上升、下降——这些相反意义的量可以用正负数表示。' }
      ],
      questions: [
        {
          text: '如果向东走 50 米记作 +50 米，那么向西走 30 米记作多少？',
          options: ['+30 米', '-30 米', '30 米', '-50 米'], answer: '-30 米',
          hint: '东和西相反，向东为正，向西为负。'
        },
        {
          text: '在数轴上，-3 在 0 的哪一边？',
          options: ['左边', '右边', '上面', '下面'], answer: '左边',
          hint: '负数在 0 的左边，正数在 0 的右边。'
        },
        {
          text: '某天最低气温 -5℃，最高气温 4℃，这一天温差是多少？',
          options: [1, 4, 9, 10], answer: 9,
          hint: '从 -5 到 0 是 5℃，从 0 到 4 是 4℃，温差 5+4=9℃。'
        }
      ]
    },
    {
      id: '4-3', name: '分数天平', desc: '分数单位与通分',
      skill: 'pyro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '分数就像一块蛋糕被平均分。分母表示平均分的份数，分子表示取了几份。不同分母的分数相加减，要先通分统一单位。' }
      ],
      questions: [
        {
          text: '3/8 的分数单位是多少？',
          options: ['1/3', '1/8', '3/8', '8/3'], answer: '1/8',
          hint: '分母是 8，分数单位就是 1/8。'
        },
        {
          text: '1/4 + 1/2 等于多少？',
          options: ['1/6', '2/6', '3/4', '1/4'], answer: '3/4',
          hint: '通分：1/2 = 2/4，1/4 + 2/4 = 3/4。'
        },
        {
          text: '5/6 - 1/3 等于多少？',
          options: ['1/2', '2/3', '4/9', '1/3'], answer: '1/2',
          hint: '1/3 = 2/6，5/6 - 2/6 = 3/6 = 1/2。'
        }
      ]
    },
    {
      id: '4-8', name: '字母表示数', desc: '代数入门',
      skill: 'hydro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '用字母可以表示任何数。' }],
      questions: [
        { text: '小明有a个苹果，吃了3个，还剩？', options: ['a+3', 'a-3', '3a', 'a÷3'], answer: 'a-3', hint: '吃了3个用减法。' },
        { text: '每盒x支笔，5盒有？', options: ['x+5', 'x-5', '5x', 'x÷5'], answer: '5x', hint: '5盒就是5x。' }
      ]
    },
    {
      id: '4-9', name: '等式性质', desc: '天平平衡原理',
      skill: 'hydro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '等式两边同时加减乘除相同数，等式成立。' }],
      questions: [
        { text: 'x+5=12，x=？', options: ['5', '6', '7', '8'], answer: '7', hint: '12-5=7。' },
        { text: '3x=18，x=？', options: ['5', '6', '7', '8'], answer: '6', hint: '18÷3=6。' }
      ]
    }
  ],
  // 赤焰谷：比与比例
  [
    {
      id: '5-0', name: '烈焰之比', desc: '比的意义与化简',
      skill: 'pyro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '赤焰谷的火炬有高有矮，两个量之间的关系可以用“比”来表示。比的前项和后项同时除以相同的数，比值不变。' }
      ],
      questions: [
        {
          text: '把 12:18 化成最简整数比。',
          options: ['2:3', '3:2', '6:9', '1:1'], answer: '2:3',
          hint: '前项后项同时除以 6。'
        },
        {
          text: '男生 20 人，女生 25 人，男生与女生的人数比是多少？',
          options: ['4:5', '5:4', '20:25', '1:1'], answer: '4:5',
          hint: '20:25 同时除以 5 得 4:5。'
        },
        {
          text: '一个比的前项是 8，比值是 2，后项是多少？',
          options: [4, 8, 16, 2], answer: 4,
          hint: '前项 ÷ 后项 = 比值，后项 = 8 ÷ 2 = 4。'
        }
      ]
    },
    {
      id: '5-1', name: '熔岩百分数', desc: '找单位1与百分数应用',
      skill: 'pyro',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '百分数把分母统一成 100，方便比较。解百分数问题要先找“单位 1”——通常在“是”“占”“比”的后面。' }
      ],
      questions: [
        {
          text: '80 的 25% 是多少？',
          options: [20, 25, 30, 40], answer: 20,
          hint: '80 × 25% = 80 × 0.25 = 20。'
        },
        {
          text: '某班有 40 人，男生占 60%，男生有多少人？',
          options: [20, 22, 24, 26], answer: 24,
          hint: '40 × 60% = 24。'
        },
        {
          text: '一件商品原价 200 元，涨价 10% 后的售价是多少？',
          options: [210, 220, 230, 240], answer: 220,
          hint: '200 × (1 + 10%) = 220。'
        }
      ]
    },
    {
      id: '5-2', name: '火山比例', desc: '正比例与反比例',
      skill: 'cryo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '火山喷发的能量和熔岩量之间有什么关系？如果两个量的比值一定，就是正比例；如果乘积一定，就是反比例。' }
      ],
      questions: [
        {
          text: '速度一定时，路程和时间成什么比例？',
          options: ['正比例', '反比例', '不成比例', '无法判断'], answer: '正比例',
          hint: '速度 = 路程 ÷ 时间（一定），比值一定，成正比例。'
        },
        {
          text: '路程一定时，速度和时间成什么比例？',
          options: ['正比例', '反比例', '不成比例', '无法判断'], answer: '反比例',
          hint: '速度 × 时间 = 路程（一定），乘积一定，成反比例。'
        },
        {
          text: '如果 x 和 y 成正比例，当 x 从 2 变成 6 时，y 从 5 变成多少？',
          options: [10, 12, 15, 20], answer: 15,
          hint: 'x 扩大 3 倍，y 也扩大 3 倍：5 × 3 = 15。'
        }
      ]
    },
    {
      id: '5-7', name: '比的应用', desc: '按比分配',
      skill: 'pyro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '按比分配先求总份数。' }],
      questions: [
        { text: '60按2:3分，甲得？', options: ['20', '24', '30', '36'], answer: '24', hint: '60×2/5=24。' },
        { text: '90按1:2:3分，最多是？', options: ['30', '45', '60', '90'], answer: '45', hint: '90×3/6=45。' }
      ]
    },
    {
      id: '5-8', name: '百分数应用', desc: '求百分之几',
      skill: 'pyro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '求一个数的百分之几用乘法。' }],
      questions: [
        { text: '200的15%是？', options: ['20', '30', '40', '50'], answer: '30', hint: '200×0.15=30。' },
        { text: '80元打八折是？', options: ['60', '64', '70', '72'], answer: '64', hint: '80×0.8=64。' }
      ]
    }
  ],
  // 雪境宫：综合试炼
  [
    {
      id: '6-0', name: '冰原圆月', desc: '化曲为直求圆',
      skill: 'cryo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '雪境的冰原上挂着一轮圆月。圆的周长和面积用“化曲为直”的思想：把圆分割拼补，近似成长方形。' }
      ],
      questions: [
        {
          text: '一个圆的半径是 3cm，直径是多少？',
          options: [3, 6, 9, 12], answer: 6,
          hint: '直径 = 半径 × 2 = 3 × 2 = 6。'
        },
        {
          text: '圆的周长公式是 C = 2πr。当 r = 5cm 时，周长是多少？（π 取 3.14）',
          options: [15.7, 31.4, 62.8, 78.5], answer: 31.4,
          hint: '2 × 3.14 × 5 = 31.4。'
        },
        {
          text: '圆的面积公式是 S = πr²。当 r = 4cm 时，面积是多少？（π 取 3.14）',
          options: [25.12, 50.24, 100.48, 200.96], answer: 50.24,
          hint: '3.14 × 4 × 4 = 50.24。'
        }
      ]
    },
    {
      id: '6-1', name: '冰柱体积', desc: '体积：单位立方体密铺',
      skill: 'cryo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '雪境的冰柱是长方体。体积就是“单位立方体的个数”，长方体体积 = 长 × 宽 × 高。' }
      ],
      questions: [
        {
          text: '一个长方体长 5cm、宽 4cm、高 3cm，体积是多少？',
          options: [12, 24, 60, 120], answer: 60,
          hint: '5 × 4 × 3 = 60。'
        },
        {
          text: '一个正方体棱长 6cm，体积是多少？',
          options: [36, 72, 180, 216], answer: 216,
          hint: '6 × 6 × 6 = 216。'
        },
        {
          text: '一个圆柱底面积 20cm²、高 5cm，体积是多少？',
          options: [80, 100, 120, 200], answer: 100,
          hint: '圆柱体积 = 底面积 × 高 = 20 × 5 = 100。'
        }
      ]
    },
    {
      id: '6-2', name: '终局演算', desc: '综合应用大挑战',
      skill: 'cryo',
      intro: [
        { speaker: '星芽', emoji: '🧚', text: '这就是最后的终极演算体！它会混合所有年级的知识，但只要灵活运用方法论骨架，一定能赢！' }
      ],
      questions: [
        {
          text: '一本书看了 3/5，还剩 80 页没看。这本书一共有多少页？',
          options: [120, 150, 180, 200], answer: 200,
          hint: '剩下 2/5 对应 80 页，80 ÷ 2/5 = 200。'
        },
        {
          text: '甲、乙两地相距 360 千米，汽车 4 小时行驶了全程的 2/3。汽车每小时行驶多少千米？',
          options: [60, 80, 90, 120], answer: 60,
          hint: '360 × 2/3 = 240 千米，240 ÷ 4 = 60 千米/时。'
        },
        {
          text: '一个三角形面积 24cm²，底 8cm，高是多少？',
          options: [3, 6, 8, 12], answer: 6,
          hint: '面积 = 底 × 高 ÷ 2，高 = 24 × 2 ÷ 8 = 6。'
        },
        {
          text: '解方程：2(x + 5) = 24',
          options: [7, 8, 9, 12], answer: 7,
          hint: 'x + 5 = 12，x = 7。'
        }
      ]
    },
    {
      id: '6-7', name: '圆柱与圆锥', desc: '体积计算',
      skill: 'cryo',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '圆柱体积=底面积×高，圆锥体积=底面积×高÷3。' }],
      questions: [
        { text: '圆柱底面积20、高5，体积是？', options: ['80', '100', '120', '200'], answer: '100', hint: '20×5=100。' },
        { text: '圆锥底面积30、高6，体积是？', options: ['60', '90', '120', '180'], answer: '60', hint: '30×6÷3=60。' }
      ]
    },
    {
      id: '6-8', name: '负数的应用', desc: '温差与海拔',
      skill: 'hydro',
      intro: [{ speaker: '星芽', emoji: '🧚', text: '负数表示零下温度、低于海平面。' }],
      questions: [
        { text: '-5℃到8℃，温差是？', options: ['3', '8', '13', '15'], answer: '13', hint: '8-(-5)=13。' },
        { text: '从-3℃上升10℃后是？', options: ['-13', '7', '13', '10'], answer: '7', hint: '-3+10=7。' }
      ]
    }
  ]
];

// ========== 开放世界布局：数境大陆（有机大陆，离线算好后写死） ==========
// 区域锚点/道路/传送点/地形 blob/障碍物坐标均以此为准，game.js 的 buildWorld() 据此渲染。
const WORLD_LAYOUT = {
  world: { w: 8000, h: 5000 },
  spawn: { x: 1400, y: 2600 },
  regions: [
    { id: 0, name: '风语原', x: 1400, y: 2600, color: '#74c2a8' },
    { id: 1, name: '岩岚港', x: 4200, y: 1100, color: '#fab632' },
    { id: 2, name: '雷鸣群岛', x: 6900, y: 1500, color: '#af8ec1' },
    { id: 3, name: '森语城', x: 2900, y: 3900, color: '#a5c23b' },
    { id: 4, name: '澄水庭', x: 5100, y: 2900, color: '#4fc3f7' },
    { id: 5, name: '赤焰谷', x: 4300, y: 4300, color: '#ef7a35' },
    { id: 6, name: '雪境宫', x: 6600, y: 4300, color: '#9fd6e3' }
  ],
  waypoints: [
    { id: 0, label: '风起地', x: 1400, y: 2600 },
    { id: 1, label: '北岭山口', x: 3200, y: 1700 },
    { id: 2, label: '河畔渡口', x: 3900, y: 2700 },
    { id: 3, label: '林间小径', x: 2100, y: 3200 },
    { id: 4, label: '湖心长廊', x: 6000, y: 2400 },
    { id: 5, label: '峡谷口', x: 4700, y: 3600 },
    { id: 6, label: '雪原入口', x: 5400, y: 4400 },
    { id: 7, label: '群岛栈道', x: 6500, y: 1900 }
  ],
  roads: [
    [[1400, 2600], [2400, 2200], [3200, 1700], [4200, 1100]],
    [[1400, 2600], [2100, 3200], [2900, 3900]],
    [[1400, 2600], [2800, 2600], [3900, 2700], [5100, 2900]],
    [[5100, 2900], [6000, 2400], [6500, 1900], [6900, 1500]],
    [[5100, 2900], [4700, 3600], [4300, 4300]],
    [[2900, 3900], [3600, 4100], [4300, 4300]],
    [[4300, 4300], [5400, 4400], [6600, 4300]],
    [[4200, 1100], [4700, 2000], [4900, 2400], [5100, 2900]]
  ],
  blobs: [
    { kind: 'ground', x: 1038, y: 2579, rx: 692, ry: 710, rot: 69, color: '#74c2a8' },
    { kind: 'ground', x: 1280, y: 2450, rx: 406, ry: 442, rot: 146, color: '#74c2a8' },
    { kind: 'ground', x: 1406, y: 2569, rx: 523, ry: 778, rot: 23, color: '#74c2a8' },
    { kind: 'ground', x: 1353, y: 2573, rx: 598, ry: 368, rot: 155, color: '#74c2a8' },
    { kind: 'ground', x: 1330, y: 2839, rx: 602, ry: 595, rot: 16, color: '#74c2a8' },
    { kind: 'ground', x: 4447, y: 1012, rx: 793, ry: 705, rot: 79, color: '#fab632' },
    { kind: 'ground', x: 4050, y: 1190, rx: 472, ry: 433, rot: 142, color: '#fab632' },
    { kind: 'ground', x: 4213, y: 1070, rx: 618, ry: 735, rot: 158, color: '#fab632' },
    { kind: 'ground', x: 4323, y: 954, rx: 790, ry: 483, rot: 63, color: '#fab632' },
    { kind: 'ground', x: 4440, y: 998, rx: 446, ry: 603, rot: 90, color: '#fab632' },
    { kind: 'ground', x: 4329, y: 969, rx: 655, ry: 742, rot: 173, color: '#fab632' },
    { kind: 'ground', x: 4352, y: 1312, rx: 784, ry: 657, rot: 168, color: '#fab632' },
    { kind: 'ground', x: 7026, y: 1626, rx: 451, ry: 431, rot: 42, color: '#af8ec1' },
    { kind: 'ground', x: 6677, y: 1698, rx: 735, ry: 450, rot: 172, color: '#af8ec1' },
    { kind: 'ground', x: 6659, y: 1610, rx: 729, ry: 376, rot: 107, color: '#af8ec1' },
    { kind: 'ground', x: 6902, y: 1500, rx: 575, ry: 662, rot: 105, color: '#af8ec1' },
    { kind: 'ground', x: 6787, y: 1282, rx: 654, ry: 442, rot: 136, color: '#af8ec1' },
    { kind: 'ground', x: 6751, y: 1347, rx: 466, ry: 459, rot: 89, color: '#af8ec1' },
    { kind: 'ground', x: 6872, y: 1268, rx: 761, ry: 582, rot: 117, color: '#af8ec1' },
    { kind: 'ground', x: 2849, y: 3935, rx: 391, ry: 668, rot: 134, color: '#a5c23b' },
    { kind: 'ground', x: 2788, y: 3776, rx: 576, ry: 567, rot: 129, color: '#a5c23b' },
    { kind: 'ground', x: 3111, y: 3707, rx: 380, ry: 433, rot: 179, color: '#a5c23b' },
    { kind: 'ground', x: 3024, y: 3876, rx: 528, ry: 780, rot: 15, color: '#a5c23b' },
    { kind: 'ground', x: 3051, y: 3892, rx: 720, ry: 746, rot: 22, color: '#a5c23b' },
    { kind: 'ground', x: 2699, y: 3856, rx: 463, ry: 789, rot: 17, color: '#a5c23b' },
    { kind: 'ground', x: 5011, y: 2868, rx: 478, ry: 525, rot: 112, color: '#4fc3f7' },
    { kind: 'ground', x: 4981, y: 3130, rx: 504, ry: 550, rot: 68, color: '#4fc3f7' },
    { kind: 'ground', x: 5119, y: 3001, rx: 397, ry: 594, rot: 20, color: '#4fc3f7' },
    { kind: 'ground', x: 5149, y: 2842, rx: 758, ry: 658, rot: 46, color: '#4fc3f7' },
    { kind: 'ground', x: 5112, y: 2963, rx: 780, ry: 608, rot: 161, color: '#4fc3f7' },
    { kind: 'ground', x: 5255, y: 2925, rx: 386, ry: 382, rot: 69, color: '#4fc3f7' },
    { kind: 'ground', x: 4154, y: 4195, rx: 402, ry: 507, rot: 151, color: '#ef7a35' },
    { kind: 'ground', x: 4229, y: 4328, rx: 352, ry: 421, rot: 169, color: '#ef7a35' },
    { kind: 'ground', x: 3961, y: 4282, rx: 500, ry: 613, rot: 13, color: '#ef7a35' },
    { kind: 'ground', x: 4162, y: 4363, rx: 378, ry: 391, rot: 61, color: '#ef7a35' },
    { kind: 'ground', x: 4611, y: 4365, rx: 362, ry: 450, rot: 30, color: '#ef7a35' },
    { kind: 'ground', x: 6719, y: 4490, rx: 519, ry: 642, rot: 110, color: '#9fd6e3' },
    { kind: 'ground', x: 6680, y: 4281, rx: 565, ry: 694, rot: 179, color: '#9fd6e3' },
    { kind: 'ground', x: 6505, y: 4480, rx: 630, ry: 574, rot: 173, color: '#9fd6e3' },
    { kind: 'ground', x: 6376, y: 4276, rx: 394, ry: 393, rot: 124, color: '#9fd6e3' },
    { kind: 'ground', x: 6584, y: 4215, rx: 447, ry: 618, rot: 46, color: '#9fd6e3' },
    { kind: 'sea', x: 7470, y: 1916, rx: 646, ry: 455, rot: 104, color: '#1d4e6b' },
    { kind: 'sea', x: 7658, y: 1262, rx: 681, ry: 464, rot: 178, color: '#1d4e6b' },
    { kind: 'sea', x: 6862, y: 3302, rx: 504, ry: 639, rot: 72, color: '#1d4e6b' },
    { kind: 'sea', x: 7669, y: 1442, rx: 780, ry: 623, rot: 26, color: '#1d4e6b' },
    { kind: 'sea', x: 7799, y: 2882, rx: 754, ry: 610, rot: 68, color: '#1d4e6b' },
    { kind: 'sea', x: 7848, y: 2104, rx: 654, ry: 521, rot: 45, color: '#1d4e6b' },
    { kind: 'sea', x: 7060, y: 3263, rx: 577, ry: 654, rot: 160, color: '#1d4e6b' },
    { kind: 'sea', x: 7632, y: 1833, rx: 525, ry: 677, rot: 92, color: '#1d4e6b' },
    { kind: 'sea', x: 7738, y: 1604, rx: 488, ry: 442, rot: 155, color: '#1d4e6b' },
    { kind: 'sea', x: 7575, y: 2934, rx: 707, ry: 621, rot: 112, color: '#1d4e6b' },
    { kind: 'island', x: 6300, y: 2120, rx: 254, ry: 149, rot: 0, color: '#7fc7d9' },
    { kind: 'island', x: 6480, y: 1920, rx: 216, ry: 172, rot: 1, color: '#7fc7d9' },
    { kind: 'island', x: 6700, y: 1730, rx: 211, ry: 173, rot: 153, color: '#7fc7d9' },
    { kind: 'island', x: 6900, y: 1500, rx: 255, ry: 178, rot: 137, color: '#7fc7d9' },
    { kind: 'island', x: 7120, y: 1320, rx: 235, ry: 148, rot: 87, color: '#7fc7d9' },
    { kind: 'lake', x: 5000, y: 2900, rx: 750, ry: 500, rot: 0, color: '#2f7ea6' },
    { kind: 'lake', x: 4720, y: 2740, rx: 500, ry: 380, rot: 25, color: '#2f7ea6' },
    { kind: 'lake', x: 5320, y: 3060, rx: 480, ry: 360, rot: -20, color: '#2f7ea6' },
    { kind: 'land', x: 5100, y: 2900, rx: 340, ry: 250, rot: 10, color: '#c9b78f' },
    { kind: 'mountain', x: 2353, y: 614, rx: 415, ry: 277, rot: 10, color: '#6b5d4f' },
    { kind: 'mountain', x: 2722, y: 417, rx: 400, ry: 258, rot: 17, color: '#7a6f66' },
    { kind: 'mountain', x: 3048, y: 419, rx: 454, ry: 243, rot: 14, color: '#6b5d4f' },
    { kind: 'mountain', x: 3338, y: 462, rx: 459, ry: 279, rot: -9, color: '#6b5d4f' },
    { kind: 'mountain', x: 3597, y: 308, rx: 413, ry: 310, rot: 13, color: '#6b5d4f' },
    { kind: 'mountain', x: 3899, y: 520, rx: 425, ry: 273, rot: -4, color: '#6b5d4f' },
    { kind: 'mountain', x: 4140, y: 410, rx: 372, ry: 308, rot: -13, color: '#6b5d4f' },
    { kind: 'mountain', x: 4512, y: 464, rx: 402, ry: 245, rot: 6, color: '#6b5d4f' },
    { kind: 'mountain', x: 4832, y: 521, rx: 354, ry: 337, rot: 20, color: '#7a6f66' },
    { kind: 'mountain', x: 5124, y: 309, rx: 349, ry: 304, rot: 15, color: '#6b5d4f' },
    { kind: 'mountain', x: 5388, y: 403, rx: 475, ry: 312, rot: 2, color: '#6b5d4f' },
    { kind: 'mountain', x: 5641, y: 424, rx: 466, ry: 342, rot: 11, color: '#7a6f66' },
    { kind: 'mountain', x: 5962, y: 604, rx: 386, ry: 266, rot: -15, color: '#6b5d4f' },
    { kind: 'mountain', x: 6322, y: 490, rx: 410, ry: 302, rot: 13, color: '#7a6f66' },
    { kind: 'mountain', x: 6616, y: 363, rx: 377, ry: 308, rot: -18, color: '#7a6f66' },
    { kind: 'snow', x: 6186, y: 3627, rx: 330, ry: 235, rot: 2, color: '#cdd9e0' },
    { kind: 'snow', x: 6366, y: 3506, rx: 335, ry: 253, rot: 172, color: '#dfe9ee' },
    { kind: 'snow', x: 6558, y: 3697, rx: 312, ry: 253, rot: 99, color: '#cdd9e0' },
    { kind: 'snow', x: 6264, y: 3785, rx: 331, ry: 222, rot: 89, color: '#dfe9ee' },
    { kind: 'snow', x: 6511, y: 3823, rx: 364, ry: 274, rot: 164, color: '#cdd9e0' },
    { kind: 'canyon', x: 3868, y: 4065, rx: 384, ry: 219, rot: -25, color: '#8a3b2a' },
    { kind: 'canyon', x: 4299, y: 4018, rx: 434, ry: 255, rot: -1, color: '#8a3b2a' },
    { kind: 'canyon', x: 4668, y: 4168, rx: 388, ry: 277, rot: -34, color: '#8a3b2a' },
    { kind: 'canyon', x: 4023, y: 4471, rx: 415, ry: 256, rot: -9, color: '#8a3b2a' },
    { kind: 'canyon', x: 4599, y: 4504, rx: 447, ry: 245, rot: 12, color: '#a0522d' },
    { kind: 'canyon', x: 4283, y: 4610, rx: 552, ry: 252, rot: 5, color: '#a0522d' }
  ],
  obstacles: [
    { x: 2412, y: 511, r: 236 },
    { x: 2702, y: 332, r: 188 },
    { x: 2983, y: 518, r: 210 },
    { x: 3205, y: 540, r: 257 },
    { x: 3499, y: 549, r: 218 },
    { x: 3828, y: 516, r: 175 },
    { x: 4051, y: 535, r: 232 },
    { x: 4331, y: 518, r: 180 },
    { x: 4624, y: 469, r: 257 },
    { x: 4901, y: 371, r: 221 },
    { x: 5176, y: 577, r: 211 },
    { x: 5470, y: 354, r: 178 },
    { x: 5722, y: 516, r: 189 },
    { x: 6015, y: 332, r: 197 },
    { x: 6348, y: 331, r: 246 },
    { x: 6591, y: 357, r: 206 },
    { x: 6166, y: 3508, r: 259 },
    { x: 6312, y: 3722, r: 200 },
    { x: 6437, y: 3858, r: 253 },
    { x: 6475, y: 3514, r: 260 },
    { x: 6057, y: 3789, r: 226 }
  ],
  sceneryObstacles: [
    // 世界变化：风车、风桥、风暴核心
    { x: 1640, y: 2420, r: 80, label: 'windmill' },
    { x: 1350, y: 2350, r: 50, label: 'windcore' },
    { x: 1850, y: 2650, r: 50, label: 'windtower' },
    { x: 1720, y: 2700, r: 60, label: 'wind-bridge' },
    { x: 1170, y: 2710, r: 70, label: 'storm-core' },
    // 村庄：玩家不可直接穿过房子
    { x: 1200, y: 2400, r: 45 },
    { x: 2600, y: 3000, r: 45 },
    { x: 3400, y: 2900, r: 45 },
    { x: 2700, y: 2900, r: 45 },
    { x: 5400, y: 1600, r: 45 },
    { x: 6100, y: 2700, r: 45 },
    { x: 5300, y: 3700, r: 45 },
    { x: 5600, y: 4100, r: 45 },
    { x: 4400, y: 3700, r: 45 },
    { x: 3600, y: 1300, r: 45 },
    { x: 4900, y: 4400, r: 45 },
    { x: 4900, y: 3600, r: 45 }
  ]
};


// 导出数据给 game.js 使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ELEMENTS, REGIONS, LEVELS, WORLD_LAYOUT };
}


// ========== 动态题目生成器 ==========
// 每次进入关卡时生成随机题目，保证可重复游玩性

let questionRandom = Math.random;

// 测试可以注入可复现的伪随机源；浏览器默认仍使用 Math.random。
function setQuestionRandom(randomFn = Math.random) {
  questionRandom = typeof randomFn === 'function' ? randomFn : Math.random;
}

function randInt(min, max) {
  return Math.floor(questionRandom() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(questionRandom() * arr.length)];
}
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(questionRandom() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function genOptions(correct, spread = 3, min = 0) {
  const opts = new Set([correct]);
  let attempts = 0;
  while (opts.size < 4 && attempts < 50) {
    attempts++;
    const delta = randInt(1, spread);
    const candidate = correct + (questionRandom() > 0.5 ? delta : -delta);
    if (candidate >= min) opts.add(candidate);
  }
  // 如果仍然不够，直接按顺序填充
  let filler = min;
  while (opts.size < 4) {
    if (!opts.has(filler)) opts.add(filler);
    filler++;
  }
  return shuffle([...opts]);
}

function uniqueOptions(correct, candidates = []) {
  const options = [];
  const seen = new Set();
  [correct, ...candidates].forEach(value => {
    const key = String(value);
    if (!seen.has(key)) {
      seen.add(key);
      options.push(value);
    }
  });
  if (options.length < 4) {
    throw new Error(`题目选项不足：${correct}`);
  }
  return shuffle(options.slice(0, 4));
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

function fraction(numerator, denominator) {
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
}

function formatMoney(totalJiao) {
  const yuan = Math.floor(totalJiao / 10);
  const jiao = totalJiao % 10;
  if (!yuan) return `${jiao} 角`;
  return jiao ? `${yuan} 元 ${jiao} 角` : `${yuan} 元`;
}

function formatClock(totalMinutes) {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${hour}:${String(minute).padStart(2, '0')}`;
}

function fractionOptions(numerator, denominator) {
  const correct = fraction(numerator, denominator);
  return uniqueOptions(correct, [
    fraction(denominator - numerator, denominator),
    fraction(1, denominator),
    fraction(Math.min(denominator, numerator + 1), denominator),
    '0',
    '1'
  ]);
}

const QUESTION_GENERATORS = {
  // 0-0 数物对应
  '0-0': () => {
    const n = randInt(5, 9);
    const items = pick([
      { emoji: '🍎', name: '苹果' },
      { emoji: '🍐', name: '梨' },
      { emoji: '🍊', name: '橘子' },
      { emoji: '🐦', name: '小鸟' }
    ]);
    return [
      {
        text: `有 ${n} 个盘子，每个盘子放 1 个${items.name}，一共需要几个${items.name}？`,
        visual: { type: 'emoji', items: Array(n).fill('🍽️') },
        options: genOptions(n, 2, 1), answer: n,
        hint: `一个盘子配一个${items.name}，数盘子个数。`
      },
      {
        text: `左边有 ${n} 只${items.name}，右边有 ${n} 个位置。如果每只${items.name}站一个位置，会剩下几个位置？`,
        options: genOptions(0, 2, 0), answer: 0,
        hint: '一一对应后没有剩余。'
      },
      {
        text: `老师发给小朋友每人 1 支铅笔。如果有 ${n + 2} 个小朋友，需要准备几支铅笔？`,
        options: genOptions(n + 2, 2, 1), answer: n + 2,
        hint: `${n + 2} 个小朋友，每人 1 支。`
      }
    ];
  },
  // 0-1 加减法
  '0-1': () => {
    const a = randInt(3, 8);
    const b = randInt(2, 7);
    const total = a + b;
    return [
      {
        text: `草地上有 ${a} 只小松鼠，又跑来 ${b} 只。现在一共有几只小松鼠？`,
        visual: { type: 'emoji', items: [...Array(a).fill('🐿️'), '➕', ...Array(b).fill('🐿️')] },
        options: genOptions(total, 3, 1), answer: total,
        hint: `合起来用加法：${a} + ${b} = ${total}。`
      },
      {
        text: `树上有 ${total} 个苹果，摘掉了 ${a} 个，还剩几个？`,
        options: genOptions(b, 3, 0), answer: b,
        hint: `去掉用减法：${total} - ${a} = ${b}。`
      },
      {
        text: `小明有 ${total + 5} 元，买书花了 ${a} 元，还剩多少元？`,
        options: genOptions(total + 5 - a, 3, 0), answer: total + 5 - a,
        hint: '剩下的 = 原来的 - 花掉的。'
      }
    ];
  },
  // 0-2 乘法
  '0-2': () => {
    const rows = randInt(3, 6);
    const cols = randInt(3, 6);
    const total = rows * cols;
    return [
      {
        text: `每排有 ${cols} 棵树，一共有 ${rows} 排。用加法表示是 ${Array(rows).fill(cols).join('+')}，乘法算式是什么？`,
        visual: { type: 'grid', rows, cols, emoji: '🌳' },
        options: uniqueOptions(`${rows} × ${cols}`, [
          `${rows} + ${cols}`,
          `${rows + 1} × ${cols}`,
          `${rows} × ${cols + 1}`,
          `${Math.max(1, rows - 1)} × ${cols}`
        ]),
        answer: `${rows} × ${cols}`,
        hint: `${rows} 排，每排 ${cols} 棵，就是 ${rows} × ${cols}。`
      },
      {
        text: `一盒铅笔有 ${cols} 支，买 ${rows} 盒一共有多少支？`,
        options: genOptions(total, 6, 1), answer: total,
        hint: `${rows} 个 ${cols} 相加，用乘法：${rows} × ${cols} = ${total}。`
      },
      {
        text: `同学排成 ${rows} 行 ${cols} 列的方阵，一共有多少人？`,
        options: genOptions(total, 6, 1), answer: total,
        hint: `${rows} 行 ${cols} 列 = ${rows} × ${cols} = ${total}。`
      }
    ];
  },
  // 0-3 除法
  '0-3': () => {
    const divisor = randInt(3, 6);
    const quotient = randInt(3, 6);
    const total = divisor * quotient;
    return [
      {
        text: `把 ${total} 颗糖平均分给 ${divisor} 个小朋友，每人几颗？`,
        options: genOptions(quotient, 3, 1), answer: quotient,
        hint: `${total} ÷ ${divisor} = ${quotient}。`
      },
      {
        text: `每袋装 ${divisor} 个面包，${total} 个面包可以装几袋？`,
        options: genOptions(quotient, 3, 1), answer: quotient,
        hint: `${total} 里面有几个 ${divisor}？${total} ÷ ${divisor} = ${quotient}。`
      },
      {
        text: `有 ${total} 根小棒，每 ${quotient} 根拼一个图形，可以拼几个？`,
        options: genOptions(divisor, 3, 1), answer: divisor,
        hint: `${total} ÷ ${quotient} = ${divisor}。`
      }
    ];
  },
  // 1-0 认识图形
  '1-0': () => {
    const shapes = [
      { q: '下面哪个物体最接近“圆柱”？', opts: ['🎲 骰子', '🥫 罐头', '🎾 网球', '📦 纸箱'], a: '🥫 罐头', h: '圆柱上下两个底面是圆。' },
      { q: '长方体有几个面？', opts: [4, 5, 6, 8], a: 6, h: '长方体有 6 个面。' },
      { q: '下面哪个图形有“四条边相等、四个直角”？', opts: ['长方形', '正方形', '三角形', '圆形'], a: '正方形', h: '正方形四条边一样长。' },
      { q: '球有什么特点？', opts: ['有棱角', '可以滚动', '有 6 个面', '有直角'], a: '可以滚动', h: '球是曲面立体，可以滚动。' }
    ];
    return shuffle(shapes).slice(0, 3).map(s => ({
      text: s.q,
      options: s.opts,
      answer: s.a,
      hint: s.h
    }));
  },
  // 1-1 周长
  '1-1': () => {
    const l = randInt(5, 9);
    const w = randInt(3, 7);
    const p = (l + w) * 2;
    const thirdSide = randInt(Math.abs(l - w) + 1, l + w - 1);
    const trianglePerimeter = l + w + thirdSide;
    // 动手题：沿正方形城墙边点城砖，体会"周长=边界累加"
    const side = randInt(3, 4);
    return [
      {
        text: `一个长方形长 ${l} 米、宽 ${w} 米，周长是多少米？`,
        options: genOptions(p, 6, 1), answer: p,
        hint: `（长+宽）× 2 = (${l}+${w}) × 2 = ${p}。`
      },
      {
        text: `岩港的正方形城墙每边 ${side} 块城砖。沿着墙边点亮所有城砖，帮工匠数出周长！`,
        options: genOptions(side * 4, 6, 1), answer: side * 4,
        hint: `每条边 ${side} 块，4 条边：${side} × 4 = ${side * 4}。`,
        interaction: {
          type: 'tapCount', mode: 'fill',
          item: '🧱', itemName: '城砖',
          rows: 4, cols: side, target: side * 4
        }
      },
      {
        text: `一个三角形三条边分别是 ${l}cm、${w}cm、${thirdSide}cm，周长是多少？`,
        options: genOptions(trianglePerimeter, 6, 1), answer: trianglePerimeter,
        hint: `把三条边加起来。`
      }
    ];
  },
  // 1-2 面积
  '1-2': () => {
    const l = randInt(3, 5);
    const w = randInt(2, 4);
    const a = l * w;
    const lq = randInt(4, 8), wq = randInt(3, 6);
    return [
      {
        text: `岩甲巨像召唤了 ${w} 行 ${l} 列的石板护住胸口！点亮所有石板，数清楚它用了多少块。`,
        options: genOptions(a, 6, 1), answer: a,
        hint: `每行 ${l} 块，${w} 行：${l} × ${w} = ${a}。可以逐块点，也可以点行标一次点整行。`,
        interaction: {
          type: 'tapCount', mode: 'fill',
          item: '🟫', itemName: '石板',
          rows: w, cols: l, target: a
        }
      },
      {
        text: `正方形边长 ${lq}cm，面积是多少？`,
        options: genOptions(lq * lq, 8, 1), answer: lq * lq,
        hint: `正方形面积 = 边长 × 边长 = ${lq} × ${lq} = ${lq * lq}。`
      },
      {
        text: `长方形菜地长 ${lq} 米、宽 ${wq} 米，面积是多少平方米？`,
        options: genOptions(lq * wq, 8, 1), answer: lq * wq,
        hint: `${lq} × ${wq} = ${lq * wq}。`
      }
    ];
  },
  // 1-3 割补转化
  '1-3': () => {
    const a1 = randInt(3, 6), a2 = randInt(2, 5);
    const b1 = randInt(2, 4), b2 = randInt(2, 4);
    const total = a1 * b1 + a2 * b2;
    // 动手题：岩核平均装进矿车，体会"平均分"
    const carts = randInt(2, 3);
    const perCart = randInt(3, 5);
    return [
      {
        text: `一个 L 形图形割成两个长方形：${a1}×${b1} 和 ${a2}×${b2}，面积是多少？`,
        options: genOptions(total, 8, 1), answer: total,
        hint: `${a1}×${b1} + ${a2}×${b2} = ${a1 * b1} + ${a2 * b2} = ${total}。`
      },
      {
        text: `巨像掉落 ${carts * perCart} 块岩核！把它们平均装进 ${carts} 辆矿车运走，每辆装几块？`,
        options: genOptions(perCart, 4, 1), answer: perCart,
        hint: `${carts * perCart} ÷ ${carts} = ${perCart}。每辆矿车装一样多才公平。`,
        interaction: {
          type: 'dragSplit',
          item: '🪨', itemName: '岩核',
          zoneName: '矿车', zoneEmoji: '🛒',
          total: carts * perCart, zones: carts
        }
      },
      {
        text: `一个不规则图形经过割补，正好拼成一个边长 ${a1}cm 的正方形。原图形面积是多少？`,
        options: genOptions(a1 * a1, 8, 1), answer: a1 * a1,
        hint: `割补不改变面积，等于正方形面积 ${a1}×${a1}=${a1 * a1}。`
      }
    ];
  },
  // 2-0 长度单位
  '2-0': () => {
    const m = randInt(2, 5);
    const cm = randInt(10, 90);
    const total = m * 100 + cm;
    const other = randInt(100, 300);
    return [
      {
        text: `${m} 米等于多少厘米？`,
        options: genOptions(m * 100, 50, 1), answer: m * 100,
        hint: `1 米 = 100 厘米，${m} 米 = ${m * 100} 厘米。`
      },
      {
        text: `${m} 米 ${cm} 厘米等于多少厘米？`,
        options: genOptions(total, 50, 1), answer: total,
        hint: `${m} 米 = ${m * 100} 厘米，再加 ${cm} 厘米 = ${total} 厘米。`
      },
      {
        text: `一根绳子长 ${m} 米 ${cm} 厘米，另一根长 ${other} 厘米。两根接在一起是多少厘米？`,
        options: genOptions(total + other, 80, 1), answer: total + other,
        hint: '先统一单位再相加。'
      }
    ];
  },
  // 2-1 人民币
  '2-1': () => {
    const yuan = randInt(2, 6);
    const jiao = randInt(1, 9);
    const totalJiao = yuan * 10 + jiao;
    const halfYuanCount = randInt(2, 5);
    const ownedJiao = yuan * 10 + halfYuanCount * 5;
    const changeJiao = 10 - jiao;
    const twoBooksJiao = totalJiao * 2;
    return [
      {
        text: `一支笔 ${jiao} 角，付 1 元应找回多少？`,
        options: uniqueOptions(formatMoney(changeJiao), [
          formatMoney(jiao),
          formatMoney(Math.max(1, changeJiao - 1)),
          formatMoney(Math.min(10, changeJiao + 1)),
          '1 元'
        ]), answer: formatMoney(changeJiao),
        hint: `1 元 = 10 角，10 - ${jiao} = ${10 - jiao} 角。`
      },
      {
        text: `一本练习册 ${yuan} 元 ${jiao} 角，买 2 本需要多少钱？`,
        options: uniqueOptions(formatMoney(twoBooksJiao), [
          formatMoney(yuan * 20),
          formatMoney(twoBooksJiao + 10),
          formatMoney(totalJiao + jiao),
          formatMoney(twoBooksJiao - jiao)
        ]),
        answer: formatMoney(twoBooksJiao),
        hint: `先化成角：${totalJiao} × 2 = ${twoBooksJiao} 角，也就是 ${formatMoney(twoBooksJiao)}。`
      },
      {
        text: `小明有 ${yuan} 张 1 元、${halfYuanCount} 张 5 角，一共有多少钱？`,
        options: uniqueOptions(formatMoney(ownedJiao), [
          formatMoney(yuan * 10 + halfYuanCount),
          formatMoney(ownedJiao + 5),
          formatMoney(Math.max(1, ownedJiao - 5)),
          formatMoney(yuan * 10)
        ]), answer: formatMoney(ownedJiao),
        hint: `${yuan} 元是 ${yuan * 10} 角，${halfYuanCount} 个 5 角是 ${halfYuanCount * 5} 角，合计 ${formatMoney(ownedJiao)}。`
      }
    ];
  },
  // 2-2 质量单位
  '2-2': () => {
    const kg = randInt(2, 8);
    const rice = randInt(10, 50);
    const bags = randInt(2, 5);
    return [
      {
        text: `${kg} 千克等于多少克？`,
        options: genOptions(kg * 1000, 500, 1), answer: kg * 1000,
        hint: `1 千克 = 1000 克，${kg} 千克 = ${kg * 1000} 克。`
      },
      {
        text: `${kg * 1000} 千克等于多少吨？`,
        options: genOptions(kg, 3, 1), answer: kg,
        hint: `1000 千克 = 1 吨，${kg * 1000} 千克 = ${kg} 吨。`
      },
      {
        text: `一袋大米 ${rice} 千克，${bags} 袋大米重多少千克？`,
        options: genOptions(rice * bags, 50, 1), answer: rice * bags,
        hint: `${rice} × ${bags} = ${rice * bags}。`
      }
    ];
  },
  // 2-3 时间
  '2-3': () => {
    const h = randInt(1, 3);
    const m = randInt(10, 50);
    const startMinutes = h * 60 + m;
    const classMinutes = 30;
    const homeworkMinutes = 60 + randInt(10, 50);
    const homeworkEnd = formatClock(startMinutes + homeworkMinutes);
    return [
      {
        text: `${h} 时 ${m} 分等于多少分？`,
        options: genOptions(h * 60 + m, 30, 1), answer: h * 60 + m,
        hint: `${h} 时 = ${h * 60} 分，${h * 60} + ${m} = ${h * 60 + m}。`
      },
      {
        text: `一节课从 ${formatClock(startMinutes)} 上到 ${formatClock(startMinutes + classMinutes)}，上了多少分钟？`,
        options: genOptions(classMinutes, 10, 1), answer: classMinutes,
        hint: '结束时刻 - 开始时刻 = 经过时间。'
      },
      {
        text: `小明从 ${formatClock(startMinutes)} 开始做作业，做了 1 小时 ${homeworkMinutes - 60} 分，结束时是几时几分？`,
        options: uniqueOptions(homeworkEnd, [
          formatClock(startMinutes + 60),
          formatClock(startMinutes + homeworkMinutes - 10),
          formatClock(startMinutes + homeworkMinutes + 10),
          formatClock(startMinutes + 2 * 60)
        ]),
        answer: homeworkEnd,
        hint: '开始时刻 + 经过时间 = 结束时刻。'
      }
    ];
  },
  // 3-0 数据调查
  '3-0': () => {
    let counts;
    do {
      counts = [randInt(5, 10), randInt(3, 8), randInt(4, 9)];
    } while (counts.filter(value => value === Math.max(...counts)).length !== 1);
    const [a, b, c] = counts;
    const max = Math.max(...counts);
    const items = ['苹果', '香蕉', '西瓜'];
    const maxIdx = counts.indexOf(max);
    const unit = randInt(2, 5);
    const barHeight = randInt(3, 6);
    const represented = unit * barHeight;
    return [
      {
        text: `调查班上同学最喜欢的水果：苹果 ${a} 人、香蕉 ${b} 人、西瓜 ${c} 人。喜欢哪种水果的人最多？`,
        options: shuffle([...items, '一样多']), answer: items[maxIdx],
        hint: `比较三个数的大小。`
      },
      {
        text: `一个“正”字代表 5 票。某游戏有两个完整的“正”字，另有 2 画，一共多少票？`,
        options: genOptions(12, 3, 1), answer: 12,
        hint: '两个“正”字 10 票，再加 2 画。'
      },
      {
        text: `条形图中，纵轴每格代表 ${unit} 人。某项目条形高 ${barHeight} 格，表示多少人？`,
        options: genOptions(represented, 5, 1), answer: represented,
        hint: `每格人数 × 格数：${unit} × ${barHeight} = ${represented}。`
      }
    ];
  },
  // 3-1 平均数
  '3-1': () => {
    const avg = randInt(18, 22);
    const offset = randInt(1, 3);
    const a = avg + offset, b = avg - offset, c = avg;
    const h1 = randInt(125, 140), h2 = randInt(125, 140), h3 = randInt(125, 140), h4 = randInt(125, 140);
    const avgH = Math.round((h1 + h2 + h3 + h4) / 4);
    const scoreAvg = randInt(85, 95);
    return [
      {
        text: `小明三天分别读了 ${a} 页、${b} 页、${c} 页书，平均每天读多少页？`,
        options: genOptions(avg, 3, 1), answer: avg,
        hint: `总数 ${a + b + c} 页，÷ 3 = ${avg}。`
      },
      {
        text: `四个小朋友身高分别是 ${h1}cm、${h2}cm、${h3}cm、${h4}cm，平均身高约是多少？`,
        options: genOptions(avgH, 3, 1), answer: avgH,
        hint: `总数 ÷ 4 = ${avgH}。`
      },
      {
        text: `五次测验平均分 ${scoreAvg} 分，总分是多少？`,
        options: genOptions(scoreAvg * 5, 10, 1), answer: scoreAvg * 5,
        hint: `平均分 × 次数 = ${scoreAvg} × 5 = ${scoreAvg * 5}。`
      }
    ];
  },
  // 3-2 可能性
  '3-2': () => {
    const red = randInt(2, 5), white = randInt(1, 4);
    const total = red + white;
    const redProbability = fraction(red, total);
    return [
      {
        text: `袋子里有 ${red} 个红球、${white} 个白球，任意摸一个，摸到红球的可能性是多少？`,
        options: fractionOptions(red, total), answer: redProbability,
        hint: `红球 ${red} 个，总数 ${total} 个。`
      },
      {
        text: `一枚硬币正面朝上的可能性是多少？`,
        options: shuffle(['1/3', '1/2', '1/4', '1']), answer: '1/2',
        hint: '硬币有正反两面。'
      },
      {
        text: `转盘平均分成 ${total} 份，其中 ${red} 份是奖品区。指针停在奖品区的可能性是多少？`,
        options: fractionOptions(red, total), answer: redProbability,
        hint: `奖品区 ${red} 份，总 ${total} 份。`
      }
    ];
  },
  // 4-0 运算律
  '4-0': () => {
    const laws = [
      { q: '25 × 17 × 4 = 25 × 4 × 17 运用了什么运算律？', opts: ['加法交换律', '乘法交换律', '乘法结合律', '乘法分配律'], a: '乘法交换律', h: '交换了 17 和 4 的位置。' },
      { q: '99 × 56 + 56 = (99 + 1) × 56 运用了什么运算律？', opts: ['乘法交换律', '乘法结合律', '乘法分配律', '加法结合律'], a: '乘法分配律', h: '把相同的 56 提取出来。' },
      { q: '(a + b) + c = a + (b + c) 运用了什么运算律？', opts: ['加法交换律', '加法结合律', '乘法结合律', '乘法分配律'], a: '加法结合律', h: '改变了加法的结合顺序。' }
    ];
    return shuffle(laws).slice(0, 3).map(s => ({
      text: s.q,
      options: s.opts,
      answer: s.a,
      hint: s.h
    }));
  },
  // 4-1 方程
  '4-1': () => {
    const x = randInt(3, 9);
    const a = randInt(2, 8);
    const b = x * a;
    const subtrahend = randInt(1, 10);
    const equationResult = a * x - subtrahend;
    return [
      {
        text: `方程 x + ${a} = ${x + a} 的解是多少？`,
        options: genOptions(x, 3, 1), answer: x,
        hint: `x = ${x + a} - ${a} = ${x}。`
      },
      {
        text: `${a}x = ${b}，x 等于多少？`,
        options: genOptions(x, 3, 1), answer: x,
        hint: `x = ${b} ÷ ${a} = ${x}。`
      },
      {
        text: `一个数的 ${a} 倍减去 ${subtrahend} 等于 ${equationResult}，这个数是多少？（列方程解）`,
        options: genOptions(x, 3, 1), answer: x,
        hint: `设这个数为 x，列方程 ${a}x - ${subtrahend} = ${equationResult}。`
      }
    ];
  },
  // 4-2 负数
  '4-2': () => {
    const n = randInt(20, 80);
    const west = randInt(10, 50);
    const negativePoint = randInt(1, 9);
    const low = randInt(1, 10);
    const high = randInt(1, 10);
    const temperatureDifference = low + high;
    return [
      {
        text: `如果向东走 ${n} 米记作 +${n} 米，那么向西走 ${west} 米记作多少？`,
        options: uniqueOptions(`-${west} 米`, [
          `+${west} 米`, `${west} 米`, `-${n} 米`, `+${n} 米`,
          `-${west + 1} 米`
        ]), answer: `-${west} 米`,
        hint: '东和西相反。'
      },
      {
        text: `在数轴上，-${negativePoint} 在 0 的哪一边？`,
        options: shuffle(['左边', '右边', '上面', '下面']), answer: '左边',
        hint: '负数在 0 的左边。'
      },
      {
        text: `某天最低气温 -${low}℃，最高气温 ${high}℃，这一天温差是多少？`,
        options: genOptions(temperatureDifference, 5, 1), answer: temperatureDifference,
        hint: `${high} - (-${low}) = ${temperatureDifference}℃。`
      }
    ];
  },
  // 4-3 分数
  '4-3': () => {
    const d1 = pick([4, 6, 8]);
    const n1 = randInt(1, d1 - 1);
    const d2 = pick([2, 3]);
    const fractionUnit = `1/${d1}`;
    const sum = fraction(d2 + d1, d1 * d2);
    return [
      {
        text: `${n1}/${d1} 的分数单位是多少？`,
        options: uniqueOptions(fractionUnit, [
          fraction(n1, d1),
          fraction(1, n1),
          fraction(d1, n1),
          `1/${d1 + 1}`,
          `1/${d1 - 1}`
        ]), answer: fractionUnit,
        hint: `分母是 ${d1}，分数单位就是 1/${d1}。`
      },
      {
        text: `1/${d1} + 1/${d2} 等于多少？（先通分）`,
        options: uniqueOptions(sum, [
          fraction(2, d1 + d2),
          fraction(1, d1 * d2),
          fraction(Math.abs(d1 - d2), d1 * d2),
          fraction(d1 + d2 + 1, d1 * d2),
          fraction(d1 + d2 - 1, d1 * d2)
        ]), answer: sum,
        hint: `通分后相加。`
      },
      {
        text: `${n1 + 1}/${d1} - ${n1}/${d1} 等于多少？`,
        options: uniqueOptions(fractionUnit, [
          fraction(2, d1),
          fraction(n1, d1),
          fraction(1, n1),
          `1/${d1 + 1}`,
          '0'
        ]), answer: fractionUnit,
        hint: '同分母分数相减，分母不变，分子相减。'
      }
    ];
  },
  // 5-0 比
  '5-0': () => {
    const a = randInt(2, 6), b = randInt(2, 6);
    const ratioDivisor = gcd(a, b);
    const sa = a / ratioDivisor, sb = b / ratioDivisor;
    const ratioAnswer = `${sa}:${sb}`;
    const ratioDistractors = [
      `${sb}:${sa}`,
      `${sa + 1}:${sb}`,
      `${sa}:${sb + 1}`,
      '1:1',
      '2:3',
      '3:2'
    ];
    const ratioValue = randInt(2, 4);
    const backTerm = randInt(2, 6);
    const frontTerm = ratioValue * backTerm;
    return [
      {
        text: `把 ${a * 2}:${b * 2} 化成最简整数比。`,
        options: uniqueOptions(ratioAnswer, ratioDistractors), answer: ratioAnswer,
        hint: `前项后项同时除以 ${ratioDivisor * 2}。`
      },
      {
        text: `男生 ${a * 5} 人，女生 ${b * 5} 人，男生与女生的人数比是多少？`,
        options: uniqueOptions(ratioAnswer, ratioDistractors), answer: ratioAnswer,
        hint: `${a * 5}:${b * 5} 化简后是 ${ratioAnswer}。`
      },
      {
        text: `一个比的前项是 ${frontTerm}，比值是 ${ratioValue}，后项是多少？`,
        options: genOptions(backTerm, 3, 1), answer: backTerm,
        hint: `后项 = 前项 ÷ 比值 = ${frontTerm} ÷ ${ratioValue} = ${backTerm}。`
      }
    ];
  },
  // 5-1 百分数
  '5-1': () => {
    const base = randInt(2, 5) * 20;
    const pct = pick([10, 20, 25, 50]);
    const val = base * pct / 100;
    return [
      {
        text: `${base} 的 ${pct}% 是多少？`,
        options: genOptions(val, 10, 1), answer: val,
        hint: `${base} × ${pct}% = ${base} × ${pct / 100} = ${val}。`
      },
      {
        text: `某班有 ${base} 人，男生占 ${pct}%，男生有多少人？`,
        options: genOptions(val, 10, 1), answer: val,
        hint: `${base} × ${pct}% = ${val}。`
      },
      {
        text: `一件商品原价 ${base * 10} 元，涨价 ${pct}% 后的售价是多少？`,
        options: genOptions(base * 10 + base * 10 * pct / 100, 50, 1), answer: base * 10 + base * 10 * pct / 100,
        hint: `原价 × (1 + ${pct}%)。`
      }
    ];
  },
  // 5-2 正反比例
  '5-2': () => {
    const rel = [
      { q: '速度一定时，路程和时间成什么比例？', a: '正比例', h: '速度 = 路程 ÷ 时间（一定）。' },
      { q: '路程一定时，速度和时间成什么比例？', a: '反比例', h: '速度 × 时间 = 路程（一定）。' },
      { q: '单价一定时，总价和数量成什么比例？', a: '正比例', h: '单价 = 总价 ÷ 数量（一定）。' },
      { q: '总价一定时，单价和数量成什么比例？', a: '反比例', h: '单价 × 数量 = 总价（一定）。' }
    ];
    const chosen = shuffle(rel).slice(0, 3);
    return chosen.map(r => ({
      text: r.q,
      options: shuffle(['正比例', '反比例', '不成比例', '无法判断']),
      answer: r.a,
      hint: r.h
    }));
  },
  // 6-0 圆
  '6-0': () => {
    const r = randInt(2, 8);
    const circumference = Number((2 * 3.14 * r).toFixed(2));
    const area = Number((3.14 * r * r).toFixed(2));
    return [
      {
        text: `一个圆的半径是 ${r}cm，直径是多少？`,
        options: genOptions(r * 2, 4, 1), answer: r * 2,
        hint: `直径 = 半径 × 2 = ${r} × 2 = ${r * 2}。`
      },
      {
        text: `圆的周长公式是 C = 2πr。当 r = ${r}cm 时，周长是多少？（π 取 3.14）`,
        options: genOptions(circumference, 10, 1), answer: circumference,
        hint: `2 × 3.14 × ${r} = ${circumference}。`
      },
      {
        text: `圆的面积公式是 S = πr²。当 r = ${r}cm 时，面积是多少？（π 取 3.14）`,
        options: genOptions(area, 20, 1), answer: area,
        hint: `3.14 × ${r} × ${r} = ${area}。`
      }
    ];
  },
  // 6-1 体积
  '6-1': () => {
    const l = randInt(3, 7), w = randInt(2, 6), h = randInt(2, 5);
    const cylinderBaseArea = randInt(10, 30);
    const cylinderHeight = randInt(3, 8);
    const cylinderVolume = cylinderBaseArea * cylinderHeight;
    return [
      {
        text: `一个长方体长 ${l}cm、宽 ${w}cm、高 ${h}cm，体积是多少？`,
        options: genOptions(l * w * h, 20, 1), answer: l * w * h,
        hint: `${l} × ${w} × ${h} = ${l * w * h}。`
      },
      {
        text: `一个正方体棱长 ${l}cm，体积是多少？`,
        options: genOptions(l * l * l, 30, 1), answer: l * l * l,
        hint: `${l} × ${l} × ${l} = ${l * l * l}。`
      },
      {
        text: `一个圆柱底面积 ${cylinderBaseArea}cm²、高 ${cylinderHeight}cm，体积是多少？`,
        options: genOptions(cylinderVolume, 30, 1), answer: cylinderVolume,
        hint: `圆柱体积 = 底面积 × 高 = ${cylinderBaseArea} × ${cylinderHeight} = ${cylinderVolume}。`
      }
    ];
  },
  // 6-2 综合挑战
  '6-2': () => {
    const [fracNum, fracDen] = pick([[2, 3], [3, 5], [3, 4], [4, 5]]);
    const remainingUnit = randInt(15, 30);
    const total = remainingUnit * fracDen;
    const remaining = remainingUnit * (fracDen - fracNum);

    const [travelNum, travelDen] = pick([[2, 3], [3, 5], [3, 4], [4, 5]]);
    const hours = randInt(3, 6);
    const travelUnit = hours * randInt(10, 20);
    const distance = travelUnit * travelDen;
    const speed = travelUnit * travelNum / hours;

    const triBase = randInt(3, 6) * 2;
    const triHeight = randInt(4, 10);
    const triArea = triBase * triHeight / 2;
    const eqB = randInt(3, 8);
    const eqX = randInt(5, 12);
    const eqC = 2 * (eqX + eqB);
    return [
      {
        text: `一本书看了 ${fracNum}/${fracDen}，还剩 ${remaining} 页没看。这本书一共有多少页？`,
        options: genOptions(total, 50, 1), answer: total,
        hint: `剩下 ${fracDen - fracNum}/${fracDen} 对应 ${remaining} 页。`
      },
      {
        text: `甲、乙两地相距 ${distance} 千米，汽车 ${hours} 小时行驶了全程的 ${travelNum}/${travelDen}。汽车每小时行驶多少千米？`,
        options: genOptions(speed, 20, 1), answer: speed,
        hint: `先算行驶的路程 ${distance} × ${travelNum}/${travelDen} = ${travelUnit * travelNum}，再除以 ${hours} 小时。`
      },
      {
        text: `一个三角形面积 ${triArea}cm²，底 ${triBase}cm，高是多少？`,
        options: genOptions(triHeight, 4, 1), answer: triHeight,
        hint: `面积 = 底 × 高 ÷ 2，高 = ${triArea} × 2 ÷ ${triBase} = ${triHeight}。`
      },
      {
        text: `解方程：2(x + ${eqB}) = ${eqC}`,
        options: genOptions(eqX, 4, 1), answer: eqX,
        hint: `x + ${eqB} = ${eqC / 2}，x = ${eqX}。`
      }
    ];
  }
};

function validateQuestion(question, levelId = 'unknown', index = 0) {
  if (!question || typeof question.text !== 'string' || !question.text.trim()) {
    throw new Error(`${levelId} 第 ${index + 1} 题缺少题干`);
  }
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    throw new Error(`${levelId} 第 ${index + 1} 题必须恰好有 4 个选项`);
  }
  const optionKeys = question.options.map(value => String(value));
  if (new Set(optionKeys).size !== 4) {
    throw new Error(`${levelId} 第 ${index + 1} 题存在重复选项`);
  }
  const answerKey = String(question.answer);
  if (optionKeys.filter(value => value === answerKey).length !== 1) {
    throw new Error(`${levelId} 第 ${index + 1} 题的答案未唯一出现在选项中`);
  }
  return true;
}

// 生成关卡的动态题目，并在进入战斗前拦截结构损坏的数据。
function generateQuestions(levelId) {
  const gen = QUESTION_GENERATORS[levelId];
  if (!gen) return null;
  const questions = gen();
  questions.forEach((question, index) => validateQuestion(question, levelId, index));
  return questions;
}

// 导出数据给 game.js 使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ELEMENTS, REGIONS, LEVELS, QUESTION_GENERATORS, generateQuestions, setQuestionRandom, validateQuestion, WORLD_LAYOUT };
}


// ========== NPC 对话数据 ==========
const NPC_DIALOGS = {
  0: [ // 星芽
    { speaker: '星芽', emoji: '🧚', text: '小远，欢迎来到数理艾瑟里亚！这里的每个区域都藏着不同的数学秘密。' },
    { speaker: '星芽', emoji: '🧚', text: '跑到发光的区域地标附近，点击“进入”就能开始挑战。答对题目可以击败敌人，解锁新的区域！' },
    { speaker: '星芽', emoji: '🧚', text: '地图上有传送点、水晶和宝箱，记得去探索哦！' }
  ],
  1: [ // 风精灵
    { speaker: '风精灵', emoji: '🌪️', text: '一一对应是最基本的数学思想。数和物要一一配对，不能多也不能少。' },
    { speaker: '风精灵', emoji: '🌪️', text: '加法是把两部分合起来，减法是从整体里去掉一部分。记住了吗？' }
  ],
  2: [ // 岩岚学者
    { speaker: '岩岚学者', emoji: '📜', text: '几何图形是从生活物品中抽象出来的。先看边、角、面，再归类。' },
    { speaker: '岩岚学者', emoji: '📜', text: '面积是“单位正方形的个数”，周长是“边界的总长度”。割补转化可以把不规则变成规则。' }
  ],
  3: [ // 雷岛工匠
    { speaker: '雷岛工匠', emoji: '🔨', text: '测量最重要的是统一标准。长度、质量、时间都有十进或六十进的关系。' },
    { speaker: '雷岛工匠', emoji: '🔨', text: '1 米 = 100 厘米，1 千克 = 1000 克，1 时 = 60 分。单位换算要细心！' }
  ],
  4: [ // 澄水法官
    { speaker: '澄水法官', emoji: '⚖️', text: '等式必须保持平衡。用字母表示未知数，找到等量关系，就能解开水流的密码。' },
    { speaker: '澄水法官', emoji: '⚖️', text: '运算律、方程、负数、分数——抽象思维的洪流在此汇聚。' }
  ]
};


// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ELEMENTS, REGIONS, LEVELS, QUESTION_GENERATORS, generateQuestions, setQuestionRandom, validateQuestion, NPC_DIALOGS, WORLD_LAYOUT };
}


// ========== 剧情触发数据 ==========
const STORY_TRIGGERS = {
  intro: [
    { speaker: '星芽', emoji: '🧚', text: '欢迎来到数理艾瑟里亚！这个世界由七大数学领域组成，每个领域都有独特的挑战。' },
    { speaker: '星芽', emoji: '🧚', text: '看！前方就是风起森林。去那里找到风精灵，学习“一一对应”的智慧吧！' },
    { speaker: '星芽', emoji: '🧚', text: '跑图时记得收集水晶和宝箱，它们能帮你成长。出发吧，小远！' }
  ],
  wind: [
    { speaker: '风精灵', emoji: '🌪️', text: '风起之地，万物皆有数。一一对应是最基本的数学思想。' },
    { speaker: '风精灵', emoji: '🌪️', text: '去吧，到风语原完成挑战，证明你的数感！' }
  ],
  rock: [
    { speaker: '岩岚学者', emoji: '📜', text: '岩之国度，图形与几何的殿堂。从实物中抽象出形状，是几何思维的开始。' },
    { speaker: '岩岚学者', emoji: '📜', text: '周长是边界的累加，面积是单位的密铺。记住这些，你就能通过岩岚的试炼。' }
  ],
  river: [
    { speaker: '澄水法官', emoji: '⚖️', text: '水元素代表平衡与等式。代数思维就是用符号表示未知，用等式表达关系。' },
    { speaker: '澄水法官', emoji: '⚖️', text: '天平两端必须平衡，正如等式两边必须相等。这是数学的正义。' }
  ],
  forest: [
    { speaker: '神秘声音', emoji: '🌲', text: '森林深处藏着数字的秘密。分类、计数、比较，这些都是认识世界的工具。' }
  ],
  mountain: [
    { speaker: '山契守望者', emoji: '⛰️', text: '群山见证了几何的演变。从简单的图形识别到复杂的割补转化，都是智慧的结晶。' }
  ],
  desert: [
    { speaker: '雷岛工匠', emoji: '🔨', text: '荒漠中，精确的测量至关重要。长度、质量、时间，都需要统一的标准。' }
  ],
  swamp: [
    { speaker: '森语贤者', emoji: '🌿', text: '沼泽中生长着数据与概率的智慧。分类整理，才能看清事物的本质。' }
  ]
};

// NPC 对话数据扩展
const NPC_DIALOGS_EXTENDED = {
  5: [ // 赤焰谷战士
    { speaker: '赤焰谷战士', emoji: '🔥', text: '烈焰映照下，比与比例的关系变得清晰。两个量之间的缩放，就是比的本质。' },
    { speaker: '赤焰谷战士', emoji: '🔥', text: '正比例是比值一定，反比例是乘积一定。掌握这些，你就能通过赤焰谷的试炼！' }
  ],
  6: [ // 雪境学者
    { speaker: '雪境学者', emoji: '❄️', text: '冰雪覆盖的雪境，是综合试炼的场所。所有数学方法论将在这里交织。' },
    { speaker: '雪境学者', emoji: '❄️', text: '从具体数的操作到抽象关系的把握，这是数学思维的最高飞跃。准备好了吗？' }
  ],
  7: [ // 游方术士
    { speaker: '游方术士', emoji: '🧙', text: '我游历四方，见过无数数学难题。记住：方法比计算更重要。' },
    { speaker: '游方术士', emoji: '🧙', text: '每个区域都有独特的思维工具。一一对应、位值制、平均分、割补转化……掌握它们，你就能成为真正的数理大师。' }
  ]
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ELEMENTS, REGIONS, LEVELS, QUESTION_GENERATORS, generateQuestions, setQuestionRandom, validateQuestion, NPC_DIALOGS, NPC_DIALOGS_EXTENDED, STORY_TRIGGERS, WORLD_LAYOUT };
}
