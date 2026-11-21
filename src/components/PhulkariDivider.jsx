import './PhulkariDivider.css'

// A pale hand-painted phulkari band. `multiply` drops the image's white paper onto the blush sheet.
export default function PhulkariDivider({ className = '' }) {
  return <img className={`phulkari-divider reveal ${className}`} src="/punjabi/phulkari-divider.webp" alt="" width="2172" height="180" loading="lazy" decoding="async" aria-hidden="true" />
}
