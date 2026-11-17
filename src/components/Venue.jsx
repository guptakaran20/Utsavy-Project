import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP } from '../lib/gsap'
import { downloadIcs } from '../lib/calendar'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import FloralSides from './FloralSides'
import { ArrowIcon, CalendarIcon, PinIcon } from './Icons'
import './Venue.css'

const q = (s) => encodeURIComponent(s)

export default function Venue() {
  const root = useRef(null)
  const [copied, setCopied] = useState(false)
  const { venue } = wedding
  const full = `${venue.name}, ${venue.address}`
  useReveal(root)

  // The pavilion drifts slowly behind the page, and the details settle in one by one
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(root.current, { '--bgy': '-60px' }, { '--bgy': '60px', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.from('.venue .floral-sides', { scale: 1.08, autoAlpha: 0.2, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 85%', once: true } })
        const q = (sel) => root.current.querySelector(sel)
        const all = (sel) => root.current.querySelectorAll(sel)
        gsap.set('.venue__info > *', { y: 28, autoAlpha: 0 })
        gsap.set('.venue__actions .btn', { scale: 0.92, autoAlpha: 0 })
        const io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return
            io.disconnect()
            const tl = gsap.timeline()
            tl.to(all('.venue__info > *'), { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.14, ease: 'power3.out' }, 0)
              .to(all('.venue__actions .btn'), { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.6)' }, 0.9)
          },
          { threshold: 0.12 },
        )
        io.observe(q('.venue__grid'))
        return () => io.disconnect()
      })
    },
    { scope: root },
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }
  const wedEvent = wedding.events.find((e) => e.id === 'anand-karaj')

  return (
    <section id="venue" ref={root} className="section sky-bg venue chap" data-chapter data-dwell="6">
      <FloralSides tiles={3} />
      <SectionTitle eyebrow="ਸਥਾਨ" title="The Venue" />
      <div className="venue__grid">
        <div className="venue__info">
          <h3 className="venue__name">{venue.name}</h3>
          <p className="venue__addr"><PinIcon /> {venue.address}</p>
          <p className="venue__note">{venue.note}</p>
          <div className="venue__actions">
            <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${q(full)}`}>
              Get directions <ArrowIcon />
            </a>
            <motion.button type="button" className="btn btn--outline" whileTap={{ scale: 0.97 }} onClick={copy}>
              {copied ? 'Address copied ✓' : 'Copy address'}
            </motion.button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() =>
                downloadIcs({
                  title: `${wedding.bride.name} & ${wedding.groom.name} — ${wedEvent.name}`,
                  start: wedding.date,
                  location: `${wedEvent.venue}, ${wedEvent.address}`,
                  description: wedding.invitation,
                })
              }
            >
              <CalendarIcon /> Save the date
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
