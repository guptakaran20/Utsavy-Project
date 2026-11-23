import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { fireCrackers } from '../lib/crackers'
import './PlaneIntro.css'

// /intro/plane-top.webp: the airliner seen from directly above, nose up, on a transparent 1254 × 1254 square.
// Fractions below are measured on that image.
const IMG = { w: 1254, h: 1254 }
const WING_LINE = 690 / IMG.h // just under the wings: the night sky is wiped away behind it as the plane passes
const ENGINES = [415 / IMG.w, 838 / IMG.w] // engine centres, where the contrails start
const ENGINE_TAIL = 520 / IMG.h
const WIPE_PAD = 80 // the sky's box runs this far below the screen, so its soft foot is out of sight before the flight

// A plain night sky (the greeting now lives in the hero). As soon as the page loads an airliner, seen from above, flies in from the bottom
// of the screen and climbs straight up and out of the top. Its wings are wider than the screen, so for a moment it
// covers the whole view; the sky is wiped away behind its wings, revealing the invitation underneath.
export default function PlaneIntro({ onEnter, onDone }) {
  const root = useRef(null)
  const cbs = useRef({ onEnter, onDone })
  useLayoutEffect(() => { cbs.current = { onEnter, onDone } })

  useLayoutEffect(() => {
    const el = root.current
    const wipeBox = el.querySelector('.pi-wipe')
    const sky = el.querySelector('.pi-sky')
    const plane = el.querySelector('.pi-plane')
    const reduced = prefersReducedMotion()
    let finished = false
    let entered = false

    const finish = () => {
      if (finished) return
      finished = true
      cbs.current.onDone?.()
    }
    const enter = () => {
      if (entered) return
      entered = true
      fireCrackers()
      cbs.current.onEnter?.()
    }

    if (reduced) {
      gsap.set(plane, { autoAlpha: 0 })
      const t = window.setTimeout(() => {
        enter()
        gsap.to(el, { opacity: 0, duration: 0.6, ease: 'power1.inOut', onComplete: finish })
      }, 1200)
      return () => { window.clearTimeout(t); gsap.killTweensOf(el) }
    }

    // ---- geometry ----------------------------------------------------------------------------------------------
    const vw = () => window.innerWidth
    const vh = () => window.innerHeight
    const span = () => Math.max(vw() * 1.35, vh()) // wingspan: always wider than the screen
    const len = () => (span() * IMG.h) / IMG.w

    // p: 0 = nose just below the bottom edge, 1 = tail just above the top edge
    const state = { p: 0 }
    const place = () => {
      const W = span()
      const H = len()
      const y = vh() + 2 - state.p * (vh() + H + 4)
      plane.style.width = `${W}px`
      plane.style.transform = `translate3d(${-W / 2}px, ${y}px, 0)`
      // everything below the wing line has been flown over: let the invitation show through there.
      // The sky sits in a box with a fixed soft-edged mask at its foot; the box slides up so its foot follows the wings,
      // and the sky inside slides down by the same amount so it stays put. Both are plain GPU moves: animating the mask
      // itself made a slow phone repaint the whole screen on every frame of the flight.
      const wipe = y + WING_LINE * H
      const shift = Math.min(0, wipe + 10 - (vh() + WIPE_PAD))
      wipeBox.style.transform = `translate3d(0, ${shift}px, 0)`
      sky.style.transform = `translate3d(0, ${-shift}px, 0)`
      if (wipe < vh() * 0.9) enter()
    }
    place()
    window.addEventListener('resize', place)

    const tl = gsap.timeline({ paused: true, onComplete: finish })
    tl.to(state, { p: 1, duration: 3.4, ease: 'power1.inOut', onUpdate: place })
    if (import.meta.env.DEV) window.__piTl = tl // dev only: scrub the flight from the console
    // the flight starts once the plane's picture is in memory (or after 3 s regardless), so it never flies in half-drawn
    const img = plane.querySelector('img')
    const hold = import.meta.env.DEV && new URLSearchParams(location.search).has('pihold') // dev only: wait to be scrubbed
    const go = () => { if (!hold) tl.play() }
    const startT = window.setTimeout(go, 3000)
    ;(img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => {
      window.clearTimeout(startT)
      gsap.delayedCall(0.5, go)
    })

    const skip = () => { if (!finished) tl.timeScale(4) }
    const onKey = (e) => { if (['Enter', ' ', 'ArrowDown', 'PageDown', 'Escape'].includes(e.key)) skip() }
    const onWheel = (e) => { if (e.cancelable) e.preventDefault(); if (e.deltaY > 4) skip() }
    el.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.clearTimeout(startT)
      tl.kill()
      el.removeEventListener('pointerdown', skip)
      window.removeEventListener('resize', place)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  return (
    <div className="plane-intro" ref={root} role="presentation">
      <div className="pi-wipe">
        <div className="pi-sky">
          <div className="pi-stars" aria-hidden="true" />
          <p className="pi-skip">tap to skip</p>
        </div>
      </div>

      <div className="pi-plane" aria-hidden="true">
        {ENGINES.map((x) => (
          <span key={x} className="pi-contrail" style={{ left: `${x * 100}%`, top: `${ENGINE_TAIL * 100}%` }} />
        ))}
        <img className="pi-img" src="/intro/plane-top.webp" alt="" draggable="false" fetchPriority="high" />
      </div>
    </div>
  )
}
