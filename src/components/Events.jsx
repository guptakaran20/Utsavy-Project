import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { downloadIcs } from '../lib/calendar'
import { useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import FloralSides from './FloralSides'
import { LotusGarland } from './Florals'
import './Florals.css'
import { ArrowIcon, AttireIcon, CalendarIcon, ClockIcon, PinIcon } from './Icons'
import './Events.css'

const mapsUrl = (e) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`
const ease = [0.22, 1, 0.36, 1]
const FADE = 110 // px of the sheet above that the new paper melts over
const PER_DAY = 0.9 // screens of scrolling each day's scroll stays open: long enough that a quick flick cannot skip past the days
const dayOf = (e) => e.date.split(',')[1].trim().split(' ')[0]
const monOf = (e) => e.date.split(',')[1].trim().split(' ')[1].slice(0, 3)

// One day's scroll text. Also rendered (invisibly, all days stacked) so the stage always reserves the tallest day's
// height: the pinned section then never changes size as the scroll unrolls, which is what made scrolling jerk.
function EventBody({ ev }) {
  return (
    <div className="escroll__inner">
      <p className="ecard__pa gurmukhi">{ev.gurmukhi}</p>
      <h3 className="ecard__name">{ev.name}</h3>
      <LotusGarland />
      <p className="escroll__date">{ev.date}</p>
      <p className="escroll__time">{ev.time}</p>
      <p className="ecard__desc">{ev.description}</p>
      <p className="escroll__venue"><PinIcon /> <span><strong>{ev.venue}</strong><br />{ev.address}</span></p>
      <p className="escroll__attire"><AttireIcon /> {ev.attire}</p>
      <div className="ecard__actions">
        <a className="btn escroll__btn" href={mapsUrl(ev)} target="_blank" rel="noreferrer">View map <ArrowIcon /></a>
        <button type="button" className="btn escroll__btn escroll__btn--ghost" onClick={() => downloadIcs({ title: ev.name, start: ev.start, location: `${ev.venue}, ${ev.address}`, description: ev.description })}>
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
            <span className="etab__day">{dayOf(e)}<small>{monOf(e)}</small></span>
            <span className="etab__name">{e.name}</span>
          </button>
        ))}
      </div>

      <div className="events__stage" aria-live="polite">
        <div className="escroll">
          <div className="escroll__roller" aria-hidden="true" />
          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={ev.id}
              className="escroll__paper"
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
            >
              <EventBody ev={ev} />
            </motion.article>
          </AnimatePresence>
          <div className="escroll__roller" aria-hidden="true" />
        </div>
        <div className="escroll escroll--ghost" aria-hidden="true" inert>
          <div className="escroll__roller" />
          <div className="escroll__paper escroll__ghostpaper">
            {wedding.events.map((e) => <EventBody key={e.id} ev={e} />)}
          </div>
          <div className="escroll__roller" />
        </div>
      </div>

      <p className="events__cta">
        <a href="#rsvp" onClick={(e) => { e.preventDefault(); scrollTo('#rsvp') }}>Will you dance with us? <span className="gurmukhi">ਆਓ ਨੱਚੀਏ!</span> <ArrowIcon /></a>
      </p>
    </section>
    </div>
  )
}
