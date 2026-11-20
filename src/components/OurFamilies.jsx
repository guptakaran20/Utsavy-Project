import { useContext, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { absTop, lockedTimeline } from '../lib/lockedTimeline'
import { LenisContext } from '../lib/smoothScroll'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import FloralSides from './FloralSides'
import './OurFamilies.css'

// One family: a round seal with the family name, then who they are, their parents and grandparents.
function Side({ f, side }) {
  return (
    <div className={`ofam__side ofam__side--${side}`}>
      <div className="ofam__seal">
        <span className="ofam__seal-g" lang="pa">{f.familyGurmukhi}</span>
      </div>
      <p className="ofam__family">{f.family}</p>
      <span className="ofam__label">{f.label}</span>
      <p className="ofam__parents">
        <span>{f.mother}</span>
        <span className="ofam__amp">&amp;</span>
        <span>{f.father}</span>
      </p>
      <p className="ofam__grand">
        <em>{f.grandLabel}</em>
        <span>{f.grand}</span>
      </p>
    </div>
  )
}

// The whole family portrait comes in first, big, then settles into its place at the head of the section;
// below it the bride's family appears, then the groom's, then the couple's names and the blessings.
export default function OurFamilies() {
  const root = useRef(null)
  const lenis = useContext(LenisContext)
  const { bride, groom, invite } = wedding.bothFamilies
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const at = (sel, lift) => () => Math.max(cam.y, absTop(q(sel)[0]) - lift)

        const { tl, glide, cam, prime, cleanup } = lockedTimeline(lenis, {
          trigger: q('.ofam__threads')[0],
          safety: 16,
          onDone: () => gsap.to(q('.ofam__seal'), { rotation: (i) => (i ? -2.5 : 2.5), duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 }),
        })

        // 1. the page settles on the section and the family portrait rises in, big, in the middle of the screen
        const img = q('.ofam__photo img')
        const slot = q('.ofam__photo')[0]
        // how far the portrait's own place is from the middle of the screen, once the page has settled on the section
        // the page settles with the section title in full view, clear of the phone's notch
        const TITLE_GAP = 56
        const lift = () => window.innerHeight / 2 - (absTop(slot) - absTop(q('.section-title')[0]) + TITLE_GAP) - slot.offsetHeight / 2
        glide(at('.section-title', TITLE_GAP), { duration: 1.2 }, 0)
        tl.fromTo(img, { autoAlpha: 0, scale: 0.9, y: lift }, { autoAlpha: 1, scale: 1.15, y: lift, duration: 1.3, ease: 'sine.out' }, 0.3)
        // 2. then, without stopping, it glides up and settles into its place at the head of the section
          .fromTo(img, { autoAlpha: 1, scale: 1.15, y: lift }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, 1.6)
        // 3. the bride's family
          .from(q('.ofam__side--bride .ofam__seal'), { y: -24, rotation: -9, autoAlpha: 0, duration: 1.2, ease: 'power3.out' }, 3.0)
          .from(q('.ofam__side--bride > :not(.ofam__seal)'), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12 }, 3.3)
          .from(q('.ofam__join'), { scaleX: 0, autoAlpha: 0, duration: 0.8, ease: 'power2.inOut' }, 4.5)
        // 4. down to the groom's family
        glide(at('.ofam__side--groom', 120), { duration: 1.4, ease: 'sine.inOut' }, 4.6)
        tl.from(q('.ofam__side--groom .ofam__seal'), { y: -24, rotation: 9, autoAlpha: 0, duration: 1.2, ease: 'power3.out' }, 5.2)
          .from(q('.ofam__side--groom > :not(.ofam__seal)'), { y: 14, autoAlpha: 0, duration: 0.8, ease: 'power2.out', stagger: 0.12 }, 5.5)
        // 5. and on to the couple and the blessings
        glide(() => {
          const end = q('.ofam__blessings')[0]
          return Math.max(cam.y, absTop(end) + end.offsetHeight + 40 - window.innerHeight)
        }, { duration: 1.5, ease: 'sine.inOut' }, 6.6)
        tl.from(q('.ofam__invite, .ofam__name, .ofam__and'), { y: 16, autoAlpha: 0, duration: 0.9, ease: 'power2.out', stagger: 0.14 }, 7.1)
          .from(q('.ofam__blessing, .ofam__gem'), { y: 10, autoAlpha: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 }, 7.9)
        prime() // show every piece at its starting point before the section scrolls in
        // the portrait has two steps on the same image; priming leaves it at the second one's start, so put it back to hidden
        gsap.set(img, { autoAlpha: 0, scale: 0.9, y: lift })

        return cleanup
      })
    },
    { scope: root },
  )

  return (
    <section id="families" ref={root} className="section sky-bg ofam chap" data-chapter data-dwell="8">
      <FloralSides tiles={6} head={false} />
      {/* a painted toran of marigolds, roses and mango leaves with brass bells, hung across the top of the page */}
      <img className="ofam__toran art-sway" data-art="drop" src="/families-toran.webp" alt="" width="1536" height="640" decoding="async" loading="lazy" aria-hidden="true" />
      <SectionTitle eyebrow="ਦੋਵੇਂ ਪਰਿਵਾਰ" title="Our Families" />
      <p className="ofam__sub reveal">With the blessings of our elders</p>

      <div className="ofam__threads">
        {/* the family portrait: shown big first, then it settles into its place here, above the families */}
        <div className="ofam__photo" aria-hidden="true">
          <img src="/families.webp" alt="" width="1280" height="834" decoding="async" loading="lazy" />
        </div>

        <Side f={bride} side="bride" />
        <p className="ofam__join" aria-hidden="true"><i /><b>&amp;</b><i /></p>
        <Side f={groom} side="groom" />

        <div className="ofam__couple">
          <p className="ofam__invite">{invite}</p>
          <h3 className="ofam__name">{bride.name}</h3>
          <span className="ofam__and">&amp;</span>
          <h3 className="ofam__name">{groom.name}</h3>
          <div className="ofam__blessings">
            <p className="ofam__blessing">“{bride.blessing}”</p>
            <span className="ofam__gem" aria-hidden="true" />
            <p className="ofam__blessing">“{groom.blessing}”</p>
          </div>
        </div>
      </div>
      {/* a painted flower-petal rangoli with brass diyas and lotuses, laid along the foot of the page */}
      <div className="ofam__rangoli" data-art="rise" aria-hidden="true">
        <img src="/families-rangoli.webp" alt="" width="1536" height="400" loading="lazy" decoding="async" />
        {/* the five diya flames glow and flicker (centres measured on the painting) */}
        {[8.6, 28.5, 50, 71.6, 91.4].map((x, i) => (
          <span key={x} className="art-flame" style={{ left: `${x}%`, top: '23%', animationDelay: `${i * -0.53}s`, animationDuration: `${2.1 + (i % 3) * 0.35}s` }} />
        ))}
      </div>
    </section>
  )
}
