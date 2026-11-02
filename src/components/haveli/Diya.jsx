import './decor.css'

// Clay oil lamp seen from the side: the flame burns on the spout, not the middle.
// Sized in em, so font-size scales it. Set --diya-delay (seconds) to desync several.
export default function Diya({ className = '' }) {
  return (
    <span className={`diya ${className}`} aria-hidden="true">
      <span className="diya-glow" />
      <span className="diya-spout" />
      <span className="diya-bowl">
        <span className="diya-band" />
      </span>
      <span className="diya-rim" />
      <span className="diya-wick" />
      <span className="diya-flame" />
    </span>
  )
}
