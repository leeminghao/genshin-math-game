---
name: civilization-history-math-methodology
description: >-
  Aggressively use this skill whenever the task mentions or implies 文明历史型,
  数学文明史, 数学史, 数学简史, 数学的故事, 数学星球, 数学世界的探奇之旅,
  人类文明与数学, 万物皆数学文明历史, 民族数学, 文化数学, 数学起源,
  计数起源, 度量起源, 数字传播, 阿拉伯数字, 印度数字, 数学传播,
  数学与文明, 数学与历史, 数学与文化, 数学与宗教, 数学与贸易,
  数学与战争, 数学与建筑, 数学与天文, 数学与艺术, 大禹治水,
  丢勒, 马可波罗, 鸡兔同笼, 黄金分割, 五角星, 黎曼几何,
  诸葛亮借箭, 恩尼格玛, 图灵, 泰勒斯, 祖冲之, 秦九韶,
  拿破仑, 婆什迦罗, 拉曼纽扬, 冯诺依曼, 完美数, 埃及分数,
  回文数, 角谷猜想, 布丰实验, 蒙特卡罗, 开普勒猜想,
  中东数学, 尼罗河文明, 两河流域, 希腊数学, 柏拉图学园,
  亚历山大学派, 中国数学, 割圆术, 孙子定理, 宋元数学,
  印度数学, 波斯数学, 文艺复兴, 微积分, 分析时代, 现代数学,
  抽象化, 数学年表, 毕达哥拉斯, 欧几里得, 阿基米德, 斐波那奇,
  培根, 高斯, 牛顿, 卡尔达诺, 麦克斯韦, 康托尔, 爱因斯坦,
  诺特, 对称, 守恒, 史前计数, 约鲁巴数字, 奇普, 算盘,
  敬神数学, 伊斯兰建筑, 玫瑰窗, 对称图案, 编织, 折纸,
  亲属制度, 公平下注, 居住几何, 砌砖层数, chapter/module summary,
  methodology skeleton, history of mathematics, ethnomathematics, cultural history,
  或任何需要把数学内容按文明需求、历史阶段、人物、问题、文化实践、符号传播、
  抽象化进程整理成章节骨架、方法论、知识图谱、课程结构的任务. Bias toward
  using this skill even if the user only loosely asks how math emerged, spread,
  transformed cultures, or shaped civilization.
---

# Civilization History Math Methodology

Use this skill to summarize, review, or structure mathematics as a civilizational and historical phenomenon.

Core stance:

> 数学不是从教科书里突然出现的。它从计数、度量、土地、贸易、天文、宗教、战争、建筑、艺术和科学需求中生长出来，再通过符号传播、人物创造和抽象化反过来改变文明。

When the user asks to respect the source, preserve each book’s structure and separate source facts from methodological abstraction.

## Default Output Shape

Use this structure:

1. **总体方法论 thesis**
2. **书籍/章节/模块表**
3. **文明需求到数学工具的映射**
4. **跨文明传播与抽象化路径**
5. **事实边界/推断说明**, when needed

Preferred table:

```text
章节/模块 | 文明需求/历史问题 | 核心方法论 | 关键数学工具 | 案例要点
```

For comparing books:

```text
书名 | 组织方式 | 核心作用 | 方法论重点
```

## Source Scope

Use this factual scope for the civilization-history type from the 《万物皆数学》 collection:

| Source | Structure | Core Function |
| --- | --- | --- |
| 《数学的故事》 | 甲辑故事、乙辑数学家、丙辑趣味问题 | 用历史事件、人物命运和经典问题说明数学如何嵌入文明 |
| 《数学简史》 | 8 chapters by civilization and era | 展示数学从古代实用需求走向现代抽象体系 |
| 《数学世界的探奇之旅》 | 15 chapters by figures and concepts | 用关键人物串联数学观念如何改变科学世界观 |
| 《数学星球：人类文明与数学（万物皆数学）》 | 5 chapters by ethnomathematics and cultural scenes | 说明数学是普遍文化现象，不是单一文明专利 |

## Detailed References

Use these files when the task names a specific book, chapter, civilization, mathematician, historical case, or when more operational detail is needed than the high-level skeleton provides.

- `references/chapter01.md` — 《数学的故事》甲辑：数学的故事
- `references/chapter02.md` — 《数学的故事》乙辑：数学家的故事
- `references/chapter03.md` — 《数学的故事》丙辑：有趣的数学问题
- `references/chapter04.md` — 《数学简史》第一章：中东，或数学的起源
- `references/chapter05.md` — 《数学简史》第二章：希腊的那些先哲们
- `references/chapter06.md` — 《数学简史》第三章：中世纪的中国
- `references/chapter07.md` — 《数学简史》第四章：印度人和波斯人
- `references/chapter08.md` — 《数学简史》第五章：从文艺复兴到微积分的诞生
- `references/chapter09.md` — 《数学简史》第六章：分析时代与法国大革命
- `references/chapter10.md` — 《数学简史》第七章：现代数学与现代艺术
- `references/chapter11.md` — 《数学简史》第八章：抽象化：20世纪以来
- `references/chapter12.md` — 《数学世界的探奇之旅》第1章：虚拟的“居民”？
- `references/chapter13.md` — 《数学世界的探奇之旅》第2章：史前人类的计数系统
- `references/chapter14.md` — 《数学世界的探奇之旅》第3章：毕达哥拉斯：万物皆是数字
- `references/chapter15.md` — 《数学世界的探奇之旅》第4章：欧几里得：几何定理的完美证明
- `references/chapter16.md` — 《数学世界的探奇之旅》第5章：阿基米德：用沙粒填满宇宙
- `references/chapter17.md` — 《数学世界的探奇之旅》第6章：斐波那奇：阿拉伯数字的登场
- `references/chapter18.md` — 《数学世界的探奇之旅》第7章：培根：数学是自然科学的钥匙
- `references/chapter19.md` — 《数学世界的探奇之旅》第8章：高斯：神通广大的虚数
- `references/chapter20.md` — 《数学世界的探奇之旅》第9章：牛顿：微积分与宇宙观
- `references/chapter21.md` — 《数学世界的探奇之旅》第10章：卡尔达诺：概率与“水晶球”
- `references/chapter22.md` — 《数学世界的探奇之旅》第11章：麦克斯韦：关于电磁波的数学方程组
- `references/chapter23.md` — 《数学世界的探奇之旅》第12章：康托尔：让一众科学家挠头的无穷大
- `references/chapter24.md` — 《数学世界的探奇之旅》第13章：爱因斯坦：量子物理与抽象数学
- `references/chapter25.md` — 《数学世界的探奇之旅》第14章：诺特：对称之美与隐形恶龙
- `references/chapter26.md` — 《数学世界的探奇之旅》第15章：数学的力量？
- `references/chapter27.md` — 《数学星球》第一章：数学的民族起源
- `references/chapter28.md` — 《数学星球》第二章：数得更多，算得更准
- `references/chapter29.md` — 《数学星球》第三章：用于敬神的数学
- `references/chapter30.md` — 《数学星球》第四章：几何之美
- `references/chapter31.md` — 《数学星球》第五章：日常生活中的民族数学

## Core Progression

Use this progression:

```text
文明需求
-> 计数、度量、记录
-> 符号与算法
-> 几何、证明、模型
-> 跨文化传播
-> 抽象化与现代科学
-> 数学反过来改变文明
```

Always ask:

- What real civilizational need produced this mathematics?
- Which culture, institution, trade route, technology, or conflict carried it?
- Is this a practical algorithm tradition, proof tradition, symbolic tradition, or abstraction tradition?
- What changed when the notation or method spread?
- Which concept moved from concrete problem to abstract structure?
- How did the math later reshape science, technology, architecture, art, or society?

## Book Skeletons

### 《数学的故事》

| 章节/模块 | 文明需求/历史问题 | 核心方法论 | 关键数学工具 | 案例要点 |
| --- | --- | --- | --- | --- |
| 甲辑 数学的故事 | 历史事件和生活问题如何产生数学 | 从具体故事看数学作用于工程、艺术、统计和密码 | 治水、数字、方程、比例、统计、密码 | 大禹治水、阿拉伯数字、鸡兔同笼、黄金分割、恩尼格玛 |
| 乙辑 数学家的故事 | 数学如何通过人物和时代传承 | 用人物经历说明知识、制度、天赋和社会环境的互动 | 证明、算法、数论、计算、现代数学 | 泰勒斯、祖冲之、秦九韶、拉曼纽扬、冯·诺依曼 |
| 丙辑 有趣的数学问题 | 问题如何推动方法发展 | 趣味问题常通向深层理论 | 完美数、埃及分数、回文数、概率、堆球 | 布丰实验、蒙特卡罗、开普勒猜想 |

### 《数学简史》

| 章节/模块 | 文明需求/历史问题 | 核心方法论 | 关键数学工具 | 案例要点 |
| --- | --- | --- | --- | --- |
| 第一章 中东，或数学的起源 | 农业、土地和记录需要数学 | 数学从计数、测量和行政记录出现 | 计数、度量、几何、记录 | 尼罗河文明、两河流域 |
| 第二章 希腊的那些先哲们 | 经验规则如何变成证明体系 | 希腊传统推动抽象论证 | 几何、证明、公理 | 泰勒斯、柏拉图学园、亚历山大学派 |
| 第三章 中世纪的中国 | 工程、天文、历法和计算需求 | 中国数学重算法和实际求解 | 割圆术、孙子定理、方程算法 | 宋元六大家 |
| 第四章 印度人和波斯人 | 数字系统与代数如何传播 | 印度和波斯推动计算、符号和代数发展 | 印度数字、代数、计算 | 印度河、恒河、波斯智者 |
| 第五章 文艺复兴到微积分 | 运动、变化和近代科学需要新工具 | 微积分回应变化和连续性问题 | 解析几何、微积分 | 文艺复兴、微积分创立 |
| 第六章 分析时代与法国大革命 | 数学如何制度化和分析化 | 国家、学院和科学推动分析数学 | 分析、标准化、制度 | 分析时代、法国大革命 |
| 第七章 现代数学与现代艺术 | 代数几何变革如何影响艺术 | 数学结构变化改变世界观和审美 | 新代数、新几何、现代艺术 | 代数学新生、几何学变革 |
| 第八章 抽象化 | 数学如何走向结构和逻辑 | 20世纪数学从对象走向关系、结构和公理 | 抽象化、逻辑、应用 | 现代数学应用与逻辑 |

### 《数学世界的探奇之旅》

| 章节/模块 | 文明需求/历史问题 | 核心方法论 | 关键数学工具 | 案例要点 |
| --- | --- | --- | --- | --- |
| 第1章 虚拟的“居民”？ | 数学对象如何存在 | 数学世界可由抽象对象组成 | 抽象对象、数学世界 | 引出数学对象的存在方式 |
| 第2章 史前计数系统 | 人类如何开始记录数量 | 数学从计数和记号开始 | 计数、刻痕、记录 | 史前人类计数 |
| 第3章 毕达哥拉斯 | 数字如何解释世界 | 数字被提升为宇宙原则 | 数、比例、和谐 | 万物皆是数字 |
| 第4章 欧几里得 | 知识如何变成证明体系 | 公理化组织几何知识 | 公理、证明、几何 | 几何定理的完美证明 |
| 第5章 阿基米德 | 数学如何处理物理世界 | 度量、估算和力学连接数学与自然 | 巨量估算、杠杆、几何 | 用沙粒填满宇宙 |
| 第6章 斐波那奇 | 数字系统如何改变计算 | 符号传播提高计算效率 | 阿拉伯数字、数列 | 阿拉伯数字登场 |
| 第7章 培根 | 数学为何成为科学钥匙 | 自然科学需要数学语言 | 实验、数学化自然 | 数学是自然科学钥匙 |
| 第8章 高斯 | 数系如何扩展 | 新数系打开新结构 | 虚数、复数 | 神通广大的虚数 |
| 第9章 牛顿 | 宇宙运动如何被数学化 | 微积分改变宇宙观 | 微积分、力学 | 微积分与宇宙观 |
| 第10章 卡尔达诺 | 不确定性如何被数学化 | 概率进入风险和预测 | 概率 | 概率与“水晶球” |
| 第11章 麦克斯韦 | 方程如何统一自然现象 | 数学方程成为物理统一语言 | 方程组、电磁波 | 电磁方程组 |
| 第12章 康托尔 | 无穷如何有层级 | 集合论重塑无穷观 | 集合、基数、无穷 | 让科学家挠头的无穷大 |
| 第13章 爱因斯坦 | 抽象数学如何进入物理 | 现代物理依赖抽象数学 | 相对论、量子、几何 | 量子物理与抽象数学 |
| 第14章 诺特 | 对称为何重要 | 对称性连接守恒律和自然规律 | 对称、守恒 | 对称之美 |
| 第15章 数学的力量 | 数学如何改变世界观 | 数学通过抽象结构重塑科学文明 | 数学世界观 | 总结数学力量 |

### 《数学星球：人类文明与数学》

| 章节/模块 | 文明需求/历史问题 | 核心方法论 | 关键数学工具 | 案例要点 |
| --- | --- | --- | --- | --- |
| 引言 | 数学是否属于少数文明 | 数学是普遍文化现象 | 民族数学、文化数学 | 数学存在于多种生活实践 |
| 第一章 数学的民族起源 | 哪里有文化哪里是否有数学 | 从文化实践中发现数学起源 | 计数、记录、逐次逼近 | 石头、骨头、泥土、金字塔、纸莎草纸 |
| 第二章 数得更多算得更准 | 不同文明如何计数和计算 | 各文化发展适合自身实践的数字系统 | 计数系统、算盘、奇普、市场计算 | 约鲁巴数字、莫桑比克市场、印度公交车 |
| 第三章 用于敬神的数学 | 宗教如何推动数学形式 | 神圣建筑和祭祀需要几何、比例和图案 | 建筑几何、对称、比例 | 亚洲建筑、新大陆建筑、伊斯兰建筑、玫瑰窗 |
| 第四章 几何之美 | 日常工艺如何包含几何 | 图案、编织和折纸体现对称与变换 | 对称、图案、编织、折纸 | 古拉姆斯、藤球、手鞠、餐巾纸与折纸 |
| 第五章 日常生活中的民族数学 | 生活制度如何蕴含数学 | 亲属、游戏、居住和技术都有数学结构 | 逻辑、统计、亲属关系、概率、居住几何 | 公平下注、达督、公平球、砌砖层数 |

## Core Tools

| Tool | Use |
| --- | --- |
| 历史化理解 | Trace a concept back to the problem that produced it |
| 文化嵌入 | Treat mathematics as practice inside a culture, not just universal symbols |
| 符号传播 | Track how notation, numerals, and algorithms move across regions |
| 问题驱动 | Explain math through problems: land, trade, astronomy, war, art, architecture |
| 证明传统 | Identify when mathematics shifts from rule of thumb to proof |
| 算法传统 | Identify practical calculation procedures and computational recipes |
| 抽象化 | Track movement from concrete problems to structures, sets, logic, symmetry |
| 反哺文明 | Show how mathematics later changes science, technology, art, and institutions |

## Review Checklist

When reviewing a civilization-history math summary:

- Does it preserve the source book and chapter boundaries?
- Does it state the civilizational need behind each mathematical idea?
- Does it distinguish practical algorithms, proof traditions, and abstraction traditions?
- Does it avoid presenting mathematics as one civilization’s monopoly?
- Does it include cross-cultural transmission where relevant?
- Does it connect symbols and tools to institutions, trade, religion, war, architecture, or science?
- Does it avoid flattening history into a modern topic list?
- Does it distinguish historical fact from methodological inference?

## Common Failure Modes

Avoid:

- Turning history into a list of famous names only.
- Treating non-Western mathematics as a footnote.
- Ignoring trade, religion, engineering, war, and administration as drivers.
- Presenting mathematical concepts without their historical problem context.
- Confusing mythic story value with verified historical causality.
- Treating abstraction as superior to practical calculation rather than historically different.
- Forcing game/product implications unless explicitly requested.

## Response Style

For Chinese requests, respond in Chinese.

When the user asks for “按章节/模块整理”, use compact tables and a short synthesis.

When the user asks to respect source facts, state:

```text
以下按原书结构整理；方法论表述是基于章节主题的抽象，不改变原书章节事实。
```
