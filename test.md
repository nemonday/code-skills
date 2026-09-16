# Bug Corpus

## 一、这个 Skill 是做什么的

这个 Skill 用来记录：

> **已经被发现并修复的前端问题。**

它不负责发现 Bug。

它不负责修复 Bug。

它也不负责指导其他 Agent 怎么修 Bug。

它唯一负责的是：

> **在一个 Bug 被解决之后，把这次 Bug 的完整上下文、现象、原因、修复方式和经验沉淀下来。**

这些记录以后会被用于：

* 查找以前出现过的类似问题
* 发现 AI 开发前端时反复出现的问题模式
* 总结高频失败方式
* 提炼以后可以自动检测的规则
* 为未来的 Chrome MCP Runtime QA Skill 提供知识来源

---

# 二、这个 Skill 的输入

这个 Skill 默认在：

> **Bug 已经被其他 Agent / Skill / 人修复完成之后调用。**

输入可能来自：

* 当前对话上下文
* 之前的调试过程
* Agent 的修改记录
* 用户补充的信息
* Git diff
* commit 信息
* 测试结果
* 浏览器观察结果
* Console / Network 信息
* 修复前后的页面行为

用户不需要重新完整描述整个 Bug。

Skill 应该优先从现有上下文中提取信息。

---

# 三、核心原则

## 1. 记录“发生过什么”，而不是重新解决问题

调用本 Skill 时，默认前提是：

```text
Bug 已经解决。
```

不要重新进入：

```text
定位 Bug
分析 Bug
修改代码
验证修复
```

流程。

本 Skill 的工作是：

```text
读取上下文
↓
总结
↓
结构化
↓
归档
```

---

## 2. 优先从上下文提取，不要让用户重复描述

例如前面的对话已经包含：

```text
用户：
选择店铺以后没有生效。

Agent：
发现 storeId 没有正确更新。

修改：
修复 useEffect 依赖。

验证：
重新选择店铺正常。
```

此时不要再问：

> “请告诉我这个 Bug 是什么？”

直接从上下文整理 Case。

---

## 3. 只记录已经被确认的信息

尤其区分：

```text
现象
原因
修复
```

例如：

```text
现象：
选择店铺以后页面没有切换。

原因：
useEffect 缺少 storeId 依赖。

修复：
补充依赖并重新验证。
```

如果原因没有明确确认：

```yaml
root_cause:
  status: unknown
```

不要自行推测。

---

## 4. 保留“修复前”和“修复后”

一个完整的 Bug Case 不应该只有：

> Bug 是什么。

还应该知道：

> 修复以后发生了什么变化。

例如：

```text
修复前：
选择店铺后 UI 没有正确更新。

修复后：
选择店铺后 UI、列表数据和 URL 保持一致。
```

这部分以后非常适合转成自动化回归规则。

---

# 四、目录结构

```text
bug-corpus/
├── SKILL.md
├── raw/
│   ├── BUG-001.md
│   ├── BUG-002.md
│   └── ...
│
├── distilled/
│   ├── patterns.md
│   ├── invariants.md
│   └── automation-opportunities.md
│
└── index.md
```

---

# 五、Raw Case 是什么

`raw/` 保存每一次真实修复过的 Bug。

每一个 Case 对应：

> **一次真实发生、已经解决的问题。**

即使两个案例看起来非常相似，只要它们来自不同的真实修复过程，也应该分别保存。

因为以后我们需要知道：

> 这个问题到底重复发生过多少次。

---

# 六、Case 结构

每个 Case 使用：

```yaml
id: BUG-001

title: ""

status: resolved

type:
  - unknown

project:
  name: ""
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
  status: confirmed
  summary: ""
  details: ""

fix:
  summary: ""
  changes:
    - ""

verification:
  result: passed
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

notes: ""
```

---

# 七、字段说明

## id

唯一编号。

格式：

```text
BUG-001
BUG-002
BUG-003
```

编号只增加，不重复使用。

---

## title

一句话描述这个 Bug。

尽量使用：

> “用户看到什么问题”

而不是：

> “技术代码哪里有问题”

推荐：

```text
选择店铺后筛选结果没有更新
```

不推荐：

```text
useEffect 缺少 storeId 依赖
```

因为后者是原因。

---

# 八、problem

## summary

一句话总结问题。

例如：

```yaml
summary: 选择店铺后页面没有切换到对应店铺的数据。
```

---

## trigger

什么操作触发了问题。

例如：

```yaml
trigger:
  - click
  - select
```

常见值：

```text
click
input
select
submit
refresh
back
forward
reopen
resize
deep-link
repeated-action
timing
unknown
```

---

## steps

记录最小复现过程。

例如：

```yaml
steps:
  - 打开商品列表
  - 点击店铺选择器
  - 选择东京店
  - 等待列表更新
```

不要写成完整测试文档。

只保留理解这个 Bug 所需要的关键步骤。

---

## expected

修复之前，用户认为应该发生什么。

例如：

```yaml
expected:
  - 选择东京店后，当前筛选状态应该显示东京店
  - 商品列表应该更新为东京店的数据
```

---

## actual

修复之前实际发生什么。

例如：

```yaml
actual:
  - UI 显示选择成功
  - 商品列表没有更新
```

---

# 九、root_cause

记录最终确认的根因。

例如：

```yaml
root_cause:
  status: confirmed
  summary: 异步请求使用了旧的店铺状态。
  details: 更新筛选条件后，旧请求返回结果覆盖了最新状态。
```

如果上下文中没有明确确认根因：

```yaml
root_cause:
  status: unknown
  summary: ""
  details: ""
```

绝对不要为了让 Case 完整而猜。

---

# 十、fix

记录最终实际采用的修复。

例如：

```yaml
fix:
  summary: 修正店铺状态更新后的请求依赖。
  changes:
    - 调整请求依赖
    - 避免旧请求覆盖最新状态
```

这里记录：

> **实际做了什么**

而不是：

> “理论上应该怎么修。”

---

# 十一、verification

记录这个 Bug 是怎么确认已经修好的。

例如：

```yaml
verification:
  result: passed
  method:
    - 手动重新选择店铺
    - 切换多个店铺
    - 刷新页面后再次验证

  before:
    - 选择店铺后列表不更新

  after:
    - 选择店铺后列表正确更新
    - 连续切换店铺正常
```

如果没有验证信息：

```yaml
verification:
  result: unknown
```

不要假设已经验证。

---

# 十二、impact

记录 Bug 为什么值得留下来。

包括：

```yaml
impact:
  user_impact: ""
  debugging_cost: ""
  severity: ""
```

这里尤其记录：

> **这个 Bug 为什么让开发者觉得难处理。**

例如：

```yaml
debugging_cost: >
  UI 看起来已经显示为选中状态，但实际数据没有变化，
  所以单纯查看页面很难发现问题。
```

这对未来设计自动检测规则非常重要。

---

# 十三、why_missed

这是 Corpus 中非常重要的字段。

记录：

> **为什么这个问题在正常开发 / Code Review / 普通测试阶段没有被发现？**

例如：

```yaml
why_missed:
  - UI 显示状态是正确的
  - 正常首次进入页面没有问题
  - 只有快速连续切换两个店铺时才出现
```

或者：

```yaml
why_missed:
  - 正常进入详情页没有问题
  - 只有刷新页面才会触发
```

这个字段以后很可能直接变成：

> Runtime QA 应该重点检测什么。

---

# 十四、signals

记录修复过程中已经获得的运行时证据。

例如：

```yaml
signals:
  ui: "选中状态正确，但列表数据错误"
  url: "URL 中的 store 参数正确"
  network: "旧请求在新请求之后返回"
  console: ""
  storage: ""
  timing: "快速连续切换时更容易出现"
```

不要为了完整而补不存在的信息。

---

# 十五、automation

这是对这个案例未来自动化价值的记录。

```yaml
automation:
  discoverability: human-manual
  potential: high
  possible_detection: ""
```

## discoverability

记录这个 Bug 最初主要是怎么发现的：

```text
human-manual
browser-runtime
automated-test
static-analysis
unknown
```

---

## potential

判断未来是否适合自动化检测：

```text
high
medium
low
unknown
```

这里不是评价 Bug 严重程度。

而是评价：

> **Chrome / Browser Agent 是否有机会自动发现它。**

---

## possible_detection

尽量描述未来可以怎么发现。

例如：

```yaml
possible_detection: >
  选择店铺 A 后立即选择店铺 B，
  观察最终列表数据是否与 B 一致，
  防止旧请求结果覆盖新状态。
```

这个字段非常重要。

但只有当思路比较明确时才填写。

不明确就留空。

---

# 十六、type

用于后续统计和聚类。

可以使用：

```text
interaction
state
lifecycle
async
persistence
navigation
performance
consistency
ux
product-ambiguity
technical-debt
unknown
```

一个 Case 可以有多个 type。

不要因为分类体系现在不完整而强行分类。

未来可以重新整理。

---

# 十七、tags

Tags 用于轻量搜索。

例如：

```yaml
tags:
  - store
  - filter
  - async
  - race-condition
```

Tags 不需要严格统一。

如果以后出现大量重复 Tag，再统一。

---

# 十八、related_cases

记录相关的历史案例。

例如：

```yaml
related_cases:
  - BUG-004
  - BUG-011
```

不要合并 Raw Case。

即使两个 Bug 都是：

> “刷新后状态丢失”

也应该保留各自的真实上下文。

---

# 十九、调用这个 Skill 时应该怎么工作

当调用本 Skill 时，执行：

### 第一步：确定 Bug 已经解决

从上下文寻找：

* 修复代码
* 修复说明
* 测试结果
* 用户确认
* Agent 明确说明已修复

如果没有任何证据表明 Bug 已经解决：

不要开始修 Bug。

只记录：

```text
无法确定当前问题是否已经完成修复，因此暂时不归档。
```

---

### 第二步：收集修复上下文

优先从已有上下文提取：

```text
Bug 现象
触发方式
预期
实际结果
根因
修改内容
验证方式
修复前后差异
```

不要要求用户重新讲一遍。

---

### 第三步：创建 Raw Case

生成新的：

```text
BUG-XXX.md
```

保存真实案例。

---

### 第四步：避免过度蒸馏

单个 Case 只能说明：

> 这一次发生了什么。

不能因为一个 Case 就得出：

> AI 开发的前端普遍存在某种问题。

---

### 第五步：检查历史案例

判断是否存在类似案例。

如果存在：

```yaml
related_cases:
  - BUG-007
```

但仍然保留当前 Case。

---

### 第六步：适度添加自动化信息

如果从这个 Bug 中可以明显看出：

> 浏览器 Agent 将来可以通过某种用户操作发现它。

可以填写：

```yaml
automation:
  potential: high
```

以及可能的检测方式。

但不要为了让案例看起来“有未来价值”而强行分析。

---

# 二十、不要做的事情

这个 Skill 不应该：

* 主动修 Bug
* 修改项目代码
* 主动重构代码
* 主动运行大规模测试
* 为了寻找 Bug 而探索网页
* 猜测用户没有确认的产品需求
* 猜测根因
* 把 hypothesis 写成 confirmed
* 为了分类而分类
* 把一个案例夸大成普遍规律

它的角色只有：

> **Bug 修复完成后的知识归档器。**

---

# 二十一、蒸馏

当用户主动要求：

> “帮我总结一下这些 Bug。”

或者：

> “这些问题有没有什么规律？”

才进行蒸馏。

从 Raw Cases 中提取：

```text
高频问题
↓
共同触发条件
↓
共同失败模式
↓
共同原因
↓
为什么容易漏
↓
以后如何自动检测
```

---

# 二十二、Patterns

将重复出现的问题整理成模式。

例如多个案例：

```text
BUG-002
刷新后筛选条件消失

BUG-008
返回后筛选条件消失

BUG-014
重新进入页面后筛选条件消失
```

可以形成：

```text
模式：

用户上下文在页面生命周期变化后丢失
```

但必须明确这个模式来自哪些 Case。

---

# 二十三、Invariants

进一步从多个案例中提取可能的不变量。

例如：

```text
用户完成选择以后，
UI 显示的选择结果应该与实际生效的状态一致。
```

或者：

```text
页面导航发生以后，
已经明确设置且应该持久化的用户上下文不应该无故丢失。
```

注意：

> Invariant 是从真实案例中提炼出来的候选规则，不是绝对正确的产品规范。

---

# 二十四、Automation Opportunities

记录未来哪些问题适合交给 Chrome MCP Runtime QA。

例如：

```text
问题模式：
异步请求竞争导致旧数据覆盖新数据。

触发方式：
连续快速切换筛选条件。

浏览器可观察信号：
- UI 当前筛选条件
- 最终展示的数据
- Network 请求顺序
- URL 参数

自动化价值：
high
```

这样未来就可以把：

```text
Bug Corpus
↓
Automation Opportunities
↓
Chrome MCP QA Skill
```

连接起来。

---

# 二十五、最终目标

这个 Skill 最终应该形成一个循环：

```text
AI 开发
  ↓
发现 Bug
  ↓
其他 Skill / Agent 修复
  ↓
Bug Corpus
  ↓
记录真实案例
  ↓
积累
  ↓
发现重复模式
  ↓
提炼 Invariant
  ↓
形成 Runtime QA 检测策略
  ↓
Chrome MCP 自动检测
  ↓
发现新的 Bug
  ↓
修复
  ↓
重新进入 Bug Corpus
```

因此：

> **Bug Corpus 不是 QA Skill 的竞争者，而是未来 QA Skill 的知识来源。**

当前阶段不要追求自动发现 Bug。

最重要的是：

> **每一个真实修复过的 Bug，都不要白白过去。**

把它留下来。
让后面的案例越来越有价值。
让真正值得自动化的问题，从这些案例里面自己长出来。
