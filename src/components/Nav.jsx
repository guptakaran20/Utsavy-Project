import { useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { useScrollTo } from '../lib/smoothScroll'
import { wedding } from '../data/wedding'
import './Nav.css'

const links = [
  { href: '#couple', label: 'Couple' },
  { href: '#story', label: 'Story' },
  { href: '#events', label: 'Events' },
  { href: '#notes', label: 'Details' },
]

export default function Nav({ visible }) {
  const scrollTo = useScrollTo()
  const { scrollY, scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  // Hidden over the hero (the toran owns the top edge there), slides in once you scroll on
  const [pastHero, setPastHero] = useState(false)
  const shown = visible && pastHero

  useMotionValueEvent(scrollY, 'change', (y) => setPastHero(y > window.innerHeight * 0.6))

  const go = (e, href) => {
    e.preventDefault()
    scrollTo(href)
  }

  return (
    <motion.header
      className="nav"
      initial={{ y: '-110%' }}
      animate={{ y: shown ? '0%' : '-110%' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      inert={!shown}
    >
      <a className="nav__mark" href="#top" onClick={(e) => go(e, 0)}>
        {wedding.bride.name[0]}
        <span>&amp;</span>
        {wedding.groom.name[0]}
      </a>
      <nav className="nav__links" aria-label="Sections">
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="nav__cta" href="#rsvp" onClick={(e) => go(e, '#rsvp')}>
        RSVP
      </a>
      <motion.span className="nav__progress" style={{ scaleX: progress }} aria-hidden="true" />
    </motion.header>
  )
}
