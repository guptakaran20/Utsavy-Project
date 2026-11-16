import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { dhol } from '../lib/dhol'
import './MusicToggle.css'

export default function MusicToggle({ visible }) {
  const [on, setOn] = useState(dhol.on)
  useEffect(() => dhol.subscribe(setOn), [])
  if (!dhol.available) return null
  const toggle = () => dhol.toggle()

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className={`music${on ? ' is-on' : ''}`}
          onClick={toggle}
          aria-pressed={on}
          aria-label={on ? 'Mute dhol' : 'Play dhol'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <span className="music__bars" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="music__label">{on ? 'Dhol on' : 'Dhol'}</span>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
