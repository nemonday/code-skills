from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

THEMES = {
    "neomorphism": {
        "title": "Soft Control",
        "eyebrow": "NEOMORPHISM / 新拟态",
        "desc": "亮暗双向阴影让设置、指标与控制组件从同色表面自然生长。",
        "icon": "◉",
        "decor": "",
    },
    "retro-y2k": {
        "title": "Dreamwave Studio",
        "eyebrow": "RETRO / Y2K 千禧风",
        "desc": "糖果渐变、Chrome 金属标题、漂浮气泡和星芒，构成怀旧未来感内容看板。",
        "icon": "✦",
        "decor": '<i class="y2k-orb" style="width:180px;height:180px;left:3%;top:16%;background:linear-gradient(135deg,#ff6b9d,#c66aff)"></i><i class="y2k-orb" style="width:120px;height:120px;right:4%;top:45%;background:linear-gradient(135deg,#00d4ff,#fff27b);animation-delay:-3s"></i>',
    },
    "claymorphism": {
        "title": "Happy Tasks",
        "eyebrow": "CLAYMORPHISM / 粘土风",
        "desc": "厚实的彩色位移阴影、白色高光边与圆润组件，带来可触摸的软 3D 体验。",
        "icon": "●",
        "decor": "",
    },
}

BASE_CSS = """
*{box-sizing:border-box} body{margin:0;min-height:100vh} .shell{max-width:1240px;margin:auto;padding:32px 24px 64px}.hero{min-height:220px;display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:34px}.eyebrow{font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;opacity:.8}.hero h1{font-size:clamp(38px,6vw,72px);line-height:.92;margin:12px 0 16px;letter-spacing:-.055em}.hero p{max-width:620px;margin:0;line-height:1.7;font-size:15px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.section{margin-top:30px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:14px}.section-head p{margin:0;color:var(--text-muted);font-size:13px}.stat-card{min-height:150px}.stat-icon{font-size:24px;margin-bottom:8px}.stat-value{font-variant-numeric:tabular-nums}.card{min-width:0}.toolbar{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.toolbar input{min-width:220px}.custom-select{max-width:220px}.leaderboard-item+.leaderboard-item{margin-top:12px}.rank-copy{display:flex;align-items:center;gap:12px}.rank-copy strong{display:block}.rank-copy small,.muted{color:var(--text-muted)}.demo-table{overflow:auto}.demo-table table{text-align:left}.steps-wrap{min-width:560px}.steps-scroll{overflow:auto}.component-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.accent-card{min-height:220px;display:flex;flex-direction:column;justify-content:space-between}.palette{display:flex;gap:8px}.swatch{width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,255,255,.8)}.modal-overlay{display:none}.modal-overlay.show{display:flex}.toast-container{position:fixed;right:22px;bottom:22px;z-index:3000}.toast{margin-top:8px}.custom-select-options{display:none}.custom-select.open .custom-select-options{display:block}.custom-select-trigger{width:100%}.accordion-body{max-height:0}.accordion-body.open{max-height:160px}.accordion-item+.accordion-item{margin-top:12px}.sparkle-line{letter-spacing:.45em;font-size:20px}.clay-icon{font-size:20px}.footer-note{text-align:center;margin-top:42px;color:var(--text-muted);font-size:12px}@media(max-width:760px){.shell{padding:20px 14px 48px}.hero{align-items:start;flex-direction:column}.toolbar>*{width:100%;max-width:none!important}.toolbar input{min-width:0}.section-head{align-items:start;flex-direction:column}}
"""

SCRIPT = """
function toggleSelect(el){el.closest('.custom-select').classList.toggle('open')}
function choose(el){const root=el.closest('.custom-select');root.querySelector('.select-value').textContent=el.textContent;root.querySelectorAll('.custom-select-option').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');root.classList.remove('open')}
function toggleAccordion(el){el.nextElementSibling.classList.toggle('open');el.querySelector('.acc-arrow').classList.toggle('open')}
function openModal(){document.getElementById('demoModal').classList.add('show')}
function closeModal(){document.getElementById('demoModal').classList.remove('show')}
function showToast(kind='success'){const c=document.getElementById('toasts');const t=document.createElement('div');t.className='toast '+kind;t.textContent=kind==='success'?'✓ 已保存主题设置':'提示已送达';c.appendChild(t);setTimeout(()=>t.remove(),2600)}
document.addEventListener('click',e=>{document.querySelectorAll('.custom-select.open').forEach(x=>{if(!x.contains(e.target))x.classList.remove('open')})});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()})
"""

for theme_id, t in THEMES.items():
    title_class = "chrome-title" if theme_id == "retro-y2k" else ""
    icon_class = "clay-icon" if theme_id == "claymorphism" else "stat-icon"
    sparkle = '<div class="sparkle-line"><span class="y2k-sparkle">✦</span><span class="y2k-sparkle" style="animation-delay:-.6s">✧</span><span class="y2k-sparkle" style="animation-delay:-1.1s">✦</span></div>' if theme_id == "retro-y2k" else ""
    html = f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{t['eyebrow']} Demo</title><style>{BASE_CSS}</style></head>
<body>{t['decor']}<main class="shell">
<section class="hero"><div><div class="eyebrow">{t['eyebrow']}</div><h1 class="{title_class}">{t['title']}</h1><p>{t['desc']}</p></div><div class="hero-actions"><button class="btn primary" onclick="showToast()">保存设置</button><button class="btn secondary" onclick="openModal()">查看详情</button></div></section>
<section class="section"><div class="section-head"><div><h2 class="section-title">今日概览</h2><p>同一套组件骨架，由主题契约决定材质、轮廓与反馈。</p></div><div class="toolbar"><input placeholder="搜索项目、成员或标签"><div class="custom-select"><button class="custom-select-trigger" onclick="toggleSelect(this)"><span class="select-value">本周</span><span>⌄</span></button><div class="custom-select-options"><div class="custom-select-option selected" onclick="choose(this)">本周</div><div class="custom-select-option" onclick="choose(this)">本月</div><div class="custom-select-option" onclick="choose(this)">本季度</div></div></div></div></div>
<div class="grid col-4"><article class="stat-card"><div class="{icon_class}">{t['icon']}</div><div class="stat-label"><span>完成任务</span><span class="badge success">+18%</span></div><div class="stat-value">128</div><div class="progress-bar"><div class="progress-fill" style="width:82%"></div></div></article><article class="stat-card"><div class="{icon_class}">◇</div><div class="stat-label"><span>专注时长</span><span class="badge">本周</span></div><div class="stat-value">36.5h</div><div class="stat-trend up">↑ 6.4 小时</div></article><article class="stat-card"><div class="{icon_class}">◎</div><div class="stat-label"><span>团队协作</span><span class="badge warning">活跃</span></div><div class="stat-value">92%</div><div class="progress-bar"><div class="progress-fill" style="width:92%"></div></div></article><article class="stat-card"><div class="{icon_class}">✦</div><div class="stat-label"><span>灵感收藏</span><span class="badge danger">12 新增</span></div><div class="stat-value">246</div><div class="stat-trend">今日 +8</div></article></div></section>
<section class="section grid col-2"><article class="card accent-card"><div><h2 class="section-title">重点项目</h2><p class="muted">产品发布准备已进入最终阶段，设计与开发同步收口。</p></div><div class="steps-scroll"><div class="steps-wrap"><div class="steps-line"></div><div class="step-item active"><div class="step-number">1</div><div class="step-content"><div class="step-title">策略</div><div class="step-desc">已完成</div></div></div><div class="step-item active"><div class="step-number">2</div><div class="step-content"><div class="step-title">设计</div><div class="step-desc">已完成</div></div></div><div class="step-item active"><div class="step-number">3</div><div class="step-content"><div class="step-title">开发</div><div class="step-desc">进行中</div></div></div><div class="step-item"><div class="step-number">4</div><div class="step-content"><div class="step-title">上线</div><div class="step-desc">待开始</div></div></div></div></div>{sparkle}</article>
<article class="card"><div class="section-head"><div><h2 class="section-title">团队排行榜</h2><p>按本周任务贡献排序</p></div><span class="tag">TOP 3</span></div><div class="leaderboard-list"><div class="leaderboard-item"><div class="rank-copy"><span class="rank-badge rank-1">1</span><div><strong>体验设计组</strong><small>42 项完成</small></div></div><b>98%</b></div><div class="leaderboard-item"><div class="rank-copy"><span class="rank-badge rank-2">2</span><div><strong>前端平台组</strong><small>38 项完成</small></div></div><b>94%</b></div><div class="leaderboard-item"><div class="rank-copy"><span class="rank-badge rank-3">3</span><div><strong>内容增长组</strong><small>31 项完成</small></div></div><b>89%</b></div></div></article></section>
<section class="section grid col-2"><article class="card"><h2 class="section-title">组件触感</h2><div class="component-row"><button class="btn primary" onclick="showToast()">主按钮</button><button class="btn secondary" onclick="showToast('info')">次按钮</button><span class="badge success">已完成</span><span class="badge warning">待确认</span><label class="switch"><input type="checkbox" checked><span class="switch-slider"></span></label></div><div style="margin-top:22px" class="accordion-item"><div class="accordion-header" onclick="toggleAccordion(this)"><span>为什么这个主题不是只换颜色？</span><span class="acc-arrow">⌄</span></div><div class="accordion-body"><p>因为卡片、输入框、按钮、进度、弹层与状态都使用了主题专属的材质和交互锚点。</p></div></div></article>
<article class="card demo-table"><h2 class="section-title">任务清单</h2><table><thead><tr><th>任务</th><th>负责人</th><th>进度</th><th>状态</th></tr></thead><tbody><tr><td>视觉系统收口</td><td>林墨</td><td>92%</td><td><span class="badge success">正常</span></td></tr><tr><td>组件验收</td><td>张弛</td><td>76%</td><td><span class="badge warning">跟进</span></td></tr><tr><td>发布检查</td><td>小禾</td><td>48%</td><td><span class="badge">排期中</span></td></tr></tbody></table></article></section>
<div class="footer-note">Beautify · {t['eyebrow']} · 结构重构 + 主题设计契约 + 可交互验收</div></main>
<div class="modal-overlay" id="demoModal" onclick="closeModal()"><div class="modal-box" onclick="event.stopPropagation()"><div class="modal-header"><b>主题详情</b><button class="modal-close" onclick="closeModal()">×</button></div><div class="modal-body">该 Demo 展示指标卡、排行榜、步骤条、表格、表单、开关、下拉框、Toast 与弹窗的统一主题表达。</div><div class="modal-footer"><button class="btn secondary" onclick="closeModal()">关闭</button><button class="btn primary" onclick="closeModal();showToast()">确认</button></div></div></div><div class="toast-container" id="toasts"></div><script>{SCRIPT}</script></body></html>'''
    (ROOT / f"demo-{theme_id}.html").write_text(html, encoding="utf-8")
    print(ROOT / f"demo-{theme_id}.html")
