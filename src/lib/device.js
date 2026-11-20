// "Lite" mode for low-end phones and slow or metered connections. main.jsx sets html.lite from this, and the
// heavier effects (canvas fireworks, confetti, endless idle motions, glass blur) scale themselves down when it is on.
//   - the guest asked for less data (Data Saver / Lite mode in the browser)
//   - the connection reports itself as 2G / 3G
//   - Android reports 2 GB of memory or less, or 4 GB on a 4-core-or-fewer chip
// iPhones report neither memory nor network type, so they only go lite on Low Data Mode-style signals.
// Add ?lite to the URL to force it on (or ?full-fx to force it off) when testing.
function detect() {
  if (typeof navigator === 'undefined') return false
  const params = new URLSearchParams(location.search)
  if (params.has('lite')) return true
  if (params.has('full-fx')) return false
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (conn?.saveData) return true
  if (/(^|-)(2g|3g)$/.test(conn?.effectiveType || '')) return true
  const mem = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  if (mem && mem <= 2) return true
  if (mem && mem <= 4 && cores && cores <= 4) return true
  return false
}

export const isLite = detect()
