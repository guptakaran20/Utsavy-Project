import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP, onViewportResize } from '../lib/gsap'
import { downloadIcs } from '../lib/calendar'
import { pointAt, trailTo } from '../lib/heartPath'
import { LenisContext, useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import { ArrowIcon, AttireIcon, CalendarIcon, ClockIcon, PinIcon } from './Icons'
import './Events.css'

// the size the paper tile is drawn at (--paper-tile in index.css)
const PAPER_TILE = 480

const mapsUrl = (e) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`

// The page of ceremonies, laid out like a long sheet: a header, then one 400px row per ceremony, the illustration
// alternating sides. The heart travels a dashed path from one illustration's marker to the next.
const HEAD = 160 // header height
const ROW = 400 // one ceremony
const EYE = HEAD + ROW / 2 // the marker's height in the first row, and the height on screen the heart rides at
// Scroll needed to travel one ceremony. On a touch screen the browser's momentum carries a flick a long way, so at 1:1
// a small swipe raced past several ceremonies; there the page is geared down to move at about half the finger's speed.
const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const stepFor = (touch) => (touch ? ROW * 2.2 : ROW)

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
      el.style.setProperty('--paper-y', `${prev ? -(prev.offsetHeight % PAPER_TILE) : 0}px`)
      setVh(window.innerHeight)
    }
    measure()
    return onViewportResize(measure)
  }, [])
  const [step] = useState(() => stepFor(isTouch()))
  const extra = step * (n - 1) // one step of scrolling per ceremony
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
      let lastTrail = -1
      const render = () => {
        if (!segs.length) return
        const cam = camAt(pos.s)
        const p = pointAt(segs, pos.s)
        heart.current.style.transform = `translate3d(${p.x}px, ${p.y - cam}px, 0)`
        heart.current.style.opacity = Math.min(1, pos.s / 0.08)
        // the dashed trail is a repaint of a page-tall SVG, so redraw it only when the heart has moved a visible amount
        if (Math.abs(pos.s - lastTrail) > 0.004 || pos.s === 0) { lastTrail = pos.s; trail.current.setAttribute('d', trailTo(segs, pos.s)) }
        page.current.style.transform = `translate3d(0, ${-cam}px, 0)`
        // the pavilions close the page: they scroll up with it and settle at the foot of the screen with the last ceremony
        terrace.current.style.transform = `translate3d(-50%, ${Math.max(0, (n - 1) * ROW - cam)}px, 0)`
        // (the paper holds still behind the moving page: its painted flowers sliding by on every hop read as the
        // background changing between ceremonies)
        // a ceremony opens up as the heart arrives at it
        const r = Math.floor(pos.s + 0.12) - 2
        if (r > shownReached) { shownReached = r; setReached(r) }
      }
      const layout = () => {
        segs = journey(page.current.offsetWidth, n)
        lastTrail = -1
        render()
      }
      const reduced = prefersReducedMotion()
      // On a touch screen the finger and the browser's own momentum drive the scroll: the page follows them closely, and
      // is never pulled to a ceremony afterwards. (The pull fought the finger, and a short swipe snapped straight back to
      // the same ceremony, so on a phone the later ceremonies could not be reached.)
      const touch = isTouch()
      // Everything is driven by the scroll position, the first arrival included: while the section rises into view the
      // heart flies in from the left to the first ceremony, so it is already there when the section holds still. (It
      // used to play as a timed flight once the section stuck, and the scroll ran on underneath it, so the first ceremony
      // was skipped on the way down and the flight played backwards, glitching, on the way up.)
      const step = stepFor(touch)
      let pin0 = 0 // the scroll at which the section sticks: the first ceremony
      const follow = gsap.quickTo(pos, 's', { duration: reduced ? 0.01 : touch ? 0.32 : 0.55, ease: touch ? 'power2' : 'power3', onUpdate: render })
      const target = (self) => {
        const y = self.scroll()
        if (y <= self.start) return 0
        if (y < pin0) return (stopAt(0) * (y - self.start)) / (pin0 - self.start)
        return Math.min(stopAt(n - 1), stopAt(0) + (y - pin0) / step)
      }
      const drive = (self) => follow(target(self))
      layout()
      const ro = new ResizeObserver(layout)
      ro.observe(page.current)

      // When the guest stops between two ceremonies, glide the rest of the way: on to the next one in the direction they
      // were scrolling once they have moved a little (so a single wheel notch advances instead of snapping back).
      let settle
      const snap = (self) => {
        if (touch || reduced) return
        clearTimeout(settle)
        const dir = self.direction
        settle = setTimeout(() => {
          const l = lenis.current
          const y = self.scroll()
          // only while the section holds still, or in the last stretch of it rising into view
          // (and never on the way out: heading up past the first ceremony is leaving the section, not a stop)
          if (!l || y >= self.end || y < pin0 - (pin0 - self.start) * 0.35 || (dir < 0 && y < pin0)) return
          const f = (y - pin0) / step
          const k = Math.max(0, Math.min(n - 1, dir > 0 ? Math.ceil(f - 0.15) : Math.floor(f + 0.15)))
          const to = pin0 + k * step
          if (Math.abs(to - y) > 2) l.scrollTo(to, { duration: 0.7, easing: (t) => 1 - (1 - t) ** 3 })
        }, 160)
      }

      ScrollTrigger.create({
        trigger: track.current,
        // the heart's flight in starts when the section's top is halfway up the screen
        start: () => {
          pin0 = Math.round(track.current.getBoundingClientRect().top + window.scrollY)
          return Math.max(0, pin0 - Math.round(window.innerHeight * 0.5))
        },
        end: () => pin0 + step * (n - 1),
        onUpdate: (self) => { drive(self); snap(self) },
        onRefresh: (self) => { follow.tween?.pause(); pos.s = target(self); render() },
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
          <img src="/thanks-pavilions.webp" alt="" width="1247" height="680" decoding="async" loading="lazy" />
        </div>
      </section>
    </div>
  )
}
