// One-off phone pass over public/*.webp (run: node scripts/optimize-images.mjs).
// Each picture is cut down to the most it is ever drawn at on a 440px-wide phone, times 2.6 for sharp screens,
// and re-encoded (lossy alpha for the painted cut-outs). Files only change when the result is clearly smaller.
// The full-size originals are in git history (commit 1f52046), so re-run from those if the layout grows.
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync, renameSync, mkdtempSync } from 'node:fs'
import { join, relative } from 'node:path'
import { tmpdir } from 'node:os'

const PUBLIC = new URL('../public/', import.meta.url).pathname
const DPR = 2.6

// widest CSS px each picture is drawn at (measured on a 440 x 956 phone, cover/background sizes included)
const SHOWN = {
  'contacts-art.webp': 1760, 'couple-back.webp': 110, 'couple-divider.webp': 185, 'couple-footer.webp': 493,
  'couple-header.webp': 493, 'door/door-open.webp': 420, 'events/anand-karaj.webp': 158, 'events/header-decor.webp': 440,
  'events/maiyan.webp': 123, 'events/mehndi.webp': 158, 'events/reception.webp': 123, 'families-rangoli.webp': 493,
  'families-toran.webp': 493, 'families.webp': 420, 'family-seal.webp': 136, 'floral-divider.webp': 466,
  'florals.webp': 440, 'frame-bride.webp': 360, 'frame-groom.webp': 360, 'good-to-know.webp': 480,
  'invite-card.webp': 405, 'invite-coda.webp': 396, 'invite-crest.webp': 65, 'invite-seal.webp': 101,
  'invite-sprig.webp': 259, 'moments-divider.webp': 581, 'moments-footer.webp': 493, 'moments-header.webp': 493,
  'notes-garland.webp': 493, 'paper-floral.webp': 480, 'photos/bride.webp': 238, 'photos/groom.webp': 231,
  'photos/gallery-3.webp': 253, 'photos/gallery-6.webp': 253, 'photos/gallery-8.webp': 569, 'photos/gallery-9.webp': 285,
  'photos/gallery-10.webp': 569, 'photos/story-1.webp': 218, 'photos/story-2.webp': 218, 'photos/story-3.webp': 324,
  'punjabi/charkha.webp': 440, 'punjabi/chooda.webp': 186, 'punjabi/dhol.webp': 174, 'punjabi/giddha-pair.webp': 189,
  'punjabi/paranda.webp': 167, 'punjabi/phulkari-divider.webp': 313, 'rsvp-garland.webp': 493, 'rsvp-stage.webp': 440,
  'story-header.webp': 493, 'thanks-art.webp': 538, 'thanks-pavilions.webp': 537, 'venue-footer.webp': 493,
  'venue-scene.webp': 440, 'wedding-scene.webp': 440, 'wishes/card.webp': 200, 'wishes/gaagar.webp': 280,
}
// anything not listed (not on screen when measured) keeps its size and is only re-encoded
// never touched: the contact card is a nine-slice frame cut at fixed pixel positions (Contacts.css border-image 320);
// gurdwara-*.webp are made separately below for the hero's srcset
const LITE = { 'florals.webp': 700, 'florals-tile.webp': 700, 'frame-bride.webp': 480, 'frame-groom.webp': 480, 'invite-card.webp': 700 }
const SKIP = new Set([...Object.keys(LITE).map((f) => f.replace('.webp', '-lite.webp')), 'contact-card.webp', 'gurdwara.webp', 'gurdwara-1100.webp', 'gurdwara-1600.webp'])

const tmp = mkdtempSync(join(tmpdir(), 'webp-'))
const width = (f) => +execFileSync('sips', ['-g', 'pixelWidth', f]).toString().match(/pixelWidth: (\d+)/)[1]
const encode = (src, out, w, photo) => execFileSync('cwebp', [
  '-quiet', '-m', '6', '-sharp_yuv', '-q', photo ? '80' : '78', '-alpha_q', '70', '-alpha_filter', 'best',
  ...(w ? ['-resize', String(w), '0'] : []), src, '-o', out])

const files = []
const walk = (d) => readdirSync(d).forEach((n) => {
  const p = join(d, n)
  if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.webp')) files.push(relative(PUBLIC, p))
})
walk(PUBLIC)

let before = 0, after = 0
for (const f of files) {
  if (SKIP.has(f)) continue
  const src = join(PUBLIC, f), old = statSync(src).size, nat = width(src)
  const want = SHOWN[f] ? Math.ceil((SHOWN[f] * DPR) / 10) * 10 : 0
  const w = want && want < nat * 0.9 ? want : 0
  const out = join(tmp, f.replaceAll('/', '_'))
  encode(src, out, w, f.startsWith('photos/'))
  const neu = statSync(out).size
  before += old
  if (neu < old * 0.92) { renameSync(out, src); after += neu; console.log(`${f}  ${nat}→${w || nat}px  ${(old / 1024) | 0}→${(neu / 1024) | 0} KB`) }
  else after += old
}

// hero gurdwara: 704 CSS px wide on a 440 phone (160vw); phones pick from 800 / 1100 / 1300 / 1600
for (const w of [800, 1100, 1300, 1600]) encode(join(PUBLIC, 'gurdwara.webp'), join(PUBLIC, `gurdwara-${w}.webp`), w, false)

// slow / low-memory phones (lib/device.js liteArt) fetch these ~0.6x copies of the heaviest paintings instead
for (const [f, w] of Object.entries(LITE)) encode(join(PUBLIC, f), join(PUBLIC, f.replace('.webp', '-lite.webp')), w, false)

console.log(`\nart total ${(before / 1024) | 0} KB → ${(after / 1024) | 0} KB`)
