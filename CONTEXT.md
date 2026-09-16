# Code Skills

一个"skill 工厂"：在这里编写、打磨可分发给他人使用的 Agent Skills。Claude Code 是主力分发平台，但 skill 本体须保持对其他 coding 工具（workbuddy、Codex 等）的可移植性。

## Language

**Skill**:
一个可独立分发的 `SKILL.md` 文件夹（Agent Skills 开放格式），存放在 `skills/<name>/`，是别人安装或拷贝的最小单位。
_Avoid_: 插件、脚本、命令（与 Plugin 混用）

**Plugin**:
整个仓库的 Claude Code 安装壳（`.claude-plugin/plugin.json`），捆绑仓库内全部 skill 一次性安装。是分发容器，不是单个 skill 的同义词。
_Avoid_: 用来指单个 skill

## Bug Corpus

**Corpus（Bug Corpus）**:
一个项目仓库内、已修复 bug 的案例集合，随该项目独立存放。跨项目的规律属于蒸馏层的产物，不存放在单个 Corpus 内。
_Avoid_: bug 列表、issue 列表、日志

**Case（Raw Case）**:
一次真实发生、且已确认修复的 bug 的完整结构化记录，一文件一案例，永不合并。
_Avoid_: issue（那是 issue tracker 的单位）、bug report

**蒸馏（Distillation）**:
对 Corpus 的批量分析动作，仅在用户主动要求时执行；raw Case 是唯一源，蒸馏产物整体可再生成。
_Avoid_: 总结报告（一次性的东西）

**Pattern（模式）**:
从多个真实 Case 中提炼出的重复问题规律，必须注明来源 Case。
_Avoid_: 规则、猜想

**Invariant（不变量）**:
从多个 Case 提炼的候选正确性断言，是未来 Runtime QA 的检测依据，不是绝对规范。

**Automation Opportunity（自动化机会）**:
适合未来浏览器运行时自动检测的问题模式，是 Corpus 与 Runtime QA 之间的交接物。

**Runtime QA（未来 skill）**:
规划中的浏览器运行时自动检测 skill，消费 Invariant 与 Automation Opportunity。尚未存在；Corpus 是为它收集资料的skill，蒸馏产物是迭代它的输入。
