// "Lite" mode for low-end phones and slow or metered connections. main.jsx sets html.lite from this, and the
// heavier effects (canvas fireworks, confetti, endless idle motions, glass blur) scale themselves down when it is on.
//   - the guest asked for less data (Data Saver / Lite mode in the browser)
//   - the connection reports itself as 2G / 3G, or as under ~1.5 Mbps (a weak "4G" bar)
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
  if (conn?.downlink && conn.downlink < 1.5) return true
  const mem = navigator.deviceMemory
  const cores = navigator.hardwareConcurrency
  if (mem && mem <= 2) return true
  if (mem && mem <= 4 && cores && cores <= 4) return true
  return false
}

export let isLite = detect()

// Phones that report nothing (every iPhone, many Androids) are judged by how they actually run: once the page has
// loaded, the frame rate is sampled for two seconds, and a phone that can't hold ~35 fps goes lite from then on.
export function watchFrames() {
  if (isLite || typeof requestAnimationFrame === 'undefined') return
  if (new URLSearchParams(location.search).has('full-fx')) return
  const sample = () => {
    if (document.hidden) return
    const gaps = []
    let last = performance.now()
    const end = last + 2000
    const tick = (t) => {
      gaps.push(t - last)
      last = t
      if (t < end) return requestAnimationFrame(tick)
      if (document.hidden || gaps.length < 10) return
      gaps.sort((a, b) => a - b)
      if (gaps[gaps.length >> 1] > 28) {
        isLite = true
        document.documentElement.classList.add('lite')
      }
    }
    requestAnimationFrame(tick)
  }
  const start = () => setTimeout(sample, 1500)
  if (document.readyState === 'complete') start()
  else addEventListener('load', start, { once: true })
}
