import { useLayoutEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/gsap'
import { fireCrackers } from '../lib/crackers'
import { wedding } from '../data/wedding'
import { guestName } from '../lib/guest'
import './PlaneIntro.css'

const [year, month, day] = wedding.date.slice(0, 10).split('-')
const DATE_LINE = `${day} · ${month} · ${year} · ${wedding.city.split(',')[0]}`

// ---- the artwork (three transparent cut-outs in /public/intro) ------------------------------------------------
//  plane-gear.webp  – airliner side-on, landing gear down: waits on the runway and rolls
//  runway.webp      – night runway with lights and markings; tiles sideways so it can stream past
// Fractions below are measured on those images.
const GROUND = { w: 2000, h: 667, gearX: 0.515, gearY: 0.922, midX: 0.5, midY: 0.585 } // gear = main wheel contact, mid = fuselage middle
const TAIL = { x: 0.04, y: 0.56 } // rear end of the fuselage, where the contrail starts
const RUNWAY_ASPECT = 2000 / 667
const WHEEL_ROW = 0.86 // the row of the runway image on which the wheels stand
const CLIMB_ANGLE = Math.tan((20 * Math.PI) / 180) // the climb-out path

// A night flight: the plane waits on a runway until the guest taps "Take off". It rolls, rotates, lifts and climbs
// away, leaving a contrail; as it goes the celebration begins (crackers, invitation revealed).
export default function PlaneIntro({ onEnter, onDone, onTakeoff }) {
  const root = useRef(null)
  const cbs = useRef({ onEnter, onDone, onTakeoff })
  useLayoutEffect(() => { cbs.current = { onEnter, onDone, onTakeoff } })
  const { bride, groom } = wedding

  useLayoutEffect(() => {
    const el = root.current
    const q = (s) => el.querySelector(s)
    const imgG = q('.pi-img--ground')
    const trail = q('.pi-trail line')
    const trail2 = q('.pi-trail line + line')
    const trailG = q('.pi-trail g')
    const ground = q('.pi-ground')
    const runway = q('.pi-runway')
    const shade = q('.pi-shade')
    const head = q('.pi-heading')
    const cta = q('.pi-cta')
    const reduced = prefersReducedMotion()
    let finished = false
    let started = false
    let tookOff = false
    let tl = null
    const ctx = gsap.context(() => {})

    const finish = () => {
      if (finished) return
      finished = true
      cbs.current.onDone?.()
    }
    const reveal = () => {
      if (started) return
      started = true
      fireCrackers()
      cbs.current.onEnter?.()
      gsap.to(el, { opacity: 0, duration: reduced ? 0.4 : 1.8, ease: 'power1.inOut', onComplete: finish })
    }

    if (reduced) {
      gsap.set([q('.pi-plane'), ground, head], { autoAlpha: 0 })
      const t = window.setTimeout(reveal, 900)
      return () => window.clearTimeout(t)
    }

    // ---- geometry ----------------------------------------------------------------------------------------------
    const vw = () => window.innerWidth
    const vh = () => window.innerHeight
    const small = () => vw() < 700
    const groundY = () => vh() - (small() ? 36 : 46) // wheel line sits just above the bottom edge: only the top of the runway shows, the rest is sky
    const rw = () => Math.max(vw() * 1.5, 1800) // width of one runway tile
    const rh = () => rw() / RUNWAY_ASPECT
    const planeW = () => (small() ? vw() * 0.98 : Math.min(Math.max(vw() * 0.7, 340), 1100, groundY() * 1.2)) // phone: nearly full width // width of the parked plane's image
    const dims = () => {
      const wg = planeW()
      return { wg, hg: (wg * GROUND.h) / GROUND.w }
    }
    const parkX = () => (small() ? vw() * 0.5 + (GROUND.gearX - 0.5) * planeW() : vw() * 0.38) // phone: plane centred // where the main wheels stand
    // fuselage midpoint of the parked plane: the point everything else is measured from
    const mid0 = () => {
      const { wg, hg } = dims()
      return { x: parkX() + (GROUND.midX - GROUND.gearX) * wg, y: groundY() + (GROUND.midY - GROUND.gearY) * hg }
    }
    const climb = () => {
      const dx = vw() * 0.95 + planeW() * 0.4
      return { dx, dy: dx * CLIMB_ANGLE }
    }

    // u: progress along the climb-out; h: height gained at lift-off; k: zoom toward us; rot: pitch of the rolling plane
    // d: runway distance rolled; gd: ground falling away
    const state = { u: 0, h: 0, k: 1, rot: 0, d: 0, gd: 0, ui: 1 }
    let trailFrom = null

    // put an image so that its local point (lx, ly) lands on screen (ax, ay), then zoom and pitch about that point
    const pin = (img, ax, ay, lx, ly, k, rot) => {
      const r = (rot * Math.PI) / 180
      const c = Math.cos(r)
      const s = Math.sin(r)
      img.style.transform = `translate3d(${ax - k * (c * lx - s * ly)}px, ${ay - k * (s * lx + c * ly)}px, 0) rotate(${rot}deg) scale(${k})`
    }

    const layout = () => {
      const { wg } = dims()
      imgG.style.width = `${wg}px`
      // phone: the button sits centred just above the parked plane instead of on the road
      el.style.setProperty('--cta-b', `${vh() - groundY() + 0.9 * dims().hg + 22}px`)
      ground.style.setProperty('--gy', `${groundY() - WHEEL_ROW * rh()}px`)
      runway.style.height = `${rh()}px`
      runway.style.backgroundSize = `${rw()}px ${rh()}px`
      shade.style.cssText = `left:${parkX() - wg * 0.5}px;width:${wg}px;top:${WHEEL_ROW * rh() - 12}px`
    }

    const place = () => {
      const { u, h, k, rot, d, gd } = state
      const { wg, hg } = dims()
      const m = mid0()
      const { dx, dy } = climb()
      const px = m.x + u * dx
      const py = m.y - u * dy - h
      // the plane pitches about its main wheels
      const ax = px + k * (GROUND.gearX - GROUND.midX) * wg
      const ay = py + k * (GROUND.gearY - GROUND.midY) * hg
      pin(imgG, ax, ay, GROUND.gearX * wg, GROUND.gearY * hg, k, rot)
      // runway streams past; the whole ground drops away once we are up
      runway.style.backgroundPositionX = `${-d}px`
      ground.style.transform = `translate3d(0, ${gd * vh() * 0.6}px, 0)`
      ground.style.opacity = String(Math.max(0, 1 - gd * gd * 1.1))
      shade.style.opacity = String(Math.max(0, 1 - h / (vh() * 0.05)))
      head.style.opacity = String(state.ui)
      // contrail: from where the tail first left the ground to the tail now
      const r = (rot * Math.PI) / 180
      const vx = (TAIL.x - GROUND.gearX) * wg * k
      const vy = (TAIL.y - GROUND.gearY) * hg * k
      const tx = ax + Math.cos(r) * vx - Math.sin(r) * vy
      const ty = ay + Math.sin(r) * vx + Math.cos(r) * vy
      if (h > vh() * 0.02 && !trailFrom) trailFrom = { x: tx, y: ty }
      if (trailFrom) {
        for (const [ln, off] of [[trail, 0], [trail2, wg * 0.02]]) {
          ln.setAttribute('x1', trailFrom.x)
          ln.setAttribute('y1', trailFrom.y + off)
          ln.setAttribute('x2', tx)
          ln.setAttribute('y2', ty + off)
        }
      }
      trailG.style.opacity = String(Math.min(1, h / (vh() * 0.08)))
    }
    const onResize = () => { layout(); place() }
    layout()
    place()
    window.addEventListener('resize', onResize)
    gsap.ticker.lagSmoothing(0)

    // the plane and runway fade in once their pictures are in memory; the button appears with them
    const decode = (img) => (img.decode ? img.decode().catch(() => {}) : Promise.resolve())
    const runwayImg = new Image()
    runwayImg.src = '/intro/runway.webp'
    Promise.race([
      Promise.all([decode(imgG), decode(runwayImg)]).then(() => null),
      new Promise((r) => window.setTimeout(r, 4000)),
    ]).then(() => { if (!finished) { layout(); place(); el.classList.add('is-ready') } })

    // ---- the takeoff ---------------------------------------------------------------------------------------------
    const takeoff = () => {
      if (tookOff || finished || !el.classList.contains('is-ready')) return
      tookOff = true
      cbs.current.onTakeoff?.() // the tap: browsers allow audio to start from here
      el.classList.add('is-rolling')
      const dist = rw() * 1.8
      const tLift = 4.5
      tl = gsap.timeline()
      tl.to(state, { ui: 0, duration: 0.7, ease: 'power1.out', onUpdate: place }, 0)
        // roll: the runway streams past faster and faster
        .to(state, { d: dist, duration: 4.6, ease: 'power2.in', onUpdate: place }, 0.2)
        .to(state, { d: dist * 2.4, duration: 3.2, ease: 'none', onUpdate: place }, 4.8)
        // rotate: nose comes up
        .to(state, { rot: -6, duration: 1.2, ease: 'power2.inOut', onUpdate: place }, 3.6)
        // lift-off: the wheels leave the ground, the nose keeps rising and the ground falls away
        .to(state, { h: vh() * 0.1, duration: 1.5, ease: 'power1.out', onUpdate: place }, tLift)
        .to(state, { rot: -17, duration: 2.2, ease: 'power1.inOut', onUpdate: place }, tLift + 0.3)
        .to(state, { gd: 1, duration: 2.6, ease: 'power2.in', onUpdate: place }, tLift + 0.5)
        // climb out toward the top-right, growing as it passes the camera
        .to(state, { u: 1, duration: 4.2, ease: 'power2.in', onUpdate: place }, tLift + 0.3)
        .to(state, { k: 1.7, duration: 4.2, ease: 'power1.in', onUpdate: place }, tLift + 0.3)
        .add(reveal, tLift + 3.5)
      ctx.add(() => tl)
      if (import.meta.env.DEV) window.__piTl = tl // dev only: scrub the whole takeoff from the console
    }
    if (import.meta.env.DEV) window.__piTakeoff = takeoff

    const skip = () => { if (tl && !finished) tl.timeScale(5) }
    cta.addEventListener('click', takeoff)
    const onKey = (e) => {
      if (['Enter', ' ', 'ArrowDown', 'PageDown', 'Escape'].includes(e.key)) (tookOff ? skip : takeoff)()
    }
    const onWheel = (e) => { if (e.cancelable) e.preventDefault(); if (e.deltaY > 4) (tookOff ? skip : takeoff)() }
    const onPointer = (e) => { if (tookOff && !e.target.closest('.pi-cta')) skip() }
    el.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      tl?.kill()
      gsap.ticker.lagSmoothing(500, 33)
      gsap.killTweensOf(el)
      cta.removeEventListener('click', takeoff)
      el.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  return (
    <div className="plane-intro" ref={root} role="presentation">
      <div className="pi-stars" aria-hidden="true" />
      <div className="pi-heading">
        <p className="pi-dear"><span className="gurmukhi">ਪਿਆਰੇ</span> <b>{guestName()}</b>,</p>
        <p className="pi-pa gurmukhi">{wedding.familiesGurmukhi} ਵੱਲੋਂ ਨਿੱਘਾ ਸੱਦਾ</p>
        <p className="pi-pa pi-pa--flight gurmukhi">ਆਓ, ਜ਼ਿੰਦਗੀ ਦੇ ਸਭ ਤੋਂ ਖ਼ੂਬਸੂਰਤ ਸਫ਼ਰ ਦੀ ਉਡਾਣ ਭਰੀਏ</p>
        <p className="pi-kicker">Boarding now · the journey of a lifetime with</p>
        <p className="pi-names">{bride.name}<span>&amp;</span>{groom.name}</p>
        <p className="pi-date">{DATE_LINE}</p>
      </div>

      {/* the runway photograph streams sideways under the parked plane */}
      <div className="pi-ground" aria-hidden="true">
        <div className="pi-runway" style={{ backgroundImage: 'url(/intro/runway.webp)' }} />
        <div className="pi-fill" />
        <div className="pi-shade" />
      </div>

      <svg className="pi-trail" aria-hidden="true">
        <defs>
          <linearGradient id="pi-trail-fade" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0" stopColor="#dfe8ff" stopOpacity="0" />
            <stop offset=".55" stopColor="#dfe8ff" stopOpacity=".2" />
            <stop offset="1" stopColor="#ffffff" stopOpacity=".6" />
          </linearGradient>
          <filter id="pi-soft" x="-5%" y="-300%" width="110%" height="700%"><feGaussianBlur stdDeviation="1.6" /></filter>
        </defs>
        <g filter="url(#pi-soft)" stroke="url(#pi-trail-fade)" strokeLinecap="round">
          <line strokeWidth="3.2" />
          <line strokeWidth="2.2" />
        </g>
      </svg>

      <div className="pi-plane" aria-hidden="true">
        <img className="pi-img pi-img--ground" src="/intro/plane-gear.webp" alt="" draggable="false" />
      </div>

      <div className="pi-cta">
        <button type="button" className="pi-takeoff">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M2.5 19h19v2h-19zM22 9.7c-.3-1-1.3-1.6-2.4-1.3l-5.6 1.5-6.4-6.1-1.9.5 4.1 7.1-4.9 1.3-1.9-1.5-1.4.4 2.3 4 .4.7 6.6-1.7 13-3.5c1-.3 1.6-1.4 1.3-2.4z" fill="currentColor" /></svg>
          Take off
        </button>
        <p className="pi-hint">Tap to begin the journey</p>
      </div>
      <p className="pi-skip">tap to skip</p>
    </div>
  )
}
