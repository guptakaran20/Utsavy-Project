import './ArchFrame.css'
import { useId } from 'react'

// Multifoil (cusped) haveli arch. viewBox 0 0 100 140. The curved intrados is sampled into
// equal chords and each chord becomes a small lobe, so the outline has real cusps.
const buildPath = (lobes = 4) => {
  // left half of a pointed arch: springing (4,66) -> apex (50,4)
  const bez = (t) => {
    const [p0, p1, p2, p3] = [[4, 66], [4, 30], [28, 14], [50, 4]]
    const u = 1 - t
    return [0, 1].map((k) => u ** 3 * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t ** 3 * p3[k])
  }
  const pts = Array.from({ length: lobes + 1 }, (_, i) => bez(i / lobes))
  const r = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]) * 0.56
  let d = `M4 140V${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) d += `A${r(pts[i - 1], pts[i])} ${r(pts[i - 1], pts[i])} 0 0 0 ${pts[i][0]} ${pts[i][1]}`
  for (let i = pts.length - 2; i >= 0; i--) {
    const m = [100 - pts[i][0], pts[i][1]]
    d += `A${r(pts[i], pts[i + 1])} ${r(pts[i], pts[i + 1])} 0 0 0 ${m[0]} ${m[1]}`
  }
  return d + 'V140Z'
}
const PATH = buildPath(5)

// Wraps children inside the arch; the arch outline is drawn as double gold hairlines.
export default function ArchFrame({ children, className = '', fill = 'none', tone = 'gold' }) {
  const id = useId().replace(/:/g, '')
  return (
    <div className={`arch arch--${tone} ${className}`}>
      <svg className="arch__svg" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <clipPath id={`c${id}`} clipPathUnits="objectBoundingBox"><path d={PATH} transform="scale(0.01 0.0071429)" /></clipPath>
        </defs>
        <path d={PATH} className="arch__fill" fill={fill} />
        <path d={PATH} className="arch__line" vectorEffect="non-scaling-stroke" />
        <path d={PATH} className="arch__line arch__line--in" vectorEffect="non-scaling-stroke" transform="translate(50 70) scale(.93 .94) translate(-50 -70)" />
      </svg>
      <div className="arch__body" style={{ clipPath: `url(#c${id})` }}>{children}</div>
    </div>
  )
}
export { PATH as ARCH_PATH }
