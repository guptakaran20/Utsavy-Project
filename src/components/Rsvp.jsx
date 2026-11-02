import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import Mandala from './Mandala'
import './Rsvp.css'

const ease = [0.22, 1, 0.36, 1]

const CHOICES = [
  { value: 'yes', label: 'Joyfully accept' },
  { value: 'no', label: 'Regretfully decline' },
]

function buildMessage({ name, attending, guests, events, note }) {
  const lines = [`RSVP — ${wedding.bride.name} & ${wedding.groom.name}`, `Name: ${name}`]
  if (attending === 'yes') {
    lines.push(`Attending: Yes (${guests} ${guests === 1 ? 'guest' : 'guests'})`)
    lines.push(`Events: ${events.join(', ')}`)
  } else {
    lines.push('Attending: Sadly no')
  }
  if (note) lines.push(`Message: ${note}`)
  return lines.join('\n')
}

export default function Rsvp() {
  const root = useRef(null)
  const [attending, setAttending] = useState('yes')
  const [guests, setGuests] = useState(1)
  const [events, setEvents] = useState(() => wedding.events.map((e) => e.id))
  const [sentName, setSentName] = useState(null)
  useReveal(root)

  const toggleEvent = (id) =>
    setEvents((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const onSubmit = (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name')).trim()
    const note = String(form.get('note') ?? '').trim()
    const eventNames = wedding.events.filter((ev) => events.includes(ev.id)).map((ev) => ev.name)

    if (wedding.rsvp.whatsapp) {
      const text = buildMessage({ name, attending, guests, events: eventNames, note })
      window.open(`https://wa.me/${wedding.rsvp.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    }
    setSentName(name.split(' ')[0])
  }

  return (
    <section id="rsvp" ref={root} className="section section--dark rsvp">
      <Mandala className="rsvp__mandala" />
      <SectionTitle eyebrow="ਤੁਹਾਡਾ ਜਵਾਬ" title="Kindly Reply" light />
      <p className="rsvp__deadline reveal">{wedding.rsvp.deadline}</p>

      <div className="rsvp__card reveal">
        <AnimatePresence mode="wait" initial={false}>
          {sentName ? (
            <motion.div
              key="thanks"
              className="rsvp__thanks"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease }}
            >
              <svg className="rsvp__check" viewBox="0 0 64 64" aria-hidden="true">
                <motion.circle
                  cx="32"
                  cy="32"
                  r="29"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, ease }}
                />
                <motion.path
                  d="M20 33l8 8 16-17"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.7, ease }}
                />
              </svg>
              <p className="rsvp__thanks-pa gurmukhi">ਧੰਨਵਾਦ</p>
              <h3 className="rsvp__thanks-title">Shukriya, {sentName}!</h3>
              <p className="rsvp__thanks-text">
                {attending === 'yes'
                  ? 'We can’t wait to celebrate with you. Get your dancing shoes ready!'
                  : 'You’ll be missed — thank you for letting us know, and for your blessings.'}
              </p>
              <button type="button" className="rsvp__again" onClick={() => setSentName(null)}>
                Edit response
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="rsvp__form"
              onSubmit={onSubmit}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease }}
            >
              <label className="field">
                <span className="field__label">Your name</span>
                <input name="name" required autoComplete="name" placeholder="e.g. Simran Kaur" />
              </label>

              <fieldset className="field">
                <legend className="field__label">Will you be joining us?</legend>
                <div className="toggle">
                  {CHOICES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      className={`toggle__option${attending === c.value ? ' is-active' : ''}`}
                      aria-pressed={attending === c.value}
                      onClick={() => setAttending(c.value)}
                    >
                      {attending === c.value && (
                        <motion.span
                          layoutId="rsvp-toggle"
                          className="toggle__pill"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="toggle__label">{c.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <AnimatePresence initial={false}>
                {attending === 'yes' && (
                  <motion.div
                    className="rsvp__extra"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease }}
                  >
                    <div className="field">
                      <span className="field__label" id="guests-label">
                        Number of guests
                      </span>
                      <div className="stepper" role="group" aria-labelledby="guests-label">
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          aria-label="Fewer guests"
                        >
                          −
                        </button>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.output
                            key={guests}
                            initial={{ y: 12, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -12, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                          >
                            {guests}
                          </motion.output>
                        </AnimatePresence>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.min(10, g + 1))}
                          aria-label="More guests"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <fieldset className="field">
                      <legend className="field__label">Which celebrations?</legend>
                      <div className="chips">
                        {wedding.events.map((ev) => {
                          const on = events.includes(ev.id)
                          return (
                            <motion.button
                              key={ev.id}
                              type="button"
                              className={`chip${on ? ' is-on' : ''}`}
                              aria-pressed={on}
                              onClick={() => toggleEvent(ev.id)}
                              whileTap={{ scale: 0.94 }}
                            >
                              {ev.name}
                            </motion.button>
                          )
                        })}
                      </div>
                    </fieldset>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="field">
                <span className="field__label">A note for the couple (optional)</span>
                <textarea name="note" rows={3} placeholder="Blessings, song requests, dietary needs…" />
              </label>

              <motion.button type="submit" className="btn rsvp__submit" whileTap={{ scale: 0.97 }}>
                Send RSVP
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
