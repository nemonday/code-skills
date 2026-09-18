/**
 * Cyber Neon - Canvas Quantum Particle Matrix & Light Wave Mouse Reticle
 * 赛博霓虹风 · 视觉灵魂脚本
 *
 * 依赖：页面中需存在 <canvas id="cyberCanvas">
 * 用法：在 </body> 前引入 <script src="scripts/cyber-neon.js"></script>
 *       或由 generator.js 自动内联注入
 */
;(function () {
  var canvas = document.getElementById('cyberCanvas')
  if (!canvas) return

  var ctx = canvas.getContext('2d')
  var width, height
  var particles = []
  var sparks = []
  var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false }

  /* ========== Resize ========== */
  function resize() {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  /* ========== Mouse Tracking ========== */
  function updateMouse(e) {
    mouse.x = e.clientX
    mouse.y = e.clientY
    mouse.active = true
    if (Math.random() < 0.5) {
      sparks.push({
        x: mouse.x + (Math.random() - 0.5) * 12,
        y: mouse.y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        size: Math.random() * 3 + 1.5,
        color: Math.random() < 0.5 ? '#00f0ff' : '#ff007a',
        life: 1.0
      })
    }
  }

  document.addEventListener('mousemove', updateMouse)
  document.addEventListener('mouseenter', updateMouse)
  document.addEventListener('mouseleave', function () { mouse.active = false })

  /* ========== Click Spark Burst ========== */
  document.addEventListener('click', function (e) {
    for (var i = 0; i < 20; i++) {
      var angle = Math.random() * Math.PI * 2
      var speed = Math.random() * 5 + 2
      sparks.push({
        x: e.clientX,
        y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color: ['#00f0ff', '#ff007a', '#39ff14', '#7000ff'][Math.floor(Math.random() * 4)],
        life: 1.0
      })
    }
  })

  /* ========== Particle Class ========== */
  function Particle() {
    this.reset()
  }

  Particle.prototype.reset = function () {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 3 + 1.5
    this.vx = (Math.random() - 0.5) * 0.9
    this.vy = (Math.random() - 0.5) * 0.9
    var colors = ['#00f0ff', '#ff007a', '#7000ff', '#00ff9d']
    this.color = colors[Math.floor(Math.random() * colors.length)]
    this.alpha = Math.random() * 0.7 + 0.3
    this.angle = Math.random() * Math.PI * 2
    this.spin = (Math.random() - 0.5) * 0.05
  }

  Particle.prototype.update = function () {
    this.x += this.vx
    this.y += this.vy
    this.angle += this.spin

    // Wrap around edges
    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0

    // Mouse attraction field
    if (mouse.active) {
      var dx = mouse.x - this.x
      var dy = mouse.y - this.y
      var dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 110) {
        var force = (110 - dist) / 110
        this.x += (dx / dist) * force * 1.5
        this.y += (dy / dist) * force * 1.5
      }
    }
  }

  Particle.prototype.draw = function () {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.shadowBlur = 12
    ctx.shadowColor = this.color
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.alpha
    ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2)
    ctx.restore()
  }

  /* ========== Initialize Particles ========== */
  var count = Math.min(Math.floor((width * height) / 9000), 100)
  for (var i = 0; i < count; i++) {
    particles.push(new Particle())
  }

  /* ========== Animation Loop ========== */
  function animate() {
    ctx.clearRect(0, 0, width, height)

    // Update & draw particles + connections
    for (var i = 0; i < particles.length; i++) {
      var p1 = particles[i]
      p1.update()
      p1.draw()

      // Mouse → Particle laser line
      if (mouse.active) {
        var dxM = mouse.x - p1.x
        var dyM = mouse.y - p1.y
        var distM = Math.sqrt(dxM * dxM + dyM * dyM)
        if (distM < 110) {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.shadowBlur = 6
          ctx.shadowColor = '#00f0ff'
          ctx.strokeStyle = 'rgba(0, 240, 255, ' + (0.65 * (1 - distM / 110)) + ')'
          ctx.lineWidth = 1.2
          ctx.stroke()
          ctx.restore()
        }
      }

      // Particle ↔ Particle quantum link
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j]
        var dx = p1.x - p2.x
        var dy = p1.y - p2.y
        var dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110) {
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = 'rgba(112, 0, 255, ' + (0.28 * (1 - dist / 110)) + ')'
          ctx.lineWidth = 0.8
          ctx.stroke()
          ctx.restore()
        }
      }
    }

    // Sparks (mouse trail + click burst)
    for (var si = sparks.length - 1; si >= 0; si--) {
      var s = sparks[si]
      s.x += s.vx
      s.y += s.vy
      s.life -= 0.03
      if (s.life <= 0) {
        sparks.splice(si, 1)
        continue
      }
      ctx.save()
      ctx.shadowBlur = 10
      ctx.shadowColor = s.color
      ctx.fillStyle = s.color
      ctx.globalAlpha = s.life
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    // Mouse reticle & glow halo
    if (mouse.active) {
      ctx.save()

      // Radial glow halo (36px radius)
      var grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 36)
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.35)')
      grad.addColorStop(0.5, 'rgba(255, 0, 122, 0.15)')
      grad.addColorStop(1, 'rgba(0, 240, 255, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 36, 0, Math.PI * 2)
      ctx.fill()

      // Outer ring (cyan, 10px radius)
      ctx.shadowBlur = 10
      ctx.shadowColor = '#00f0ff'
      ctx.strokeStyle = '#00f0ff'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2)
      ctx.stroke()

      // Inner dot (magenta, 3px radius)
      ctx.shadowColor = '#ff007a'
      ctx.strokeStyle = '#ff007a'
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    }

    requestAnimationFrame(animate)
  }

  animate()
})()
