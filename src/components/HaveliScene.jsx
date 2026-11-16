import { ARCH_PATH } from './ArchFrame'
import { Bhangra, Giddha } from './Folk'
import './HaveliScene.css'

const WIN = 'M0,18 V7 A5,5 0 0 1 10,7 V18Z' // small arched window, 10 x 18
const r1 = (n) => Math.round(n * 10) / 10

// fairy lights sagging between two points on the rampart
const lights = (x0, x1, y, sag, n) => {
  const c = 2 * sag - y
  return Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n
    return [r1((1 - t) ** 2 * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t ** 2 * x1), r1((1 - t) ** 2 * y + 2 * (1 - t) * t * c + t ** 2 * y)]
  })
}

// merlons (kangura) along a parapet: x range, y of the parapet line
const Merlons = ({ x0, x1, y, step = 14, w = 8, h = 8, fill = '#b4663a' }) => (
  <g fill={fill}>
    {Array.from({ length: Math.floor((x1 - x0) / step) }, (_, i) => (
      <path key={i} d={`M${x0 + i * step + 2},${y} v-${h - 3} q${w / 2 - 2},-3 ${w - 4},0 v${h - 3}Z`} />
    ))}
  </g>
)

// A round bastion with a rooftop chhatri
function Bastion({ cx, w = 44 }) {
  const x = cx - w / 2
  return (
    <g>
      <rect x={x} y="108" width={w} height="128" fill="url(#hs-tower)" />
      <rect x={x - 3} y="108" width={w + 6} height="5" fill="#f3d68a" opacity=".9" />
      <Merlons x0={x - 3} x1={x + w + 3} y="108" step={12} w={7} h={9} fill="#a85a34" />
      <path d={`M${x},170 H${x + w}`} stroke="#f3d68a" strokeWidth="1.2" opacity=".7" />
      <path className="win" d={WIN} transform={`translate(${cx - 5} 128)`} fill="url(#hs-glow)" />
      {[168, 192].map((y) => <rect key={y} className="win" x={cx - 1.5} y={y} width="3" height="14" rx="1.4" fill="url(#hs-glow)" />)}
      {/* chhatri */}
      <rect x={cx - 15} y="86" width="30" height="3" fill="#f3d68a" />
      {[-13, -4.5, 4.5, 13].map((d) => <rect key={d} x={cx + d - 1} y="89" width="2" height="16" fill="#d9b06a" />)}
      <path d={`M${cx - 19},86 Q${cx},52 ${cx + 19},86Z`} fill="#8c2f24" />
      <path d={`M${cx},58 V46`} stroke="#f3d68a" strokeWidth="1.3" />
      <circle cx={cx} cy="44" r="2.4" fill="#f3d68a" />
    </g>
  )
}

// The mehfil on the ramparts: two pairs a side, face to face, raised arms reaching towards each other.
const RAMPART = [
  [Giddha, 225, true, { kameez: '#e0218a', salwar: '#1f9d73' }, 0],
  [Bhangra, 249, false, { pagri: '#d81b74', lungi: '#f2c230' }, 0.18],
  [Bhangra, 391, true, { pagri: '#f28c28', lungi: '#1f6b50' }, 0.09],
  [Giddha, 415, false, { kameez: '#f29b1d', salwar: '#c8323f', dupatta: '#ff6fa8' }, 0.27],
]
function Rampart() {
  const sc = 0.64
  return (
    <g>
      {RAMPART.map(([Who, x, flip, props, delay]) => (
        <g key={x} transform={`translate(${x} 150) scale(${flip ? -sc : sc} ${sc})`}>
          <g className="dancer" style={{ animationDelay: `${delay}s` }}>
            <Who {...props} />
          </g>
        </g>
      ))}
    </g>
  )
}

// The fort at dusk: a sloped sandstone plinth, a long crenellated curtain wall, two domed bastions and a grand
// gateway tower; the families dance on the ramparts. Pure SVG, anchored to the bottom of its box.
export function HaveliSkyline() {
  return (
    <svg className="scene" viewBox="0 0 640 260" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <defs>
        <linearGradient id="hs-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a65e38" />
          <stop offset="1" stopColor="#4c1b12" />
        </linearGradient>
        <linearGradient id="hs-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e2f1e" />
          <stop offset=".35" stopColor="#b9703f" />
          <stop offset="1" stopColor="#5a2418" />
        </linearGradient>
        <linearGradient id="hs-gate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9703f" />
          <stop offset="1" stopColor="#4c1b12" />
        </linearGradient>
        <radialGradient id="hs-glow" cx="50%" cy="60%" r="60%">
          <stop offset="0" stopColor="#fff2c0" />
          <stop offset=".55" stopColor="#ffd36a" />
          <stop offset="1" stopColor="#f29b1d" />
        </radialGradient>
        <radialGradient id="hs-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffc86a" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffc86a" stopOpacity="0" />
        </radialGradient>
        <pattern id="hs-mustard" width="7" height="7" patternUnits="userSpaceOnUse">
          <rect width="7" height="7" fill="#d9a413" />
          <circle cx="1.6" cy="1.8" r="1" fill="#ffd23f" /><circle cx="5.2" cy="3.6" r="1" fill="#ffe27a" /><circle cx="3" cy="6" r=".9" fill="#f6c423" />
        </pattern>
      </defs>

      <ellipse cx="320" cy="150" rx="300" ry="120" fill="url(#hs-halo)" />

      {/* sloped plinth with stone courses */}
      <path d="M146,236 L494,236 L478,212 L162,212Z" fill="#6e2a1c" />
      <path d="M151,226 H489 M156,219 H484" stroke="#000" strokeOpacity=".25" strokeWidth=".8" />

      {/* curtain wall */}
      <rect x="162" y="148" width="316" height="66" fill="url(#hs-wall)" />
      <path d="M162,172 H478" stroke="#f3d68a" strokeWidth="2.2" opacity=".75" />
      <path d="M162,200 H478" stroke="#000" strokeOpacity=".2" strokeWidth=".8" />
      {[214, 234, 254, 384, 404, 424].map((x, i) => (
        <rect key={x} className="win" x={x} y="178" width="3" height="15" rx="1.4" fill="url(#hs-glow)" style={{ animationDelay: `${(i % 5) * -0.7}s` }} />
      ))}
      <rect x="162" y="147" width="316" height="3.4" fill="#f3d68a" />

      {/* the dancers stand on the wall-walk, merlons in front of their feet */}
      <Rampart />
      <Merlons x0="162" x1="478" y="147" step="14" w="8" h="9" fill="#b4663a" />
      {/* fairy lights along the wall */}
      <path d="M206,142 Q236,168 266,142 M374,142 Q404,168 434,142" fill="none" stroke="#5a2616" strokeWidth=".7" />
      {[...lights(206, 266, 142, 155, 6), ...lights(374, 434, 142, 155, 6)].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y + 1} r="1.9" fill="#ffd36a" />
      ))}

      <Bastion cx={186} />
      <Bastion cx={454} />

      {/* the grand gateway tower */}
      <rect x="266" y="76" width="108" height="160" fill="url(#hs-gate)" />
      <rect x="262" y="76" width="116" height="5" fill="#f3d68a" opacity=".95" />
      <Merlons x0="262" x1="378" y="76" step="14" w="8" h="10" fill="#a85a34" />
      {/* chhatris and dome on the gateway roof */}
      <rect x="296" y="52" width="48" height="4" fill="#f3d68a" />
      {[300, 312, 324, 336].map((x) => <rect key={x} x={x} y="56" width="2.2" height="18" fill="#d9b06a" />)}
      <path d="M292,52 Q320,10 348,52Z" fill="#8c2f24" />
      <path d="M320,18 V6" stroke="#f3d68a" strokeWidth="1.4" />
      <path className="flag" d="M320,6 L336,10.5 L320,15Z" fill="#f2c230" />
      {[274, 360].map((x) => (
        <g key={x}>
          <rect x={x} y="64" width="12" height="3" fill="#f3d68a" />
          <path d={`M${x + 1},64 Q${x + 6},48 ${x + 11},64Z`} fill="#8c2f24" />
        </g>
      ))}
      {/* jharokha window and balcony */}
      <rect x="296" y="88" width="48" height="58" rx="2" fill="#4a0b17" />
      <g transform="translate(302 92) scale(.36 .357)">
        <path d={ARCH_PATH} fill="url(#hs-glow)" className="win win--big" />
        <path d={ARCH_PATH} fill="none" stroke="#f3d68a" strokeWidth="3" />
        <path d="M50,14 V128 M4,92 H96" stroke="#b8862f" strokeWidth="1.8" opacity=".7" />
      </g>
      {[274, 354].map((x) => <path key={x} className="win" d={WIN} transform={`translate(${x} 96)`} fill="url(#hs-glow)" />)}
      <rect x="290" y="146" width="60" height="5" fill="#f3d68a" />
      <rect x="294" y="151" width="52" height="3" fill="#7a3322" />
      {/* hanging banners */}
      {[270, 360].map((x) => (
        <path key={x} d={`M${x},100 h10 v34 l-5,-6 l-5,6Z`} fill="#7a1426" stroke="#f3d68a" strokeWidth=".8" />
      ))}
      {/* the great arched gate */}
      <g transform="translate(290 150) scale(.6 .614)">
        <path d={ARCH_PATH} fill="url(#hs-glow)" className="win win--big" />
        <path d={ARCH_PATH} fill="none" stroke="#f3d68a" strokeWidth="3.5" />
        <path d={ARCH_PATH} fill="none" stroke="#6e2a1c" strokeWidth="1.2" transform="translate(50 70) scale(.88) translate(-50 -70)" />
        <path d="M50,26 V140 M24,70 V140 M76,70 V140" stroke="#7a3322" strokeWidth="2" opacity=".8" />
        {[96, 118].map((y) => <path key={y} d={`M10,${y} H90`} stroke="#7a3322" strokeWidth="1.6" opacity=".7" />)}
      </g>
      {/* steps up to the gate */}
      <path d="M284,236 L356,236 L350,230 L290,230Z" fill="#f3d68a" opacity=".55" />

      {/* kikar trees and a mud house at the fort's feet */}
      <g fill="#33100f" opacity=".92">
        {[[132, 220, 13], [152, 224, 10], [492, 224, 10], [512, 219, 14]].map(([x, y, r], i) => (
          <g key={i}><rect x={x - 1.4} y={y} width="2.8" height={236 - y} /><ellipse cx={x} cy={y} rx={r} ry={r * 0.8} /></g>
        ))}
      </g>
      {/* the dusty lane */}
      <rect x="0" y="236" width="640" height="24" fill="#3a2012" />
      <path d="M0,236.4 H640" stroke="#7a4a2a" strokeWidth=".9" opacity=".8" />
      {/* a peepal and a Persian-wheel well keep the fort in its village */}
      <g>
        <path d="M30,236 Q27,212 31,200 L37,200 Q40,214 38,236Z" fill="#3a1d12" />
        {[[34, 188, 22], [16, 198, 14], [52, 198, 15], [28, 178, 13], [44, 180, 12]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.82} fill={i % 2 ? '#1d3a2a' : '#25472f'} />
        ))}
      </g>
      <g transform="translate(606 236)">
        <rect x="-16" y="-14" width="32" height="14" fill="#8a4a2e" />
        <path d="M-18,-14 H18" stroke="#d4a24c" strokeWidth="1.4" />
        <path d="M-12,-14 V-40 M12,-14 V-40 M-12,-40 H12" stroke="#5a2616" strokeWidth="2" fill="none" />
        <g className="wheel" style={{ transformOrigin: '0px -30px' }}>
          <circle cx="0" cy="-30" r="12" fill="none" stroke="#6e3f14" strokeWidth="1.6" />
          <path d="M-12,-30 H12 M0,-42 V-18 M-8.5,-38.5 L8.5,-21.5 M8.5,-38.5 L-8.5,-21.5" stroke="#6e3f14" strokeWidth="1" />
          {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x="-1.4" y="-43.4" width="2.8" height="4.4" fill="#b8862f" transform={`rotate(${a} 0 -30)`} />)}
        </g>
      </g>
    </svg>
  )
}
