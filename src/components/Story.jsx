import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import './Story.css'

export default function Story() {
  const root = useRef(null)
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          wide: '(min-width: 761px)',
        },
        ({ conditions }) => {
          if (!conditions.motion) return

          // The golden thread draws itself as you scroll through the timeline
          gsap.fromTo(
            '.story__line-fill',
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: '.story__timeline', start: 'top 70%', end: 'bottom 60%', scrub: true },
            },
          )

          gsap.utils.toArray('.story__item', root.current).forEach((item, i) => {
            const fromX = conditions.wide ? (i % 2 ? 70 : -70) : 40
            const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 72%', once: true } })
            tl.from(item.querySelector('.story__dot'), { scale: 0, duration: 0.6, ease: 'back.out(3)' }).from(
              item.querySelector('.story__card'),
              { x: fromX, autoAlpha: 0, duration: 1.1, ease: 'power3.out' },
              '<0.1',
            )
          })
        },
      )
    },
    { scope: root },
  )

  return (
    <section id="story" ref={root} className="section section--ivory story">
      <SectionTitle eyebrow="ਸਾਡੀ ਕਹਾਣੀ" title="Our Story" />
      <div className="story__timeline">
        <div className="story__line" aria-hidden="true">
          <div className="story__line-fill" />
        </div>
        {wedding.story.map((s, i) => (
          <div key={s.year} className={`story__item story__item--${i % 2 ? 'right' : 'left'}`}>
            <span className="story__dot" aria-hidden="true" />
            <div className="story__card">
              <span className="story__year">{s.year}</span>
              <h3 className="story__title">{s.title}</h3>
              <p className="story__text">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
