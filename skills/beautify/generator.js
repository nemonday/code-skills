/**
 * Beautify CSS 生成器
 * 读取模板 JSON，生成完整 CSS 样式，注入到 HTML 页面中
 *
 * 用法：
 *   1. 直接调用：node generator.js <模板名> <输入HTML路径> [输出路径]
 *   2. 作为模块：const { beautify } = require('./generator.js')
 *
 * 示例：
 *   node generator.js classic-blue-white ./my-page.html ./my-page-beautified.html
 */

const fs = require('fs')
const path = require('path')

// ========== 工具函数 ==========

/** 获取主题专属的动态 JS 交互脚本与 Canvas DOM */
function getThemeScript(templateName) {
  if (templateName === 'cyber-neon') {
    // 尝试读取外部独立 JS 文件（优先），失败则回退到内联脚本
    var externalJSPath = path.join(__dirname, 'scripts', 'cyber-neon.js')
    var externalScriptTag = null
    try {
      if (fs.existsSync(externalJSPath)) {
        // 保留外部文件作为可复用源码；生成 HTML 时会复制到输出目录，避免相对路径失效
        externalScriptTag = '\n<script src="scripts/cyber-neon.js" data-beautify-script="cyber-neon"></script>\n'
      }
    } catch (e) { /* 回退到内联 */ }

    var inlineScript = `\n<script data-beautify-script="cyber-neon">
(function() {
  const canvas = document.getElementById('cyberCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let sparks = [];
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function updateMouse(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
    if (Math.random() < 0.5) {
      sparks.push({
        x: mouse.x + (Math.random() - 0.5) * 12,
        y: mouse.y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 3 + 1.5,
        color: Math.random() < 0.5 ? '#00f0ff' : '#ff007a',
        life: 1.0
      });
    }
  }

  document.addEventListener('mousemove', updateMouse);
  document.addEventListener('mouseenter', updateMouse);
  document.addEventListener('mouseleave', () => { mouse.active = false; });

  document.addEventListener('click', (e) => {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: ['#00f0ff', '#ff007a', '#39ff14', '#7000ff'][Math.floor(Math.random() * 4)],
        life: 1.0
      });
    }
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 3 + 1.5;
      this.vx = (Math.random() - 0.5) * 0.9;
      this.vy = (Math.random() - 0.5) * 0.9;
      const colors = ['#00f0ff', '#ff007a', '#7000ff', '#00ff9d'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.7 + 0.3;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      if (mouse.active) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const force = (110 - dist) / 110;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.shadowBlur = 12;
      ctx.shadowColor = this.color;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
      ctx.restore();
    }
  }

  const count = Math.min(Math.floor((width * height) / 9000), 100);
  for (let i = 0; i < count; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      if (mouse.active) {
        const dxM = mouse.x - p1.x;
        const dyM = mouse.y - p1.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);
        if (distM < 110) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#00f0ff';
          ctx.strokeStyle = "rgba(0, 240, 255, " + (0.65 * (1 - distM / 110)) + ")";
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.restore();
        }
      }

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = "rgba(112, 0, 255, " + (0.28 * (1 - dist / 110)) + ")";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.03;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = s.color;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.life;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (mouse.active) {
      ctx.save();
      const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 36);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)');
      grad.addColorStop(0.5, 'rgba(255, 0, 122, 0.15)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 36, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowColor = '#ff007a';
      ctx.strokeStyle = '#ff007a';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }
  animate();
})();
</script>\n`

    return {
      canvasDOM: '<!-- beautify-anchor:start:cyber-neon -->\n<canvas id="cyberCanvas" data-beautify-anchor="cyber-neon" style="position:fixed; inset:0; pointer-events:none; z-index:90;"></canvas>\n<div class="cyber-dynamic-bg" data-beautify-anchor="cyber-neon"></div>\n<div class="cyber-scanline" data-beautify-anchor="cyber-neon"></div>\n<!-- beautify-anchor:end:cyber-neon -->\n',
      // 优先使用外部文件引用（一行搞定）；若无 scripts/cyber-neon.js 文件则回退到完整内联脚本
      scriptTag: externalScriptTag || inlineScript
    }
  }
  return null
}

/**
 * 作用域限定转换函数，防止 Beautify CSS 污染宿主应用全局样式
 * @param {string} selectorStr - 原始选择器（如 "table, th, td" 或 ".card" 或 "body" 或 ":root"）
 * @param {string} [scope] - 作用域类名，默认 '.beautify-root'
 */
function scopeSelectors(selectorStr, scope = '.beautify-root') {
  if (!scope) return selectorStr
  return selectorStr.split(',').map(s => {
    s = s.trim()
    if (!s) return ''
    if (s === 'body' || s === ':root') return `${scope}, body.beautify-full-page, body.beautify-root`
    if (s.startsWith(scope) || s.startsWith('@')) return s
    // 同时支持作用域类位于祖先节点，以及与主题类位于同一根节点。
    // 例如 <main class="beautify-root pixel-login-scene"> 必须匹配像素登录场景样式。
    if (/^[.#\[]/.test(s)) return `${scope}${s}, ${scope} ${s}`
    return `${scope} ${s}`
  }).filter(Boolean).join(', ')
}

/** 解析变量引用，如 {colors.primary.500} → 实际颜色值 */
function resolveToken(obj, pathStr) {
  const keys = pathStr.replace(/[{}]/g, '').split('.')
  let val = obj
  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) val = val[k]
    else return pathStr // 找不到就原样返回
  }
  return String(val)
}

/** 递归解析对象中所有变量引用 */
function resolveAll(obj, tokens) {
  if (typeof obj === 'string') {
    // 替换所有 {xxx.yyy.zzz} 形式的引用
    return obj.replace(/\{([\w.]+)\}/g, (_, key) => resolveToken(tokens, key))
  }
  if (Array.isArray(obj)) return obj.map(v => resolveAll(v, tokens))
  if (obj && typeof obj === 'object') {
    const result = {}
    for (const [k, v] of Object.entries(obj)) result[k] = resolveAll(v, tokens)
    return result
  }
  return obj
}

// ========== CSS 生成 ==========

/** 从模板生成 CSS 变量块 */
function generateCSSVariables(tokens, cssVars, scope = '.beautify-root') {
  const lines = [`${scopeSelectors(':root', scope)} {`]
  const flat = tokens.colors || {}
  const typo = tokens.typography || {}
  const spacing = tokens.spacing || {}
  const radii = tokens.radii || {}
  const shadows = tokens.shadows || {}
  const anim = tokens.animation || {}

  // 展平写入
  if (cssVars) {
    for (const [key, val] of Object.entries(cssVars)) {
      lines.push(`  ${key}: ${val};`)
    }
  }

  // 文字颜色是主题契约的一部分：背景深浅改变时，正文、次要文本、控件文字和占位符必须同步切换。
  const text = tokens.text || {}
  lines.push(`  --text-primary: ${cssVars?.['--text-primary'] || text.primary || '#17233d'};`)
  lines.push(`  --text-muted: ${cssVars?.['--text-muted'] || text.muted || '#6b7a99'};`)
  lines.push(`  --text-on-dark: ${text.onDark || '#f5f9ff'};`)
  lines.push(`  --text-on-light: ${text.onLight || '#17233d'};`)
  lines.push(`  --text-placeholder: ${text.placeholder || cssVars?.['--text-muted'] || '#6b7a99'};`)

  lines.push('}')
  return lines.join('\n')
}

/** 从模板生成组件样式 */
function generateComponentStyles(components, resolvedFull, tokens, scope = '.beautify-root') {
  const resolved = resolvedFull.components || {}
  const lines = []
  const s = (sel) => scopeSelectors(sel, scope)

  // 按钮
  if (components.button) {
    const btn = resolved.button
    if (btn.primary) {
      lines.push(`${s('.btn, .btn.primary')} {`)
      lines.push(`  background: ${btn.primary.bg};`)
      lines.push(`  color: ${btn.primary.text};`)
      lines.push(`  border: ${btn.primary.border || '0'};`)
      lines.push(`  border-radius: ${btn.primary.radius};`)
      lines.push(`  padding: ${btn.primary.padding};`)
      lines.push(`  font-size: ${btn.primary.fontSize};`)
      lines.push(`  font-weight: ${btn.primary.fontWeight};`)
      lines.push(`  cursor: pointer;`)
      lines.push(`  transition: all ${tokens.animation?.duration?.normal || '0.25s'} ${tokens.animation?.easing?.default || 'ease'};`)
      lines.push(`  display: inline-flex;`)
      lines.push(`  align-items: center;`)
      lines.push(`  gap: 6px;`)
      if (btn.primary.shadow) lines.push(`  box-shadow: ${btn.primary.shadow};`)
      if (btn.primary.backdropFilter) {
        lines.push(`  backdrop-filter: ${btn.primary.backdropFilter};`)
        lines.push(`  -webkit-backdrop-filter: ${btn.primary.backdropFilter};`)
      }
      lines.push(`  position: relative; overflow: hidden;`)
      lines.push(`}`)
      lines.push(`${s('.btn.primary:hover')} {`)
      lines.push(`  background: ${btn.primary.hover?.bg || btn.primary.bg};`)
      if (btn.primary.hover?.shadow) lines.push(`  box-shadow: ${btn.primary.hover.shadow};`)
      if (btn.primary.hover?.transform) lines.push(`  transform: ${btn.primary.hover.transform};`)
      lines.push(`}`)
      lines.push(`${s('.btn.primary:active')} {`)
      if (btn.primary.active?.transform) lines.push(`  transform: ${btn.primary.active.transform};`)
      lines.push(`  transition-duration: ${tokens.animation?.duration?.fast || '0.15s'};`)
      lines.push(`}`)
    }
    if (btn.secondary) {
      lines.push(`${s('.btn.secondary')} {`)
      lines.push(`  background: ${btn.secondary.bg};`)
      lines.push(`  color: ${btn.secondary.text};`)
      lines.push(`  border: ${btn.secondary.border || '0'};`)
      lines.push(`  border-radius: ${btn.secondary.radius};`)
      lines.push(`  padding: ${btn.secondary.padding};`)
      lines.push(`  font-size: ${btn.secondary.fontSize};`)
      lines.push(`  font-weight: ${btn.secondary.fontWeight};`)
      lines.push(`  cursor: pointer;`)
      lines.push(`  transition: all ${tokens.animation?.duration?.normal || '0.25s'} ${tokens.animation?.easing?.default || 'ease'};`)
      lines.push(`  display: inline-flex; align-items: center; gap: 6px;`)
      if (btn.secondary.shadow) lines.push(`  box-shadow: ${btn.secondary.shadow};`)
      if (btn.secondary.backdropFilter) {
        lines.push(`  backdrop-filter: ${btn.secondary.backdropFilter};`)
        lines.push(`  -webkit-backdrop-filter: ${btn.secondary.backdropFilter};`)
      }
      lines.push(`}`)
      lines.push(`${s('.btn.secondary:hover')} {`)
      lines.push(`  background: ${btn.secondary.hover?.bg || btn.secondary.bg};`)
      if (btn.secondary.hover?.border) lines.push(`  border: ${btn.secondary.hover.border};`)
      if (btn.secondary.hover?.shadow) lines.push(`  box-shadow: ${btn.secondary.hover.shadow};`)
      lines.push(`}`)
    }
  }

  // 卡片
  if (components.card) {
    const card = resolved.card
    if (card.default) {
      lines.push(`${s('.card')} {`)
      lines.push(`  background: ${card.default.bg};`)
      lines.push(`  border: ${card.default.border};`)
      lines.push(`  border-radius: ${card.default.radius};`)
      lines.push(`  box-shadow: ${card.default.shadow};`)
      lines.push(`  padding: ${card.default.padding};`)
      if (card.default.backdropFilter) {
        lines.push(`  backdrop-filter: ${card.default.backdropFilter};`)
        lines.push(`  -webkit-backdrop-filter: ${card.default.backdropFilter};`)
      }
      lines.push(`  transition: all ${tokens.animation?.duration?.normal || '0.25s'} ${tokens.animation?.easing?.default || 'ease'};`)
      lines.push(`  position: relative;`)
      lines.push(`}`)
      if (card.default.hover) {
        lines.push(`${s('.card:hover')} {`)
        if (card.default.hover.shadow) lines.push(`  box-shadow: ${card.default.hover.shadow};`)
        if (card.default.hover.transform) lines.push(`  transform: ${card.default.hover.transform};`)
        lines.push(`}`)
      }
    }
    if (card.soft) {
      lines.push(`${s('.card.soft')} {`)
      lines.push(`  background: ${card.soft.bg};`)
      lines.push(`  border: ${card.soft.border};`)
      lines.push(`  border-radius: ${card.soft.radius};`)
      lines.push(`  box-shadow: ${card.soft.shadow};`)
      lines.push(`  padding: ${card.soft.padding};`)
      if (card.soft.backdropFilter) {
        lines.push(`  backdrop-filter: ${card.soft.backdropFilter};`)
        lines.push(`  -webkit-backdrop-filter: ${card.soft.backdropFilter};`)
      }
      lines.push(`}`)
    }
  }

  // 输入框与 Custom Select
  if (components.input) {
    const inp = resolved.input
    lines.push(`${s('input, textarea')} {`)
    lines.push(`  background: ${inp.bg};`)
    lines.push(`  border: ${inp.border};`)
    lines.push(`  border-radius: ${inp.radius};`)
    lines.push(`  padding: ${inp.padding};`)
    lines.push(`  font-size: ${inp.fontSize};`)
    lines.push(`  color: var(--text-primary, inherit);`)
    if (inp.shadow) lines.push(`  box-shadow: ${inp.shadow};`)
    if (inp.backdropFilter) {
      lines.push(`  backdrop-filter: ${inp.backdropFilter};`)
      lines.push(`  -webkit-backdrop-filter: ${inp.backdropFilter};`)
    }
    lines.push(`  outline: none;`)
    lines.push(`  transition: all ${tokens.animation?.duration?.normal || '0.25s'} ${tokens.animation?.easing?.default || 'ease'};`)
    lines.push(`}`)
    if (inp.focus) {
      lines.push(`${s('input:focus, textarea:focus')} {`)
      lines.push(`  border-color: ${inp.focus.border};`)
      if (inp.focus.bg) lines.push(`  background: ${inp.focus.bg};`)
      if (inp.focus.shadow) lines.push(`  box-shadow: ${inp.focus.shadow};`)
      lines.push(`}`)
    }
    // 原生 Select 样式
    lines.push(`${s('select')} { background: ${inp.bg}; color: var(--text-primary, #1d1d1f); border: ${inp.border}; border-radius: ${inp.radius}; padding: ${inp.padding}; font-size: ${inp.fontSize}; outline: none; transition: all 0.2s; }`)
    lines.push(`${s('select:focus')} { border-color: ${inp.focus?.border || 'var(--primary)'}; box-shadow: ${inp.focus?.shadow || 'none'}; }`)
    lines.push(`${s('select option')} { background: var(--bg-card, #ffffff); color: var(--text-primary, #1d1d1f); padding: 8px; }`)

    // 高颜值 Custom Select & Dropdown 下拉框（结合主题 dropdown 配置）
    const drp = resolved.dropdown || {}
    const drpBg = drp.bg || 'var(--bg-card, #ffffff)'
    const drpBorder = drp.border || '1px solid var(--border-default, rgba(0,0,0,0.1))'
    const drpShadow = drp.shadow || '0 12px 36px rgba(0,0,0,0.15)'
    const drpHover = drp.itemHover || 'var(--primary-light, rgba(0,240,255,0.15))'
    const drpHoverText = drp.itemHoverText || 'var(--primary, #00f0ff)'
    const drpRadius = drp.radius || 'var(--radius-lg, 14px)'
    const drpItemRadius = drp.itemRadius || 'var(--radius-md, 10px)'
    const drpItemPadding = drp.itemPadding || '10px 14px'

    lines.push(`${s('.custom-select')} { position: relative; width: 100%; user-select: none; }`)
    lines.push(`${s('.custom-select-trigger')} { display: flex; align-items: center; justify-content: space-between; padding: ${inp.padding}; background: ${inp.bg}; border: ${inp.border}; border-radius: ${inp.radius}; font-size: ${inp.fontSize}; color: var(--text-primary, #1d1d1f); cursor: pointer; transition: all 0.2s; ${inp.backdropFilter ? 'backdrop-filter: ' + inp.backdropFilter + '; -webkit-backdrop-filter: ' + inp.backdropFilter + ';' : ''} }`)
    lines.push(`${s('.custom-select-trigger:hover')} { background: ${drpHover}; border-color: ${drpHoverText}; color: ${drpHoverText}; }`)
    lines.push(`${s('.custom-select-options, .dropdown-menu, .dropdown-menu-box')} { display: none; position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: ${drpBg}; backdrop-filter: ${drp.backdropFilter || 'blur(20px)'}; -webkit-backdrop-filter: ${drp.backdropFilter || 'blur(20px)'}; border: ${drpBorder}; border-radius: ${drpRadius}; box-shadow: ${drpShadow}; z-index: 200; padding: 6px; animation: selectSlideDown 0.2s ease; }`)
    lines.push(`${s('.custom-select.open .custom-select-options, .dropdown-wrap.open .dropdown-menu, .dropdown-wrap.open .dropdown-menu-box')} { display: block; }`)
    lines.push(`${s('.custom-select-option, .dropdown-item')} { padding: ${drpItemPadding}; border-radius: ${drpItemRadius}; font-size: 13px; color: var(--text-primary, #1d1d1f); cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: space-between; }`)
    lines.push(`${s('.custom-select-option:hover, .custom-select-option.selected, .dropdown-item:hover')} { background: ${drpHover}; color: ${drpHoverText}; font-weight: 500; }`)
    lines.push(`${s('.custom-select-option.selected:after')} { content: "✓"; font-size: 12px; color: ${drpHoverText}; }`)
  }

  // 表格
  if (components.table) {
    const tbl = resolved.table
    lines.push(`${s('table')} { width: 100%; border-collapse: separate; border-spacing: 0; font-size: ${tbl.fontSize}; }`)
    lines.push(`${s('th')} { background: ${tbl.headerBg}; color: ${tbl.headerText}; font-weight: ${tbl.headerWeight}; padding: ${tbl.cellPadding}; border-bottom: ${tbl.border}; }`)
    lines.push(`${s('td')} { padding: ${tbl.cellPadding}; border-bottom: ${tbl.border}; color: inherit; }`)
    lines.push(`${s('tr:hover td')} { background: ${tbl.rowHover}; }`)
  }

  // 标签 (tab)
  if (components.tab) {
    const tab = resolved.tab
    lines.push(`${s('.tab')} { border-radius: ${tab.radius}; padding: ${tab.padding}; font-size: ${tab.fontSize}; background: ${tab.inactive?.bg}; color: ${tab.inactive?.text}; cursor: pointer; border: 0; transition: all ${tokens.animation?.duration?.normal || '0.25s'} ${tokens.animation?.easing?.default || 'ease'}; }`)
    lines.push(`${s('.tab:hover')} { background: ${tab.hover?.bg}; }`)
    lines.push(`${s('.tab.active')} { background: ${tab.active?.bg}; color: ${tab.active?.text}; }`)
  }

  // 标记 (badge)
  if (components.badge) {
    const badge = resolved.badge
    lines.push(`${s('.badge')} { display: inline-block; border-radius: ${badge.radius}; padding: ${badge.padding}; font-size: ${badge.fontSize}; font-weight: ${badge.fontWeight}; }`)
    if (badge.variants) {
      if (badge.variants.default) lines.push(`${s('.badge')} { background: ${badge.variants.default.bg}; color: ${badge.variants.default.text}; }`)
      if (badge.variants.success) lines.push(`${s('.badge.green, .badge.success')} { background: ${badge.variants.success.bg}; color: ${badge.variants.success.text}; }`)
      if (badge.variants.warning) lines.push(`${s('.badge.orange, .badge.warning')} { background: ${badge.variants.warning.bg}; color: ${badge.variants.warning.text}; }`)
      if (badge.variants.danger) lines.push(`${s('.badge.red, .badge.danger')} { background: ${badge.variants.danger.bg}; color: ${badge.variants.danger.text}; }`)
    }
  }

  // 智能提示
  if (components.insight) {
    const ins = resolved.insight
    lines.push(`${s('.insight')} { background: ${ins.bg}; color: ${ins.text}; border-left: ${ins.border}; border-radius: ${ins.radius}; padding: ${ins.padding}; font-size: ${ins.fontSize}; }`)
  }

  // 折叠面板
  if (components.accordion) {
    const acc = resolved.accordion
    lines.push(`${s('.accordion-item')} { border: ${acc.border}; border-radius: ${acc.radius}; overflow: hidden; }`)
    lines.push(`${s('.accordion-header')} { display: flex; align-items: center; justify-content: space-between; padding: ${acc.headerPadding}; cursor: pointer; background: ${acc.headerBg}; font-size: 13px; font-weight: 600; transition: all 0.2s; }`)
    lines.push(`${s('.accordion-header:hover')} { background: ${acc.headerHover}; }`)
    lines.push(`${s('.accordion-body')} { max-height: 0; overflow: hidden; transition: ${acc.animation}; padding: 0 16px; background: ${acc.bodyBg}; font-size: 13px; color: ${acc.bodyText}; line-height: 1.6; }`)
    lines.push(`${s('.accordion-body.open')} { max-height: 120px; padding: ${acc.bodyPadding}; }`)
    lines.push(`${s('.accordion-header .acc-arrow')} { transition: transform 0.3s; color: ${acc.arrow?.color}; font-size: 12px; }`)
    lines.push(`${s('.accordion-header .acc-arrow.open')} { transform: rotate(${acc.arrow?.rotate || '180deg'}); }`)
  }

  // 弹窗
  if (components.modal) {
    const modal = resolved.modal
    const hBorder = modal.headerBorder === 'none' ? 'border-bottom: none;' : 'border-bottom: 1px solid var(--border-default, #e4ecf7);'
    const fBorder = modal.footerBorder === 'none' ? 'border-top: none;' : 'border-top: 1px solid var(--border-default, #e4ecf7);'
    lines.push(`${s('.modal-overlay')} { display: none; position: fixed; inset: 0; background: ${modal.overlayBg}; z-index: 1000; justify-content: center; align-items: center; animation: modalFadeIn 0.2s; }`)
    lines.push(`${s('.modal-overlay.show')} { display: flex; }`)
    lines.push(`${s('.modal-box')} { background: ${modal.boxBg}; border-radius: ${modal.radius}; width: 420px; max-width: 90vw; box-shadow: ${modal.shadow}; animation: modalSlideUp 0.25s; }`)
    lines.push(`${s('.modal-header')} { display: flex; justify-content: space-between; align-items: center; padding: ${modal.headerPadding}; ${hBorder} }`)
    lines.push(`${s('.modal-body')} { padding: ${modal.bodyPadding}; font-size: 13px; color: var(--text-muted, #6b7a99); line-height: 1.6; }`)
    lines.push(`${s('.modal-footer')} { display: flex; justify-content: flex-end; gap: 10px; padding: ${modal.footerPadding}; ${fBorder} }`)
    lines.push(`${s('.modal-close')} { width: 28px; height: 28px; border-radius: 50%; border: 0; background: transparent; cursor: pointer; font-size: 16px; color: var(--text-muted, #6b7a99); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }`)
    lines.push(`${s('.modal-close:hover')} { background: rgba(0,0,0,0.05); }`)
    lines.push(`@keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }`)
    lines.push(`@keyframes modalSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`)
  }

  // 提示浮层
  if (components.tooltip) {
    const tip = resolved.tooltip
    lines.push(`${s('.tooltip-wrap')} { position: relative; display: inline-flex; cursor: pointer; }`)
    lines.push(`${s('.tooltip-bubble')} { display: none; position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: ${tip.bg}; color: ${tip.text}; font-size: ${tip.fontSize}; padding: ${tip.padding}; border-radius: ${tip.radius}; white-space: nowrap; z-index: 100; }`)
    lines.push(`${s('.tooltip-bubble:after')} { content: ""; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: ${tip.bg}; }`)
    lines.push(`${s('.tooltip-wrap:hover .tooltip-bubble')} { display: block; }`)
  }

  // 通知提示
  if (components.toast) {
    const toast = resolved.toast
    lines.push(`${s('.toast-container')} { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000; display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: none; }`)
    lines.push(`${s('.toast')} { padding: ${toast.padding}; border-radius: ${toast.radius}; font-size: 13px; font-weight: 500; box-shadow: ${toast.shadow}; display: flex; align-items: center; gap: 10px; min-width: 260px; pointer-events: auto; }`)
    if (toast.variants) {
      if (toast.variants.success) lines.push(`${s('.toast.success')} { background: ${toast.variants.success.bg}; color: ${toast.variants.success.text}; border: 1px solid ${toast.variants.success.border}; }`)
      if (toast.variants.error) lines.push(`${s('.toast.error')} { background: ${toast.variants.error.bg}; color: ${toast.variants.error.text}; border: 1px solid ${toast.variants.error.border}; }`)
      if (toast.variants.info) lines.push(`${s('.toast.info')} { background: ${toast.variants.info.bg}; color: ${toast.variants.info.text}; border: 1px solid ${toast.variants.info.border}; }`)
    }
    lines.push(`@keyframes toastSlideIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }`)
    lines.push(`@keyframes toastOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.92); } }`)
    lines.push(`${s('.toast')} { animation: toastSlideIn 0.3s; }`)
  }

  // 右上角非阻塞浮动警告提示
  if (components.floatingAlert) {
    const alert = resolved.floatingAlert
    lines.push(`${s('.floating-alert-container')} { position: fixed; top: 24px; right: 24px; z-index: 2500; display: flex; flex-direction: column; gap: 12px; width: 380px; max-width: calc(100vw - 48px); pointer-events: none; }`)
    lines.push(`${s('.floating-alert')} { pointer-events: auto; display: flex; align-items: flex-start; gap: 12px; padding: ${alert.padding}; background: ${alert.bg}; border: ${alert.border}; border-left: ${alert.borderLeft || alert.border}; border-radius: ${alert.radius}; box-shadow: ${alert.shadow}; backdrop-filter: ${alert.backdropFilter || 'none'}; -webkit-backdrop-filter: ${alert.backdropFilter || 'none'}; animation: ${alert.animation || 'alertSlideInRight 0.3s ease'}; transition: all 0.25s; position: relative; }`)
    lines.push(`${s('.floating-alert.hide')} { opacity: 0; transform: translateY(-10px) scale(0.95); pointer-events: none; }`)
    lines.push(`${s('.floating-alert-icon')} { font-size: ${alert.iconSize || '18px'}; line-height: 1; flex-shrink: 0; color: ${alert.iconColor || 'inherit'}; margin-top: 2px; }`)
    lines.push(`${s('.floating-alert-content')} { flex: 1; display: flex; flex-direction: column; gap: 4px; }`)
    lines.push(`${s('.floating-alert-title')} { font-size: ${alert.titleFontSize || '13px'}; font-weight: ${alert.titleFontWeight || '600'}; color: ${alert.titleColor || 'inherit'}; display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }`)
    lines.push(`${s('.floating-alert-body')} { font-size: ${alert.bodyFontSize || '12px'}; color: ${alert.bodyColor || 'inherit'}; line-height: 1.5; }`)
    lines.push(`${s('.floating-alert-close')} { background: ${alert.closeBg || 'transparent'}; border: ${alert.closeBorder || 'none'}; color: ${alert.closeColor || 'inherit'}; font-size: ${alert.closeFontSize || '14px'}; font-weight: bold; cursor: pointer; padding: 0; border-radius: ${alert.closeRadius || '4px'}; display: flex; align-items: center; justify-content: center; width: ${alert.closeSize || '22px'}; height: ${alert.closeSize || '22px'}; transition: all 0.15s; flex-shrink: 0; box-shadow: ${alert.closeShadow || 'none'}; line-height: 1; }`)
    lines.push(`${s('.floating-alert-close:hover')} { background: ${alert.closeHoverBg || 'rgba(0,0,0,0.06)'}; color: ${alert.closeHoverColor || 'inherit'}; }`)
    lines.push(`${s('.floating-alert-close:active')} { transform: ${alert.closeActiveTransform || 'scale(0.92)'}; }`)
    if (alert.variants) {
      if (alert.variants.warning) lines.push(`${s('.floating-alert.warning')} { background: ${alert.variants.warning.bg}; border-color: ${alert.variants.warning.borderColor || 'transparent'}; border-left-color: ${alert.variants.warning.borderLeftColor || alert.variants.warning.borderColor}; }`)
      if (alert.variants.info) lines.push(`${s('.floating-alert.info')} { background: ${alert.variants.info.bg}; border-color: ${alert.variants.info.borderColor || 'transparent'}; border-left-color: ${alert.variants.info.borderLeftColor || alert.variants.info.borderColor}; }`)
      if (alert.variants.danger) lines.push(`${s('.floating-alert.danger')} { background: ${alert.variants.danger.bg}; border-color: ${alert.variants.danger.borderColor || 'transparent'}; border-left-color: ${alert.variants.danger.borderLeftColor || alert.variants.danger.borderColor}; }`)
    }
    lines.push(`@keyframes alertSlideInRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }`)
    lines.push(`@keyframes appleAlertFadeIn { from { opacity: 0; transform: translateY(-12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`)
    lines.push(`@keyframes pixelAlertPop { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }`)
  }

  // 升降颜色
  lines.push(`${s('.up, .rise')} { color: ${tokens.colors?.success?.text || '#16b979'}; }`)
  lines.push(`${s('.down, .fall')} { color: ${tokens.colors?.danger?.text || '#ef4b5f'}; }`)
  lines.push(`${s('.warn')} { color: ${tokens.colors?.warning?.text || '#ff9f1c'}; }`)

  // 进度条 (Progress Bar)
  if (components.progress) {
    const prog = resolved.progress
    lines.push(`${s('.progress-bar, .glass-progress-bar')} { width: 100%; height: ${prog.height || '10px'}; background: ${prog.bg || 'rgba(226, 236, 228, 0.6)'}; border: ${prog.border || 'none'}; border-radius: ${prog.radius || '999px'}; overflow: hidden; position: relative; box-shadow: ${prog.shadow || 'none'}; }`)
    lines.push(`${s('.progress-fill, .glass-progress-fill')} { height: 100%; background: ${prog.fill || 'linear-gradient(90deg, #34d399, #10b981)'}; border-radius: ${prog.radius || '999px'}; transition: width 0.6s ease; position: relative; overflow: hidden; }`)
    if (prog.shimmer) {
      lines.push(`${s('.progress-fill::after, .glass-progress-fill::after')} { content: ""; position: absolute; inset: 0; background: ${prog.shimmer}; animation: shimmerWave 2.5s infinite; }`)
      lines.push(`@keyframes shimmerWave { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`)
    }
  }

  // 排行榜 (Leaderboard / Ranking List)
  if (components.leaderboard) {
    const lb = resolved.leaderboard
    lines.push(`${s('.leaderboard-list')} { display: flex; flex-direction: column; gap: 10px; }`)
    lines.push(`${s('.leaderboard-item')} { display: flex; align-items: center; justify-content: space-between; padding: ${lb.padding || '12px 16px'}; background: ${lb.itemBg || '#ffffff'}; border: ${lb.itemBorder || '1px solid var(--border-default)'}; border-radius: ${lb.itemRadius || 'var(--radius-md)'}; box-shadow: ${lb.shadow || 'none'}; ${lb.backdropFilter ? 'backdrop-filter: ' + lb.backdropFilter + ';' : ''} transition: all 0.2s; }`)
    lines.push(`${s('.leaderboard-item:hover')} { background: ${lb.itemHover || 'var(--primary-light)'}; transform: ${lb.hoverTransform || 'translateY(-2px)'}; ${lb.hoverBorder ? 'border-color: ' + lb.hoverBorder + ';' : ''} }`)
    lines.push(`${s('.rank-badge')} { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-weight: bold; font-size: 13px; margin-right: 12px; flex-shrink: 0; }`)
    if (lb.rank1) lines.push(`${s('.rank-badge.rank-1')} { background: ${lb.rank1.bg}; color: ${lb.rank1.text}; border: ${lb.rank1.border || 'none'}; }`)
    if (lb.rank2) lines.push(`${s('.rank-badge.rank-2')} { background: ${lb.rank2.bg}; color: ${lb.rank2.text}; border: ${lb.rank2.border || 'none'}; }`)
    if (lb.rank3) lines.push(`${s('.rank-badge.rank-3')} { background: ${lb.rank3.bg}; color: ${lb.rank3.text}; border: ${lb.rank3.border || 'none'}; }`)
    lines.push(`${s('.rank-badge.rank-other')} { background: ${lb.rankOther?.bg || '#f3f4f6'}; color: ${lb.rankOther?.text || '#6b7280'}; border: ${lb.rankOther?.border || 'none'}; }`)

    // 多主题增强组件类 (Enterprise Table, Apple SF Top Chart, 8-Bit Arcade, Glass Breeze)
    lines.push(`${s('.rank-medal')} { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; font-weight: 800; font-size: 13px; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }`)
    lines.push(`${s('.rank-medal.gold')} { background: linear-gradient(135deg, #fef08a, #f59e0b); color: #78350f; border: 1px solid #fcd34d; }`)
    lines.push(`${s('.rank-medal.silver')} { background: linear-gradient(135deg, #f3f4f6, #9ca3af); color: #1f2937; border: 1px solid #e5e7eb; }`)
    lines.push(`${s('.rank-medal.bronze')} { background: linear-gradient(135deg, #ffedd5, #ea580c); color: #7c2d12; border: 1px solid #fed7aa; }`)
    lines.push(`${s('.rank-medal.normal')} { background: #f3f4f6; color: #6b7280; font-weight: 600; }`)

    lines.push(`${s('.sf-rank')} { font-size: 20px; font-weight: 700; color: var(--text-muted, #86868b); width: 32px; flex-shrink: 0; font-feature-settings: "tnum"; }`)
    lines.push(`${s('.sf-rank.rank-1')} { color: #1d1d1f; font-weight: 800; }`)
    lines.push(`${s('.sf-rank.rank-2')} { color: #424245; font-weight: 800; }`)
    lines.push(`${s('.sf-rank.rank-3')} { color: #6e6e73; font-weight: 700; }`)

    lines.push(`${s('.app-icon')} { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }`)

    lines.push(`${s('.glass-rank')} { width: 32px; height: 32px; border-radius: 50%; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.8); display: inline-flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0; }`)
    lines.push(`${s('.glass-rank.rank-1')} { background: rgba(52, 211, 153, 0.25); color: #065f46; box-shadow: 0 0 12px rgba(52, 211, 153, 0.4); }`)
    lines.push(`${s('.glass-rank.rank-2')} { background: rgba(16, 185, 129, 0.18); color: #047857; }`)
    lines.push(`${s('.glass-rank.rank-3')} { background: rgba(110, 231, 183, 0.2); color: #064e3b; }`)
    lines.push(`${s('.glass-rank.rank-other')} { background: rgba(243, 244, 246, 0.5); color: #4b5563; }`)
  }

  // 数据统计卡 (Stat Card)
  if (components.statCard) {
    const sc = resolved.statCard
    lines.push(`${s('.stat-card')} { background: ${sc.bg || '#ffffff'}; border: ${sc.border || '1px solid var(--border-default)'}; border-radius: ${sc.radius || 'var(--radius-lg)'}; padding: ${sc.padding || '18px 22px'}; box-shadow: ${sc.shadow || 'none'}; ${sc.backdropFilter ? 'backdrop-filter: ' + sc.backdropFilter + ';' : ''} display: flex; flex-direction: column; gap: 6px; position: relative; overflow: hidden; transition: all 0.25s; }`)
    lines.push(`${s('.stat-card:hover')} { transform: translateY(-2px); }`)
    lines.push(`${s('.stat-card .stat-label')} { font-size: 12px; color: ${sc.labelColor || 'var(--text-muted)'}; font-weight: 500; display: flex; align-items: center; justify-content: space-between; }`)
    lines.push(`${s('.stat-card .stat-value')} { font-size: 26px; font-weight: 700; color: ${sc.valueColor || 'var(--text-primary)'}; letter-spacing: -0.01em; margin: 2px 0; }`)
    lines.push(`${s('.stat-card .stat-trend')} { font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }`)
  }

  // 步骤条 (Steps)
  if (components.steps) {
    const st = resolved.steps
    lines.push(`${s('.steps-wrap')} { display: flex; justify-content: space-between; position: relative; width: 100%; margin: 16px 0; padding: 0 10px; }`)
    lines.push(`${s('.step-item')} { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; flex: 1; z-index: 2; position: relative; color: var(--text-muted); font-size: 12px; }`)
    lines.push(`${s('.step-number')} { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; background: ${st.numberBg || '#e5e7eb'}; color: ${st.numberText || '#4b5563'}; border: ${st.numberBorder || 'none'}; transition: all 0.25s; flex-shrink: 0; }`)
    lines.push(`${s('.step-item.active .step-number')} { background: ${st.activeBg || 'var(--primary)'}; color: ${st.activeText || '#ffffff'}; box-shadow: ${st.activeShadow || 'none'}; }`)
    lines.push(`${s('.step-item.active')} { color: var(--text-primary); font-weight: 600; }`)
    lines.push(`${s('.step-item.active .step-title')} { color: var(--text-primary); font-weight: 700; }`)
    lines.push(`${s('.step-content')} { display: flex; flex-direction: column; align-items: center; gap: 2px; }`)
    lines.push(`${s('.step-title')} { font-size: 13px; font-weight: 600; color: var(--text-muted); white-space: nowrap; }`)
    lines.push(`${s('.step-desc')} { font-size: 11px; color: var(--text-muted); opacity: 0.8; white-space: nowrap; }`)
    lines.push(`${s('.steps-line')} { position: absolute; top: 16px; left: 12%; right: 12%; height: 2px; background: ${st.lineColor || '#e5e7eb'}; z-index: 1; }`)
  }

  // 开关切换 (Switch)
  if (components.switch) {
    const sw = resolved.switch
    lines.push(`${s('.switch')} { position: relative; display: inline-block; width: ${sw.width || '44px'}; height: ${sw.height || '24px'}; user-select: none; vertical-align: middle; }`)
    lines.push(`${s('.switch input')} { opacity: 0; width: 0; height: 0; position: absolute; }`)
    lines.push(`${s('.switch-slider')} { position: absolute; cursor: pointer; inset: 0; background-color: ${sw.bg || '#ccc'}; transition: .3s; border-radius: 999px; border: ${sw.border || 'none'}; }`)
    lines.push(`${s('.switch-slider:before')} { position: absolute; content: ""; height: calc(${sw.height || '24px'} - 6px); width: calc(${sw.height || '24px'} - 6px); left: 3px; bottom: 3px; background-color: ${sw.handleBg || 'white'}; transition: .3s; border-radius: 50%; }`)
    lines.push(`${s('.switch input:checked + .switch-slider')} { background: ${sw.activeBg || 'var(--primary)'}; }`)
    lines.push(`${s('.switch input:checked + .switch-slider:before')} { transform: translateX(calc(${sw.width || '44px'} - ${sw.height || '24px'})); }`)
  }

  // 通用布局与主题文字对比度规则
  lines.push(`${s('body')} { background: var(--bg-page); color: var(--text-primary); font-family: ${tokens.typography?.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"}; }`)
  lines.push(`${s('body, p, li, td, label, small, .text-primary')} { color: var(--text-primary); }`)
  lines.push(`${s('.text-muted, .text-secondary, small, .helper-text, .field-hint')} { color: var(--text-muted); }`)
  lines.push(`${s('input, textarea, select, button')} { color: var(--text-primary); }`)
  lines.push(`${s('input::placeholder, textarea::placeholder')} { color: var(--text-placeholder); opacity: 1; }`)
  lines.push(`${s('.on-dark, .dark-surface, [data-surface="dark"]')} { color: var(--text-on-dark); }`)
  lines.push(`${s('.on-light, .light-surface, [data-surface="light"]')} { color: var(--text-on-light); }`)
  lines.push(`${s('.grid')} { display: grid; gap: 18px; }`)
  lines.push(`${s('.grid.col-2')} { grid-template-columns: repeat(2, minmax(0, 1fr)); }`)
  lines.push(`${s('.grid.col-3')} { grid-template-columns: repeat(3, minmax(0, 1fr)); }`)
  lines.push(`${s('.grid.col-4')} { grid-template-columns: repeat(4, minmax(0, 1fr)); }`)
  lines.push(`${s('.tag, .pill')} { display: inline-flex; align-items: center; width: fit-content; border-radius: 999px; padding: 5px 10px; font-size: 11px; font-weight: 700; }`)
  lines.push(`${s('.section-title')} { margin: 0 0 14px; color: var(--text-primary); font-size: 18px; font-weight: 800; }`)
  lines.push(`${s('.hero')} { position: relative; overflow: hidden; color: var(--text-on-hero); }`)
  lines.push(`@media (max-width: 900px) { ${s('.grid.col-3, .grid.col-4')} { grid-template-columns: repeat(2, minmax(0, 1fr)); } }`)
  lines.push(`@media (max-width: 640px) { ${s('.grid.col-2, .grid.col-3, .grid.col-4')} { grid-template-columns: 1fr; } }`)

  if (resolvedFull.id === 'pixel-game') {
    lines.push(`${s('.pixel-login-scene')} { min-height: 100vh; display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(360px, .75fr); background: #f8f7ff; color: #1e1b4b; overflow: hidden; }`)
    lines.push(`${s('.pixel-login-world')} { position: relative; min-height: 100vh; overflow: hidden; isolation: isolate; background: linear-gradient(180deg, #0284c7 0%, #38bdf8 55%, #7dd3fc 82%, #bae6fd 100%); border-right: 4px solid #1e1b4b; }`)
    lines.push(`${s('.pixel-world-copy')} { position: relative; z-index: 2; width: min(620px, calc(100% - 64px)); margin: clamp(72px, 12vh, 140px) auto 0; color: #ffffff; text-shadow: 3px 3px 0 #1e1b4b; }`)
    lines.push(`${s('.pixel-world-copy h1')} { margin: 18px 0; font-size: clamp(30px, 5vw, 64px); line-height: 1.25; }`)
    lines.push(`${s('.pixel-world-copy p')} { max-width: 580px; margin: 0; font-family: 'VT323', 'Courier New', monospace; font-size: clamp(21px, 2vw, 28px); line-height: 1.45; }`)
    lines.push(`${s('.pixel-kicker')} { display: inline-flex; padding: 7px 10px; color: #1e1b4b; background: #facc15; border: 3px solid #1e1b4b; box-shadow: 3px 3px 0 #1e1b4b; font-size: 11px; line-height: 1.4; }`)
    lines.push(`${s('.clouds-layer, .pixel-world-stage, .pixel-ground-bar')} { pointer-events: none; user-select: none; }`)
    lines.push(`${s('.clouds-layer')} { position: absolute; inset: 0; z-index: 1; overflow: hidden; }`)
    lines.push(`${s('.pixel-cloud')} { position: absolute; left: -180px; width: 112px; height: 34px; background: #ffffff; box-shadow: 0 10px 0 #e0f2fe; animation: pixelCloudFloat 34s linear infinite; image-rendering: pixelated; }`)
    lines.push(`${s('.pixel-cloud::before')} { content: ''; position: absolute; width: 48px; height: 24px; left: 22px; top: -20px; background: #ffffff; box-shadow: 26px 8px 0 #ffffff; }`)
    lines.push(`${s('.pixel-cloud.c1')} { top: 12%; animation-duration: 34s; }`)
    lines.push(`${s('.pixel-cloud.c2')} { top: 30%; width: 88px; animation-duration: 27s; animation-delay: -12s; }`)
    lines.push(`${s('.pixel-cloud.c3')} { top: 20%; width: 128px; animation-duration: 42s; animation-delay: -24s; }`)
    lines.push(`${s('.pixel-world-stage')} { position: absolute; z-index: 2; inset: auto 8% 64px; height: 150px; }`)
    lines.push(`${s('.pixel-ground-bar')} { position: absolute; z-index: 1; left: 0; right: 0; bottom: 0; height: 64px; background: linear-gradient(180deg, #4ade80 0 12px, #15803d 12px 24px, #a16207 24px 100%); border-top: 4px solid #1e1b4b; }`)
    lines.push(`${s('.pixel-tree')} { position: absolute; bottom: 0; width: 30px; height: 74px; background: #78350f; border: 3px solid #1e1b4b; }`)
    lines.push(`${s('.pixel-tree::before')} { content: ''; position: absolute; width: 74px; height: 58px; left: -25px; top: -42px; background: #22c55e; border: 3px solid #1e1b4b; box-shadow: inset -12px -12px 0 #15803d; }`)
    lines.push(`${s('.pixel-tree.left-tree')} { left: 4%; }`)
    lines.push(`${s('.pixel-tree.right-tree')} { right: 5%; transform: scale(1.18); transform-origin: bottom; }`)
    lines.push(`${s('.pixel-hero-character')} { position: absolute; left: 50%; bottom: 2px; width: 46px; height: 68px; transform: translateX(-50%); background: linear-gradient(90deg, #7c3aed 0 22%, #facc15 22% 78%, #7c3aed 78%); border: 3px solid #1e1b4b; box-shadow: 4px 4px 0 #1e1b4b; }`)
    lines.push(`${s('.pixel-hero-character::before')} { content: ''; position: absolute; width: 34px; height: 28px; left: 3px; top: -30px; background: #fed7aa; border: 3px solid #1e1b4b; box-shadow: inset 0 8px 0 #ef4444; }`)
    lines.push(`${s('.pixel-login-panel-wrap')} { min-height: 100vh; display: grid; place-items: center; padding: clamp(24px, 5vw, 72px); background: #f8f7ff; }`)
    lines.push(`${s('.pixel-business-safe-zone, .pixel-login-panel')} { position: relative; z-index: 2; isolation: isolate; background: #ffffff; color: #1e1b4b; border: 4px solid #1e1b4b; box-shadow: 8px 8px 0 #1e1b4b; }`)
    lines.push(`${s('.pixel-login-panel')} { width: min(100%, 460px); padding: clamp(24px, 4vw, 40px); }`)
    lines.push(`${s('.pixel-login-panel h2')} { margin: 16px 0 8px; font-size: clamp(20px, 3vw, 30px); }`)
    lines.push(`${s('.pixel-login-panel p')} { font-family: 'VT323', 'Courier New', monospace; font-size: 21px; line-height: 1.4; }`)
    lines.push(`${s('.pixel-login-form')} { display: grid; gap: 18px; margin-top: 24px; }`)
    lines.push(`${s('.pixel-login-form label')} { display: grid; gap: 8px; font-size: 11px; }`)
    lines.push(`${s('.pixel-card-arcade')} { background: #ffffff; border: 3px solid #1e1b4b; border-radius: 4px; box-shadow: 4px 4px 0 #1e1b4b; padding: 20px; }`)
    lines.push(`${s('.pixel-card-dashed')} { background: #ffffff; border: 3px dashed #7c3aed; border-radius: 4px; box-shadow: 4px 4px 0 #ddd6fe; padding: 20px; }`)
    lines.push(`${s('.pixel-business-safe-zone::before')} { content: none; }`)
    lines.push(`@keyframes pixelCloudFloat { from { transform: translateX(0); } to { transform: translateX(calc(100vw + 360px)); } }`)
    lines.push(`@media (max-width: 900px) { ${s('.pixel-login-scene')} { grid-template-columns: 1fr; } ${s('.pixel-login-world')} { min-height: 44vh; border-right: 0; border-bottom: 4px solid #1e1b4b; } ${s('.pixel-login-panel-wrap')} { min-height: 56vh; } ${s('.pixel-world-copy')} { margin-top: 48px; } }`)
    lines.push(`@media (max-width: 640px) { ${s('.pixel-login-world')} { min-height: 38vh; } ${s('.pixel-world-copy')} { width: calc(100% - 40px); margin-top: 32px; } ${s('.pixel-world-stage')} { opacity: .75; transform: scale(.78); transform-origin: bottom center; } ${s('.pixel-login-panel-wrap')} { padding: 22px 16px 34px; } ${s('.pixel-login-panel')} { box-shadow: 5px 5px 0 #1e1b4b; } }`)
    lines.push(`@media (prefers-reduced-motion: reduce) { ${s('.pixel-cloud')} { animation: none; } ${s('.pixel-cloud.c1')} { left: 8%; } ${s('.pixel-cloud.c2')} { left: 58%; } ${s('.pixel-cloud.c3')} { display: none; } }`)
    lines.push(`${s(':focus-visible')} { outline: 3px solid #facc15; outline-offset: 4px; }`)
  }

  if (resolvedFull.id === 'neomorphism') {
    lines.push(`${s('.hero')} { background: #e4e9f0; color: #2b3542; border-radius: 28px; padding: 28px; box-shadow: 18px 18px 38px #b8c2cf, -18px -18px 38px #ffffff; }`)
    lines.push(`${s('.card, .stat-card, .leaderboard-item')} { border-color: transparent; }`)
    lines.push(`${s('.btn:active, .card.is-pressed')} { box-shadow: inset 5px 5px 10px #c1cad6, inset -5px -5px 10px #ffffff; }`)
    lines.push(`${s('.progress-bar')} { box-shadow: inset 3px 3px 6px #c1cad6, inset -3px -3px 6px #ffffff; }`)
    lines.push(`${s('.switch-slider:before')} { box-shadow: 3px 3px 7px rgba(158,170,184,.55), -3px -3px 7px #ffffff; }`)
    lines.push(`${s(':focus-visible')} { outline: 3px solid rgba(102,126,234,.45); outline-offset: 4px; }`)
  }

  if (resolvedFull.id === 'retro-y2k') {
    lines.push(`${s('body')} { background-attachment: fixed; }`)
    lines.push(`${s('.hero')} { padding: 32px; border-radius: 36px; background: linear-gradient(135deg,#ff6b9d 0%,#c66aff 48%,#00d4ff 100%); box-shadow: 0 16px 0 rgba(102,55,151,.18), 0 36px 80px rgba(198,106,255,.28); border: 2px solid rgba(255,255,255,.9); }`)
    lines.push(`${s('.hero h1, .chrome-title')} { color: transparent; background: linear-gradient(180deg,#ffffff 0%,#dce5f4 34%,#ffffff 52%,#9bacbf 74%,#ffffff 100%); -webkit-background-clip: text; background-clip: text; filter: drop-shadow(0 3px 0 rgba(92,39,125,.28)); }`)
    lines.push(`${s('.y2k-orb')} { position: fixed; border-radius: 50%; pointer-events: none; z-index: -1; opacity: .62; filter: blur(1px); animation: y2kFloat 8s ease-in-out infinite alternate; }`)
    lines.push(`${s('.y2k-sparkle')} { display: inline-block; color: #fff27b; text-shadow: 0 0 12px #ff6b9d; animation: y2kTwinkle 1.8s ease-in-out infinite; }`)
    lines.push(`${s('.card::after, .stat-card::after')} { content: ''; position: absolute; inset: 2px 8% auto; height: 2px; border-radius: 999px; background: linear-gradient(90deg,transparent,rgba(255,255,255,.95),transparent); pointer-events: none; }`)
    lines.push(`@keyframes y2kFloat { from { transform: translate3d(0,0,0) rotate(0); } to { transform: translate3d(18px,-24px,0) rotate(10deg); } }`)
    lines.push(`@keyframes y2kTwinkle { 0%,100% { transform: scale(.8) rotate(0); opacity: .45; } 50% { transform: scale(1.25) rotate(18deg); opacity: 1; } }`)
    lines.push(`${s(':focus-visible')} { outline: 3px solid #00d4ff; outline-offset: 4px; }`)
  }

  if (resolvedFull.id === 'claymorphism') {
    lines.push(`${s('.hero')} { padding: 32px; border-radius: 38px; background: linear-gradient(145deg,#8f72ff 0%,#7c5cfc 50%,#ff7f9b 100%); box-shadow: 16px 18px 0 rgba(124,92,252,.16), 0 36px 64px rgba(91,70,170,.15), inset 0 3px 0 rgba(255,255,255,.48); border: 2px solid rgba(255,255,255,.7); }`)
    lines.push(`${s('.card, .stat-card, .leaderboard-item')} { isolation: isolate; }`)
    lines.push(`${s('.clay-icon')} { width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; border-radius: 18px; color: #fff; background: linear-gradient(145deg,#ff8ba6,#ff6387); border: 2px solid rgba(255,255,255,.72); box-shadow: 5px 6px 0 rgba(255,107,138,.22), inset 0 2px 0 rgba(255,255,255,.42); }`)
    lines.push(`${s('.btn:active')} { filter: saturate(.95); }`)
    lines.push(`${s(':focus-visible')} { outline: 3px solid rgba(124,92,252,.5); outline-offset: 4px; }`)
  }

  lines.push(`@media (prefers-reduced-motion: reduce) { ${s('*, *::before, *::after')} { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }`)

  // 动态背板（如小清新风的绿白流动模糊背景，或赛博霓虹风的暗黑网格与霓虹脉冲光晕）
  if (resolvedFull.dynamicBackground) {
    lines.push(`/* Dynamic Animated Flowing Background & Glass FX */`)
    if (resolvedFull.id === 'cyber-neon') {
      lines.push(`${s('body')} { background: #080c14; color: #e2eeff; font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, 'PingFang SC', sans-serif); }`)
      lines.push(`${s('.cyber-dynamic-bg')} { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; background: #080c14; background-image: linear-gradient(rgba(0, 240, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.06) 1px, transparent 1px); background-size: 40px 40px; }`)
      lines.push(`${s('.cyber-bg-orb')} { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.6; animation: cyberOrbPulse 16s ease-in-out infinite alternate; }`)
      lines.push(`${s('.cyber-orb-1')} { width: 600px; height: 600px; background: radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(0, 240, 255, 0) 70%); top: -150px; left: -100px; }`)
      lines.push(`${s('.cyber-orb-2')} { width: 650px; height: 650px; background: radial-gradient(circle, rgba(255, 0, 122, 0.22) 0%, rgba(255, 0, 122, 0) 70%); bottom: -150px; right: -100px; animation-delay: -5s; }`)
      lines.push(`${s('.cyber-orb-3')} { width: 500px; height: 500px; background: radial-gradient(circle, rgba(112, 0, 255, 0.2) 0%, rgba(112, 0, 255, 0) 70%); top: 40%; left: 30%; animation-delay: -10s; }`)
      lines.push(`@keyframes cyberOrbPulse { 0% { transform: scale(1) translate(0, 0); opacity: 0.5; } 50% { transform: scale(1.15) translate(40px, -30px); opacity: 0.75; } 100% { transform: scale(0.9) translate(-30px, 40px); opacity: 0.55; } }`)
      lines.push(`${s('.cyber-scanline')} { position: fixed; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent 0%, #00f0ff 50%, transparent 100%); opacity: 0.4; pointer-events: none; z-index: 999; animation: scanlineMove 8s linear infinite; }`)
      lines.push(`@keyframes scanlineMove { 0% { transform: translateY(-10px); } 100% { transform: translateY(100vh); } }`)
    } else {
      lines.push(`${s('.fresh-dynamic-bg')} { position: fixed; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; background: #f6faf6; }`)
      lines.push(`${s('.fresh-bg-orb')} { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.65; animation: orbFloat 22s ease-in-out infinite alternate; }`)
      lines.push(`${s('.orb-1')} { width: 650px; height: 650px; background: radial-gradient(circle, #bbf7d0 0%, rgba(187, 247, 208, 0) 70%); top: -150px; left: -150px; animation-duration: 22s; }`)
      lines.push(`${s('.orb-2')} { width: 700px; height: 700px; background: radial-gradient(circle, #86efac 0%, rgba(134, 239, 172, 0) 70%); bottom: -200px; right: -150px; animation-duration: 26s; animation-delay: -6s; }`)
      lines.push(`${s('.orb-3')} { width: 550px; height: 550px; background: radial-gradient(circle, #dcfce7 0%, rgba(220, 252, 231, 0) 70%); top: 35%; left: 25%; animation-duration: 18s; animation-delay: -12s; }`)
      lines.push(`${s('.orb-4')} { width: 600px; height: 600px; background: radial-gradient(circle, #ffffff 0%, rgba(255, 255, 255, 0) 70%); top: 15%; right: 15%; animation-duration: 28s; animation-delay: -4s; }`)
      lines.push(`@keyframes orbFloat { 0% { transform: translate(0, 0) scale(1) rotate(0deg); } 33% { transform: translate(70px, 90px) scale(1.15) rotate(120deg); } 66% { transform: translate(-50px, 130px) scale(0.88) rotate(240deg); } 100% { transform: translate(90px, -50px) scale(1.12) rotate(360deg); } }`)
      lines.push(`${s('.fresh-leaf-particle')} { position: absolute; pointer-events: none; opacity: 0.45; animation: floatLeaf 18s linear infinite; }`)
      lines.push(`@keyframes floatLeaf { 0% { transform: translateY(105vh) rotate(0deg) scale(0.8); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { transform: translateY(-10vh) rotate(360deg) scale(1.2); opacity: 0; } }`)
    }
  }

  return lines.join('\n')
}

// ========== 主题切换与旧资产清理 ==========

/**
 * 在注入新主题前移除 Beautify 管理的旧主题资产。
 * 只删除带 data-beautify 标记或明确登记的旧锚点，不碰业务 DOM。
 */
function removePreviousThemeAssets(html) {
  let cleaned = html

  // CSS、脚本与显式主题锚点全部互斥；切换主题时一律先卸载。
  cleaned = cleaned.replace(/<style\b[^>]*data-beautify=["'][^"']+["'][^>]*>[\s\S]*?<\/style>\s*/gi, '')
  cleaned = cleaned.replace(/<script\b[^>]*data-beautify-script=["'][^"']+["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')
  cleaned = cleaned.replace(/<!-- beautify-anchor:start:[\w-]+ -->[\s\S]*?<!-- beautify-anchor:end:[\w-]+ -->\s*/gi, '')
  cleaned = cleaned.replace(/<([a-z][\w:-]*)\b[^>]*data-beautify-anchor=["'][^"']+["'][^>]*>[\s\S]*?<\/\1>\s*/gi, '')
  cleaned = cleaned.replace(/<([a-z][\w:-]*)\b[^>]*data-beautify-anchor=["'][^"']+["'][^>]*\/?>\s*/gi, '')

  // 兼容 0.3.2 及更早版本未标记的赛博节点。
  cleaned = cleaned.replace(/<!-- Canvas Interactive Mouse Particle Matrix -->\s*/gi, '')
  cleaned = cleaned.replace(/<canvas\b[^>]*id=["']cyberCanvas["'][^>]*><\/canvas>\s*/gi, '')
  cleaned = cleaned.replace(/<(?:div)\b[^>]*class=["'][^"']*\bcyber-(?:dynamic-bg|scanline)\b[^"']*["'][^>]*><\/div>\s*/gi, '')

  return cleaned
}

/** 给 body 写入唯一当前主题标识，并清掉旧 beautify-theme-* 类。 */
function markActiveTheme(html, templateName) {
  return html.replace(/<body\b([^>]*)>/i, (match, attrs) => {
    let nextAttrs = attrs
      .replace(/\sdata-beautify-theme=["'][^"']*["']/gi, '')
      .replace(/\sclass=["']([^"']*)["']/i, (classMatch, classes) => {
        const kept = classes
          .split(/\s+/)
          .filter(Boolean)
          .filter((name) => !name.startsWith('beautify-theme-'))
        if (!kept.includes('beautify-root')) kept.push('beautify-root')
        if (!kept.includes('beautify-full-page')) kept.push('beautify-full-page')
        kept.push(`beautify-theme-${templateName}`)
        return ` class="${kept.join(' ')}"`
      })

    if (!/\sclass=["']/i.test(nextAttrs)) {
      nextAttrs += ` class="beautify-root beautify-full-page beautify-theme-${templateName}"`
    }
    return `<body${nextAttrs} data-beautify-theme="${templateName}">`
  })
}

// ========== 主函数 ==========

/**
 * 美化 HTML 页面
 * @param {string} templateName - 模板名称（如 classic-blue-white）
 * @param {string} htmlInput - 输入 HTML 文件路径
 * @param {string} [htmlOutput] - 输出文件路径（可选，默认在原文件名加 .beautified）
 * @returns {string} 输出文件路径
 */
function beautify(templateName, htmlInput, htmlOutput) {
  const skillDir = __dirname

  // 1. 读取模板
  const templatePath = path.join(skillDir, 'templates', templateName + '.json')
  if (!fs.existsSync(templatePath)) {
    throw new Error(`找不到模板：${templateName}（路径：${templatePath}）`)
  }
  const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'))

  // 2. 解析变量引用
  const resolved = resolveAll(template, template.tokens)

  // 3. 生成 CSS (传入递归解析后的 resolved 变量)
  const cssVars = generateCSSVariables(resolved.tokens, resolved.cssVariables, '.beautify-root')
  const componentCSS = generateComponentStyles(template.components, resolved, resolved.tokens, '.beautify-root')
  const fullCSS = `${cssVars}\n\n/* Beautify - ${template.name} */\n${componentCSS}`

  // 4. 读取 HTML
  if (!fs.existsSync(htmlInput)) {
    throw new Error(`找不到 HTML 文件：${htmlInput}`)
  }
  let html = fs.readFileSync(htmlInput, 'utf-8')

  // 5. 主题切换采用 replace-not-stack：先卸载所有旧 Beautify 资产，再注入唯一新主题。
  html = removePreviousThemeAssets(html)
  html = markActiveTheme(html, templateName)

  // 补全 Canvas DOM 和动态交互 JS 脚本
  const themeScript = getThemeScript(templateName)
  if (themeScript) {
    if (themeScript.canvasDOM && !html.includes('id="cyberCanvas"')) {
      html = html.replace(/<body[^>]*>/i, (m) => `${m}\n${themeScript.canvasDOM}`)
    }

    // 同时匹配内联和外部脚本，不依赖属性顺序，保证重复运行不重复注入
    const scriptRegex = new RegExp(`<script\\b[^>]*data-beautify-script=["']${templateName}["'][^>]*>[\\s\\S]*?<\\/script>`, 'gi')
    if (scriptRegex.test(html)) {
      html = html.replace(scriptRegex, themeScript.scriptTag)
    } else {
      html = html.replace(/<\/body>/i, `${themeScript.scriptTag}\n</body>`)
    }
  }

  const styleRegex = new RegExp(`<style data-beautify="[\\w-]+">[\\s\\S]*?<\\/style>`, 'gi')
  const styleTag = `\n<style data-beautify="${templateName}">\n${fullCSS}\n</style>\n`
  if (styleRegex.test(html)) {
    html = html.replace(styleRegex, styleTag)
  } else {
    html = html.replace('</head>', styleTag + '</head>')
  }

  // 6. 写入输出文件
  if (!htmlOutput) {
    const ext = path.extname(htmlInput)
    const base = path.basename(htmlInput, ext)
    htmlOutput = path.join(path.dirname(htmlInput), base + '.beautified' + ext)
  }

  // 外部主题脚本必须随 HTML 一起复制，确保 scripts/cyber-neon.js 相对路径可用
  if (templateName === 'cyber-neon') {
    const sourceScript = path.join(skillDir, 'scripts', 'cyber-neon.js')
    if (fs.existsSync(sourceScript)) {
      const outputScriptDir = path.join(path.dirname(path.resolve(htmlOutput)), 'scripts')
      const outputScript = path.join(outputScriptDir, 'cyber-neon.js')
      fs.mkdirSync(outputScriptDir, { recursive: true })
      if (path.resolve(sourceScript) !== path.resolve(outputScript)) {
        fs.copyFileSync(sourceScript, outputScript)
      }
    }
  }

  fs.writeFileSync(htmlOutput, html, 'utf-8')

  console.log(`✅ 美化完成！`)
  console.log(`   模板：${template.name}`)
  console.log(`   输出：${htmlOutput}`)
  return htmlOutput
}

// ========== CLI 入口 ==========
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.log('用法：node generator.js <模板名> <输入HTML路径> [输出路径]')
    console.log('示例：node generator.js classic-blue-white ./my-page.html ./my-page-beautified.html')
    console.log('')
    console.log('可用模板：')
    const templateDir = path.join(__dirname, 'templates')
    if (fs.existsSync(templateDir)) {
      const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.json'))
      files.forEach(f => {
        const tpl = JSON.parse(fs.readFileSync(path.join(templateDir, f), 'utf-8'))
        console.log(`  ${tpl.id || f.replace('.json', '')}  —  ${tpl.name || f}`)
      })
    }
    process.exit(1)
  }
  try {
    beautify(args[0], args[1], args[2])
  } catch (e) {
    console.error('❌ 错误：', e.message)
    process.exit(1)
  }
}

module.exports = { beautify, resolveToken, resolveAll, generateCSSVariables, generateComponentStyles }