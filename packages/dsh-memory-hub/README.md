# dsh-memory-hub

DeepSeek Harness (DSH) 插件：**记忆区** —— 在 DSH 界面里集中查看和编辑所有记忆文件。

## 功能

- 侧边栏原生面板（与工作区 / 设置同一套布局框架），点击 🧠 图标进入
- **总记忆**：`~/.dsh/AGENTS.md`（对所有会话生效）
- **工作区记忆**：自动发现所有有会话历史的工程目录，各自的 `AGENTS.md`
- 内置编辑器，保存即写盘，agent 下一次请求自动生效
- 绿点 = 已有记忆文件；写入空文件即自动创建

## 安装（本地路径）

```bash
# 方式一：profile 目录里加 file: 依赖
cd ~/.dsh/profiles/desktop
# package.json 的 dependencies 加：
#   "dsh-memory-hub": "file:/path/to/code-skills/packages/dsh-memory-hub"
# dsh.profile.bundles 加： "dsh-memory-hub"
pnpm install && 重启 DSH Desktop

# 方式二：dsh CLI（发布到 npm 后）
dsh plugin --profile desktop add dsh-memory-hub
```

## 技术结构

```
packages/dsh-memory-hub/
├── package.json        # dsh.bundle.patch + dsh.client 声明
├── cordis.patch.yml    # 插入 loader 行
└── lib/
    ├── index.js        # 宿主半：webServer.register 注册 /api/list、/api/file 路由
    └── client.js       # 浏览器半：sidebar.panellist + main keyed slot
```

- 工作区发现：扫描 `$DSH_HOME/sessions/` 目录名（路径编码：`/`→`-`、非 ASCII→`~U+HEX~`），用文件系统 DFS 消解连字符歧义
- 写接口有同源校验（`sec-fetch-site`），跨站请求 403，防任意网页改写本地记忆
- 单文件上限 2MB

## 要求

- DeepSeek Harness Desktop / dsh web（客户端模块机制，`platform: web`）
- 无构建步骤、零依赖；纯 ESM
