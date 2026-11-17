import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import './GarlandBridge.css'

// A rose garland laid right over the join between the couple scene and The Celebrations (it takes no height of its
// own), so the scene's floor, the garland and the Celebrations' corner roses read as one continuous strip of flowers. As it scrolls in, each half of the garland unfurls from its corner
// toward the centre.
export default function GarlandBridge() {
  const root = useRef(null)

  useGSAP(
    () => {
      const m = gsap.matchMedia()
      m.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top 98%', end: 'center 55%', scrub: 0.6 } })
          .fromTo('.garland__half--l', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 50% 0 0)' }, 0)
          .fromTo('.garland__half--r', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 50%)' }, 0)
          .fromTo('.garland__half', { autoAlpha: 0.2 }, { autoAlpha: 1, duration: 0.4 }, 0)
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="garland" aria-hidden="true">
      <img className="garland__half garland__half--l" src="/floral-divider.webp" alt="" width="2000" height="667" loading="lazy" decoding="async" />
      <img className="garland__half garland__half--r" src="/floral-divider.webp" alt="" width="2000" height="667" loading="lazy" decoding="async" />
    </div>
  )
}
