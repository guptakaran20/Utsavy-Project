import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { wedding } from '../data/wedding'
import FloralSides from './FloralSides'
import { LotusGarland } from './Florals'
import './Florals.css'
import './ThankYou.css'

// The closing page: the same brass-roller parchment scroll as the celebrations, unrolling as it arrives.
export default function ThankYou() {
  const root = useRef(null)
  const seen = useInView(root, { once: true, amount: 0.4 })
  return (
    <footer ref={root} className="thanks sky-bg">
      <FloralSides tiles={3} head={false} />
      <div className="escroll thanks__scroll">
        <div className="escroll__roller" aria-hidden="true" />
        <motion.div
          className="escroll__paper"
          initial={{ height: 0 }}
          animate={{ height: seen ? 'auto' : 0 }}
          transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
        >
          <motion.div
            className="escroll__inner thanks__inner"
            initial={{ opacity: 0, y: 16 }}
            animate={seen ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="ecard__pa gurmukhi">ਆਪ ਜੀ ਦੀ ਉਡੀਕ ਵਿੱਚ</p>
            <h2 className="ecard__name">Thank You</h2>
            <LotusGarland />
            <p className="thanks__line">Awaiting your gracious presence. Together with our families, we cannot wait to share our wedding with you.</p>
            <p className="thanks__names">{wedding.bride.name} &amp; {wedding.groom.name}</p>
            <p className="thanks__tag">{wedding.hashtag}</p>
            <div className="thanks__contacts">
              {wedding.contacts.map((c) => (
                <div key={c.label} className="thanks__contact">
                  <span className="thanks__contact-label">{c.label}</span>
                  <span className="thanks__contact-name">{c.name}</span>
                  <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a>
                </div>
              ))}
            </div>
            <p className="thanks__love">Made with love <span aria-hidden="true">&hearts;</span> {wedding.city}</p>
          </motion.div>
        </motion.div>
        <div className="escroll__roller" aria-hidden="true" />
      </div>
    </footer>
  )
}
