import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'

const ScrollContext = createContext(() => {})

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
    gsap.ticker.lagSmoothing(0)
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

  return <ScrollContext.Provider value={scrollTo}>{children}</ScrollContext.Provider>
}

export const useScrollTo = () => useContext(ScrollContext)
