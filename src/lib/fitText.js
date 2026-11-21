// Text that comes from wedding.js, the link (?guest=…) or a guest's own typing can be any length. Big script names
// sit in cards of a fixed width, so instead of wrapping mid-word they shrink: the element gets its length as --len and
// its CSS caps the font size with it, e.g. font-size: min(84px, calc(560px / var(--len))). Pure CSS from there, so it
// follows every resize. `min` keeps short names at their designed size.
export const fitLen = (text, min = 8) => ({ '--len': Math.max(min, [...String(text ?? '')].length) })

// the longest of several (two names set on one line each, e.g. "Harleen & Jasraj" stacked)
export const fitLenOf = (texts, min = 8) => fitLen(texts.reduce((a, t) => ([...String(t ?? '')].length > a.length ? String(t) : a), ''), min)
