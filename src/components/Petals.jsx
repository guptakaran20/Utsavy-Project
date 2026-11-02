import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

const COLORS = ['#f29b1d', '#ffb300', '#e8751a', '#d81b60', '#c2185b']

// Marigold and rose petals drifting down through the parent element.
export default function Petals({ count = 22 }) {
  const ref = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const random = gsap.utils.random
        gsap.utils.toArray('.petal', ref.current).forEach((petal) => {
          gsap.set(petal, { left: `${random(0, 100)}%`, y: -40, scale: random(0.6, 1.25) })
          gsap.to(petal, {
            y: () => ref.current.offsetHeight + 40,
            x: () => random(-140, 140),
            rotation: () => random(-360, 360),
            duration: () => random(9, 17),
            delay: random(0, 12),
            ease: 'none',
            repeat: -1,
            repeatRefresh: true,
          })
          gsap.to(petal, {
            rotationX: 180,
            duration: random(1.4, 2.8),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        })
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="petals" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="petal" style={{ background: COLORS[i % COLORS.length] }} />
      ))}
    </div>
  )
}
