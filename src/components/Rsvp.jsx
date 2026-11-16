import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import Mandala from './Mandala'
import FloralSides from './FloralSides'
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
  const [step, setStep] = useState(0)
  const [stamping, setStamping] = useState(false)
  const [name, setName] = useState('')
  useReveal(root)

  // the stage rises slowly into place as you arrive; the flowers at the edges drift a little against it
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo('.rsvp__stage-img', { yPercent: 6 }, { yPercent: -2, ease: 'none', scrollTrigger: { trigger: '.rsvp__stage', start: 'top bottom', end: 'bottom bottom', scrub: true } })
        gsap.fromTo('.rsvp .floral-sides', { y: -30 }, { y: 30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.from('.rsvp__card', { scale: 0.94, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.rsvp__card', start: 'top 88%', once: true } })
      })
    },
    { scope: root },
  )

  const toggleEvent = (id) =>
    setEvents((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]))

  const onSubmit = (e) => {
    e.preventDefault()
    if (step < 2) return setStep(step + 1)
    if (stamping) return
    const form = new FormData(e.currentTarget)
    const note = String(form.get('note') ?? '').trim()
    setStamping(true)
    setTimeout(() => finish(note), 900)
  }

  const finish = (note) => {
    setStamping(false)
    const eventNames = wedding.events.filter((ev) => events.includes(ev.id)).map((ev) => ev.name)

    if (wedding.rsvp.whatsapp) {
      const text = buildMessage({ name, attending, guests, events: eventNames, note })
      window.open(`https://wa.me/${wedding.rsvp.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    }
    setSentName(name.trim().split(' ')[0])
    setStep(0)
  }

  return (
    <section id="rsvp" ref={root} className="section sky-bg rsvp chap" data-chapter="stop">
      <FloralSides tiles={3} head={false} />
      <Mandala className="rsvp__mandala" />
      <SectionTitle eyebrow="ਤੁਹਾਡਾ ਜਵਾਬ" title="Kindly Reply" />
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
              <ol className="rsvp__steps" aria-label={`Step ${step + 1} of 3`}>
                {['You', 'Celebrations', 'Blessings'].map((t, k) => (
                  <li key={t} className={k === step ? 'is-now' : k < step ? 'is-done' : ''}>
                    <span>{k < step ? '✓' : k + 1}</span>
                    {t}
                  </li>
                ))}
                <i className="rsvp__thread" style={{ '--p': step / 2 }} aria-hidden="true" />
              </ol>

              <div className="rsvp__step" hidden={step !== 0} key={`s0-${step === 0}`}>
                <label className="field">
                  <span className="field__label">Your name</span>
                  <input name="name" required={step === 0} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="e.g. Simran Kaur" />
                </label>
                <fieldset className="field">
                  <legend className="field__label">Will you be joining us?</legend>
                  <div className="toggle">
                    {CHOICES.map((c) => (
                      <button key={c.value} type="button" className={`toggle__option${attending === c.value ? ' is-active' : ''}`} aria-pressed={attending === c.value} onClick={() => setAttending(c.value)}>
                        {attending === c.value && <motion.span layoutId="rsvp-toggle" className="toggle__pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                        <span className="toggle__label">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="rsvp__step" hidden={step !== 1} key={`s1-${step === 1}`}>
                {attending === 'yes' ? (
                  <>
                    <div className="field">
                      <span className="field__label" id="guests-label">Number of guests</span>
                      <div className="stepper" role="group" aria-labelledby="guests-label">
                        <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Fewer guests">−</button>
                        <output>{guests}</output>
                        <button type="button" onClick={() => setGuests((g) => Math.min(10, g + 1))} aria-label="More guests">+</button>
                      </div>
                    </div>
                    <fieldset className="field">
                      <legend className="field__label">Which celebrations?</legend>
                      <div className="chips">
                        {wedding.events.map((ev) => {
                          const on = events.includes(ev.id)
                          return (
                            <motion.button key={ev.id} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleEvent(ev.id)} whileTap={{ scale: 0.94 }}>
                              {ev.name}
                            </motion.button>
                          )
                        })}
                      </div>
                    </fieldset>
                  </>
                ) : (
                  <p className="rsvp__sorry">We will miss you dearly. One last step — send your blessings.</p>
                )}
              </div>

              <div className="rsvp__step" hidden={step !== 2} key={`s2-${step === 2}`}>
                <label className="field">
                  <span className="field__label">A note for the couple (optional)</span>
                  <textarea name="note" rows={3} placeholder="Blessings, song requests, dietary needs…" />
                </label>
                <button type="submit" className={`seal${stamping ? ' is-stamping' : ''}`} aria-label="Send RSVP">
                  <span className="seal__ring" aria-hidden="true" />
                  <span className="seal__disc"><b className="gurmukhi">ਸ਼ੁਭ</b><small>Seal &amp; send</small></span>
                </button>
              </div>

              <div className="rsvp__nav">
                {step > 0 && <button type="button" className="rsvp__back" onClick={() => setStep(step - 1)}>← Back</button>}
                {step < 2 && <button type="submit" className="btn rsvp__submit">Continue <span aria-hidden="true">→</span></button>}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <div className="rsvp__stage" aria-hidden="true">
        <motion.img
          className="rsvp__stage-img"
          src="/rsvp-stage.webp"
          alt=""
          width="1491"
          height="1055"
          loading="lazy"
          decoding="async"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.2, ease }}
        />
        <div className="rsvp__couple">
          <motion.img
            src="/couple-back.webp"
            alt=""
            width="1106"
            height="1422"
            loading="lazy"
            decoding="async"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.4, delay: 0.5, ease }}
          />
        </div>
      </div>
    </section>
  )
}
