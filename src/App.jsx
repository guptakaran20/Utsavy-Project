import { useEffect, useState } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { SmoothScroll } from './lib/smoothScroll'
import HaveliGate from './components/haveli/HaveliGate'
import Nav from './components/Nav'
import Hero from './components/Hero'
import PhulkariBand from './components/PhulkariBand'
import Invitation from './components/Invitation'
import Couple from './components/Couple'
import Story from './components/Story'
import Countdown from './components/Countdown'
import Events from './components/Events'
import GuestNotes from './components/GuestNotes'
import Rsvp from './components/Rsvp'
import Footer from './components/Footer'

export default function App() {
  const [opened, setOpened] = useState(false)
  const [gateDone, setGateDone] = useState(false)

  useEffect(() => {
    // Web fonts change text heights, which shifts every trigger position
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return (
    <SmoothScroll locked={!opened}>
      {!gateDone && <HaveliGate onOpen={() => setOpened(true)} onDone={() => setGateDone(true)} />}
      <Nav visible={opened} />
      <main>
        <Hero play={opened} />
        <PhulkariBand />
        <Invitation />
        <Couple />
        <Story />
        <Countdown />
        <PhulkariBand reverse />
        <Events />
        <GuestNotes />
        <PhulkariBand />
        <Rsvp />
      </main>
      <Footer />
    </SmoothScroll>
  )
}
