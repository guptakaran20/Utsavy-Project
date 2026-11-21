import { useRef } from 'react'
import { fitLen } from '../lib/fitText'
import { useReveal } from '../lib/useReveal'
import { wedding } from '../data/wedding'
import SectionTitle from './SectionTitle'
import './PhulkariDivider.css'
import Mandala from './Mandala'
import Photo from './Photo'
import './Couple.css'

// Each person stands in a painted jharokha (public/frame-bride.webp: roses and lanterns; frame-groom.webp: marigolds and
// bells). The frame's opening is cut away, and the photo sits behind it, sized to that opening (see Couple.css).
// Lantern centres were measured on the bride's painting, so their glow lands on the lanterns.
const LANTERNS = { bride: [[11.7, 35], [88.3, 35]], groom: [] }

function Person({ person, role, roleGurmukhi, tone }) {
  return (
    <article className={`person person--${tone}`}>
      <div className="person__window" data-art="fade">
        <div className="person__photo">
          <Photo
            className="person__img"
            src={person.photo}
            focus={person.focus}
            alt={person.fullName}
            fallback={
              <div className="person__mono">
                <Mandala className="person__mandala" />
                <span className="gurmukhi">{person.nameGurmukhi[0]}</span>
              </div>
            }
          />
        </div>
        <img className="person__frame" src={`/frame-${tone}.webp`} alt="" width="700" height="1050" decoding="async" loading="lazy" aria-hidden="true" />
        {LANTERNS[tone].map(([x, y], i) => (
          <span key={x} className="art-flame person__glow" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * -1.1}s` }} aria-hidden="true" />
        ))}
      </div>
      <p className="person__role reveal">{role} · <span className="gurmukhi">{roleGurmukhi}</span></p>
      <h3 className="person__name reveal" style={fitLen(person.name)}>{person.name}</h3>
      <p className="person__full reveal">{person.fullName}</p>
      <span className="person__rule reveal" aria-hidden="true" />
      <p className="person__parents reveal">{person.parents}</p>
      <p className="person__blurb reveal">{person.blurb}</p>
    </article>
  )
}

export default function Couple() {
  const root = useRef(null)
  useReveal(root)

  return (
    <section id="couple" ref={root} className="section section--ivory couple chap" data-chapter data-dwell="6">
      {/* a garland of roses, peonies and marigolds with bells, jasmine strands and a pair of kaleere at its centre */}
      <img className="couple__header art-sway" data-art="drop" src="/couple-header.webp" alt="" width="1000" height="240" decoding="async" loading="lazy" aria-hidden="true" />
      <SectionTitle eyebrow="ਲਾੜੀ ਤੇ ਲਾੜਾ" title="The Bride & Groom" />
      <div className="couple__grid">
        <Person person={wedding.bride} role="The Bride" roleGurmukhi="ਲਾੜੀ" tone="bride" />
        {/* the two kaleere, crossed: in place of a plain "&" between the two of them */}
        <img className="couple__and art-sway" data-art="drop" src="/couple-divider.webp" alt="and" width="500" height="394" decoding="async" loading="lazy" />
        <Person person={wedding.groom} role="The Groom" roleGurmukhi="ਲਾੜਾ" tone="groom" />
      </div>
      <img className="punjabi-chooda art-float" data-art="bloom" src="/punjabi/chooda.webp" alt="" width="900" height="900" loading="lazy" decoding="async" aria-hidden="true" />
      {/* five lit diyas between marigolds and petals along the foot (flame centres measured on the painting) */}
      <div className="couple__footer" data-art="rise" aria-hidden="true">
        <img src="/couple-footer.webp" alt="" width="1000" height="138" decoding="async" loading="lazy" />
        {[19, 34.5, 50, 65.5, 81].map((x, i) => (
          <span key={x} className="art-flame" style={{ left: `${x}%`, top: '44%', animationDelay: `${i * -0.53}s`, animationDuration: `${2.1 + (i % 3) * 0.35}s` }} />
        ))}
      </div>
    </section>
  )
}
