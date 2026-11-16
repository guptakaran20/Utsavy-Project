import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import { guestName } from '../lib/guest'
import HeroFX from './HeroFX'
import './Hero.css'

const [yyyy, mm, dd] = wedding.date.slice(0, 10).split('-')

export default function Hero({ play }) {
  const wrap = useRef(null)
  const root = useRef(null)
  const intro = useRef(null)
  const { bride, groom } = wedding

  useGSAP(
    () => {
      const m = gsap.matchMedia()
      m.add('(prefers-reduced-motion: no-preference)', () => {
        intro.current = gsap
          .timeline({ paused: true, defaults: { ease: 'power3.out' } })
          .from('.hero__sky', { autoAlpha: 0, duration: 1.2 }, 0)
          .from('.hero__clouds', { autoAlpha: 0, duration: 2.4 }, 0.2)
          .from('.hero__sun', { yPercent: 40, autoAlpha: 0, duration: 2, ease: 'expo.out' }, 0.2)
          .from('.hero__haveli', { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 0.2)
          .from('.hero__om', { scale: 0.4, autoAlpha: 0, duration: 0.9, ease: 'expo.out' }, 0.7)
          .from('.hero__eyebrow', { y: 12, autoAlpha: 0, duration: 0.7 }, 0.85)
          .from('.hero__rule', { scaleX: 0, autoAlpha: 0, duration: 1, stagger: 0.3, ease: 'power2.out' }, 1)
          .from('.hero__line', { autoAlpha: 0, y: 24, letterSpacing: '0.3em', filter: 'blur(10px)', duration: 1.5, stagger: 0.35, ease: 'power3.out' }, 1.05)
          .from('.hero__weds', { autoAlpha: 0, letterSpacing: '0.9em', duration: 1.4, ease: 'power3.out' }, 1.5)
          .from('.hero__sub, .hero__dear, .hero__date', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 1.8)
        intro.current.timeScale(1.6)

        // Scroll = walking in: the hero pins and the camera pushes through the fort's gate, the
        // light blooms, and a golden wash carries you into the invitation.
        const walk = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: wrap.current, start: 'top top', end: () => `+=${window.innerHeight * 2.25}`, scrub: 0.6, invalidateOnRefresh: true },
        })
        // Scroll raises the gurdwara out of the bottom of the sky: first only its spires peek, then the
        // dome and towers rise behind the names, then the camera pushes in and a golden wash carries on.
        // The gurdwara is full-width, so it is taller than the screen: scroll lifts it through the sky.
        // First its spires peek, then the dome stands behind the names, then it keeps rising until the door is at the foot.
        const imgH = () => root.current.querySelector('.gur').offsetHeight || window.innerWidth
        const vh = () => window.innerHeight
        // how far the image's foot hangs below the screen (the scene sits a little low)
        const gurDrop = () => -(parseFloat(getComputedStyle(root.current.querySelector('.gur')).bottom) || 0)
        walk
          .fromTo('.hero__haveli .gur', { y: () => Math.max(0, 0.86 * imgH() - 0.02 * vh()) }, { y: () => Math.max(0, 0.67 * imgH() - 0.45 * vh()), ease: 'power1.out', duration: 0.35 }, 0)
          .to('.hero__haveli .gur', { y: 0, ease: 'none', duration: 0.07 }, 0.35)
          // then you walk in: the camera glides to the door and pushes through it into the light
          .to('.hero__haveli .gur', { scale: 5, y: () => 0.14 * imgH() - 0.5 * vh(), transformOrigin: '50% 86%', ease: 'power2.in', duration: 0.4 }, 0.42)
          .to('.hero__text', { yPercent: -8, duration: 0.35 }, 0)
          .to('.hero__text', { yPercent: -30, autoAlpha: 0, ease: 'power2.in', duration: 0.25 }, 0.35)
          .to('.hero__clouds', { yPercent: 20, autoAlpha: 0, duration: 0.6 }, 0.3)
          // the invitation already sits beneath the hero, so the hero lifts away like a curtain: no blank page, no extra scrolling
          .to('.hero', { autoAlpha: 0, ease: 'power1.inOut', duration: 0.12 }, 0.86)
      })
    },
    { scope: wrap },
  )

  useEffect(() => {
    if (play) intro.current?.play()
  }, [play])

  return (
    <div ref={wrap} className="hero-wrap">
    <section id="top" ref={root} className="hero chap" data-chapter data-dwell="4">
      <div className="hero__sky" aria-hidden="true" />
      <svg className="hero__clouds" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <filter id="cloud" x="-30%" y="-40%" width="160%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="5" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="110" />
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>
        <g className="cl cl--a" filter="url(#cloud)">
          {[[110, 190, 120, 34, '#fff'], [210, 230, 90, 26, '#ffe9f0'], [60, 290, 110, 28, '#fff'], [250, 150, 70, 22, '#ffdfe9'], [170, 330, 80, 22, '#ffe9f0'], [30, 420, 90, 22, '#fff']].map(([x, y, rx, ry, c], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={c} />)}
        </g>
        <g className="cl cl--b" filter="url(#cloud)">
          {[[880, 120, 110, 30, '#fff'], [800, 200, 90, 24, '#ffe9f0'], [930, 260, 100, 28, '#fff'], [840, 340, 80, 22, '#ffdfe9'], [960, 400, 80, 20, '#fff']].map(([x, y, rx, ry, c], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={c} />)}
        </g>
        <g className="cl cl--c" filter="url(#cloud)">
          {[[520, 70, 120, 20, '#fff'], [420, 110, 80, 16, '#ffe9f0']].map(([x, y, rx, ry, c], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={c} opacity=".8" />)}
        </g>
      </svg>
      <div className="hero__sun" aria-hidden="true" />
      <div className="hero__rays" aria-hidden="true" />
      <svg className="hero__birds" viewBox="0 0 120 30" aria-hidden="true">
        {[[8, 18, 1], [26, 9, 0.8], [44, 16, 1.15], [64, 6, 0.7], [84, 14, 0.9]].map(([x, y, k], i) => (
          <path key={i} className="bird" d={`M${x - 5 * k},${y} Q${x - 2.5 * k},${y - 4 * k} ${x},${y} Q${x + 2.5 * k},${y - 4 * k} ${x + 5 * k},${y}`} fill="none" stroke="#1a0409" strokeWidth=".9" strokeLinecap="round" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </svg>

      <div className="hero__text">
        <p className="hero__om gurmukhi" aria-hidden="true">{wedding.blessingSymbol}</p>
        <p className="hero__eyebrow">{wedding.blessingEnglish}</p>
        <p className="hero__rule" aria-hidden="true"><i /><b /><i /></p>
        <h1 className="hero__names">
          <span className="hero__line">{bride.name}</span>
          <span className="hero__weds-row" aria-hidden="true"><i /><span className="hero__weds">weds</span><i /></span>
          <span className="sr-only"> weds </span>
          <span className="hero__line">{groom.name}</span>
        </h1>
        <p className="hero__rule" aria-hidden="true"><i /><b /><i /></p>
        <p className="hero__sub gurmukhi">{bride.nameGurmukhi} ਤੇ {groom.nameGurmukhi} · ਵਿਆਹ ਦੀ ਖੁਸ਼ੀ</p>
        <p className="hero__dear">Dear <b>{guestName()}</b>, you are invited</p>
        <p className="hero__date" aria-label={wedding.dateLabel}>
          <span>{dd}</span><i aria-hidden="true" /><span>{mm}</span><i aria-hidden="true" /><span>{yyyy}</span>
          <em>{wedding.city}</em>
        </p>
      </div>

      <HeroFX play={play} />
      <div className="hero__haveli" aria-hidden="true">
        <img className="gur" src="/gurdwara.webp" alt="" width="2470" height="2548" decoding="async" />
      </div>
      <div className="hero__flash" aria-hidden="true"><i className="hero__bloom" /></div>
    </section>
    </div>
  )
}
