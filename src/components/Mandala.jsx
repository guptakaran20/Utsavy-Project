// A petal pointing "up" (outwards once rotated into a ring), from 0 to -len
const petal = (len, width) =>
  `M0 0C${width} ${-len * 0.35} ${width} ${-len * 0.7} 0 ${-len}C${-width} ${-len * 0.7} ${-width} ${-len * 0.35} 0 0Z`

function Ring({ count, radius, children }) {
  return (
    <g className="mandala__ring">
      {Array.from({ length: count }, (_, i) => (
        <g key={i} transform={`rotate(${(360 / count) * i}) translate(0 ${-radius})`}>
          {children}
        </g>
      ))}
    </g>
  )
}

// Line-art mandala drawn in currentColor. Each `.mandala__ring` can be rotated independently.
export default function Mandala({ className = '' }) {
  return (
    <svg className={`mandala ${className}`} viewBox="-200 -200 400 400" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <g className="mandala__ring">
          <circle r="197" />
          <circle r="191" strokeDasharray="1.5 5" />
        </g>
        <Ring count={36} radius={158}>
          <path d={petal(30, 8)} />
          <circle cy="-36" r="1.8" fill="currentColor" />
        </Ring>
        <Ring count={24} radius={124}>
          <path d="M-14 0Q0 -26 14 0" />
          <path d="M-8 0Q0 -14 8 0" />
        </Ring>
        <circle r="152" />
        <circle r="122" strokeDasharray="2 4" />
        <Ring count={16} radius={70}>
          <path d={petal(48, 18)} />
          <path d={petal(32, 9)} />
        </Ring>
        <circle r="66" />
        <Ring count={12} radius={30}>
          <path d={petal(30, 11)} />
        </Ring>
        <circle r="28" strokeDasharray="3 3" />
        <Ring count={8} radius={0}>
          <path d={petal(22, 8)} />
        </Ring>
        <circle r="5" fill="currentColor" />
      </g>
    </svg>
  )
}
