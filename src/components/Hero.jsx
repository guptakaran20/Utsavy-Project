import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import Toran from './Toran'
import Petals from './Petals'
import './Hero.css'

const formatShortDate = (iso) => {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())} · ${pad(d.getMonth() + 1)} · ${d.getFullYear()}`
}

export default function Hero({ play }) {
  const root = useRef(null)
  const intro = useRef(null)
  const { bride, groom } = wedding

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Each mandala ring turns at its own pace, alternating direction
        gsap.utils.toArray('.mandala__ring', root.current).forEach((ring, i) => {
          gsap.to(ring, {
            rotation: i % 2 ? -360 : 360,
            svgOrigin: '0 0',
            duration: 80 + i * 25,
            ease: 'none',
            repeat: -1,
          })
        })

        gsap.utils.toArray('.toran__string', root.current).forEach((string) => {
          gsap.fromTo(
            string,
            { rotation: -2.5 },
            { rotation: 2.5, duration: gsap.utils.random(2.2, 3.6), ease: 'sine.inOut', repeat: -1, yoyo: true },
          )
        })

        // Plays once the gate opens; from() tweens hide everything until then
        intro.current = gsap
          .timeline({ paused: true, defaults: { ease: 'power3.out' } })
          .from('.hero__mandala', { scale: 0.6, autoAlpha: 0, duration: 2.4, ease: 'expo.out' }, 0)
          .from('.toran', { yPercent: -110, duration: 1.4, ease: 'back.out(1.4)' }, 0.3)
          .from('.hero__symbol', { scale: 0.5, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.5)
          .from('.hero__blessing > *', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 0.9 }, '-=0.8')
          .from('.hero__together', { autoAlpha: 0, duration: 0.8 }, '-=0.5')
          .fromTo(
            '.hero__name',
            { clipPath: 'inset(-30% 100% -30% -10%)', y: 10 },
            { clipPath: 'inset(-30% -10% -30% -10%)', y: 0, duration: 1.8, stagger: 0.5, ease: 'power2.inOut' },
            '-=0.4',
          )
          .from('.hero__rule', { scaleX: 0, duration: 1.1, ease: 'expo.inOut' }, '<0.2')
          .from('.hero__amp', { scale: 0, rotation: -90, autoAlpha: 0, duration: 0.9, ease: 'back.out(2)' }, '<0.2')
          .from('.hero__meta > *', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, '-=0.6')
          .from('.hero__scroll', { autoAlpha: 0, duration: 0.8 }, '-=0.2')

        // Scrolling away: content drifts up and fades while the mandala grows
        const scrub = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
        gsap.to('.hero__content', { yPercent: 25, autoAlpha: 0, ease: 'none', scrollTrigger: scrub })
        gsap.to('.hero__mandala-wrap', { scale: 1.5, autoAlpha: 0.3, ease: 'none', scrollTrigger: { ...scrub } })
      })
    },
    { scope: root },
  )

  useEffect(() => {
    if (play) intro.current?.play()
  }, [play])

  return (
    <section id="top" ref={root} className="hero">
      <div className="hero__mandala-wrap" aria-hidden="true">
        <Mandala className="hero__mandala" />
      </div>
      <Petals />
      <Toran />

      <div className="hero__content">
        <p className="hero__symbol gurmukhi" aria-hidden="true">
          {wedding.blessingSymbol}
        </p>
        <div className="hero__blessing">
          <p className="hero__blessing-pa gurmukhi">{wedding.blessingLine}</p>
          <p className="hero__blessing-en">{wedding.blessingEnglish}</p>
        </div>

        <p className="hero__together">together with {wedding.families}</p>

        <h1 className="hero__names">
          <span className="hero__name">{bride.name}</span>
          <span className="hero__amp-row" aria-hidden="true">
            <span className="hero__rule" />
            <span className="hero__amp">&amp;</span>
            <span className="hero__rule" />
          </span>
          <span className="sr-only"> and </span>
          <span className="hero__name">{groom.name}</span>
        </h1>

        <div className="hero__meta">
          <p className="hero__gurmukhi-names gurmukhi">
            {bride.nameGurmukhi} ਤੇ {groom.nameGurmukhi}
          </p>
          <p className="hero__date">{formatShortDate(wedding.date)}</p>
          <p className="hero__place">{wedding.city}</p>
        </div>
      </div>

      <div className="hero__scroll" aria-hidden="true">
        <span>Scroll</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  )
}
