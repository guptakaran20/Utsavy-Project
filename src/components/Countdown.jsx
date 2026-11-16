import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import Mandala from './Mandala'
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


// A gold scalloped seal laid over the number: rub it away with a finger or the mouse to reveal it.
function ScratchSeal({ revealed, onReveal }) {
  const ref = useRef(null)
  const drawing = useRef(false)
  const moves = useRef(0)

  useEffect(() => {
    const c = ref.current
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = c.offsetWidth
    const h = c.offsetHeight
    c.width = w * dpr
    c.height = h * dpr
    const x = c.getContext('2d')
    x.scale(dpr, dpr)
    const g = x.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#f4dc8e'); g.addColorStop(0.35, '#d9aa48'); g.addColorStop(0.55, '#f6e19a'); g.addColorStop(1, '#b8862f')
    x.fillStyle = g
    x.fillRect(0, 0, w, h)
    for (let i = 0; i < 70; i++) {
      x.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`
      x.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
    }
    x.fillStyle = '#6a3a14'
    x.font = `600 ${Math.max(11, w * 0.1)}px "Cinzel", "Cormorant Garamond", serif`
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.letterSpacing = '0.12em'
    x.fillText('SCRATCH', w / 2, h / 2)
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
    if (++moves.current % 6) return
    // how much gold is left? sample the middle of the seal
    const d = x.getImageData(c.width * 0.12, c.height * 0.12, c.width * 0.76, c.height * 0.76).data
    let clear = 0
    let n = 0
    for (let i = 3; i < d.length; i += 64) { n++; if (d[i] < 40) clear++ }
    if (clear / n > 0.5) onReveal()
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
        <div className="countdown__units" role="timer" aria-live="off">
          {units.map((u, k) => (
            <div className="unit" key={u.label}>
              <ScratchSeal revealed={open[k]} onReveal={() => reveal(k)} />
              <i className="unit__flame" aria-hidden="true" />
              <div className="unit__digits">
                {String(u.value)
                  .padStart(2, '0')
                  .split('')
                  .map((d, i, arr) => (
                    <Digit key={arr.length - i} value={d} />
                  ))}
              </div>
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
