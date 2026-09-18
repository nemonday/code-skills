---
name: beautify
description: 把已有 HTML / React / Vue / Tailwind 前端按指定视觉主题做完整界面重构——重建组件骨架、Scoped CSS、文字对比度、交互状态，并卸载旧主题残留。内置 8 套高保真主题（classic-blue-white、apple-minimal、pixel-game、fresh-green、cyber-neon、neomorphism、retro-y2k、claymorphism）。何时用：用户说“美化这个页面”“换个风格”“套个主题”“重构 UI”“按 XX 风重做”，或提到上述任一主题名，或提供了前端项目/HTML 文件并要求视觉改版。何时不用：只要求新增功能或改业务逻辑而不动视觉；只要微调单个颜色值或单个 CSS 属性；从零设计全新页面而没有既有代码；设计海报、PPT、封面等非 Web 界面产物。
---

# Beautify

按用户指定的视觉主题，对既有前端做完整界面重构。为需要换肤但不愿重写业务的开发者服务。

不做的：不替用户选风格、不改业务逻辑、不做从零建站、不做非 Web 界面（海报、PPT、封面）。

“美化”在这里等于**结构重建**。只改 CSS 变量和颜色值不算完成。

## 前置条件

两项缺任意一项时，只追问缺的那项，不读文件、不改代码：

1. **项目路径** —— 前端项目根目录，或单个 HTML 文件路径。
2. **主题 ID** —— 用户明确指定，或从 `templates/` 中选定。

用户未指定主题时，列出下列选项并等待选择。不要替用户决定：

```text
1. classic-blue-white  经典商务蓝白风 —— 企业后台、运营工作台、数据看板
2. apple-minimal       Apple 极简高级风 —— 品牌官网、作品集、高端产品展示
3. pixel-game          像素游戏风 —— 游戏、活动页、年轻化营销
4. fresh-green         小清新水晶风 —— 健康、生活、个人工作台
5. cyber-neon          赛博霓虹风 —— AI 平台、开发者工具、科技 Dashboard
6. neomorphism         新拟态 —— 设置中心、智能家居、轻量控制台
7. retro-y2k           Retro / Y2K 千禧风 —— 时尚、音乐、潮牌、创作者
8. claymorphism        Claymorphism 粘土风 —— 儿童、教育、任务管理、趣味 App

同时请提供前端项目根目录路径。
```

## 铁律

1. 用户没选主题、没给路径，就不开始改。
2. 换主题先卸载旧主题，禁止新旧叠加。replace，不是 append。
3. 必须遍历整个项目和所有嵌套元素。父级通过不代表子级通过。
4. 保留业务逻辑、数据、API、路由、表单、事件、id、name、`data-*` 和测试选择器。
5. React / Vue / Tailwind 项目必须改 JSX / Vue 模板和组件结构，不允许只改 `index.css`。
6. 每个主题按验收锚点逐条核对，缺锚点即未完成。
7. 全部验证器输出 `Result: PASS` 且完成浏览器实际验收，才可交付。
8. 装饰层不得遮挡或拦截业务操作。

## 流程

### 1. 读当前主题资料

只读当前主题所需的两份，不要预加载全部主题：

```text
templates/<主题ID>.json
references/design-contracts.md   中该主题对应章节
```

按项目类型按需追加：

```text
React / Vue / Tailwind  → references/framework-adapter.md
含场景装饰资产的主题    → references/theme-assets.md
需做业务语义映射        → references/component-mapping.md
```

### 2. 扫描项目建立清单

记录：`package.json`、入口文件、路由、App 外壳、全局样式、所有页面、所有公共组件、表单、API、数据区域、交互区域。

产出清单：页面 / 路由 / 组件 / 业务数据 / 表单与交互 / 主题装饰。

### 3. 逐层遍历嵌套树

必经步骤。沿 DOM / JSX / Vue 模板逐层走：

```text
页面 → 区块 → 外层容器 → 子容器 → 小胶囊 / Tab → 链接容器 → 文字 / 图标 / 状态
```

每层核对：文字色、背景色、边框、圆角、阴影、字体、间距，以及 hover / focus / active / disabled / loading / empty / error。

重点：大胶囊里的小胶囊、嵌套 Tab、卡片内 Badge 与 Tag、细长链接容器、按钮内文字与图标、表格单元格状态元素、筛选器内部选中项。

```bash
node scripts/audit-nested-components.js <项目源码目录>
```

### 4. 审计旧主题残留

```bash
node scripts/audit-theme-residue.js <项目源码目录> <主题ID>
```

覆盖旧主题 HEX、Tailwind 颜色类、旧 class、旧 CSS import、旧组件、旧脚本、旧装饰节点、重复 Token 和后置覆盖。逐条迁移或确认业务语义。

### 5. 卸载旧主题

注入新主题前清除：旧 `<style data-beautify>`、旧主题脚本、旧装饰 DOM、旧根类、旧 CSS import、旧组件与 class、写死颜色。

业务数据、逻辑、API、路由、表单、事件一律保留。

### 6. 重构结构并注入主题

按当前主题契约改造：登录页或首屏、App 外壳、导航与工具栏、KPI 与统计卡、表格与列表、筛选器与 Tab、链接容器、Badge / Tag / 状态、按钮 / 弹窗 / 反馈、空 / 加载 / 错误状态。

注入 Scoped CSS（`.beautify-root`）、当前主题 Token、主题组件、场景资产、必要动态脚本。

### 7. 运行验证

```bash
node scripts/audit-theme-residue.js <项目源码目录> <主题ID>
node scripts/audit-nested-components.js <项目源码目录>
node scripts/validate-theme-isolation.js <项目根目录> <主题ID>
node scripts/validate-text-contrast.js <生成页面> <主题ID>
```

像素主题额外：

```bash
node scripts/validate-pixel-theme.js <项目根目录>
```

React 像素主题按需：

```bash
node scripts/install-pixel-react-assets.js <src目录>
```

任何验证器失败都回到对应步骤修复，不得跳过。

### 8. 浏览器实际验收

真正打开页面，检查 1440 / 1024 / 768px、所有路由、所有嵌套组件、文字与背景对比度、四态与 loading / empty / error、表格 / 链接 / 按钮 / 业务数据可用性、装饰是否遮挡业务、是否仍有旧主题残留。

### 9. 交付

验证器全绿 + 浏览器验收通过后才交付。回执必须列出：使用的主题；修改的页面与组件；遍历与迁移的嵌套元素；卸载的旧主题资产；业务逻辑保留情况；验证器结果；浏览器验收结果。

## 验收锚点

逐条核对，只有颜色变化即判定未完成：

| 主题 | 必须同时出现的锚点 |
|---|---|
| `pixel-game` | 首屏晴空像素世界（≥2 朵像素云 + 草地/土地 + 树或角色）；硬边面板；业务安全区不被装饰遮挡；内页属性卡与 Quest / HP / EXP 语义组件 |
| `cyber-neon` | Canvas 粒子 + 粒子连线 + 鼠标吸引光斑 + 双层准心 + 点击火花；暗底浅字 |
| `neomorphism` | 外凸双向阴影 + 内凹输入/进度槽 + active inset 按压；不能只是浅灰 |
| `retro-y2k` | Chrome 金属标题 + 粉紫青糖果渐变 + 光泽卡片 + 漂浮气泡 + 星芒 + 药丸按钮 |
| `claymorphism` | 大圆角 + 白色高光边 + 无模糊彩色多层位移阴影 + 粘土图标 + 软按压 |
| 其余主题 | 见 `references/design-contracts.md` 对应章节的「验收锚点」 |

## 深入

- [references/design-contracts.md](references/design-contracts.md) — 通用执行契约（结构重构规则、主题迁移清单、文本对比度契约、组件状态契约、验收门槛）+ 8 套主题各自的场景 / 视觉 DNA / 必须重构 / Do / Don't / 验收锚点。确定主题后只读该主题章节。
- [references/framework-adapter.md](references/framework-adapter.md) — React / Vue / Tailwind 项目的适配要求与 Tailwind 冲突类扫描清单。项目为框架工程时读。
- [references/theme-assets.md](references/theme-assets.md) — pixel-game 与 cyber-neon 的场景资产与动态锚点要求。仅这两个主题需要。
- [references/component-mapping.md](references/component-mapping.md) — 业务元素（统计数字、排名、流程、百分比、状态、Tab、链接、按钮、筛选器）到主题组件的映射表与递归规则。
- [SHARE_TO_AI.md](SHARE_TO_AI.md) — 给其他 AI 工具的一键转发指令与常见问题排查表。

## 主题资源

```text
templates/<主题ID>.json    8 套主题的设计 Token
demo-<主题ID>.html         8 套主题的完整效果参照，浏览器直接打开
generator.js               单文件生成器：node generator.js <主题ID> <输入HTML> [输出HTML]
scripts/                   审计、校验与构建脚本
scripts/cyber-neon.js      赛博主题 Canvas 动态锚点，需与输出 HTML 同级
scripts/build-new-themes.py    三套新主题的生成脚本
scripts/build-new-demos.py     三套新主题的 Demo 生成脚本
```

`generator.js` 会自动为页面添加 `.beautify-root` 作用域以避免污染宿主。但单靠它达不到 Demo 效果——必须按设计契约同步重构 HTML 组件骨架。
