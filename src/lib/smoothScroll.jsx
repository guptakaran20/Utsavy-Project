import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

const ScrollContext = createContext(() => {})
export const LenisContext = createContext({ current: null })

// Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in sync.
export function SmoothScroll({ locked, children }) {
  const lenisRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.09 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    // A slow phone stalls now and then (a painting decoding, a section mounting). With no lag smoothing every running
    // animation jumped ahead by the whole stall, so entrances looked skipped. Any frame over 200ms now counts as one
    // normal frame: the animation pauses for the stall and carries on from where it was. Ordinary slow frames are untouched.
    gsap.ticker.lagSmoothing(200, 33)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', locked)
    if (locked) {
      lenisRef.current?.stop()
    } else {
      lenisRef.current?.start()
      // The scrollbar comes back when unlocking, so positions need recalculating
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [locked])

  const scrollTo = useCallback((target) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { duration: 1.6 })
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' })
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <LenisContext.Provider value={lenisRef}>
      <ScrollContext.Provider value={scrollTo}>{children}</ScrollContext.Provider>
    </LenisContext.Provider>
  )
}

export const useScrollTo = () => useContext(ScrollContext)
