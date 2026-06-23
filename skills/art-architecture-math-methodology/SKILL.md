---
name: art-architecture-math-methodology
description: >-
  Aggressively use this skill whenever the task mentions or implies 艺术建筑型,
  感官的盛宴, 万物皆数学艺术建筑, 艺术数学, 建筑数学, 数学与艺术,
  数学与建筑, 数学之眼, 透视画法, 透视法, 焦点透视法, 线性透视,
  视觉锥体, 视点, 绘画平面, 消失点, 中心点, 投影, 投影几何,
  布鲁内莱斯基, 阿尔伯蒂, 皮耶罗, 皮耶罗·德拉·弗朗切斯卡,
  丢勒, 马萨乔, 文艺复兴, 算盘学校, 艺术数学家, 数学艺术家,
  体积计算, 正多面体, 虚拟现实, 透视工具, 对角线方法, 叉线,
  燃烧线, 蛋线, 时间空间光线, 描绘时间, 空间结构, 光线方向,
  波提切利, 帕拉迪布雷拉, 第四维度, 埃尔·格列柯, 苏巴朗,
  委拉斯凯兹, 变形, 抽象空间, 维度, 建筑与几何, 万神殿,
  罗马万神殿, 数字与形状, 诺维拉圣母教堂, 人文主义建筑,
  几何比例, 建筑比例, 模数, 对称, 节奏, 圆, 球, 柱体,
  chapter/module summary, methodology skeleton, art history, architecture analysis,
  visual mathematics, spatial reasoning, 或任何需要把艺术、绘画、透视、空间、
  光线、变形、比例、建筑、文艺复兴案例整理成数学方法论、章节骨架、知识图谱、
  课程结构、设计分析、空间分析的任务. Bias toward using this skill even if the
  user only loosely asks how math appears in art, architecture, perspective, visual
  perception, spatial construction, or geometric composition.
---

# Art Architecture Math Methodology

Use this skill to summarize, review, or structure mathematics in art and architecture, especially the 《感官的盛宴（万物皆数学）》 section of the collection.

Core stance:

> 艺术建筑数学不是把作品硬套公式，而是研究数学如何把感官经验转化为可构造、可度量、可传播的空间秩序。

When the user asks to respect the book, preserve the source chapter order and separate factual chapter content from methodological abstraction.

## Default Output Shape

Use this structure:

1. **总体方法论 thesis**
2. **章节/模块表**
3. **核心视觉/空间工具**
4. **跨章节递进路径**
5. **事实边界/推断说明**, when needed

Preferred chapter table:

```text
章节/模块 | 核心问题 | 核心方法论 | 关键工具 | 案例要点
```

For analysis of a specific artwork or building:

```text
对象 | 可观察现象 | 数学结构 | 证据/线索 | 谨慎边界
```

## Source Structure: 《感官的盛宴（万物皆数学）》

Use this factual structure when the task refers to the art-architecture type:

| Chapter | Module | Core Function |
| --- | --- | --- |
| 前言 | 数学之眼 | 建立数学作为艺术与文明观察维度的立场 |
| 第一章 | 透视画法的诞生 | 说明三维视觉如何被几何规则转成二维画面 |
| 第二章 | 艺术数学家和数学艺术家 | 说明数学如何进入艺术工作坊、工具和实践 |
| 第三章 | 时间、空间和光线 | 说明绘画如何组织不可见的时间、空间和光线结构 |
| 第四章 | 数学之眼看三位画家 | 用数学视角分析变形、第四维度和抽象空间 |
| 第五章 | 建筑与几何 | 说明建筑如何由形状、比例、模数和对称组织 |

## Detailed References

For deeper work on a specific chapter, read the matching reference file:

| Reference | Chapter |
| --- | --- |
| `references/chapter01.md` | 透视画法的诞生 |
| `references/chapter02.md` | 艺术数学家和数学艺术家 |
| `references/chapter03.md` | 时间、空间和光线 |
| `references/chapter04.md` | 数学之眼看埃尔·格列柯、苏巴朗和委拉斯凯兹 |
| `references/chapter05.md` | 建筑与几何 |

## Core Progression

Use this progression:

```text
感官经验
-> 视觉/空间问题
-> 几何抽象
-> 构造工具
-> 艺术表达
-> 建筑秩序
-> 改变观看世界的方式
```

Do not reduce the content to “art uses math”. Show what problem math solves:

- How does the eye see?
- How is 3D projected onto 2D?
- What makes a spatial illusion reproducible?
- How do artists construct instead of merely imitate?
- How do time, light, and space appear in static images?
- When is deformation a mistake, and when is it expression?
- How do proportion, module, symmetry, and geometry create architectural order?

## Chapter Skeleton

| 章节/模块 | 核心问题 | 核心方法论 | 关键工具 | 案例要点 |
| --- | --- | --- | --- | --- |
| 前言 | 数学为什么能进入艺术？ | 用数学之眼补充艺术观看方式，观察比例、空间、结构和秩序 | 数学之眼、观察、抽象、结构 | 艺术史、文明史和数学视角互相补充 |
| 第一章 透视画法的诞生 | 如何把三维视觉真实转到二维画面？ | 将观看行为几何化，用视点、画面和投影规则重建空间 | 视点、视觉锥体、绘画平面、消失点、投影 | 布鲁内莱斯基演示、阿尔伯蒂窗口、丢勒工具、马萨乔革命 |
| 第二章 艺术数学家和数学艺术家 | 艺术家如何成为数学实践者？ | 数学从书斋进入工作坊，成为绘画、体积、图形和工具构造技术 | 算术、几何构造、体积、正多面体、透视工具 | 算盘学校、皮耶罗数学著作、正多面体、虚拟现实 |
| 第三章 时间、空间和光线 | 绘画如何表达时间和空间结构？ | 从画面对象背后抽象出时间、光线和连续空间关系 | 时间线索、空间容器、光线方向、位置关系 | 波提切利描绘时间，《帕拉·迪·布雷拉》的空间结构 |
| 第四章 数学之眼看三位画家 | 数学如何解释变形、抽象空间和维度感？ | 用数学视角分析艺术中的变形、维度、空间抽象和视觉选择 | 变形、第四维度、抽象空间、定义、非本质特征剥离 | 埃尔·格列柯、苏巴朗、委拉斯凯兹 |
| 第五章 建筑与几何 | 建筑为什么产生秩序、庄严和和谐？ | 用几何形状、比例、模数和对称组织建筑空间 | 圆、球、柱体、比例、模数、对称、节奏 | 罗马万神殿、诺维拉圣母教堂 |

## Core Tools

| Tool | Use |
| --- | --- |
| 数学之眼 | View artworks and buildings through structure, proportion, relation, and rule |
| 透视化 | Convert visual experience into geometric projection |
| 投影建模 | Map 3D space onto a 2D plane |
| 视点控制 | Explain how viewer position changes visual result |
| 构造法 | Make visual effects reproducible through geometric procedures |
| 度量化 | Use length, area, volume, angle, and proportion to analyze objects |
| 空间抽象 | Separate space itself from the objects inside it |
| 变形解释 | Treat distortion as a possible spatial or expressive strategy |
| 比例秩序 | Use ratio, module, symmetry, and rhythm to structure architecture |
| 历史化理解 | Connect mathematical tools to Renaissance workshops, architecture, and civilization |

## Review Checklist

When reviewing an art/architecture math summary:

- Does it preserve the book’s chapter structure?
- Does it distinguish art-historical fact from mathematical interpretation?
- Does it explain the visual or architectural problem being solved?
- Does it avoid reducing art to formulas?
- Does it name concrete tools: viewpoint, projection, vanishing point, proportion, module, symmetry?
- Does it include cases from the book rather than generic examples only?
- Does it handle “dimension” and “deformation” cautiously rather than overclaiming?
- Does it show how math changes making and seeing, not just measuring?

## Common Failure Modes

Avoid:

- Saying only “art and math are connected” without explaining the mechanism.
- Treating perspective as decoration rather than a projection system.
- Treating architecture as static shapes rather than organized space.
- Claiming every artistic choice has a mathematical intent.
- Overstating fourth-dimension interpretations without caveats.
- Ignoring historical workshop practices and tools.
- Replacing the book’s Renaissance and architectural cases with unrelated modern examples.

## Response Style

Be factual and structural. For Chinese requests, respond in Chinese.

When the user asks for “按章节/模块整理”, use a compact table and then summarize the cross-chapter method.

When the user asks to respect the book, state:

```text
以下按原书结构整理；方法论表述是基于章节内容的抽象，不改变原书章节事实。
```
