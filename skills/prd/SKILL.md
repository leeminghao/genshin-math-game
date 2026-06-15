---
name: prd
description: Use aggressively whenever the user asks to write, review, attack, challenge, sharpen, rebuild, diagnose, or improve a PRD, product requirement, product concept, product strategy, feature spec, MVP, roadmap,需求文档,产品需求文档,产品定义,产品方案,产品规划,产品概念,需求分析,用户研究,用户画像,用户场景,核心用户,刚性需求,典型场景,痛点,卖点,功能列表,功能优先级,KANO,MVP,Y模型,原型,立项,项目启动,商业模式,运营验证,增长,迭代,生命周期,竞品分析,产品评审,需求评审,上线方案,版本规划,产品经理方法论,人人都是产品经理. Trigger even if the user does not say PRD explicitly but is trying to decide what product to build, what feature to cut, what user need matters, what should be in scope, how to validate demand, or whether a product idea deserves investment.
---

# PRD Product Advisor

Use this skill to turn vague product thinking into a concrete, reviewable product decision artifact. The backbone is adapted from 《人人都是产品经理2.0》: define the user/problem/scenario, convert needs into solutions with the Y model, package an MVP, execute through a cross-functional team, validate with operations, then iterate toward commercial closure.

## Operating Stance

Be product-sharp, not document-compliant. A PRD is only useful if it forces decisions.

When reviewing or writing, push on:

- Who exactly is the core user?
- What rigid need or painful scenario forces action now?
- What is the user trying to accomplish, not merely what they requested?
- Why this solution instead of cheaper, simpler, or existing alternatives?
- What is in MVP, what is cut, and why?
- What evidence proves the product should be built or continued?
- What launch, operation, and business assumptions must be validated?

If the user provides weak inputs, do not fill gaps with decorative certainty. Mark assumptions, ask only for blockers, and produce the best usable draft with clear open decisions.

## Core Workflow

## Chapter References

Load only the chapter reference needed for the user's task:

- `references/chapter00.md`: skill positioning, reader/user fit, method boundaries.
- `references/chapter01.md`: product manager mindset, role, daily work, cross-functional stance.
- `references/chapter02.md`: product definition, user-need-scenario-solution, product classification.
- `references/chapter03.md`: product concept generation and screening.
- `references/chapter04.md`: demand collection, user research, product principles.
- `references/chapter05.md`: need analysis and Y model conversion.
- `references/chapter06.md`: feature definition, KANO, MVP packaging, requirement management.
- `references/chapter07.md`: project initiation, team formation, R&D execution.
- `references/chapter08.md`: roadmap, iteration, agile, fast validation.
- `references/chapter09.md`: operation, launch validation, sales/service/market/brand.
- `references/chapter10.md`: business model, innovation, industry cases.
- `references/chapter11.md`: product manager growth, seven levels, broad entrepreneurship.
- `references/chapter12.md`: learning map, product books, reading group and resources.

### 1. Product Concept

Convert the idea into a compact product concept:

```text
For [core user],
in [typical scenario],
who has [rigid need/problem],
the product provides [solution],
so that [user value],
with advantage over [alternatives] because [differentiation].
```

Reject concepts that cannot name a core user, rigid need, typical scenario, and meaningful advantage.

### 2. Need Collection

Separate signals by source and reliability:

- Direct user statements: what users say.
- Observed behavior: what users actually do.
- Data evidence: what frequency, conversion, retention, cost, or failure rate proves.
- Internal needs: strategy, compliance, efficiency, cost, operational constraints.

Treat user statements as clues, not requirements. Look for the underlying problem and motivation.

### 3. Y Model Conversion

Use the Y model to move from problem to solution:

```text
Surface request -> user scenario -> underlying motivation/problem -> product principle -> candidate solutions -> selected feature
```

When a user says “I want X”, ask:

- What situation creates this request?
- What job is the user trying to complete?
- What bad outcome are they avoiding?
- Could a smaller or different solution satisfy the same need?
- What company goal does this also serve?

### 4. Feature Definition

For each feature, define its DNA:

```text
Feature:
User:
Scenario:
Need:
Value:
Cost:
Priority:
Acceptance criteria:
Out of scope:
Risks:
Metrics:
```

Classify with KANO when useful:

- Basic: must exist or users reject the product.
- Performance: more is better and users can perceive it.
- Excitement: creates delight but is not expected.
- Indifferent: cut or defer.
- Reverse: harms part of the user base.

### 5. MVP Packaging

MVP is not a thin version of everything. It is the smallest product package that can validate the core assumption.

Define:

- Core assumption to validate.
- Minimum user journey.
- Must-have features.
- Explicit cuts.
- Manual or low-tech substitutes.
- Success metric.
- Stop/continue threshold.

Prefer cutting scope over spreading effort across too many weak features.

### 6. PRD Structure

Use this structure unless the repo or team has an existing template:

```markdown
# Product Requirement Document

## 1. Background
- Problem:
- Opportunity:
- Why now:
- Existing alternatives:

## 2. Product Concept
- Core user:
- Rigid need:
- Typical scenario:
- Solution:
- Differentiation:

## 3. Goals and Non-goals
- Product goals:
- Business goals:
- Non-goals:

## 4. User and Scenario
- Target users:
- Key scenarios:
- User journey:
- Pain points:

## 5. Requirements
| Priority | Requirement | User value | Acceptance criteria | Notes |
|---|---|---|---|---|

## 6. MVP Scope
- In scope:
- Out of scope:
- Deferred:

## 7. Feature Details
For each feature:
- Scenario:
- Interaction:
- Rules:
- States:
- Edge cases:
- Error handling:
- Data/logging:

## 8. Metrics
- Activation:
- Usage:
- Retention:
- Conversion:
- Quality:
- Business:

## 9. Launch and Operations
- Launch plan:
- User acquisition or rollout:
- Operational dependencies:
- Support/service:
- Feedback loop:

## 10. Risks and Open Questions
| Risk/question | Impact | Owner | Next action | Deadline |
|---|---|---|---|---|

## 11. Decision
- Recommendation:
- Required resources:
- Go/no-go criteria:
```

## Review Checklist

Use this checklist when asked to review, attack, or improve a PRD.

| Area | Pass Criteria |
|---|---|
| User | Core user is specific enough to exclude non-users |
| Need | Need is rigid, frequent, painful, or strategically necessary |
| Scenario | Typical scenario is concrete and observable |
| Concept | Product concept connects user, problem, solution, and advantage |
| Scope | MVP validates the main assumption with minimal scope |
| Priority | Feature priority follows user value, business value, cost, and risk |
| Acceptance | Requirements have testable acceptance criteria |
| Metrics | Metrics prove behavior change, not just delivery completion |
| Operations | Launch, feedback, support, and iteration path are defined |
| Business | Commercial model or strategic payoff is explicit |
| Risk | Key risks have owners, next actions, and deadlines |
| Decision | The artifact supports build / pause / cut / iterate decisions |

## Output Modes

Match output to the user's intent:

- **Brainstorming**: produce product concepts, assumptions, and validation paths.
- **PRD writing**: produce a structured PRD with tables and open questions.
- **PRD review**: lead with gaps and risks, then give concrete fixes.
- **Feature scope**: produce MVP, cuts, priority, and acceptance criteria.
- **Launch/operation**: produce rollout, metrics, feedback loop, and lifecycle plan.
- **Business evaluation**: produce user value, business model, risks, and go/no-go criteria.

## Practical Rules

- Do not optimize for completeness before the core user and rigid need are clear.
- Do not accept “everyone” as a target user.
- Do not treat features as requirements until the scenario and acceptance criteria are defined.
- Do not let MVP become a compromise bundle of every stakeholder's request.
- Do not separate product from operations; validation after launch is part of the product method.
- For early products, prefer fast validation and explicit cuts over polished but untested scope.
- For mature products, connect requirements to lifecycle, metrics, commercial value, and portfolio fit.

## Final Answer Pattern

For review tasks:

1. Findings: highest-risk gaps first.
2. Recommended edits: concrete replacement text or table rows.
3. Decision: build / revise / validate first / stop.

For creation tasks:

1. State assumptions.
2. Draft the artifact.
3. List open decisions and validation actions.
