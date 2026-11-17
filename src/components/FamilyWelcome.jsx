import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import Photo from './Photo'
import FloralSides from './FloralSides'
import './FamilyWelcome.css'

export default function FamilyWelcome() {
  const root = useRef(null)
  const { family } = wedding
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.elder', {
          y: 50, autoAlpha: 0, stagger: 0.1, duration: 0.6, ease: 'power3.out',
          scrollTrigger: { trigger: '.family__elders', start: 'top 85%', once: true },
        })
        gsap.to('.family__mandala', {
          rotation: 90, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="family" ref={root} className="family sky-bg chap" data-chapter data-dwell="8">
      <FloralSides tiles={6} head={false} />
      <Mandala className="family__mandala" />
      <div className="family__inner">
        <ul className="family__elders">
          {family.elders.map((e) => (
            <li className="elder" key={e.role}>
              <span className="elder__photo">
                <Photo src={e.photo} focus={e.focus} alt={e.name} fallback={<i className="gurmukhi" aria-hidden="true">{e.name[0]}</i>} />
              </span>
              <span className="elder__role">{e.role}</span>
              <span className="elder__name">{e.name}</span>
            </li>
          ))}
        </ul>
        <p className="family__sign reveal">{family.signoff}</p>
      </div>
    </section>
  )
}
