import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import FloralSides from './FloralSides'
import './OurFamilies.css'

function Card({ f, side }) {
  return (
    <article className={`ofam__card ofam__card--${side}`}>
      <span className="ofam__side">{f.label}</span>
      <p className="ofam__parents">{f.parents}</p>
      <p className="ofam__invite">{f.invite}</p>
      <h3 className="ofam__name">{f.name}</h3>
      <p className="ofam__grand">{f.grand}</p>
      <p className="ofam__blessing">“{f.blessing}”</p>
    </article>
  )
}

// Two arch-topped cards, one for each side, tied together with a red-and-gold mauli thread that draws itself.
export default function OurFamilies() {
  const root = useRef(null)
  const { bride, groom } = wedding.bothFamilies
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.ofam__card', root.current).forEach((c, i) => {
          gsap.from(c, { y: 60, x: i ? 30 : -30, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 85%', once: true } })
        })
        gsap.fromTo('.ofam__thread path', { strokeDasharray: 400, strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.25, scrollTrigger: { trigger: '.ofam__knot', start: 'top 85%', once: true } })
        gsap.from('.ofam__bead', { scale: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(2)', delay: 0.9, scrollTrigger: { trigger: '.ofam__knot', start: 'top 85%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section id="families" ref={root} className="section sky-bg ofam chap" data-chapter data-dwell="8">
      <FloralSides tiles={6} head={false} />
      <SectionTitle eyebrow="ਦੋਵੇਂ ਪਰਿਵਾਰ" title="Our Families" />
      <p className="ofam__sub reveal">With the blessings of our elders</p>
      <div className="ofam__grid">
        <Card f={bride} side="bride" />
        <div className="ofam__knot" aria-hidden="true">
          <svg className="ofam__thread" viewBox="0 0 120 120">
            <path d="M0 60 C30 20 50 20 60 60 S90 100 120 60" fill="none" stroke="#c0243c" strokeWidth="3" strokeLinecap="round" />
            <path d="M0 60 C30 100 50 100 60 60 S90 20 120 60" fill="none" stroke="#e0b52c" strokeWidth="3" strokeLinecap="round" />
            <circle className="ofam__bead" cx="60" cy="60" r="7" fill="#fffdf8" stroke="#b8862f" strokeWidth="1.6" />
          </svg>
        </div>
        <Card f={groom} side="groom" />
      </div>
    </section>
  )
}
