import { useEffect, useState } from 'react'

// Pictures load in the order a guest meets them. On a slow phone every picture on the page used to start at the same
// moment and share the bandwidth, so on 3G the hero opened bare and its gurdwara painting arrived 15 s later.
//   1. hero:  the gurdwara painting has the connection to itself (Hero.jsx calls markHeroArt once it is in)
//   2. near:  then the pictures just below it (side flowers, invitation card, the couple's frames and photos);
//             they read useHeroArt() and only get their src once it is true, and the CSS backgrounds among them are
//             switched off under html.art-hold, which this module sets and clears
//   3. lower: once those are in, the lower sections (countdown down) are drawn (App.jsx, useLowerArt), so their
//             backgrounds and pictures come last
// Each stage also opens by itself after a few seconds, so a stuck download never holds the page back.
const HOLD_MAX = 12000 // hero painting, from page start
const NEAR_MAX = 6000 // pictures below the hero, from when they start

const stage = (name) => {
  let done = typeof document === 'undefined'
  const subs = new Set()
  const mark = () => {
    if (done) return
    done = true
    subs.forEach((f) => f())
    subs.clear()
  }
  const on = (fn) => {
    if (done) { fn(); return () => {} }
    subs.add(fn)
    return () => subs.delete(fn)
  }
  const use = () => {
    const [ok, setOk] = useState(done)
    useEffect(() => on(() => setOk(true)), [])
    return ok
  }
  return { mark, on, use, ready: () => done, name }
}

const hero = stage('hero')
const lower = stage('lower')

export const markHeroArt = hero.mark
export const heroArtReady = hero.ready
export const onHeroArt = hero.on
export const useHeroArt = hero.use
export const onLowerArt = lower.on
export const useLowerArt = lower.use

if (typeof document !== 'undefined') {
  document.documentElement.classList.add('art-hold')
  setTimeout(hero.mark, HOLD_MAX)

  hero.on(() => {
    document.documentElement.classList.remove('art-hold')
    // the stage-2 pictures get their src in React's next commit: collect them a moment later, then wait for them
    // (a timer, not animation frames: those stop in a background tab, and this must still finish there)
    setTimeout(() => {
      const pending = [...document.images].filter((img) => img.getAttribute('src') && !img.complete && img.loading !== 'lazy')
      const done = (img) => new Promise((r) => { img.addEventListener('load', r, { once: true }); img.addEventListener('error', r, { once: true }) })
      Promise.race([Promise.all(pending.map(done)), new Promise((r) => setTimeout(r, NEAR_MAX))]).then(lower.mark)
    }, 100)
  })
}
