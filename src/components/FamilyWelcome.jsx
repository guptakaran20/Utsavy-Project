import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
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
        <p className="family__sign reveal">{family.signoff}</p>
      </div>
    </section>
  )
}
