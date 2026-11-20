// Celebration "crackers": confetti cannons from the bottom corners, a gold rain from above and
// sparkler bursts, all on one throw-away full-screen canvas that cleans itself up.
import { isLite } from './device'

const COLORS = ['#f3d68a', '#d4a24c', '#fff4d4', '#f29b1d', '#ffb300', '#d81b74', '#e0218a', '#1f9d73', '#c8323f']
const rnd = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]

export function fireCrackers() {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const small = window.innerWidth < 640
  const k = (small ? 0.6 : 1) * (isLite ? 0.5 : 1)
  const dpr = isLite ? 1 : Math.min(window.devicePixelRatio || 1, 2)
  const cv = document.createElement('canvas')
  Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 99999 })
  const W = (cv.width = window.innerWidth * dpr)
  const H = (cv.height = window.innerHeight * dpr)
  document.body.appendChild(cv)
  const ctx = cv.getContext('2d')
  ctx.scale(dpr, dpr)
  const vw = window.innerWidth
  const vh = window.innerHeight

  const bits = [] // confetti
  const sparks = [] // firework sparks

  const cannon = (x, y, angleDeg, n, power) => {
    for (let i = 0; i < n * k; i++) {
      const a = ((angleDeg + rnd(-24, 24)) * Math.PI) / 180
      const v = rnd(0.45, 1) * power
      bits.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: rnd(5, 10), h: rnd(3, 6), rot: rnd(0, 6.28), vr: rnd(-0.3, 0.3), flip: rnd(0, 6.28),
        color: pick(COLORS), shape: Math.random() < 0.2 ? 'dot' : Math.random() < 0.3 ? 'petal' : 'strip', life: 1,
      })
    }
  }
  const rain = (n) => {
    for (let i = 0; i < n * k; i++) {
      bits.push({
        x: rnd(0, vw), y: rnd(-60, -10), vx: rnd(-1, 1), vy: rnd(1, 3),
        w: rnd(4, 8), h: rnd(3, 5), rot: rnd(0, 6.28), vr: rnd(-0.2, 0.2), flip: rnd(0, 6.28),
        color: pick(COLORS.slice(0, 4)), shape: 'strip', life: 1, floaty: true,
      })
    }
  }
  const firework = (x, y) => {
    const hue = pick(['#f3d68a', '#ffb300', '#ff6fa8', '#fff4d4', '#7ee0b5'])
    for (let i = 0; i < 70 * k; i++) {
      const a = (i / (70 * k)) * Math.PI * 2 + rnd(-0.05, 0.05)
      const v = rnd(2, 6.2)
      sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, color: Math.random() < 0.3 ? '#fff4d4' : hue, life: 1 })
    }
  }

  const fire = (ms, fn) => setTimeout(fn, ms)
  const SIDE = vh * 0.98
  cannon(0, SIDE, -62, 90, 22)
  cannon(vw, SIDE, -118, 90, 22)
  fire(220, () => firework(vw * 0.28, vh * 0.3))
  fire(420, () => firework(vw * 0.72, vh * 0.24))
  fire(380, () => rain(50))
  fire(650, () => { cannon(0, SIDE, -55, 50, 20); cannon(vw, SIDE, -125, 50, 20) })
  fire(760, () => firework(vw * 0.5, vh * 0.2))
  fire(1000, () => firework(vw * 0.16, vh * 0.42))
  fire(1150, () => firework(vw * 0.84, vh * 0.38))
  fire(1250, () => rain(40))

  const start = performance.now()
  let last = start
  let raf
  const tick = (now) => {
    const dt = Math.min(2, (now - last) / 16.67)
    last = now
    ctx.clearRect(0, 0, vw, vh)

    for (let i = bits.length - 1; i >= 0; i--) {
      const b = bits[i]
      b.vx *= b.floaty ? 0.99 : 0.985
      b.vy = b.vy * (b.floaty ? 0.99 : 0.985) + (b.floaty ? 0.05 : 0.22) * dt
      b.x += b.vx * dt
      b.y += b.vy * dt
      b.rot += b.vr * dt
      b.flip += 0.18 * dt
      if (now - start > 2200) b.life -= 0.012 * dt
      if (b.y > vh + 30 || b.life <= 0) { bits.splice(i, 1); continue }
      ctx.save()
      ctx.globalAlpha = Math.max(0, b.life)
      ctx.translate(b.x, b.y)
      ctx.rotate(b.rot)
      ctx.scale(1, Math.cos(b.flip)) // tumble
      ctx.fillStyle = b.color
      if (b.shape === 'dot') { ctx.beginPath(); ctx.arc(0, 0, b.h * 0.7, 0, 6.28); ctx.fill() }
      else if (b.shape === 'petal') { ctx.beginPath(); ctx.ellipse(0, 0, b.w * 0.7, b.h * 0.9, 0, 0, 6.28); ctx.fill() }
      else ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h)
      ctx.restore()
    }

    ctx.lineCap = 'round'
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]
      s.px = s.x; s.py = s.y
      s.vx *= 0.965; s.vy = s.vy * 0.965 + 0.07 * dt
      s.x += s.vx * dt; s.y += s.vy * dt
      s.life -= 0.016 * dt
      if (s.life <= 0) { sparks.splice(i, 1); continue }
      ctx.globalAlpha = s.life
      ctx.strokeStyle = s.color
      ctx.lineWidth = 1.2 + s.life * 1.6
      ctx.beginPath(); ctx.moveTo(s.px, s.py); ctx.lineTo(s.x, s.y); ctx.stroke()
    }
    ctx.globalAlpha = 1

    if (now - start < 1400 || bits.length || sparks.length) raf = requestAnimationFrame(tick)
    else cv.remove()
  }
  raf = requestAnimationFrame(tick)
  setTimeout(() => { cancelAnimationFrame(raf); cv.remove() }, 9000) // never leave a canvas behind
}
