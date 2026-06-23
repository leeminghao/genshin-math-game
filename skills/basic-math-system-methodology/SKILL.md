---
name: basic-math-system-methodology
description: >-
  Aggressively use this skill whenever the task mentions or implies 基础数学体系,
  基础体系型, 极简数学, 数学基础, 数学基础体系, 数学知识体系, 数学章节梳理,
  数学模块梳理, 数学方法论骨架, 数学体系骨架, 数学结构化总结, 数学课程结构,
  数学教材拆解, 数学概念图谱, 数学知识图谱, 数的分类, 自然数, 整数,
  有理数, 无理数, 实数, 康托尔, 集合, 基数, 无穷, 可数无穷,
  算术方法, 加法, 减法, 乘法, 除法, 位值, 展开式, 进位, 借位,
  分数, 小数, 循环小数, 素数, 因数, 二进制, 布尔逻辑, 精确度,
  准确度, 舍入, 乘方, 指数, 科学记数法, 数量级, 百分数, 百分比,
  统一度量衡, 量纲分析, SI单位, 比例, 正比例, 比例常数, 比率,
  比例尺, 代数基础, 未知数, 变量, 方程, 等式平衡, 优化, 最大值,
  最小值, 算法, 公式, 公式变形, 数列, 递推, 几何, 面积, 周长,
  角度, 平行线, 毕达哥拉斯定理, 勾股定理, 体积, 多面体, 棱柱体,
  球体, 金字塔, 统计, 平均数, 样本, 群体, 抽样偏差, 离散,
  极差, 四分位距, 中位数, 离群值, 正态分布, 标准差, 相关性,
  散点图, 最佳拟合线, 概率, 可能性, 事件, 结果, 独立事件,
  互斥事件, 排列, 组合, 阶乘, 相对频率, 经验概率, 赌徒谬论,
  chapter/module summary, methodology skeleton, curriculum map, knowledge hierarchy,
  math foundations, foundational mathematics, 或任何需要尊重书籍事实、按章节/模块
  提炼基础数学内容、整理概念层级、抽取数学方法论、构建课程骨架、审查基础数学
  体系完整性的任务. Bias toward using this skill even if the user only loosely asks
  to summarize, split, review, rebuild, compare, or organize foundational math content.
---

# Basic Math System Methodology

Use this skill to summarize, review, or restructure foundational mathematics content as a coherent system.

Core stance:

> 基础数学不是零散知识点，而是一套从“数是什么”逐步走向“如何计算、比较、表达、度量、概括和判断”的结构体系。

When the user asks to respect the book or source facts, do not over-game, over-productize, or force unrelated applications. Preserve the source chapter order and name any inference clearly.

## Default Output Shape

When summarizing foundational math content, use:

1. **总体体系 thesis**
2. **章节/模块表**
3. **核心方法论**
4. **知识递进路径**
5. **事实边界/推断说明**, when needed

Preferred table:

```text
章节/模块 | 核心问题 | 核心方法论 | 关键概念 | 知识作用
```

If the user asks for a shorter version:

```text
部分 | 章节范围 | 核心作用
```

## Source Structure: 《极简数学》

Use this factual structure when the task refers to the basic-system type from the 《万物皆数学》 collection:

| Part | Chapters | Core Function |
| --- | --- | --- |
| 第一部分：分数 | 第1-9章 | 建立数的分类、表示、运算、精度和数量级意识 |
| 第二部分：比率、比例和变化率 | 第10-13章 | 建立比较、单位统一、比例关系和变化关系 |
| 第三部分：代数 | 第14-17章 | 用符号、公式、算法表达通用规律 |
| 第四部分：几何 | 第18-20章 | 用形状、面积、距离、体积理解空间 |
| 第五部分：统计 | 第21-24章 | 用数据描述群体、差异、分布和关系 |
| 第六部分：概率 | 第25-27章 | 用可能性、组合和频率理解不确定事件 |

## Detailed References

For deeper work on a specific chapter, read the matching reference file:

| Reference | Chapter |
| --- | --- |
| `references/chapter01.md` | 数的分类 |
| `references/chapter02.md` | 康托尔计数法 |
| `references/chapter03.md` | 算术方法 |
| `references/chapter04.md` | 加法和乘法 |
| `references/chapter05.md` | 减法和除法 |
| `references/chapter06.md` | 分数和素数 |
| `references/chapter07.md` | 二进制数 |
| `references/chapter08.md` | 精确度 |
| `references/chapter09.md` | 乘方 |
| `references/chapter10.md` | 百分数 |
| `references/chapter11.md` | 统一度量衡 |
| `references/chapter12.md` | 比例 |
| `references/chapter13.md` | 比率 |
| `references/chapter14.md` | 代数基础 |
| `references/chapter15.md` | 优化 |
| `references/chapter16.md` | 算法 |
| `references/chapter17.md` | 公式 |
| `references/chapter18.md` | 面积和周长 |
| `references/chapter19.md` | 毕达哥拉斯定理 |
| `references/chapter20.md` | 体积 |
| `references/chapter21.md` | 平均数 |
| `references/chapter22.md` | 离散 |
| `references/chapter23.md` | 正态分布 |
| `references/chapter24.md` | 相关性 |
| `references/chapter25.md` | 可能性 |
| `references/chapter26.md` | 组合与排列 |
| `references/chapter27.md` | 相对频率 |

## Core Progression

Use this progression as the backbone:

```text
数的类型
-> 数的表示
-> 基本运算
-> 精度与数量级
-> 比较与单位
-> 比例与变化
-> 代数表达
-> 空间度量
-> 数据概括
-> 不确定性判断
```

Do not collapse the system into “math is useful”. Show how each layer depends on earlier layers.

## Chapter Skeleton

Use the following table as the canonical chapter/module skeleton for 《极简数学》.

| 章节/模块 | 核心问题 | 核心方法论 | 关键概念 | 知识作用 |
| --- | --- | --- | --- | --- |
| 序言 | 为什么数学可以重新学会？ | 将数学视为可练习、可逐层搭建的技能 | 数学焦虑、数学自信、碎片化学习 | 建立学习立场 |
| 第1章 数的分类 | 数有哪些类型？ | 先分类，再讨论表示和运算 | 自然数、整数、有理数、无理数、实数 | 建立数系地图 |
| 第2章 康托尔计数法 | 无穷能否比较？ | 用集合和基数理解数量规模 | 集合、基数、可数无穷、不可数无穷 | 打开无穷概念 |
| 第3章 算术方法 | 计算为什么不能只靠步骤？ | 用理解支撑算法过程 | 运算符号、正负号、过程理解 | 稳固算术基础 |
| 第4章 加法和乘法 | 大数如何被结构化计算？ | 用位值和展开式解释加法，乘法压缩重复加法 | 位值、展开式、进位、乘法 | 理解正向运算 |
| 第5章 减法和除法 | 如何理解逆向运算？ | 将减法视为加法的逆，将除法视为重复减法/分割 | 借位、分割法、除法、逆运算 | 理解反向运算 |
| 第6章 分数和素数 | 分数和素数揭示了什么结构？ | 用等值、循环、因数理解数的内部关系 | 等值分数、循环小数、素数、因数 | 连接整数与小数 |
| 第7章 二进制数 | 计数系统是否只有十进制？ | 将位值思想推广到不同进制 | 二进制、2的乘方、布尔逻辑 | 理解计算机表示 |
| 第8章 精确度 | 数字应该表达多细？ | 按用途选择准确和精确的平衡 | 准确、精确、舍入、有效表达 | 避免伪精确 |
| 第9章 乘方 | 如何表达极大、极小和重复增长？ | 用指数压缩重复乘法和数量级 | 乘方、指数、10的乘方、科学记数法 | 建立数量级意识 |
| 第10章 百分数 | 如何标准化比较？ | 将分数转化为以100为基准的比较工具 | 百分数、税率、利率、增长率 | 支撑现代比较 |
| 第11章 统一度量衡 | 单位如何保证公式有意义？ | 用量纲分析检查公式与测量 | 量纲、SI单位、无量纲常数 | 统一现实测量 |
| 第12章 比例 | 两个量如何同步变化？ | 用比例常数描述变量间的线性关系 | 正比例、比例常数、整体法、线性关系 | 描述依赖关系 |
| 第13章 比率 | 多个量如何保持相对份额？ | 用比率表达相对组成和分配关系 | 比、分数、除法、比例尺、分配 | 处理配比与尺度 |
| 第14章 代数基础 | 未知如何被表达和求解？ | 用符号表示未知量，用等式平衡求解 | 未知数、变量、方程、等式平衡 | 从具体走向抽象 |
| 第15章 优化 | 怎样找到最大、最小或最合适？ | 将现实约束表达成代数关系，再寻找极值 | 最大值、最小值、二次方程、图形解 | 解决最优问题 |
| 第16章 算法 | 如何把解法变成步骤？ | 将问题拆成输入、程序和输出 | 算法、变量、程序、俄罗斯农夫法 | 建立可执行过程 |
| 第17章 公式 | 如何从个案推到通用？ | 用公式表达可重复计算的普遍关系 | 公式变形、可逆关系、数列、递推 | 形成通用规则 |
| 第18章 面积和周长 | 平面空间如何被度量？ | 用点线角面和规则测量平面图形 | 角度、平行线、面积、周长、几何证明 | 建立平面几何基础 |
| 第19章 毕达哥拉斯定理 | 直角三角形边长有什么必然关系？ | 用面积重排证明距离关系 | 勾股定理、平方关系、三元组 | 连接几何与代数 |
| 第20章 体积 | 三维空间如何被度量？ | 用底面积、高度和截面理解立体体积 | 多面体、棱柱体、球体、金字塔、体积 | 建立立体度量 |
| 第21章 平均数 | 数据如何代表群体中心？ | 区分群体和样本，用平均数描述中心趋势 | 群体、样本、平均数、抽样偏差 | 概括数据中心 |
| 第22章 离散 | 平均数为什么不够？ | 用离散程度描述数据分布宽窄 | 极差、四分位距、中位数、离群值 | 补充中心趋势 |
| 第23章 正态分布 | 常见数据如何围绕中心分布？ | 用钟形曲线和标准差描述常见分布 | 正态分布、标准差、68-95-99.7规则 | 理解典型分布 |
| 第24章 相关性 | 两类数据是否一起变化？ | 用散点图和拟合线描述变量关系 | 正相关、负相关、相关系数、最佳拟合线 | 分析变量关系 |
| 第25章 可能性 | 如何表示事件发生机会？ | 用0到1之间的数表示概率 | 结果、事件、独立、互斥、概率 | 建立概率语言 |
| 第26章 组合与排列 | 概率前要先知道有多少可能 | 根据顺序是否重要区分排列和组合 | 阶乘、排列、组合、选择 | 支撑可能性计数 |
| 第27章 相对频率 | 理论概率难算时怎么办？ | 用长期观察频率估计可能性 | 相对频率、经验概率、独立性、赌徒谬论 | 从数据估计概率 |
| 后记 | 数学学习如何继续？ | 将数学自信向外扩散，继续补充概念 | 数学自信、持续学习 | 收束学习立场 |

## Core Methodology Rules

Use these rules when analyzing or rewriting foundational math material:

1. **先分类，再计算。** Unknown number types create unstable reasoning.
2. **先表示，再运算。** Place value, notation, units, and precision decide what operations mean.
3. **运算要解释结构。** Addition, subtraction, multiplication, and division are transformations, not just procedures.
4. **比较必须标准化。** Percentages, ratios, scales, and units are tools for fair comparison.
5. **代数负责一般化。** Variables, equations, formulas, algorithms, and sequences express repeatable patterns.
6. **几何负责空间度量。** Length, angle, area, and volume turn space into measurable structure.
7. **统计负责概括数据。** Mean, spread, distribution, and correlation describe groups without seeing every case.
8. **概率负责不确定性。** Outcomes, events, combinations, and relative frequency make uncertainty discussable.

## Review Checklist

When reviewing a foundational math summary, check:

- Does it preserve the source order and source chapter boundaries?
- Does it distinguish factual source content from interpretation?
- Does it explain why each module follows from previous modules?
- Does it avoid reducing chapters to isolated topic labels?
- Does it capture both concept and method?
- Does it separate arithmetic, proportion, algebra, geometry, statistics, and probability clearly?
- Does it avoid unrelated product, game, or motivational framing unless requested?

## Common Failure Modes

Avoid:

- Turning a foundational math book into a loose “math is everywhere” essay.
- Mixing game design, PRD, or product advice into a source-faithful summary.
- Treating percentage, ratio, and proportion as the same concept.
- Treating average as equivalent to statistical understanding.
- Discussing probability without first accounting for counting, events, and assumptions.
- Ignoring units and precision when summarizing measurement.
- Compressing 27 chapters into a few broad topics without preserving chapter facts.

## Response Style

When the user asks for “按章节/模块整理”, prefer compact tables.

When the user says “尊重书籍事实”, explicitly state:

```text
以下按原书结构整理；方法论表述是基于章节内容的抽象，不改变原书章节事实。
```

Use Chinese for Chinese requests. Keep the tone factual and structured.
