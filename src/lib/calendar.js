// Builds and downloads a small .ics file so guests can save an event.
const stamp = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')

export function downloadIcs({ title, start, hours = 3, location, description }) {
  const s = new Date(start)
  const e = new Date(s.getTime() + hours * 3600_000)
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Wedding Invite//EN', 'BEGIN:VEVENT',
    `UID:${stamp(s)}-${title.replace(/\W/g, '')}@invite`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(s)}`, `DTEND:${stamp(e)}`,
    `SUMMARY:${title}`, `LOCATION:${location}`, `DESCRIPTION:${description ?? ''}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${title.replace(/\W+/g, '-')}.ics` })
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
