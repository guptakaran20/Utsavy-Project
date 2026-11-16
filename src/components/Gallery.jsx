import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import Photo from './Photo'
import FloralSides from './FloralSides'
import './Gallery.css'

const PER_PAGE = 0.85 // screens of scrolling for each page turn

const Lotus = () => (
  <svg className="book__lotus" viewBox="0 0 100 70" aria-hidden="true">
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

// "Moments": a book that opens when you reach it, then turns one page for every stretch of scrolling.
export default function Gallery() {
  const root = useRef(null)
  const track = useRef(null)
  const [page, setPage] = useState(0)
  const items = wedding.gallery
  const flips = items.length + 1 // cover + every photo page; the closing page stays
  const [vh, setVh] = useState(0)

  useLayoutEffect(() => {
    const set = () => setVh(window.innerHeight)
    set()
    window.addEventListener('resize', set)
    return () => window.removeEventListener('resize', set)
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const leaves = gsap.utils.toArray('.bkleaf', root.current).reverse() // cover first, then page 1, 2 ...
        let tl = null
        tl = gsap.timeline({
          defaults: { ease: 'power1.inOut' },
          scrollTrigger: {
            trigger: track.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            onUpdate: (self) => tl && setPage(Math.max(0, Math.min(flips, Math.floor(self.progress * tl.duration() - 0.95) + 1))),
          },
        })
        gsap.set('.book', { rotationY: 14, rotationX: 4, x: '-6%' })
        tl.to('.book', { rotationY: 0, rotationX: 0, x: '0%', duration: 0.6, ease: 'power2.out' }, 0)
        leaves.slice(0, flips).forEach((bkleaf, i) => {
          const at = i * 1 + 0.15
          tl.to(bkleaf, { rotationY: -168, duration: 0.8, ease: 'power2.inOut' }, at)
            .to(bkleaf.querySelector('.bkleaf__shade'), { opacity: 0.55, duration: 0.8, ease: 'none' }, at)
            .to(bkleaf, { autoAlpha: 0, duration: 0.05, ease: 'none' }, at + 0.8)
        })
        tl.to({}, { duration: 0.35 }) // rest on the last page
      })
    },
    { scope: root, dependencies: [vh] },
  )

  const last = items.length
  return (
    <section id="gallery" ref={root} className="gallery chap" data-chapter data-dwell="8">
      <div ref={track} className="gallery__track" style={vh ? { '--pages': flips, '--per': PER_PAGE } : undefined}>
        <div className="gallery__stage sky-bg">
          <FloralSides tiles={3} head={false} className="gallery__florals" />
          <header className="gallery__head">
            <p className="gallery__eyebrow gurmukhi">ਯਾਦਾਂ</p>
            <h2 className="gallery__title">Moments</h2>
          </header>

          <div className="book" role="group" aria-label="Photo book of our moments">
            <div className="book__edge" aria-hidden="true" />
            <div className="book__leaves">
              {/* closing page sits at the very back and is revealed last */}
              <article className="bkleaf bkleaf--end" style={{ zIndex: 1 }}>
                <div className="bkleaf__face bkleaf__front page page--end">
                  <Lotus />
                  <p className="page__pa gurmukhi">ਅਗਲੇ ਸਫ਼ੇ, ਇਕੱਠੇ</p>
                  <h3 className="page__title">And the best<br />is yet to come</h3>
                  <p className="page__text">Come write the next page with us, at the wedding.</p>
                  <p className="page__tag">{wedding.hashtag}</p>
                </div>
              </article>

              {[...items].reverse().map((g, r) => {
                const i = items.length - 1 - r
                return (
                  <article className="bkleaf" key={g.caption} style={{ zIndex: 2 + r }}>
                    <div className="bkleaf__face bkleaf__front page">
                      <div className="page__photo">
                        <Photo src={g.photo} alt={g.caption} fallback={<div className="page__ph" aria-hidden="true"><Lotus /><span>{wedding.bride.name[0]} &amp; {wedding.groom.name[0]}</span></div>} />
                      </div>
                      <p className="page__pa gurmukhi">{g.gurmukhi}</p>
                      <h3 className="page__title">{g.caption}</h3>
                      <p className="page__place">{g.place}</p>
                      <p className="page__text">{g.text}</p>
                      <span className="page__no">{i + 1}</span>
                      <i className="bkleaf__shade" aria-hidden="true" />
                    </div>
                    <div className="bkleaf__face bkleaf__back" aria-hidden="true"><span>{i + 1}</span></div>
                  </article>
                )
              })}

              <article className="bkleaf bkleaf--cover" style={{ zIndex: 2 + items.length }}>
                <div className="bkleaf__face bkleaf__front cover">
                  <span className="cover__band" aria-hidden="true" />
                  <div className="cover__in">
                    <Lotus />
                    <p className="cover__pa gurmukhi">ਯਾਦਾਂ</p>
                    <h3 className="cover__title">Our Moments</h3>
                    <p className="cover__names">{wedding.bride.name} &amp; {wedding.groom.name}</p>
                  </div>
                  <i className="bkleaf__shade" aria-hidden="true" />
                </div>
                <div className="bkleaf__face bkleaf__back" aria-hidden="true" />
              </article>
            </div>
          </div>

          <p className="gallery__count" aria-live="polite">{page === 0 ? 'Scroll to open the book' : page > last ? 'The end, for now' : `Page ${page} of ${last}`}</p>
        </div>
      </div>
    </section>
  )
}
