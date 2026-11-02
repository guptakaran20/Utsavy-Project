import { LEAF } from './geometry'
import './art.css'

const r2 = (n) => Math.round(n * 100) / 100
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
const pt = ([x, y]) => `${r2(x)},${r2(y)}`
const curve = (p) => `C${pt(p[1])} ${pt(p[2])} ${pt(p[3])}`
const back = (p) => `C${pt(p[2])} ${pt(p[1])} ${pt(p[0])}`

// The leaf's arch edge inset by d, as cubic control points in leaf space.
// Same recipe as archPath() in geometry.js, so every inset runs parallel.
function arch(d) {
  const apex = d * 1.25
  const rise = 119 - apex
  return [
    [d, 119],
    [d, 119 - rise * 0.53],
    [d + (200 - 2 * d) * 0.28, apex + rise * 0.18],
    [100, apex],
  ]
}

// de Casteljau: the stretch of cubic p from 0 to t
function head(p, t) {
  const a = lerp(p[0], p[1], t)
  const b = lerp(p[1], p[2], t)
  const c = lerp(p[2], p[3], t)
  const d = lerp(a, b, t)
  return [p[0], a, d, lerp(d, lerp(b, c, t), t)]
}

// Trim a curve where it reaches x (x only ever grows along these curves)
function upTo(p, x) {
  let lo = 0
  let hi = 1
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (head(p, mid)[3][0] < x) lo = mid
    else hi = mid
  }
  return head(p, hi)
}

// n points spread evenly by length along a polyline
function spread(line, n) {
  const len = [0]
  for (let i = 1; i < line.length; i++) {
    len.push(len[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]))
  }
  const total = len[len.length - 1]
  return Array.from({ length: n }, (_, k) => {
    const s = (total * k) / (n - 1)
    let i = 1
    while (i < len.length - 1 && len[i] < s) i++
    return lerp(line[i - 1], line[i], (s - len[i - 1]) / (len[i] - len[i - 1]))
  })
}

// A pointed petal from radius `from` out to `to`, pointing up
const petal = (from, to, w) => {
  const a = r2(-from - (to - from) * 0.3)
  const b = r2(-from - (to - from) * 0.75)
  return `M0,${-from} C${w},${a} ${r2(w * 0.6)},${b} 0,${-to} C${r2(-w * 0.6)},${b} ${-w},${a} 0,${-from} Z`
}

const BEVEL = 2.6
const SHADOW = '#1a0904'
const LIT = 'rgba(255,196,140,.34)'
const DARK_BRASS = '#4a2f0c'

const MOULD = `M6,341 V119 ${curve(arch(6))}`
const MOULD_LIT = `M7.6,341 V119 ${curve(arch(7.6))}`

// Arched top panel, x 15–92 up to y 150, its bevel lips mitred at the corners
const top = upTo(arch(15), 92)
const topIn = upTo(arch(15 + BEVEL), 92 - BEVEL)
const TOP = {
  field: `M15,150 V119 ${curve(top)} V150 Z`,
  shadow: `M15,150 V119 ${curve(top)} L${pt(topIn[3])} ${back(topIn)} V${150 - BEVEL} Z`,
  lit: `M${pt(top[3])} V150 H15 L${15 + BEVEL},${150 - BEVEL} H${92 - BEVEL} V${r2(topIn[3][1])} Z`,
  inner: `M22,143 V119 ${curve(upTo(arch(22), 85))} V143 Z`,
}

// Nail heads along the arch, spaced by length so they don't bunch at the top.
// The last one lands on the meeting edge and pairs with the other leaf's half.
const archLine = arch(10.8)
const ARCH_STUDS = spread(
  [[10.8, 146], ...Array.from({ length: 41 }, (_, i) => head(archLine, i / 40)[3])],
  14,
)

const STRAPS = [154, 238, 304]
const STRAP_STUDS = [8, 20, 32, 44, 56, 68, 80]
const STILE_STUDS = [172, 196, 220, 262, 286, 322]
const KICK_STUDS = [10, 30, 50, 70, 90]

// A recessed panel: shadowed top/left lip, lit bottom/right lip
function Panel({ y, h, children }) {
  const x = 15
  const w = 77
  const b = BEVEL
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="url(#hv-panel)" />
      <path d={`M${x},${y + h} V${y} H${x + w} L${x + w - b},${y + b} H${x + b} V${y + h - b} Z`} fill={SHADOW} />
      <path d={`M${x + w},${y} V${y + h} H${x} L${x + b},${y + h - b} H${x + w - b} V${y + b} Z`} fill={LIT} />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} fill="none" stroke="rgba(255,206,150,.1)" strokeWidth=".8" />
      {children}
    </g>
  )
}

// Hinge strap: brass band ending in a spear tip, studded, with a knuckle on the hinge
function Strap({ y }) {
  return (
    <g>
      <path
        d={`M0,${y - 3} H83 Q86,${y - 3} 87.5,${y - 5} L96,${y} L87.5,${y + 5} Q86,${y + 3} 83,${y + 3} H0 Z`}
        fill="url(#hv-brass)"
        stroke={DARK_BRASS}
        strokeWidth=".5"
      />
      {STRAP_STUDS.map((x) => (
        <circle key={x} cx={x} cy={y} r="2" fill="url(#hv-stud)" />
      ))}
      <rect x="0" y={y - 7} width="4.5" height="14" rx="1.6" fill="#6b4716" stroke="#2e1c06" strokeWidth=".5" />
      <rect x="1.3" y={y - 6} width=".8" height="12" fill="rgba(255,230,170,.45)" />
    </g>
  )
}

// Brass sun on the meeting edge; each leaf shows half, closed doors show it whole
function Sun() {
  return (
    <g transform="translate(100 100)">
      <circle r="25" fill="#24100a" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={petal(8, 19, 3)} transform={`rotate(${i * 22.5 + 11.25})`} fill="#8a6326" />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <path
          key={i}
          d={petal(6, 23, 4.2)}
          transform={`rotate(${i * 22.5})`}
          fill="url(#hv-brass)"
          stroke={DARK_BRASS}
          strokeWidth=".5"
        />
      ))}
      <circle r="25.6" fill="none" stroke="url(#hv-brass)" strokeWidth="2.8" />
      <circle r="8" fill="url(#hv-brass)" stroke={DARK_BRASS} strokeWidth=".6" />
      <circle r="4.6" fill="url(#hv-stud)" />
    </g>
  )
}

function Diamond() {
  return (
    <g>
      <path d="M51,171 L80,197 L51,223 L22,197 Z" fill="rgba(20,8,2,.28)" stroke="url(#hv-brass)" strokeWidth="1.8" />
      <path d="M51,183.5 L66,197 L51,210.5 L36,197 Z" fill="#7a4424" stroke="url(#hv-brass)" strokeWidth="1.1" />
      {[
        [51, 171],
        [80, 197],
        [51, 223],
        [22, 197],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" fill="url(#hv-stud)" />
      ))}
      <circle cx="51" cy="197" r="3.2" fill="url(#hv-stud)" />
    </g>
  )
}

function Lotus({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={petal(2, 9, 3)} transform={`rotate(${i * 60 + 30})`} fill="#4f2610" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 60})`}>
          <path d={petal(2.5, 14, 5)} fill="#85492a" stroke="#1f0d05" strokeWidth=".7" />
          <path d={petal(5, 11.5, 1.8)} fill="rgba(255,206,150,.22)" />
        </g>
      ))}
      <circle r="2.8" fill="url(#hv-stud)" />
    </g>
  )
}

// Kundi: the ring is drawn first so it hangs from behind the rosette. The
// ring group's top edge (y 257) is its pivot, inside the rosette.
function Kundi() {
  return (
    <g>
      <g className="kundi-ring">
        <circle cx="83" cy="265" r="8" fill="none" stroke="url(#hv-brass)" strokeWidth="2.4" />
        <circle cx="83" cy="273.2" r="1.6" fill="url(#hv-stud)" />
      </g>
      <g transform="translate(83 254)">
        {Array.from({ length: 8 }, (_, i) => (
          <circle
            key={i}
            cy="-3.1"
            r="1.5"
            transform={`rotate(${i * 45})`}
            fill="url(#hv-brass)"
            stroke={DARK_BRASS}
            strokeWidth=".3"
          />
        ))}
        <circle r="2.8" fill="url(#hv-stud)" />
      </g>
    </g>
  )
}

// One teak-and-brass leaf of the haveli door, drawn as the left leaf and
// mirrored for the right so the hinge sits on the outside.
export default function DoorLeaf({ side }) {
  return (
    <svg className="leaf-art" viewBox="0 0 100 350" preserveAspectRatio="none" aria-hidden="true">
      <g transform={side === 'r' ? 'matrix(-1 0 0 1 100 0)' : undefined}>
        <path d={LEAF} fill="url(#hv-teak)" />
        <path d={LEAF} fill="url(#hv-grain)" />

        <path d={MOULD} fill="none" stroke="#24100a" strokeWidth="2.2" />
        <path d={MOULD_LIT} fill="none" stroke="rgba(255,206,150,.16)" strokeWidth="1" />

        <path d={TOP.field} fill="url(#hv-panel)" />
        <path d={TOP.shadow} fill={SHADOW} />
        <path d={TOP.lit} fill={LIT} />
        <path d={TOP.inner} fill="none" stroke="rgba(255,206,150,.1)" strokeWidth=".8" />

        <Panel y={164} h={66}>
          <Diamond />
        </Panel>
        <Panel y={246} h={52}>
          <Lotus x={44} y={272} />
        </Panel>
        <Panel y={312} h={24} />

        <rect x="95" y="150" width="5" height="200" fill="#2a1209" />
        <rect x="95" y="150" width=".7" height="200" fill="rgba(255,206,150,.14)" />
        {STILE_STUDS.map((y) => (
          <circle key={y} cx="97.6" cy={y} r="1.3" fill="url(#hv-stud)" />
        ))}
        {/* the seam between the leaves */}
        <rect x="99.3" width=".7" height="350" fill="rgba(0,0,0,.45)" />

        {STRAPS.map((y) => (
          <Strap key={y} y={y} />
        ))}
        {ARCH_STUDS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={r2(x)} cy={r2(y)} r="1.6" fill="url(#hv-stud)" />
        ))}

        <Sun />

        <rect y="341" width="100" height="9" fill="url(#hv-brass)" />
        <rect y="341" width="100" height=".8" fill="#3b2507" />
        {KICK_STUDS.map((x) => (
          <circle key={x} cx={x} cy="345.8" r="1.6" fill="url(#hv-stud)" />
        ))}

        <Kundi />

        <path className="leaf-shade" d={LEAF} fill="#000" />
      </g>
    </svg>
  )
}
