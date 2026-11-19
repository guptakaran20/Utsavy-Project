import { useContext, useLayoutEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { absTop, lockedTimeline } from '../lib/lockedTimeline'
import { LenisContext } from '../lib/smoothScroll'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import './Contacts.css'

const initials = (n) => n.replace(/^(S\.|Sardar|Sardarni)\s+/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('')
// a number still waiting to be filled in ("+91 98XXX XXXXX") is not printed
const isReal = (phone) => !/x/i.test(phone)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
)
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1Z" /><path d="M9.5 9.5c0 2.5 2.5 5 5 5l1-1.2-1.8-.9-.8.7a4 4 0 0 1-2-2l.7-.8-.9-1.8Z" fill="currentColor" stroke="none" /></svg>
)

// One person, set like a family on the Our Families page: a short cord, a round seal with their initials,
// the name, who they are to the wedding, and a button to call them.
function Person({ c }) {
  const tel = c.phone.replace(/[^\d+]/g, '')
  return (
    <li className="contact">
      <span className="contact__cord" aria-hidden="true" />
      <span className="contact__seal" aria-hidden="true"><span>{initials(c.name)}</span></span>
      <h3 className="contact__name">{c.name}</h3>
      <span className="contact__label">{c.label}</span>
      {isReal(c.phone) && <span className="contact__num">{c.phone}</span>}
      <div className="contact__actions">
        <a className="contact__btn" href={`tel:${tel}`} aria-label={`Call ${c.name}`}><PhoneIcon /> Call</a>
        {c.whatsapp && (
          <a className="contact__btn contact__btn--wa" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${c.name}`}><ChatIcon /></a>
        )}
      </div>
    </li>
  )
}

function Group({ title, people, tone }) {
  return (
    <div className={`contacts__group contacts__group--${tone}`}>
      <h4 className="contacts__group-title"><span>{title}</span></h4>
      <ul className="contacts__list">
        {people.map((c) => <Person c={c} key={c.label} />)}
      </ul>
    </div>
  )
}

export default function Contacts() {
  const root = useRef(null)
  const lenis = useContext(LenisContext)
  const { bride, groom } = wedding
  useReveal(root)

  // The damask at the top of this page must carry on the Wishes page's damask in step, or its 120px tiles restart
  // and draw a line where the pages meet. Wishes tiles from its own top, and this page tucks 2px under its foot,
  // so shift this page's tiles by the part of a tile Wishes ends on (kept current as Wishes changes height).
  useLayoutEffect(() => {
    const el = root.current
    const prev = el?.previousElementSibling
    if (!prev) return undefined
    const sync = () => el.style.setProperty('--damask-y', `${-((prev.getBoundingClientRect().height - 2) % 120)}px`)
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(prev)
    return () => ro.disconnect()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const env = q('.contacts__env')[0]
        const card = q('.contacts__card')[0]
        const envelope = q('.contacts__envelope')[0]

        // The card starts tucked inside the sealed envelope at the foot of the stage. Whatever part of it would
        // hang below the envelope is clipped away, so only the envelope's mouth ever shows it.
        const sunk = () => card.offsetHeight - envelope.offsetHeight + 40
        const tuck = { y: sunk() }
        const place = () => gsap.set(card, { y: tuck.y, clipPath: `inset(-70px -40px ${tuck.y}px -40px)` })
        place()
        // (the envelope's pieces move one by one, never their wrapper, so the card can sit between back and front)
        const pieces = q('.contacts__envelope > *')
        gsap.set(pieces, { autoAlpha: 1 })
        gsap.set(q('.contacts__flap'), { transformPerspective: 700, transformOrigin: '50% 0%' })
        gsap.set(q('.contacts__crest, .contacts__card .contact, .contacts__group-title, .contacts__foot'), { autoAlpha: 0 })

        // The page holds still while the envelope opens (see lockedTimeline): it glides down until the sealed
        // envelope sits near the foot of the screen (but never so far that the heading leaves the top), the seal
        // breaks, the flap lifts and the card rises out above it, the envelope falls away, and the rows are
        // written in before scrolling returns.
        const { tl, glide, cam, cleanup } = lockedTimeline(lenis, { trigger: env, start: 'top 75%', safety: 10 })
        const firstStop = () => Math.min(
          absTop(env) + env.offsetHeight - window.innerHeight + 24,
          absTop(q('.section-title')[0]) - 54, // (clear of a phone's notch)
        )
        // only if the card is taller than the screen: lift the page a little so its top shows too
        const secondStop = () => Math.min(cam.y, absTop(env) - 44)

        // measure again as it starts: web fonts may have changed the card's height since it was tucked in
        tl.call(() => { tuck.y = sunk(); place() }, null, 0)
        glide(firstStop, { duration: 1.4 }, 0)
        tl.from(pieces, { y: 50, duration: 1.1, ease: 'power3.out' }, 0.2)
          .to(q('.contacts__seal'), { scale: 1.25, autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 1.4)
          .to(q('.contacts__flap'), { rotateX: 180, duration: 0.8, ease: 'power2.inOut' }, 1.7)
          // once it is past upright, the flap falls behind the card
          .set(q('.contacts__flap'), { zIndex: 0 }, 2.1)
          .to(tuck, { y: 0, duration: 1.4, ease: 'power3.inOut', onUpdate: place }, 2.3)
          .to(q('.contacts__back, .contacts__front, .contacts__flap'), { y: 90, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 3.2)
          .set(card, { clipPath: 'none' }, 3.7)
        glide(secondStop, { duration: 1.2, ease: 'sine.inOut' }, 2.6)
        tl.from(q('.contacts__card .contact__cord'), { scaleY: 0, transformOrigin: '50% 0%', stagger: 0.12, duration: 0.5, ease: 'power2.out' }, 3.6)
          .fromTo(q('.contacts__crest'), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2)' }, 3.4)
          .fromTo(q('.contacts__card .contact, .contacts__group-title, .contacts__foot'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.6, ease: 'power2.out' }, 3.6)
          .from(q('.contacts__card .contact__seal'), { scale: 0, stagger: 0.05, duration: 0.45, ease: 'back.out(2)' }, 3.75)

        return cleanup
      })
    },
    { scope: root },
  )

  return (
    <section id="contacts" ref={root} className="section sky-bg contacts chap" data-chapter data-dwell="6">
      {/* the painted scene: a toran garland with two parrots along the top, a writing ledge (telephone, letters, quill, diya)
          along the foot, open paper between; the bands keep their shape however tall the section grows */}
      <div className="contacts__art" aria-hidden="true">
        <span className="contacts__art-paper" />
        <span className="contacts__art-top" />
        <span className="contacts__art-foot" />
      </div>
      <SectionTitle eyebrow="ਸੰਪਰਕ" title="Get in Touch" />
      <p className="contacts__sub reveal">For travel, stay or anything at all, we are just a call away.</p>

      <div className="contacts__env">
        {/* the envelope the card is drawn out of: back, card, front pocket, then the flap with its wax seal */}
        <div className="contacts__envelope" aria-hidden="true">
          <span className="contacts__back" />
          <span className="contacts__front" />
          <span className="contacts__flap" />
          <span className="contacts__seal">{bride.name[0]}<i>&amp;</i>{groom.name[0]}</span>
        </div>

        <div className="contacts__card">
          {/* the card's painted lotus crest, kept apart from the frame so the frame's top edge can stretch beneath it */}
          <span className="contacts__crest" aria-hidden="true" />
          <div className="contacts__body">
            <Group title="The Families" people={wedding.contacts} tone="families" />
            <Group title="For anything you need" people={wedding.help} tone="help" />
            <p className="contacts__foot"><span lang="pa">ਜੀ ਆਇਆਂ ਨੂੰ</span> · call us any time</p>
          </div>
        </div>
      </div>
    </section>
  )
}
