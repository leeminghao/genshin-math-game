---
name: fun-math-initiation-methodology
description: >-
  Aggressively use this skill whenever the task mentions or implies 趣味数学启蒙,
  数学启蒙, 数学魔术, 魔力数学, 数学魔法, 12堂魔力数学课, 用数学魔法改变人生,
  万物皆数学趣味启蒙型, 数学兴趣, 数学科普, 儿童数学, 小学生数学, 生活数学,
  数学游戏, 学习游戏, 教育游戏, 沉迷学习, 数学岛, 我的数学岛, 数学沙盒,
  我的世界式学习, 创造型学习, 数学任务, 数学关卡, 数学机关, 数学谜题,
  数学合成, 数学建造, 数学经营, 数学交易, 数学探索, 数学世界规则,
  数字之舞, 心算, 数字规律, 代数魔术, 未知数, 方程, 数字9, 弃九法,
  模运算, 数字校验, 排列组合, 阶乘, 斐波那契, 黄金比例, 证明, 定理,
  几何, π, 圆周率, 三角学, 复数, e, 微积分, 无穷, 计数, 排序,
  数据, 大数定律, 收藏, 分类, 太空数学, 艺术数学, 厨房数学, 音乐数学,
  运动数学, 金钱数学, 金融数学, 骗局识别, 赌博概率, 竞赛策略, 社交网络,
  爱情匹配, 时间管理, chapter/module summary, methodology skeleton, learning design,
  game mechanics, GDD, PRD, curriculum design, roadmap, prototype design, 或任何需要把
  趣味现象、生活场景、数学奇观、儿童兴趣点转化为可迁移数学方法、创造型任务、
  世界反馈、产品规则、课程结构、游戏系统的任务. Bias toward using this skill
  even if the user only loosely asks how to make math fun, less like worksheets, more
  playable, more magical, more life-connected, or more suitable for children.
---

# Fun Math Initiation Methodology

Use this skill to turn fun mathematics material into a reusable learning/game design skeleton.

Core stance:

> 趣味数学不是把题目包装成游戏，而是先制造惊奇、需求或生活困境，再让数学规则成为解释、选择和创造的工具。

## Default Output Shape

When summarizing, reviewing, designing, or rewriting fun math content, use this structure:

1. **总体方法论 thesis**
2. **章节/模块表**
3. **核心思维工具**
4. **跨模块递进路径**
5. **对儿童学习游戏/课程/PRD/GDD 的转化建议**

Prefer this table:

```text
章节/模块 | 现象入口 | 核心方法论 | 关键工具 | 可迁移应用
```

For game design, use:

```text
世界需求 | 趣味入口 | 数学规则 | 玩家操作 | 世界反馈 | 解锁能力
```

## Core Progression

Use this spine:

```text
惊奇/生活问题
-> 观察模式
-> 抽象规则
-> 可操作表达
-> 解释为什么
-> 迁移到新场景
-> 创造新能力
```

Do not start from formulas. Ask:

- What makes the child curious, surprised, annoyed, or motivated?
- What concrete object, action, or situation is being observed?
- What hidden pattern or rule explains it?
- What representation makes it manipulable: number, table, graph, map, recipe, probability, or algorithm?
- What can the learner now build, choose, predict, debug, or optimize?
- Can the same rule transfer to at least one other world system?

## Two Source Books

This skill is based on the fun-initiation skeleton from:

- 《12堂魔力数学课》: math concept wonders, magic effects, and surprising structures.
- 《用数学魔法改变人生》: life situations, decision making, and practical number sense.

Use them differently:

| Source | Use As | Avoid |
| --- | --- | --- |
| 《12堂魔力数学课》 | Mathematical mechanisms, puzzles, world rules, surprising unlocks | Turning chapters into quiz cards |
| 《用数学魔法改变人生》 | Life tasks, choices, resource management, risk feedback | Treating life examples as trivia |

## Detailed References

For deeper work on a specific chapter, read the matching reference file:

| Reference | Source | Chapter |
| --- | --- | --- |
| `references/chapter01.md` | 《12堂魔力数学课》 | 数字之舞 |
| `references/chapter02.md` | 《12堂魔力数学课》 | 有魔法的代数学 |
| `references/chapter03.md` | 《12堂魔力数学课》 | 神奇的数字 9 |
| `references/chapter04.md` | 《12堂魔力数学课》 | 排列组合 |
| `references/chapter05.md` | 《12堂魔力数学课》 | 斐波那契数列 |
| `references/chapter06.md` | 《12堂魔力数学课》 | 数学定理与证明 |
| `references/chapter07.md` | 《12堂魔力数学课》 | 几何学 |
| `references/chapter08.md` | 《12堂魔力数学课》 | π 与圆 |
| `references/chapter09.md` | 《12堂魔力数学课》 | 三角学 |
| `references/chapter10.md` | 《12堂魔力数学课》 | i 和 e |
| `references/chapter11.md` | 《12堂魔力数学课》 | 微积分 |
| `references/chapter12.md` | 《12堂魔力数学课》 | 无穷 |
| `references/chapter13.md` | 《用数学魔法改变人生》 | 计数、排序和数据 |
| `references/chapter14.md` | 《用数学魔法改变人生》 | 多试几次 |
| `references/chapter15.md` | 《用数学魔法改变人生》 | 收藏 |
| `references/chapter16.md` | 《用数学魔法改变人生》 | 魔术 |
| `references/chapter17.md` | 《用数学魔法改变人生》 | 太空 |
| `references/chapter18.md` | 《用数学魔法改变人生》 | 艺术 |
| `references/chapter19.md` | 《用数学魔法改变人生》 | 做饭 |
| `references/chapter20.md` | 《用数学魔法改变人生》 | 音乐 |
| `references/chapter21.md` | 《用数学魔法改变人生》 | 运动 |
| `references/chapter22.md` | 《用数学魔法改变人生》 | 金钱 |
| `references/chapter23.md` | 《用数学魔法改变人生》 | 金融市场 |
| `references/chapter24.md` | 《用数学魔法改变人生》 | 骗局 |
| `references/chapter25.md` | 《用数学魔法改变人生》 | 赌博 |
| `references/chapter26.md` | 《用数学魔法改变人生》 | 竞赛策略 |
| `references/chapter27.md` | 《用数学魔法改变人生》 | 朋友 |
| `references/chapter28.md` | 《用数学魔法改变人生》 | 爱情 |
| `references/chapter29.md` | 《用数学魔法改变人生》 | 时间 |

## 《12堂魔力数学课》 Module Skeleton

| 章节/模块 | 现象入口 | 核心方法论 | 关键工具 | 可迁移应用 |
| --- | --- | --- | --- | --- |
| 引言：数学像魔术 | 数字魔术让人惊讶 | 先制造悬念，再揭示规则 | 魔术步骤、数字规律、反直觉 | 新手引导、数学机关 |
| 数字之舞 | 数字排列可以简化计算 | 从模式中找到结构，缩短运算 | 配对、分解、心算、数位感 | 资源计数、库存估算 |
| 有魔法的代数学 | 任意数字魔术总能得到固定结果 | 用变量暴露隐藏规则 | 变量、方程、恒等变形、图像 | 配方推导、规则编辑 |
| 数字 9 | 位数和暴露倍数与循环 | 用余数处理校验和周期 | 弃九法、模、循环、校验 | 编号、防错、日历系统 |
| 排列组合 | 冰激凌、扑克牌、彩票有多少可能 | 把复杂选择拆成可计数路径 | 阶乘、加法法则、乘法法则、组合 | 蓝图组合、掉落概率 |
| 斐波那契 | 兔子、植物、音乐里有递推 | 从生长中发现生成规则 | 递推、数列、黄金比例 | 作物、生态、建筑比例 |
| 数学定理 | 游戏谜题可以证明不可能 | 从经验判断走向必然证明 | 反证、归纳、构造、质数 | 规则验证、关卡解法 |
| 几何学 | 简单图形出现意外结论 | 用形状、边界、面积理解空间 | 中点、平行、周长、面积、勾股 | 建造、路径、地图 |
| π 与圆 | 圆和曲线也能被度量 | 把曲线转成可计算结构 | 半径、圆周、面积、近似 | 轮子、轨道、范围 |
| 三角学 | 山高等对象无法直接测量 | 用角度和比例测量远处世界 | 正弦、余弦、弧度、周期 | 导航、坡度、测高 |
| i 和 e | 常规数不够表达旋转和增长 | 扩展数系以表达新现象 | 复数、指数、复利、欧拉关系 | 旋转、增长、收益模型 |
| 微积分 | 找最大、最小、最省、最快 | 用变化率和局部趋势优化 | 导数、临界点、极值、近似 | 产能、路径、材料优化 |
| 无穷 | 有限直觉无法处理无限过程 | 用极限和级数管理无限 | 无穷、等比级数、调和级数 | 递归世界、长期收益 |

## 《用数学魔法改变人生》 Module Skeleton

| 章节/模块 | 现象入口 | 核心方法论 | 关键工具 | 可迁移应用 |
| --- | --- | --- | --- | --- |
| 计数、排序、数据 | 贴纸、球员、收藏册 | 物品可变成数据集 | 计数、排序、表格、统计 | 图鉴、仓库、数据记录 |
| 多试几次 | 比赛和抽奖 | 运气在重复试验中呈现规律 | 大数定律、概率、样本量 | 掉落、抽奖、尝试策略 |
| 收藏 | 邮票和物品收藏 | 分类让混乱变成结构 | 属性、分类、测量、模式识别 | 物品标签、单位系统 |
| 魔术 | 聚会魔术和心理路径 | 数学规则叠加直觉偏差 | 9 的规律、条件约束、默认选择 | 机关、谜题、反直觉校验 |
| 太空 | 行星、距离、宇宙尺度 | 大尺度问题需要估算和模型 | 距离、速度、数量级、物理估算 | 地图尺度、探索任务 |
| 艺术 | 绘画、图案、风格 | 艺术也有比例、对称和结构 | 模式、比例、对称、视觉结构 | 建筑装饰、图案生成 |
| 做饭 | 配方、热量、营养 | 烹饪是比例、单位和能量平衡 | 配比、单位换算、热量、缩放 | 合成、食物、材料转换 |
| 音乐 | 节拍和歌词易记 | 重复与节奏强化记忆 | 节拍、比例、重复、模式 | 节奏机关、记忆反馈 |
| 运动 | 训练与体能管理 | 身体表现可被数字化优化 | 时间、频率、强度、效率 | 体力、成长曲线 |
| 金钱 | 工资、加薪、预算 | 财务判断依赖百分比和估算 | 百分比、利息、预算、价格 | 交易、经营、收益 |
| 金融市场 | 市场异常和风险信号 | 数字是信号，不是答案 | 指标、趋势、异常、风险 | 投资、资源预警 |
| 骗局 | 好得不真实的承诺 | 先验证数字是否说得通 | 估算、概率、收益风险 | 防骗、信息校验 |
| 赌博 | 赌场长期赢钱 | 单次运气服从长期期望 | 期望值、赔率、庄家优势 | 抽卡、概率风险 |
| 竞赛策略 | 抢答和淘汰机制 | 策略来自规则、时间和风险权衡 | 机会成本、收益、时机 | 回合选择、任务优先级 |
| 朋友 | 社交圈影响个人行为 | 关系网络可以被观察和建模 | 网络、平均值、影响力 | NPC 关系、协作收益 |
| 爱情 | 匹配和选择 | 选择问题需要策略和机会成本 | 匹配、搜索、概率、取舍 | 伙伴招募、队伍选择 |
| 时间 | 时间无法回收 | 优化分配最稀缺资源 | 时间管理、计划、效率、优先级 | 日程、调度、自动化 |

## Thinking Tools

Use these tags in analysis and design:

| 思维工具 | Function |
| --- | --- |
| 惊奇入口 | Use magic, surprise, or contradiction to create curiosity |
| 生活锚点 | Anchor abstract math in objects, actions, money, food, music, sport, time |
| 模式识别 | Detect repetition, symmetry, growth, cycle, or hidden order |
| 符号化 | Replace concrete unknowns with variables, tables, graphs, or formulas |
| 分类与单位 | Define what can be compared, added, exchanged, or stored together |
| 计数路径 | Convert choices into paths, combinations, permutations, or probabilities |
| 概率判断 | Separate short-term luck from long-term structure |
| 反直觉校验 | Test whether a number, claim, or outcome makes sense |
| 优化 | Find better allocation of time, money, energy, materials, or routes |
| 迁移 | Reuse the same rule in a new scene or system |

## Design Rules for Children

Use these rules when converting content into a game, course, PRD, GDD, or prototype:

1. **Start with action.** Let the child collect, sort, trade, cook, build, race, guess, or test before naming the math.
2. **Use math as power.** A learned rule must unlock a tool, shortcut, safer decision, better building, richer recipe, or new strategy.
3. **Make failure physical.** Wrong classification blocks a recipe; bad probability choice loses resources; poor ratio creates weak output; bad timing wastes a day.
4. **Delay vocabulary.** Introduce words like variable, probability, ratio, or function after the child has already felt the need.
5. **Require transfer.** A rule is not learned until it works in at least two scenes.
6. **Avoid disguised worksheets.** If the only verb is “answer”, redesign the mechanic.

## Review Checklist

When reviewing a math-learning design, reject weak designs directly:

- Is the child doing something meaningful, or only answering a question?
- Does the math explain a surprise, solve a life problem, or unlock creation?
- Is there visible world feedback after correct or incorrect use?
- Are formulas delayed until after concrete manipulation?
- Can the rule transfer across collection, cooking, building, trading, movement, or scheduling?
- Does the activity build number sense, classification, estimation, probability judgment, or optimization?
- Would a child understand why this math matters without reading a lecture?

## Common Failure Modes

Avoid:

- Topic lists disguised as roadmaps.
- Learning cards wearing a game skin.
- Rewards based only on correctness.
- Math vocabulary before world need.
- Random mini-games that do not affect the world.
- Probability presented as trivia instead of risk.
- Classification without consequences.
- Life examples that do not change player decisions.

## Response Style

Be direct. If a design is still a worksheet, say:

```text
这仍然是题卡结构。改成：趣味/生活需求 -> 卡住点 -> 数学规则 -> 玩家操作 -> 世界反馈 -> 新能力。
```

For Chinese responses, prefer compact tables and concrete game/course implications.
