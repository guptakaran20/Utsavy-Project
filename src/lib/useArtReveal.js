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
    }
    check()
    const id = setInterval(check, 250)
    return () => { clearInterval(id); io?.disconnect() }
  }, [])
}
