# React / Vue / Tailwind 适配

## 必须读取

- package.json
- 入口文件
- 路由
- App 外壳
- 登录页
- 全局样式
- 公共组件

## 执行要求

1. 在真正覆盖所有路由页面的根容器加入 `.beautify-root`。
2. 切换主题前删除旧 CSS import、旧组件、旧 class、旧脚本和旧装饰。
3. 保留 API、路由、表单、校验、事件、id、name、data-* 和测试选择器。
4. 先扫描全项目旧主题残留，再修改 JSX/Vue 结构。
5. 沿组件树逐层迁移父容器、子容器、胶囊、Tab、链接、按钮、Badge、Tag 和文字。
6. 不允许只修改 index.css。
7. 构建完成后运行主题隔离、文字对比度和主题专属验证器。

## Tailwind 冲突扫描

根据目标主题检查并替换冲突类。像素主题重点检查：

```text
rounded-2xl
rounded-3xl
rounded-full
blur-*
backdrop-blur-*
shadow-2xl
transition-*
text-blue-*
bg-blue-*
border-blue-*
ring-blue-*
```

不仅扫描外层组件，也必须扫描嵌套子元素和链接容器。
