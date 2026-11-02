const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const CalendarIcon = () => (
  <svg {...base}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </svg>
)

export const ClockIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const PinIcon = () => (
  <svg {...base}>
    <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.8" r="2.4" />
  </svg>
)

export const AttireIcon = () => (
  <svg {...base}>
    <path d="M12 6.5a2 2 0 1 1 2-2" />
    <path d="M12 6.5v1.2L3.5 14a1.3 1.3 0 0 0 .8 2.4h15.4a1.3 1.3 0 0 0 .8-2.4L12 7.7" />
  </svg>
)

export const ArrowIcon = () => (
  <svg {...base} width={18} height={18}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
