// Worst-case content for checking layouts (dev only, ?stress): every name, place and line made long, with a few
// long unbroken words, so any text that can't wrap or shrink shows up at once.
const LONG = 'Supercalifragilisticexpialidocious'
const longer = (s, extra) => (typeof s === 'string' && s ? `${s} ${extra}` : s)

export function stress(w) {
  const person = (p, first) => Object.assign(p, {
    name: `${first}preetinderjeet`,
    fullName: `${first}preetinderjeet Kaur Randhawa-Dhillon`,
    parents: longer(p.parents, 'Sandhu-Grewal-Randhawa of Jalandhar Cantonment'),
    blurb: longer(p.blurb, 'Also an award-winning baker, marathon runner and the unofficial DJ of every family function since 2009.'),
  })
  person(w.bride, 'Har')
  person(w.groom, 'Jas')
  w.city = 'Sri Anandpur Sahib, Rupnagar District, Punjab'
  w.town = 'Sri Anandpur Sahib'
  w.hashtag = `#${LONG}DaViahHoGayaBallleBalle`
  w.families = 'the Sandhu-Grewal-Randhawa & Gill-Dhillon-Sidhu families'
  w.guest = `Sardar Gurpreet Singh ${LONG} ji and family`
  w.invitation = longer(w.invitation, 'We would be honoured to have you with us for every single moment of it, from the first song to the very last dance.')
  w.story.forEach((s) => Object.assign(s, { title: longer(s.title, 'And A Very Long Afternoon'), place: longer(s.place, '· Ludhiana Railway Station'), text: longer(s.text, 'Nobody remembers who won, but everybody remembers the laughing.') }))
  w.events.forEach((e) => Object.assign(e, {
    name: longer(e.name, '& Grand Celebration'), venue: longer(e.venue, 'Banquet & Convention Centre'),
    address: longer(e.address, '— Opposite Guru Nanak Dev University Gate No. 2, 143005'),
    time: longer(e.time, 'until very late'), attire: longer(e.attire, 'and comfortable shoes for dancing'),
    description: longer(e.description, 'There will be food, music and far more relatives than anyone can name.'),
  }))
  Object.assign(w.venue, { name: longer(w.venue.name, 'Banquet & Convention Centre'), address: longer(w.venue.address, '— Opposite Guru Nanak Dev University Gate No. 2, 143005') })
  w.gallery.forEach((g) => Object.assign(g, { caption: longer(g.caption, 'Under The Old Banyan Tree'), place: longer(g.place, '· Kasauli Hills'), text: longer(g.text, 'We still argue about who laughed first.') }))
  w.notes.forEach((n) => Object.assign(n, { title: longer(n.title, '& Everything Else'), text: longer(n.text, 'Please reach out to us if you need anything at all; we are always happy to help.') }))
  w.contacts.concat(w.help).forEach((c) => Object.assign(c, { name: `Sardar ${LONG} Singh Randhawa`, label: longer(c.label, '& logistics') }))
  for (const k of ['bride', 'groom']) {
    const f = w.bothFamilies[k]
    Object.assign(f, { family: 'Sandhu-Grewal-Randhawa', mother: `${f.mother} Randhawa-Dhillon`, father: `${f.father} Randhawa-Dhillon`, name: w[k].fullName, grand: longer(f.grand, 'Randhawa-Dhillon') })
  }
  w.family.elders.forEach((e) => { e.name = longer(e.name, 'Randhawa-Dhillon') })
  w.family.signoff = longer(w.family.signoff, 'and every single cousin')
  w.wishes.forEach((x) => Object.assign(x, { name: `${x.name} ${LONG}`, text: longer(x.text, 'Ik vaari phir, bahut bahut vadhaiyaan from all of us!') }))
}
