# 蒸馏流程（仅手动）

仅当用户主动要求时执行（「总结一下这些 bug」「有没有什么规律」「提炼不变量」）。绝不自动触发，绝不顺手做。

## 原则

- **多个 Case 才有规律。** 单个 Case 只能说明这一次发生了什么，不能产出 Pattern。
- **Pattern 必须注明来源 Case**（「来自 BUG-002、BUG-008、BUG-014」）。可追溯是 Corpus 的立身之本。
- **Invariant 是从真实案例提炼的候选断言，不是绝对正确的产品规范。**
- **产物整体重建**：`distilled/` 三个文件每次蒸馏全部重写，它们是 `raw/` 的派生物，不是独立文档。

## 流程

1. 读取全部 `raw/` Case。
2. 聚类：把 trigger、失败模式、why_missed 相似的 Case 归为一组。
3. 只把有 **≥2 个 Case** 支撑的结论写成 Pattern，注明来源编号。
4. 从 Pattern 提炼 Invariant 候选。
5. 挑出浏览器可观察信号充分、检测思路明确的，写成 Automation Opportunity。
6. 整体重写 `distilled/` 三个文件，向用户一句话报告本次新增或变化的 Pattern。

## 产物格式

**distilled/patterns.md**

```markdown
# Patterns

## P1: 用户上下文在页面生命周期变化后丢失
来源: BUG-002, BUG-008, BUG-014
共同触发: ...
共同失败模式: ...
为什么容易漏: ...
```

**distilled/invariants.md**

```markdown
# Invariants（候选，非规范）

## I1: 用户完成选择后，UI 显示的选择结果应与实际生效状态一致
来源 Pattern: P1
```

**distilled/automation-opportunities.md**

```markdown
# Automation Opportunities

## A1: 异步竞争导致旧数据覆盖新数据
问题模式: ...
触发方式: 连续快速切换筛选条件
浏览器可观察信号: UI 当前筛选条件 / 最终展示数据 / Network 请求顺序 / URL 参数
自动化价值: high
来源 Pattern: P1
```

这份文件是 Corpus 与未来 Runtime QA skill 的**交接物** —— 它就是那个 skill 的需求来源。
