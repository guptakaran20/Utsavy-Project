import { useEffect, useState } from 'react'
import { gsap } from './gsap'

// When the site runs inside the desktop phone frame, tell the frame which of the three looks is
// on screen so its backdrop can follow: 'night' (plane intro), 'sky' (gurdwara hero), 'blush' (the rest).
const embedded = typeof window !== 'undefined' && window.self !== window.top

export default function FrameScene({ introDone }) {
  const [pastHero, setPastHero] = useState(false)

  useEffect(() => {
    if (!embedded || !introDone) return
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
    if (embedded) window.parent.postMessage({ type: 'utsavy-scene', scene }, location.origin)
  }, [scene])

  return null
}
