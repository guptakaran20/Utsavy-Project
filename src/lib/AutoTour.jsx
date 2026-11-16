import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LenisContext } from './smoothScroll'
import { prefersReducedMotion } from './gsap'
import './AutoTour.css'

const SPEED = 95 // px per second: a slow, readable pace so every reveal plays out

// Hands-free reading: the page drifts down at a steady pace, exactly like a slow thumb scroll,
// so every reveal and the event days play on their own. Touch, wheel or keys hand control back.
export default function AutoTour({ armed }) {
  const lenisRef = useContext(LenisContext)
  const [state, setState] = useState('idle') // idle | playing | paused | done
  const raf = useRef(0)

  const stop = useCallback((next = 'paused') => {
    cancelAnimationFrame(raf.current)
    raf.current = 0
    setState((s) => (s === 'playing' ? next : s))
  }, [])

  const play = useCallback(() => {
    const lenis = lenisRef.current
    if (!lenis) return
    cancelAnimationFrame(raf.current)
    const end = () => {
      const r = document.getElementById('rsvp')
      return r ? r.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.1 : document.documentElement.scrollHeight
    }
    if (window.scrollY >= end() - 4) lenis.scrollTo(0, { immediate: true })
    setState('playing')
    let pos = window.scrollY
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      pos += SPEED * dt
      const limit = end()
      if (pos >= limit) {
        lenis.scrollTo(limit, { immediate: true })
        raf.current = 0
        setState('done')
        return
      }
      lenis.scrollTo(pos, { immediate: true })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }, [lenisRef])

  // Start by itself a few seconds after the gate opens (never for reduced motion)
  useEffect(() => {
    if (!armed || prefersReducedMotion() || new URLSearchParams(location.search).has('notour')) return
    const t = setTimeout(play, 4500)
    return () => clearTimeout(t)
  }, [armed, play])

  // Guest input = guest is in charge
  useEffect(() => {
    if (state !== 'playing') return
    const halt = () => stop('paused')
    const keys = (e) => ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].includes(e.key) && halt()
    window.addEventListener('wheel', halt, { passive: true })
    window.addEventListener('touchstart', halt, { passive: true })
    window.addEventListener('keydown', keys)
    return () => {
      window.removeEventListener('wheel', halt)
      window.removeEventListener('touchstart', halt)
      window.removeEventListener('keydown', keys)
    }
  }, [state, stop])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const label = { idle: 'Auto-scroll', playing: 'Pause', paused: 'Resume tour', done: 'Replay tour' }[state]

  return (
    <AnimatePresence>
      {armed && (
        <motion.button
          type="button"
          className={`tour tour--${state}`}
          aria-label={label}
          onClick={(e) => { e.stopPropagation(); state === 'playing' ? stop('paused') : play() }}
          onTouchStart={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="tour__icon" aria-hidden="true">
            {state === 'playing' ? (
              <svg viewBox="0 0 24 24"><path d="M8 5h3v14H8zM13 5h3v14h-3z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24"><path d="M8 5l11 7-11 7z" /></svg>
            )}
          </span>
          <span className="tour__label">{label}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
