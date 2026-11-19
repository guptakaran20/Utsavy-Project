import { useEffect, useRef } from 'react'
import './HeroFX.css'

const GOLDS = ['#ffd36a', '#ffe9a8', '#ffb300', '#fff4d4']
const PARTY = ['#ffd36a', '#ff6fa8', '#e0218a', '#1f9d73', '#f28c28', '#6ec1ff', '#fff4d4', '#c8323f']
const rnd = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[(Math.random() * arr.length) | 0]

// Celebration layer for the hero: rockets climb and burst into big spreading fireworks across the
// whole sky, and party poppers fire streamers and confetti from the two side edges only.
export default function HeroFX({ play }) {
  const fxRef = useRef(null)
  const cfRef = useRef(null)

  useEffect(() => {
    if (!play || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const fx = fxRef.current
    const cf = cfRef.current
    const parent = fx.parentElement
    const small = window.innerWidth < 640
    const k = small ? 0.62 : 1
    // phones draw the two full-screen canvases at a lower resolution: the sparks and confetti look the same, at a fraction of the cost
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.75)
    let W = 0
    let H = 0
    const fctx = fx.getContext('2d')
    const cctx = cf.getContext('2d')
    const size = () => {
      W = parent.clientWidth
      H = parent.clientHeight
      for (const c of [fx, cf]) {
        c.width = W * dpr
        c.height = H * dpr
        c.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
      }
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(parent)

    const rockets = []
    const sparks = []
    const bits = [] // confetti
    const ribbons = [] // streamers
    let running = true
    let visible = true
    const timers = []
    const later = (fn, ms) => timers.push(setTimeout(fn, ms))

    const burst = (x, y) => {
      const col = pick(GOLDS.concat(PARTY))
      const col2 = pick(GOLDS)
      const n = Math.round(110 * k)
      const power = rnd(3.6, 6.2) * (small ? 0.85 : 1)
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        const ring = i % 3 === 0 ? 0.62 : 1
        const v = power * ring * rnd(0.85, 1.05)
        sparks.push({ x, y, px: x, py: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: i % 5 === 0 ? col2 : col, life: 1, d: rnd(0.008, 0.013) })
      }
    }
    const launch = () => {
      const tx = rnd(W * 0.1, W * 0.9)
      const ty = rnd(H * 0.03, H * 0.3)
      const sx = tx + rnd(-30, 30)
      rockets.push({ x: sx, y: H * 0.66, vx: (tx - sx) / 46, vy: (ty - H * 0.66) / 46, ty, t: 0 })
    }

    // party popper from a side edge: confetti that stops near the edge, plus curling streamers
    const popper = (side) => {
      const x = side < 0 ? -4 : W + 4
      const y = H * rnd(0.5, 0.62)
      const base = side < 0 ? -78 : -102
      for (let i = 0; i < 46 * k; i++) {
        const a = ((base + rnd(-16, 16)) * Math.PI) / 180
        const v = rnd(13, 27)
        bits.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, w: rnd(5, 9), h: rnd(3, 5), r: rnd(0, 6.28), vr: rnd(-0.35, 0.35), f: rnd(0, 6.28), c: pick(PARTY), life: 1 })
      }
      for (let i = 0; i < 7 * k; i++) {
        const a = ((base + rnd(-14, 14)) * Math.PI) / 180
        const v = rnd(11, 20)
        ribbons.push({ pts: [[x, y]], x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, c: pick(PARTY), age: 0, ph: rnd(0, 6.28) })
      }
    }

    // schedule: rockets keep the sky busy; poppers go off in volleys
    const rocketLoop = () => {
      if (!running) return
      if (visible) {
        launch()
        if (Math.random() < 0.45) later(launch, 220)
      }
      later(rocketLoop, rnd(750, 1400))
    }
    const popperLoop = () => {
      if (!running) return
      if (visible) {
        popper(-1)
        popper(1)
        later(() => { popper(-1); popper(1) }, 380)
      }
      later(popperLoop, 4800)
    }
    later(rocketLoop, 400)
    later(popperLoop, 1100)

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.05 })
    io.observe(parent)

    let raf
    let last = performance.now()
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      if (!visible || document.hidden) { last = now; return }
      const dt = Math.min(2, (now - last) / 16.67)
      last = now

      // fireworks layer: fade for glowing trails instead of clearing
      fctx.globalCompositeOperation = 'destination-out'
      fctx.fillStyle = 'rgba(0,0,0,.2)'
      fctx.fillRect(0, 0, W, H)
      fctx.globalCompositeOperation = 'lighter'
      fctx.lineCap = 'round'
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.x += r.vx * dt; r.y += r.vy * dt; r.t += dt
        fctx.strokeStyle = '#ffe9a8'; fctx.lineWidth = 2
        fctx.beginPath(); fctx.moveTo(r.x - r.vx * 2, r.y - r.vy * 2); fctx.lineTo(r.x, r.y); fctx.stroke()
        if (r.t >= 46 || r.y <= r.ty) { burst(r.x, r.y); rockets.splice(i, 1) }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.px = s.x; s.py = s.y
        s.vx *= 0.975; s.vy = s.vy * 0.975 + 0.045 * dt
        s.x += s.vx * dt; s.y += s.vy * dt
        s.life -= s.d * dt
        if (s.life <= 0) { sparks.splice(i, 1); continue }
        fctx.globalAlpha = Math.min(1, s.life * 1.4)
        fctx.strokeStyle = s.c
        fctx.lineWidth = 1 + s.life * 1.8
        fctx.beginPath(); fctx.moveTo(s.px, s.py); fctx.lineTo(s.x, s.y); fctx.stroke()
      }
      fctx.globalAlpha = 1

      // confetti + streamers layer: crisp, cleared every frame
      cctx.clearRect(0, 0, W, H)
      for (let i = bits.length - 1; i >= 0; i--) {
        const b = bits[i]
        b.vx *= 0.86; b.vy = b.vy * 0.935 + 0.2 * dt
        b.x += b.vx * dt; b.y += b.vy * dt; b.r += b.vr * dt; b.f += 0.2 * dt
        if (b.y > H * 0.78) b.life -= 0.06 * dt
        if (b.life <= 0 || b.y > H + 20) { bits.splice(i, 1); continue }
        cctx.save()
        cctx.globalAlpha = b.life
        cctx.translate(b.x, b.y); cctx.rotate(b.r); cctx.scale(1, Math.cos(b.f))
        cctx.fillStyle = b.c; cctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h)
        cctx.restore()
      }
      cctx.lineCap = 'round'; cctx.lineJoin = 'round'
      for (let i = ribbons.length - 1; i >= 0; i--) {
        const r = ribbons[i]
        r.age += dt
        r.vx *= 0.86; r.vy = r.vy * 0.93 + 0.12 * dt
        r.x += r.vx * dt + Math.sin(r.age * 0.35 + r.ph) * 0.9
        r.y += r.vy * dt
        r.pts.push([r.x, r.y])
        if (r.pts.length > 34) r.pts.shift()
        if (r.age > 70 || r.y > H + 30) { ribbons.splice(i, 1); continue }
        cctx.globalAlpha = Math.max(0, 1 - r.age / 70)
        cctx.strokeStyle = r.c; cctx.lineWidth = 3
        cctx.beginPath(); r.pts.forEach(([x, y], j) => (j ? cctx.lineTo(x, y) : cctx.moveTo(x, y))); cctx.stroke()
      }
      cctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(tick)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      timers.forEach(clearTimeout)
      ro.disconnect()
      io.disconnect()
    }
  }, [play])

  return (
    <>
      <canvas ref={fxRef} className="herofx herofx--sky" aria-hidden="true" />
      <canvas ref={cfRef} className="herofx herofx--party" aria-hidden="true" />
    </>
  )
}
