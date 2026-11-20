import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { wedding } from '../data/wedding'
import { useScrollTo } from '../lib/smoothScroll'
import './ThankYou.css'

// a few rose petals that drift down the closing page on a slow loop: [left %, delay s, duration s, colour]
const PETALS = [
  [8, 0, 13, '#f4a7b9'], [22, 5.5, 15, '#fbd9df'], [37, 2.2, 12, '#e88aa0'], [51, 8, 16, '#f7c4cf'],
  [64, 3.6, 14, '#f3b6c2'], [78, 9.4, 13, '#f4a7b9'], [90, 1.2, 15, '#fbd9df'], [30, 11, 14, '#f7c4cf'],
]

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] } }),
}

// The closing page, like a film's end titles: no card, just a big "Thank You", the couple's names,
// set in a painted scene (garlanded arch above, lotus pond below) with petals drifting down.
export default function ThankYou() {
  const root = useRef(null)
  const seen = useInView(root, { once: true, amount: 0.35 })
  const inView = useInView(root, { amount: 0.1 })
  const scrollTo = useScrollTo()
  const state = seen ? 'shown' : 'hidden'

  return (
    <footer ref={root} className={`thanks${inView ? ' is-live' : ''}`}>
      {/* the painted closing scene: a jharokha of hanging garlands above, a lotus pond with diyas below, open paper between */}
      <div className="thanks__art" data-art="fade" aria-hidden="true">
        <img className="art-drift" src="/thanks-art.webp" alt="" width="941" height="1672" decoding="async" loading="lazy" />
        {/* the site's floral paper over the painting's plain middle, faded out before the garlands above and the pond below */}
        <span className="thanks__paper" />
      </div>
      <div className="thanks__petals" aria-hidden="true">
        {PETALS.map(([left, delay, dur, bg], i) => (
          <i key={i} style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${dur}s`, background: bg }} />
        ))}
      </div>

      <div className="thanks__body">
        <motion.p className="thanks__pa gurmukhi" variants={rise} custom={0} initial="hidden" animate={state}>ਧੰਨਵਾਦ</motion.p>
        <motion.h2 className="thanks__title" variants={rise} custom={1} initial="hidden" animate={state}>Thank You</motion.h2>
        <motion.span className="thanks__rule" aria-hidden="true" variants={rise} custom={2} initial="hidden" animate={state} />
        <motion.p className="thanks__line" variants={rise} custom={3} initial="hidden" animate={state}>
          We can’t wait to celebrate with you.
        </motion.p>
        <motion.p className="thanks__names" variants={rise} custom={4} initial="hidden" animate={state}>
          {wedding.bride.name} <span>&amp;</span> {wedding.groom.name}
        </motion.p>
        <motion.p className="thanks__tag" variants={rise} custom={5} initial="hidden" animate={state}>{wedding.hashtag}</motion.p>
        <motion.div className="thanks__foot" variants={rise} custom={6} initial="hidden" animate={state}>
          <button type="button" className="thanks__top" onClick={() => scrollTo(0)}>
            <span aria-hidden="true">↑</span> Back to top
          </button>
          <p className="thanks__love">Made with love in {wedding.town}</p>
        </motion.div>
      </div>
    </footer>
  )
}
