import { useEffect, useState } from 'react'
import { dhol } from '../lib/dhol'
import './MusicToggle.css'

// The button pops in (CSS, .music keyframes) a moment after take-off. Plain CSS rather than Framer Motion keeps
// that library out of the first download: only the sections further down the page use it.
export default function MusicToggle({ visible }) {
  const [on, setOn] = useState(dhol.on)
  useEffect(() => dhol.subscribe(setOn), [])
  if (!dhol.available || !visible) return null
  const toggle = () => dhol.toggle()

  return (
    <button
      type="button"
      className={`music${on ? ' is-on' : ''}`}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute dhol' : 'Play dhol'}
    >
      <span className="music__bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="music__label">{on ? 'Dhol on' : 'Dhol'}</span>
    </button>
  )
}
