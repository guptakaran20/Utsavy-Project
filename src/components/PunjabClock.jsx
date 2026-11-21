import { useContext, useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { LenisContext } from '../lib/smoothScroll'
import { hurryOnInput } from '../lib/lockedTimeline'
import { wedding } from '../data/wedding'
import './PunjabClock.css'

// A Punjabi wall clock in the invitation's colours: Gurmukhi numerals, the twelve desi months between them,
// and hands that keep Amritsar time live (so guests abroad see the time back home).
const NUMS = ['੧੨', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯', '੧੦', '੧੧']
// between 12 & 1 sits Poh, then round the dial to Maghar between 11 & 12
const MONTHS = ['ਪੋਹ', 'ਮਾਘ', 'ਫੱਗਣ', 'ਚੇਤ', 'ਵੈਸਾਖ', 'ਜੇਠ', 'ਹਾੜ੍ਹ', 'ਸਾਵਣ', 'ਭਾਦੋਂ', 'ਅੱਸੂ', 'ਕੱਤਕ', 'ਮੱਘਰ']
const C = 200
// Outline of Punjab (India), simplified from the Apache-2.0 'india-state-boundries-geojson' data
// (github.com/Tanmay53/india-state-boundries-geojson); drawn in a 88.5 x 100 box.
const PUNJAB = 'M83.8 54.1 L81.9 51.9 L80.8 52.0 L79.4 51.0 L79.0 49.4 L79.8 47.3 L78.8 46.8 L78.7 44.9 L79.9 43.4 L78.5 43.8 L79.1 42.6 L78.4 41.7 L77.2 42.4 L77.1 41.4 L76.5 42.2 L76.6 41.6 L75.7 41.8 L75.2 40.5 L74.1 41.5 L74.8 40.8 L73.8 39.9 L72.2 36.2 L72.0 37.3 L70.9 37.4 L71.6 39.3 L70.2 39.4 L70.7 40.1 L69.3 40.8 L69.1 40.4 L66.6 40.6 L66.5 39.5 L65.6 38.8 L66.2 37.1 L62.9 30.5 L61.9 29.6 L59.5 23.5 L61.0 23.4 L58.8 18.9 L51.5 14.6 L49.6 14.9 L51.9 11.9 L51.4 10.6 L50.5 10.9 L50.9 9.8 L50.3 9.3 L54.7 7.5 L57.7 3.9 L59.5 4.0 L56.6 0.0 L54.9 1.6 L53.5 2.0 L53.9 2.7 L53.3 3.6 L48.6 5.2 L47.8 7.9 L46.4 6.5 L46.6 5.6 L44.9 6.6 L42.3 5.6 L41.7 7.3 L43.5 8.2 L43.2 9.7 L41.6 10.3 L41.7 11.2 L40.0 13.8 L39.1 14.2 L38.3 13.2 L38.1 14.5 L37.5 15.0 L36.0 14.5 L35.4 15.3 L34.4 15.0 L32.8 16.1 L30.5 15.1 L28.9 15.4 L28.9 16.2 L27.5 17.3 L27.2 18.7 L25.3 18.7 L24.3 19.2 L24.3 19.8 L22.8 19.9 L21.9 21.2 L21.1 21.0 L19.6 23.8 L19.7 25.4 L18.1 26.0 L17.6 26.9 L19.0 28.1 L19.5 30.5 L21.3 31.8 L21.2 33.2 L20.1 34.1 L21.9 34.6 L22.4 36.6 L20.9 36.8 L20.4 38.2 L19.4 38.7 L18.7 40.4 L19.2 40.7 L18.6 41.8 L18.9 42.5 L18.2 46.5 L19.3 46.8 L19.7 48.1 L21.1 47.6 L20.9 46.4 L21.9 46.9 L23.4 46.6 L23.8 47.8 L22.8 49.2 L20.7 49.7 L19.9 49.1 L19.3 51.2 L15.5 52.9 L15.7 54.0 L14.1 54.5 L13.9 55.2 L14.5 55.6 L12.7 56.1 L12.2 58.4 L11.0 58.5 L11.8 59.8 L10.2 60.2 L9.1 62.2 L7.8 63.3 L7.2 63.2 L6.9 64.1 L6.3 64.0 L6.4 65.1 L5.6 65.9 L6.1 66.1 L5.6 67.0 L4.6 66.3 L4.4 66.8 L3.8 66.6 L4.1 67.3 L3.0 67.6 L2.4 69.2 L1.6 68.1 L1.3 69.8 L2.7 69.6 L0.0 72.5 L2.3 75.5 L2.8 80.5 L0.7 82.9 L0.4 85.5 L18.9 86.3 L22.2 87.8 L23.9 85.4 L24.6 85.9 L27.0 84.8 L28.2 86.1 L29.2 85.7 L29.4 86.6 L30.3 86.3 L32.1 89.0 L34.4 88.7 L35.0 87.4 L35.7 88.7 L35.0 89.3 L35.9 90.2 L35.3 91.1 L36.3 91.1 L36.9 92.1 L37.2 90.5 L38.0 89.9 L39.4 92.8 L39.0 93.7 L38.2 93.8 L38.4 95.1 L37.3 95.7 L37.7 97.1 L39.2 97.9 L38.8 98.7 L39.2 100.0 L41.4 99.4 L41.7 98.5 L40.8 97.8 L41.0 97.2 L41.6 97.0 L42.1 95.6 L42.8 95.9 L42.4 94.8 L43.8 94.2 L44.2 92.6 L45.5 91.9 L45.7 91.1 L47.5 92.7 L48.7 92.3 L49.2 93.4 L50.6 93.0 L51.0 92.2 L52.0 92.1 L52.9 92.9 L53.3 90.9 L54.3 91.1 L54.9 90.6 L55.7 91.2 L56.7 90.9 L57.6 93.0 L58.6 92.9 L60.9 93.8 L62.1 92.8 L62.6 93.2 L64.2 91.0 L64.9 91.6 L65.6 90.7 L68.4 89.6 L68.5 88.8 L66.9 88.4 L66.3 87.1 L67.4 84.4 L68.1 84.0 L67.5 83.5 L68.7 81.6 L67.6 80.9 L67.4 79.3 L70.7 81.4 L71.8 80.5 L71.0 79.9 L71.5 79.6 L71.8 80.5 L72.9 80.7 L72.7 80.0 L73.2 79.7 L72.6 78.8 L73.6 78.1 L74.7 81.2 L75.9 81.4 L76.2 82.2 L77.2 82.0 L78.0 81.2 L77.0 80.9 L77.1 80.4 L78.7 80.8 L79.9 79.5 L78.7 78.4 L79.1 77.7 L80.0 78.2 L79.7 78.9 L80.3 78.3 L80.3 77.8 L79.2 77.5 L79.5 77.0 L78.6 76.6 L78.6 76.0 L77.2 77.1 L77.5 75.7 L79.4 75.7 L81.3 73.6 L82.9 72.8 L82.0 71.4 L82.8 70.2 L83.8 69.7 L84.2 70.6 L85.2 70.7 L85.9 69.8 L86.9 70.8 L87.3 72.5 L88.5 71.6 L87.7 71.1 L87.6 69.9 L87.0 70.1 L87.7 68.9 L87.4 68.1 L88.3 67.7 L88.3 67.0 L87.0 66.1 L87.9 65.9 L88.1 64.0 L86.6 63.0 L86.7 61.7 L85.9 62.5 L85.3 61.6 L83.8 62.0 L81.8 59.6 L83.6 57.8 L84.2 58.7 L85.0 58.4 L84.9 59.2 L85.6 59.2 L86.1 58.1 L85.8 56.5 L84.9 56.2 L83.8 54.1Z'
const at = (deg, r) => [C + r * Math.sin((deg * Math.PI) / 180), C - r * Math.cos((deg * Math.PI) / 180)]

// current time in Amritsar (IST), to the millisecond, wherever the guest is
const istNow = () => {
  const d = new Date()
  const ms = d.getTime() + (d.getTimezoneOffset() + 330) * 60000
  const t = new Date(ms)
  return { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() + t.getMilliseconds() / 1000 }
}

export default function PunjabClock() {
  const root = useRef(null)
  const lenis = useContext(LenisContext)
  const hour = useRef(null)
  const minute = useRef(null)
  const second = useRef(null)

  useEffect(() => {
    let raf = 0
    let onScreen = false
    const tick = () => {
      raf = 0
      if (!onScreen || document.hidden) return
      const { h, m, s } = istNow()
      const sec = Math.floor(s) + Math.min(1, (s % 1) * 4) // a gentle step each second, like a real quartz hand
      second.current?.setAttribute('transform', `rotate(${sec * 6} ${C} ${C})`)
      minute.current?.setAttribute('transform', `rotate(${(m + s / 60) * 6} ${C} ${C})`)
      hour.current?.setAttribute('transform', `rotate(${((h % 12) + m / 60) * 30} ${C} ${C})`)
      raf = requestAnimationFrame(tick)
    }
    // the hands only move while the clock is on screen: off screen the loop sleeps instead of redrawing every frame
    const wake = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(tick) }
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; wake() })
    if (root.current) io.observe(root.current)
    document.addEventListener('visibilitychange', wake)
    onScreen = true
    tick()
    onScreen = false
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', wake) }
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
        tl.from('.pclock__dial', { scale: 0.85, autoAlpha: 0, rotation: -20, transformOrigin: '50% 50%', duration: 0.8 })
          .fromTo('.pclock__ring', { strokeDasharray: 1300, strokeDashoffset: 1300 }, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.1)
        // the numerals are written in one by one, sweeping clockwise round the dial from 12, each swung in along the rim,
        // with the month that follows it
        const nums = gsap.utils.toArray('.pclock__num', root.current)
        const months = gsap.utils.toArray('.pclock__month', root.current)
        // (a quick sweep round the dial: the page is held still while it writes, so the whole clock takes about 2.5 s)
        const STEP = 0.17
        nums.forEach((el, i) => {
          tl.from(el, { autoAlpha: 0, scale: 0.4, rotation: -55, svgOrigin: `${C} ${C}`, duration: 0.7, ease: 'back.out(1.5)' }, 0.5 + i * STEP)
          if (months[i]) tl.from(months[i], { autoAlpha: 0, rotation: -30, svgOrigin: `${C} ${C}`, duration: 0.6, ease: 'power2.out' }, 0.5 + i * STEP + STEP / 2)
        })
        tl.from('.pclock__hands', { scale: 0, transformOrigin: '50% 50%', duration: 0.7, ease: 'back.out(1.6)' }, 0.5 + nums.length * STEP + 0.1)

        // While the dial writes itself, the page holds still: glide the clock to the middle of the screen,
        // pause scrolling, and hand scrolling back once the hands have sprung in.
        let safety
        const release = () => {
          safety?.kill()
          lenis.current?.start()
          document.documentElement.classList.remove('is-locked')
        }
        tl.eventCallback('onComplete', release)
        const open = () => {
          if (tl.progress() > 0) return
          tl.play()
          hurryOnInput(tl)
          const r = root.current.getBoundingClientRect()
          // Land on the top of the page the clock sits in, so its heading (The Date Reveal) and the scratch card stay
          // in view clear of the notch, as long as the whole clock still fits on screen from there; otherwise centre the clock.
          const page = root.current.closest('section')
          const p = page?.getBoundingClientRect()
          const fits = p && r.bottom - p.top <= window.innerHeight - 16
          const centre = fits ? p.top + window.scrollY : r.top + window.scrollY + r.height / 2 - window.innerHeight / 2
          document.documentElement.classList.add('is-locked')
          if (lenis.current) {
            lenis.current.start()
            lenis.current.scrollTo(centre, { duration: 1.2, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), lock: true, force: true })
            gsap.delayedCall(1.25, () => { if (tl.isActive()) lenis.current?.stop() })
          } else {
            window.scrollTo({ top: centre, behavior: 'smooth' })
          }
          safety = gsap.delayedCall(6, release) // never leave a guest stuck, whatever happens
        }
        const st = ScrollTrigger.create({ trigger: root.current, start: 'top 70%', once: true, onEnter: open })
        return () => { st.kill(); release() }
      })
    },
    { scope: root },
  )

  return (
    <figure ref={root} className="pclock" aria-label={`Clock showing the time in ${wedding.town}`}>
      <svg className="pclock__dial" viewBox="0 0 400 400" role="img" aria-hidden="true">
        <defs>
          <radialGradient id="pcFace" cx="50%" cy="42%" r="62%">
            <stop offset="0" stopColor="#fffefb" /><stop offset=".7" stopColor="#fbf0ea" /><stop offset="1" stopColor="#f3d9d6" />
          </radialGradient>
          <linearGradient id="pcGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dc9a" /><stop offset=".35" stopColor="#c99a4a" /><stop offset=".6" stopColor="#f1d38c" /><stop offset="1" stopColor="#a8762a" />
          </linearGradient>
        </defs>

        {/* gold rim, rose-blush face, dotted gold keyline */}
        <circle cx={C} cy={C} r="194" fill="url(#pcGold)" />
        <circle cx={C} cy={C} r="182" fill="url(#pcFace)" />
        <circle className="pclock__ring" cx={C} cy={C} r="176" fill="none" stroke="#b98b3e" strokeWidth="1.2" />
        <circle cx={C} cy={C} r="168" fill="none" stroke="#b98b3e" strokeOpacity=".7" strokeWidth="1.2" strokeDasharray="1 6" strokeLinecap="round" />

        {/* minute ticks */}
        {Array.from({ length: 60 }, (_, i) => {
          const [x1, y1] = at(i * 6, 176)
          const [x2, y2] = at(i * 6, i % 5 ? 171 : 166)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#b98b3e" strokeOpacity={i % 5 ? 0.45 : 0.9} strokeWidth={i % 5 ? 1 : 1.8} />
        })}

        {/* Gurmukhi numerals and, between them, the desi months */}
        {NUMS.map((n, i) => {
          const [x, y] = at(i * 30, 146)
          return <text key={n} className="pclock__num gurmukhi" x={x} y={y} textAnchor="middle" dominantBaseline="central">{n}</text>
        })}
        {MONTHS.map((m, i) => {
          const [x, y] = at(i * 30 + 15, 112)
          return <text key={m} className="pclock__month gurmukhi" x={x} y={y} textAnchor="middle" dominantBaseline="central">{m}</text>
        })}

        {/* centre: the map of Punjab in shimmering gold, with a fine rose outline */}
        <defs>
          <linearGradient id="pcMap" x1="0" y1="0" x2="1" y2="1" gradientTransform="translate(-1 0)">
            <stop offset="0" stopColor="#c99a4a" /><stop offset=".3" stopColor="#f6e2a6" /><stop offset=".45" stopColor="#f7d3dc" />
            <stop offset=".6" stopColor="#e9c27a" /><stop offset="1" stopColor="#a8762a" />
            <animateTransform attributeName="gradientTransform" type="translate" values="-1 0; 1 0" dur="6s" repeatCount="indefinite" />
          </linearGradient>
        </defs>
        <g className="pclock__map" transform="translate(146.9 140) scale(1.2)">
          <path d={PUNJAB} fill="url(#pcMap)" stroke="#a8762a" strokeWidth=".8" strokeLinejoin="round" />
          <path d={PUNJAB} fill="none" stroke="#fff6dc" strokeOpacity=".7" strokeWidth=".35" transform="translate(-.6 -.6)" />
        </g>

        {/* hands: gold with rose tips, the second hand a slim rose needle */}
        <g className="pclock__hands">
          <g ref={hour}>
            <path d="M196 206 L197 132 Q200 112 203 132 L204 206Z" fill="url(#pcGold)" stroke="#8a6424" strokeWidth=".6" />
            <circle cx="200" cy="124" r="5" fill="#a63f5b" />
          </g>
          <g ref={minute}>
            <path d="M197.5 210 L198.5 82 Q200 62 201.5 82 L202.5 210Z" fill="url(#pcGold)" stroke="#8a6424" strokeWidth=".6" />
            <circle cx="200" cy="74" r="4" fill="#a63f5b" />
          </g>
          <g ref={second}>
            <line x1="200" y1="226" x2="200" y2="58" stroke="#a63f5b" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="200" cy="58" r="3.4" fill="#a63f5b" />
          </g>
          <circle cx={C} cy={C} r="7" fill="url(#pcGold)" stroke="#8a6424" strokeWidth=".8" />
          <circle cx={C} cy={C} r="2.4" fill="#a63f5b" />
        </g>
      </svg>
      <figcaption className="pclock__cap">
        <span className="gurmukhi">{wedding.townGurmukhi} ਦਾ ਸਮਾਂ</span>
        <span>Live time in {wedding.town}</span>
      </figcaption>
    </figure>
  )
}
