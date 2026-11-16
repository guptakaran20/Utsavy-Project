import { wedding } from '../data/wedding'

// One shared dhol recording for the whole invitation. The "Take off" tap is the user gesture browsers require, so the
// track is started silently then (prime) and faded in when the plane is away (start); the dhol button can mute it.
let audio = null
let on = false
let fade = null
const subs = new Set()
const silent = typeof location !== 'undefined' && new URLSearchParams(location.search).has('nosound') // ?nosound: never play (for testing)
const emit = () => subs.forEach((f) => f(on))

const get = () => {
  if (audio || !wedding.music || silent) return audio
  audio = new Audio(wedding.music.src)
  audio.loop = true
  audio.preload = 'auto'
  audio.volume = 0
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) audio.pause()
    else if (on) audio.play().catch(() => {})
  })
  return audio
}

const ramp = (to, ms, done) => {
  clearInterval(fade)
  const a = audio
  const from = a.volume
  const t0 = performance.now()
  fade = setInterval(() => {
    const p = Math.min(1, (performance.now() - t0) / ms)
    a.volume = Math.max(0, Math.min(1, from + (to - from) * p))
    if (p === 1) { clearInterval(fade); done?.() }
  }, 50)
}

export const dhol = {
  available: !!wedding.music,
  get on() { return on },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn) },
  prime() { // inside the tap: begin loading and playing, silently
    const a = get()
    if (a && !on) { a.volume = 0; a.play().catch(() => {}) }
  },
  start() {
    const a = get()
    if (!a) return
    on = true
    emit()
    a.play().then(() => ramp(0.32, 1500)).catch(() => { on = false; emit() })
  },
  stop() {
    if (!audio) return
    on = false
    emit()
    ramp(0, 500, () => audio.pause())
  },
  toggle() { on ? this.stop() : this.start() },
}
