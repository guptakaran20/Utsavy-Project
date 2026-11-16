// The guest's name comes from the invitation link: ?guest=Sardar+Gurpreet+Singh+ji
// With no name in the link, the invitation addresses everyone.
export const guestName = () =>
  (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('guest')?.trim()) || 'Family & Friends'
