import { useEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap'
import { wedding } from '../../data/wedding'
import { ARCH, LEAF, archPath } from './geometry'
import HaveliDefs from './HaveliDefs'
import Mandala from '../Mandala'
import './Haveli.css'

// Door mechanics ported from the portfolio's Rooms.tsx: spring hinge, hover crack, lever/knock, walk-through.
const ANG = 76 // a leaf fully open, swung into the courtyard
const HOVER_OPEN = 0.1 // hovering cracks the doors open

function spring(tension, friction, render) {
  let x = 0, v = 0, target = 0, raf = 0
  const step = () => {
    const dt = 1 / 60, a = tension * (target - x) - friction * v
    v += a * dt
    x += v * dt
    render(x)
    if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001) {
      x = target; v = 0; render(x); raf = 0
      return
    }
    raf = requestAnimationFrame(step)
  }
  render(0)
  return {
    set(t) { target = t; if (!raf) raf = requestAnimationFrame(step) },
    stop() { cancelAnimationFrame(raf); raf = 0 },
  }
}

// A knock on the kundi: a few ms of filtered noise, nothing downloaded
let audio = null
function knockSound() {
  try {
    audio ??= new AudioContext()
    if (audio.state === 'suspended') audio.resume()
    const t = audio.currentTime, decay = 0.12
    const len = Math.ceil(audio.sampleRate * decay)
    const buf = audio.createBuffer(1, len, audio.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3
    const src = audio.createBufferSource()
    src.buffer = buf
    const filter = audio.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 420
    filter.Q.value = 1.4
    const gain = audio.createGain()
    gain.gain.setValueAtTime(0.35, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    src.connect(filter).connect(gain).connect(audio.destination)
    src.start(t)
  } catch {
    // sound is a garnish
  }
}

const STUD_ROWS = [160, 190, 220, 250, 280, 310, 335]
const STUD_COLS = [22, 42, 62, 82]

function Leaf({ side }) {
  return (
    <span className={`hv-leaf hv-leaf--${side}`}>
      <svg viewBox="0 0 100 350" preserveAspectRatio="none" aria-hidden="true">
        <path d={LEAF} fill="url(#hv-teak)" />
        <path d={LEAF} fill="url(#hv-grain)" />
        <path d={LEAF} transform="translate(12 30) scale(0.8 0.86)" fill="url(#hv-panel)" stroke="#2a1206" strokeWidth="1.5" />
        {[140, 232, 326].map((y) => (
          <rect key={y} x="0" y={y} width="100" height="7" fill="url(#hv-brass)" />
        ))}
        {STUD_ROWS.map((y) => STUD_COLS.map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" fill="url(#hv-stud)" />))}
        {/* half a sun at the meeting edge: the two leaves make one when closed */}
        <path d="M100 66A26 26 0 0 0 100 118Z" fill="url(#hv-brass)" />
        {[-60, -30, 0, 30, 60].map((a) => (
          <rect key={a} x="62" y="90.5" width="10" height="3" rx="1.5" fill="url(#hv-brass)" transform={`rotate(${a} 100 92)`} />
        ))}
        {/* kundi: ring knocker */}
        <circle cx="86" cy="200" r="6.5" fill="url(#hv-brass)" />
        <g className="hv-ring">
          <circle cx="86" cy="214" r="10" fill="none" stroke="url(#hv-brass)" strokeWidth="3" />
        </g>
        <path d={LEAF} fill="#000" className="hv-leaf-shade" />
      </svg>
    </span>
  )
}

export default function HaveliGate({ onOpen, onDone }) {
  const sceneRef = useRef(null)
  const wayRef = useRef(null)
  const badgeRef = useRef(null)
  const [fading, setFading] = useState(false)
  const { bride, groom } = wedding

  useEffect(() => {
    const scene = sceneRef.current
    const way = wayRef.current
    const badge = badgeRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const timers = []
    const later = (fn, ms) => timers.push(window.setTimeout(fn, ms))
    let busy = false

    const leaves = ['l', 'r'].map((side) => {
      const el = scene.querySelector(`.hv-leaf--${side}`)
      const dir = side === 'l' ? 1 : -1
      return spring(120, 14, (o) => {
        const k = Math.max(0, o) // the frame's door stop: never swings outward
        el.style.transform = `rotateY(${dir * k * ANG}deg)`
        el.style.setProperty('--o', k.toFixed(4))
      })
    })

    // entrance: the haveli fades up, the doors rise, the toran and lights settle
    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.from('.hv-unit', { y: 40, autoAlpha: 0, duration: 1.4, ease: 'expo.out', delay: 0.2 })
      gsap.from('.hv-head > *', { y: 18, autoAlpha: 0, stagger: 0.12, duration: 1, ease: 'power3.out', delay: 0.5 })
      gsap.from('.hv-jharokha', { autoAlpha: 0, y: 30, duration: 1.4, stagger: 0.15, ease: 'expo.out', delay: 0.4 })
      gsap.utils.toArray('.hv-strand', scene).forEach((s) =>
        gsap.fromTo(s, { rotation: -3 }, { rotation: 3, svgOrigin: s.dataset.origin, duration: gsap.utils.random(2.2, 3.4), ease: 'sine.inOut', repeat: -1, yoyo: true }),
      )
    }, scene)

    const place = (e) => {
      badge.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
    }
    const onEnter = (e) => {
      if (!canHover || busy) return
      place(e)
      badge.classList.add('on')
      leaves.forEach((s) => s.set(HOVER_OPEN))
    }
    const onMove = (e) => canHover && place(e)
    const onLeave = () => {
      badge.classList.remove('on')
      if (!busy) leaves.forEach((s) => s.set(0))
    }

    // the scene scales up around the lit gap between the open leaves until the courtyard light fills the screen
    const through = () => {
      const r = scene.querySelector('.hv-opening').getBoundingClientRect()
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.55
      const gw = r.width * 0.8, gh = r.height
      const sEnd = Math.max(window.innerWidth / gw, window.innerHeight / gh) * 1.15
      const tx = window.innerWidth / 2 - cx, ty = window.innerHeight / 2 - cy
      scene.style.transformOrigin = `${cx}px ${cy}px`
      let handed = false
      const handoff = () => {
        handed = true
        setFading(true)
        onOpen()
        later(onDone, 900)
      }
      if (reduced) return handoff()
      const proxy = { p: 0 }
      gsap.to(proxy, {
        p: 1,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate() {
          const e = proxy.p
          const sc = Math.exp(Math.log(sEnd) * e) // even speed of approach
          const f = Math.min(1, e * 1.6) // drift the doorway to the centre early
          scene.style.transform = `translate(${tx * f}px, ${ty * f}px) scale(${sc})`
          if (!handed && sc >= sEnd / 1.15) handoff()
        },
      })
    }

    // click: knock the kundi, the leaves swing open, then walk through
    const enter = () => {
      if (busy) return
      busy = true
      badge.classList.remove('on')
      scene.classList.add('is-entering')
      knockSound()
      later(knockSound, 170)
      if (!reduced) {
        gsap.timeline()
          .to('.hv-ring', { rotation: -28, svgOrigin: '86 205', duration: 0.09, ease: 'power2.out' })
          .to('.hv-ring', { rotation: 0, svgOrigin: '86 205', duration: 0.08, ease: 'power2.in' })
          .to('.hv-ring', { rotation: -22, svgOrigin: '86 205', duration: 0.08, ease: 'power2.out' })
          .to('.hv-ring', { rotation: 0, svgOrigin: '86 205', duration: 0.3, ease: 'elastic.out(1, 0.4)' })
      }
      later(() => leaves[0].set(1), reduced ? 0 : 330)
      later(() => leaves[1].set(1), reduced ? 0 : 390)
      later(through, reduced ? 0 : 920)
    }

    way.addEventListener('pointerenter', onEnter)
    way.addEventListener('pointermove', onMove)
    way.addEventListener('pointerleave', onLeave)
    way.addEventListener('click', enter)
    return () => {
      ctx.revert()
      timers.forEach(clearTimeout)
      leaves.forEach((s) => s.stop())
      way.removeEventListener('pointerenter', onEnter)
      way.removeEventListener('pointermove', onMove)
      way.removeEventListener('pointerleave', onLeave)
      way.removeEventListener('click', enter)
    }
    // onOpen/onDone are stable setters from App
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`hv${fading ? ' hv--fading' : ''}`}>
      <HaveliDefs />
      <div ref={sceneRef} className="hv-scene">
        <div className="hv-cornice" aria-hidden="true" />
        <FairyLights />

        <div className="hv-jharokha hv-jharokha--l" aria-hidden="true"><span /></div>
        <div className="hv-jharokha hv-jharokha--r" aria-hidden="true"><span /></div>

        <header className="hv-head">
          <p className="hv-eyebrow gurmukhi">{wedding.blessingLine}</p>
          <p className="hv-names">
            {bride.name} <span>&amp;</span> {groom.name}
          </p>
        </header>

        <div className="hv-unit">
          <svg className="hv-casing" viewBox="0 0 300 440" aria-hidden="true">
            <path d={`${archPath(42)} ${archPath(0)}`} fill="url(#hv-stone)" fillRule="evenodd" />
            <path d={`${archPath(32)} ${archPath(20)}`} fill="url(#hv-carve)" fillRule="evenodd" opacity="0.9" />
            <path d={archPath(36)} fill="none" stroke="#8a5a30" strokeWidth="1.2" />
            <path d={archPath(16)} fill="none" stroke="#8a5a30" strokeWidth="1.2" />
            <path d={archPath(5)} fill="none" stroke="#6b3f1c" strokeWidth="2.5" />
            <rect x="0" y="412" width="58" height="28" fill="url(#hv-stone)" stroke="#8a5a30" />
            <rect x="242" y="412" width="58" height="28" fill="url(#hv-stone)" stroke="#8a5a30" />
          </svg>
          <p className="hv-plaque gurmukhi">ਜੀ ਆਇਆਂ ਨੂੰ</p>

          <button ref={wayRef} type="button" className="hv-opening" aria-label="Knock and open the haveli doors" autoFocus>
            <svg className="hv-beyond" viewBox="0 0 200 350" preserveAspectRatio="none" aria-hidden="true">
              <path d={ARCH} fill="url(#hv-beyond)" />
              {[[40, 120], [100, 90], [160, 130], [70, 200], [135, 220]].map(([x, y]) => (
                <circle key={x} cx={x} cy={y} r="22" fill="url(#hv-bulb)" />
              ))}
            </svg>
            <span className="hv-crack" />
            <Leaf side="l" />
            <Leaf side="r" />
            <span className="hv-sill" />
          </button>

          <Toran />
          <span className="hv-diya hv-diya--l" aria-hidden="true" />
          <span className="hv-diya hv-diya--r" aria-hidden="true" />
        </div>

        <div className="hv-floor" aria-hidden="true">
          <Mandala className="hv-rangoli" />
        </div>
        <p className="hv-hint">Knock on the doors to enter</p>
      </div>

      <div ref={badgeRef} className="hv-cursor" aria-hidden="true">
        Click to enter
      </div>
    </div>
  )
}

// Marigold strands hanging from the casing, in unit space
function Toran() {
  const xs = [30, 62, 94, 126, 150, 174, 206, 238, 270]
  const lens = [5, 4, 3, 2, 1, 2, 3, 4, 5]
  return (
    <svg className="hv-toran" viewBox="0 0 300 440" aria-hidden="true">
      <path d="M8 34Q150 64 292 34" fill="none" stroke="#2f6b25" strokeWidth="5" />
      {xs.map((x, i) => {
        const top = 34 + 30 * (1 - ((x - 150) / 142) ** 2)
        return (
          <g key={x} className="hv-strand" data-origin={`${x} ${top}`}>
            <line x1={x} y1={top} x2={x} y2={top + lens[i] * 11} stroke="#f3d68a" strokeWidth="0.6" />
            {Array.from({ length: lens[i] }, (_, j) => (
              <circle key={j} cx={x} cy={top + 6 + j * 11} r="6" fill={`url(#hv-mg-${(i + j) % 2 ? 'orange' : 'yellow'})`} />
            ))}
            <path d={`M${x - 5} ${top} q5 -10 10 0 q-5 6 -10 0Z`} fill="url(#hv-mango)" />
          </g>
        )
      })}
    </svg>
  )
}

// Strings of fairy lights draped under the cornice
function FairyLights() {
  const drapes = [0, 1, 2, 3]
  return (
    <svg className="hv-lights" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
      {drapes.map((d) => {
        const x0 = d * 250, x1 = x0 + 250
        return (
          <g key={d}>
            <path d={`M${x0} 8Q${x0 + 125} 90 ${x1} 8`} fill="none" stroke="rgba(243,214,138,0.35)" strokeWidth="1" />
            {Array.from({ length: 11 }, (_, i) => {
              const t = (i + 0.5) / 11
              const x = x0 + 250 * t
              const y = (1 - t) ** 2 * 8 + 2 * (1 - t) * t * 90 + t * t * 8
              return <circle key={i} className="hv-bulb" cx={x} cy={y + 3} r="3.2" style={{ animationDelay: `${((d * 11 + i) * 0.37) % 2.4}s` }} />
            })}
          </g>
        )
      })}
    </svg>
  )
}
