import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap, useGSAP } from '../lib/gsap'
import { LenisContext } from '../lib/smoothScroll'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import PunjabClock from './PunjabClock'
import './Countdown.css'

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  return [
    { value: Math.floor(diff / 864e5), label: 'Days', pa: 'ਦਿਨ' },
    { value: Math.floor(diff / 36e5) % 24, label: 'Hours', pa: 'ਘੰਟੇ' },
    { value: Math.floor(diff / 6e4) % 60, label: 'Minutes', pa: 'ਮਿੰਟ' },
    { value: Math.floor(diff / 1e3) % 60, label: 'Seconds', pa: 'ਸਕਿੰਟ' },
  ]
}

// Torn-paper outlines for the four cards: straight sides, ragged top and foot, each one different
function seeded(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function tornPath(seed) {
  const r = seeded(seed)
  const pts = []
  const n = 20
  for (let i = 0; i <= n; i++) pts.push([Math.min(1, Math.max(0, i / n + (i && i < n ? (r() - 0.5) * 0.025 : 0))), 0.012 + r() * r() * 0.035])
  for (let i = 1; i < 5; i++) pts.push([1 - r() * 0.014, i / 5])
  for (let i = n; i >= 0; i--) pts.push([Math.min(1, Math.max(0, i / n + (i && i < n ? (r() - 0.5) * 0.025 : 0))), 0.985 - r() * r() * 0.035])
  for (let i = 4; i >= 1; i--) pts.push([r() * 0.014, i / 5])
  return `M${pts.map(([x, y]) => `${x.toFixed(3)} ${y.toFixed(3)}`).join('L')}Z`
}
const TORN = [11, 29, 47, 83].map(tornPath)

// Bits of torn paper that drop from under the guest's finger as the cover is rubbed away
const PETAL_COLOURS = ['#fffaf2', '#f6ecdf', '#eddcc4', '#e4cfa9', '#fdf3e2'] // torn bits of ivory paper
function dropPetals(x, y, n = 2) {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const room = 48 - document.querySelectorAll('.scratch-petal').length // never more than a light flurry at once
  for (let i = 0; i < Math.min(n, room); i++) {
    const p = document.createElement('i')
    p.className = 'scratch-petal'
    p.style.left = `${x}px`
    p.style.top = `${y}px`
    p.style.background = PETAL_COLOURS[(Math.random() * PETAL_COLOURS.length) | 0]
    document.body.appendChild(p)
    gsap.fromTo(p,
      { x: gsap.utils.random(-10, 10), y: 0, rotation: gsap.utils.random(0, 360), scale: gsap.utils.random(0.6, 1.2), autoAlpha: 1 },
      { x: `+=${gsap.utils.random(-70, 70)}`, y: gsap.utils.random(140, 260), rotation: `+=${gsap.utils.random(-260, 260)}`, rotationX: gsap.utils.random(120, 360),
        autoAlpha: 0, duration: gsap.utils.random(1.4, 2.3), ease: 'power1.in', onComplete: () => p.remove() })
  }
}

// A gold scalloped seal laid over the number: rub it away with a finger or the mouse to reveal it.
function ScratchSeal({ revealed, onReveal, label = 'TO REVEAL' }) {
  const ref = useRef(null)
  const drawing = useRef(false)
  const moves = useRef(0)
  const revealedRef = useRef(false)

  useEffect(() => {
    const c = ref.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = c.offsetWidth
    const h = c.offsetHeight
    c.width = w * dpr
    c.height = h * dpr
    const x = c.getContext('2d')
    x.scale(dpr, dpr)
    // a cover of champagne gold foil: fine grain, a soft diagonal sheen, a tiny lotus, "Scratch" in deep rose
    const g = x.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#e9d09a'); g.addColorStop(0.35, '#d9b76f'); g.addColorStop(0.6, '#ecd8a4'); g.addColorStop(1, '#c79f55')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    const sheen = x.createLinearGradient(0, 0, w, h)
    sheen.addColorStop(0.3, 'rgba(255, 248, 220, 0)'); sheen.addColorStop(0.45, 'rgba(255, 248, 220, .5)'); sheen.addColorStop(0.6, 'rgba(255, 248, 220, 0)')
    x.fillStyle = sheen
    x.fillRect(0, 0, w, h)
    // foil grain
    for (let i = 0; i < Math.round((w * h) / 14); i++) {
      x.fillStyle = Math.random() < 0.5 ? 'rgba(255, 244, 205, .35)' : 'rgba(150, 105, 40, .22)'
      x.fillRect(Math.random() * w, Math.random() * h, 1, 1)
    }
    // fine ivory keyline
    x.strokeStyle = 'rgba(255, 248, 225, .75)'
    x.lineWidth = 1
    x.setLineDash([2, 4])
    x.strokeRect(w * 0.08, h * 0.1, w * 0.84, h * 0.8)
    x.setLineDash([])
    // little lotus above the word
    x.save()
    x.translate(w / 2, h * 0.3)
    x.strokeStyle = 'rgba(125, 39, 66, .6)'
    x.lineWidth = 1.2
    const lw = Math.min(w * 0.09, h * 0.11)
    for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
      x.save(); x.rotate(a); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(lw * 0.5, -lw * 0.9, 0, -lw * 1.5); x.quadraticCurveTo(-lw * 0.5, -lw * 0.9, 0, 0); x.stroke(); x.restore()
    }
    x.restore()
    x.fillStyle = '#7d2742'
    x.font = `400 ${Math.max(18, Math.min(w * 0.2, h * 0.36))}px "Great Vibes", cursive`
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText('Scratch', w / 2, h * 0.55)
    x.font = `500 ${Math.max(8, Math.min(w * 0.062, h * 0.1))}px "Cinzel", serif`
    x.fillStyle = 'rgba(125, 39, 66, .75)'
    x.fillText(label, w / 2, h * 0.74)
  }, [])

  // how much paper is left? sample the middle of the card
  const checkClear = useCallback(() => {
    const c = ref.current
    const x = c.getContext('2d')
    const d = x.getImageData(c.width * 0.12, c.height * 0.12, c.width * 0.76, c.height * 0.76).data
    let clear = 0
    let n = 0
    for (let i = 3; i < d.length; i += 64) { n++; if (d[i] < 40) clear++ }
    if (clear / n > 0.5) {
      if (!revealedRef.current) { const b = c.getBoundingClientRect(); dropPetals(b.left + b.width / 2, b.top + b.height / 2, 14) }
      revealedRef.current = true
      onReveal()
    }
  }, [onReveal])

  const scratch = useCallback((e) => {
    const c = ref.current
    const r = c.getBoundingClientRect()
    const x = c.getContext('2d')
    const dpr = c.width / r.width
    x.save()
    x.globalCompositeOperation = 'destination-out'
    x.beginPath()
    x.arc((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr, Math.max(14, r.width * 0.11) * dpr, 0, Math.PI * 2)
    x.fill()
    x.restore()
    if (moves.current % 2 === 0) dropPetals(e.clientX, e.clientY, 1) // the paper you rub away drops off petal by petal
    if (++moves.current % 6) return
    checkClear()
  }, [checkClear])

  return (
    <canvas
      ref={ref}
      className={`scratchseal${revealed ? ' is-gone' : ''}`}
      onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e) }}
      onPointerMove={(e) => drawing.current && scratch(e)}
      onPointerUp={() => { drawing.current = false }}
      onPointerCancel={() => { drawing.current = false }}
      aria-hidden="true"
    />
  )
}

const toCalendarStamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

function calendarUrl() {
  const ceremony = wedding.events.find((e) => e.id === 'anand-karaj') ?? wedding.events[0]
  const start = new Date(wedding.date)
  const end = new Date(start.getTime() + 3 * 36e5)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${wedding.bride.name} & ${wedding.groom.name} — ${ceremony.name}`,
    dates: `${toCalendarStamp(start)}/${toCalendarStamp(end)}`,
    location: `${ceremony.venue}, ${ceremony.address}`,
    details: `${wedding.blessingLine} · ${wedding.hashtag}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

export default function Countdown() {
  const root = useRef(null)
  const units = useCountdown(wedding.date)
  const [dateOpen, setDateOpen] = useState(false)
  const [weekday, dayMonthYear] = wedding.dateLabel.split(', ')
  useReveal(root)
  const lenisRef = useContext(LenisContext)

  // The Date Reveal opens this page. If the guest stops scrolling with its heading tucked under the notch, the page
  // settles gently back onto its own top so the heading and the card show whole.
  useEffect(() => {
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const settle = () => {
      const el = root.current
      if (!el || document.documentElement.classList.contains('is-locked')) return
      const top = el.getBoundingClientRect().top
      if (top < -120 || top > -6) return // only when the heading is tucked under the top edge; never pull a reader back from further down
      const y = top + window.scrollY
      if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: 0.9, easing: ease })
      else window.scrollTo({ top: y, behavior: 'smooth' })
    }
    // run once scrolling has rested for a moment (Lenis moves the window, so plain scroll events see every frame)
    let t = 0
    const onScroll = () => { clearTimeout(t); t = setTimeout(settle, 220) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScroll) }
  }, [lenisRef])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.countdown__mandala',
          { rotation: -40, scale: 0.85 },
          {
            rotation: 40,
            scale: 1.1,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.from('.unit', {
          y: 50,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.55,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.countdown__units', start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section countdown chap sky-bg" data-chapter data-dwell="5">
      <svg className="torn-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          {TORN.map((d, k) => <clipPath key={k} id={`torn${k}`} clipPathUnits="objectBoundingBox"><path d={d} /></clipPath>)}
        </defs>
      </svg>
      <Mandala className="countdown__mandala" />
      <div className="countdown__inner">
        {/* the date itself is a surprise: rub away the gold foil to reveal it */}
        <header className="datecard__head reveal">
          <p className="datecard__head-pa gurmukhi">ਸ਼ੁਭ ਤਾਰੀਖ਼</p>
          <h3 className="datecard__title">The Date Reveal</h3>
        </header>
        <div className={`datecard reveal${dateOpen ? ' is-open' : ''}`}>
          <div className="datecard__face" aria-label={dateOpen ? wedding.dateLabel : 'Scratch to reveal the date'}>
            <span className="datecard__eyebrow">Save the date</span>
            <span className="datecard__day">{weekday}</span>
            <span className="datecard__date">{dayMonthYear}</span>
            <span className="datecard__pa gurmukhi">ਸ਼ੁਭ ਦਿਹਾੜਾ</span>
          </div>
          <ScratchSeal revealed={dateOpen} onReveal={() => setDateOpen(true)} label="THE DATE" />
        </div>
        <p className="countdown__hint datecard__hint">
          {dateOpen ? 'See you there' : <>Scratch the foil to reveal the date <button type="button" onClick={() => setDateOpen(true)}>Reveal</button></>}
        </p>
        <PunjabClock />
        <div className="countdown__units" role="timer" aria-live="off">
          {units.map((u, k) => (
            <div className="unit" key={u.label}>
              {/* a fresh card for every new number: the old one drops away and the new one falls into place */}
              <AnimatePresence initial={false}>
                <motion.div
                  key={u.value}
                  className="ucard"
                  initial={{ y: '-115%', rotate: u.value % 2 ? -7 : 7, opacity: 0 }}
                  animate={{ y: '0%', rotate: 0, opacity: 1, transition: { duration: 0.6, ease: [0.34, 1.35, 0.64, 1] } }}
                  exit={{ y: '125%', rotate: u.value % 2 ? 16 : -16, opacity: 0, transition: { duration: 0.55, ease: [0.55, 0.05, 0.95, 0.45] } }}
                >
                  <i className="ucard__pin" aria-hidden="true" />
                  <div className="unit__digits">{String(u.value).padStart(2, '0')}</div>
                  <i className="unit__rule" aria-hidden="true" />
                  <span className="unit__label">
                    {u.label} <span className="gurmukhi">{u.pa}</span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          ))}
        </div>
        <p className="countdown__hint reveal">Every moment counted</p>
        <a className="btn btn--ghost reveal" href={calendarUrl()} target="_blank" rel="noreferrer">
          Save the date
        </a>
      </div>
      <img className="countdown__scene" src="/wedding-scene.webp" alt="" aria-hidden="true" width="1644" height="957" loading="lazy" decoding="async" />
    </section>
  )
}
