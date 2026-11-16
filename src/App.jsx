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
import Countdown from './components/Countdown'
import Events from './components/Events'
import GuestNotes from './components/GuestNotes'
import Rsvp from './components/Rsvp'
import ThankYou from './components/ThankYou'
import Marquee from './components/Marquee'
import FamilyWelcome from './components/FamilyWelcome'
import Venue from './components/Venue'
import Gallery from './components/Gallery'
import MusicToggle from './components/MusicToggle'
import AutoTour from './lib/AutoTour'
import { dhol } from './lib/dhol'

// 'plane' = a night flight crosses the sky, then the invitation opens; 'gate' = the haveli doorway (kept intact, switch back any time)
const INTRO = 'plane'

export default function App() {
  const [opened, setOpened] = useState(false)
  const [gateDone, setGateDone] = useState(false)

  useEffect(() => {
    // Web fonts change text heights, which shifts every trigger position
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <SmoothScroll locked={!opened}>
      {!gateDone && (INTRO === 'plane'
        ? <PlaneIntro onTakeoff={() => dhol.prime()} onEnter={() => { setOpened(true); dhol.start() }} onDone={() => setGateDone(true)} />
        : <HaveliGate onEnter={() => setOpened(true)} onDone={() => setGateDone(true)} />)}
      <MusicToggle visible={opened} />
      <AutoTour armed={opened} />
      <main>
        <Hero play={opened} />
        <div className="blush-run sky-bg">
          <FloralSides tiles={40} />
          <Invitation />
          <Couple />
          <Story />
          <Countdown />
        </div>
        {/* its own sheet of blush paper and flowers, held on screen while the days change; the flowers above fade out as these fade in */}
        <Events />
        <Venue />
        <FamilyWelcome />
        <GuestNotes />
        <Rsvp />
      </main>
      <ThankYou />
    </SmoothScroll>
  )
}
