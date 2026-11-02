import { useEffect, useRef, useState } from 'react'
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
          stagger: 0.1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.countdown__units', start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section section--dark countdown">
      <Mandala className="countdown__mandala" />
      <div className="countdown__inner">
        <SectionTitle eyebrow="ਉਲਟੀ ਗਿਣਤੀ" title="Counting the Moments" light />
        <p className="countdown__date reveal">{wedding.dateLabel}</p>
        <div className="countdown__units" role="timer" aria-live="off">
          {units.map((u) => (
            <div className="unit" key={u.label}>
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
        <a className="btn btn--ghost reveal" href={calendarUrl()} target="_blank" rel="noreferrer">
          Save the date
        </a>
      </div>
    </section>
  )
}
