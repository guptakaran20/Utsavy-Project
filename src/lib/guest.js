import { wedding } from '../data/wedding'

// The guest's name comes from the invitation link (?guest=Sardar+Gurpreet+Singh+ji); with none in the link,
// wedding.guest is used, and if that is empty the invitation addresses everyone.
const fromLink = () => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('guest')?.trim()) || ''
const named = () => fromLink() || wedding.guest?.trim() || ''

export const guestName = () => named() || 'Family & Friends'

// true when there is a guest to address by name (so wording can say their name instead of "you")
export const hasGuestName = () => !!named()

// fills {guest} in a sentence: the guest's name when there is one, otherwise "you"
export const withGuest = (text) => text.replaceAll('{guest}', hasGuestName() ? guestName() : 'you')
