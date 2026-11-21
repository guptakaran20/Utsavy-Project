import { useContext, useEffect } from 'react'
import { gsap, prefersReducedMotion } from './gsap'
import { LenisContext } from './smoothScroll'

// Wherever the guest stops, once everything on screen has finished animating and they have not scrolled for
// IDLE ms, the page drifts down a little on its own (like a photo sliding up), then waits again.
// Any wheel, touch, key or tap hands control straight back. Nothing happens while a section holds the page
// (html.is-locked: the envelope, the Moments doorway, the Punjab clock), while typing in a form, or at the end.
// Add ?noauto (or ?notour) to the URL to switch it off, e.g. for testing.
// (long enough to read a paragraph: at 3 s the page moved away while guests were still reading)
const IDLE = 6500
const STEP = 0.35 // how far each nudge scrolls, as a share of the screen height
const DURATION = 2.4

// a GSAP animation that is still playing out. Ambient loops (repeat: -1) never "finish", so they don't count, and
// neither do scroll-linked ones: ScrollTrigger's scrub smoothing is a tween of a timeline's totalProgress.
const loops = (a) => {
  for (let p = a; p; p = p.parent) if (p.repeat?.() === -1) return true
  return false
}
const scrubbed = (a) => a.scrollTrigger || 'totalProgress' in a.vars || 'progress' in a.vars
const animating = () =>
  gsap.globalTimeline.getChildren(true, true, true).some((a) => a.isActive() && a.duration() > 0 && !scrubbed(a) && !loops(a))

export default function IdleNudge({ enabled }) {
  const lenis = useContext(LenisContext)

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return
    const q = new URLSearchParams(location.search)
    if (q.has('noauto') || q.has('notour')) return

    const html = document.documentElement
    let last = performance.now()
    let nudging = false

    const stopNudge = () => {
      if (!nudging) return
      nudging = false
      lenis.current?.stop() // stop() clears Lenis's running scrollTo animation
      lenis.current?.start()
    }
    const onInput = () => { last = performance.now(); stopNudge() }
    const onScroll = () => { if (!nudging) last = performance.now() }
    const inputs = ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown']
    inputs.forEach((e) => window.addEventListener(e, onInput, { passive: true }))
    window.addEventListener('scroll', onScroll, { passive: true })

    const check = () => {
      const l = lenis.current
      if (!l || nudging) return
      const now = performance.now()
      // anything that keeps the page busy restarts the wait, so the 3 s count from when it all settles
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')
      if (html.classList.contains('is-locked') || l.isStopped || typing || document.hidden || animating()) { last = now; return }
      if (now - last < IDLE) return
      const max = l.limit ?? html.scrollHeight - innerHeight
      if (l.scroll >= max - 4) return // at the end: nothing left to show
      nudging = true
      l.scrollTo(Math.min(max, l.scroll + innerHeight * STEP), {
        duration: DURATION,
        easing: (t) => -(Math.cos(Math.PI * t) - 1) / 2, // ease-in-out sine: a slow start, a soft stop
        onComplete: () => { nudging = false; last = performance.now() },
      })
    }
    const id = setInterval(check, 250)

    return () => {
      clearInterval(id)
      stopNudge()
      inputs.forEach((e) => window.removeEventListener(e, onInput))
      window.removeEventListener('scroll', onScroll)
    }
  }, [enabled, lenis])

  return null
}
