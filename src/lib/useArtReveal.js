import { useEffect } from 'react'
import { heroArtReady } from './heroArt'

// The painted header and footer pieces (garlands, toran, rangoli, scenes) carry data-art="drop" | "rise" | "fade".
// Each one is marked .is-in the first time part of it is on screen, and its entrance plays in CSS (index.css).
// A light poll (a handful of elements, four times a second) rather than an IntersectionObserver: the page is moved by
// the smooth-scroll and by pinned sections, and a poll of the real on-screen position catches every case; pieces that
// mount later (behind the intro, or lazily) are picked up as they appear.
//
// Phones: Safari only starts a loading="lazy" image when it is nearly on screen, so the entrance used to play over an
// empty box and the painting popped in a second later. So the same poll also
//   - starts every lazy image within a few screens below (or above) the view early, and
//   - holds a piece's entrance until its painting has downloaded and been decoded, so it always plays with the art.
// The endless idle loops (swaying, flickering, floating) are paused while off screen (.is-offscreen, index.css), so a
// phone only animates what the guest can actually see.
//
// Low-end phones also run out of graphics memory: every element with a running (or even paused) transform/opacity
// loop, or a will-change hint, is kept on its own GPU layer, and everything painted above it gets a layer too. Left
// alone the page piled up ~150 layers by the RSVP. So
//   - every endless CSS loop on the page is found (document.getAnimations) and switched right off, not just paused,
//     while it is off screen (.idle-loop.is-offscreen, index.css): that frees its layer, and
//   - each section more than a screen away is marked .is-far, which drops the will-change hints inside it.

const AHEAD = 3 // screens of lookahead for lazy images
const IDLE = '.art-sway, .art-drift, .art-flame, .art-sun, .art-float, .art-beat, .art-swing, .art-petals'

const imgsOf = (el) => (el.tagName === 'IMG' ? [el] : [...el.querySelectorAll('img')])

export function useArtReveal() {
  useEffect(() => {
    const waiting = new WeakSet()
    const watched = new WeakSet()

    const reveal = (el) => {
      if (waiting.has(el)) return
      waiting.add(el)
      const imgs = imgsOf(el)
      imgs.forEach((img) => { if (img.loading === 'lazy') img.loading = 'eager' })
      // wait for every painting inside to arrive and decode (a broken image still lets it through)
      Promise.all(imgs.map((img) => (img.decode ? img.decode() : Promise.resolve()).catch(() => {})))
        .then(() => requestAnimationFrame(() => el.classList.add('is-in')))
    }

    // idle loops run only while on screen (generous margin, so they are already moving as they come into view)
    const io = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting))
      }, { rootMargin: '25% 0px' })
      : null

    // the same switch for every other endless CSS loop on the page (petals, glows, the pot, the polaroids...).
    // Only loops that are an element's sole animation, so switching it off can never undo a finished entrance.
    const looped = new WeakSet()
    const findLoops = () => {
      if (!io || !document.getAnimations) return
      const byTarget = new Map()
      for (const a of document.getAnimations()) {
        if (typeof CSSAnimation === 'undefined' || !(a instanceof CSSAnimation)) continue
        const fx = a.effect
        const el = fx?.target
        if (!el) continue
        const key = el
        const slot = byTarget.get(key) || { el, own: [], before: [], after: [] }
        const list = fx.pseudoElement === '::before' ? slot.before : fx.pseudoElement === '::after' ? slot.after : fx.pseudoElement ? null : slot.own
        if (!list) continue
        list.push(fx.getTiming().iterations === Infinity)
        byTarget.set(key, slot)
      }
      byTarget.forEach(({ el, own, before, after }) => {
        if (looped.has(el)) return
        const add = []
        if (own.length && own.every(Boolean)) add.push('idle-loop')
        if (before.length && before.every(Boolean)) add.push('idle-before')
        if (after.length && after.every(Boolean)) add.push('idle-after')
        if (!add.length) return
        looped.add(el)
        el.classList.add(...add)
        if (!watched.has(el)) { watched.add(el); io.observe(el) }
      })
    }

    // sections well away from the view drop their will-change hints (index.css .is-far), so their layers are freed
    const far = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.classList.toggle('is-far', !e.isIntersecting))
      }, { rootMargin: '120% 0px' })
      : null
    const farWatched = new WeakSet()

    // Background fill: once the page itself has loaded (intro and hero first), every other lazy picture is fetched in
    // page order, two at a time, so pieces animated by their own sections (GSAP timelines, .reveal, Events) are already
    // on the phone when the guest reaches them, not only the ones near the view.
    let filling = false
    const queued = new Set()
    const startFill = () => setTimeout(() => { filling = true }, 1500)
    if (document.readyState === 'complete') startFill()
    else window.addEventListener('load', startFill, { once: true })
    const fill = () => {
      let busy = 0
      queued.forEach((img) => { if (img.complete || !img.isConnected) queued.delete(img); else busy++ })
      if (busy >= 2) return
      for (const img of document.querySelectorAll('img[loading="lazy"]')) {
        img.loading = 'eager'
        queued.add(img)
        if (++busy >= 2) break
      }
    }

    const check = () => {
      // nothing below the hero starts (or plays its entrance over an empty frame) before the hero's painting is in
      if (!heroArtReady()) return
      const h = window.innerHeight
      document.querySelectorAll('[data-art]:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.height > 0 && r.top < h * 0.92 && r.bottom > h * 0.08) reveal(el)
      })
      document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
        const r = img.getBoundingClientRect()
        if ((r.width > 0 || r.height > 0) && r.top < h * AHEAD && r.bottom > -h) img.loading = 'eager'
      })
      if (filling) fill()
      if (io) {
        document.querySelectorAll(IDLE).forEach((el) => {
          if (watched.has(el)) return
          watched.add(el)
          io.observe(el)
        })
      }
      if (far) {
        document.querySelectorAll('main section, .thanks').forEach((el) => {
          if (farWatched.has(el)) return
          farWatched.add(el)
          far.observe(el)
        })
      }
      // new loops start as sections open; a scan once a second is plenty
      if (++ticks % 4 === 0) findLoops()
    }
    let ticks = 3
    check()
    const id = setInterval(check, 250)
    return () => { clearInterval(id); io?.disconnect(); far?.disconnect() }
  }, [])
}
