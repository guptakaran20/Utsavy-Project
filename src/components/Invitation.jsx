import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import Flourish from './Flourish'
import './Invitation.css'

export default function Invitation() {
  const root = useRef(null)
  const words = wedding.invitation.split(' ')
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Words light up one by one as the paragraph scrolls through the viewport
        gsap.fromTo(
          '.invite__word',
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: '.invite__text', start: 'top 80%', end: 'bottom 50%', scrub: true },
          },
        )
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section section--ivory invite">
      <div className="invite__inner">
        <p className="invite__welcome gurmukhi reveal">ਜੀ ਆਇਆਂ ਨੂੰ</p>
        <p className="invite__welcome-en reveal">Welcome to our celebration</p>
        <Flourish className="reveal" />
        <p className="invite__text">
          {words.map((w, i) => (
            <span key={i} className="invite__word">
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}
