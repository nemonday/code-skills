# code-skills

Skill 工厂：编写、打磨可分发给他人使用的 Agent Skills。Claude Code 是主力分发平台；skill 本体保持跨工具（workbuddy、Codex 等）可移植。

本仓库同时是 **DeepSeek Harness (DSH) 插件 monorepo**：`packages/` 下每个目录是一个独立插件包（pnpm workspace）。

## DSH 插件

| 包 | 用途 |
| --- | --- |
| [dsh-memory-hub](packages/dsh-memory-hub/) | 记忆区：DSH 侧边栏原生面板，集中查看/编辑全局与各工作区的 AGENTS.md |

安装方式见各包 README。

## 一键安装（skills + DSH 插件，跨平台）

clone 本仓库后，在仓库根目录执行一条命令，同时完成 skills 链接与 DSH 插件安装：

```bash
# macOS / Linux
./install.sh

# Windows (PowerShell)
.\install.ps1

# 或任何有 Node 的环境（DSH 自带 Node）
node install.mjs
```

行为：`skills/*` 以链接方式装进 `~/.dsh/skills/`（Windows 用 junction，免管理员权限；仓库更新即生效）；`packages/dsh-memory-hub` 注册为 DSH desktop profile 的 `file:` 依赖并 `pnpm install`。

选项：`--profile <名字>`（默认 desktop）、`--unlink`（一键卸载）。

## 安装（仅 skills，手工方式）

**Claude Code（整仓）**：

```
/plugin marketplace add nemonday/code-skills
/plugin install code-skills@code-skills
```

装好后以 `/code-skills:bug-corpus`、`/code-skills:beautify` 调用。更新跟随 `plugin.json` 里的 `version`，发布时递增它。

**任意工具（单个）**：拷贝 `skills/<name>/` 文件夹到你的 skills 目录

## Skills

| Skill | 用途 |
| --- | --- |
| [bug-corpus](skills/bug-corpus/) | Bug 修复后归档案例，蒸馏模式与不变量，为未来的 Runtime QA skill 收集资料 |
| [beautify](skills/beautify/) | 按指定视觉主题对既有前端做完整界面重构（8 套主题），重建结构 + Scoped CSS + 对比度 + 状态，并卸载旧主题残留 |

## 工厂约定

- 正文全中文，`name` 与文件名用英文
- 每个 skill 内部：`SKILL.md`（铁律 + 流程）→ `references/`（细节，用到才读）→ `docs/SPEC.md`（原始设计稿归档）
- 指令优先、脚本后置：脚本须零依赖，且失效时指令能兜底
- 新 skill 从 [docs/skill-template.md](docs/skill-template.md) 的骨架开工；发布前过一遍「质检五问」
- 术语表见 [CONTEXT.md](CONTEXT.md)，架构决策见 [docs/adr/](docs/adr/)

## 许可证

[MIT](LICENSE)
