import { useState } from 'react'
import { useHeroArt } from '../lib/heroArt'

// <img> for every photo slot. It always fills its frame (object-fit: cover), so ANY aspect ratio the backend later
// sends is cropped to the frame's shape (arch, polaroid, round...) instead of stretching or leaving gaps.
// It fades up from a soft blur once the picture has loaded (.photo-img in index.css), so it never paints in strips.
//   src      a path under /public or a full URL (CDN / backend)
//   focus    optional focal point, e.g. "50% 30%" (x y): the part of the picture to keep when it has to crop
//   fallback shown while there is no src, or if the picture fails to load
export default function Photo({ src, alt, focus, fallback = null, className = '', style, onLoad, ...rest }) {
  const [bad, setBad] = useState(!src)
  const [loaded, setLoaded] = useState(false)
  const art = useHeroArt() // photos start after the hero's painting (lib/heroArt)
  if (bad) return fallback
  return (
    <img
      // a picture already in the cache can finish before React attaches onLoad, so check once it mounts
      ref={(img) => { if (img?.complete && img.naturalWidth && !loaded) setLoaded(true) }}
      className={`photo-img${loaded ? ' is-loaded' : ''} ${className}`.trim()}
      src={art ? src : undefined}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={(e) => { setLoaded(true); onLoad?.(e) }}
      onError={() => setBad(true)}
      style={{ objectFit: 'cover', objectPosition: focus || '50% 35%', ...style }}
      {...rest}
    />
  )
}
