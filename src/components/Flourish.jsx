export default function Flourish({ className = '' }) {
  return (
    <svg className={`flourish ${className}`} viewBox="0 0 240 24" fill="none" aria-hidden="true">
      <path d="M4 12H92" stroke="currentColor" strokeLinecap="round" />
      <path d="M148 12H236" stroke="currentColor" strokeLinecap="round" />
      <circle cx="98" cy="12" r="2" fill="currentColor" />
      <circle cx="142" cy="12" r="2" fill="currentColor" />
      <path d="M120 2L130 12L120 22L110 12Z" stroke="currentColor" />
      <path d="M120 7L125 12L120 17L115 12Z" fill="currentColor" />
    </svg>
  )
}
