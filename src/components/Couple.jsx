import { useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import Mandala from './Mandala'
import './Couple.css'

function Person({ person, role, roleGurmukhi }) {
  return (
    <article className="person">
      <motion.div className="person__frame" whileHover={{ y: -8 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
        <div className="person__photo">
          {person.photo ? (
            <img className="person__img" src={person.photo} alt={person.fullName} />
          ) : (
            <div className="person__img person__monogram">
              <Mandala className="person__mandala" />
              <span className="gurmukhi">{person.nameGurmukhi[0]}</span>
            </div>
          )}
        </div>
        <svg className="person__outline" viewBox="0 0 100 131" preserveAspectRatio="none" aria-hidden="true">
          <path pathLength="1" d="M2 131V46C2 28 22 18 38 12C45 9 48 5 50 2C52 5 55 9 62 12C78 18 98 28 98 46V131" />
          <path pathLength="1" d="M7 131V48C7 32 25 23 40 17C46 14 48.5 11 50 8.5C51.5 11 54 14 60 17C75 23 93 32 93 48V131" />
        </svg>
      </motion.div>
      <p className="person__role reveal">
        {role} · <span className="gurmukhi">{roleGurmukhi}</span>
      </p>
      <h3 className="person__name reveal">{person.name}</h3>
      <p className="person__full reveal">{person.fullName}</p>
      <p className="person__parents reveal">{person.parents}</p>
      <p className="person__blurb reveal">{person.blurb}</p>
    </article>
  )
}

export default function Couple() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.person', root.current).forEach((person) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: person, start: 'top 80%', once: true } })
          tl.from(person.querySelector('.person__photo'), {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.4,
            ease: 'expo.inOut',
          })
            .from(person.querySelector('.person__img'), { scale: 1.35, duration: 1.8, ease: 'expo.out' }, '<0.3')
            .fromTo(
              person.querySelectorAll('.person__outline path'),
              { strokeDasharray: 1, strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 2, stagger: 0.2, ease: 'power2.inOut' },
              0.2,
            )
        })
        gsap.from('.couple__and', {
          scale: 0,
          rotation: 180,
          duration: 1.2,
          ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.couple__and', start: 'top 85%', once: true },
        })
      })
    },
    { scope: root },
  )

  return (
    <section id="couple" ref={root} className="section section--ivory couple">
      <SectionTitle eyebrow="ਲਾੜੀ ਤੇ ਲਾੜਾ" title="The Bride & Groom" />
      <div className="couple__grid">
        <Person person={wedding.bride} role="The Bride" roleGurmukhi="ਲਾੜੀ" />
        <div className="couple__and gurmukhi" aria-hidden="true">
          ਤੇ
        </div>
        <Person person={wedding.groom} role="The Groom" roleGurmukhi="ਲਾੜਾ" />
      </div>
    </section>
  )
}
