import { useEffect, useLayoutEffect, useRef } from 'react'
import HaveliDefs from './HaveliDefs'
import DoorLeaf from './DoorLeaf'
import Casing from './Casing'
import Beyond from './Beyond'
import DoorToran from './DoorToran'
import FairyLights from './FairyLights'
import Rangoli from './Rangoli'
import Diya from './Diya'
import { wedding } from '../../data/wedding'
import { gsap, prefersReducedMotion } from '../../lib/gsap'
import './HaveliGate.css'

const ANG = 76 // each leaf fully open, swung into the courtyard
const HOVER_OPEN = 0.1 // hovering cracks the doors open
const ENTER_KEYS = ['ArrowDown', 'PageDown', ' ', 'Enter']

// Read the calendar date straight off the ISO string so no timezone can shift the day
const [year, month, day] = wedding.date.slice(0, 10).split('-')
const DATE_LINE = `${day} · ${month} · ${year} · ${wedding.city.split(',')[0]}`
const KICKER = `${wedding.families.charAt(0).toUpperCase()}${wedding.families.slice(1)} welcome you`

// Frame-stepped spring, ported from the portfolio's Rooms: one fixed step per
// frame, and it parks itself once it has settled
function spring(tension, friction, render) {
  let x = 0
  let v = 0
  let target = 0
  let raf = 0
  const step = () => {
    const dt = 1 / 60
    const a = tension * (target - x) - friction * v
    v += a * dt
    x += v * dt
    render(x)
    if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001) {
      x = target
      v = 0
      render(x)
      raf = 0
      return
    }
    raf = requestAnimationFrame(step)
  }
  render(0)
  return {
    set(t) {
      target = t
      if (!raf) raf = requestAnimationFrame(step)
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
  }
}

// `onEnter` and `onDone` both fire once the guest has walked through (the hero
// starts under the same golden bloom, so the gate can unmount at once).
// With reduced motion, `onEnter` fires straight away and `onDone` after a fade.
export default function HaveliGate({ onEnter, onDone }) {
  const rootRef = useRef(null)
  const cbs = useRef({ onEnter, onDone })
  const { bride, groom } = wedding

  // the latest callbacks, without re-running the door setup when they change
  useLayoutEffect(() => {
    cbs.current = { onEnter, onDone }
  })

  // a layout effect, so the arrival's from() states land before the first paint
  useLayoutEffect(() => {
    const root = rootRef.current
    const $ = (sel) => root.querySelector(sel)
    const q = gsap.utils.selector(root)
    const gateway = $('.gateway')
    const opening = $('.opening')
    const leafL = $('.leaf-l')
    const leafR = $('.leaf-r')
    const badge = $('.door-cursor')
    // the wall and everything on it scale together, so walking in feels like one space
    const planes = [$('.haveli-wall'), $('.haveli-scene')]
    const reduced = prefersReducedMotion()
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const timers = []
    const later = (fn, ms) => timers.push(window.setTimeout(fn, ms))
    let busy = false
    let entered = false
    let finished = false
    let intro = null

    const ctx = gsap.context(() => {
      if (reduced) return

      /* ----- arriving at the haveli at night ----- */
      intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
      // the decor comes from sibling files; only animate what is actually there
      const from = (sel, vars, at) => {
        const els = q(sel)
        if (els.length) intro.from(els, vars, at)
      }
      from('.haveli-wall', { autoAlpha: 0, duration: 1.1, ease: 'power1.out' }, 0)
      from('.fairy-lights', { y: -30, autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 0.2)
      // the wrapper rises, not .gateway itself, whose transform carries the 3D tilt
      from('.haveli-fit', { y: 60, autoAlpha: 0, duration: 1.4 }, 0.35)
      from('.haveli-glow', { autoAlpha: 0, duration: 1.6, ease: 'sine.inOut', stagger: 0.2 }, 0.75)
      from('.door-toran .swag', { y: -24, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.08 }, 1)
      from('.door-toran .ladi', {
        y: -24,
        autoAlpha: 0,
        duration: 0.8,
        ease: 'back.out(2)',
        stagger: { amount: 0.5, from: 'center' },
      }, 1.1)
      // --rs feeds the CSS `scale`, which leaves the rangoli's floor perspective alone
      from('.rangoli', { '--rs': 0.5, autoAlpha: 0, duration: 1.3, ease: 'expo.out' }, 1.15)
      from('.haveli-diya', {
        scale: 0,
        autoAlpha: 0,
        transformOrigin: '50% 100%',
        duration: 0.7,
        ease: 'back.out(2.4)',
        stagger: 0.12,
      }, 1.35)
      from('.haveli-heading > *', { y: 16, autoAlpha: 0, duration: 0.9, stagger: 0.14 }, 1.25)
      from('.haveli-hint', { y: 8, autoAlpha: 0, duration: 0.8 }, 2)

      /* ----- the evening breeze and the lamps ----- */
      const ladis = q('.door-toran .ladi')
      if (ladis.length) {
        gsap.to(ladis, {
          rotation: 'random(-2.5, 2.5)',
          transformOrigin: '50% 0%',
          duration: 'random(2.2, 3.6)',
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          repeatRefresh: true,
        })
      }
      // on the inner <i>, so the flicker never fights the fade-in on the glow itself
      gsap.to(q('.haveli-glow > i'), {
        opacity: 'random(0.72, 1)',
        scale: 'random(0.96, 1.04)',
        duration: 'random(0.12, 0.45)',
        ease: 'sine.inOut',
        repeat: -1,
        repeatRefresh: true,
      })
    }, root)

    const door = reduced
      ? null
      : spring(120, 14, (o) => {
          const open = Math.max(0, o) // the frame's door stop: the leaves never swing out at the guest
          leafL.style.transform = `rotateY(${open * ANG}deg)`
          leafR.style.transform = `rotateY(${-open * ANG}deg)`
          gateway.style.setProperty('--o', open.toFixed(4))
        })

    /* ----- "Open the doors" badge that replaces the cursor over the doorway ----- */
    let over = false
    const place = (e) => {
      badge.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
    }
    const showBadge = (on) => {
      over = on
      badge.classList.toggle('is-on', on)
    }
    const onMove = (e) => {
      if (over) place(e)
    }

    /* ----- hovering (or tabbing to) the doorway cracks the doors open ----- */
    const onPointerEnter = (e) => {
      if (!canHover || e.pointerType === 'touch') return
      place(e)
      if (busy) return
      showBadge(true)
      door?.set(HOVER_OPEN)
    }
    const onPointerLeave = () => {
      showBadge(false)
      if (!busy) door?.set(0)
    }
    const onFocus = () => {
      if (!busy && gateway.matches(':focus-visible')) door?.set(HOVER_OPEN)
    }
    const onBlur = () => {
      if (!busy && !over) door?.set(0)
    }

    const finish = () => {
      if (finished) return
      finished = true
      if (!entered) {
        entered = true
        cbs.current.onEnter?.()
      }
      cbs.current.onDone?.()
    }

    /* ----- knocking: the kundi rings swing, the doors open, and the guest walks in ----- */
    function enter() {
      if (busy) return
      busy = true
      showBadge(false)
      root.classList.add('is-entering')

      if (reduced) {
        entered = true
        cbs.current.onEnter?.()
        ctx.add(() => gsap.to(root, { autoAlpha: 0, duration: 0.5, ease: 'power1.out', onComplete: finish }))
        later(finish, 1500)
        return
      }

      // a guest in a hurry: settle the arrival quickly so the doorway holds still to be walked into
      intro?.timeScale(4)
      gateway.classList.add('is-pressed')
      later(() => gateway.classList.remove('is-pressed'), 380)
      const rings = q('.kundi-ring')
      if (rings.length) {
        ctx.add(() => {
          gsap
            .timeline()
            .to(rings, { rotation: -26, duration: 0.14, ease: 'power2.out', transformOrigin: '50% 0%' })
            .to(rings, { rotation: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)' })
        })
      }
      later(() => door.set(1), 260)
      later(walk, 900)
    }

    // Walking through: the haveli scales up around the gap between the open
    // leaves until it fills the screen, then the golden bloom takes over
    function walk() {
      const r = opening.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) return finish()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const cx = r.left + r.width / 2
      const cy = r.top + r.height * 0.6
      const tx = vw / 2 - cx
      const ty = vh / 2 - cy
      // the open leaves leave roughly the middle 62% of the opening clear
      const sEnd = Math.max(vw / (0.62 * r.width), vh / (0.6 * r.height)) * 1.15
      planes.forEach((p) => {
        const pr = p.getBoundingClientRect()
        p.style.transformOrigin = `${cx - pr.left}px ${cy - pr.top}px`
      })
      root.classList.add('is-walking')
      const walker = { e: 0 }
      ctx.add(() => {
        gsap.to(q('.haveli-heading, .haveli-hint'), {
          autoAlpha: 0,
          duration: 0.45,
          ease: 'power1.out',
          overwrite: 'auto',
        })
        gsap.to(walker, {
          e: 1,
          duration: 1.7,
          ease: 'power2.inOut',
          onUpdate: () => {
            const sc = Math.exp(Math.log(sEnd) * walker.e) // exponential, for an even speed of approach
            const f = Math.min(1, walker.e * 1.6) // drift the doorway to the centre early on
            const t = `translate3d(${tx * f}px, ${ty * f}px, 0) scale(${sc})`
            planes.forEach((p) => {
              p.style.transform = t
            })
          },
          onComplete: finish,
        })
        gsap.to(q('.haveli-flash'), { opacity: 1, duration: 0.6, ease: 'power1.in', delay: 1.1 })
      })
      later(finish, 3500) // never strand a guest at the door, even if frames stop coming
    }

    /* ----- trying to scroll past the gate opens it instead ----- */
    const onWheel = (e) => {
      if (finished || e.ctrlKey) return // ctrl + wheel is pinch-zoom
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return // sideways swipes stay the browser's
      if (e.cancelable) e.preventDefault() // the page behind holds still while the gate is up
      if (e.deltaY > 4) enter()
    }
    let touchY = null
    const onTouchStart = (e) => {
      touchY = e.touches.length === 1 ? e.touches[0].clientY : null
    }
    const onTouchMove = (e) => {
      if (finished || touchY === null || e.touches.length !== 1) return
      if (e.cancelable) e.preventDefault()
      if (touchY - e.touches[0].clientY > 40) {
        touchY = null
        enter()
      }
    }
    const onKey = (e) => {
      if (finished || e.altKey || e.ctrlKey || e.metaKey || !ENTER_KEYS.includes(e.key)) return
      // a focused control keeps its own keys; the gateway handles Enter and Space as a button
      const el = document.activeElement
      if (el && el !== document.body && el !== document.documentElement) return
      e.preventDefault()
      enter()
    }

    gateway.addEventListener('pointerenter', onPointerEnter)
    gateway.addEventListener('pointerleave', onPointerLeave)
    gateway.addEventListener('focus', onFocus)
    gateway.addEventListener('blur', onBlur)
    gateway.addEventListener('click', enter)
    // the doors open by themselves once the haveli has settled; a click, scroll or key just opens them sooner
    later(enter, ((intro ? intro.duration() : 0) + 0.9) * 1000)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKey)

    return () => {
      timers.forEach(window.clearTimeout)
      door?.stop()
      gateway.removeEventListener('pointerenter', onPointerEnter)
      gateway.removeEventListener('pointerleave', onPointerLeave)
      gateway.removeEventListener('focus', onFocus)
      gateway.removeEventListener('blur', onBlur)
      gateway.removeEventListener('click', enter)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKey)
      ctx.revert()
      // undo what was written by hand, so StrictMode's second mount starts clean
      planes.forEach((p) => {
        p.style.transform = ''
        p.style.transformOrigin = ''
      })
      root.classList.remove('is-entering', 'is-walking')
      gateway.classList.remove('is-pressed')
      badge.classList.remove('is-on')
    }
  }, [])

  // Depth: the doorway tilts towards the pointer and the layers drift at different rates
  useEffect(() => {
    const root = rootRef.current
    if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const gateway = root.querySelector('.gateway')
    const onMove = (e) => {
      if (root.classList.contains('is-entering') || root.classList.contains('is-walking')) return
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      gateway.style.setProperty('--ry', `${(x * 16).toFixed(2)}deg`)
      gateway.style.setProperty('--rx', `${(-y * 9).toFixed(2)}deg`)
      root.style.setProperty('--px', x.toFixed(3))
      root.style.setProperty('--py', y.toFixed(3))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div ref={rootRef} className="haveli">
      <HaveliDefs />

      <div className="haveli-wall" aria-hidden="true">
        <FairyLights />
      </div>

      <div className="haveli-scene">
        <div className="haveli-stage">
          <header className="haveli-heading">
            <p className="haveli-kicker">{KICKER}</p>
            <p className="haveli-names">
              {bride.name} <span className="haveli-amp">&amp;</span> {groom.name}
            </p>
            <p className="haveli-date">{DATE_LINE}</p>
          </header>

          {/* takes the height left between heading and hint; the doorway sizes itself to fit it */}
          <div className="haveli-fit">
            <div className="haveli-unit">
              <span className="haveli-glow is-left" aria-hidden="true">
                <i />
              </span>
              <span className="haveli-glow is-right" aria-hidden="true">
                <i />
              </span>
              <span className="haveli-glow is-top" aria-hidden="true">
                <i />
              </span>

              <button type="button" className="gateway" aria-label="Open the doors to enter the invitation">
                <span className="opening">
                  <Beyond />
                  <span className="leaf leaf-l">
                    <DoorLeaf side="l" />
                  </span>
                  <span className="leaf leaf-r">
                    <DoorLeaf side="r" />
                  </span>
                  <span className="seam" />
                  <span className="sill" />
                </span>
                <Casing />
                <DoorToran />
              </button>

              <Rangoli />
              <Diya className="haveli-diya is-left" />
              <Diya className="haveli-diya is-right" />
            </div>
          </div>

          <p className="haveli-hint">
            <span className="haveli-hint-dot" aria-hidden="true" />
            <span className="is-touch">The doors are opening for you</span>
            <span className="is-mouse">The doors are opening for you</span>
          </p>
        </div>
      </div>

      <div className="haveli-flash" aria-hidden="true" />

      <div className="door-cursor" aria-hidden="true">
        <span>Open the doors</span>
        <span className="door-cursor-pa" lang="pa">
          ਜੀ ਆਇਆਂ ਨੂੰ
        </span>
      </div>
    </div>
  )
}
