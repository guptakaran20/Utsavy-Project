import { useContext, useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { LenisContext } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import { guestName } from '../lib/guest'
import HeroFX from './HeroFX'
import './Hero.css'


export default function Hero({ play }) {
  const wrap = useRef(null)
  const root = useRef(null)
  const intro = useRef(null)
  const lenis = useContext(LenisContext)
  const { bride, groom } = wedding
  const guest = guestName()

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
          .from('.hero__welcome', { y: 10, autoAlpha: 0, duration: 1.1 }, 0.9)
          .from('.hero__couple', { y: 16, autoAlpha: 0, filter: 'blur(8px)', duration: 1.2 }, 1.8)
          .from('.hero__sub', { y: 16, autoAlpha: 0, stagger: 0.12, duration: 0.8 }, 1.8)
          .from('.hero__cue-in', { y: 14, autoAlpha: 0, duration: 0.9 }, 2.6)

        // the city line fades in last, under the couple's names
        intro.current.from('.hero__date', { y: 10, autoAlpha: 0, duration: 0.9 }, 2.1)
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

        // A gentle nudge, like a photo sliding up on its own: once the opening animation is over, if the guest just sits
        // and watches, the page scrolls a little by itself so the gurdwara rises out of the sky behind the names,
        // then stops and waits. The walk through the door is still the guest's own scroll.
        // Any wheel, touch or key press hands control straight back.
        let gliding = false
        const stopGlide = () => {
          if (!gliding) return
          gliding = false
          lenis.current?.stop() // stop() clears Lenis's running scrollTo animation
          lenis.current?.start()
          detach()
        }
        const events = ['wheel', 'touchstart', 'keydown', 'pointerdown']
        const detach = () => events.forEach((e) => window.removeEventListener(e, stopGlide))
        const glide = () => {
          const html = document.documentElement
          if (!lenis.current || window.scrollY > 8 || html.classList.contains('is-locked')) return
          // 30% of the walk: the gurdwara has risen with its dome behind the names, before the camera heads for the door
          const target = wrap.current.getBoundingClientRect().top + window.scrollY + 0.3 * window.innerHeight * 2.25
          gliding = true
          events.forEach((e) => window.addEventListener(e, stopGlide, { passive: true }))
          lenis.current.scrollTo(target, {
            duration: 3.2,
            easing: (t) => -(Math.cos(Math.PI * t) - 1) / 2, // ease-in-out sine: a slow start, a soft stop
            onComplete: () => { gliding = false; detach() },
          })
        }
        const nudge = gsap.delayedCall(1.4, glide).pause()
        intro.current.eventCallback('onComplete', () => nudge.restart(true))
        return () => { nudge.kill(); stopGlide() }
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
      {/* each cloud bank is its own SVG layer: the noise filter is drawn once, then the layer just glides (a cheap GPU move)
          instead of the filter being redrawn on every frame, which made phones stutter */}
      <div className="hero__clouds" aria-hidden="true">
        {[
          ['a', [[110, 190, 120, 34, '#fff'], [210, 230, 90, 26, '#ffe9f0'], [60, 290, 110, 28, '#fff'], [250, 150, 70, 22, '#ffdfe9'], [170, 330, 80, 22, '#ffe9f0'], [30, 420, 90, 22, '#fff']], 1],
          ['b', [[880, 120, 110, 30, '#fff'], [800, 200, 90, 24, '#ffe9f0'], [930, 260, 100, 28, '#fff'], [840, 340, 80, 22, '#ffdfe9'], [960, 400, 80, 20, '#fff']], 1],
          ['c', [[520, 70, 120, 20, '#fff'], [420, 110, 80, 16, '#ffe9f0']], 0.8],
        ].map(([id, blobs, op]) => (
          <svg key={id} className={`cl cl--${id}`} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <filter id={`cloud-${id}`} x="-30%" y="-40%" width="160%" height="180%">
                <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="4" seed="7" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="110" />
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
            <g filter={`url(#cloud-${id})`}>
              {blobs.map(([x, y, rx, ry, c], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={c} opacity={op} />)}
            </g>
          </svg>
        ))}
      </div>
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
        {/* Punjabi and English mixed: ਜੀ ਆਇਆਂ ਨੂੰ / GUEST / to the wedding of / HARLEEN & JASRAJ / the families' invitation / city */}
        <p className="hero__welcome gurmukhi">ਜੀ ਆਇਆਂ ਨੂੰ</p>
        <h1 className="hero__names">
          <span className="hero__line hero__guest" style={{ '--len': Math.max(10, guest.length) }}>{guest}</span>
        </h1>
        <p className="hero__weds-row"><i aria-hidden="true" /><span className="hero__weds">to the wedding of</span><i aria-hidden="true" /></p>
        <p className="hero__couple">{bride.name} <span className="hero__amp">&amp;</span> {groom.name}</p>
        <p className="hero__rule" aria-hidden="true"><i /><b /><i /></p>
        <p className="hero__sub gurmukhi">{wedding.familiesGurmukhi} ਵੱਲੋਂ ਨਿੱਘਾ ਸੱਦਾ</p>
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

      <HeroFX play={play} />
      <div className="hero__haveli" aria-hidden="true">
        <img className="gur" src="/gurdwara-1100.webp" srcSet="/gurdwara-800.webp 800w, /gurdwara-1100.webp 1100w, /gurdwara-1300.webp 1300w, /gurdwara-1600.webp 1600w" sizes="(max-aspect-ratio: 1/1) 160vw, 112vw" alt="" width="2470" height="2548" decoding="async" />
      </div>
      <div className="hero__flash" aria-hidden="true"><i className="hero__bloom" /></div>
    </section>
    </div>
  )
}
