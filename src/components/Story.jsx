import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import './PhulkariDivider.css'
import Photo from './Photo'
import './Story.css'

const CHAPTERS = [['Chapter One', 'ਪਹਿਲਾ ਅਧਿਆਇ'], ['Chapter Two', 'ਦੂਜਾ ਅਧਿਆਇ'], ['Chapter Three', 'ਤੀਜਾ ਅਧਿਆਇ'], ['Chapter Four', 'ਚੌਥਾ ਅਧਿਆਇ']]

// a chapter title with its accent word in script: "Ik <em>Lohri</em> Mulaqat" (no accent, or not found: plain title)
const Headline = ({ title, accent }) => {
  const at = accent ? title.indexOf(accent) : -1
  if (at < 0) return title
  return <>{title.slice(0, at)}<em>{accent}</em>{title.slice(at + accent.length)}</>
}

// scalloped, paper-edged polaroid frame (viewBox 0 0 W H), like a postage stamp
const scallop = (w, h, r) => {
  const nx = Math.round(w / (2 * r))
  const ny = Math.round(h / (2 * r))
  const sx = w / nx
  const sy = h / ny
  let d = `M0,0`
  for (let i = 0; i < nx; i++) d += ` a${sx / 2},${r * 0.7} 0 0 0 ${sx},0`
  for (let i = 0; i < ny; i++) d += ` a${r * 0.7},${sy / 2} 0 0 0 0,${sy}`
  for (let i = 0; i < nx; i++) d += ` a${sx / 2},${r * 0.7} 0 0 0 ${-sx},0`
  for (let i = 0; i < ny; i++) d += ` a${r * 0.7},${sy / 2} 0 0 0 0,${-sy}`
  return d + 'Z'
}
const FRAME = scallop(250, 300, 7)

const Leaves = () => (
  <svg className="story__leaves" viewBox="0 0 60 14" aria-hidden="true">
    <path d="M2,7 Q14,0 26,7 Q14,14 2,7Z M10,7 H30" fill="none" stroke="currentColor" strokeWidth=".9" />
    <path d="M12,7 Q18,3 24,7" fill="none" stroke="currentColor" strokeWidth=".7" opacity=".7" />
  </svg>
)

export default function Story() {
  const root = useRef(null)
  const stage = useRef(null)
  const path = useRef(null)
  const trail = useRef(null)
  const svg = useRef(null)
  const heart = useRef(null)
  const items = wedding.story

  // Build the winding path through the measured node positions, and let a heart travel along it as you scroll.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const st = stage.current
        const nodes = [...st.querySelectorAll('.story__node')]
        const head = st.querySelector('.story__head')
        const hx = gsap.quickTo(heart.current, 'x', { duration: 0.35, ease: 'power3' })
        const hy = gsap.quickTo(heart.current, 'y', { duration: 0.35, ease: 'power3' })
        let L = 0
        let H = 0
        let ys = []
        let pts = []

        const build = () => {
          const r = st.getBoundingClientRect()
          const W = r.width
          H = r.height
          pts = nodes.map((n) => {
            const b = n.getBoundingClientRect()
            return [b.left - r.left + b.width / 2, b.top - r.top + b.height / 2]
          })
          const hb = head.getBoundingClientRect().bottom - r.top
          const bulge = W * 0.8
          let d = `M${-12},${hb - 6} C${W * 0.42},${hb + 24} ${W * 1.04},${pts[0][1] - 190} ${pts[0][0]},${pts[0][1]}`
          for (let i = 1; i < pts.length; i++) {
            const [x0, y0] = pts[i - 1]
            const [x1, y1] = pts[i]
            const s = i % 2 ? -1 : 1
            const dy = y1 - y0
            d += ` C${x0 + s * bulge},${y0 + dy * 0.16} ${x1 + s * bulge},${y1 - dy * 0.16} ${x1},${y1}`
          }
          svg.current.setAttribute('viewBox', `0 0 ${W} ${H}`)
          for (const p of [path.current, trail.current]) p.setAttribute('d', d)
          L = trail.current.getTotalLength()
          trail.current.style.strokeDasharray = `${L}`
          update()
        }

        // y of the point at length l (path y grows along the path, so search by bisection)
        const lenForY = (target) => {
          let lo = 0
          let hi = L
          for (let i = 0; i < 22; i++) {
            const mid = (lo + hi) / 2
            if (trail.current.getPointAtLength(mid).y < target) lo = mid
            else hi = mid
          }
          return hi
        }
        function update() {
          if (!L) return
          const r = st.getBoundingClientRect()
          const target = Math.min(H, Math.max(0, window.innerHeight * 0.52 - r.top))
          const len = lenForY(target)
          const p = trail.current.getPointAtLength(len)
          trail.current.style.strokeDashoffset = `${L - len}`
          hx(p.x)
          hy(p.y)
          nodes.forEach((n, i) => n.classList.toggle('is-lit', pts[i] && p.y >= pts[i][1] - 4))
        }

        build()
        const ro = new ResizeObserver(build)
        ro.observe(st)
        const trig = ScrollTrigger.create({ trigger: st, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: build })
        document.fonts?.ready.then(build)

        // each chapter unfolds quickly, one element after another
        items.forEach((_, i) => {
          const card = st.querySelector(`.story__chapter:nth-of-type(${i + 1})`)
          if (!card) return
          const pol = card.querySelector('.story__polaroid')
          const photo = card.querySelector('.story__photo')
          const trigger = { trigger: card, start: 'top 80%', once: true }
          // the card opens like a hinged print standing up from flat, then its photo develops
          gsap.set(pol, { transformPerspective: 900, transformOrigin: '50% 100%' })
          gsap.timeline({ scrollTrigger: trigger, onComplete: () => pol.classList.add('is-open') })
            .from(pol, { rotateX: -82, y: 40, autoAlpha: 0, duration: 0.85, ease: 'back.out(1.35)' })
            .from(card.querySelectorAll('.story__corner'), { scale: 0, duration: 0.3, stagger: 0.07, ease: 'back.out(3)' }, 0.5)
            .fromTo(photo, { clipPath: 'inset(50% 0 50% 0)', filter: 'brightness(2.2) saturate(0) blur(5px)' }, { clipPath: 'inset(0% 0 0% 0)', filter: 'brightness(1) saturate(1) blur(0px)', duration: 1, ease: 'power2.out', clearProps: 'filter,clipPath' }, 0.35)
            .from(card.querySelector('.story__chap'), { autoAlpha: 0, y: 8, duration: 0.5 }, 0.9)
          gsap.from(card.querySelectorAll('.story__headline, .story__text'), {
            y: 30, autoAlpha: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out', delay: 0.25,
            scrollTrigger: trigger,
          })
        })
        gsap.from(st.querySelectorAll('.story__head > *'), { y: 24, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: st, start: 'top 80%', once: true } })

        return () => { ro.disconnect(); trig.kill() }
      })
      // reduced motion: show the whole path, heart at the end
      mm.add('(prefers-reduced-motion: reduce)', () => {
        stage.current.classList.add('is-static')
      })
    },
    { scope: root },
  )

  return (
    <section id="story" ref={root} className="story chap" data-chapter data-dwell="6">
      <svg width="0" height="0" aria-hidden="true">
        <defs><path id="story-frame" d={FRAME} /></defs>
      </svg>
      {/* a garland of keepsakes across the top: roses on a gold thread, with blank polaroids, sealed letters, hearts,
          pearls and a bell pegged to it (painted, its paper cut away) */}
      <img className="story__header art-sway" data-art="drop" src="/story-header.webp" alt="" width="1000" height="240" decoding="async" loading="lazy" aria-hidden="true" />
      <div className="story__stage" ref={stage}>
        <svg className="story__path" ref={svg} aria-hidden="true">
          <path ref={path} className="story__dash" fill="none" />
          <path ref={trail} className="story__trail" fill="none" />
        </svg>
        <span className="story__heart" ref={heart} aria-hidden="true"><i /></span>

        <header className="story__head">
          <p className="story__eyebrow"><span className="gurmukhi">ਮੁੱਠੀ ਭਰ ਪਲ</span><span>A handful of moments</span></p>
          <h2 className="story__title">Our Story</h2>
          <p className="story__sub">every love story is beautiful, but ours is our favourite</p>
          <img className="punjabi-dhol" src="/punjabi/dhol.webp" alt="" width="900" height="900" loading="lazy" decoding="async" aria-hidden="true" />
        </header>

        {items.map((s, i) => (
          <article className="story__chapter" key={s.year} style={{ '--tilt': `${i % 2 ? 2.2 : -2.2}deg` }}>
            <div className="story__polaroid">
              <svg className="story__frame" viewBox="0 0 250 300" aria-hidden="true">
                <use href="#story-frame" fill="#fbf3df" stroke="#d8c08a" strokeWidth=".8" />
                <path d="M16,16 H234 V232 H16Z" fill="none" stroke="#c9a24d" strokeWidth=".7" strokeDasharray="1.4 3" />
              </svg>
              <div className="story__photo">
                <Photo src={s.photo} focus={s.focus} alt={s.title} fallback={<span className="story__ph" aria-hidden="true"><i className="gurmukhi">{CHAPTERS[i]?.[1]?.[0] ?? '✦'}</i></span>} />
                <b className="story__corner story__corner--tl" /><b className="story__corner story__corner--tr" />
                <b className="story__corner story__corner--bl" /><b className="story__corner story__corner--br" />
              </div>
              <p className="story__chap">{CHAPTERS[i]?.[0] ?? `Chapter ${i + 1}`}</p>
            </div>
            <h3 className="story__headline"><Headline title={s.title} accent={s.accent} /></h3>
            <p className="story__text">{s.text}</p>
            <div className="story__node" aria-hidden="true">
              <Leaves /><span className="story__ring"><svg viewBox="0 0 24 24"><path d="M12 20.5C5 15 3 11.5 3 8.6A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 9 2C21 11.5 19 15 12 20.5Z" /></svg></span><Leaves />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
