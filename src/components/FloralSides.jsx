import './FloralSides.css'

// One floral frame for a whole run of pages: the full image (garlands, roses, tassels) at the top, then flowers
// running down both edges tile after tile for as long as the pages are. It lives in a single layer behind all of
// them, so there is no seam where one page ends and the next begins.
export default function FloralSides({ tiles = 24, head = true, className = '' }) {
  return (
    <div className={`floral-sides ${className}`} aria-hidden="true">
      {head && <img className="floral-sides__head" src="/florals.webp" alt="" width="1024" height="1536" decoding="async" />}
      {Array.from({ length: tiles }, (_, i) => (
        // Every tile is the same picture, so it's fetched once anyway; loading it eagerly means the browser has it
        // decoded before a page scrolls in, instead of leaving the edges bare for a moment while it catches up.
        <span key={i}><img src="/florals.webp" alt="" width="1024" height="1536" loading="eager" decoding="async" /></span>
      ))}
    </div>
  )
}
