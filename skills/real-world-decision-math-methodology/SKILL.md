---
name: real-world-decision-math-methodology
description: >-
  Aggressively use this skill whenever the task mentions or implies 现实决策型,
  现实决策数学, 救命的数学, 魔鬼数学, 大数据时代数学思维, 数学决策,
  风险判断, 风险决策, 公共决策, 医学概率, 法律统计, 媒体统计,
  统计骗局, 数据骗局, 数字骗局, 概率误判, 统计误判, 数学误判,
  反直觉判断, 指数思维, 指数增长, 指数爆炸, 倍增, 增长率,
  传染病模型, 疫情模型, 群体免疫, R值, 疫苗争议, 体检报告,
  假阳性, 假阴性, 基准率, 贝叶斯, 条件概率, 确定性幻觉,
  刑事档案, 检察官谬误, 生态谬误, 独立性错误, 有罪推定,
  证据推理, 统计证据, 媒体数据, 样本偏差, 回归均值, 相关不等于因果,
  计数系统, 小数点错误, 位值系统, 统一度量制, 千年虫, 二进制,
  算法优化, P vs NP, 贪心算法, 37%法则, 复杂性, 数据困境,
  闪电崩盘, 趋势爆炸, 线性误判, 非线性, 外推风险, 瑞典模式,
  饼状图误导, 图表误导, 推理错误, 随机性, 模式幻觉, 显著性,
  多重比较, 大数据预测, 精准预测, 期望值, 彩票, 赔率, 效用理论,
  风险与不确定性, 回归, 父母高孩子不一定高, 因果推断, 混杂变量,
  民意调查, 抽样, 调查偏差, 存在性, 数学模型, 模型边界,
  正确决策, chapter/module summary, methodology skeleton, risk analysis,
  decision science, statistical reasoning, data literacy,
  或任何需要用数学拆穿数字、概率、统计、图表、趋势、模型、算法、媒体叙事、
  医疗结论、法律证据、金融收益、公共政策中的误导和决策风险的任务. Bias
  toward using this skill even if the user only loosely asks whether a number is可信,
  a chart is misleading, a trend can be extrapolated, a probability is being misread,
  or a decision is mathematically sound.
---

# Real World Decision Math Methodology

Use this skill to summarize, review, or design reasoning around real-world decisions where numbers can save people from bad judgment.

Core stance:

> 现实决策数学不是算得更快，而是识别数字、概率、统计、趋势、图表、模型和算法如何误导人，并建立更稳健的判断流程。

When the user asks to summarize books or chapters, preserve the source structure. When the user asks to review an argument, aggressively test assumptions, denominators, samples, model boundaries, and causal claims.

## Default Output Shape

Use this structure:

1. **总体方法论 thesis**
2. **章节/模块表**
3. **核心判断工具**
4. **常见误判模式**
5. **决策检查清单**

Preferred chapter table:

```text
章节/模块 | 现实问题 | 核心方法论 | 关键工具 | 主要误判
```

Preferred review table:

```text
说法/数字 | 需要核查的问题 | 可能误判 | 应使用的数学工具 | 更稳健判断
```

## Source Structure

Use this factual structure when the task refers to the real-world decision type from the 《万物皆数学》 collection.

| Source | Structure | Core Function |
| --- | --- | --- |
| 《救命的数学》 | 7 chapters | 用指数、概率、统计、计数系统、算法和疫情模型避免现实灾难 |
| 《魔鬼数学：大数据时代，数学思维的力量》 | 5 parts, 18 chapters | 用数学拆穿线性直觉、随机幻觉、期望值误读、回归误判和存在性误解 |

## Detailed References

For deeper work on a specific chapter, read the matching reference file:

| Reference | Source | Chapter |
| --- | --- | --- |
| `references/chapter01.md` | 《救命的数学》 | 指数思维 |
| `references/chapter02.md` | 《救命的数学》 | 概率计算 |
| `references/chapter03.md` | 《救命的数学》 | 刑事档案 |
| `references/chapter04.md` | 《救命的数学》 | 媒体统计骗局 |
| `references/chapter05.md` | 《救命的数学》 | 计数系统 |
| `references/chapter06.md` | 《救命的数学》 | 算法优化 |
| `references/chapter07.md` | 《救命的数学》 | 瘟疫流行 |
| `references/chapter08.md` | 《魔鬼数学》 | 要不要学习瑞典模式？ |
| `references/chapter09.md` | 《魔鬼数学》 | 不是所有的线都是直线 |
| `references/chapter10.md` | 《魔鬼数学》 | 到2048年，人人都是胖子？ |
| `references/chapter11.md` | 《魔鬼数学》 | 触目惊心的数字游戏 |
| `references/chapter12.md` | 《魔鬼数学》 | 比盘子还大的饼状图 |
| `references/chapter13.md` | 《魔鬼数学》 | 圣经密码与股市预测 |
| `references/chapter14.md` | 《魔鬼数学》 | 大西洋鲑鱼不会读心术 |
| `references/chapter15.md` | 《魔鬼数学》 | 美丽又神秘的随机性 |
| `references/chapter16.md` | 《魔鬼数学》 | 肠卜术与科学研究 |
| `references/chapter17.md` | 《魔鬼数学》 | 大数据与精准预测 |
| `references/chapter18.md` | 《魔鬼数学》 | 中彩票大奖与期望值理论 |
| `references/chapter19.md` | 《魔鬼数学》 | 效用理论、风险与不确定性 |
| `references/chapter20.md` | 《魔鬼数学》 | 祝你下一张彩票中大奖 |
| `references/chapter21.md` | 《魔鬼数学》 | 我们为什么无法拒绝平庸 |
| `references/chapter22.md` | 《魔鬼数学》 | 父母高，孩子不一定也高 |
| `references/chapter23.md` | 《魔鬼数学》 | 因为患了肺癌你才吸烟的吗？ |
| `references/chapter24.md` | 《魔鬼数学》 | 所谓民意，纯属子虚乌有 |
| `references/chapter25.md` | 《魔鬼数学》 | 一个凭空创造出来的新奇世界 |

## Core Progression

Use this progression:

```text
现实问题
-> 数字/图表/叙事
-> 暗含假设
-> 概率/统计/增长/算法/模型检查
-> 误判来源
-> 更稳健决策
```

Always ask:

- What is the denominator?
- What is the base rate?
- What is the sample?
- Is the trend linear, nonlinear, or bounded?
- Are events independent?
- Is this correlation, causation, or a confounder?
- Is the result expected value, utility, or a single anecdote?
- What assumptions does the model hide?
- What happens if the model is used outside its valid range?

## 《救命的数学》 Skeleton

| 章节/模块 | 现实问题 | 核心方法论 | 关键工具 | 主要误判 |
| --- | --- | --- | --- | --- |
| 前言 | 为什么数学能救命？ | 将数学作为现实判断和风险识别工具 | 数感、风险意识、批判性判断 | 把数学当考试技能 |
| 第1章 指数思维 | 为什么增长会突然失控？ | 识别指数增长和倍增过程，避免线性直觉 | 指数、倍增、增长率、数量级 | 用直线想象爆炸式变化 |
| 第2章 概率计算 | 如何读懂体检报告？ | 区分检测准确率、患病概率、假阳性和基准率 | 条件概率、贝叶斯直觉、假阳性、基准率 | 把检测阳性等同于患病 |
| 第3章 刑事档案 | 法律证据为何会误导？ | 检查证据独立性、群体差异和概率表述 | 检察官谬误、生态谬误、独立性、统计证据 | 将罕见证据误读为有罪概率 |
| 第4章 媒体统计骗局 | 新闻数字为何常误导？ | 拆解统计口径、样本、相关性和叙事技巧 | 回归均值、样本偏差、百分比、相关/因果 | 被标题和相对数字牵着走 |
| 第5章 计数系统 | 小数点和单位为何致命？ | 理解位值、进制、单位和计量系统的现实安全意义 | 位值、进制、统一度量、二进制 | 忽略单位和表示系统 |
| 第6章 算法优化 | 复杂选择如何可行？ | 将选择转化为算法问题，区分最优、近似和可行 | 贪心算法、P/NP、37%法则、复杂性 | 以为所有问题都能完美求解 |
| 第7章 瘟疫流行 | 传染病如何扩散和终结？ | 用传播模型理解指数扩散、控制策略和群体免疫 | 指数传播、R值、群体免疫、疫苗、控制策略 | 低估早期增长和外部性 |
| 后记 | 数学如何支持公共理性？ | 用模型意识提升社会风险判断 | 公共理性、科学判断、模型边界 | 盲信或完全拒绝模型 |

## 《魔鬼数学》 Skeleton

| 部分/章节 | 现实问题 | 核心方法论 | 关键工具 | 主要误判 |
| --- | --- | --- | --- | --- |
| 引言 | 数学何时派上用场？ | 用数学识别看似合理的错误推理 | 数学思维、反直觉校验 | 只在计算题里使用数学 |
| 第一部分 线性 | 线性直觉为何危险？ | 不默认趋势按直线延伸 | 线性、非线性、外推、边界 | 无限外推短期趋势 |
| 第1章 瑞典模式 | 能否照搬别国经验？ | 比较前检查背景变量和可比性 | 控制变量、样本差异、政策比较 | 把相关案例当因果模板 |
| 第2章 不是所有线都是直线 | 趋势一定线性吗？ | 识别曲线、拐点和边界条件 | 非线性、模型选择、拐点 | 错选模型 |
| 第3章 到2048年人人胖 | 趋势外推会荒谬吗？ | 检查外推范围和现实上限 | 外推、边界条件、饱和 | 把短期趋势推到无限远 |
| 第4章 数字游戏 | 大数字是否更真实？ | 检查统计口径、绝对数和相对数 | 口径、分母、比例 | 被触目惊心的大数误导 |
| 第5章 饼状图 | 图表会不会骗人？ | 检查可视化比例和编码方式 | 图表误导、比例失真 | 把图形冲击当证据 |
| 第二部分 推理 | 如何避免伪规律？ | 区分信号、噪声和事后解释 | 随机性、显著性、样本 | 在噪声里找意义 |
| 第6章 圣经密码与股市预测 | 搜索足够多是否总能找到规律？ | 警惕多重比较和数据挖掘 | 多重比较、过拟合、巧合 | 把筛出来的巧合当预测 |
| 第7章 鲑鱼不会读心术 | 统计显著可靠吗？ | 检查统计检验和假阳性 | 显著性、假阳性、校正 | 盲信 p 值 |
| 第8章 随机性 | 随机为什么像有模式？ | 承认随机序列会出现簇和巧合 | 随机分布、模式幻觉 | 误把随机波动当模式 |
| 第9章 肠卜术与科学研究 | 研究结论何时可信？ | 看方法、样本、机制和可重复性 | 科学方法、可重复性 | 用单项研究下结论 |
| 第10章 大数据预测 | 数据越多越准吗？ | 大数据也要检查偏差、目标和模型 | 大数据、预测、偏差、伪相关 | 迷信规模 |
| 第三部分 期望值 | 风险中如何决策？ | 看长期期望和效用，而非单次故事 | 期望值、赔率、效用、风险 | 被中奖故事诱导 |
| 第11章 彩票大奖 | 彩票为什么诱人？ | 用期望值拆解低概率高回报 | 期望值、赔率、低概率 | 只看奖金不看概率 |
| 第12章 效用理论 | 同样的钱价值一样吗？ | 决策要看效用和风险承受 | 效用、风险偏好、不确定性 | 把金额等同于价值 |
| 第13章 下一张彩票 | 运气能否被策略战胜？ | 区分娱乐、赌博和理性投资 | 长期期望、概率判断 | 把偶然赢当系统优势 |
| 第四部分 回归 | 极端表现为何难持续？ | 识别回归均值，避免误判干预效果 | 回归均值、相关、因果 | 把自然回落当因果结果 |
| 第14章 无法拒绝平庸 | 为什么极端后回归普通？ | 极端样本后续常向平均靠近 | 回归均值、样本选择 | 迷信极端案例 |
| 第15章 父母高孩子不一定高 | 特征为何不简单复制？ | 个体表现受多因素影响并回归平均 | 相关、遗传、回归 | 用单因素解释复杂结果 |
| 第16章 肺癌与吸烟 | 相关是否等于因果？ | 检查因果方向和混杂变量 | 因果推断、混杂因素、相关性 | 把相关关系倒置成因果 |
| 第五部分 存在 | 数学能否证明存在？ | 区分构造、存在和模型设定 | 存在性、公理、模型 | 把抽象对象当现实实体 |
| 第17章 民意 | 民意是真实对象还是统计构造？ | 检查抽样、问题设计和模型 | 抽样、调查偏差、民意模型 | 盲信民调数字 |
| 第18章 新奇世界 | 数学世界从何而来？ | 明确公理和假设边界 | 公理、模型、存在性 | 忽略模型前提 |
| 结语 | 如何正确决策？ | 用数学校验直觉，但不把模型当现实本身 | 模型意识、决策理性 | 盲信模型或拒绝模型 |

## Core Tools

| Tool | Use |
| --- | --- |
| 基准率意识 | Evaluate individual claims against population-level frequency |
| 分母检查 | Ask what total a percentage or rate is relative to |
| 样本检查 | Ask where data came from and whether it is biased |
| 独立性检查 | Test whether events or evidence are really independent |
| 非线性意识 | Avoid extending lines beyond valid ranges |
| 相关/因果分离 | Separate association, direction, and confounders |
| 期望值 | Compare long-run average outcomes under uncertainty |
| 效用 | Adjust value by risk tolerance and marginal impact |
| 回归均值 | Explain why extreme cases often return toward normal |
| 模型边界 | State where a model stops applying |
| 口径审计 | Compare absolute numbers, relative numbers, and definitions |
| 图表审计 | Check visual encoding, axes, area, and omitted context |

## Decision Review Checklist

Use this checklist when evaluating a real-world claim:

1. What exactly is being claimed?
2. What is the denominator or comparison baseline?
3. Is this absolute risk, relative risk, or a rate?
4. What is the base rate before the new evidence?
5. Are samples representative?
6. Are events independent?
7. Is the trend being linearly extrapolated beyond its valid range?
8. Is the graph proportional and honestly scaled?
9. Is this correlation or causation?
10. What confounders could explain the relationship?
11. What is the expected value, and what is the utility?
12. Could regression to the mean explain the result?
13. What assumptions does the model require?
14. What decision changes if the number is wrong?

## Common Failure Modes

Avoid:

- Treating a positive test as equal to disease probability.
- Ignoring base rates.
- Confusing relative risk with absolute risk.
- Treating rare evidence as proof of guilt.
- Treating correlation as causation.
- Extending short-term trends indefinitely.
- Trusting charts without checking axes, areas, and denominators.
- Calling random clusters “patterns”.
- Treating p-values as truth.
- Assuming more data fixes biased data.
- Ignoring regression to the mean.
- Treating models as reality.

## Response Style

Be direct and skeptical. Prefer concrete tables.

When a claim is weak, say so plainly:

```text
这个判断目前不成立。它缺少分母、基准率、样本来源和模型边界，因此数字看起来精确，但决策上不可靠。
```

For Chinese requests, respond in Chinese unless the user asks otherwise.
