import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP, onViewportResize } from '../lib/gsap'
import { downloadIcs } from '../lib/calendar'
import { pointAt, trailTo } from '../lib/heartPath'
import { LenisContext, useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import { ArrowIcon, AttireIcon, CalendarIcon, ClockIcon, PinIcon } from './Icons'
import './Events.css'

const mapsUrl = (e) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`

// The page of ceremonies, laid out like a long sheet: a header, then one 400px row per ceremony, the illustration
// alternating sides. The heart travels a dashed path from one illustration's marker to the next.
const HEAD = 160 // header height
const ROW = 400 // one ceremony
const EYE = HEAD + ROW / 2 // the marker's height in the first row, and the height on screen the heart rides at

// each ceremony's illustration
const ART = {
  mehndi: '/events/mehndi.webp',
  maiyan: '/events/maiyan.webp',
  anand: '/events/anand-karaj.webp',
  reception: '/events/reception.webp',
}

// the dashed path, in page coordinates: in from the left under the title to the first marker, then an S-curve from
// each marker to the next, crossing the page as it drops one row
function journey(w, n) {
  const mx = (k) => (k % 2 === 0 ? 0.72 : 0.25) * w
  const segs = [
    { p0: { x: -15, y: 30 }, p1: { x: 0.35 * w, y: 40 }, p2: { x: 0.48 * w, y: 75 }, p3: { x: 0.5 * w, y: 115 } },
    { p0: { x: 0.5 * w, y: 115 }, p1: { x: 0.52 * w, y: 165 }, p2: { x: 0.7 * w, y: EYE - 45 }, p3: { x: mx(0), y: EYE } },
  ]
  for (let k = 1; k < n; k++) {
    const a = { x: mx(k - 1), y: EYE + (k - 1) * ROW }
    const b = { x: mx(k), y: EYE + k * ROW }
    const toLeft = b.x < a.x
    segs.push({
      p0: a,
      p1: { x: (toLeft ? 0.68 : 0.3) * w, y: a.y + 0.38 * ROW },
      p2: { x: (toLeft ? 0.3 : 0.68) * w, y: a.y + 0.62 * ROW },
      p3: b,
    })
  }
  return segs
}
// position along the path for "ceremony k reached" (the entry takes two curves, each hop one)
const stopAt = (k) => (k < 0 ? 0 : k + 2)

function Ceremony({ ev, k, reached }) {
  const side = k % 2 === 0 ? 'left' : 'right' // where the details sit; the illustration takes the other side
  return (
    <div className={`cer-row${reached ? ' is-reached' : ''}`}>
      <article className={`cer-details cer-details--${side}`}>
        <p className="cer-pa gurmukhi">{ev.gurmukhi}</p>
        <h3 className="cer-name">{ev.name}</h3>
        <ul className="cer-info">
          <li style={{ '--i': 0 }}><CalendarIcon /><span className="cer-strong">{ev.date}</span></li>
          <li style={{ '--i': 1 }}><ClockIcon /><span className="cer-strong">{ev.time}</span></li>
          <li style={{ '--i': 2 }}><PinIcon /><span><strong>{ev.venue}</strong><small>{ev.address}</small></span></li>
          <li style={{ '--i': 3 }}><AttireIcon /><span className="cer-dress">{ev.attire}</span></li>
        </ul>
        <div className="cer-actions">
          <a className="cer-link" href={mapsUrl(ev)} target="_blank" rel="noreferrer">View location <ArrowIcon /></a>
          <button type="button" className="cer-cal" onClick={() => downloadIcs({ title: ev.name, start: ev.start, location: `${ev.venue}, ${ev.address}`, description: ev.description })}>
            <CalendarIcon /> Save to Calendar
          </button>
        </div>
      </article>
      <div className={`cer-media cer-media--${side === 'left' ? 'right' : 'left'}`} aria-hidden="true">
        <div className="cer-art">
          <img className="cer-img" src={ART[ev.theme] ?? ART.anand} alt="" decoding="async" loading="lazy" />
        </div>
      </div>
      <div className={`cer-marker cer-marker--${side === 'left' ? 'right' : 'left'}`} aria-hidden="true">
        <span className="cer-badge">— {String(k + 1).padStart(2, '0')} —</span>
        <span className="cer-ripple">
          <svg viewBox="0 0 140 60">
            <ellipse cx="70" cy="30" rx="64" ry="22" />
            <ellipse cx="70" cy="30" rx="44" ry="15" />
            <ellipse cx="70" cy="30" rx="24" ry="8" />
          </svg>
          <i className="cer-dot" />
          <svg className="cer-stem" viewBox="0 0 14 32">
            <path d="M 7 0 L 7 32" />
            <path d="M 7 14 Q 14 10 13 4" />
            <path d="M 7 24 Q 0 20 2 14" />
          </svg>
        </span>
      </div>
      <div className="cer-flourish" aria-hidden="true"><span>❦</span></div>
    </div>
  )
}

export default function Events() {
  const root = useRef(null)
  const track = useRef(null)
  const page = useRef(null)
  const heart = useRef(null)
  const terrace = useRef(null)
  const trail = useRef(null)
  const paper = useRef(null)
  const lenis = useContext(LenisContext)
  const [reached, setReached] = useState(-1) // the furthest ceremony the heart has arrived at
  const scrollTo = useScrollTo()
  const opened = useInView(root, { once: true, amount: 0.4 })
  const n = wedding.events.length

  // The section holds still (CSS `position: sticky`) inside a track tall enough for one stretch of scroll per ceremony;
  // ScrollTrigger only reads how far through the track we are.
  const [vh, setVh] = useState(0)
  useLayoutEffect(() => {
    const el = root.current
    const measure = () => {
      // continue the damask of the sheet above, so the seam between the two papers shows no line
      const prev = el.parentElement.previousElementSibling
      el.style.setProperty('--paper-y', `${prev ? -(prev.offsetHeight % 120) : 0}px`)
      setVh(window.innerHeight)
    }
    measure()
    return onViewportResize(measure)
  }, [])
  const extra = ROW * (n - 1) // one row of scrolling per ceremony: the page moves exactly as far as the finger does
  useEffect(() => { if (vh) ScrollTrigger.refresh() }, [vh])

  useGSAP(
    () => {
      // The camera: the heart holds its height on screen and only swings across, while the whole page under it (title,
      // ceremonies, the dashed trail and the paper) scrolls up one row per ceremony. Everything follows the scroll itself
      // (lightly smoothed), so the page moves as the guest swipes, and settles on the nearest ceremony when they stop.
      let segs = []
      const pos = { s: 0 }
      const camAt = (s) => (s <= stopAt(0) ? 0 : pointAt(segs, s).y - EYE)
      let shownReached = -1
      const render = () => {
        if (!segs.length) return
        const cam = camAt(pos.s)
        const p = pointAt(segs, pos.s)
        heart.current.style.transform = `translate3d(${p.x}px, ${p.y - cam}px, 0)`
        heart.current.style.opacity = Math.min(1, pos.s / 0.08)
        trail.current.setAttribute('d', trailTo(segs, pos.s))
        page.current.style.transform = `translate3d(0, ${-cam}px, 0)`
        // the pavilions close the page: they scroll up with it and settle at the foot of the screen with the last ceremony
        terrace.current.style.transform = `translate3d(-50%, ${Math.max(0, (n - 1) * ROW - cam)}px, 0)`
        // the damask is its own layer, moved (not repainted): one 120px tile of travel is all it ever needs
        paper.current.style.transform = `translate3d(0, ${-(((cam % 120) + 120) % 120)}px, 0)`
        // a ceremony opens up as the heart arrives at it
        const r = Math.floor(pos.s + 0.12) - 2
        if (r > shownReached) { shownReached = r; setReached(r) }
      }
      const layout = () => {
        segs = journey(page.current.offsetWidth, n)
        render()
      }
      const reduced = prefersReducedMotion()
      // the first arrival (in from the left, under the title) plays as one flight; after that the scroll drives it
      let entry
      const follow = gsap.quickTo(pos, 's', { duration: reduced ? 0.01 : 0.55, ease: 'power3', onUpdate: render })
      const target = (self) => (self.scroll() < self.start ? 0 : stopAt(0) + self.progress * (n - 1))
      const drive = (self) => {
        const to = target(self)
        if (to === 0) { entry?.kill(); entry = null; follow(0); return }
        if (pos.s < stopAt(0) - 0.01 || entry?.isActive()) {
          // still coming in: finish the entry flight, then hand over to the scroll
          if (!entry || !entry.isActive()) {
            follow.tween.pause()
            entry = gsap.to(pos, { s: stopAt(0), duration: reduced ? 0.01 : 1.6, ease: 'power1.inOut', onUpdate: render, onComplete: () => follow(target(self)) })
          }
          return
        }
        follow(to)
      }
      layout()
      const ro = new ResizeObserver(layout)
      ro.observe(page.current)

      // when the guest stops between two ceremonies, glide the last little way to the nearer one
      let settle
      const snap = (self) => {
        clearTimeout(settle)
        settle = setTimeout(() => {
          const l = lenis.current
          if (!l || !self.isActive || reduced) return
          const steps = n - 1
          const k = Math.round(self.progress * steps)
          const y = self.start + (k / steps) * (self.end - self.start)
          if (Math.abs(y - self.scroll()) > 2) l.scrollTo(y, { duration: 0.7, easing: (t) => 1 - (1 - t) ** 3 })
        }, 180)
      }

      ScrollTrigger.create({
        trigger: track.current,
        start: 'top top',
        end: () => `+=${ROW * (n - 1)}`,
        onUpdate: (self) => { drive(self); snap(self) },
        onRefresh: (self) => { entry?.kill(); entry = null; pos.s = target(self); render() },
      })
      return () => { ro.disconnect(); clearTimeout(settle) }
    },
    { scope: root },
  )

  return (
    <div className="events-track" ref={track} style={{ height: vh ? `calc(var(--full-h) + ${extra}px)` : undefined }}>
      <section id="events" ref={root} className={`cer${opened ? ' is-open' : ''}`} data-chapter data-dwell="7">
        <div className="cer-paper" ref={paper} aria-hidden="true" />
        <div className="cer-viewport">
          <div className="cer-page" ref={page}>
            <img className="cer-decor" src="/events/header-decor.webp" alt="" width="760" height="428" aria-hidden="true" />
            <svg className="cer-trail" aria-hidden="true"><path ref={trail} d="" /></svg>
            <header className="cer-head">
              <p className="cer-eyebrow gurmukhi">ਸਮਾਗਮ</p>
              <h2 className="cer-title">The Celebrations</h2>
            </header>
            {wedding.events.map((e, k) => <Ceremony key={e.id} ev={e} k={k} reached={k <= reached} />)}
            <p className="cer-cta">
              <a href="#rsvp" onClick={(e) => { e.preventDefault(); scrollTo('#rsvp') }}>Will you dance with us? <span className="gurmukhi">ਆਓ ਨੱਚੀਏ!</span> <ArrowIcon /></a>
            </p>
          </div>
          <div className="cer-heart" ref={heart} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /></svg>
          </div>
        </div>
        <div className="cer-terrace" ref={terrace} aria-hidden="true">
          <img src="/thanks-pavilions.webp" alt="" width="1247" height="680" decoding="async" />
        </div>
      </section>
    </div>
  )
}
