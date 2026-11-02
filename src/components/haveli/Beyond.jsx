import { ARCH } from './geometry'

const r2 = (n) => Math.round(n * 100) / 100

// Hard-coded so the glow is the same on every render: [cx, cy, r, opacity]
const BOKEH = [
  [100, 190, 18, 0.18],
  [72, 210, 10, 0.3],
  [130, 172, 12, 0.25],
  [88, 150, 7, 0.4],
  [118, 232, 9, 0.35],
  [60, 170, 6, 0.45],
  [146, 212, 7, 0.4],
  [104, 262, 13, 0.15],
  [78, 244, 5, 0.5],
  [138, 140, 5, 0.45],
  [50, 226, 8, 0.22],
  [160, 180, 9, 0.2],
  [96, 118, 6, 0.3],
  [124, 290, 7, 0.25],
]

// Two sagging strings of fairy lights hung across the courtyard; ends stay inside the arch
const STRINGS = [
  { x0: 8, x1: 192, y: 96, sag: 122, bulbs: 9 },
  { x0: 0, x1: 200, y: 136, sag: 166, bulbs: 11 },
]

function Lights({ x0, x1, y, sag, bulbs }) {
  const c = 2 * sag - y // control point that puts the curve's midpoint at `sag`
  const at = (t) => [
    (1 - t) ** 2 * x0 + 2 * (1 - t) * t * 100 + t ** 2 * x1,
    (1 - t) ** 2 * y + 2 * (1 - t) * t * c + t ** 2 * y,
  ]
  return (
    <g>
      <path d={`M${x0},${y} Q100,${c} ${x1},${y}`} fill="none" stroke="rgba(110,50,15,.45)" strokeWidth=".6" />
      {Array.from({ length: bulbs }, (_, i) => {
        const [x, by] = at((i + 1) / (bulbs + 1))
        return (
          <g key={i}>
            <circle cx={r2(x)} cy={r2(by + 1)} r="3.6" fill="url(#hv-bulb)" />
            <circle cx={r2(x)} cy={r2(by + 1)} r="1" fill="#fffbea" />
          </g>
        )
      })}
    </g>
  )
}

// The lit courtyard seen through the open doors
export default function Beyond() {
  return (
    <svg className="beyond" viewBox="0 0 200 350" preserveAspectRatio="none" aria-hidden="true">
      <path d={ARCH} fill="url(#hv-beyond)" />
      <g fill="#fff3c4">
        {BOKEH.map(([cx, cy, r, o]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity={o} />
        ))}
      </g>
      {STRINGS.map((s) => (
        <Lights key={s.y} {...s} />
      ))}
      <path d="M0,350 V300 Q100,286 200,300 V350 Z" fill="rgba(120,40,10,.35)" />
      <path d="M0,300 Q100,286 200,300" fill="none" stroke="rgba(255,230,180,.35)" strokeWidth=".8" />
    </svg>
  )
}
