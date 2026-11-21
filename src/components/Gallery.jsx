import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import Photo from './Photo'
import FloralSides from './FloralSides'
import './Gallery.css'

const HOLD = 4 // seconds each photo stays before the next one slides in by itself

const Lotus = () => (
  <svg className="jh__lotus" viewBox="0 0 100 70" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M50 8c8 10 8 24 0 40-8-16-8-30 0-40z" />
      <path d="M50 48C34 46 20 36 14 20c16 0 28 8 36 28z" />
      <path d="M50 48c16-2 30-12 36-28-16 0-28 8-36 28z" />
      <path d="M50 50C28 52 12 46 4 34c12-2 28 2 46 16z" opacity=".7" />
      <path d="M50 50c22 2 38-4 46-16-12-2-28 2-46 16z" opacity=".7" />
      <path d="M30 60h40" />
    </g>
  </svg>
)

const Placeholder = () => (
  <div className="jh__ph" aria-hidden="true"><Lotus /><span>{wedding.bride.name[0]} &amp; {wedding.groom.name[0]}</span></div>
)

// "Moments": a blossom-wreathed pink doorway, left open, with one photo at a time inside it.
// The photos slide across one after another on a timer (looping, like a gallery) while the doorway is on screen;
// a sideways swipe, a tap, a dot or an arrow key changes them sooner. The page is never held: an up / down swipe
// scrolls on to the next section as usual.
export default function Gallery() {
  const root = useRef(null)

  // Get the photos and the doorway fully downloaded AND decoded while the guest is still a few screens away, so no photo
  // slides in blank (a phone decodes a big JPEG on demand otherwise, and under memory pressure it can come up empty)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      el.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; img.decode?.().catch(() => {}) })
    }, { rootMargin: '250% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const track = useRef(null)
  const api = useRef({})
  const [swiped, setSwiped] = useState(false) // once the guest has swiped, the hint gives way to the hashtag
  const items = wedding.gallery
  const n = items.length

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current
        const win = el.querySelector('.jh__window')
        const photos = gsap.utils.toArray('.jh__photo', el)
        const caps = gsap.utils.toArray('.jh__cap', el)
        const dots = gsap.utils.toArray('.jh__dot', el)
        const no = el.querySelector('.jh__no')
        let cur = 0
        let tl = null
        let auto = null
        let inView = false

        gsap.set(photos, { xPercent: 100, zIndex: 1, visibility: 'hidden' })
        gsap.set(photos[0], { xPercent: 0, zIndex: 2, visibility: 'visible' })
        gsap.set(caps, { autoAlpha: 0 })
        gsap.set(caps[0], { autoAlpha: 1 })

        const mark = (i) => {
          dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.setAttribute('aria-current', k === i ? 'true' : 'false') })
          no.textContent = String(i + 1).padStart(2, '0')
        }

        // the new photo slides across over the old one (from the right going forward, from the left going back) and
        // settles from a slight zoom; the old one drifts a little the other way; the caption swaps as the photo lands
        function goTo(i, dir) {
          i = (i + n) % n
          if (tl?.isActive()) tl.progress(1) // a swipe mid-slide finishes that slide at once and is not lost
          if (i === cur) return false
          dir = dir ?? (i > cur ? 1 : -1)
          const from = photos[cur]
          const to = photos[i]
          const capOut = caps[cur]
          const capIn = caps[i]
          cur = i
          mark(i)
          photos.forEach((p) => { if (p !== from && p !== to) gsap.set(p, { visibility: 'hidden', zIndex: 1 }) })
          gsap.set(from, { zIndex: 2 })
          gsap.set(to, { zIndex: 3, visibility: 'visible', xPercent: 100 * dir })
          gsap.fromTo(to.firstElementChild, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: 'power2.out', overwrite: true })
          tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => { gsap.set(from, { visibility: 'hidden', xPercent: 0 }); schedule() },
          })
          tl.to(to, { xPercent: 0, duration: 0.8 }, 0)
            .to(from, { xPercent: -22 * dir, duration: 0.8 }, 0)
            .to(capOut, { autoAlpha: 0, x: -14 * dir, duration: 0.26, ease: 'power2.in' }, 0)
            .fromTo(capIn, { autoAlpha: 0, x: 18 * dir }, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.45)
          return true
        }
        const next = () => goTo(cur + 1, 1)
        const prev = () => goTo(cur - 1, -1)

        // autoplay: like a gallery, the next photo comes in by itself every few seconds (looping), but only while the
        // doorway is on screen and the tab is visible
        function schedule() {
          auto?.kill()
          auto = null
          if (inView && !document.hidden) auto = gsap.delayedCall(HOLD, next)
        }
        const onVis = () => schedule()
        document.addEventListener('visibilitychange', onVis)
        const view = ScrollTrigger.create({
          trigger: track.current, start: 'top 65%', end: 'bottom 35%',
          onToggle: (self) => { inView = self.isActive; schedule() },
        })

        // swipe left / right on the doorway changes the photo; an up / down swipe is left to the page (touch-action:
        // pan-y), so the guest simply scrolls on to the next section
        let sx = 0
        let sy = 0
        let down = false
        let moved = false
        const onDown = (e) => { down = true; moved = false; sx = e.clientX; sy = e.clientY }
        const onMove = (e) => {
          if (!down) return
          if (Math.abs(e.clientX - sx) > 8 || Math.abs(e.clientY - sy) > 8) moved = true
        }
        const onUp = (e) => {
          if (!down) return
          down = false
          const dx = e.clientX - sx
          const dy = e.clientY - sy
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            if (dx < 0 ? next() : prev()) setSwiped(true)
          }
        }
        const onCancel = () => { down = false }
        win.addEventListener('pointerdown', onDown)
        win.addEventListener('pointermove', onMove)
        win.addEventListener('pointerup', onUp)
        win.addEventListener('pointercancel', onCancel)
        const onKey = (e) => {
          if (!inView) return
          if (e.key === 'ArrowRight') next()
          if (e.key === 'ArrowLeft') prev()
        }
        window.addEventListener('keydown', onKey)

        // a tap (not the end of a swipe) on the doorway and the dots work any time
        api.current = {
          dot: (i) => goTo(i),
          tap: () => { if (!moved) next() },
          next,
          prev,
        }

        // the still paper's top/bottom edges melt into the page's running flowers only while the section slides in or out
        const paper = el.querySelector('.gallery__paper')
        const edgeIn = gsap.fromTo(paper, { '--gt': '160px' }, { '--gt': '0px', ease: 'none', scrollTrigger: { trigger: track.current, start: 'top bottom', end: 'top top', scrub: true } })
        const edgeOut = gsap.fromTo(paper, { '--gb': '0px' }, { '--gb': '160px', ease: 'none', scrollTrigger: { trigger: track.current, start: 'bottom bottom', end: 'bottom top', scrub: true } })

        return () => {
          auto?.kill()
          tl?.kill()
          view.kill()
          document.removeEventListener('visibilitychange', onVis)
          win.removeEventListener('pointerdown', onDown)
          win.removeEventListener('pointermove', onMove)
          win.removeEventListener('pointerup', onUp)
          win.removeEventListener('pointercancel', onCancel)
          window.removeEventListener('keydown', onKey)
          edgeIn.scrollTrigger?.kill()
          edgeOut.scrollTrigger?.kill()
          api.current = {}
        }
      })
    },
    { scope: root },
  )

  const hint = swiped ? wedding.hashtag : 'Swipe for more'

  return (
    <section id="gallery" ref={root} className="gallery chap" data-chapter data-dwell="8">
      <div ref={track} className="gallery__track">
        <div className="gallery__stage">
          {/* still paper and flowers behind the doorway; they cross-fade with the page's own running flowers at both ends */}
          <div className="gallery__paper sky-bg" aria-hidden="true">
            <FloralSides tiles={3} head={false} className="gallery__florals" />
          </div>
          {/* a canopy of blossom branches with gold lanterns, bells and pearl strands hung across the top (painted, its
              paper cut away); the lanterns glow */}
          <div className="gallery__header art-sway" data-art="drop" aria-hidden="true">
            <img src="/moments-header.webp" alt="" width="1000" height="235" decoding="async" />
            <span className="art-flame gallery__lantern" style={{ left: '27.2%', top: '46%' }} />
            <span className="art-flame gallery__lantern" style={{ left: '72.6%', top: '46%', animationDelay: '-1.2s' }} />
          </div>
          <header className="gallery__head">
            <p className="gallery__eyebrow gurmukhi">ਯਾਦਾਂ</p>
            <h2 className="gallery__title">Moments</h2>
          </header>

          <div className="jh" role="group" aria-label="Photos of our moments, shown through a blossom doorway">
            <div className="jh__window" onClick={() => api.current.tap?.()}>
              <div className="jh__pane">
                {items.map((g) => (
                  <div className="jh__photo" key={g.caption}>
                    <Photo src={g.photo} focus={g.focus} alt={g.caption} loading="eager" fallback={<Placeholder />} />
                  </div>
                ))}
              </div>
              <img className="jh__img jh__img--open" src="/door/door-open.webp" alt="" width="900" height="1350" decoding="async" aria-hidden="true" />
            </div>

            <div className="jh__caps">
              {items.map((g, i) => (
                <div className="jh__cap" key={g.caption} style={i === 0 ? undefined : { opacity: 0 }}>
                  <h3 className="jh__title">{g.caption}</h3>
                  <p className="jh__text">{g.text}</p>
                </div>
              ))}
            </div>

            <div className="jh__meta">
              <p className="jh__num" aria-hidden="true"><b className="jh__no">01</b><span>of {String(n).padStart(2, '0')}</span></p>
              <div className="jh__dots">
                {items.map((g, i) => (
                  <button type="button" key={g.caption} className={`jh__dot${i === 0 ? ' is-on' : ''}`} aria-label={`Photo ${i + 1}: ${g.caption}`} onClick={() => api.current.dot?.(i)} />
                ))}
              </div>
              {/* a small "‹ Swipe for more ›" pill under the doorway (never on the photo). Its arrows are real previous / next
                  buttons (they looked like buttons, so guests tapped them); once the guest has moved on a photo, the words
                  give way to the hashtag but the arrows stay */}
              <div className="gallery__count">
                <span className={`jh__swipe${swiped ? ' is-used' : ''}`}>
                  <button type="button" className="jh__arrow" aria-label="Previous photo" onClick={() => { if (api.current.prev?.()) setSwiped(true) }}>
                    <svg viewBox="0 0 10 16" aria-hidden="true"><path d="M8 2 2 8l6 6" /></svg>
                  </button>
                  <span className="jh__swipe-text" aria-live="polite">{hint}</span>
                  <button type="button" className="jh__arrow" aria-label="Next photo" onClick={() => { if (api.current.next?.()) setSwiped(true) }}>
                    <svg viewBox="0 0 10 16" aria-hidden="true"><path d="M2 2l6 6-6 6" /></svg>
                  </button>
                </span>
              </div>
            </div>
          </div>

          {/* the foot of the doorway: fallen blossom and rose petals, a pair of bridal jutti, blossom branches either side
              (painted, its paper cut away so it lies straight on the page) */}
          <img className="gallery__footer" data-art="rise" src="/moments-footer.webp" alt="" width="1000" height="168" loading="lazy" decoding="async" aria-hidden="true" />

          {/* reduced motion: no held doorway, just the photos one after another */}
          <ul className="jh__list">
            {items.map((g) => (
              <li key={g.caption}>
                <div className="jh__listphoto"><Photo src={g.photo} focus={g.focus} alt={g.caption} fallback={<Placeholder />} /></div>
                <h3 className="jh__title">{g.caption}</h3>
                <p className="jh__text">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
