import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

// A strip of phulkari embroidery that slides sideways as you scroll past it.
export default function PhulkariBand({ reverse = false }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          ref.current,
          { backgroundPositionX: 0 },
          {
            backgroundPositionX: reverse ? -288 : 288,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    },
    { scope: ref },
  )

  return <div ref={ref} className="phulkari" aria-hidden="true" />
}
