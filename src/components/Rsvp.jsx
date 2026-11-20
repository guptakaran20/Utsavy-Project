import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP } from '../lib/gsap'
import { LenisContext } from '../lib/smoothScroll'
import { absTop, lockedTimeline } from '../lib/lockedTimeline'
import { guestName, hasGuestName } from '../lib/guest'
import { wedding } from '../data/wedding'
import { downloadIcs } from '../lib/calendar'
import { invitationText } from '../lib/invite'
import { dhol } from '../lib/dhol'
import { CalendarIcon, PinIcon } from './Icons'
import SectionTitle from './SectionTitle'
import Mandala from './Mandala'
import FloralSides from './FloralSides'
import './TornPaper.css'
import './Rsvp.css'

const ease = [0.22, 1, 0.36, 1]

// where the lamps are in rsvp-stage.webp (px of the 1491×1055 image): the tulip lamps behind the couple,
// then the three lanterns; on Accept they light up from left to right
const LAMPS = [
  [258, 350], [290, 405], [338, 515], [370, 460], [365, 545], [440, 415], [490, 460], [545, 520], [580, 500], [575, 560],
  [690, 460], [735, 425], [735, 510], [790, 555], [800, 355], [800, 455], [845, 400], [920, 480], [955, 450], [1000, 420],
  [1065, 565], [1080, 345], [1100, 455], [1135, 400], [1215, 455], [1255, 425],
  [110, 680], [1370, 680], [1450, 740],
].map(([x, y]) => ({ left: `${(x / 14.91).toFixed(2)}%`, top: `${(y / 10.55).toFixed(2)}%` })).sort((a, b) => parseFloat(a.left) - parseFloat(b.left))

// the scalloped rim of a wax seal: 18 soft bumps round a circle
const SEAL_EDGE = (() => {
  const n = 18
  const pts = []
  for (let i = 0; i <= n * 4; i++) {
    const a = (i / (n * 4)) * Math.PI * 2
    const r = 44 + 3.2 * Math.cos(a * n)
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join(' L')}Z`
})()

const PETAL_COLOURS = ['#f4a7b9', '#f7c4cf', '#e88aa0', '#fbd9df', '#f3b6c2']
// genda (marigold) for the bursts, mixed in with the rose
const MARIGOLD = ['#f5a623', '#f7b733', '#e8851a', '#ffcf4a']
const BURST_COLOURS = [...MARIGOLD, ...PETAL_COLOURS]

// the Anand Karaj: the day the guest pass and its calendar button point at
const WED_EVENT = wedding.events.find((e) => e.id === wedding.venue.event) || wedding.events[0]

// The guest is already known from the invitation link, so the reply is a single tap: "yes, we'll be there".
function buildMessage(name) {
  return [`RSVP — ${wedding.bride.name} & ${wedding.groom.name}`, `Name: ${name}`, 'Attending: Yes, joyfully!'].join('\n')
}

const petal = (parent, colour, cls = '') => {
  const p = document.createElement('span')
  p.className = `rsvp__petal ${cls}`
  p.style.background = colour
  parent.appendChild(p)
  return p
}

// rose and marigold petals drifting down over the stage; each removes itself once it has landed
function rainPetals(stage, count = 24) {
  for (let i = 0; i < count; i++) {
    const p = petal(stage, BURST_COLOURS[i % BURST_COLOURS.length])
    p.style.left = `${gsap.utils.random(14, 86)}%`
    const fall = gsap.utils.random(3.2, 4.6)
    gsap.timeline({ delay: gsap.utils.random(0, 2.2), onComplete: () => p.remove() })
      .fromTo(p, { yPercent: 0, y: 0, autoAlpha: 0, rotation: gsap.utils.random(0, 360) }, { autoAlpha: 1, duration: 0.4 })
      .to(p, { y: stage.offsetHeight * gsap.utils.random(0.55, 0.75), rotation: `+=${gsap.utils.random(180, 420)}`, duration: fall, ease: 'sine.in' }, 0)
      .to(p, { x: gsap.utils.random(-30, 30), duration: fall / 3, ease: 'sine.inOut', yoyo: true, repeat: 2 }, 0)
      .to(p, { autoAlpha: 0, duration: 0.6 }, fall - 0.6)
  }
}

// two "phool" cannons: petals shot up and inward from the stage's lower corners, then falling back
function petalCannons(stage, perSide = 20) {
  const W = stage.offsetWidth
  const H = stage.offsetHeight
  ;[-1, 1].forEach((side) => {
    for (let i = 0; i < perSide; i++) {
      const p = petal(stage, BURST_COLOURS[(i + (side > 0 ? 3 : 0)) % BURST_COLOURS.length], 'is-burst')
      p.style.left = side < 0 ? '6%' : '94%'
      p.style.top = '78%'
      const rise = H * gsap.utils.random(0.45, 0.8)
      const reach = -side * W * gsap.utils.random(0.08, 0.36)
      const up = gsap.utils.random(0.55, 0.8)
      const down = gsap.utils.random(1.4, 2.2)
      gsap.timeline({ delay: gsap.utils.random(0, 0.18), onComplete: () => p.remove() })
        .set(p, { autoAlpha: 1, scale: gsap.utils.random(0.7, 1.25), rotation: gsap.utils.random(0, 360) })
        .to(p, { x: reach, duration: up + down, ease: 'power1.out' }, 0)
        .to(p, { y: -rise, duration: up, ease: 'power2.out' }, 0)
        .to(p, { y: -rise * 0.1, duration: down, ease: 'sine.in' }, up)
        .to(p, { rotation: `+=${gsap.utils.random(240, 600) * -side}`, duration: up + down, ease: 'none' }, 0)
        .to(p, { autoAlpha: 0, duration: 0.5 }, up + down - 0.5)
    }
  })
}

// a ring of little hearts bursting out of the Accept button
function heartBurst(host, x, y, count = 12) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('span')
    h.className = 'rsvp__spark-heart'
    h.textContent = '♥'
    h.style.left = `${x}px`
    h.style.top = `${y}px`
    h.style.color = i % 3 ? '#e88aa0' : '#c9a24d'
    host.appendChild(h)
    const a = (i / count) * Math.PI * 2 + gsap.utils.random(-0.2, 0.2)
    const d = gsap.utils.random(56, 96)
    gsap.timeline({ onComplete: () => h.remove() })
      .fromTo(h, { xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 0.3, autoAlpha: 1 },
        { x: Math.cos(a) * d * 1.3, y: Math.sin(a) * d, scale: gsap.utils.random(0.8, 1.2), rotation: gsap.utils.random(-30, 30), duration: 0.7, ease: 'power3.out' })
      .to(h, { y: '+=14', autoAlpha: 0, duration: 0.45, ease: 'power1.in' }, 0.45)
  }
}

// one gold sparkle left behind the flying envelope
function sparkle(host, x, y) {
  const s = document.createElement('span')
  s.className = 'rsvp__sparkle'
  s.style.left = `${x + gsap.utils.random(-10, 10)}px`
  s.style.top = `${y + gsap.utils.random(-6, 6)}px`
  host.appendChild(s)
  gsap.fromTo(s, { scale: gsap.utils.random(0.6, 1.1), autoAlpha: 1, rotation: 0 },
    { scale: 0, autoAlpha: 0, rotation: 90, y: gsap.utils.random(6, 18), duration: gsap.utils.random(0.6, 0.9), ease: 'power1.in', onComplete: () => s.remove() })
}

// one deep dhol "dhamak" as the seal stamps down: synthesised, and only while the dhol music is on
function dholHit() {
  if (!dhol.on) return
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    const ctx = (dholHit.ctx ??= new AC())
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.frequency.setValueAtTime(110, t)
    osc.frequency.exponentialRampToValueAtTime(48, t + 0.32)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.7, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
    osc.connect(g).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.5)
  } catch { /* no audio: the hit is only a garnish */ }
}

export default function Rsvp() {
  const root = useRef(null)

  // The stage and the couple stay hidden until "Joyfully accept" is tapped, then rise at once. Fetch and decode them
  // while the guest is still a couple of screens away, so on a slow phone connection they never come up as empty boxes.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      el.querySelectorAll('.rsvp__stage img').forEach((img) => { img.loading = 'eager'; img.decode?.().catch(() => {}) })
    }, { rootMargin: '200% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const lenis = useContext(LenisContext)
  const [sent, setSent] = useState(false)
  const name = guestName()
  useReveal(root)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        // (the edge flowers stay put: drifting them opened a seam where they meet the notes' flowers above)

        // The page holds still while the reply card opens: it glides to the heading, the arch rises and the
        // guest's name is written in, then it drifts down as the stage and the couple come up beneath the card,
        // and hands scrolling back with the Accept button ready.
        const { tl, glide, cam, prime, cleanup } = lockedTimeline(lenis, { trigger: q('.rsvp__card')[0], start: 'top 75%' })
        const firstStop = () => absTop(q('.section-title')[0]) - 64
        const secondStop = () => {
          const stage = q('.rsvp__stage')[0]
          return Math.max(cam.y, absTop(stage) + stage.offsetHeight - window.innerHeight)
        }

        glide(firstStop, { duration: 1.4 }, 0)
        tl.from(q('.rsvp__card'), { y: 50, scale: 0.94, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.3, ease: 'power3.out' }, 0.4)
          .from(q('.rsvp__head-pa'), { y: 12, autoAlpha: 0, duration: 0.8, ease: 'power2.out' }, 1.0)
          // the name is written in from left to right, like ink
          .fromTo(q('.rsvp__head-title'), { clipPath: 'inset(-20% 100% -20% 0)' }, { clipPath: 'inset(-20% 0% -20% 0)', duration: 1.4, ease: 'power1.inOut' }, 1.25)
          .from(q('.rsvp__rule'), { scaleX: 0, duration: 0.9, ease: 'power2.inOut' }, 2.1)
          .from(q('.rsvp__ask > *'), { y: 14, autoAlpha: 0, duration: 0.9, ease: 'power2.out', stagger: 0.12 }, 2.3)
        glide(secondStop, { duration: 2.4, ease: 'sine.inOut' }, 2.8)
        tl.from(q('.rsvp__stage-img'), { y: 40, autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 3.0)
          // (the couple's wrapper moves, not the image: the image has its own CSS "breathing" loop)
          .fromTo(q('.rsvp__couple'), { xPercent: -50, x: 0, y: 46, autoAlpha: 0 }, { xPercent: -50, x: 0, y: 0, autoAlpha: 1, duration: 1.6, ease: 'power3.out' }, 3.6)
          .from(q('.rsvp__submit'), { y: 18, scale: 0.92, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.5)' }, 4.2)
        prime() // show every piece at its starting point before the section scrolls in

        return cleanup
      })
    },
    { scope: root },
  )

  // The edge flowers carry straight on from the notes page above, with no fade: the tiles here are shifted up
  // so they continue the notes' tiles exactly (same height, same flip), as if one strip ran through both pages.
  useLayoutEffect(() => {
    const notes = document.getElementById('notes')
    const above = notes?.querySelector(':scope > .floral-sides')
    const here = root.current.querySelector(':scope > .floral-sides')
    if (!above || !here) return
    const align = () => {
      const tile = above.querySelector('span')?.offsetHeight
      if (!tile) return
      // where this page starts, measured down the notes' strip (this page tucks under the notes by its margin)
      const join = notes.offsetHeight + parseFloat(getComputedStyle(root.current).marginTop || 0) - above.offsetTop
      // tiles alternate flipped / not, and ours starts flipped, so line up with the nearest flipped (even) tile
      let k = Math.floor(join / tile)
      if (k % 2) k -= 1
      here.style.top = `${k * tile - join}px`
    }
    align()
    const ro = new ResizeObserver(align)
    ro.observe(notes)
    ro.observe(root.current)
    document.fonts?.ready.then(align)
    return () => ro.disconnect()
  }, [])

  // Accept: the page holds still. The button squishes and bursts into little hearts, then folds itself into an
  // envelope tied with the mauli thread. The card turns over like a real reply card to its thank-you side, where a
  // wax seal stamps down and the guest's entry pass appears. Then the envelope flies down onto the stage, trailing
  // gold, lands at the couple's feet and opens; the lamps light, and two bursts of rose and marigold petals go up.
  const { contextSafe } = useGSAP({ scope: root })
  const celebrate = contextSafe(() => {
    const q = gsap.utils.selector(root)
    const host = root.current
    const section = host.getBoundingClientRect()
    const btnEl = q('.rsvp__submit')[0]
    const btn = btnEl.getBoundingClientRect()
    const env = q('.rsvp__envelope')[0]
    const card = q('.rsvp__card')[0]
    const { tl, glide, cam, play } = lockedTimeline(lenis, {
      safety: 16,
      // once it has all played: the lamps keep a soft flicker and the envelope bobs where it landed
      onDone: () => {
        gsap.to(q('.rsvp__lamp'), { opacity: () => gsap.utils.random(0.65, 1), duration: () => gsap.utils.random(1.2, 2.4), ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.2, from: 'random' } })
        gsap.to(env, { y: '-=5', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      },
    })
    const stageStop = () => {
      const stage = q('.rsvp__stage')[0]
      return Math.max(cam.y, absTop(stage) + stage.offsetHeight - window.innerHeight)
    }
    // the envelope's spots, in the section's own coordinates (so they hold while the page moves)
    // (an <svg> has no offsetWidth, so measure its box at rest)
    gsap.set(env, { x: 0, y: 0, scale: 1, rotation: 0 })
    const { width: W, height: H } = env.getBoundingClientRect()
    const bx = btn.left + btn.width / 2 - section.left
    const by = btn.top + btn.height / 2 - section.top
    const from = { x: bx - W / 2, y: by - H / 2 }
    const landing = () => {
      const r = host.getBoundingClientRect()
      const c = q('.rsvp__couple')[0].getBoundingClientRect()
      // it lands at 0.7 scale (scaled round its centre), its foot just in front of the couple's feet
      return { x: c.left + c.width / 2 - r.left - W / 2, y: c.bottom - r.top - H * 0.85 + 4 }
    }
    let to
    // gold sparkles fall off the envelope while it flies (about one every 50ms)
    let lastSpark = 0
    const trail = () => {
      const now = performance.now()
      if (now - lastSpark < 50) return
      lastSpark = now
      sparkle(host, gsap.getProperty(env, 'x') + W / 2, gsap.getProperty(env, 'y') + H / 2)
    }

    gsap.set(env, { ...from, autoAlpha: 0, scale: 0.4, rotation: 0 })
    gsap.set(q('.rsvp__envelope [pathLength]'), { strokeDasharray: 1, strokeDashoffset: 1 })
    gsap.set(q('.rsvp__envelope-flap'), { scaleY: -1 })
    gsap.set(q('.rsvp__envelope-bead'), { scale: 0, autoAlpha: 1 })
    gsap.set(q('.rsvp__envelope-heart'), { autoAlpha: 0, y: 0, scale: 0.4 })
    gsap.set(card, { transformPerspective: 1100, transformOrigin: '50% 50%' })

    // 1. press: the button squishes, the phone taps back and hearts burst out of it
    navigator.vibrate?.(28)
    heartBurst(host, bx, by)
    tl.to(btnEl, { scale: 0.92, duration: 0.12, ease: 'power2.out' }, 0)
      .to(btnEl, { scale: 1.04, duration: 0.18, ease: 'power2.out' }, 0.12)
      // 2. the button folds itself into the envelope, the flap closes, the thread ties round it
      .to(btnEl, { scale: 0.5, autoAlpha: 0, duration: 0.35, ease: 'power2.in' }, 0.32)
      .to(env, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, 0.45)
      .to(q('.rsvp__envelope-flap'), { scaleY: 1, duration: 0.45, ease: 'power2.inOut' }, 0.85)
      .to(q('.rsvp__envelope [pathLength]'), { strokeDashoffset: 0, duration: 0.5, ease: 'sine.inOut', stagger: 0.08 }, 1.15)
      .to(q('.rsvp__envelope-bead'), { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }, 1.55)
      // the envelope lifts off the card, so the card can turn over beneath it
      .to(env, { y: from.y - 26, scale: 1.08, duration: 0.5, ease: 'sine.out' }, 1.6)
      // 3. the card turns over: edge-on, its front swaps for the thank-you side, and it comes round the rest of the way
      // (the sheet keeps its height through the swap so nothing below it jumps)
      .to(card, { rotationY: 90, duration: 0.38, ease: 'power2.in' }, 1.75)
      .call(() => {
        const sheet = q('.rsvp__sheet')[0]
        gsap.set(sheet, { minHeight: sheet.offsetHeight })
        sheet.classList.add('is-sent')
        setSent(true)
      }, null, 2.13)
      .fromTo(card, { rotationY: -90 }, { rotationY: 0, duration: 0.7, ease: 'back.out(1.2)', immediateRender: false }, 2.13)
      // 4. the wax seal stamps down (its own spring, see the thank-you markup): the card gives a little jolt, and a dhol hit
      .call(dholHit, null, 2.55)
      .to(card, { keyframes: { y: [0, 5, -2, 0], rotation: [0, -0.6, 0.3, 0] }, duration: 0.4, ease: 'power1.out' }, 2.55)
    // 5. the page glides down to the stage once the thank-you has been read for a beat
    glide(stageStop, { duration: 2.4, ease: 'sine.inOut' }, 3.3)
    // ... and the envelope flies down in a soft arc, trailing gold, and lands at the couple's feet
    tl.add(() => { to = landing() }, 3.3)
      .to(env, { x: () => to.x, duration: 2.2, ease: 'sine.inOut', onUpdate: trail }, 3.35)
      .to(env, { y: from.y - 70, rotation: -12, duration: 0.7, ease: 'sine.out' }, 3.35)
      .to(env, { y: () => to.y, rotation: 0, duration: 1.5, ease: 'sine.inOut' }, 4.05)
      .to(env, { scale: 0.7, duration: 2.2, ease: 'sine.inOut' }, 3.35)
      .to(env, { y: () => to.y - 10, duration: 0.18, ease: 'sine.out', yoyo: true, repeat: 1 }, 5.55)
      // 6. it opens: the thread unties, the flap lifts and a heart floats up out of it
      .to(q('.rsvp__envelope [pathLength]'), { strokeDashoffset: 1, duration: 0.35, ease: 'sine.in' }, 5.9)
      .to(q('.rsvp__envelope-bead'), { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 5.9)
      .to(q('.rsvp__envelope-flap'), { scaleY: -1, duration: 0.5, ease: 'power2.inOut' }, 6.15)
      .to(q('.rsvp__envelope-heart'), { autoAlpha: 1, scale: 1, y: -22, duration: 0.6, ease: 'back.out(2)' }, 6.45)
      .to(q('.rsvp__envelope-heart'), { y: -64, autoAlpha: 0, scale: 1.3, duration: 1.3, ease: 'sine.in' }, 7.05)
      // 7. the lamps light up from left to right, and the petal cannons fire from both corners of the stage
      .to(q('.rsvp__lamp'), { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'power2.out', stagger: 0.05 }, 4.9)
      .add(() => petalCannons(q('.rsvp__stage')[0]), 5.6)
      .add(() => rainPetals(q('.rsvp__stage')[0]), 6.3)
      .to({}, { duration: 1.6 }) // let the petals fall a while before handing scrolling back
    play()
  })

  const onAccept = (e) => {
    e.preventDefault()
    if (wedding.rsvp.whatsapp) {
      window.open(`https://wa.me/${wedding.rsvp.whatsapp}?text=${encodeURIComponent(buildMessage(name))}`, '_blank', 'noopener')
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.current.classList.add('is-celebrated')
      root.current.querySelector('.rsvp__sheet')?.classList.add('is-sent')
      setSent(true)
      return
    }
    celebrate()
  }

  return (
    <section id="rsvp" ref={root} className="section sky-bg rsvp chap" data-chapter="stop">
      <FloralSides tiles={5} head={false} />
      {/* the rose-and-pearl garland that ends the Good to Know page carries on here: its strands of pearls,
          jasmine and rosebuds hang down from the join, so the two pages read as one sheet */}
      <img className="rsvp__garland art-sway" data-art="drop" src="/rsvp-garland.webp" alt="" width="1536" height="660" decoding="async" loading="lazy" aria-hidden="true" />
      <Mandala className="rsvp__mandala" />
      <SectionTitle eyebrow="ਤੁਹਾਡਾ ਜਵਾਬ" title="Kindly Reply" />
      <p className="rsvp__deadline reveal">{wedding.rsvp.deadline}</p>

      <div className="rsvp__wrap">
      <div className="rsvp__card torn-shadow">
        <div className="torn-sides">
        <div className="torn rsvp__sheet">
          {sent ? (
          <div className="rsvp__thanks">
            {/* a rose wax seal pressed on the reply: it lands with a little turn, its gold ring draws
                itself round and the heart pops in */}
            <motion.svg
              className="rsvp__seal"
              viewBox="0 0 100 100"
              aria-hidden="true"
              initial={{ scale: 2.2, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 17, delay: 0.25 }}
            >
              <defs>
                <radialGradient id="rsvpSealWax" cx="38%" cy="32%" r="75%">
                  <stop offset="0" stopColor="#d4637f" />
                  <stop offset=".55" stopColor="#a63f5b" />
                  <stop offset="1" stopColor="#6e1f36" />
                </radialGradient>
              </defs>
              <path d={SEAL_EDGE} fill="url(#rsvpSealWax)" />
              <motion.circle
                cx="50" cy="50" r="33" fill="none" stroke="#e8c675" strokeWidth="1.6"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 0.6, ease }}
              />
              <circle cx="50" cy="50" r="28" fill="none" stroke="#e8c675" strokeWidth=".8" strokeDasharray="1.5 3" opacity=".8" />
              <motion.path
                d="M50 64 C38 56 33 49 33 43 C33 37.5 37.5 34 42 34 C45.5 34 48.5 36 50 39 C51.5 36 54.5 34 58 34 C62.5 34 67 37.5 67 43 C67 49 62 56 50 64 Z"
                fill="#fbe7c4"
                style={{ transformOrigin: '50px 49px' }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14, delay: 1.0 }}
              />
            </motion.svg>
            <motion.p className="rsvp__thanks-pa gurmukhi" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.55 }}>ਧੰਨਵਾਦ</motion.p>
            <motion.h3 className="rsvp__thanks-title" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.7 }}>Shukriya{hasGuestName() ? `, ${name}` : ''}!</motion.h3>
            <motion.p className="rsvp__thanks-text" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.85 }}>We can’t wait to celebrate with you. Get your dancing shoes ready!</motion.p>

            {/* the guest's entry pass: a little ticket with their name, the day and the place, and a way to save it */}
            <motion.div
              className="rsvp__pass"
              initial={{ opacity: 0, y: 26, rotateX: -55 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.8, ease, delay: 1.15 }}
            >
              <div className="rsvp__pass-band">
                <span className="rsvp__pass-label">Admit one <span aria-hidden="true">·</span> <span className="gurmukhi">ਸੱਦਾ</span></span>
                <strong className="rsvp__pass-name">{hasGuestName() ? name : 'Our honoured guest'}</strong>
                <span className="rsvp__pass-status"><span aria-hidden="true">♥</span> Seat saved with love</span>
              </div>
              <div className="rsvp__pass-body">
                <p className="rsvp__pass-event"><span className="gurmukhi">{WED_EVENT.gurmukhi}</span>{WED_EVENT.name}</p>
                <ul className="rsvp__pass-info">
                  <li>
                    <CalendarIcon />
                    <span><b>{wedding.dateLabel.split(', ').slice(1).join(', ')}</b><small>{wedding.dateLabel.split(', ')[0]} · {WED_EVENT.time}</small></span>
                  </li>
                  <li>
                    <PinIcon />
                    <span><b>{wedding.venue.name}</b><small>{wedding.venue.address}</small></span>
                  </li>
                </ul>
              <button
                type="button"
                className="rsvp__pass-cal"
                onClick={() =>
                  downloadIcs({
                    title: `${wedding.bride.name} & ${wedding.groom.name} — ${WED_EVENT.name}`,
                    start: wedding.date,
                    location: `${wedding.venue.name}, ${wedding.venue.address}`,
                    description: invitationText(),
                  })
                }
              >
                <CalendarIcon /> Add to calendar
              </button>
              </div>
            </motion.div>
          </div>
        ) : (
          <form
            key="form"
            className="rsvp__form"
            onSubmit={onAccept}
          >
            <header className="rsvp__head">
              <p className="rsvp__head-pa gurmukhi">ਤੁਸੀਂ ਆਓਗੇ ਨਾ?</p>
              <h3 className="rsvp__head-title">{hasGuestName() ? name : 'You'}</h3>
              <span className="rsvp__rule" aria-hidden="true" />
            </header>

            <div className="rsvp__ask">
              <p className="rsvp__ask-q">Will you come and bless us with your presence?</p>
              <p className="rsvp__ask-note">Our celebrations wouldn’t be complete without you.</p>
            </div>

            <div className="rsvp__nav">
              <button type="submit" className="btn rsvp__submit">Joyfully accept <span aria-hidden="true">♥</span></button>
            </div>
          </form>
        )}
        </div>
        </div>
      </div>
      </div>
      <div className="rsvp__stage" aria-hidden="true">
        <img className="rsvp__stage-img" src="/rsvp-stage.webp" alt="" width="1491" height="1055" loading="lazy" decoding="async" />
        {LAMPS.map((p, i) => <span key={i} className="rsvp__lamp" style={p} />)}
        <div className="rsvp__couple">
          <img src="/couple-back.webp" alt="" width="1106" height="1422" loading="lazy" decoding="async" />
        </div>
      </div>

      {/* the reply, folded and tied with the mauli thread; it flies from the button to the couple's feet */}
      <svg className="rsvp__envelope" viewBox="0 0 80 56" aria-hidden="true">
        <rect x="1" y="1" width="78" height="54" rx="4" fill="#fffaf1" stroke="#c9a24d" strokeWidth="1.2" />
        <path d="M1 55 L33 30 M79 55 L47 30" stroke="#e3cfa4" strokeWidth="1" fill="none" />
        <path className="rsvp__envelope-flap" d="M1 2 L40 32 L79 2 Z" fill="#fbefe0" stroke="#c9a24d" strokeWidth="1.2" strokeLinejoin="round" />
        <path pathLength="1" d="M-2 14 C20 26 60 30 82 44" stroke="#c0243c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <path pathLength="1" d="M-2 44 C20 30 60 26 82 14" stroke="#d9a92a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle className="rsvp__envelope-bead" cx="40" cy="29" r="5" fill="#fffdf8" stroke="#b8862f" strokeWidth="1.4" />
        {/* the heart that floats out once the envelope opens at the couple's feet */}
        <path className="rsvp__envelope-heart" d="M40 18 C33 13 30 9 30 6 C30 3 32.5 1 35 1 C37 1 39 2.2 40 4 C41 2.2 43 1 45 1 C47.5 1 50 3 50 6 C50 9 47 13 40 18 Z" fill="#c94f6d" stroke="#fbe7c4" strokeWidth=".8" />
      </svg>
    </section>
  )
}
