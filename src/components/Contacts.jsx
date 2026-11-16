import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import FloralSides from './FloralSides'
import './Contacts.css'

const initials = (n) => n.replace(/^(S\.|Sardar|Sardarni)\s+/i, '').split(' ').map((w) => w[0]).slice(0, 2).join('')
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>
)

export default function Contacts() {
  const root = useRef(null)
  const people = [...wedding.contacts, ...wedding.help]
  useReveal(root)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.contact', { y: 50, autoAlpha: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.contacts__grid', start: 'top 85%', once: true } })
        gsap.from('.contact__mono', { scale: 0, duration: 0.6, ease: 'back.out(2)', stagger: 0.12, delay: 0.3, scrollTrigger: { trigger: '.contacts__grid', start: 'top 85%', once: true } })
      })
    },
    { scope: root },
  )

  return (
    <section id="contacts" ref={root} className="section sky-bg contacts chap" data-chapter data-dwell="6">
      <FloralSides tiles={3} head={false} />
      <SectionTitle eyebrow="ਸੰਪਰਕ" title="Get in Touch" />
      <p className="contacts__sub reveal">For travel, stay or anything at all, we are just a call away.</p>
      <div className="contacts__grid">
        {people.map((c) => {
          const tel = c.phone.replace(/[^\d+]/g, '')
          return (
            <article className="contact" key={c.label}>
              <span className="contact__mono" aria-hidden="true">{initials(c.name)}</span>
              <span className="contact__label">{c.label}</span>
              <h3 className="contact__name">{c.name}</h3>
              <div className="contact__actions">
                <a className="btn" href={`tel:${tel}`}><PhoneIcon /> Call</a>
                {c.whatsapp && <a className="btn btn--outline" href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
              </div>
              <span className="contact__num">{c.phone}</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}
