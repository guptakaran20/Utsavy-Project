// Flat folk-art Punjabi figures, feet at (0,0), ~85 units tall: bhangra jatt, giddha kudi and dholi.
// Shared by the gate (carpet scene) and the hero (baraat). Colours come in as props so a crowd isn't a clone army.
export const SKIN = '#9a5a35'
const HAIR = '#1c1410'
const GOLD = '#f3d68a'
const sleeve = (c, w = 5.4) => ({ fill: 'none', stroke: c, strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' })

// juttis: curled-toe leather shoes
const Jutti = ({ x = 0, y = 0, lift = 0, c = '#c8323f' }) => (
  <g transform={`translate(${x} ${y - lift})`}>
    <path d="M-5,0 H6 Q9.5,-.6 10.5,-5 Q12,1.2 8.4,2.2 H-5Z" fill={c} />
    <path d="M-5,.4 H8" stroke={GOLD} strokeWidth=".7" />
  </g>
)

const Pagri = ({ c, tail = true }) => (
  <g>
    <path d="M-7.8,-70 Q-8.4,-84 0,-84.6 Q8.4,-84 7.8,-70 Q0,-67.4 -7.8,-70Z" fill={c} />
    <path d="M-7.2,-74.5 Q0,-71.6 7.2,-74.5 M-6.8,-79 Q0,-76.2 6.8,-79" stroke="#fff" strokeOpacity=".35" strokeWidth=".9" fill="none" />
    {tail && <path d="M3,-83.5 Q6.5,-91.5 12,-88 L8.4,-79.5Z" fill={c} />}
  </g>
)

// Bhangra: pagri with turla, full beard, waistcoat over kurta, flared lungi, one arm in the air, one hand on the hip
export function Bhangra({ pagri = '#f28c28', kurta = '#fbf1da', lungi = '#1f6b50', vest = '#5a0f1c' }) {
  return (
    <g>
      <path d="M-7,-62 L-19,-78" {...sleeve(kurta)} />
      <path d="M-17.4,-75.8 L-20.4,-80.6" {...sleeve(SKIN, 3.4)} />
      <circle cx="-20.9" cy="-81.4" r="2.4" fill={SKIN} />
      <path d="M-9,-40 L9,-40 L15,-3 Q0,1 -15,-3Z" fill={lungi} />
      <path d="M-14.4,-8.4 Q0,-4.4 14.4,-8.4" stroke={GOLD} strokeWidth="2" fill="none" />
      <path d="M-3,-40 L-5,-3 M3,-40 L5,-3" stroke="#000" strokeOpacity=".16" strokeWidth=".9" />
      <Jutti x={-7} y={-1} />
      <Jutti x={8} y={-1} lift={5} />
      <path d="M-8.5,-63 L8.5,-63 L10.6,-36 L-10.6,-36Z" fill={kurta} />
      <path d="M-8.5,-63 L-3.4,-63 L-4.6,-36 L-10.6,-36Z M8.5,-63 L3.4,-63 L4.6,-36 L10.6,-36Z" fill={vest} stroke={GOLD} strokeWidth=".7" />
      <path d="M-3,-63 L0,-58.5 L3,-63" stroke={GOLD} strokeWidth=".9" fill="none" />
      <path d="M8,-62 L16.5,-52 L10.4,-43.4" {...sleeve(kurta)} />
      <circle cx="10" cy="-42.4" r="2.2" fill={SKIN} />
      <path d="M-2,-65 h4 v4.4 h-4z" fill={SKIN} />
      <circle cx="0" cy="-69.6" r="5.1" fill={SKIN} />
      <path d="M-5.1,-70 Q-6.4,-60.6 0,-59 Q6.4,-60.6 5.1,-70 Q0,-65.4 -5.1,-70Z" fill={HAIR} />
      <path d="M-2.6,-66.6 Q0,-65.4 2.6,-66.6" stroke={HAIR} strokeWidth=".9" fill="none" />
      <circle cx="-1.8" cy="-70.4" r=".5" fill={HAIR} /><circle cx="1.8" cy="-70.4" r=".5" fill={HAIR} />
      <Pagri c={pagri} />
    </g>
  )
}

// Giddha: kudi in a patiala salwar-kameez, phulkari dupatta over the head, parandi braid, bangles, clapping
export function Giddha({ kameez = '#d81b74', salwar = '#f29b1d', dupatta = '#ffb300' }) {
  return (
    <g>
      <path d="M-9,-40 Q-19.5,-20 -13.4,-3 L-3,-3 Q-1.2,-18 0,-26 Q1.2,-18 3,-3 L13.4,-3 Q19.5,-20 9,-40Z" fill={salwar} />
      <path d="M-9,-36 Q-12.4,-20 -9.4,-4 M9,-36 Q12.4,-20 9.4,-4" stroke="#000" strokeOpacity=".2" strokeWidth=".8" fill="none" />
      <path d="M-13.2,-5 H-3.2 M3.2,-5 H13.2" stroke={GOLD} strokeWidth="1.4" />
      <Jutti x={-8.5} y={-1} c="#d4a24c" />
      <Jutti x={7} y={-1} c="#d4a24c" />
      <path d="M-7.6,-63 Q0,-60 7.6,-63 L11.6,-33 Q0,-30 -11.6,-33Z" fill={kameez} />
      <path d="M-4.2,-63 Q0,-57 4.2,-63" stroke={GOLD} strokeWidth="1" fill="none" />
      <path d="M-11.3,-34.4 Q0,-31.4 11.3,-34.4" stroke={GOLD} strokeWidth="1.6" fill="none" />
      <path d="M-7,-61 L-12.4,-52 L-3.4,-55.4 M7,-61 L12.4,-52 L3.4,-55.4" {...sleeve(kameez, 4.4)} />
      <circle cx="-2.4" cy="-55.6" r="2" fill={SKIN} /><circle cx="2.4" cy="-55.6" r="2" fill={SKIN} />
      <circle cx="-5.2" cy="-54.3" r="1.5" fill="none" stroke={GOLD} strokeWidth=".8" /><circle cx="5.2" cy="-54.3" r="1.5" fill="none" stroke={GOLD} strokeWidth=".8" />
      <path d="M-2,-65 h4 v4 h-4z" fill={SKIN} />
      <circle cx="0" cy="-69.6" r="4.9" fill={SKIN} />
      <circle cx="-1.8" cy="-70" r=".5" fill={HAIR} /><circle cx="1.8" cy="-70" r=".5" fill={HAIR} />
      <circle cx="0" cy="-72.4" r=".75" fill="#c8102e" />
      <path d="M-1.6,-66.4 Q0,-65.2 1.6,-66.4" stroke="#7a1426" strokeWidth=".7" fill="none" />
      <circle cx="-5" cy="-67" r="1.1" fill={GOLD} /><circle cx="5" cy="-67" r="1.1" fill={GOLD} />
      <path d="M-3.6,-66 Q-8.6,-56 -7.4,-40 L-6.8,-33.6" stroke={HAIR} strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M-6.8,-33.6 L-9,-29 M-6.8,-33.6 L-6.8,-28.6 M-6.8,-33.6 L-4.6,-29" stroke="#c8323f" strokeWidth=".9" />
      <path d="M-6.5,-71 Q-6.8,-82 0,-82.4 Q6.8,-82 6.5,-71 Q4,-74.4 0,-74.4 Q-4,-74.4 -6.5,-71Z" fill={dupatta} />
      <path d="M6,-74 Q13,-62 4.4,-50 Q-3.6,-43 -8.4,-34 L-5.2,-33 Q0,-44 8.4,-52 Q14.6,-63 7.4,-73Z" fill={dupatta} />
      <path d="M7,-70 Q12.4,-60 5,-50 Q-2,-43.4 -6.4,-35.4" stroke="#7a1426" strokeWidth=".9" strokeLinecap="round" strokeDasharray="1 2.2" fill="none" />
    </g>
  )
}

// Dholi: pagri, kurta and lungi, the dhol slung at the hip, dagga stick high
export function Dholi({ pagri = '#1e3a8a', kurta = '#fbf1da', lungi = '#c8323f', vest = '#14532d' }) {
  return (
    <g>
      <path d="M-9,-40 L9,-40 L14,-3 Q0,1 -14,-3Z" fill={lungi} />
      <path d="M-13.4,-8.4 Q0,-4.6 13.4,-8.4" stroke={GOLD} strokeWidth="2" fill="none" />
      <Jutti x={-6} y={-1} c="#7a3322" /><Jutti x={7} y={-1} c="#7a3322" />
      <path d="M-8.5,-63 L8.5,-63 L10.6,-36 L-10.6,-36Z" fill={kurta} />
      <path d="M-8.5,-63 L-3.4,-63 L-4.6,-36 L-10.6,-36Z M8.5,-63 L3.4,-63 L4.6,-36 L10.6,-36Z" fill={vest} stroke={GOLD} strokeWidth=".7" />
      <path d="M-6,-62 L-14,-46" stroke={GOLD} strokeWidth="1.1" />
      <path d="M8,-62 L15.4,-56 L17.4,-67" {...sleeve(kurta)} />
      <circle cx="17.6" cy="-68.4" r="2.2" fill={SKIN} />
      <path d="M17.6,-68.4 Q24,-73 22.4,-82" stroke="#d9b36a" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M-16.5,-47 Q-19.6,-40 -16.5,-32 L16.5,-32 Q19.6,-40 16.5,-47Z" fill="#a8672b" stroke="#7a4518" strokeWidth=".7" />
      <ellipse cx="-16.8" cy="-39.5" rx="2.4" ry="7.6" fill="#f3e6c8" stroke="#7a4518" strokeWidth=".6" />
      <ellipse cx="16.8" cy="-39.5" rx="2.4" ry="7.6" fill="#f3e6c8" stroke="#7a4518" strokeWidth=".6" />
      <path d="M-13.4,-46 L-8.4,-33 L-3.4,-46 L1.6,-33 L6.6,-46 L11.6,-33" stroke="#7a1426" strokeWidth=".9" fill="none" />
      <path d="M-8,-62 L-13,-50.6 L-7,-45" {...sleeve(kurta)} />
      <circle cx="-6.4" cy="-44.6" r="2.1" fill={SKIN} />
      <path d="M-6.4,-44.6 L-1,-49" stroke="#d9b36a" strokeWidth="1" strokeLinecap="round" />
      <path d="M-2,-65 h4 v4.4 h-4z" fill={SKIN} />
      <circle cx="0" cy="-69.6" r="5.1" fill={SKIN} />
      <path d="M-5.1,-70 Q-6.4,-60.6 0,-59 Q6.4,-60.6 5.1,-70 Q0,-65.4 -5.1,-70Z" fill={HAIR} />
      <circle cx="-1.8" cy="-70.4" r=".5" fill={HAIR} /><circle cx="1.8" cy="-70.4" r=".5" fill={HAIR} />
      <Pagri c={pagri} />
    </g>
  )
}
