import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useReveal } from '../lib/useReveal'
import { gsap, useGSAP } from '../lib/gsap'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import Mandala from './Mandala'
import FloralSides from './FloralSides'
import './TornPaper.css'
import './Rsvp.css'

const ease = [0.22, 1, 0.36, 1]

const CHOICES = [
  { value: 'yes', label: 'Joyfully accept' },
  { value: 'no', label: 'Regretfully decline' },
]

function buildMessage({ name, attending }) {
  return [`RSVP — ${wedding.bride.name} & ${wedding.groom.name}`, `Name: ${name}`, `Attending: ${attending === 'yes' ? 'Yes' : 'Sadly no'}`].join('\n')
}

export default function Rsvp() {
  const root = useRef(null)
  const [attending, setAttending] = useState('yes')
  const [sentName, setSentName] = useState(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(false)
  const nameInput = useRef(null)
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

  // one screen: name and accept/decline, then the reply is sent
  const onSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setNameError(true)
      nameInput.current?.focus()
      return
    }
    if (wedding.rsvp.whatsapp) {
      const text = buildMessage({ name, attending })
      window.open(`https://wa.me/${wedding.rsvp.whatsapp}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
    }
    setSentName(name.trim().split(' ')[0])
  }

  return (
    <section id="rsvp" ref={root} className="section sky-bg rsvp chap" data-chapter="stop">
      <FloralSides tiles={3} head={false} />
      <Mandala className="rsvp__mandala" />
      <SectionTitle eyebrow="ਤੁਹਾਡਾ ਜਵਾਬ" title="Kindly Reply" />
      <p className="rsvp__deadline reveal">{wedding.rsvp.deadline}</p>

      <div className="rsvp__wrap reveal">
      <div className="rsvp__card torn-shadow">
        <div className="torn-sides">
        <div className="torn rsvp__sheet">
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
              <header className="rsvp__head">
                <p className="rsvp__head-pa gurmukhi">ਤੁਸੀਂ</p>
                <h3 className="rsvp__head-title">You</h3>
                <span className="rsvp__rule" aria-hidden="true" />
              </header>

              <div className="rsvp__step">
                <label className="field">
                  <span className="field__label">Your name</span>
                  <input ref={nameInput} name="name" value={name} aria-invalid={nameError || undefined} onChange={(e) => { setName(e.target.value); setNameError(false) }} autoComplete="name" placeholder="e.g. Simran Kaur" />
                  {nameError && <span className="field__error" role="alert">Add your name to send your reply</span>}
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

              <div className="rsvp__nav">
                <button type="submit" className="btn rsvp__submit">Send reply <span aria-hidden="true">→</span></button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        </div>
        </div>
      </div>
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
