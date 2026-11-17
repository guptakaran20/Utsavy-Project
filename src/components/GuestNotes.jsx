import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ScrollTrigger, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import FloralSides from './FloralSides'
import './TornPaper.css'
import './GuestNotes.css'

const GURMUKHI_DIGITS = ['੧', '੨', '੩', '੪', '੫', '੬']
const PER_NOTE = 0.8 // screens of scrolling each note stays on the page
const ease = [0.22, 1, 0.36, 1]

// direction-aware: scrolling down, the next note rises from below and the old one lifts away; scrolling up, the reverse
const slide = {
  enter: (dir) => ({ opacity: 0, y: dir * 70 }),
  center: { opacity: 1, y: 0 },
  exit: (dir) => ({ opacity: 0, y: dir * -70 }),
}
const fade = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }

function NoteBody({ note }) {
  return (
    <div className="note">
      <h3 className="note__title">{note.title}</h3>
      <span className="note__rule" aria-hidden="true" />
      <p className="note__text">{note.text}</p>
    </div>
  )
}

export default function GuestNotes() {
  const root = useRef(null)
  const track = useRef(null)
  const st = useRef(null)
  const cur = useRef(0)
  const [state, setState] = useState({ i: 0, dir: 1 })
  const [vh, setVh] = useState(0)
  const reduced = useReducedMotion()
  const scrollTo = useScrollTo()
  const notes = wedding.notes
  const n = notes.length
  useReveal(root)

  // The section holds still (CSS sticky) inside a track with one stretch of scroll per note
  useLayoutEffect(() => {
    const measure = () => setVh((p) => (p === window.innerHeight ? p : window.innerHeight))
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  useEffect(() => { if (vh) ScrollTrigger.refresh() }, [vh])

  useGSAP(
    () => {
      st.current = ScrollTrigger.create({
        trigger: track.current,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * PER_NOTE * (n - 1))}`,
        onUpdate: (self) => {
          const k = Math.min(n - 1, Math.floor(self.progress * n))
          if (k !== cur.current) {
            const dir = k > cur.current ? 1 : -1
            cur.current = k
            setState({ i: k, dir })
          }
        },
      })
    },
    { scope: root },
  )

  const go = (k) => {
    const s = st.current
    if (s) scrollTo(s.start + ((k + 0.5) / n) * (s.end - s.start))
  }
  const { i, dir } = state
  const extra = Math.round(vh * PER_NOTE * (n - 1))

  return (
    <div className="notes-track" ref={track} style={{ height: vh ? vh + extra : undefined }}>
      <section id="notes" ref={root} className="section sky-bg notes chap" data-chapter data-dwell="7">
        <FloralSides tiles={6} />
        <SectionTitle eyebrow="ਮਹਿਮਾਨਾਂ ਲਈ" title="Good to Know" />

        <div className="notes__stage">
          {/* the numbers run down the side, and the filled one is the note on the page */}
          <ol className="notes__rail" aria-label="Notes">
            {notes.map((note, k) => (
              <li key={note.title}>
                <button type="button" className={`rail-dot gurmukhi${k === i ? ' is-on' : ''}`} aria-current={k === i ? 'step' : undefined} aria-label={note.title} onClick={() => go(k)}>
                  {GURMUKHI_DIGITS[k]}
                </button>
              </li>
            ))}
          </ol>

          <div className="notes__cards" aria-live="polite">
            <div className="notes__card torn-shadow">
              <div className="torn-sides">
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.article
                    key={i}
                    className="torn"
                    custom={dir}
                    variants={reduced ? fade : slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: reduced ? 0.2 : 0.38, ease }}
                  >
                    <NoteBody note={notes[i]} />
                  </motion.article>
                </AnimatePresence>
              </div>
            </div>
            {/* every note stacked invisibly, so the stage keeps the tallest note's height and nothing jumps */}
            <div className="notes__card notes__ghost torn" aria-hidden="true" inert>
              {notes.map((note) => <NoteBody key={note.title} note={note} />)}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
