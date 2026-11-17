import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './DesktopFrame.css'

// The phone's screen is a true 390×844 viewport (iPhone 14/15 size), so the site lays out exactly
// as it does on a phone. The whole phone is then scaled down to fit shorter desktop windows.
const SCREEN_W = 390
const SCREEN_H = 844
const BEZEL = 12
const MARGIN = 40

const PETALS = Array.from({ length: 14 }, (_, i) => i)

// One backdrop per look of the site; the site tells us which one is on screen (src/lib/FrameScene.jsx)
const SCENES = ['night', 'sky', 'blush']

export default function DesktopFrame() {
  const frame = useRef(null)
  const [scale, setScale] = useState(1)
  const [scene, setScene] = useState('night')

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== location.origin || e.source !== frame.current?.contentWindow) return
      if (e.data?.type === 'utsavy-scene' && SCENES.includes(e.data.scene)) setScene(e.data.scene)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Same page, same ?guest= etc., plus the embed flag so it renders the site rather than another frame
  const src = (() => {
    const p = new URLSearchParams(location.search)
    p.set('embed', '1')
    return `${location.pathname}?${p}${location.hash}`
  })()

  useLayoutEffect(() => {
    document.documentElement.classList.add('is-framed')
    return () => document.documentElement.classList.remove('is-framed')
  }, [])

  useLayoutEffect(() => {
    const fit = () => {
      const h = SCREEN_H + BEZEL * 2
      const w = SCREEN_W + BEZEL * 2
      setScale(Math.min(1, (window.innerHeight - MARGIN * 2) / h, (window.innerWidth - MARGIN * 2) / w))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // Scrolling over the backdrop scrolls the phone, so nobody has to aim at it first
  useEffect(() => {
    const onWheel = (e) => {
      const win = frame.current?.contentWindow
      if (!win || frame.current.contains(e.target)) return
      e.preventDefault()
      win.dispatchEvent(new win.WheelEvent('wheel', {
        deltaX: e.deltaX, deltaY: e.deltaY, deltaMode: e.deltaMode, bubbles: true, cancelable: true,
      }))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="dframe" data-scene={scene}>
      {SCENES.map((s) => (
        <div key={s} className={`dframe__bg dframe__bg--${s}${s === scene ? ' is-on' : ''}`} aria-hidden="true" />
      ))}
      <div className="dframe__wash" aria-hidden="true" />
      <div className="dframe__petals" aria-hidden="true">
        {PETALS.map((i) => <i key={i} style={{ '--i': i }} />)}
      </div>

      <div className="dframe__phone" style={{ '--s': scale, '--w': `${SCREEN_W}px`, '--h': `${SCREEN_H}px`, '--b': `${BEZEL}px` }}>
        <span className="dframe__btn dframe__btn--action" />
        <span className="dframe__btn dframe__btn--up" />
        <span className="dframe__btn dframe__btn--down" />
        <span className="dframe__btn dframe__btn--power" />
        <div className="dframe__screen">
          <iframe
            ref={frame}
            src={src}
            title="Wedding invitation"
            allow="autoplay; fullscreen"
            onLoad={() => frame.current?.focus()}
          />
          <span className="dframe__island" aria-hidden="true" />
          <span className="dframe__home" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
