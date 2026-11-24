// "Lite" mode for low-end phones and slow or metered connections. main.jsx sets html.lite from this, and the
// heavier effects (canvas fireworks, confetti, endless idle motions, glass blur) scale themselves down when it is on.
//   - the guest asked for less data (Data Saver / Lite mode in the browser)
//   - the connection reports itself as 2G / 3G, or as under ~1.5 Mbps (a weak "4G" bar)
//   - a touch screen reports 4 GB of memory or less (budget Androids have 8 slow cores, so the core count says
//     little; Safari's core count is masked, so it isn't used at all)
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
  const touch = matchMedia('(pointer: coarse)').matches
  if (mem && mem <= 4 && touch) return true
  if (mem && mem <= 2) return true
  return false
}

export let isLite = detect()

// Which size of the heaviest paintings to fetch (the *-lite.webp files, about 0.6x): fixed at page start, so a phone
// that only turns lite later (watchFrames) keeps the pictures it already has instead of downloading them again.
// main.jsx mirrors it as html.lite-art for the CSS backgrounds.
export const liteArt = isLite

// Phones that report nothing (every iPhone, many Androids) are judged by how they actually run. Frame gaps are
// sampled in 2-second windows for as long as the guest is on the page (not just once at load, when the intro is
// still quiet: the strain shows later, in the envelope, the doorway, the clock). Two struggling windows (median
// frame slower than ~35 fps) out of the last four turn lite on from then on. A window with a long pause in it (tab
// switched, phone locked) or the page hidden is thrown away. The cost is one timestamp per frame.
export function watchFrames() {
  if (isLite || typeof requestAnimationFrame === 'undefined') return
  if (new URLSearchParams(location.search).has('full-fx')) return
  const recent = []
  let gaps = []
  let last = 0
  let windowEnd = 0
  const tick = (t) => {
    if (isLite) return
    if (document.hidden) { last = 0; gaps = []; requestAnimationFrame(tick); return }
    if (last) {
      const gap = t - last
      if (gap > 1000) gaps = [] // a pause, not a slow frame: start the window again
      else gaps.push(gap)
    }
    last = t
    if (!windowEnd) windowEnd = t + 2000
    if (t >= windowEnd) {
      windowEnd = t + 2000
      if (gaps.length >= 10) {
        gaps.sort((a, b) => a - b)
        recent.push(gaps[gaps.length >> 1] > 28)
        if (recent.length > 4) recent.shift()
        if (recent.filter(Boolean).length >= 2) {
          isLite = true
          document.documentElement.classList.add('lite')
          return
        }
      }
      gaps = []
    }
    requestAnimationFrame(tick)
  }
  const start = () => setTimeout(() => requestAnimationFrame(tick), 1500)
  if (document.readyState === 'complete') start()
  else addEventListener('load', start, { once: true })
}
