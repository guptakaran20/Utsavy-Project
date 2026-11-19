import { wedding } from '../data/wedding'
import { withGuest } from './guest'

// "with laughter and colour at the Mehndi & Sangeet, songs at the Maiyan & Jaggo, … and dancing at the Reception",
// built from wedding.events so the card follows whatever events are listed (an event without a mood gets "joy")
export const eventsPhrase = (events = wedding.events) => {
  const parts = events.map((e) => `${e.mood || 'joy'} at the ${e.name}`)
  if (parts.length === 0) return ''
  if (parts.length === 1) return `with ${parts[0]}`
  return `with ${parts.slice(0, -1).join(', ')}${parts.length > 2 ? ',' : ''} and ${parts.at(-1)}`
}

// the invitation paragraph with {events} and {guest} filled in
export const invitationText = () => withGuest(wedding.invitation.replaceAll('{events}', eventsPhrase()))
