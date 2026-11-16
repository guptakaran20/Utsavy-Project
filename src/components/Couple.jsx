import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import ArchFrame from './ArchFrame'
import Mandala from './Mandala'
import Photo from './Photo'
import './Couple.css'

function Person({ person, role, roleGurmukhi, tone }) {
  return (
    <article className={`person person--${tone}`}>
      <ArchFrame className="person__arch" fill={tone === 'bride' ? 'rgba(122,20,38,.92)' : 'rgba(10,61,51,.95)'}>
        <Photo
          className="person__img"
          src={person.photo}
          alt={person.fullName}
          fallback={
            <div className="person__mono">
              <Mandala className="person__mandala" />
              <span className="gurmukhi">{person.nameGurmukhi[0]}</span>
            </div>
          }
        />
      </ArchFrame>
      <p className="person__role reveal">{role} · <span className="gurmukhi">{roleGurmukhi}</span></p>
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
      const m = gsap.matchMedia()
      m.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.person', root.current).forEach((p, i) => {
          gsap.from(p.querySelector('.person__arch'), {
            yPercent: 14, autoAlpha: 0, duration: 0.8, ease: 'expo.out',
            scrollTrigger: { trigger: p, start: 'top 78%', once: true },
          })
          gsap.fromTo(p.querySelectorAll('.arch__line'), { strokeDasharray: 2000, strokeDashoffset: 2000 },
            { strokeDashoffset: 0, duration: 1.2, stagger: 0.15, ease: 'power2.inOut', clearProps: 'strokeDasharray,strokeDashoffset',
              scrollTrigger: { trigger: p, start: 'top 78%', once: true } })
        })
        gsap.from('.couple__and', { scale: 0, rotation: 120, duration: 0.7, ease: 'back.out(1.6)',
          scrollTrigger: { trigger: '.couple__and', start: 'top 88%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section id="couple" ref={root} className="section section--ivory couple chap" data-chapter data-dwell="6">
      <SectionTitle eyebrow="ਲਾੜੀ ਤੇ ਲਾੜਾ" title="The Bride & Groom" />
      <div className="couple__grid">
        <Person person={wedding.bride} role="The Bride" roleGurmukhi="ਲਾੜੀ" tone="bride" />
        <div className="couple__and" aria-hidden="true">&amp;</div>
        <Person person={wedding.groom} role="The Groom" roleGurmukhi="ਲਾੜਾ" tone="groom" />
      </div>
    </section>
  )
}
