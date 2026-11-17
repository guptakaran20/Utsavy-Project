import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import { guestName } from '../lib/guest'
import HeroFX from './HeroFX'
import './Hero.css'


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
          .from('.hero__sub, .hero__dear', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 1.8)
          .from('.hero__cue-in', { y: 14, autoAlpha: 0, duration: 0.9 }, 2.6)

        // A small airliner crosses the sky along the date line; the date is written in behind its tail as it passes,
        // and a soft contrail trails after it. (The plane is the same cut-out as the opening scene.)
        const q = (sel) => root.current.querySelector(sel)
        const plane = q('.hero__plane')
        const trail = q('.hero__trail')
        const dateEl = q('.hero__date')
        const RATIO = 667 / 2000 // plane image height / width
        const TAIL_X = 0.04 // the tail sits this far in from the left of the picture
        const fly = { p: 0 }
        let g = null
        const clipTo = (edge) => { dateEl.style.clipPath = `inset(-40px ${Math.max(0, g.dateRight - edge)}px -40px -60px)` }
        gsap.set(dateEl, { clipPath: 'inset(-40px 100% -40px -60px)' })
        gsap.set([plane, trail], { autoAlpha: 0 })
        intro.current.to(
          fly,
          {
            p: 1,
            duration: 9.5,
            ease: 'none',
            onStart: () => {
              const h = root.current.getBoundingClientRect()
              const d = dateEl.getBoundingClientRect()
                            // the very same size as the plane that took off in the night scene (see PlaneIntro's planeW), so it is clearly the same aircraft
              const W = window.innerWidth < 700 ? window.innerWidth * 0.98 : Math.min(Math.max(window.innerWidth * 0.7, 340), 1100, (window.innerHeight - 46) * 1.2)
              g = { hl: h.left, ht: h.top, vw: h.width, W, H: W * RATIO, top: d.bottom - h.top + 4, vh: h.height, dateRight: d.right }
              gsap.set(plane, { width: W, autoAlpha: 1 })
              gsap.set(trail, { autoAlpha: 1 })
            },
            onUpdate: () => {
              const { p } = fly
              const { W, H, vw, hl } = g
              // continues the night take-off: it arrives still climbing nose-up with its wheels down, then levels out and
              // tucks its gear away as it settles onto the date line
              const q = Math.min(1, p / 0.4)
              const lift = (1 - q) * (1 - q) // 1 at the start, 0 once level
              const x = -W * 1.1 + p * (vw + W * 2.2)
              const y = g.top + lift * g.vh * 0.3 - Math.max(0, p - 0.4) * 24 // flies just under the date, so the writing is never hidden by the plane
              gsap.set(plane, { x, y, rotation: -2 - 15 * lift })
              plane.style.clipPath = `inset(0 0 ${15 * Math.min(1, Math.max(0, (q - 0.45) / 0.45))}% 0)`
              const tail = x + TAIL_X * W
              clipTo(hl + tail)
              const len = Math.max(0, Math.min(tail, vw * 0.5))
              gsap.set(trail, { x: tail - len, y: y + H * 0.62, width: len, opacity: Math.min(1, Math.max(0, (p - 0.3) / 0.15)) * (p > 0.88 ? (1 - p) / 0.12 : 1) })
            },
            onComplete: () => {
              gsap.set([plane, trail], { autoAlpha: 0 })
              gsap.set(dateEl, { clearProps: 'clipPath' })
            },
          },
          0.5,
        )
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
          // the "scroll up" cue fades as soon as the guest starts scrolling
          .to('.hero__cue', { autoAlpha: 0, y: -20, duration: 0.06 }, 0)
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
        {/* the date is kept a surprise for the countdown's scratch card, so only the city is written here */}
        <p className="hero__date">
          <em>{wedding.city}</em>
        </p>
      </div>

      {/* a gentle prompt at the foot of the sky: scroll up to walk in */}
      {/* outer element fades out on scroll, inner one fades in with the intro: separate elements so the two never fight */}
      <div className="hero__cue" aria-hidden="true">
        <p className="hero__cue-in">
          <span className="hero__cue-arrows"><i /><i /></span>
          <span className="hero__cue-text">Scroll up to step inside</span>
          <span className="hero__cue-pa gurmukhi">ਅੰਦਰ ਆਓ</span>
        </p>
      </div>

      <i className="hero__trail" aria-hidden="true" />
      <img className="hero__plane" src="/intro/plane-gear.webp" alt="" aria-hidden="true" draggable="false" />
      <HeroFX play={play} />
      <div className="hero__haveli" aria-hidden="true">
        <img className="gur" src="/gurdwara.webp" alt="" width="2470" height="2548" decoding="async" />
      </div>
      <div className="hero__flash" aria-hidden="true"><i className="hero__bloom" /></div>
    </section>
    </div>
  )
}
