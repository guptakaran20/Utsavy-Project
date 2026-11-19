// A heart that travels a chain of cubic Bézier curves, leaving a dashed trail behind it.
// Each curve is { p0, p1, p2, p3 } with {x, y} points.

const bez = (a, b, c, d, t) => {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

export const pointOn = (seg, t) => ({
  x: bez(seg.p0.x, seg.p1.x, seg.p2.x, seg.p3.x, t),
  y: bez(seg.p0.y, seg.p1.y, seg.p2.y, seg.p3.y, t),
})

// S-curve from a to b: leaves a heading straight down, swings across, and settles into b from above,
// so every hop is a horizontal swing and a vertical drop at once
export const sCurve = (a, b) => {
  const dy = b.y - a.y
  const lean = (b.x - a.x) * 0.06
  return {
    p0: a,
    p1: { x: a.x - lean, y: a.y + dy * 0.38 },
    p2: { x: b.x + lean, y: a.y + dy * 0.62 },
    p3: b,
  }
}

// position at s, where s runs from 0 (start of the first curve) to segs.length (end of the last)
export const pointAt = (segs, s) => {
  if (!segs.length) return { x: 0, y: 0 }
  const c = Math.min(Math.max(s, 0), segs.length - 1e-4)
  const i = Math.floor(c)
  return pointOn(segs[i], c - i)
}

// polyline of the chain from its start up to s (12 samples per curve keeps it smooth and cheap)
export const trailTo = (segs, s, steps = 12) => {
  if (!segs.length || s <= 0) return ''
  const end = Math.min(s, segs.length)
  let d = `M ${segs[0].p0.x.toFixed(1)} ${segs[0].p0.y.toFixed(1)}`
  for (let i = 0; i < Math.ceil(end); i++) {
    const upto = Math.min(1, end - i)
    const n = Math.max(1, Math.round(steps * upto))
    for (let k = 1; k <= n; k++) {
      const p = pointOn(segs[i], (k / n) * upto)
      d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    }
  }
  return d
}
