import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

// The site's paragraphs of copy. Each one is split into its visual lines, and the lines rise out of a mask one after
// another as the paragraph scrolls in. Only text that never changes after load is listed: React re-rendering a
// paragraph that SplitText has rewritten would clash, so live text (event cards, gallery captions, wishes) is left out.
// The invitation card runs its own line reveal inside its envelope animation (see Invitation.jsx).
export const LINE_TEXT = [
  '.person__parents', '.person__blurb',
  '.story__text',
  '.venue__note',
  '.ofam__parents', '.ofam__invite', '.ofam__grand',
  '.family__msg', '.family__sign',
  '.note__text',
  '.rsvp__deadline',
].join(', ')

export function splitLines(el) {
  return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line', aria: 'auto' })
}

export function useLineReveal() {
  useGSAP(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const splits = []
      // wait for the web fonts, so lines are measured with the real typeface
      const start = () => {
        gsap.utils.toArray(LINE_TEXT).forEach((el) => {
          let played = false
          splits.push(SplitText.create(el, {
            type: 'lines', mask: 'lines', linesClass: 'line', autoSplit: true, aria: 'auto',
            // re-split on resize: once a paragraph has played, its new lines simply stay put
            onSplit: (self) => {
              if (played) return
              return gsap.from(self.lines, {
                yPercent: 105, autoAlpha: 0, duration: 0.85, ease: 'power3.out', stagger: 0.11,
                scrollTrigger: { trigger: el, start: 'top 90%', once: true, onEnter: () => { played = true } },
              })
            },
          }))
        })
        ScrollTrigger.refresh()
      }
      if (document.fonts?.status === 'loaded') start()
      else document.fonts?.ready.then(start)
      return () => splits.forEach((s) => s.revert())
    })
  })
}
