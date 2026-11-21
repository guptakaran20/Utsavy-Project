import { useEffect, useState } from 'react'
import { gsap } from './gsap'

// Follows which of the three looks is on screen: 'night' (plane intro), 'sky' (gurdwara hero), 'blush' (the rest).
// The browser's own bar (theme-color) takes that colour, so a phone never shows a maroon strip over the blush
// pages; and inside the desktop phone frame, the frame's backdrop follows it too.
const embedded = typeof window !== 'undefined' && window.self !== window.top
const BAR = { night: '#efc4c8', sky: '#efc4c8', blush: '#f6dcd8' }

export default function FrameScene({ introDone }) {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    if (!introDone) return
    // The blush sections sit tucked under the pinned hero, and the hero's walk-in ends by fading the
    // hero away (Hero.jsx). So follow that fade itself: sky while the hero shows, blush once it's gone.
    // Reads GSAP's inline opacity only, so no layout work per frame.
    const hero = document.querySelector('.hero')
    if (!hero) return
    const check = () => {
      const o = parseFloat(hero.style.opacity)
      setPastHero(hero.style.visibility === 'hidden' || (!Number.isNaN(o) && o < 0.5))
    }
    gsap.ticker.add(check)
    return () => gsap.ticker.remove(check)
  }, [introDone])

  const scene = !introDone ? 'night' : pastHero ? 'blush' : 'sky'

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BAR[scene])
    // Android Chrome paints its bottom navigation bar in the page's background colour, so the page background follows
    // the scene too (index.css, html[data-scene]); otherwise a blush strip shows under the night sky and the gurdwara
    document.documentElement.dataset.scene = scene
    if (embedded) window.parent.postMessage({ type: 'utsavy-scene', scene }, location.origin)
  }, [scene])

  return null
}
