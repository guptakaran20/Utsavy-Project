import './Marquee.css'

const WORDS = ['ਸ਼ੁਭ ਵਿਆਹ', 'Shubh Vivah', 'ਢੋਲ ਵੱਜਦਾ', 'Dhol Vajda', 'ਭੰਗੜਾ', 'Bhangra', 'ਜਸ਼ਨ', 'Jashan']

// Slow, calm ticker between sections; pauses on hover; static for reduced motion.
export default function Marquee() {
  const row = (
    <ul className="marquee__row">
      {WORDS.map((w, i) => (
        <li key={i} className={/[਀-੿]/.test(w) ? 'gurmukhi' : ''}>
          {w}
          <i aria-hidden="true">✦</i>
        </li>
      ))}
    </ul>
  )
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row}
        {row}
      </div>
    </div>
  )
}
