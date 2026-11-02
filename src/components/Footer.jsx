import { useRef } from 'react'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import Mandala from './Mandala'
import Flourish from './Flourish'
import './Footer.css'

export default function Footer() {
  const root = useRef(null)
  useReveal(root)

  return (
    <footer ref={root} className="footer">
      <Mandala className="footer__mandala" />
      <div className="footer__inner">
        <p className="footer__pa gurmukhi reveal">ਆਪ ਜੀ ਦੀ ਉਡੀਕ ਵਿੱਚ</p>
        <p className="footer__en reveal">Awaiting your gracious presence</p>
        <p className="footer__names reveal">
          {wedding.bride.name} <span>&amp;</span> {wedding.groom.name}
        </p>
        <Flourish className="reveal" />
        <p className="footer__hashtag reveal">{wedding.hashtag}</p>

        <div className="footer__contacts reveal">
          {wedding.contacts.map((c) => (
            <div key={c.label} className="footer__contact">
              <span className="footer__contact-label">{c.label}</span>
              <span className="footer__contact-name">{c.name}</span>
              <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a>
            </div>
          ))}
        </div>

        <p className="footer__small">Made with love for {wedding.bride.name} &amp; {wedding.groom.name} · {wedding.city}</p>
      </div>
    </footer>
  )
}
