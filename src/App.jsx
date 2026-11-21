import { useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { SmoothScroll } from './lib/smoothScroll'
import HaveliGate from './components/haveli/HaveliGate'
import PlaneIntro from './components/PlaneIntro'
import Hero from './components/Hero'
import PhulkariBand from './components/PhulkariBand'
import Invitation from './components/Invitation'
import FloralSides from './components/FloralSides'
import Couple from './components/Couple'
import Story from './components/Story'
import GarlandBridge from './components/GarlandBridge'
import Marquee from './components/Marquee'
import Gallery from './components/Gallery'
import MusicToggle from './components/MusicToggle'
import FrameScene from './lib/FrameScene'
import IdleNudge from './lib/IdleNudge'
import { dhol } from './lib/dhol'
import { useLineReveal } from './lib/useLineReveal'
import { useArtReveal } from './lib/useArtReveal'

// 'plane' = a night flight crosses the sky, then the invitation opens; 'gate' = the haveli doorway (kept intact, switch back any time)
const INTRO = 'plane'

export default function App() {
  const [opened, setOpened] = useState(false)
  const [gateDone, setGateDone] = useState(false)
  // the sections from the countdown down (Later.jsx): fetched straight away, drawn once they arrive
  const [later, setLater] = useState(null)
  useLineReveal(!!later)
  useArtReveal()

  useEffect(() => {
    let alive = true
    import('./Later').then((m) => { if (alive) setLater(m) })
    return () => { alive = false }
  }, [])

  // the page just grew: every trigger below the hero needs its position again
  useEffect(() => {
    if (!later) return
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [later])

  useEffect(() => {
    // Web fonts change text heights, which shifts every trigger position
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <SmoothScroll locked={!opened}>
      {!gateDone && (INTRO === 'plane'
        ? <PlaneIntro onEnter={() => { setOpened(true); dhol.start() }} onDone={() => setGateDone(true)} />
        : <HaveliGate onEnter={() => setOpened(true)} onDone={() => setGateDone(true)} />)}
      <MusicToggle visible={opened} />
      <FrameScene introDone={gateDone} />
      {/* if the guest sits still for a few seconds once everything has played, the page drifts on a little by itself */}
      <IdleNudge enabled={gateDone} />
      <main>
        <Hero play={opened} />
        <div className="blush-run sky-bg">
          <FloralSides tiles={40} className="floral-sides--centered" />
          <Invitation />
          <Couple />
          <Story />
          <Gallery />
          {later && <later.Countdown />}
        </div>
        <GarlandBridge />
        {later && <later.LowerSections />}
      </main>
      {later && <later.ThankYou />}
    </SmoothScroll>
  )
}
