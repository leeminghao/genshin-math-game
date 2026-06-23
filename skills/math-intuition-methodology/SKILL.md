---
name: math-intuition-methodology
description: >-
  Aggressively use this skill whenever the task mentions or implies 数学直觉,
  数学觉醒, 数学觉醒：学会更清晰地思考, 戴维·贝西, David Bessis,
  数学直觉训练,
  数学心理图像, 心理图像, mental image, 数学想象力, 数学可视化,
  具身数学, 具身学习, 触觉理论, 数学恐惧, 克服数学恐惧,
  数学焦虑, 数学天赋神话, 智力神话, 数学脑, 没有数学脑,
  数学直觉和逻辑, 系统1, 系统2, 系统3, 直觉逻辑对话,
  直觉与推理, 数学思维训练, 数学学习方法, 数学学习心理学,
  数学理解, 数学顿悟, 数学清晰感, 超常清晰, 数学内化,
  工具内化, 勺子的正确用法, 思想的力量, 真正的魔法,
  看不见的行动, 不读数学书, 孩童的姿态, 装傻,
  一门武术, 房间里的大象, 抽象而灵活, 表示系统,
  符号系统, 数学语言, 形式化语言, 抽象能力, 心理可塑性,
  儿童数学直觉, 小学生数学直觉, 数学启蒙, 沉迷学习数学,
  数学游戏设计, 数学教育产品, 数学 PRD, 数学课程设计,
  chapter/module summary, methodology skeleton, mathematical intuition,
  embodied cognition, visual thinking, math anxiety, intuitive reasoning,
  or any request to summarize, review, attack, rebuild, or apply the
  methodology of 《数学觉醒》/《数学直觉》 to education, curriculum, games,
  PRDs, prototypes, or learning experiences. Bias toward using this skill even
  when the user only loosely asks how to make math visible, playable,
  embodied, intuitive, or deeply understood.
---

# Math Intuition Methodology

Use this skill to summarize, review, or apply the methodology behind 《数学觉醒》/《数学直觉》: mathematics as trained intuition, embodied mental imagery, and dialogue between fast intuition and rigorous reasoning.

Core stance:

> 数学不是先背公式再刷题，而是先在身体、经验、图像、动作和好奇心中形成可操作的心理对象，再把这些对象沉淀为符号、语言、推理和清晰判断。

When the user asks to respect the book, preserve chapter order and separate source facts from application. Do not turn the book into generic motivation, generic “数学很有用”, or a list of study tips.

## Default Output Shape

For chapter/module summaries, use:

1. **总体方法论 thesis**
2. **章节/模块表**
3. **核心递进路径**
4. **可迁移原则**
5. **事实边界/推断说明**, when needed

Preferred table:

```text
章节/模块 | 核心问题 | 核心方法论 | 关键机制 | 可迁移用法
```

For PRD, game, curriculum, or prototype review, use:

```text
结论 | 依据来源 | 原始证据 | 类型：事实/推断/假设/建议 | 置信度
```

## Source Structure

Use this structure for 《数学觉醒》/《数学直觉》:

| 章节/模块 | 核心问题 | 核心方法论 | 关键机制 | 可迁移用法 |
| --- | --- | --- | --- | --- |
| 第1章 三个秘密 | 数学是否只属于天才？ | 破除智力神话，把数学视为人人可训练的内在经验 | 好奇心、想象力、怀疑、心理可塑性 | 设计学习体验时先消除“我不行”的身份恐惧 |
| 第2章 勺子的正确用法 | 抽象能力如何被学会？ | 像学用勺子一样，通过反复动作把工具内化为身体延伸 | 工具内化、动作协调、熟练后的无意识 | 让孩子先操作、摆放、拖动、试错，再抽象规则 |
| 第3章 思想的力量 | 抽象对象为什么能被理解？ | 在脑中制造可看见、可移动、可变形的心理图像 | 完美圆、抽象图像、想象力 | 把数、形、关系做成可观察对象，而不是只给文字定义 |
| 第4章 真正的魔法 | 符号为什么改变思考能力？ | 表示系统决定什么能被轻松看见和计算 | 十进制、记数法、符号可见性 | 教概念时优先换表示：实物、图形、表格、符号、语言 |
| 第5章 看不见的行动 | 发现为何难以直接传授？ | 理解是一种语言前的心理动作，学习者必须在自己脑中重做 | 内在动作、身体感、重新发现 | 设计任务时让孩子亲自完成“发现动作”，不要只展示答案 |
| 第6章 不读数学书 | 数学材料该如何使用？ | 不按顺序被动读，而是带问题跳读、回看、验证 | 主动阅读、问题驱动、选择性注意 | 学习系统要允许孩子从问题进入知识，而不是线性灌输 |
| 第7章 孩童的姿态 | 为什么儿童姿态重要？ | 保持敢犯错、敢装傻、敢追问的状态 | 好奇心、羞耻解除、非评价环境 | 游戏和课堂要保护幼稚问题，并奖励真实困惑 |
| 第8章 触觉理论 | 概念意义从哪里来？ | 意义来自触摸、行动、经验和对比，不是来自循环定义 | 具身经验、触觉、心理可塑性 | 抽象概念必须先落地到可感知、可比较、可操作的对象 |
| 第9章 问题出在哪里？ | 卡住时应该修哪里？ | 找到直觉断点，而不是继续堆公式和步骤 | 误解定位、直觉断裂、反馈诊断 | 产品反馈要指出孩子“哪里看不见”，不是只判对错 |
| 第10章 视觉的艺术 | 数学为什么需要视觉化？ | 通过画图、变形、旋转、分组训练抽象可视化 | 空间想象、动态图像、结构可见 | 让关系、比例、数量、单位和变化在屏幕上可被看见 |
| 第11章 球和球拍 | 快直觉和慢逻辑如何协作？ | 使用“系统3”：让直觉和逻辑相互翻译、相互修正 | 系统1、系统2、系统3、慢反思 | 设计“先猜-再算-再解释-再修正”的学习闭环 |
| 第12章 没有窍门 | 技巧和理解是什么关系？ | 所谓技巧是看见结构后的压缩，不是绕过理解的捷径 | 结构发现、模式压缩、反技巧主义 | 不要直接给口诀；先让孩子经历结构被发现的过程 |
| 第13章 装傻 | 为什么要承认不懂？ | 装傻、追问和暴露困惑是数学进步的前提 | 羞耻克服、朴素问题、实践性 | 产品要把“我不懂”设计成入口，而不是失败标签 |
| 第14章 一门武术 | 数学能力如何练成？ | 数学是一门可训练的姿态和方法，类似武术 | 方法训练、纪律、反复练习 | 核心循环应训练观察、判断、验证和修正，而不是只测验 |
| 第15章 克服恐惧 | 数学恐惧如何破除？ | 恐惧是想象力的敌人；要允许慢、错、乱和重新开始 | 安全试错、失败暴露、情绪调节 | 失败反馈要具体、可恢复、可理解，避免惩罚身份 |
| 第16章 超常清晰 | 数学理解的终点是什么？ | 获得异常清晰的心理状态：对象、关系、边界和变化都清楚 | 清晰感、内在可视化、慢沉淀 | 学习目标应是“看清楚为什么”，不是只做对题 |
| 第17章 掌控宇宙 | 数学思维的边界在哪里？ | 数学很强大，但不能滑向过度理性化和脱离现实 | 理性边界、现实约束、偏执风险 | 游戏规则要回到现实经验和可验证结果，避免纯符号空转 |
| 第18章 房间里的大象 | 数学语言和日常语言有何差异？ | 数学需要形式化定义，但自然语言本身模糊、循环、依赖经验 | 定义、形式化、语义边界 | 给孩子解释“规则内精确”和“生活中模糊”的差别 |
| 第19章 抽象而灵活 | 抽象能力是否可塑？ | 抽象来自层级感知和神经可塑性，可以被经验持续重塑 | 神经网络类比、特征提取、抽象层级 | 通过多表征、多任务、多迁移让直觉变灵活 |
| 第20章 数学觉醒 | 数学学习最终改变什么？ | 数学是自我认知实践：观察自己的直觉、恐惧、想象和推理 | 自我探索、去神秘化、直觉觉醒 | 让学习者从“会算”进化到“会看见、会解释、会创造” |

## Detailed References

Use these files when the task names a specific chapter, concept, interaction pattern, or when more operational detail is needed than the high-level skeleton provides.

| Reference | Chapter |
| --- | --- |
| `references/chapter01.md` | 第1章 三个秘密 |
| `references/chapter02.md` | 第2章 勺子的正确用法 |
| `references/chapter03.md` | 第3章 思想的力量 |
| `references/chapter04.md` | 第4章 真正的魔法 |
| `references/chapter05.md` | 第5章 看不见的行动 |
| `references/chapter06.md` | 第6章 不读数学书 |
| `references/chapter07.md` | 第7章 孩童的姿态 |
| `references/chapter08.md` | 第8章 触觉理论 |
| `references/chapter09.md` | 第9章 问题出在哪里？ |
| `references/chapter10.md` | 第10章 视觉的艺术 |
| `references/chapter11.md` | 第11章 球和球拍 |
| `references/chapter12.md` | 第12章 没有窍门 |
| `references/chapter13.md` | 第13章 装傻 |
| `references/chapter14.md` | 第14章 一门武术 |
| `references/chapter15.md` | 第15章 克服恐惧 |
| `references/chapter16.md` | 第16章 超常清晰 |
| `references/chapter17.md` | 第17章 掌控宇宙 |
| `references/chapter18.md` | 第18章 房间里的大象 |
| `references/chapter19.md` | 第19章 抽象而灵活 |
| `references/chapter20.md` | 第20章 数学觉醒 |

## Core Progression

Use this progression as the backbone:

```text
破除天赋神话
-> 身体操作与工具内化
-> 心理图像生成
-> 表示系统改变可见性
-> 语言前的内在动作
-> 主动提问与非线性学习
-> 儿童姿态与羞耻解除
-> 触觉/经验 grounding
-> 直觉断点诊断
-> 视觉化训练
-> 系统3：直觉-逻辑对话
-> 结构发现而非技巧崇拜
-> 克服恐惧
-> 获得超常清晰
-> 理解形式化与现实边界
-> 数学觉醒
```

## Methodology Rules

Use these rules when applying the book to education, games, PRDs, prototypes, or curriculum.

1. **先让孩子看见，再让孩子计算。** If a concept cannot be perceived, moved, compared, or manipulated, do not expect stable symbolic reasoning.
2. **先操作，再命名。** A term introduced before experience becomes jargon.
3. **先定位直觉断点，再补知识点。** Wrong answers usually hide a broken image, missing unit, weak representation, or untested assumption.
4. **把符号当工具，不当起点。** Numerals, formulas, diagrams, tables, and language should expand cognition, not replace experience.
5. **让直觉和逻辑互译。** Ask learners to predict first, calculate second, explain third, and revise fourth.
6. **不要崇拜技巧。** A shortcut without structural discovery produces fragile performance.
7. **保护“装傻”。** Naive questions reveal the actual learning frontier.
8. **把恐惧当核心设计对象。** Fear blocks imagination; learning systems must make error recoverable and diagnostic.
9. **追求清晰感。** The goal is not merely correct output, but the learner's ability to say what changed, why it changed, and where the boundary is.
10. **保持现实 grounding。** Formal rules must eventually reconnect to perception, action, use, or verifiable consequence.

## Review Checklist

When reviewing a math game, learning product, PRD, or lesson with this skill, check:

- Does it break the “math is talent” myth?
- Does it create visible, manipulable mathematical objects before symbols?
- Does it let learners predict, act, observe feedback, explain, and revise?
- Does it diagnose the learner's intuition break, not only score right or wrong?
- Does it use multiple representations: object, picture, movement, language, symbol?
- Does it reward curiosity and naive questions?
- Does it make failure concrete, recoverable, and informative?
- Does it avoid turning learning into flashcards, quizzes, or method cards?
- Does it distinguish technique from structural understanding?
- Does it connect formal math back to real action, construction, measurement, or creation?

## Common Failure Modes

Avoid:

- Turning 《数学觉醒》/《数学直觉》 into generic encouragement.
- Treating “直觉” as guessing instead of trained, embodied, revisable perception.
- Teaching formulas before the learner has a mental image.
- Calling something “game-based learning” when it is only cards, quizzes, or rewards wrapped around exercises.
- Overusing terms like 系统1/系统2/系统3 without designing actual interaction loops.
- Punishing errors without revealing the broken representation.
- Replacing mathematical discovery with hints, tips, tricks, and answer templates.
- Confusing formal precision with child-facing clarity.
- Ignoring fear, shame, boredom, and identity threat in math learning.

## Response Style

Use Chinese for Chinese requests.

When the user asks for a source-faithful summary, state:

```text
以下按《数学觉醒》/《数学直觉》的章节结构整理；方法论表述是基于章节内容的抽象，不改变原书事实。
```

When applying this methodology to another domain, label claims as:

```text
事实：来自书中章节内容。
推断：从书中方法论迁移到当前问题。
假设：需要后续验证的判断。
建议：面向当前任务的可执行动作。
```
