import './Toran.css'

// Lengths of each hanging marigold string, repeated across the width
const LENGTHS = [6, 4, 5, 3, 5, 4]
const STRINGS = 15

// A genda-phool toran (marigold garland with mango leaves) for the top of the hero.
export default function Toran() {
  return (
    <div className="toran" aria-hidden="true">
      <div className="toran__top" />
      <div className="toran__strings">
        {Array.from({ length: STRINGS }, (_, i) => {
          const len = LENGTHS[i % LENGTHS.length]
          return (
            <div className="toran__string" key={i}>
              <span className="toran__leaf" />
              {Array.from({ length: len }, (_, j) => (
                <span key={j} className={`toran__flower${(i + j) % 3 === 0 ? ' toran__flower--deep' : ''}`} />
              ))}
              <span className="toran__tassel" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
