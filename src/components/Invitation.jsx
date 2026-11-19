import { useContext, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { splitLines } from '../lib/useLineReveal'
import { wedding } from '../data/wedding'
import { invitationText } from '../lib/invite'
import { LenisContext } from '../lib/smoothScroll'
import './Invitation.css'

// Your onion-dome (mandap) arch. The outline is drawn on, then the words settle in one after another.
const OGEE = 'M14,636 V270 C14,214 62,200 104,156 C146,112 186,78 200,10 C214,78 254,112 296,156 C338,200 386,214 386,270 V636Z'

const Motif = () => (
  <svg className="invite__motif" viewBox="0 0 120 24" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
      <path d="M60 3c4 5 4 11 0 17-4-6-4-12 0-17z" />
      <path d="M60 20c-7-1-13-5-16-12 7 0 12 4 16 12zM60 20c7-1 13-5 16-12-7 0-12 4-16 12z" />
      <path d="M4 20h36M80 20h36" />
      <circle cx="44" cy="20" r="1.4" fill="currentColor" /><circle cx="76" cy="20" r="1.4" fill="currentColor" />
    </g>
  </svg>
)

export default function Invitation() {
  const root = useRef(null)
  const lenis = useContext(LenisContext)
  const { bride, groom } = wedding

  useGSAP(
    () => {
      const m = gsap.matchMedia()
      m.add('(prefers-reduced-motion: no-preference)', () => {
        // Sizes are shares of the stage width (W): card height 1.625W, envelope 0.66W tall, its top at 0.4825W.
        const W = () => root.current.querySelector('.invite__stage').offsetWidth
        const H = 1.625, ENV_T = 0.4825, ENV_H = 0.66
        const y0 = ENV_T + 0.06 * ENV_H // card tucked just under the envelope's top edge
        const below = (y) => Math.max(0, y + H - (ENV_T + ENV_H) + 0.02) // card height hanging below the envelope, hidden
        const rise = -0.4

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        gsap.set('.invite__arch', { scale: 0.97, y: () => y0 * W(), clipPath: () => `inset(0px 0px ${below(y0) * W()}px 0px)` })
        gsap.set('.env', { autoAlpha: 1 })

        // 1. the wax seal lifts, the flap swings open
        tl.to('.env__seal', { scale: 1.15, duration: 0.25, ease: 'power1.out' }, 0)
          .to('.env__seal', { scale: 0.4, autoAlpha: 0, rotation: 25, duration: 0.45, ease: 'power2.in' }, 0.25)
          .to('.env__flap', { rotationX: 180, duration: 0.9, ease: 'power2.inOut' }, 0.5)
          .set('.env__flap', { zIndex: 0 }, 0.95)
        // 2. the card glides up out of the pocket, easing in and out so there is no jolt
          .to('.invite__arch', { y: () => rise * W(), clipPath: () => `inset(0px 0px ${below(rise) * W()}px 0px)`, scale: 1, duration: 1.7, ease: 'sine.inOut', force3D: true }, 1.25)
        // 3. the envelope melts away while the rest of the card is revealed, then the card floats down into place
          .to('.env', { y: () => 0.35 * W(), autoAlpha: 0, duration: 1.1, ease: 'power2.inOut' }, 2.95)
          .to('.invite__arch', { clipPath: 'inset(0px 0px 0px 0px)', duration: 1.1, ease: 'power1.inOut' }, 2.95)
          .set('.invite__arch', { zIndex: 5 }, 4.05)
          .to('.invite__arch', { y: 0, duration: 1.3, ease: 'power2.inOut', force3D: true }, 3.35)
          .set('.env', { display: 'none' }, 4.1)
        // 4. the words settle in, as before
          .fromTo('.invite__line', { strokeDasharray: 2600, strokeDashoffset: 2600 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.2 }, 3.65)
          .from('.invite__keyline', { autoAlpha: 0, duration: 0.8 }, 4.55)
          .from('.invite__ik', { scale: 0.4, autoAlpha: 0, duration: 0.9, ease: 'back.out(2)' }, 3.85)
          .from('.invite__seq', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 4.05)
          .fromTo('.invite__name', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 1.4, ease: 'power2.inOut', stagger: 0.55 }, 4.35)
          .from('.invite__amp', { scale: 0, rotation: -90, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 4.95)
          .from('.invite__rule i', { scaleX: 0, duration: 1, ease: 'power2.inOut' }, 5.35)
          .from('.invite__rule b', { scale: 0, rotation: 180, duration: 0.7, ease: 'back.out(2)' }, 5.55)
          .from('.invite__where', { y: 14, autoAlpha: 0, duration: 0.8 }, 6.4)
          .from('.invite__coda-orn', { scaleX: 0.2, autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, 6.6)
          .from('.invite__hashtag', { y: 10, autoAlpha: 0, duration: 0.8 }, 6.9)

        // While it opens, the page holds still: bring the envelope to the middle of the screen, pause scrolling,
        // and give scrolling back once the card has finished writing itself.
        const release = () => { lenis.current?.start(); document.documentElement.classList.remove('is-locked') }
        tl.eventCallback('onComplete', release)
        const open = () => {
          if (tl.progress() > 0) return
          // the invitation paragraph rises line by line; it is split now (fonts are in by the time the card opens) and put
          // back to plain text once the card has finished, so it reflows normally afterwards
          const split = splitLines(root.current.querySelector('.invite__text'))
          tl.from(split.lines, { yPercent: 105, autoAlpha: 0, duration: 0.8, stagger: 0.13, ease: 'power3.out' }, 5.65)
          tl.eventCallback('onComplete', () => { split.revert(); release() })
          // the card starts at once, whatever else is happening; the page glides to centre the envelope and then holds
          tl.play()
          const stage = root.current.querySelector('.invite__stage')
          const centre = stage.getBoundingClientRect().top + window.scrollY + 0.8125 * W() - window.innerHeight / 2
          document.documentElement.classList.add('is-locked')
          if (lenis.current) {
            lenis.current.start()
            lenis.current.scrollTo(centre, { duration: 0.8, lock: true, force: true })
            gsap.delayedCall(0.85, () => lenis.current?.stop())
          } else {
            window.scrollTo({ top: centre, behavior: 'smooth' })
          }
          gsap.delayedCall(12, release) // never leave a guest stuck, whatever happens
        }
        // opens on its own a moment after the envelope is on screen (so the sealed envelope is seen), or at once on a tap of the seal
        const st = ScrollTrigger.create({ trigger: '.invite__stage', start: 'top 45%', once: true, onEnter: () => gsap.delayedCall(0.6, open) })
        const seal = root.current.querySelector('.env__seal')
        seal.addEventListener('click', open)
        return () => { st.kill(); seal.removeEventListener('click', open); release() }
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="section invite chap" data-chapter data-dwell="9">
      <div className="invite__stage">
      {/* the envelope: back panel, the card, then the front pocket and the flap with its wax seal */}
      <div className="env env__back" aria-hidden="true" />
      <div className="invite__arch">
        <svg className="invite__shape" viewBox="0 0 400 650" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="invPaper" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fffefb" /><stop offset="1" stopColor="#fbf3ea" />
            </linearGradient>
            <linearGradient id="invGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e2c27a" /><stop offset=".5" stopColor="#b98b3e" /><stop offset="1" stopColor="#d9b56a" />
            </linearGradient>
          </defs>
          <path d={OGEE} fill="url(#invPaper)" />
          <path className="invite__line" d={OGEE} fill="none" stroke="url(#invGold)" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
          <path className="invite__keyline" d={OGEE} fill="none" stroke="#b98b3e" strokeOpacity=".75" strokeWidth="1.2" strokeDasharray="1 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="translate(200 323) scale(.94 .955) translate(-200 -323)" />
        </svg>

        <div className="invite__inner">
          <p className="invite__ik gurmukhi" aria-hidden="true">{wedding.blessingSymbol}</p>
          <p className="invite__bless invite__seq">|| {wedding.blessingEnglish} ||</p>
          <Motif />
          <p className="invite__welcome gurmukhi invite__seq">ਜੀ ਆਇਆਂ ਨੂੰ</p>

          <h2 className="invite__names">
            <span className="invite__name">{bride.name}</span>
            <span className="invite__amp" aria-hidden="true">&amp;</span>
            <span className="sr-only"> and </span>
            <span className="invite__name">{groom.name}</span>
          </h2>

          <p className="invite__rule" aria-hidden="true"><i /><b /><i /></p>
          <p className="invite__text invite__tail">{invitationText()}</p>
          <p className="invite__where invite__tail">{wedding.city}</p>
        </div>
      </div>
      <div className="env env__front" aria-hidden="true">
        <svg viewBox="0 0 400 264" preserveAspectRatio="none">
          <path d="M0 0 L200 150 L400 0 V264 H0Z" fill="url(#envFront)" />
          <path d="M0 264 L170 128 M400 264 L230 128" stroke="#c99a5a" strokeOpacity=".45" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
          <path d="M0 0 L200 150 L400 0" stroke="#b98b3e" strokeOpacity=".6" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
          <defs>
            <linearGradient id="envFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6dedb" /><stop offset="1" stopColor="#efcfcb" /></linearGradient>
            <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3d3cf" /><stop offset="1" stopColor="#e9bdb9" /></linearGradient>
          </defs>
        </svg>
      </div>
      <div className="env env__flap" aria-hidden="true">
        <svg viewBox="0 0 400 160" preserveAspectRatio="none">
          <path d="M0 0 H400 L200 160Z" fill="url(#envFlap)" />
          <path d="M8 4 H392 L200 150Z" fill="none" stroke="#b98b3e" strokeOpacity=".75" strokeWidth="1.2" strokeDasharray="1 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <button type="button" className="env env__seal" aria-label="Open the invitation">
        <span>{bride.name[0]}<i>&amp;</i>{groom.name[0]}</span>
      </button>
      </div>

      {/* a small gold closing flourish under the card, so the paper below it isn't left bare */}
      <div className="invite__coda" aria-hidden="true">
        <svg className="invite__coda-orn" viewBox="0 0 240 40">
          <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
            <path d="M8 20h70M162 20h70" strokeDasharray="1 5" />
            <path d="M78 20c10-9 20-9 26 0-6 9-16 9-26 0zM162 20c-10-9-20-9-26 0 6 9 16 9 26 0z" />
            <path d="M120 4c7 7 7 15 0 22-7-7-7-15 0-22z" />
            <path d="M120 26c-8 0-14-4-17-10 8-1 14 3 17 10zM120 26c8 0 14-4 17-10-8-1-14 3-17 10z" />
            <circle cx="120" cy="33" r="1.8" fill="currentColor" />
          </g>
        </svg>
        <p className="invite__hashtag">{wedding.hashtag}</p>
      </div>
    </section>
  )
}
