import { useContext, useRef, useState } from 'react'
import { gsap, ScrollTrigger, Observer, useGSAP } from '../lib/gsap'
import { LenisContext } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import Photo from './Photo'
import FloralSides from './FloralSides'
import './Gallery.css'

// a soft ease-in-out for the page glides into and out of the doorway, so the guest is carried, not yanked
const glide = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const HOLD = 2.6 // seconds each photo stays before the next one slides in by itself

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
// When the section arrives the page glides it into place and holds still (like the Punjab clock), and the photos
// slide up one after another on a timer; a swipe, wheel or arrow key brings the next one sooner. After the last
// photo the page is handed back. Each change is a short timed animation, never tied to the scroll position.
export default function Gallery() {
  const root = useRef(null)
  const track = useRef(null)
  const api = useRef({})
  const lenisRef = useContext(LenisContext)
  const [phase, setPhase] = useState('idle') // idle | playing | done
  const items = wedding.gallery
  const n = items.length

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = root.current
        const photos = gsap.utils.toArray('.jh__photo', el)
        const caps = gsap.utils.toArray('.jh__cap', el)
        const dots = gsap.utils.toArray('.jh__dot', el)
        const no = el.querySelector('.jh__no')
        const html = document.documentElement
        let cur = 0
        let tl = null
        let auto = null
        let safety = null
        let obs = null
        let locked = false
        let done = false
        let holdY = null
        const pin = () => { if (locked && holdY != null && Math.abs(window.scrollY - holdY) > 1) window.scrollTo(0, holdY) }
        let calmUntil = 0 // gestures are ignored until then, so trackpad / swipe momentum cannot skip photos

        gsap.set(photos, { yPercent: 100, zIndex: 1, visibility: 'hidden' })
        gsap.set(photos[0], { yPercent: 0, zIndex: 2, visibility: 'visible' })
        gsap.set(caps, { autoAlpha: 0 })
        gsap.set(caps[0], { autoAlpha: 1 })

        const mark = (i) => {
          dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.setAttribute('aria-current', k === i ? 'true' : 'false') })
          no.textContent = String(i + 1).padStart(2, '0')
        }

        // the new photo slides over the old one (from below going forward, from above going back) and settles from a
        // slight zoom; the old one drifts a little the other way; the caption swaps once the photo has mostly landed
        function goTo(i, after) {
          if (i === cur || i < 0 || i >= n || tl?.isActive()) return false
          const dir = i > cur ? 1 : -1
          const from = photos[cur]
          const to = photos[i]
          const capOut = caps[cur]
          const capIn = caps[i]
          cur = i
          mark(i)
          photos.forEach((p) => { if (p !== from && p !== to) gsap.set(p, { visibility: 'hidden', zIndex: 1 }) })
          gsap.set(from, { zIndex: 2 })
          gsap.set(to, { zIndex: 3, visibility: 'visible', yPercent: 100 * dir })
          gsap.fromTo(to.firstElementChild, { scale: 1.08 }, { scale: 1, duration: 1.8, ease: 'power2.out', overwrite: true })
          tl = gsap.timeline({
            defaults: { ease: 'power3.inOut' },
            onComplete: () => { gsap.set(from, { visibility: 'hidden' }); after?.() },
          })
          tl.to(to, { yPercent: 0, duration: 0.9 }, 0)
            .to(from, { yPercent: -14 * dir, duration: 0.9 }, 0)
            .to(capOut, { autoAlpha: 0, y: -10 * dir, duration: 0.28, ease: 'power2.in' }, 0)
            .fromTo(capIn, { autoAlpha: 0, y: 16 * dir }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.55)
          return true
        }

        const schedule = () => {
          auto?.kill()
          if (!locked) return
          auto = gsap.delayedCall(cur >= n - 1 ? 1.8 : HOLD, () => (cur >= n - 1 ? release(0) : next()))
        }
        function next() {
          if (tl?.isActive()) return
          auto?.kill()
          if (cur >= n - 1) { if (locked) release(1); return }
          goTo(cur + 1, schedule)
        }
        const calm = () => performance.now() < calmUntil
        const gestureNext = () => { if (calm() || tl?.isActive()) return; calmUntil = performance.now() + 1200; next() }
        const gesturePrev = () => { if (calm() || tl?.isActive()) return; calmUntil = performance.now() + 1200; prev() }
        function prev() {
          if (tl?.isActive()) return
          auto?.kill()
          if (cur <= 0) { if (locked) release(-1); return } // let a guest who scrolls back up leave
          goTo(cur - 1, schedule)
        }
        const onKey = (e) => {
          if (['ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next() }
          if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev() }
        }

        function open() {
          if (done || locked) return
          locked = true
          calmUntil = performance.now() + 1100 // the scroll that brought the guest here is still rolling
          setPhase('playing')
          html.classList.add('is-locked') // the auto tour waits while this is set
          const y = track.current.getBoundingClientRect().top + window.scrollY
          const lenis = lenisRef.current
          // glide the doorway into place, then hold the page there: Lenis stops, and anything that still moves the
          // page (a programmatic scroll, iOS rubber-banding) is put straight back
          const hold = () => {
            if (!locked) return
            lenis?.stop()
            holdY = y
            window.addEventListener('scroll', pin, { passive: true })
          }
          if (lenis) {
            lenis.start()
            lenis.scrollTo(y, { duration: 1.5, easing: glide, lock: true, force: true, onComplete: hold })
          } else {
            window.scrollTo({ top: y, behavior: 'smooth' })
            setTimeout(hold, 1500)
          }
          // wheel down / swipe up = next; wheelSpeed -1 makes wheel and touch agree on direction
          obs = Observer.create({ target: window, type: 'wheel,touch', wheelSpeed: -1, tolerance: 12, preventDefault: true, onUp: gestureNext, onDown: gesturePrev })
          window.addEventListener('keydown', onKey)
          schedule()
          safety = gsap.delayedCall(n * (HOLD + 1.5) + 8, () => release(0)) // never leave a guest stuck
        }

        // move: 1 = carry on down the page, -1 = back up, 0 = stay
        function release(move) {
          if (!locked) return
          locked = false
          auto?.kill()
          safety?.kill()
          obs?.kill()
          obs = null
          window.removeEventListener('keydown', onKey)
          window.removeEventListener('scroll', pin)
          holdY = null
          if (cur >= n - 1) done = true
          setPhase(done ? 'done' : 'idle')
          html.classList.remove('is-locked')
          const lenis = lenisRef.current
          lenis?.start()
          if (move && lenis) {
            const y = track.current.getBoundingClientRect().top + window.scrollY
            // going on: land exactly on the next page's top (its padding keeps its heading clear of the notch), not part-way into it
            const next = move > 0 ? track.current.parentElement?.nextElementSibling ?? track.current.closest('section')?.nextElementSibling : null
            const target = next ? next.getBoundingClientRect().top + window.scrollY : y + move * window.innerHeight * 0.7
            lenis.scrollTo(target, { duration: 1.6, easing: glide })
          }
        }

        // the dots and a tap on the doorway work any time, also after the lock has opened (for a second look)
        api.current = {
          dot: (i) => { auto?.kill(); goTo(i, locked ? schedule : undefined) },
          tap: () => { if (locked) next(); else goTo((cur + 1) % n) },
        }

        // the still paper's top/bottom edges melt into the page's running flowers only while the section slides in or out
        const paper = el.querySelector('.gallery__paper')
        const edgeIn = gsap.fromTo(paper, { '--gt': '160px' }, { '--gt': '0px', ease: 'none', scrollTrigger: { trigger: track.current, start: 'top bottom', end: 'top top', scrub: true } })
        const edgeOut = gsap.fromTo(paper, { '--gb': '0px' }, { '--gb': '160px', ease: 'none', scrollTrigger: { trigger: track.current, start: 'bottom bottom', end: 'bottom top', scrub: true } })
        // going down the page, the section takes over once its top is a third of the way up the screen
        const st = ScrollTrigger.create({ trigger: track.current, start: 'top 35%', onEnter: open })

        return () => {
          if (locked) {
            obs?.kill()
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('scroll', pin)
            html.classList.remove('is-locked')
            lenisRef.current?.start()
          }
          auto?.kill()
          safety?.kill()
          tl?.kill()
          st.kill()
          edgeIn.scrollTrigger?.kill()
          edgeOut.scrollTrigger?.kill()
          api.current = {}
        }
      })
    },
    { scope: root },
  )

  const hint = { idle: 'Scroll to see our moments', playing: 'Swipe for the next one', done: wedding.hashtag }[phase]

  return (
    <section id="gallery" ref={root} className="gallery chap" data-chapter data-dwell="8">
      <div ref={track} className="gallery__track">
        <div className="gallery__stage">
          {/* still paper and flowers behind the doorway; they cross-fade with the page's own running flowers at both ends */}
          <div className="gallery__paper sky-bg" aria-hidden="true">
            <FloralSides tiles={3} head={false} className="gallery__florals" />
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
                  <p className="jh__pa gurmukhi">{g.gurmukhi}</p>
                  <h3 className="jh__title">{g.caption}</h3>
                  <p className="jh__place">{g.place}</p>
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
              <p className="gallery__count" aria-live="polite">{hint}</p>
            </div>
          </div>

          {/* reduced motion: no held doorway, just the photos one after another */}
          <ul className="jh__list">
            {items.map((g) => (
              <li key={g.caption}>
                <div className="jh__listphoto"><Photo src={g.photo} focus={g.focus} alt={g.caption} fallback={<Placeholder />} /></div>
                <p className="jh__pa gurmukhi">{g.gurmukhi}</p>
                <h3 className="jh__title">{g.caption}</h3>
                <p className="jh__place">{g.place}</p>
                <p className="jh__text">{g.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
