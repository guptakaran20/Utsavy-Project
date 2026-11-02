// Shared geometry for the haveli doorway. Everything is drawn in "unit space":
// a 300 × 440 box holding the carved stone casing, with the door opening cut as
// a pointed Mughal arch at x 50–250, y 90–440.

export const UNIT = { w: 300, h: 440 }
export const OPENING = { x: 50, y: 90, w: 200, h: 350 }
export const SPRINGLINE = 209 // where the arch's sides stop being vertical

const r = (n) => Math.round(n * 100) / 100

// The opening's outline grown outward by `d` units. Every offset shares the
// springline; the apex climbs a little faster so the point stays crisp.
export function archPath(d = 0, bottom = UNIT.h) {
  const x = OPENING.x - d
  const w = OPENING.w + 2 * d
  const apex = OPENING.y - d * 1.25
  const rise = SPRINGLINE - apex
  const c1 = r(SPRINGLINE - rise * 0.53)
  const c2 = r(apex + rise * 0.18)
  return `M${r(x)},${bottom} V${SPRINGLINE} C${r(x)},${c1} ${r(x + w * 0.28)},${c2} ${r(x + w / 2)},${r(apex)} C${r(x + w * 0.72)},${c2} ${r(x + w)},${c1} ${r(x + w)},${SPRINGLINE} V${bottom} Z`
}

// The opening in its own 200 × 350 space (the light behind the doors)
export const ARCH = 'M0,350 V119 C0,56 56,21 100,0 C144,21 200,56 200,119 V350 Z'

// One leaf in its own 100 × 350 space: hinge at x=0, meeting edge at x=100
export const LEAF = 'M0,350 V119 C0,56 56,21 100,0 V350 Z'
