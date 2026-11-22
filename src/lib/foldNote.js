import { gsap } from './gsap'
import { wedding } from '../data/wedding'
import { onLowerArt } from './heroArt'

// the outside of the folded chit (phulkari-bordered blush paper) and the invitation's own wax seal: fetched with this
// module, so they are ready the moment a guest sends a blessing
const BACK = '/wishes/chit-back.webp'
const SEAL = '/invite-seal.webp'
if (typeof Image !== 'undefined') onLowerArt(() => [BACK, SEAL].forEach((src) => { new Image().src = src }))

// The written note turns into a sheet of paper over the form, folds like a letter (bottom third up, top third down),
// folds once more in half into a little square with a wax seal, is carried up to the gaagar and dropped into it.
//
//   colL            colR (folds over colL last)
//   ┌────┬────┐
//   │ TL │ TR │  top row: folds down over the middle
//   ├────┼────┤
//   │ ML │ MR │  middle row: stays; MR's back carries the seal and is what's left facing you
//   ├────┼────┤
//   │ BL │ BR │  bottom row: folds up over the middle first
//   └────┴────┘
//
// Every panel holds the whole letter on its front, shifted so the six pieces line up into one page.
export function foldNote({ form, text, signer, mouth, scrollToY, onLanded }) {
  const r = form.getBoundingClientRect()
  const W = r.width
  const H = r.height
  const w = W / 2
  const h = H / 3

  const letter = (x, y) => `
    <div class="fold__letter" style="width:${W}px;height:${H}px;translate:${-x}px ${-y}px">
      <p class="fold__eyebrow">ਅਸੀਸ</p>
      <p class="fold__text"></p>
      ${signer ? `<p class="fold__sign"></p>` : ''}
    </div>`
  const panel = (x, y, seal) => `
    <div class="fold__face fold__front">${letter(x, y)}</div>
    <div class="fold__face fold__back">${seal ? `<span class="fold__seal"><img src="${SEAL}" alt="" /><b></b></span>` : ''}</div>`

  const wrap = document.createElement('div')
  wrap.className = 'fold'
  wrap.setAttribute('aria-hidden', 'true')
  Object.assign(wrap.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${W}px`, height: `${H}px` })
  wrap.innerHTML = `
    <div class="fold__sheet">
      <div class="fold__col fold__col--l">
        <div class="fold__row fold__row--t">${panel(0, 0)}</div>
        <div class="fold__row fold__row--m">${panel(0, h)}</div>
        <div class="fold__row fold__row--b">${panel(0, 2 * h)}</div>
      </div>
      <div class="fold__col fold__col--r">
        <div class="fold__row fold__row--t">${panel(w, 0)}</div>
        <div class="fold__row fold__row--m">${panel(w, h, true)}</div>
        <div class="fold__row fold__row--b">${panel(w, 2 * h)}</div>
      </div>
    </div>`
  wrap.style.setProperty('--w', `${w}px`)
  wrap.style.setProperty('--h', `${h}px`)
  // the guest's words go in as text, never as HTML
  wrap.querySelectorAll('.fold__text').forEach((el) => { el.textContent = `“${text}”` })
  wrap.querySelectorAll('.fold__sign').forEach((el) => { el.textContent = `— ${signer}` })
  // the couple's initials pressed into the wax, as on the invitation's envelope
  wrap.querySelectorAll('.fold__seal b').forEach((el) => { el.textContent = `${wedding.bride.name[0]}&${wedding.groom.name[0]}` })
  document.body.appendChild(wrap)

  let done = false
  const finish = () => {
    if (done) return
    done = true
    wrap.remove()
    onLanded()
  }
  // animations pause in a background tab; the wish is still saved
  const safety = setTimeout(finish, 8000)

  const q = (s) => wrap.querySelectorAll(s)
  // the folded square sits where the middle-left panel is, so everything moves and scales about that point
  gsap.set(wrap, { transformOrigin: `${w / 2}px ${H / 2}px` })

  // 5. once the page has arrived, a little arc into the mouth, then 6. it slips down inside the rim
  const drop = () => {
    const m = mouth.getBoundingClientRect()
    const tx = m.left + m.width / 2 - (r.left + w / 2)
    const ty = m.top + m.height / 2 - (r.top + H / 2)
    gsap.timeline({ onComplete: () => { clearTimeout(safety); finish() } })
      .to(wrap, { x: tx, duration: 0.85, ease: 'power1.inOut' }, 0)
      .to(wrap, { y: Math.min(ty, gsap.getProperty(wrap, 'y')) - 70, duration: 0.4, ease: 'power2.out' }, 0)
      .to(wrap, { y: ty, duration: 0.45, ease: 'power2.in' }, 0.4)
      .to(wrap, { rotation: 6, scale: 0.32, duration: 0.85, ease: 'power1.in' }, 0)
      // the square's bottom edge (2h down the sheet) disappears behind the rim as it sinks
      .fromTo(wrap, { clipPath: `inset(0px 0px ${h}px 0px)` }, { y: ty + h * 0.3, clipPath: `inset(0px 0px ${2 * h}px 0px)`, duration: 0.4, ease: 'power2.in' }, 0.85)
  }

  const tl = gsap.timeline({ onComplete: drop })
  tl.to({}, { duration: 0.35 })
    // 1. bottom third up
    .to(q('.fold__row--b'), { rotationX: 180, z: 1, duration: 0.6, ease: 'power2.inOut' })
    // 2. top third down over it
    .to(q('.fold__row--t'), { rotationX: -180, z: 2, duration: 0.6, ease: 'power2.inOut' }, '+=0.05')
    // 3. right half over the left: a little square
    .to(q('.fold__col--r'), { rotationY: -180, z: 4, duration: 0.65, ease: 'power2.inOut' }, '+=0.05')
    .to(wrap, { scale: 0.85, duration: 0.3, ease: 'power2.out' })
    // 4. carry it up to the gaagar while the page scrolls there
    .add(() => scrollToY())
    .to(wrap, {
      x: () => window.innerWidth / 2 - (r.left + w / 2),
      y: () => window.innerHeight * 0.42 - (r.top + H / 2),
      rotation: -8, scale: 0.6, duration: 1.4, ease: 'power2.inOut',
    })
    .to({}, { duration: 0.35 })
  return tl
}
