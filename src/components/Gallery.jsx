import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import { ArrowIcon } from './Icons'
import Photo from './Photo'
import './Gallery.css'

// Placeholder "portrait" — swap for <img src=...> when real photos exist (photo: '/photos/x.jpg').
function Plate({ item, i }) {
  return (
    <Photo src={item.photo} alt={item.caption} fallback={<svg viewBox="0 0 300 380" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id={`ph${i}`} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M15 3l12 12-12 12L3 15z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".35" />
          <path d="M15 10l5 5-5 5-5-5z" fill="currentColor" opacity=".22" />
        </pattern>
      </defs>
      <rect width="300" height="380" fill={`url(#ph${i})`} />
      <text x="150" y="215" textAnchor="middle" className="plate__mono">{wedding.bride.name[0]}&amp;{wedding.groom.name[0]}</text>
    </svg>} />
  )
}

export default function Gallery() {
  const root = useRef(null)
  const strip = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.plate', root.current).forEach((el) => {
          gsap.from(el, {
            clipPath: 'inset(100% 0 0 0)', duration: 0.8, ease: 'power4.inOut', stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          })
        })
      })
    },
    { scope: root },
  )

  // mouse drag-to-scroll (touch already scrolls natively)
  useEffect(() => {
    const el = strip.current
    let down = false, x0 = 0, s0 = 0
    const pd = (e) => { if (e.pointerType !== 'mouse') return; down = true; x0 = e.clientX; s0 = el.scrollLeft; el.classList.add('is-drag') }
    const pm = (e) => { if (down) el.scrollLeft = s0 - (e.clientX - x0) }
    const pu = () => { down = false; el.classList.remove('is-drag') }
    el.addEventListener('pointerdown', pd); window.addEventListener('pointermove', pm); window.addEventListener('pointerup', pu)
    return () => { el.removeEventListener('pointerdown', pd); window.removeEventListener('pointermove', pm); window.removeEventListener('pointerup', pu) }
  }, [])

  const page = (dir) => {
    const el = strip.current
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  return (
    <section id="gallery" ref={root} className="section section--ivory gallery chap" data-chapter data-dwell="6">
      <svg width="0" height="0" aria-hidden="true">
        <clipPath id="jharokha" clipPathUnits="objectBoundingBox">
          <path d="M0,1 V.42 C0,.28 .12,.2 .24,.14 C.36,.09 .44,.05 .5,0 C.56,.05 .64,.09 .76,.14 C.88,.2 1,.28 1,.42 V1 Z" />
        </clipPath>
      </svg>
      <SectionTitle eyebrow="ਯਾਦਾਂ" title="Moments" />
      <div className="gallery__strip" ref={strip} tabIndex={0} aria-label="Photo gallery, scroll sideways">
        {wedding.gallery.map((g, i) => (
          <figure key={g.caption} className={`gcard gcard--${g.tone}`} style={{ '--tilt': `${(i % 2 ? 1 : -1) * 0.8}deg` }}>
            <div className="plate">
              <Plate item={g} i={i} />
            </div>
            <figcaption>
              <span className="gurmukhi">{g.gurmukhi}</span>
              <em>{g.caption}</em>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery__nav">
        <button type="button" onClick={() => page(-1)} aria-label="Previous photos" className="gallery__btn gallery__btn--prev"><ArrowIcon /></button>
        <button type="button" onClick={() => page(1)} aria-label="Next photos" className="gallery__btn"><ArrowIcon /></button>
      </div>
    </section>
  )
}
