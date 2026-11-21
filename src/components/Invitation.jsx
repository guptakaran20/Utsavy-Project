import { useContext, useRef } from 'react'
import { fitLen } from '../lib/fitText'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import { LenisContext } from '../lib/smoothScroll'
import { hurryOnInput } from '../lib/lockedTimeline'
import './Invitation.css'

// The welcome card: a painted onion-dome (mandap) arch of ivory paper in a gold frame, roses and marigolds on its
// shoulders and corners (public/invite-card.webp, 1024 x 1536). It rises out of an envelope sealed with painted wax,
// then the words settle in one after another on the blank paper.

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
        // Sizes are shares of the stage width (W): card height 1.5W, envelope 0.66W tall, its top at 0.4825W.
        const W = () => root.current.querySelector('.invite__stage').offsetWidth
        const H = 1.5, ENV_T = 0.4825, ENV_H = 0.66
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
          // once fully out, drop the clip: even at inset(0) it cut the card's soft shadow off in a hard band along its foot
          .set('.invite__arch', { clearProps: 'clipPath' }, 4.06)
          .to('.invite__arch', { y: 0, duration: 1.3, ease: 'power2.inOut', force3D: true }, 3.35)
          .set('.env', { display: 'none' }, 4.1)
        // 4. the words settle in, as before
          .from('.invite__crest', { scale: 0.4, rotation: -40, autoAlpha: 0, duration: 1, ease: 'back.out(1.8)' }, 3.75)
          .from('.invite__ik', { scale: 0.4, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 4.05)
          .from('.invite__seq', { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 4.05)
          .fromTo('.invite__name', { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 1.4, ease: 'power2.inOut', stagger: 0.55 }, 4.35)
          .from('.invite__amp', { scale: 0, rotation: -90, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' }, 4.95)
          .from('.invite__rule i', { scaleX: 0, duration: 1, ease: 'power2.inOut' }, 5.35)
          .from('.invite__rule b', { scale: 0, rotation: 180, duration: 0.7, ease: 'back.out(2)' }, 5.55)
          .from('.invite__where', { y: 14, autoAlpha: 0, duration: 0.8 }, 5.8)
          .from('.invite__coda-orn', { scaleX: 0.2, autoAlpha: 0, duration: 1, ease: 'power2.inOut' }, 6.6)
          .from('.invite__hashtag', { y: 10, autoAlpha: 0, duration: 0.8 }, 6.9)

        // While it opens, the page holds still: bring the envelope to the middle of the screen, pause scrolling,
        // and give scrolling back once the card has finished writing itself.
        const release = () => { lenis.current?.start(); document.documentElement.classList.remove('is-locked') }
        tl.eventCallback('onComplete', release)
        const open = () => {
          if (tl.progress() > 0) return
          // the card starts at once, whatever else is happening; the page glides to centre the envelope and then holds.
          // Written as a 7.5 s sequence, it plays in about 5 s, and a guest who tries to scroll on gets the rest at triple speed.
          tl.timeScale(1.5).play()
          hurryOnInput(tl)
          const stage = root.current.querySelector('.invite__stage')
          const centre = stage.getBoundingClientRect().top + window.scrollY + 0.75 * W() - window.innerHeight / 2
          document.documentElement.classList.add('is-locked')
          if (lenis.current) {
            lenis.current.start()
            lenis.current.scrollTo(centre, { duration: 0.8, lock: true, force: true })
            gsap.delayedCall(0.85, () => lenis.current?.stop())
          } else {
            window.scrollTo({ top: centre, behavior: 'smooth' })
          }
          gsap.delayedCall(9, release) // never leave a guest stuck, whatever happens
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
        <img className="invite__card" src="/invite-card.webp" alt="" width="1024" height="1536" decoding="async" aria-hidden="true" />

        <div className="invite__inner">
          {/* ੴ sits in a painted gold lotus medallion */}
          <div className="invite__crest" aria-hidden="true"><p className="invite__ik gurmukhi">{wedding.blessingSymbol}</p></div>
          <p className="invite__bless invite__seq">|| {wedding.blessingEnglish} ||</p>
          <Motif />
          <p className="invite__welcome gurmukhi invite__seq">ਜੀ ਆਇਆਂ ਨੂੰ</p>

          <h2 className="invite__names">
            <span className="invite__name" style={fitLen(bride.name)}>{bride.name}</span>
            <span className="invite__amp" aria-hidden="true">&amp;</span>
            <span className="sr-only"> and </span>
            <span className="invite__name" style={fitLen(groom.name)}>{groom.name}</span>
          </h2>

          <p className="invite__rule" aria-hidden="true"><i /><b /><i /></p>
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
      {/* a painted spray of roses, marigolds and jasmine tied with ribbon, tucked across the pocket */}
      <img className="env env__sprig" src="/invite-sprig.webp" alt="" width="1000" height="421" decoding="async" aria-hidden="true" />
      {/* painted wax seal with gold ribbon; the couple's initials are pressed into its blank centre */}
      <button type="button" className="env env__seal" aria-label="Open the invitation">
        <img src="/invite-seal.webp" alt="" width="420" height="477" decoding="async" />
        <span>{bride.name[0]}<i>&amp;</i>{groom.name[0]}</span>
      </button>
      </div>

      {/* under the card: the hashtag, then the painted diya, which rests on the Bride & Groom page's marigold garland */}
      <div className="invite__coda" aria-hidden="true">
        <p className="invite__hashtag">{wedding.hashtag}</p>
        {/* a painted brass diya on rose petals, with marigold-and-pearl strings either side; its flame glows */}
        <div className="invite__coda-orn">
          <img src="/invite-coda.webp" alt="" width="1000" height="196" decoding="async" loading="lazy" />
          <span className="art-flame invite__flame" />
        </div>
      </div>
    </section>
  )
}
