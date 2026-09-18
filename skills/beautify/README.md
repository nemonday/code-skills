# Beautify — 前端重构与主题设计工具包

Beautify 不是简单换色工具，而是一套“场景识别 → 设计契约 → HTML 组件重构 → Scoped CSS → 主题锚点 → 可视化验收”的前端美化 Skill。当前包含 8 套高保真主题。

## 主题

| 模板 ID | 主题 | 适合场景 | 关键锚点 |
|---|---|---|---|
| `classic-blue-white` | 商务蓝白 | 企业后台、经营看板 | 工具栏、KPI、业务表格、状态体系 |
| `apple-minimal` | Apple 极简 | 品牌官网、作品集 | 大留白、Bento、克制控件 |
| `pixel-game` | 像素游戏 | 游戏、活动、年轻化营销 | 硬边框、硬阴影、Quest/HP |
| `fresh-green` | 小清新水晶 | 健康、生活、个人工作台 | 水晶卡片、薄荷色、柔和氛围 |
| `cyber-neon` | 赛博霓虹 | AI、开发者工具、Web3 | Canvas 粒子、激光连线、光波鼠标 |
| `neomorphism` | Neomorphism 新拟态 | 设置中心、轻量控制台 | 凸起/凹陷双向阴影、按压反馈 |
| `retro-y2k` | Retro / Y2K 千禧风 | 时尚、音乐、潮牌、创作者 | Chrome 标题、糖果渐变、气泡星芒 |
| `claymorphism` | Claymorphism 粘土风 | 儿童、教育、任务管理 | 白色高光边、彩色位移阴影、软 3D |

## 使用方法

```bash
node generator.js <模板ID> <输入HTML> [输出HTML]
```

示例：

```bash
node generator.js neomorphism my-page.html my-page-soft.html
node generator.js retro-y2k my-page.html my-page-y2k.html
node generator.js claymorphism my-page.html my-page-clay.html
```

生成器会自动为页面添加 `.beautify-root` 作用域，避免主题污染宿主系统。真正达到 Demo 效果还需要按照 `references/design-contracts.md` 重构 HTML 组件骨架，禁止只注入 CSS。

## 主要文件

```text
beautify-skill/
├── SKILL.md
├── SHARE_TO_AI.md
├── generator.js
├── templates/                  # 8 套主题 JSON
├── references/design-contracts.md
├── scripts/cyber-neon.js
├── scripts/build-new-themes.py
├── scripts/build-new-demos.py
└── demo-*.html                 # 8 套主题完整预览
```

## 三套新主题的效果标准

- `neomorphism`：必须同时出现外凸表面、内凹输入/进度槽和按压 inset 状态。
- `retro-y2k`：必须同时出现糖果渐变、Chrome 标题、光泽卡片、漂浮气泡、星芒与药丸组件。
- `claymorphism`：必须同时出现大圆角、白色高光边、无模糊彩色多层位移阴影、粘土图标与按压反馈。

如果只有颜色变化，没有以上主题锚点，则不算完成。
