import { gsap, ScrollTrigger, useGSAP } from './gsap'

// Unfolds every `.reveal` inside `scope` one after another as it scrolls in.
// Elements that enter together are batched and cascade quickly in DOM order.
export function useReveal(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const els = gsap.utils.toArray('.reveal', scope.current)
        gsap.set(els, { y: 20, autoAlpha: 0 })
        ScrollTrigger.batch(els, {
          start: 'top 92%',
          once: true,
          interval: 0.08,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out', stagger: 0.07, overwrite: true }),
        })
      })
    },
    { scope },
  )
}
