import { gsap, useGSAP } from './gsap'

// Fades up every `.reveal` element inside `scope` as it enters the viewport.
export function useReveal(scope) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray('.reveal', scope.current).forEach((el) => {
          gsap.from(el, {
            y: 40,
            autoAlpha: 0,
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          })
        })
      })
    },
    { scope },
  )
}
