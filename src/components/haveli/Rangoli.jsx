import './decor.css'

// A petal pointing outward (towards −y before it's rotated into a ring)
const petal = (len, w) => `M0,0 Q${w},${-len / 2} 0,${-len} Q${-w},${-len / 2} 0,0Z`

// A dot as a path, so ring() can place dots the same way it places petals
const dot = (r) => `M${-r},0 a${r},${r} 0 1,0 ${r * 2},0 a${r},${r} 0 1,0 ${-r * 2},0Z`

const ring = (n, r, d, fill, rot = 0) =>
  Array.from({ length: n }, (_, i) => (
    <path key={i} d={d} fill={fill} transform={`rotate(${rot + (360 / n) * i}) translate(0 ${-r})`} />
  ))

// Flat powder-colour rangoli, centred on 0,0 so it can be laid on the floor with rotateX
export default function Rangoli() {
  return (
    <svg className="rangoli" viewBox="-100 -100 200 200" aria-hidden="true">
      {ring(24, 80, petal(19, 20), '#f97316')}
      {ring(24, 80, petal(11, 9), '#fde047', 7.5)}
      {ring(24, 89, dot(1.7), '#fff7ed')}
      <circle r="82" fill="#be185d" />
      {ring(48, 76, dot(2), '#fde68a')}

      {ring(16, 56, petal(18, 24), '#fbbf24')}
      {ring(16, 58, petal(11, 11), '#f97316')}
      {ring(16, 70, dot(1.6), '#fff7ed', 11.25)}
      <circle r="58" fill="#15803d" />

      {ring(12, 40, petal(17, 21), '#f472b6')}
      {ring(12, 42, petal(9, 9), '#db2777')}
      {ring(12, 52, dot(1.6), '#fef3c7', 15)}
      <circle r="42" fill="#f97316" />
      <circle r="39.6" fill="none" stroke="#fff7ed" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0 4.4" />

      {ring(8, 22, petal(15, 18), '#fde047')}
      {ring(8, 31, dot(1.6), '#be185d', 22.5)}
      <circle r="22" fill="#be185d" />
      {ring(8, 17, dot(1.3), '#fde68a', 22.5)}
      <circle r="12" fill="#fbbf24" />
      <circle r="5" fill="#f97316" />
    </svg>
  )
}
