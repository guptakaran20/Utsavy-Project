import { useId } from 'react'
// Hand-built SVG florals: a rose-and-jasmine corner bouquet and a lotus garland divider.
const petalRing = (n, rx, ry, dist, fill, rot = 0, op = 1) =>
  Array.from({ length: n }, (_, i) => (
    <ellipse key={i} cx="0" cy={-dist} rx={rx} ry={ry} fill={fill} opacity={op} transform={`rotate(${rot + (360 / n) * i})`} />
  ))

function Rose({ x, y, s = 1, hue = 'pink' }) {
  const c = hue === 'pink' ? ['#f48fb1', '#f06292', '#ec407a', '#c2185b'] : ['#ffd0dc', '#ffb3c6', '#ff94b0', '#e8587f']
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r="23" fill="#00000012" cy="2" />
      {petalRing(7, 11, 13, 13, c[0], 0)}
      {petalRing(6, 9.5, 11, 9, c[1], 20)}
      {petalRing(5, 7.5, 8.5, 5.5, c[2], 8)}
      <circle r="5.2" fill={c[3]} />
      <path d="M-4,0 a4,4 0 1 1 8,0 a2.6,2.6 0 1 1 -5,0.4" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth=".9" />
      <path d="M-14,-6 q8,-8 20,-5 M-12,8 q10,6 22,-2" stroke="#fff" strokeOpacity=".28" strokeWidth=".9" fill="none" />
    </g>
  )
}
function Jasmine({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {petalRing(5, 5, 8, 7, '#fffdf7', 10)}
      {petalRing(5, 4, 6.5, 6, '#fff', 46, 0.9)}
      <circle r="3.2" fill="#f2c230" />
      <circle r="1.3" fill="#c98a14" />
    </g>
  )
}
const Leaf = ({ x, y, r, s = 1, d = 0 }) => (
  <path d="M0,0 C10,-9 26,-8 34,0 C26,9 10,8 0,0Z M2,0 H32" transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill={d ? '#2f7d46' : '#3f9a55'} stroke="#1f5a30" strokeWidth=".7" strokeOpacity=".6" />
)

// top-left corner; mirror with CSS (scaleX/scaleY) for the other three
export function RoseCorner({ className = '' }) {
  return (
    <svg className={`florals florals--corner ${className}`} viewBox="0 0 300 300" aria-hidden="true">
      {[[20, 150, -80, 1.5], [40, 110, -60, 1.6], [70, 70, -45, 1.7], [110, 40, -28, 1.6], [150, 18, -10, 1.4], [18, 200, -95, 1.3], [60, 140, -70, 1.2]].map(([x, y, r, s], i) => <Leaf key={i} x={x} y={y} r={r} s={s} d={i % 2} />)}
      {[[150, 120, 22, 155], [96, 156, 210, 150], [200, 70, 330, 140], [60, 230, 100, 130], [120, 200, 160, 120]].map(([x, y, r, s], i) => <Leaf key={`l${i}`} x={x} y={y} r={r} s={s / 100} d={i % 2} />)}
      <Jasmine x={206} y={150} s={1.15} /><Jasmine x={170} y={196} s={1.05} /><Jasmine x={250} y={96} s={1} /><Jasmine x={90} y={238} s={1.1} /><Jasmine x={42} y={252} s={.9} />
      <Rose x={72} y={92} s={2.3} />
      <Rose x={150} y={52} s={1.5} hue="light" />
      <Rose x={58} y={176} s={1.55} hue="light" />
      <Rose x={146} y={136} s={1.25} />
      <circle cx="226" cy="40" r="5" fill="#e8587f" /><circle cx="30" cy="236" r="5" fill="#e8587f" /><circle cx="262" cy="168" r="3.6" fill="#f48fb1" />
    </svg>
  )
}

// lotus in the middle with leaves and jasmine either side
export function LotusGarland({ className = '' }) {
  // each garland gets its own gradient id: a shared id resolves to the first copy on the page, which may be hidden
  const pid = `lt-p-${useId().replace(/:/g, '')}`
  return (
    <svg className={`florals florals--lotus ${className}`} viewBox="0 0 320 100" aria-hidden="true">
      <defs>
        <linearGradient id={pid} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#f06292" /><stop offset="1" stopColor="#ffd0dc" /></linearGradient>
      </defs>
      {[[-58, 1], [-34, 0.9], [34, 0.9], [58, 1]].map(([r, s], i) => <Leaf key={i} x={160} y={66} r={r > 0 ? -r + 180 : 180 - r} s={s * 1.9} d={i % 2} />)}
      {[-72, 72].map((a) => <ellipse key={a} cx="160" cy="46" rx="11" ry="28" fill={`url(#${pid})`} stroke="#d81b60" strokeWidth=".6" transform={`rotate(${a} 160 74)`} />)}
      {[-38, 38].map((a) => <ellipse key={a} cx="160" cy="42" rx="12" ry="30" fill={`url(#${pid})`} stroke="#d81b60" strokeWidth=".6" transform={`rotate(${a} 160 74)`} />)}
      <ellipse cx="160" cy="40" rx="13" ry="32" fill={`url(#${pid})`} stroke="#d81b60" strokeWidth=".6" />
      <ellipse cx="160" cy="66" rx="9" ry="5" fill="#c6a21d" />
      {[[40, 70, .9], [76, 62, 1], [108, 74, .8], [214, 74, .8], [244, 62, 1], [280, 70, .9]].map(([x, y, s], i) => <Jasmine key={i} x={x} y={y} s={s} />)}
      <path d="M8,82 Q80,72 150,84 M170,84 Q240,72 312,82" stroke="#3f9a55" strokeWidth="2.2" fill="none" />
    </svg>
  )
}
