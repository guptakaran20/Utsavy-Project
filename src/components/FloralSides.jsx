import './FloralSides.css'

// One floral frame for a whole run of pages: the full image (garlands, roses, tassels) at the top, then flowers
// running down both edges for as long as the pages are. It lives in a single layer behind all of them, so there is
// no seam where one page ends and the next begins.
//
// The running flowers are ONE repeating background (florals-tile.webp: the foot of florals.webp, mirrored, then as is,
// so every join mirrors itself). It used to be dozens of full-width <img> tiles, each on its own GPU layer; on phones
// that ran out of graphics memory, which made the scroll stutter and left pictures blank.
// `tiles` is kept so existing callers don't break; the run now simply fills the section's height.
// eslint-disable-next-line no-unused-vars
export default function FloralSides({ tiles, head = true, className = '' }) {
  return (
    <div className={`floral-sides ${className}`} aria-hidden="true">
      {head && <img className="floral-sides__head" src="/florals.webp" alt="" width="1024" height="1536" decoding="async" />}
      <i className="floral-sides__run" />
    </div>
  )
}
