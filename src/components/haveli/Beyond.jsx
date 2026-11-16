import { ARCH } from './geometry'
import './Beyond.css'
import { Bhangra, Giddha, Dholi } from '../Folk'

const r2 = (n) => Math.round(n * 100) / 100

// Soft glow high in the courtyard (kept above the horizon so the floor stays clean)
const BOKEH = [
  [100, 120, 18, 0.2], [72, 150, 10, 0.3], [130, 132, 12, 0.25], [88, 90, 7, 0.4],
  [60, 128, 6, 0.45], [146, 160, 7, 0.4], [138, 100, 5, 0.45], [50, 176, 8, 0.25],
  [160, 140, 9, 0.2], [96, 70, 6, 0.3], [112, 188, 8, 0.3],
]

// Fairy lights strung across the courtyard
const STRINGS = [
  { x0: 8, x1: 192, y: 70, sag: 96, bulbs: 9 },
  { x0: 0, x1: 200, y: 108, sag: 140, bulbs: 11 },
]

function Lights({ x0, x1, y, sag, bulbs }) {
  const c = 2 * sag - y
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
            <circle cx={r2(x)} cy={r2(by + 1)} r="3.4" fill="url(#hv-bulb)" />
            <circle cx={r2(x)} cy={r2(by + 1)} r="1" fill="#fffbea" />
          </g>
        )
      })}
    </g>
  )
}

// [component, x, y(feet), scale, flip, bounce-delay]
const CAST = [
  [Giddha, 78, 230, 0.46, false, 0], [Bhangra, 122, 230, 0.46, true, 0.2],
  [Bhangra, 54, 262, 0.7, false, 0.35], [Dholi, 148, 262, 0.7, true, 0.1],
  [Giddha, 26, 318, 1.02, false, 0.5], [Bhangra, 174, 318, 1.02, true, 0.25],
]

const VX = 100
const HZ = 214 // horizon where the carpet vanishes

// The lit courtyard seen through the open doors: a red carpet runs to the horizon with
// bhangra and giddha dancers flanking it, under strings of fairy lights.
export default function Beyond() {
  const edge = (y, side) => VX + side * (6 + (y - HZ) * 0.64)
  const bands = [222, 231, 243, 259, 281, 311, 346]
  return (
    <svg className="beyond" viewBox="0 0 200 350" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <clipPath id="bey-clip"><path d={ARCH} /></clipPath>
        <linearGradient id="bey-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9b46e" />
          <stop offset="1" stopColor="#8a4a1f" />
        </linearGradient>
        <linearGradient id="bey-carpet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9c1d2e" />
          <stop offset="1" stopColor="#5e0b17" />
        </linearGradient>
        <pattern id="bey-diamond" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M4.5,0.8 L8.2,4.5 L4.5,8.2 L0.8,4.5Z" fill="#ffc107" opacity=".85" />
          <path d="M4.5,2.8 L6.2,4.5 L4.5,6.2 L2.8,4.5Z" fill="#e0218a" />
        </pattern>
      </defs>

      <g clipPath="url(#bey-clip)">
        <path d={ARCH} fill="url(#hv-beyond)" />
        <g fill="#fff3c4">
          {BOKEH.map(([cx, cy, r, o]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity={o} />
          ))}
        </g>
        {STRINGS.map((s) => (
          <Lights key={s.y} {...s} />
        ))}

        {/* courtyard floor */}
        <rect x="0" y={HZ} width="200" height={350 - HZ} fill="url(#bey-floor)" />
        <path d={`M0,${HZ} H200`} stroke="rgba(255,236,190,.55)" strokeWidth=".8" />

        {/* the red carpet */}
        <path d={`M${VX - 6},${HZ} L${VX + 6},${HZ} L${VX + 6 + 136 * 0.64},350 L${VX - 6 - 136 * 0.64},350Z`} fill="url(#bey-carpet)" />
        <path
          d={`M${edge(HZ + 2, -1)},${HZ + 2} L${edge(350, -1)},350 M${edge(HZ + 2, 1)},${HZ + 2} L${edge(350, 1)},350`}
          stroke="#f3d68a" strokeWidth="1.6" fill="none"
        />
        {/* phulkari diamond border running down each edge */}
        {[-1, 1].map((s) => (
          <path
            key={s}
            d={`M${edge(HZ + 8, s) - s * 5},${HZ + 8} L${edge(350, s) - s * 5},350 L${edge(350, s) - s * 14},350 L${edge(HZ + 8, s) - s * 8},${HZ + 8}Z`}
            fill="url(#bey-diamond)" opacity=".9"
          />
        ))}
        {bands.map((y) => (
          <path key={y} d={`M${edge(y, -1) + 12 * ((y - HZ) / 136 + 0.1)},${y} H${edge(y, 1) - 12 * ((y - HZ) / 136 + 0.1)}`} stroke="#f3d68a" strokeOpacity=".28" strokeWidth=".6" />
        ))}
        {/* marigold petals strewn on the carpet */}
        {[[96, 240], [108, 252], [100, 270], [91, 292], [110, 300], [101, 330], [92, 322], [112, 338]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={1 + (y - HZ) / 60} ry={0.6 + (y - HZ) / 110} fill={i % 2 ? '#ffb300' : '#f29b1d'} opacity=".9" />
        ))}

        {/* the dancers (far to near, so nearer figures overlap) */}
        {CAST.map(([Who, x, y, s, flip, delay], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
            <ellipse cx="0" cy="1" rx="12" ry="2.2" fill="rgba(60,20,5,.35)" />
            <g className="dancer" style={{ animationDelay: `${delay}s` }}>
              <Who />
            </g>
          </g>
        ))}
      </g>
    </svg>
  )
}
