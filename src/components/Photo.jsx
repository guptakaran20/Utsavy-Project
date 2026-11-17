import { useState } from 'react'

// <img> for every photo slot. It always fills its frame (object-fit: cover), so ANY aspect ratio the backend later
// sends is cropped to the frame's shape (arch, polaroid, round...) instead of stretching or leaving gaps.
//   src      a path under /public or a full URL (CDN / backend)
//   focus    optional focal point, e.g. "50% 30%" (x y): the part of the picture to keep when it has to crop
//   fallback shown while there is no src, or if the picture fails to load
export default function Photo({ src, alt, focus, fallback = null, className = '', style, ...rest }) {
  const [bad, setBad] = useState(!src)
  if (bad) return fallback
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBad(true)}
      style={{ objectFit: 'cover', objectPosition: focus || '50% 35%', ...style }}
      {...rest}
    />
  )
}
