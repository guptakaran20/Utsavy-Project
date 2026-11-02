import './decor.css'

const r2 = (n) => Math.round(n * 100) / 100

const X0 = -20
const X1 = 1020
const SPACING = 26
const WARM = '#ffe6a8'
const ACCENTS = ['#ffb347', '#ff9ec7']

// Back to front; smaller bulbs on the higher strings fake a little depth
const STRINGS = [
  { y0: -4, y1: 10, sag: 62, s: 0.78 },
  { y0: 12, y1: -6, sag: 98, s: 0.9 },
  { y0: -12, y1: 4, sag: 128, s: 1 },
]

// Control point at mid-x keeps x linear in t: y(t) = lerp(y0, y1, t) + 4·sag·t(1−t)
const yAt = (c, t) => c.y0 + (c.y1 - c.y0) * t + 4 * c.sag * t * (1 - t)
const wire = (c) => `M${X0},${c.y0} Q${(X0 + X1) / 2},${(c.y0 + c.y1) / 2 + 2 * c.sag} ${X1},${c.y1}`

const BULBS = STRINGS.map((c, si) => {
  // Each string starts at a different phase so bulbs don't stack in columns
  const start = -8 + ((si * 9) % SPACING)
  const n = Math.floor((1008 - start) / SPACING) + 1
  return Array.from({ length: n }, (_, i) => {
    const x = start + i * SPACING
    const t = (x - X0) / (X1 - X0)
    const accent = i % 5 === 2 ? ACCENTS[(Math.floor(i / 5) + si) % 2] : null
    return {
      x,
      y: r2(yAt(c, t) + 1.5 * c.s),
      color: accent ?? WARM,
      accent: Boolean(accent),
      d: r2(((i * 0.618 + si * 0.37) % 1) * 2.4),
    }
  })
})

// Strings of wedding lights drooping across the top of the night wall
export default function FairyLights() {
  return (
    <svg className="fairy-lights" viewBox="0 0 1000 160" preserveAspectRatio="xMidYMin slice" aria-hidden="true">
      {STRINGS.map((c, si) => (
        <g key={si}>
          <path d={wire(c)} fill="none" stroke="#2a1408" strokeWidth="1.1" />
          {BULBS[si].map((b) => (
            <g key={b.x} className="bulb" style={{ '--d': b.d }}>
              <circle cx={b.x} cy={b.y} r={r2(7 * c.s)} fill="url(#hv-bulb)" />
              {b.accent && <circle cx={b.x} cy={b.y} r={r2(4 * c.s)} fill={b.color} opacity="0.35" />}
              <circle cx={b.x} cy={b.y} r={r2(2.4 * c.s)} fill={b.color} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}
