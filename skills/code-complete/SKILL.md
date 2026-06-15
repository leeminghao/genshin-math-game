---
name: code-complete
description: Use aggressively when the user asks to write, review, refactor, debug, test, optimize, structure, clean up, harden, simplify, document, name, modularize, or improve code using Code Complete / 代码大全 / software construction principles. Trigger for 代码大全, Code Complete, 软件创建, software construction, construction, 编码规范, 代码质量, code quality, code review, 代码评审, review code, 重构, refactor, 可维护性, maintainability, readability, 可读性, complexity, 复杂度, detailed design, 详细设计, pseudocode, PDL, 子程序, routine, function design, 模块化, modularity, cohesion, 内聚, coupling, 耦合, information hiding, 信息隐藏, abstraction, ADT, 数据设计, data design, 变量命名, naming, variable scope, 全局变量, control flow, 控制结构, loop, condition, goto, defensive programming, 防错性编程, layout, style, comment, 注释, documentation, unit test, 单元测试, debugging, 调试, integration, 集成, incremental integration, performance tuning, 性能优化, code tuning, profiling, checklist, 质量保证, software quality, programmer habits, engineering discipline. Trigger even if the user only says the code feels messy, hard to read, hard to maintain, bug-prone, over-engineered, under-tested, too slow, too clever, or needs senior engineering review.
---

# Code Complete Advisor

Use this skill to apply 《代码大全》 / Code Complete software construction principles to real code work: implementation, review, refactoring, testing, debugging, and performance tuning.

Core thesis:

```text
把“写代码”升级为可控、可读、可测、可维护的软件创建工程。
```

Default workflow:

```text
Prerequisites -> design structure -> data design -> control flow -> readability -> quality checks -> test/debug -> performance only with evidence
```

## References

Load chapter references only when needed:

- `references/chapter01.md` to `references/chapter03.md` - 软件创建观、编程隐喻、编码前置条件。
- `references/chapter04.md` to `references/chapter07.md` - 子程序、模块化、高级设计。
- `references/chapter08.md` to `references/chapter12.md` - 数据设计、命名、变量和数据类型。
- `references/chapter13.md` to `references/chapter17.md` - 顺序、条件、循环和控制结构。
- `references/chapter18.md` to `references/chapter20.md` - 布局、注释、文档和工具。
- `references/chapter21.md` to `references/chapter27.md` - 项目规模、创建管理、质量、评审、测试、调试和集成。
- `references/chapter28.md` to `references/chapter30.md` - 性能调整策略、技术和软件优化。
- `references/chapter31.md` to `references/chapter33.md` - 程序员素养、开发方法和持续学习。

## Operating Stance

Be strict about construction quality:

- Do not accept code that merely "works" if it is hard to read, hard to test, or hard to change.
- Do not start coding before checking requirements, architecture assumptions, interfaces, constraints, and local conventions.
- Do not hide complexity behind clever syntax; make intent obvious.
- Do not optimize before measuring.
- Do not rely on comments to explain bad structure.
- Do not treat testing and debugging as afterthoughts; they are part of construction.
- Do not introduce abstractions unless they reduce real complexity or match the codebase.

When changing an existing codebase, prefer local patterns over generic advice.

## Core Construction Modules

### 1. Prerequisites Before Coding

Before implementation, check:

| Area | Review Question |
|---|---|
| Problem definition | What exact problem is being solved? |
| Requirements | What behavior, edge cases, and constraints are required? |
| Architecture | Which module owns this responsibility? |
| Interfaces | What inputs, outputs, errors, and side effects exist? |
| Language/tooling | What idioms, linters, test tools, and conventions already exist? |
| Risk | What can fail, regress, or become hard to change? |

If prerequisites are unclear, make the smallest defensible assumption and state it.

### 2. Routine And Module Design

Good routines are small units of clear intent.

Checklist:

- Name says what the routine does.
- Routine has one primary responsibility.
- Inputs and outputs are explicit.
- Side effects are limited and named.
- Error behavior is deliberate.
- Length is justified by cohesion, not convenience.
- Parameters are few, ordered logically, and not overloaded.
- The routine can be tested without excessive setup.

Module design:

- Use high cohesion and low coupling.
- Hide implementation details behind stable interfaces.
- Keep volatile decisions behind module boundaries.
- Separate policy from mechanics where it reduces change risk.
- Avoid circular dependencies and shared mutable global state.

### 3. Data Design

Data structure often determines code structure.

Checklist:

- Choose data types that model the problem, not just what is quick to store.
- Initialize data deliberately.
- Keep variable scope as small as practical.
- Give variables one purpose.
- Avoid global variables unless there is a strong local convention and clear lifecycle.
- Prefer named constants/enums over magic values.
- Use table-driven methods when they simplify branching.
- Use ADTs/objects when they protect invariants and hide representation.

Naming:

- Names should express meaning, unit, role, and domain language.
- Avoid vague names like `data`, `info`, `tmp`, `flag` unless scope is tiny and obvious.
- Avoid misleading names more aggressively than short names.
- Follow existing project naming conventions unless they are clearly harmful.

### 4. Control Flow

Control flow should be boring and obvious.

Checklist:

- Prefer straight-line code when possible.
- Keep conditionals simple; extract complex boolean expressions.
- Use guard clauses to reduce deep nesting when local style supports it.
- Ensure every branch has a clear purpose.
- Make loop initialization, termination, and mutation explicit.
- Treat recursion, early return, and unusual control constructs as tools, not tricks.
- Avoid `goto`-like flow unless it is the clearest error-cleanup pattern in that language.
- Measure and reduce cyclomatic complexity when logic becomes difficult to reason about.

### 5. Layout, Comments, And Documentation

Readable code is the first documentation.

Rules:

- Layout should reveal structure.
- Use whitespace to group related statements.
- Keep formatting consistent with the repository.
- Comment intent, constraints, tradeoffs, and non-obvious decisions.
- Do not comment obvious code.
- Replace many explanatory comments with better names or structure when possible.
- External docs should not duplicate code; they should explain contracts, usage, and design decisions.

Useful comment targets:

- Why this algorithm is used.
- Why a workaround exists.
- Why an edge case matters.
- What invariant must be preserved.
- What external dependency or protocol requires this shape.

### 6. Quality Construction

Quality is built throughout construction, not inspected in at the end.

Use:

- design review for risky structure
- code review for readability, defects, and maintainability
- unit tests for local behavior
- integration tests for contracts between modules
- assertions / defensive checks for impossible states
- logging and diagnostics for operability
- incremental integration to avoid big-bang failure

Review checklist:

| Area | What To Inspect |
|---|---|
| Correctness | Requirements, edge cases, error paths |
| Clarity | Names, structure, control flow |
| Maintainability | Coupling, cohesion, duplication, change risk |
| Testability | Isolation, deterministic behavior, observability |
| Safety | Input validation, resource cleanup, concurrency, state |
| Consistency | Local idioms, formatting, architecture boundaries |

### 7. Debugging

Debugging is hypothesis-driven, not random poking.

Process:

1. Reproduce the issue.
2. Stabilize the test case or observation.
3. Form a specific hypothesis.
4. Inspect or instrument the narrowest relevant path.
5. Fix the root cause, not only the symptom.
6. Add a regression test when practical.
7. Remove temporary instrumentation or convert it into useful diagnostics.

Do not trust a fix until the failing path and adjacent edge cases are verified.

### 8. Performance Tuning

Never optimize by instinct.

Process:

```text
Make it correct -> make it clear -> measure -> identify bottleneck -> tune the bottleneck -> re-measure -> protect readability
```

Inspect in this order:

1. Algorithm and data structure.
2. I/O, network, storage, database, allocation.
3. Repeated work and caching.
4. Loop-level and expression-level tuning.
5. Low-level rewrites only when profiling justifies them.

Reject performance changes that make code fragile without measurable gain.

### 9. Programmer Discipline

Good code comes from habits.

Expected posture:

- Be humble: assume code can be wrong.
- Be curious: inspect the existing system before changing it.
- Be honest: surface uncertainty and tradeoffs.
- Be cooperative: code is a team asset.
- Be constructively lazy: automate repeated work.
- Be consistent: conventions reduce cognitive cost.

## Output Modes

### Code Review

Lead with findings, ordered by severity.

For each finding include:

```text
file/line -> issue -> why it matters -> concrete fix
```

Focus on bugs, maintainability risks, missing tests, unclear ownership, bad abstractions, and performance claims without measurement.

### Implementation Plan

Use this structure:

```markdown
## Assumptions
## Construction Plan
## Files To Touch
## Risk And Tests
```

Keep the plan short unless the change is broad.

### Refactoring Advice

Prefer small, behavior-preserving steps:

1. Add characterization tests if behavior is risky.
2. Rename for intent.
3. Extract cohesive routines.
4. Reduce coupling.
5. Clarify data structures.
6. Simplify control flow.
7. Remove dead or duplicated code.

### Test Strategy

Map tests to risk:

| Risk | Test |
|---|---|
| Pure logic | Unit tests and boundary cases |
| Module contract | Integration tests |
| Bug fix | Regression test |
| Performance | Benchmark/profile before and after |
| UI/workflow | Scenario test |
| External dependency | Mock only where it preserves contract realism |

### Quality Checklist

Before finishing:

- Requirements are satisfied.
- Code follows local patterns.
- Names reveal intent.
- Data ownership is clear.
- Control flow is simple.
- Errors are handled deliberately.
- Tests cover the risky behavior.
- Performance changes are measured.
- No unrelated refactor is mixed in.

## Final Rule

The best construction work leaves the system easier to understand than it found it:

```text
correct first, clear always, optimized only with evidence.
```
