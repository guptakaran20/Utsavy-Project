// Everything from the countdown down. App.jsx loads this as its own download, started the moment the site mounts,
// so the intro and hero (plus GSAP and Lenis) reach a slow phone first and these sections, with Framer Motion and
// their CSS, arrive behind the plane intro while the guest is still reading it.
import Countdown from './components/Countdown'
import Events from './components/Events'
import Venue from './components/Venue'
import OurFamilies from './components/OurFamilies'
import GuestNotes from './components/GuestNotes'
import Rsvp from './components/Rsvp'
import Wishes from './components/Wishes'
import Contacts from './components/Contacts'
import ThankYou from './components/ThankYou'

export { Countdown, ThankYou }

export function LowerSections() {
  return (
    <>
      {/* its own sheet of blush paper and flowers, held on screen while the days change; the flowers above fade out as these fade in */}
      <Events />
      <Venue />
      <OurFamilies />
      <GuestNotes />
      <Rsvp />
      <Wishes />
      <Contacts />
    </>
  )
}
