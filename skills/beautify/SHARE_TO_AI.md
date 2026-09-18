# Beautify Skill 一键美化转发指令

## 下载或更新

```bash
git clone https://gitee.com/chen-yurong040922/yr_-skills.git
# 已下载时进入仓库后执行 git pull
```

## 给 AI 的指令

把下面整段和待美化页面一起发给 AI：

```text
请使用 beautify-skill 重构并美化我提供的 HTML 页面。目标不是简单换色，而是让布局、信息层级、组件结构、交互状态和主题气质都达到官方 Demo 水平。

执行要求：
1. 读取 beautify-skill/SKILL.md。
2. 根据页面场景推荐或使用我指定的主题：
   - classic-blue-white：企业后台、运营工作台、数据看板
   - apple-minimal：品牌官网、作品集、高端产品展示
   - pixel-game：游戏、活动页、年轻化营销
   - fresh-green：健康、生活、个人工作台、自然主题
   - cyber-neon：AI 平台、开发者工具、科技 Dashboard
   - neomorphism：设置中心、智能家居、轻量控制台
   - retro-y2k：时尚、音乐、潮牌、创作者和年轻活动
   - claymorphism：儿童、教育、任务管理、趣味 App
3. 同时读取：
   - beautify-skill/templates/<主题ID>.json
   - beautify-skill/references/design-contracts.md 中对应主题的完整执行契约
4. 如果页面此前用过其他 Beautify 主题，先执行主题卸载：删除旧主题 CSS/import、`data-beautify-script`、动态装饰 DOM、`beautify-theme-*` 根类和旧主题专属组件外壳；保留业务数据与逻辑。禁止把新主题叠加到旧主题上。
5. 执行全项目旧主题残留审计：`node scripts/audit-theme-residue.js <项目源码目录> <目标主题ID>`。逐条处理 JSX/TSX/Vue/CSS 中的旧 HEX、Tailwind 蓝色类和旧主题 class；残留为 0 才能进入交付。
6. 执行嵌套组件审计：`node scripts/audit-nested-components.js <项目源码目录>`。沿 DOM/JSX 树逐层检查大胶囊里的小胶囊、链接容器、按钮、Badge、Tag 和每个子元素的颜色/背景/边框/文字/hover/focus/active；父级通过不代表子级通过。
7. 先分析页面语义，再重构组件：
   - 核心数字 → .stat-card KPI 卡
   - 有排名语义的 Top N → .leaderboard-list
   - 流程/审批/任务状态 → .steps-wrap
   - 百分比 → .progress-bar
   - 状态 → .badge
   - 多卡片 → 响应式 grid
   不要把所有列表都强行改成排行榜；保留原始数据、链接、表单、id、data 属性和事件绑定。
7. 运行：node generator.js <主题ID> 输入.html 输出.beautified.html
8. 按设计契约补齐主题专属结构、字体、间距、圆角、阴影、组件状态、Do/Don't 和主题锚点。
9. 主题锚点强制执行：
   - pixel-game：登录页或最大空白首屏必须重构为晴空像素世界，包含至少 2 朵像素云、草地/土地、树木或角色；登录表单与内页数据必须位于不透明业务安全区，装饰不可遮挡或拦截点击。React/Tailwind 项目必须修改 JSX，不能只改 index.css。
   - cyber-neon：浮动粒子、连线、鼠标吸引、36px 光斑、双层准心和点击火花，不能只有扫描线。
   - neomorphism：外凸双向阴影 + 内凹输入/进度槽 + active inset 按压，不能只是浅灰色。
   - retro-y2k：Chrome 金属标题 + 粉紫青糖果渐变 + 光泽卡片 + 漂浮气泡 + 星芒 + 药丸按钮，不能只是粉紫色。
   - claymorphism：大圆角 + 白色高光边 + 无模糊彩色多层位移阴影 + 粘土图标 + 软按压，不能只是粉嫩大圆角。
10. 实际打开页面验收，而不是只检查源码：
   - 页面结构明显改善，不是只换颜色
   - 核心组件形态接近 demo-<主题ID>.html
   - 1440px、1024px、768px 无溢出或错位
   - 原有功能、数据和交互保留
   - hover、focus-visible、active、disabled 及适用的 loading/empty/error 状态完整
   - pixel-game 实际看到登录页晴空、像素云、地面场景，且内页业务数据无遮挡
   - cyber-neon 实际看到粒子、连线、光斑、准心和点击火花
11. React 像素主题必须先运行 `node scripts/install-pixel-react-assets.js <项目src目录>`，在入口导入 `beautify/pixel-game.css`，并在登录页使用 `PixelLoginScene` 包裹原表单；不能只改 `index.css`。
12. 所有主题切换都必须运行 `node scripts/validate-theme-isolation.js <前端项目根目录> <目标主题ID>`；像素主题另需在改造前后运行 `node scripts/validate-pixel-theme.js <前端项目根目录>`。
13. 所有主题必须根据实际背景同步设置文字颜色：暗背景用浅色正文/次要文字，浅背景用深色正文/次要文字；必须检查表格、输入框、下拉框、按钮、徽章、弹窗和 placeholder，不能只改 body。
14. 对生成的单文件运行 `node scripts/validate-text-contrast.js <生成后的单文件 HTML/CSS> <主题ID>`；最终所有验证器必须输出 `Result: PASS`。
15. 最终回执必须列出：卸载的旧主题资产、实际修改的 JSX/模板文件、当前唯一主题标记、文字对比度检查、构建结果和验证器结果。只列颜色、字体、边框、按钮视为未完成。

输出：美化后的完整页面或项目文件，以及结构重构、主题锚点、构建和验证器的证据。
```

## 常见问题

| 现象 | 原因与处理 |
|---|---|
| 只是变了颜色 | 没有按设计契约重构 HTML 结构，要求重新执行第 4 步 |
| 商务蓝白仍然普通 | KPI、工具栏、状态 Badge、数据容器和信息层级没有一起重构 |
| 只有扫描线没有粒子 | Canvas 脚本未运行；检查输出同级 `scripts/cyber-neon.js` 及 script 标签 |
| 新拟态只是浅灰色 | 缺少凸起/凹陷双向阴影和 active inset 按压状态 |
| Y2K 只是粉紫渐变 | 缺少 Chrome 标题、气泡、星芒、光泽表面和药丸组件 |
| 粘土风只是大圆角 | 缺少白色高光边、彩色无模糊位移阴影和粘土图标 |
| 嵌套子元素仍保留旧风格 | 只改了父容器；运行 `audit-nested-components.js`，逐层迁移小胶囊、链接容器、按钮、文字和状态 |
| 重复运行后动画变卡 | 旧版重复注入脚本；使用最新版重新生成并运行主题隔离验证器 |
| 切换风格后残留上一风格 | 新主题被追加而旧 CSS、JSX、脚本或装饰未卸载；按 replace-not-stack 清理后运行 `validate-theme-isolation.js` |
| 某些页面仍保留旧蓝色 | 旧色被写死在 JSX/Tailwind，而不是主题变量；运行 `audit-theme-residue.js`，逐条迁移优惠金额、链接、时间标签、筛选器和操作按钮 |
| 破坏原系统布局 | 未使用 `.beautify-root` Scoped CSS，更新 Skill 后重新生成 |
