import { gsap, ScrollTrigger } from './gsap'

export const absTop = (el) => el.getBoundingClientRect().top + window.scrollY

// A section that holds the page still while it animates in (like the Punjab clock): when `trigger` reaches
// `start`, scrolling is locked and the paused timeline plays. The "camera" is part of the same timeline,
// so `glide(to, vars, position)` moves the page in step with the animation, with no stop-start between the
// page moving and things drawing. Scrolling comes back when the timeline ends, or after `safety` seconds
// whatever happens. Leave `trigger` out to start it yourself with `play()` (e.g. on a tap).
// Call inside a reduced-motion check; returns { tl, glide, cam, prime, play, cleanup }; call prime() once built.
export function lockedTimeline(lenis, { trigger, start = 'top 70%', safety = 12, onDone }) {
  const html = document.documentElement
  const cam = { y: 0 }
  const move = () => {
    const l = lenis.current
    if (l) l.scrollTo(cam.y, { immediate: true, force: true })
    else window.scrollTo(0, cam.y)
  }
  let timer
  const release = () => {
    timer?.kill()
    lenis.current?.start()
    html.classList.remove('is-locked')
  }

  const tl = gsap.timeline({ paused: true })
  tl.eventCallback('onComplete', () => { release(); onDone?.() })

  // `to` is a number or a function (read when that glide starts, so it sees the final layout)
  const glide = (to, vars, position) => tl.to(cam, { y: to, ease: 'power2.inOut', ...vars, onUpdate: move }, position)

  const open = () => {
    if (tl.progress() > 0 || tl.isActive()) return
    html.classList.add('is-locked')
    lenis.current?.stop()
    cam.y = lenis.current?.scroll ?? window.scrollY
    tl.play()
    timer = gsap.delayedCall(safety, release)
  }
  const st = trigger && ScrollTrigger.create({ trigger, start, once: true, onEnter: open })

  // GSAP doesn't draw a from()'s starting state while its timeline sits paused, so without this the section
  // shows fully drawn as it scrolls in, then blanks out and fades back once the lock starts. Call it once the
  // timeline is built: every step is run to its end and back (silently), which leaves each one at its start.
  // The camera's glides are left alone: their targets are read when they play, from the final layout.
  const prime = () => {
    tl.getChildren(true, true, false).forEach((t) => {
      if (!t.targets().includes(cam)) t.progress(1, true).progress(0, true)
    })
  }

  return { tl, glide, cam, prime, play: open, cleanup: () => { st?.kill(); release() } }
}
