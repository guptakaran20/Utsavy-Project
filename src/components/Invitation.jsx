import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import './Invitation.css'

// onion-domed "mandap" arch, drawn once and reused as fill + two gold outlines
const OGEE = 'M14,556 V270 C14,214 62,200 104,156 C146,112 186,78 200,10 C214,78 254,112 296,156 C338,200 386,214 386,270 V556Z'

export default function Invitation() {
  const root = useRef(null)
  const words = wedding.invitation.split(' ')
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.invite__word', { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: 'none', scrollTrigger: { trigger: '.invite__text', start: 'top 80%', end: 'bottom 55%', scrub: true } })
        gsap.from('.invite__arch', { yPercent: 8, autoAlpha: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
        gsap.fromTo('.invite__arch .stroke', { strokeDasharray: 2400, strokeDashoffset: 2400 }, { strokeDashoffset: 0, duration: 1.6, stagger: 0.15, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset', scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section invite chap" data-chapter data-dwell="9">
      <div className="invite__arch">
        <svg className="invite__shape" viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden="true">
          <path d={OGEE} fill="#fffdf8" />
          <path className="stroke" d={OGEE} fill="none" stroke="#e0b52c" strokeWidth="7" vectorEffect="non-scaling-stroke" />
          <path className="stroke" d={OGEE} fill="none" stroke="#8a6a1a" strokeWidth="1.2" vectorEffect="non-scaling-stroke" transform="translate(200 280) scale(.95 .955) translate(-200 -280)" />
        </svg>
        <div className="invite__inner">
          <p className="invite__ik gurmukhi reveal">{wedding.blessingSymbol}</p>
          <p className="invite__bless reveal">{wedding.blessingEnglish}</p>
          <p className="invite__welcome gurmukhi reveal">ਜੀ ਆਇਆਂ ਨੂੰ</p>
          <p className="invite__text">
            {words.map((w, i) => (
              <span key={i} className="invite__word">{w}{' '}</span>
            ))}
          </p>
          <p className="invite__names reveal">{wedding.bride.name} <em>weds</em> {wedding.groom.name}</p>
          <p className="invite__date reveal">{wedding.dateLabel}</p>
          <p className="invite__where reveal">{wedding.city}</p>
        </div>
      </div>
    </section>
  )
}
