import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
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

function Digit({ value }) {
  return (
    <span className="digit">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="digit__value"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}


// Rose petals that fall from under the guest's finger as the cover is rubbed away
const PETAL_COLOURS = ['#f2c4cc', '#e9a6b4', '#dc8a9d', '#f6d3d9', '#c9707f', '#f9e3e6']
function dropPetals(x, y, n = 2) {
  if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const room = 36 - document.querySelectorAll('.scratch-petal').length // never more than a light flurry at once
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
function ScratchSeal({ revealed, onReveal }) {
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
    // a cover of scattered rose petals on blush, flecked with gold, with "Scratch" written across it
    const g = x.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#f7d9dc'); g.addColorStop(0.5, '#efbcc5'); g.addColorStop(1, '#e3a0b0')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    const petals = ['#f9e3e6', '#f2c4cc', '#e9a6b4', '#dc8a9d', '#f6d3d9', '#c9707f']
    const n = Math.round((w * h) / 260)
    for (let i = 0; i < n; i++) {
      const px = Math.random() * w
      const py = Math.random() * h
      const r = (0.05 + Math.random() * 0.07) * w
      x.save()
      x.translate(px, py)
      x.rotate(Math.random() * Math.PI * 2)
      x.globalAlpha = 0.55 + Math.random() * 0.4
      x.fillStyle = petals[i % petals.length]
      x.beginPath()
      x.ellipse(0, 0, r, r * 0.52, 0, 0, Math.PI * 2)
      x.fill()
      x.globalAlpha = 0.25
      x.strokeStyle = '#ffffff'
      x.lineWidth = 0.8
      x.beginPath()
      x.moveTo(-r * 0.7, 0)
      x.quadraticCurveTo(0, -r * 0.18, r * 0.7, 0)
      x.stroke()
      x.restore()
    }
    for (let i = 0; i < 60; i++) {
      x.fillStyle = `rgba(226, 183, 101, ${0.4 + Math.random() * 0.5})`
      x.beginPath()
      x.arc(Math.random() * w, Math.random() * h, 0.6 + Math.random() * 1.1, 0, Math.PI * 2)
      x.fill()
    }
    // soft ivory band for the label
    const band = x.createLinearGradient(0, h * 0.42, 0, h * 0.62)
    band.addColorStop(0, 'rgba(255, 250, 246, 0)'); band.addColorStop(0.5, 'rgba(255, 250, 246, .8)'); band.addColorStop(1, 'rgba(255, 250, 246, 0)')
    x.fillStyle = band
    x.fillRect(0, h * 0.42, w, h * 0.2)
    x.fillStyle = '#a63f5b'
    x.font = `400 ${Math.max(18, w * 0.2)}px "Great Vibes", cursive`
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.fillText('Scratch', w / 2, h * 0.52)
  }, [])

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
    if (moves.current % 4 === 0) dropPetals(e.clientX, e.clientY, 1)
    if (++moves.current % 6) return
    // how much gold is left? sample the middle of the seal
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
  const [open, setOpen] = useState([false, false, false, false])
  const reveal = (k) => setOpen((o) => (o[k] ? o : o.map((v, i) => v || i === k)))
  const allOpen = open.every(Boolean)
  useReveal(root)

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
      <Mandala className="countdown__mandala" />
      <div className="countdown__inner">
        <SectionTitle eyebrow="ਉਲਟੀ ਗਿਣਤੀ" title="Counting the Moments" />
        <p className="countdown__date reveal">{wedding.dateLabel}</p>
        <PunjabClock />
        <div className="countdown__units" role="timer" aria-live="off">
          {units.map((u, k) => (
            <div className="unit" key={u.label}>
              <ScratchSeal revealed={open[k]} onReveal={() => reveal(k)} />
              <span className="unit__diya" aria-hidden="true"><i className="unit__flame" /><b /></span>
              <div className="unit__digits">
                {String(u.value)
                  .padStart(2, '0')
                  .split('')
                  .map((d, i, arr) => (
                    <Digit key={arr.length - i} value={d} />
                  ))}
              </div>
              <i className="unit__rule" aria-hidden="true" />
              <span className="unit__label">
                {u.label} <span className="gurmukhi">{u.pa}</span>
              </span>
            </div>
          ))}
        </div>
        <p className="countdown__hint reveal">
          {allOpen ? 'Every moment counted' : <>Scratch to reveal <button type="button" onClick={() => setOpen([true, true, true, true])}>Reveal all</button></>}
        </p>
        <a className="btn btn--ghost reveal" href={calendarUrl()} target="_blank" rel="noreferrer">
          Save the date
        </a>
      </div>
      <img className="countdown__scene" src="/wedding-scene.webp" alt="" aria-hidden="true" width="1644" height="957" loading="lazy" decoding="async" />
    </section>
  )
}
