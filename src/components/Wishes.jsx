import { useContext, useEffect, useRef, useState } from 'react'
import { fitLen } from '../lib/fitText'
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { LenisContext } from '../lib/smoothScroll'
import { foldNote } from '../lib/foldNote'
import { guestName, hasGuestName } from '../lib/guest'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import './PhulkariDivider.css'
import FloralSides from './FloralSides'
import './Wishes.css'

const KEY = `ashirwad:${wedding.hashtag}`
const SHOWN = 6 // cards on the wall; every other wish waits in the gaagar for "Pull a chit"
const POT = '/wishes/gaagar.webp'
const CARD = '/wishes/card.webp'
// wishes are signed with the guest's name from their invitation link; without one they're from "A loved one"
const signer = hasGuestName() ? guestName() : ''

// true once the image has loaded, so the hand-drawn fallbacks stay until the painted art is in public/wishes
function useArt(src) {
  const [ok, setOk] = useState(false)
  useEffect(() => {
    const img = new Image()
    img.onload = () => setOk(true)
    img.src = src
  }, [src])
  return ok
}

// Shagun gaagar: a brass pot full of folded blessings, the newest pinned around it as phulkari cards.
// Guests fold theirs in (it flies into the pot), and anyone can pull a chit out at random.
export default function Wishes() {
  const root = useRef(null)
  const [mine, setMine] = useState([])
  const [folding, setFolding] = useState(false)
  const lenis = useContext(LenisContext)
  const [text, setText] = useState('')
  const [sent, setSent] = useState('')
  const [pulled, setPulled] = useState(null)
  const potArt = useArt(POT)
  const cardArt = useArt(CARD)
  useReveal(root)

  useEffect(() => {
    try { setMine(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { /* private mode: the gaagar still works for this visit */ }
  }, [])

  const wishes = [...mine, ...wedding.wishes]
  const shown = wishes.slice(0, SHOWN)

  // cards fly out of the gaagar to their places the first time the wall scrolls in
  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // the gaagar is set down on the page as it scrolls in: it rises, lands with a little settle, and its glow comes up
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.timeline({ scrollTrigger: { trigger: '.gaagar__pot', start: 'top 80%', once: true } })
          .from('.gaagar__body', { y: 70, scale: 0.8, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.6)', transformOrigin: '50% 92%' })
          .from('.gaagar__glow', { scale: 0.4, autoAlpha: 0, duration: 1.1, ease: 'power2.out' }, 0.2)
          .fromTo('.gaagar__body', { rotation: 0 }, { rotation: 3, duration: 0.12, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.75)
      })
      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 761px)', () => {
        gsap.from('.gcard', {
          x: (i, el) => (el.dataset.side === 'l' ? 160 : -160),
          y: 40, scale: 0.4, rotation: 0, autoAlpha: 0,
          stagger: 0.12, duration: 0.9, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: '.gaagar__stage', start: 'top 70%', once: true },
        })
      })
      mm.add('(prefers-reduced-motion: no-preference) and (max-width: 760px)', () => {
        gsap.from('.gcard', { y: 30, autoAlpha: 0, stagger: 0.08, duration: 0.6, ease: 'power3.out', scrollTrigger: { trigger: '.gaagar__cards', start: 'top 90%', once: true } })
      })
    },
    { scope: root },
  )

  // the note folds into a little square, is carried up to the gaagar and dropped in; the pot wobbles, the card appears
  const sendNote = contextSafe((form, w, onLanded) => {
    const mouth = root.current.querySelector('.gaagar__mouth')
    if (prefersReducedMotion() || !mouth) return onLanded()
    setFolding(true)
    foldNote({
      form, text: w.text, signer: signer || '',
      mouth,
      scrollToY: () => {
        const pot = root.current.querySelector('.gaagar__pot')
        const y = pot.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.18
        if (lenis.current) lenis.current.scrollTo(y, { duration: 1.4 })
        else window.scrollTo({ top: y, behavior: 'smooth' })
      },
      onLanded: () => {
        gsap.fromTo('.gaagar__pot', { rotation: 0 }, { rotation: 4, duration: 0.09, yoyo: true, repeat: 5, ease: 'sine.inOut', transformOrigin: '50% 90%' })
        setFolding(false)
        onLanded()
      },
    })
  })

  const submit = (e) => {
    e.preventDefault()
    const w = { name: signer || 'A loved one', text: text.trim() }
    if (!w.text || folding) return
    const form = e.currentTarget
    closeChit(true)
    sendNote(form, w, () => {
      setText('')
      const next = [w, ...mine]
      setMine(next)
      try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
      setSent('Your blessing is in the gaagar ♥')
      setTimeout(() => setSent(''), 4000)
    })
  }

  // a different chit each time, rising out of the pot and unfolding; it folds back in by itself after a while,
  // when tapped, or the moment a guest sends their own (so the gaagar is always in view for the drop)
  const closeTimer = useRef(0)
  const closeChit = contextSafe((instant) => {
    clearTimeout(closeTimer.current)
    const el = root.current?.querySelector('.gaagar__chit')
    if (!el || instant || prefersReducedMotion()) return setPulled(null)
    gsap.timeline({ onComplete: () => setPulled(null) })
      .to(el, { scaleY: 0.12, scaleX: 0.5, duration: 0.35, ease: 'power2.in' })
      .to(el, { y: 120, autoAlpha: 0, duration: 0.35, ease: 'power2.in' })
  })
  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const pull = contextSafe(() => {
    const pool = wishes.filter((w) => w !== pulled)
    const w = pool[Math.floor(Math.random() * pool.length)] || wishes[0]
    setPulled(w)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => closeChit(), 7000)
    if (prefersReducedMotion()) return
    requestAnimationFrame(() => {
      gsap.timeline()
        .fromTo('.gaagar__chit', { y: 120, scaleY: 0.12, scaleX: 0.5, autoAlpha: 0 }, { y: 0, scaleX: 0.5, autoAlpha: 1, duration: 0.45, ease: 'power2.out' })
        .to('.gaagar__chit', { scaleY: 1, scaleX: 1, duration: 0.5, ease: 'back.out(1.6)' })
    })
  })

  const card = (w, i) => (
    <li
      className={`gcard${cardArt ? ' gcard--art' : ''}`}
      key={`${wishes.length - i}-${w.name}`}
      data-side={i % 2 ? 'r' : 'l'}
      style={{ '--tilt': `${[-3, 2.5, 1.5, -2, -1, 3][i % 6]}deg` }}
    >
      <p className="gcard__text">“{w.text}”</p>
      <span className="gcard__name" style={fitLen(w.name, 12)}>{w.name}</span>
    </li>
  )

  return (
    <section id="wishes" ref={root} className="section sky-bg wishes chap" data-chapter data-dwell="8">
      <FloralSides tiles={6} head={false} />
      <SectionTitle eyebrow="ਅਸੀਸਾਂ" title="Ashirwad Gaagar" />
      <p className="wishes__sub reveal">Fold a blessing into the shagun gaagar. The couple will read every one.</p>
      <img className="punjabi-vignette reveal" src="/punjabi/giddha-pair.webp" alt="" width="900" height="900" loading="lazy" decoding="async" aria-hidden="true" />

      <div className="gaagar__stage">
        <ul className="gaagar__cards" aria-label="Blessings from family and friends">
          {shown.map(card)}
        </ul>

        <div className="gaagar__center">
          <div className="gaagar__pot">
            {/* a warm glow behind the pot that slowly breathes */}
            <span className="gaagar__glow" aria-hidden="true" />
            {!potArt && [1, 2, 3].map((n) => <span key={n} className={`gaagar__peek gaagar__peek--${n}`} aria-hidden="true" />)}
            {/* the pot itself sways gently on its base; a band of light sweeps across the brass now and then
                (the shine is masked by the painting, so it only ever lights the pot, never the paper around it) */}
            <div className="gaagar__body">
              {potArt
                ? <img src={POT} alt="A brass gaagar wrapped in phulkari, full of folded blessings" width="800" height="800" decoding="async" loading="lazy" />
                : <PotFallback />}
              {potArt && <span className="gaagar__shine" style={{ '--pot': `url(${POT})` }} aria-hidden="true" />}
            </div>
            {/* little gold glints twinkling over the rolled blessings at the mouth */}
            {[[34, 9, 0], [62, 4, 0.9], [74, 17, 1.7], [46, 21, 2.4]].map(([x, y, d]) => (
              <span key={x} className="gaagar__spark" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${d}s` }} aria-hidden="true" />
            ))}
            <span className="gaagar__mouth" aria-hidden="true" />
          </div>
          <p className="gaagar__count">{wishes.length} blessings inside</p>
          <button type="button" className="btn btn--maroon" onClick={pull}>{pulled ? 'Pull another chit' : 'Pull a chit'}</button>

          {pulled && (
            <div className={`gaagar__chit gcard${cardArt ? ' gcard--art' : ''}`} role="status" onClick={() => closeChit()}>
              <button type="button" className="gaagar__close" onClick={(e) => { e.stopPropagation(); closeChit() }} aria-label="Fold the chit back into the gaagar">×</button>
              <p className="gcard__text">“{pulled.text}”</p>
              <span className="gcard__name" style={fitLen(pulled.name, 12)}>{pulled.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* a blessing note: written on ruled lines, sealed with a little gaagar, then folded into the pot */}
      <form className={`wnote reveal${folding ? ' is-folding' : ''}`} onSubmit={submit}>
        <span className="wnote__seal" aria-hidden="true">
          {potArt ? <img src={POT} alt="" width="800" height="800" decoding="async" loading="lazy" /> : <PotFallback />}
        </span>
        <p className="wnote__eyebrow">ਅਸੀਸ ਲਿਖੋ</p>
        <h3 className="wnote__title">Fold in your blessing</h3>

        <label className="wnote__field">
          <span className="wnote__label">Write your blessing</span>
          <textarea id="wish-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="May your home always be full of laughter…" rows={3} maxLength={160} required />
          <span className="wnote__count" aria-hidden="true">{text.length}/160</span>
        </label>
        {signer && <p className="wnote__sign">— with love, {signer}</p>}

        <button type="submit" className="wnote__send">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h11M16 13l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Drop in the gaagar
        </button>
        <p className="wnote__sent" role="status">{sent}</p>
      </form>
    </section>
  )
}

// a simple brass gaagar until the painted one is saved to public/wishes/gaagar.webp
function PotFallback() {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="A brass gaagar full of folded blessings">
      <ellipse cx="100" cy="52" rx="38" ry="9" fill="#b08a52" />
      <path d="M68 52 Q66 70 74 76 L126 76 Q134 70 132 52 Z" fill="#d8b77c" />
      <path d="M74 76 Q22 96 30 140 Q40 186 100 188 Q160 186 170 140 Q178 96 126 76 Z" fill="#e3c58e" />
      <path d="M36 118 Q100 136 164 118 L166 146 Q100 166 34 146 Z" fill="#e9b8bf" />
      <path d="M40 132 l10 -8 10 8 -10 8z M70 136 l10 -8 10 8 -10 8z M100 138 l10 -8 10 8 -10 8z M130 136 l10 -8 10 8 -10 8z" fill="#fffaf2" />
      <path d="M55 132 l5 -4 5 4 -5 4z M85 136 l5 -4 5 4 -5 4z M115 136 l5 -4 5 4 -5 4z M145 132 l5 -4 5 4 -5 4z" fill="#c9737f" />
      <ellipse cx="100" cy="52" rx="30" ry="6" fill="#7a5a30" />
    </svg>
  )
}
