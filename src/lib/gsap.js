import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Observer } from 'gsap/Observer'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, Observer, useGSAP)
// a phone's address bar sliding in/out resizes the window: don't recalculate every scroll animation for it
ScrollTrigger.config({ ignoreMobileResize: true })

// resize listener that skips height-only changes on touch screens (the address bar), which would otherwise
// re-measure sections and refresh ScrollTrigger mid-swipe, making the page jump
export function onViewportResize(fn) {
  const touch = window.matchMedia('(pointer: coarse)').matches
  let w = window.innerWidth
  const handler = () => {
    if (touch && window.innerWidth === w) return
    w = window.innerWidth
    fn()
  }
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, Observer, useGSAP }
