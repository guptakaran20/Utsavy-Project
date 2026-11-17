import { StrictMode, lazy, Suspense, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

// Always start at the gate, not wherever the last visit left off
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// On a desktop the invitation runs inside a phone on a soft backdrop (DesktopFrame loads
// this same page in an iframe with ?embed=1). Phones, tablets and the iframe itself get the
// site directly. Add ?full to the URL to see the full-width desktop layout instead.
const params = new URLSearchParams(location.search)
const embedded = params.has('embed') || window.self !== window.top
if (embedded) document.documentElement.classList.add('is-embedded')
const desktopQuery = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)')
const allowFrame = !embedded && !params.has('full')

// The site itself (GSAP, Lenis, audio) only loads where it actually runs
const DesktopFrame = lazy(() => import('./components/DesktopFrame.jsx'))
const Site = lazy(() => Promise.all([import('lenis/dist/lenis.css'), import('./index.css')]).then(() => import('./App.jsx')))

function Root() {
  const [framed, setFramed] = useState(() => allowFrame && desktopQuery.matches)

  useEffect(() => {
    if (!allowFrame) return
    const onChange = (e) => setFramed(e.matches)
    desktopQuery.addEventListener('change', onChange)
    return () => desktopQuery.removeEventListener('change', onChange)
  }, [])

  return <Suspense fallback={null}>{framed ? <DesktopFrame /> : <Site />}</Suspense>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
