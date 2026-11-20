import { useEffect } from 'react'

// The painted header and footer pieces (garlands, toran, rangoli, scenes) carry data-art="drop" | "rise" | "fade".
// Each one is marked .is-in the first time part of it is on screen, and its entrance plays in CSS (index.css).
// A light poll (a handful of elements, four times a second) rather than an IntersectionObserver: the page is moved by
// the smooth-scroll and by pinned sections, and a poll of the real on-screen position catches every case; pieces that
// mount later (behind the intro, or lazily) are picked up as they appear.
export function useArtReveal() {
  useEffect(() => {
    const check = () => {
      const h = window.innerHeight
      document.querySelectorAll('[data-art]:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.height > 0 && r.top < h * 0.92 && r.bottom > h * 0.08) el.classList.add('is-in')
      })
    }
    check()
    const id = setInterval(check, 250)
    return () => clearInterval(id)
  }, [])
}
