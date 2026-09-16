---
name: bug-corpus
description: Bug 归档器。仅当用户确认某个 Bug 已经修复完成（出现修复代码、测试通过、或用户明确说已修复）时使用：从当前会话上下文提取现象、根因、修复、验证，写入本项目 bug-corpus/raw/ 的结构化 Case，并重建 index.md。当用户说「总结这些 bug」「找找规律」「提炼不变量」时执行手动蒸馏。不用于发现、修复或调试 Bug。
---

# Bug Corpus

修复后归档器：Bug 修好之后，把这次修复的完整上下文沉淀成结构化 Case。它是**资料收集 skill** —— 积累真实案例，为未来的 Runtime QA skill（浏览器运行时自动检测）提供蒸馏材料。

它不发现 Bug、不修复 Bug、不指导修复。唯一职责：**在 Bug 解决之后归档**。

## 闸门：何时可以归档

必须先找到至少一项「已解决」的证据：修复代码已写入 / 测试通过 / 用户明确确认已修复。

- 无证据 → 不归档，回复「无法确认已修复，暂不归档」，停止。
- 归档必须发生在修复的**同一会话**内 —— 会话结束后上下文就没了，无法事后补录。

## 铁律

1. **只记录已确认的事实。** 根因未确认就写 `root_cause.status: unknown`，绝不推测，不把猜想写成 confirmed。
2. **一文件一案例，永不合并。** 两个相似的 Bug 是两次复发，各自建档，用 `related_cases` 关联。
3. **编号只增不复用。** 扫描 `raw/` 取最大编号 +1。
4. **raw/ 是唯一源。** `index.md` 和 `distilled/` 是生成物：每次建档/蒸馏后整体重建，永不手工增量编辑。
5. **优先从上下文提取**，不要求用户复述整个 Bug。
6. 不修 bug、不跑大规模测试、不为了找 bug 探索网页、不为字段完整而虚构信息。

## 建档流程

1. 过闸门（见上）。
2. 从会话上下文提取：现象、触发、预期 vs 实际、根因、修复内容、验证方式、修复前后差异。
3. 生成 `bug-corpus/raw/BUG-XXX.md` —— 字段定义与完整模板见 [references/schema.md](references/schema.md)。
4. 用标题关键词和 tags 检索历史 Case：相似则互相写入 `related_cases`，但新 Case 照建。
5. 重建 `bug-corpus/index.md`（格式见 schema.md 末尾）。
6. 向用户一句话报告：编号、标题、路径。

## 蒸馏（仅手动）

仅当用户主动要求（「总结一下这些 bug」「有没有什么规律」）才执行，绝不自动触发。流程与产物规范见 [references/distillation.md](references/distillation.md)。

## 目录约定（消费方项目内）

```
bug-corpus/
├── raw/            ← 唯一源：BUG-001.md ...
├── distilled/      ← 生成物：patterns.md / invariants.md / automation-opportunities.md
└── index.md        ← 生成物：案例索引
```

首次建档时自动创建。整个目录随项目进 git。
