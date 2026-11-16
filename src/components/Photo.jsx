import { useState } from 'react'

// <img> that quietly steps aside (renders `fallback`) when the file isn't there yet.
export default function Photo({ src, alt, fallback = null, className = '', ...rest }) {
  const [bad, setBad] = useState(!src)
  if (bad) return fallback
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)} {...rest} />
}
