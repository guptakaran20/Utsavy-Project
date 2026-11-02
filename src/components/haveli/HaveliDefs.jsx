// Gradients and patterns shared by every haveli SVG. Rendered once (by
// HaveliGate); the other SVGs reference these ids with fill="url(#hv-…)".
export default function HaveliDefs() {
  return (
    <svg className="hv-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        {/* genda phool */}
        <radialGradient id="hv-mg-orange" cx="42%" cy="38%" r="62%">
          <stop offset="0" stopColor="#ffd590" />
          <stop offset="0.45" stopColor="#fb8a1e" />
          <stop offset="1" stopColor="#b8410a" />
        </radialGradient>
        <radialGradient id="hv-mg-yellow" cx="42%" cy="38%" r="62%">
          <stop offset="0" stopColor="#fff3b0" />
          <stop offset="0.45" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#c27a06" />
        </radialGradient>
        <linearGradient id="hv-mango" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5aa443" />
          <stop offset="1" stopColor="#1f5a24" />
        </linearGradient>

        {/* brass hardware */}
        <linearGradient id="hv-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c2" />
          <stop offset="0.28" stopColor="#e2bc6c" />
          <stop offset="0.6" stopColor="#a87a32" />
          <stop offset="0.85" stopColor="#6f4b18" />
          <stop offset="1" stopColor="#b58b44" />
        </linearGradient>
        <radialGradient id="hv-stud" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff7dc" />
          <stop offset="0.35" stopColor="#deb562" />
          <stop offset="0.8" stopColor="#7d5419" />
          <stop offset="1" stopColor="#3f2808" />
        </radialGradient>

        {/* teak leaves */}
        <linearGradient id="hv-teak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7e4622" />
          <stop offset="0.5" stopColor="#5f3118" />
          <stop offset="1" stopColor="#40200c" />
        </linearGradient>
        <linearGradient id="hv-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f1d0a" />
          <stop offset="1" stopColor="#5a2e14" />
        </linearGradient>
        <pattern id="hv-grain" width="9" height="350" patternUnits="userSpaceOnUse">
          <rect x="1" width="0.7" height="350" fill="rgba(0,0,0,0.22)" />
          <rect x="4.5" width="0.4" height="350" fill="rgba(255,214,170,0.07)" />
          <rect x="6.8" width="1.1" height="350" fill="rgba(0,0,0,0.1)" />
        </pattern>

        {/* sandstone casing */}
        <linearGradient id="hv-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4dab0" />
          <stop offset="0.5" stopColor="#e0b37f" />
          <stop offset="1" stopColor="#b98353" />
        </linearGradient>
        <pattern id="hv-carve" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="#d3a06c" />
          <circle cx="5" cy="5" r="2.6" fill="#a8703f" />
          <circle cx="5" cy="5" r="1.1" fill="#f4d7a8" />
          <circle cx="0" cy="0" r="1" fill="#a8703f" />
          <circle cx="10" cy="0" r="1" fill="#a8703f" />
          <circle cx="0" cy="10" r="1" fill="#a8703f" />
          <circle cx="10" cy="10" r="1" fill="#a8703f" />
        </pattern>

        {/* the lit courtyard behind the doors */}
        <radialGradient id="hv-beyond" cx="50%" cy="62%" r="72%">
          <stop offset="0" stopColor="#fff8e4" />
          <stop offset="0.28" stopColor="#ffe0a0" />
          <stop offset="0.58" stopColor="#f5ae55" />
          <stop offset="0.85" stopColor="#d2702a" />
          <stop offset="1" stopColor="#a4461a" />
        </radialGradient>
        <radialGradient id="hv-bulb">
          <stop offset="0" stopColor="#fff6d0" />
          <stop offset="0.35" stopColor="rgba(255,205,110,0.85)" />
          <stop offset="1" stopColor="rgba(255,170,60,0)" />
        </radialGradient>
      </defs>
    </svg>
  )
}
