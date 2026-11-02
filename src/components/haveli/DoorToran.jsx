import './decor.css'

const r2 = (n) => Math.round(n * 100) / 100
const THREAD = '#5a2a0a'

// Both swags hang from the cornice. The control point sits at mid-x, so x runs
// linearly with t and y(t) = y + 4·sag·t(1−t)
const OUTER = { x0: 10, x1: 290, y: 44, sag: 30, r: 6.2 }
const INNER = { x0: 24, x1: 276, y: 52, sag: 52, r: 6.8 }

const swagAt = (s, t) => ({ t, x: r2(s.x0 + (s.x1 - s.x0) * t), y: r2(s.y + 4 * s.sag * t * (1 - t)) })
const swagPath = (s) => `M${s.x0},${s.y} Q${(s.x0 + s.x1) / 2},${s.y + 2 * s.sag} ${s.x1},${s.y}`

// Walks a swag by arc length, so flowers don't thin out where it's steep
function arcWalker(s) {
  const steps = 200
  const lens = [0]
  for (let k = 1; k <= steps; k++) {
    const a = swagAt(s, (k - 1) / steps)
    const b = swagAt(s, k / steps)
    lens.push(lens[k - 1] + Math.hypot(b.x - a.x, b.y - a.y))
  }
  const total = lens[steps]
  return {
    total,
    at(u) {
      const target = u * total
      let k = 1
      while (k < steps && lens[k] < target) k++
      return swagAt(s, (k - 1 + (target - lens[k - 1]) / (lens[k] - lens[k - 1])) / steps)
    },
  }
}

function buildSwag(s, leafCount, leafLen, skip = []) {
  const arc = arcWalker(s)
  const n = Math.round(arc.total / (s.r * 1.5))
  const flowers = Array.from({ length: n + 1 }, (_, i) => ({ i, ...arc.at(i / n) }))
    // Ends first, centre last, so the garland overlaps symmetrically
    .sort((a, b) => Math.abs(b.t - 0.5) - Math.abs(a.t - 0.5))
  const leaves = Array.from({ length: leafCount }, (_, k) => ({ k, ...arc.at((k + 0.5) / leafCount) }))
    // Keep leaves clear of the drops hanging from the same swag
    .filter((p) => skip.every((t) => Math.abs(p.t - t) > 0.06))
  return { s, flowers, leaves, leafLen }
}

const DROPS = [
  { t: 0.25, count: 3, end: 'tassel', offset: 2 },
  { t: 0.5, count: 4, end: 'bell', offset: 0 },
  { t: 0.75, count: 3, end: 'tassel', offset: 2 },
]
const OUTER_SWAG = buildSwag(OUTER, 8, 14)
const INNER_SWAG = buildSwag(INNER, 9, 18, DROPS.map((d) => d.t))

// Mirrored pairs share a colour offset so the doorway stays symmetric
const OUTER_LADIS = [
  { x: 10, y: 46, count: 16, end: 'bell', offset: 0 },
  { x: 290, y: 46, count: 16, end: 'bell', offset: 0 },
]
const INNER_LADIS = [
  { x: 24, y: 52, count: 12, end: 'tassel', offset: 1 },
  { x: 276, y: 52, count: 12, end: 'tassel', offset: 1 },
]

// A genda phool: round caps on a zero-length dash ruffle the rim into petal tips
export function Flower({ x, y, r = 6, i = 0 }) {
  const yellow = i % 3 === 2
  const tip = r2((2 * Math.PI * r * 0.98) / 14)
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r2(r * 0.98)}
        fill="none"
        stroke={yellow ? '#e39d12' : '#d9620f'}
        strokeWidth={r2(r * 0.36)}
        strokeLinecap="round"
        strokeDasharray={`0 ${tip}`}
        strokeDashoffset={r2((i * 1.3) % tip)}
      />
      <circle cx={x} cy={y} r={r} fill={yellow ? 'url(#hv-mg-yellow)' : 'url(#hv-mg-orange)'} />
      <circle
        cx={x}
        cy={y}
        r={r2(r * 0.62)}
        fill="none"
        stroke="rgba(120,40,0,.25)"
        strokeWidth={r2(r * 0.2)}
        strokeDasharray={`${r2(r * 0.3)} ${r2(r * 0.18)}`}
      />
      <circle cx={x} cy={y} r={r2(r * 0.2)} fill="#6b2a05" />
    </g>
  )
}

// Mango leaf hanging tip-down from (x, y): narrow stalk, widest near the top third
function Leaf({ x, y, a, len }) {
  const w = len * 0.32
  const d = `M0,0 C${r2(w)},${r2(len * 0.22)} ${r2(w * 0.7)},${r2(len * 0.72)} 0,${len} C${r2(-w * 0.7)},${r2(len * 0.72)} ${r2(-w)},${r2(len * 0.22)} 0,0Z`
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <path d={d} fill="url(#hv-mango)" />
      <path d={`M0,1.2 V${r2(len * 0.86)}`} stroke="#b5e08f" strokeOpacity="0.7" strokeWidth="0.5" />
    </g>
  )
}

function Bell({ x, y, s }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r2(s)})`}>
      <circle cy="1.6" r="1.5" fill="none" stroke="#a87a32" strokeWidth="0.8" />
      <path
        d="M0,2.8 C2.9,2.8 3.6,5.4 3.8,8 C4,9.8 5.2,10.6 5.6,11.4 H-5.6 C-5.2,10.6 -4,9.8 -3.8,8 C-3.6,5.4 -2.9,2.8 0,2.8Z"
        fill="url(#hv-brass)"
      />
      <path d="M-2,4.6 C-2.5,6.6 -2.7,8.6 -3.5,10.2" fill="none" stroke="rgba(255,244,210,.7)" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M-5.6,11.4 H5.6" stroke="#6f4b18" strokeWidth="0.7" strokeLinecap="round" />
      <circle cy="12.6" r="1.4" fill="url(#hv-stud)" />
    </g>
  )
}

function Tassel({ x, y, s }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${r2(s)})`}>
      <circle cy="2" r="2" fill="url(#hv-stud)" />
      <path d="M-1.6,4 L-3.8,16.5 Q0,18 3.8,16.5 L1.6,4Z" fill="#b5122f" />
      <path d="M-0.8,6 L-2,16.6 M0,6 V17.2 M0.8,6 L2,16.6" stroke="#6e0718" strokeWidth="0.4" />
      <rect x="-2.2" y="4" width="4.4" height="2" rx="0.6" fill="url(#hv-brass)" />
      <path d="M-3.6,15.4 Q0,16.8 3.6,15.4" fill="none" stroke="#e2bc6c" strokeWidth="0.8" />
    </g>
  )
}

// One hanging string. Its bbox starts exactly at (x, y) and is centred on x, so
// GSAP can sway it about its top with transformOrigin '50% 0%'. `offset` shifts
// the orange/orange/yellow cycle so neighbouring strings don't line up.
export function Strand({ x, y, count, gap = 10.5, r = 5.4, offset = 0, end = 'bell' }) {
  const last = y + gap * count
  const Ornament = end === 'bell' ? Bell : Tassel
  return (
    <g className="ladi">
      <path d={`M${x},${y} V${r2(last + r)}`} stroke={THREAD} strokeWidth="0.8" />
      <Ornament x={x} y={r2(last + r * 0.6)} s={r / 5.4} />
      {Array.from({ length: count }, (_, k) => {
        const i = k + offset
        return <Flower key={k} x={x} y={r2(y + gap * (k + 1))} r={r2(r * (1 + 0.06 * Math.sin(i * 1.9)))} i={i} />
      })}
    </g>
  )
}

function Swag({ data, pair = false }) {
  const { s, flowers, leaves, leafLen } = data
  return (
    <g className="swag">
      {leaves.map(({ k, x, y, t }) => {
        // Leaves splay outward towards the ends, like a real fringe
        const a = (0.5 - t) * 30
        return pair ? (
          <g key={k}>
            <Leaf x={x} y={r2(y + 2)} a={r2(a + 13)} len={leafLen} />
            <Leaf x={x} y={r2(y + 2)} a={r2(a - 13)} len={leafLen} />
          </g>
        ) : (
          <Leaf key={k} x={x} y={r2(y + 2)} a={r2(a + (k % 2 ? 6 : -6))} len={leafLen} />
        )
      })}
      <path d={swagPath(s)} fill="none" stroke={THREAD} strokeWidth="1" />
      {flowers.map((f) => (
        <Flower
          key={f.i}
          x={f.x}
          y={r2(f.y + Math.sin(f.i * 2.1) * 0.7)}
          r={r2(s.r * (1 + 0.07 * Math.sin(f.i * 1.7 + 0.5)))}
          i={f.i}
        />
      ))}
    </g>
  )
}

// Genda-phool toran over the doorway, drawn in the doorway's 300 × 440 unit space
export default function DoorToran() {
  return (
    <svg className="door-toran" viewBox="0 0 300 440" aria-hidden="true">
      {OUTER_LADIS.map((l) => (
        <Strand key={l.x} {...l} />
      ))}
      <Swag data={OUTER_SWAG} />
      {INNER_LADIS.map((l) => (
        <Strand key={l.x} {...l} />
      ))}
      {DROPS.map(({ t, ...d }) => {
        const p = swagAt(INNER, t)
        return <Strand key={t} x={p.x} y={p.y} {...d} />
      })}
      <Swag data={INNER_SWAG} pair />
    </svg>
  )
}
