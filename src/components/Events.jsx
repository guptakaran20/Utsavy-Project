import { useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import Flourish from './Flourish'
import { ArrowIcon, AttireIcon, CalendarIcon, ClockIcon, PinIcon } from './Icons'
import './Events.css'

const mapsUrl = (e) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.venue}, ${e.address}`)}`

function EventCard({ event, index }) {
  return (
    <motion.article
      className={`event event--${event.theme}`}
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
    >
      <Mandala className="event__mandala" />
      <span className="event__index">{String(index + 1).padStart(2, '0')}</span>
      <p className="event__gurmukhi gurmukhi">{event.gurmukhi}</p>
      <h3 className="event__name">{event.name}</h3>
      <p className="event__desc">{event.description}</p>
      <ul className="event__details">
        <li>
          <CalendarIcon />
          {event.date}
        </li>
        <li>
          <ClockIcon />
          {event.time}
        </li>
        <li>
          <PinIcon />
          <span>
            <strong>{event.venue}</strong>
            <br />
            {event.address}
          </span>
        </li>
        <li>
          <AttireIcon />
          {event.attire}
        </li>
      </ul>
      <a className="event__link" href={mapsUrl(event)} target="_blank" rel="noreferrer">
        Directions <ArrowIcon />
      </a>
    </motion.article>
  )
}

export default function Events() {
  const root = useRef(null)
  const track = useRef(null)
  const scrollTo = useScrollTo()
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Desktop: pin the section and walk the cards sideways
      mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        const distance = () => track.current.scrollWidth - document.documentElement.clientWidth
        const end = () => `+=${distance()}`

        const slide = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.events__pin',
            start: 'top top',
            end,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })

        gsap.fromTo(
          '.events__progress-fill',
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.events__pin', start: 'top top', end, scrub: true } },
        )

        gsap.utils.toArray('.event__mandala', root.current).forEach((m) => {
          gsap.fromTo(
            m,
            { rotation: -60 },
            {
              rotation: 60,
              ease: 'none',
              scrollTrigger: { trigger: m, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
            },
          )
        })
      })

      // Mobile: a simple stacked list that fades in
      mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.event, .events__end', root.current).forEach((card) => {
          gsap.from(card, {
            y: 60,
            autoAlpha: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="events" ref={root} className="events">
      <div className="events__pin">
        <div className="events__track" ref={track}>
          <header className="events__intro">
            <p className="events__eyebrow gurmukhi reveal">ਸਮਾਗਮ</p>
            <h2 className="events__title reveal">The Celebrations</h2>
            <Flourish className="reveal" />
            <p className="events__lede reveal">
              Three days of dhol, dancing and blessings. Here is where to find us — and what to wear.
            </p>
            <p className="events__hint reveal" aria-hidden="true">
              Keep scrolling <ArrowIcon />
            </p>
          </header>

          {wedding.events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}

          <div className="events__end">
            <p className="events__end-pa gurmukhi">ਆਓ ਨੱਚੀਏ!</p>
            <p className="events__end-text">Will you dance with us?</p>
            <a
              className="btn"
              href="#rsvp"
              onClick={(e) => {
                e.preventDefault()
                scrollTo('#rsvp')
              }}
            >
              RSVP now
            </a>
          </div>
        </div>
        <div className="events__progress" aria-hidden="true">
          <span className="events__progress-fill" />
        </div>
      </div>
    </section>
  )
}
