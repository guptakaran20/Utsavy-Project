import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import FloralSides from './FloralSides'
import './Wishes.css'

const KEY = `ashirwad:${wedding.hashtag}`

// Ashirwad wall: blessing cards pegged to a phulkari-coloured string, gently swaying; guests can add their own.
export default function Wishes() {
  const root = useRef(null)
  const [mine, setMine] = useState([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sent, setSent] = useState('')
  useReveal(root)

  useEffect(() => {
    try { setMine(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { /* private mode: the wall still works for this visit */ }
  }, [])

  const wishes = [...mine, ...wedding.wishes]

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.wcard', { y: -40, rotation: (i) => (i % 2 ? 7 : -7), autoAlpha: 0, transformOrigin: '50% 0', stagger: 0.14, duration: 0.9, ease: 'elastic.out(1, .6)', scrollTrigger: { trigger: '.wishes__line', start: 'top 85%', once: true } })
      })
    },
    { scope: root, dependencies: [wishes.length] },
  )

  const submit = (e) => {
    e.preventDefault()
    const w = { name: name.trim(), text: text.trim() }
    if (!w.name || !w.text) return
    const next = [w, ...mine]
    setMine(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
    setName(''); setText(''); setSent('Thank you, your blessing is on the wall ♥')
    setTimeout(() => setSent(''), 4000)
  }

  return (
    <section id="wishes" ref={root} className="section sky-bg wishes chap" data-chapter data-dwell="8">
      <FloralSides tiles={4} head={false} />
      <SectionTitle eyebrow="ਅਸੀਸਾਂ" title="Ashirwad Wall" />
      <p className="wishes__sub reveal">Leave a few words for the couple. Every wish is a blessing.</p>

      <div className="wishes__line" aria-hidden="true" />
      <ul className="wishes__row">
        {wishes.map((w, i) => (
          <li className="wcard" key={`${w.name}-${i}`} style={{ '--tilt': `${(i % 3 - 1) * 1.6}deg`, '--d': `${(i % 4) * 0.35}s` }}>
            <span className="wcard__peg" aria-hidden="true" />
            <p className="wcard__text">{w.text}</p>
            <span className="wcard__name">{w.name}</span>
          </li>
        ))}
      </ul>

      <form className="wishes__form reveal" onSubmit={submit}>
        <h3 className="wishes__form-title">Write a wish</h3>
        <label className="sr-only" htmlFor="wish-name">Your name</label>
        <input id="wish-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={40} required />
        <label className="sr-only" htmlFor="wish-text">Your blessing</label>
        <textarea id="wish-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Your blessing for the couple" rows={3} maxLength={240} required />
        <button type="submit" className="btn">Send blessing</button>
        <p className="wishes__sent" role="status">{sent}</p>
      </form>
    </section>
  )
}
