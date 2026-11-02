import { archPath } from './geometry'

const LINE = '#9a6434'
const r2 = (n) => Math.round(n * 100) / 100

// A pointed petal from radius `from` out to `to`, pointing up
const petal = (from, to, w) => {
  const a = r2(-from - (to - from) * 0.3)
  const b = r2(-from - (to - from) * 0.75)
  return `M0,${-from} C${w},${a} ${r2(w * 0.6)},${b} 0,${-to} C${r2(-w * 0.6)},${b} ${-w},${a} 0,${-from} Z`
}

// Carved stone flower for the spandrels, in tonal sandstone
function Medallion({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="14" fill="#c48d58" stroke="#8a5528" strokeWidth=".7" />
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={petal(4, 13, 3.4)}
          transform={`rotate(${i * 30})`}
          fill="#f1d3a1"
          stroke="#a46d3a"
          strokeWidth=".5"
        />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          d={petal(2, 8.5, 2.6)}
          transform={`rotate(${i * 45 + 22.5})`}
          fill="#d9a76f"
          stroke={LINE}
          strokeWidth=".5"
        />
      ))}
      <circle r="3.2" fill="#a8703f" />
      <circle cx="-.6" cy="-.6" r="1.3" fill="#f6dcae" />
    </g>
  )
}

function Plinth({ x }) {
  return (
    <g>
      <rect x={x} y="404" width="30" height="36" fill="#ecca97" stroke="#a8703f" strokeWidth=".8" />
      <rect x={x} y="404" width="30" height="1.6" fill="#fff0d0" />
      <rect x={x + 4} y="411" width="22" height="24" fill="none" stroke="rgba(150,95,45,.45)" strokeWidth=".8" />
      <path d={`M${x + 15},415 L${x + 22},423 L${x + 15},431 L${x + 8},423 Z`} fill="#d9ab73" stroke={LINE} strokeWidth=".5" />
    </g>
  )
}

// Carved sandstone frame around the doorway. It sits on top of the doors, so
// the opening is masked out exactly along archPath(0).
export default function Casing() {
  return (
    <svg className="casing" viewBox="0 0 300 440" aria-hidden="true">
      <defs>
        <mask id="hv-casing-hole" maskUnits="userSpaceOnUse" x="-10" y="0" width="320" height="440">
          <rect x="-10" width="320" height="440" fill="#fff" />
          <path d={archPath(0)} fill="#000" />
        </mask>
        <linearGradient id="hv-casing-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6b3812" stopOpacity=".4" />
          <stop offset=".09" stopColor="#6b3812" stopOpacity="0" />
          <stop offset=".91" stopColor="#6b3812" stopOpacity="0" />
          <stop offset="1" stopColor="#6b3812" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="hv-casing-reveal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1006" />
          <stop offset="1" stopColor="#4a220e" />
        </linearGradient>
      </defs>

      <g mask="url(#hv-casing-hole)">
        <rect y="40" width="300" height="400" fill="url(#hv-stone)" />
        {/* shifted so the carve pattern's dots run down the middle of the band */}
        <rect
          x="1"
          y="41"
          width="288"
          height="394"
          transform="translate(5 5)"
          fill="url(#hv-carve)"
          stroke="rgba(110,60,25,.5)"
          strokeWidth=".8"
        />
        <rect x="14" y="54" width="272" height="386" fill="url(#hv-stone)" />
        <rect x="14" y="54" width="272" height="386" fill="rgba(120,62,22,.12)" stroke="rgba(130,75,35,.55)" strokeWidth=".8" />
        <rect y="40" width="300" height="400" fill="url(#hv-casing-edge)" />

        <path d={archPath(24)} fill="#f3d9ad" stroke={LINE} strokeWidth=".8" />
        <path d={archPath(16)} fill="url(#hv-carve)" stroke={LINE} strokeWidth=".8" />
        <path d={archPath(8)} fill="#e2b680" stroke={LINE} strokeWidth=".8" />
        <path d={archPath(6)} fill="none" stroke="rgba(255,240,210,.6)" strokeWidth=".6" />
        <path d={archPath(3)} fill="url(#hv-casing-reveal)" stroke="#24100a" strokeWidth=".6" />

        <Medallion x={54} y={84} />
        <Medallion x={246} y={84} />

        {/* lotus bud crowning the arch */}
        <g transform="translate(150 61)">
          {[-38, 38, 0].map((a) => (
            <path key={a} d={petal(0, a ? 9 : 12, 3)} transform={`rotate(${a})`} fill="#f2d6a8" stroke={LINE} strokeWidth=".5" />
          ))}
        </g>

        <Plinth x={0} />
        <Plinth x={270} />
      </g>

      {/* cornice ledge, a touch wider than the wall below */}
      <rect x="-6" y="44" width="312" height="2.6" fill="rgba(60,22,6,.45)" />
      <rect x="-6" y="34" width="312" height="10" fill="url(#hv-stone)" stroke={LINE} strokeWidth=".7" />
      <rect x="-6" y="34" width="312" height="1.6" fill="#fbe9c8" />
      <rect x="-6" y="40.5" width="312" height=".7" fill="rgba(140,85,40,.5)" />

      {/* brass welcome plaque */}
      <rect x="93" y="5.5" width="116" height="34" rx="5" fill="rgba(40,14,4,.35)" />
      <rect x="92" y="4" width="116" height="34" rx="5" fill="url(#hv-brass)" stroke="#5a3a10" strokeWidth="1.2" />
      <rect x="95.5" y="7.5" width="109" height="27" rx="3" fill="none" stroke="rgba(74,47,12,.65)" strokeWidth=".6" />
      <circle cx="100" cy="21" r="2.1" fill="url(#hv-stud)" />
      <circle cx="200" cy="21" r="2.1" fill="url(#hv-stud)" />
      {/* a lit lower edge makes the letters read as engraved */}
      <g fontFamily="'Noto Serif Gurmukhi', serif" fontSize="13" fontWeight="600" textAnchor="middle">
        <text x="150" y="26.2" lang="pa" fill="rgba(255,240,200,.45)">
          ਜੀ ਆਇਆਂ ਨੂੰ
        </text>
        <text x="150" y="25.6" lang="pa" fill="#3d2408">
          ਜੀ ਆਇਆਂ ਨੂੰ
        </text>
      </g>
    </svg>
  )
}
