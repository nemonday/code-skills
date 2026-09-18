# Case Schema

每个 Case 是 `bug-corpus/raw/BUG-XXX.md`：YAML frontmatter 承载全部结构化字段，正文留给自由补充（可空）。

## 目录

1. [编号](#编号)
2. [模板](#模板)
3. [字段说明](#字段说明)
4. [index.md（生成物）](#indexmd生成物)

## 编号

- `BUG-001` 起步，三位数字，超过 999 自然增长
- 建档时扫描 `raw/` 取最大编号 +1；只增，不复用，不补号

## 模板

```yaml
---
id: BUG-001
title: ""
type:
  - unknown
page: ""
feature: ""

problem:
  summary: ""
  trigger:
    - ""
  steps:
    - ""
  expected:
    - ""
  actual:
    - ""

root_cause:
  status: confirmed   # confirmed | unknown
  summary: ""
  details: ""

fix:
  summary: ""
  changes:
    - ""

verification:
  result: passed      # passed | unknown
  method:
    - ""
  before:
    - ""
  after:
    - ""

impact:
  user_impact: ""
  debugging_cost: ""
  severity: ""

why_missed:
  - ""

signals:
  ui: ""
  url: ""
  network: ""
  console: ""
  storage: ""
  timing: ""

automation:
  discoverability: human-manual
  potential: unknown
  possible_detection: ""

related_cases: []
tags: []
---

（正文：自由补充的原始记录，可空）
```

## 字段说明

**title** — 一句话，站在用户视角写现象（「选择店铺后筛选结果没有更新」），不写技术原因 —— 那是 root_cause 的事。

**type** — 聚类用，可多值：`interaction` `state` `lifecycle` `async` `persistence` `navigation` `performance` `consistency` `ux` `product-ambiguity` `technical-debt` `unknown`。拿不准就 `unknown`，不强行分类，将来可以重新整理。

**page / feature** — Bug 发生的页面与功能。项目身份由 corpus 所在仓库决定，因此不设 project 字段。

**problem.trigger** — 触发动作：`click` `input` `select` `submit` `refresh` `back` `forward` `reopen` `resize` `deep-link` `repeated-action` `timing` `unknown`。

**problem.steps** — 最小复现步骤，只保留理解这个 Bug 所需的关键步骤，不写成测试文档。

**root_cause** — 只写最终确认的根因。未确认：`status: unknown`，summary/details 留空。**绝不为了 Case 完整而猜。**

**fix** — 实际做了什么，不是「理论上应该怎么修」。

**verification** — 怎么确认修好的。无验证信息则 `result: unknown`，不假设已验证。`before` / `after` 是未来回归规则的种子，尽量保留。

**impact.debugging_cost** — 这个 Bug 为什么难查（例：UI 显示正确但数据错误，看页面发现不了）。对设计自动检测最有价值。

**why_missed** — 为什么正常开发 / Code Review / 普通测试没拦住它。这是 Runtime QA 该重点检测什么的直接来源。

**signals** — 修复过程中获得的运行时证据（UI / URL / Network / Console / Storage / Timing）。没有的留空，不补。

**automation** — 对未来自动化价值的判断：
- `discoverability`（最初怎么发现）：`human-manual` `browser-runtime` `automated-test` `static-analysis` `unknown`
- `potential`（浏览器 Agent 自动检测的机会）：`high` `medium` `low` `unknown` —— 评价可检测性，不是严重程度
- `possible_detection` — 具体检测思路，想清楚才写，不明确留空

**related_cases** — 相似历史案例的编号。建档时用 title 关键词 + tags 检索一遍 `raw/`。

**tags** — 轻量搜索词，不求统一，重复多了再收敛。

## index.md（生成物）

每次建档后**整体重建**，固定格式：

```markdown
# Bug Corpus Index

共 N 个案例。

| ID | 标题 | 类型 | 标签 | 相关 |
| --- | --- | --- | --- | --- |
| [BUG-001](raw/BUG-001.md) | 选择店铺后筛选结果没有更新 | async | store, race-condition | BUG-004 |
```
