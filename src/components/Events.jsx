import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { downloadIcs } from '../lib/calendar'
import { useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import FloralSides from './FloralSides'
import './Florals.css'
import { ArrowIcon, AttireIcon, CalendarIcon, ClockIcon, PinIcon } from './Icons'
import './TornPaper.css'
import './Events.css'

const mapsUrl = (e) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`
const ease = [0.22, 1, 0.36, 1]
const FADE = 110 // px of the sheet above that the new paper melts over
const PER_DAY = 0.9 // screens of scrolling each day's scroll stays open: long enough that a quick flick cannot skip past the days
const dayOf = (e) => e.date.split(',')[1].trim().split(' ')[0]
const monOf = (e) => e.date.split(',')[1].trim().split(' ')[1].slice(0, 3)

// One day's scroll text. Also rendered (invisibly, all days stacked) so the stage always reserves the tallest day's
// height: the pinned section then never changes size as the scroll unrolls, which is what made scrolling jerk.
// The quiet card: a title block, then three plain rows (when, where, what to wear) and one button with a text link.
function EventBody({ ev }) {
  return (
    <div className="eday">
      <p className="eday__pa gurmukhi">{ev.gurmukhi}</p>
      <h3 className="eday__name">{ev.name}</h3>
      <span className="eday__rule" aria-hidden="true" />
      <p className="eday__desc">{ev.description}</p>
      <dl className="eday__rows">
        <div className="eday__row"><dt><ClockIcon /><span className="sr-only">When</span></dt><dd>{ev.date}<small>{ev.time}</small></dd></div>
        <div className="eday__row"><dt><PinIcon /><span className="sr-only">Where</span></dt><dd>{ev.venue}<small>{ev.address}</small></dd></div>
        <div className="eday__row"><dt><AttireIcon /><span className="sr-only">Wear</span></dt><dd>{ev.attire}</dd></div>
      </dl>
      <div className="eday__actions">
        <a className="eday__btn" href={mapsUrl(ev)} target="_blank" rel="noreferrer">View map <ArrowIcon /></a>
        <button type="button" className="eday__link" onClick={() => downloadIcs({ title: ev.name, start: ev.start, location: `${ev.venue}, ${ev.address}`, description: ev.description })}>
          <CalendarIcon /> Add to calendar
        </button>
      </div>
    </div>
  )
}

export default function Events() {
  const root = useRef(null)
  const track = useRef(null)
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  const scrollTo = useScrollTo()
  useReveal(root)
  const ev = wedding.events[i]
  const st = useRef(null)
  const n = wedding.events.length
  // The section holds still (CSS `position: sticky`, no scroll-jacking pin) inside a track tall enough for one stretch
  // of scroll per day; ScrollTrigger only reads how far through the track we are.
  const [size, setSize] = useState({ vh: 0 })
  useLayoutEffect(() => {
    const el = root.current
    const measure = () => {
      const stage = el.querySelector('.events__stage')
      const vh = window.innerHeight
      // The held section is exactly one screen tall, and the stage (every day's scroll) is zoomed to fit the room that is left
      stage.style.zoom = 1
      const cs = getComputedStyle(el)
      const pad = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
      // stacked (phone) layout: everything else shares the height; side-by-side (wide) layout: only the padding does
      const others = cs.display === 'grid' ? pad : el.scrollHeight - stage.offsetHeight
      stage.style.zoom = Math.max(0.5, Math.min(cs.display === 'grid' ? 1.7 : 1, (vh - others) / stage.offsetHeight))
      // continue the damask of the sheet above, so the seam between the two papers shows no line
      const prev = el.parentElement.previousElementSibling
      if (prev) {
        el.style.backgroundPositionY = `${-(prev.offsetHeight % 120)}px`
      }
      setSize((p) => (p.vh === vh ? p : { vh }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  }, [])
  const extra = Math.round(size.vh * PER_DAY * (n - 1))
  useEffect(() => { if (size.vh) ScrollTrigger.refresh() }, [size.vh])

  useGSAP(
    () => {
      const m = gsap.matchMedia()
      m.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.events__mandala', { rotation: 120, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      // the scroll floats gently and tilts towards the pointer, so the rods and the paper show their depth
      m.add('(prefers-reduced-motion: no-preference) and (hover: hover)', () => {
        const sc = root.current.querySelector('.events__stage > .escroll:not(.escroll--ghost)')
        if (!sc) return
        gsap.set(sc, { transformPerspective: 1300 })
        const bob = gsap.to(sc, { y: -4, duration: 3.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
        const ry = gsap.quickTo(sc, 'rotationY', { duration: 0.9, ease: 'power3' })
        const rx = gsap.quickTo(sc, 'rotationX', { duration: 0.9, ease: 'power3' })
        const move = (e) => { ry((e.clientX / window.innerWidth - 0.5) * 6); rx(-(e.clientY / window.innerHeight - 0.5) * 4) }
        window.addEventListener('pointermove', move)
        return () => { window.removeEventListener('pointermove', move); bob.kill(); gsap.set(sc, { clearProps: 'transform' }) }
      })
      // progress through the track picks the day; the section is stuck once its bottom (or top, if it fits) reaches the screen
      st.current = ScrollTrigger.create({
        trigger: track.current,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * PER_DAY * (n - 1))}`,
        onUpdate: (self) => setI(Math.min(n - 1, Math.floor(self.progress * n))),
      })
    },
    { scope: root },
  )

  return (
    <div className="events-track" ref={track} style={{ height: size.vh ? size.vh + extra : undefined }}>
    <section id="events" ref={root} className={`events chap sky-bg events--${ev.theme}`} data-chapter data-dwell="7">
      {/* this section's own paper and flowers: they are part of the held section, so they never slide behind it */}
      <FloralSides tiles={4} head={false} className="floral-sides--section" />
      <Mandala className="events__mandala" />
      <header className="events__head">
        <p className="events__eyebrow gurmukhi">ਸਮਾਗਮ</p>
        <h2 className="events__title">The Celebrations</h2>
      </header>

      <div className="events__tabs" role="tablist" aria-label="Wedding events">
        {wedding.events.map((e, k) => (
          <button key={e.id} role="tab" aria-selected={k === i} className={`etab${k === i ? ' is-on' : ''}`} onClick={() => (st.current ? scrollTo(st.current.start + ((k + 0.5) / n) * (st.current.end - st.current.start)) : setI(k))}>
            {k === i && <motion.span layoutId="etab-pill" className="etab__pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
            <span className="etab__when">{dayOf(e)} {monOf(e)}</span>
            <span className="etab__short">{e.short}</span>
          </button>
        ))}
      </div>

      <div className="events__stage" aria-live="polite">
        {/* One ivory card with a single gold hairline. Changing day fades the old details out and the new ones up. */}
        <div className="escroll escroll--card torn-shadow">
          <div className="torn-sides">
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={ev.id}
              className="eday__card torn"
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: reduced ? 0.2 : 0.32, ease }}
            >
              <EventBody ev={ev} />
            </motion.article>
          </AnimatePresence>
          </div>
        </div>
        <div className="escroll escroll--card escroll--ghost" aria-hidden="true" inert>
          <div className="eday__card torn escroll__ghostpaper">
            {wedding.events.map((e) => <EventBody key={e.id} ev={e} />)}
          </div>
        </div>
      </div>

      <p className="events__cta">
        <a href="#rsvp" onClick={(e) => { e.preventDefault(); scrollTo('#rsvp') }}>Will you dance with us? <span className="gurmukhi">ਆਓ ਨੱਚੀਏ!</span> <ArrowIcon /></a>
      </p>
    </section>
    </div>
  )
}
