import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import './GuestNotes.css'

const GURMUKHI_DIGITS = ['੧', '੨', '੩', '੪', '੫', '੬']

export default function GuestNotes() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.note', {
          y: 60,
          autoAlpha: 0,
          stagger: 0.15,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.notes__grid', start: 'top 82%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="notes" ref={root} className="section section--ivory notes">
      <SectionTitle eyebrow="ਮਹਿਮਾਨਾਂ ਲਈ" title="Good to Know" />
      <div className="notes__grid">
        {wedding.notes.map((note, i) => (
          <article className="note" key={note.title}>
            <span className="note__num gurmukhi" aria-hidden="true">
              {GURMUKHI_DIGITS[i]}
            </span>
            <h3 className="note__title">{note.title}</h3>
            <p className="note__text">{note.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
