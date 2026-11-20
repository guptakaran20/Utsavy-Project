// All invitation content lives here — edit this file to personalise the site.

// The couple and their families. Every line that mentions them (the couple cards, Our Families, the elders,
// contacts, sign-offs) is written from these fields, so a name is only ever typed here.
const bride = {
  name: 'Harleen',
  nameGurmukhi: 'ਹਰਲੀਨ',
  fullName: 'Harleen Kaur',
  relation: 'Daughter', // "Daughter of …"
  mother: 'Manjit Kaur',
  father: 'Gurpreet Singh Sandhu',
  family: 'Sandhu', // the family name: "the Sandhu & Gill families"
  familyGurmukhi: 'ਸੰਧੂ',
  grandmother: 'Surjit Kaur',
  grandfather: 'Balwant Singh Sandhu',
  blurb: 'Architect, chai loyalist and the loudest voice at every giddha circle.',
  photo: '/photos/bride.webp', focus: '50% 30%', // drop the file in /public/photos (see README there); missing = placeholder
}
const groom = {
  name: 'Jasraj',
  nameGurmukhi: 'ਜਸਰਾਜ',
  fullName: 'Jasraj Singh',
  relation: 'Son',
  mother: 'Rajwinder Kaur',
  father: 'Harjit Singh Gill',
  family: 'Gill',
  familyGurmukhi: 'ਗਿੱਲ',
  grandmother: 'Gurdev Kaur',
  grandfather: 'Mohinder Singh Gill',
  blurb: 'Engineer, part-time dhol player, full-time believer in second helpings.',
  photo: '/photos/groom.webp', focus: '46% 24%',
}
// "Sardarni Manjit Kaur & Sardar Gurpreet Singh Sandhu"
const parentsOf = (p) => `Sardarni ${p.mother} & Sardar ${p.father}`
const grandparentsOf = (p) => `Bibi ${p.grandmother} & S. ${p.grandfather}`

// The wedding day itself (India time). The date written out on the scratch card ("Sunday, 21 February 2027")
// and the countdown both follow it.
const date = '2027-02-21T10:30:00+05:30'
const longDate = (iso) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
    .formatToParts(new Date(iso)).map((x) => [x.type, x.value]))
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}`
}
// #HarJasDaViah: the first three letters of each name. Type your own in place of this if you have one.
const hashtag = `#${bride.name.slice(0, 3)}${groom.name.slice(0, 3)}DaViah`

export const wedding = {
  // Shown at the very top. 'ੴ' suits a Sikh wedding; swap for 'ॐ' or similar if needed.
  blessingSymbol: 'ੴ',
  blessingLine: 'ਸ਼ੁਭ ਵਿਆਹ',
  blessingEnglish: 'With the blessings of Waheguru',

  bride: { ...bride, parents: `${bride.relation} of ${parentsOf(bride)}` },
  groom: { ...groom, parents: `${groom.relation} of ${parentsOf(groom)}` },

  // The dhol that plays once the plane has taken off (same recording as the Shahi Haveli invitation)
  music: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/09/DHOL_BEAT.wav/DHOL_BEAT.wav.mp3',
    credit: '“Dhol Beat” by Johnny Kalsi',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DHOL_BEAT.wav',
  },

  // Used by the countdown (local time of the Anand Karaj)
  date,
  dateLabel: longDate(date),
  city: 'Amritsar, Punjab',
  town: 'Amritsar', // the city alone, e.g. "Live time in Amritsar" on the clock
  townGurmukhi: 'ਅੰਮ੍ਰਿਤਸਰ',
  hashtag,
  families: `the ${bride.family} & ${groom.family} families`,
  familiesGurmukhi: `${bride.familyGurmukhi} ਤੇ ${groom.familyGurmukhi} ਪਰਿਵਾਰ`, // same families, in Gurmukhi, for the plane intro

  // the guest greeted when the link has no ?guest=… (a name in the link always wins). Set to '' to greet "Family & Friends".
  guest: 'Karan',

  // {events} is written from the events list below: "with <mood> at the <name>, …, and <mood> at the <name>"
  // (a {guest} placeholder would be filled with the guest's name; the card says "you" by choice)
  invitation:
    'Together with our families, we joyfully invite you to share in the celebrations as we begin our forever — {events}.',

  // Our Story: each chapter's title is shown as written, with its `accent` word picked out in script
  story: [
    {
      year: '2019',
      place: 'Amritsar · 2019',
      photo: '/photos/story-1.webp', focus: '50% 55%',
      title: 'Ik Lohri Mulaqat',
      accent: 'Lohri', // the word in the title written in green script
      text: 'A cousin’s Lohri bonfire, one shared plate of gajak and a debate about who makes the better sarson da saag.',
    },
    {
      year: '2023',
      place: 'Wagah Border · 2023',
      photo: '/photos/story-2.webp', focus: '50% 35%',
      title: 'The Wagah Question',
      accent: 'Wagah',
      text: 'Golden hour at Wagah, nervous hands, and a ring hidden in a box of pinnis from Bibi ji.',
    },
    {
      year: '2026',
      place: 'Chandigarh · 2026',
      photo: '/photos/story-3.webp', focus: '50% 50%',
      title: 'The Roka & Chunni Ceremony',
      accent: 'Chunni',
      text: 'Two families, one very long dinner table, and enough laddoos to feed the whole mohalla.',
    },
  ],

  // `theme` picks a colour treatment for each event card (see Events.css)
  events: [
    {
      id: 'mehndi',
      mood: 'laughter and colour', // the invitation card reads "laughter and colour at the …"
      short: 'Mehndi', // tab label
      start: '2027-02-19T17:00:00+05:30',
      name: 'Mehndi & Sangeet',
      gurmukhi: 'ਮਹਿੰਦੀ ਤੇ ਸੰਗੀਤ',
      time: '5:00 PM onwards',
      venue: 'The Haveli Lawns',
      address: 'GT Road, Amritsar, Punjab',
      attire: 'Shades of green & pink — come ready to dance',
      description: 'Henna, boliyan and a dance floor that will not rest until the dhol does.',
      theme: 'mehndi',
    },
    {
      id: 'maiyan',
      mood: 'songs', // the invitation card reads "songs at the …"
      short: 'Maiyan', // tab label
      start: '2027-02-20T11:00:00+05:30',
      name: 'Maiyan & Jaggo',
      gurmukhi: 'ਮਾਈਆਂ ਤੇ ਜਾਗੋ',
      time: '11:00 AM & 9:00 PM',
      venue: `${bride.family} Residence`,
      address: 'Ranjit Avenue, Amritsar, Punjab',
      attire: 'Yellows in the morning, phulkari at night',
      description: 'Vatna for the bride in the morning; the lit gaagar procession wakes the neighbourhood at night.',
      theme: 'maiyan',
    },
    {
      id: 'anand-karaj',
      mood: 'blessings', // the invitation card reads "blessings at the …"
      short: 'Anand Karaj', // tab label
      start: '2027-02-21T09:00:00+05:30',
      name: 'Anand Karaj',
      gurmukhi: 'ਅਨੰਦ ਕਾਰਜ',
      time: '9:00 AM Milni · 10:30 AM Laavan',
      venue: 'Gurdwara Sahib',
      address: 'Lawrence Road, Amritsar, Punjab',
      attire: 'Traditional · heads covered · shoes removed inside',
      description: 'The four laavan in the presence of Sri Guru Granth Sahib Ji, followed by langar.',
      theme: 'anand',
    },
    {
      id: 'reception',
      mood: 'dancing', // the invitation card reads "dancing at the …"
      short: 'Reception', // tab label
      start: '2027-02-21T19:30:00+05:30',
      name: 'Reception',
      gurmukhi: 'ਰਿਸੈਪਸ਼ਨ',
      time: '7:30 PM onwards',
      venue: 'The Grand Courtyard',
      address: 'Majitha Road, Amritsar, Punjab',
      attire: 'Black tie meets Punjabi glam',
      description: 'Dinner, toasts and one last bhangra before the doli.',
      theme: 'reception',
    },
  ],

  // Family welcome — a warm Punjabi 'sat sri akal' from the elders
  family: {
    gurmukhi: 'ਸਾਡੇ ਵਿਹੜੇ ਆਇਓ, ਸਾਡੀ ਖੁਸ਼ੀ ਵਧਾਇਓ',
    heading: 'Our doors, our hearts, our langar — all open to you',
    message:
      'In a Punjabi home no guest is ever a stranger. Whether you travel from the next lane or from Brampton, Melbourne or Southall, there is a charpai, a glass of lassi and a seat at the table with your name on it. Come as family — leave as family.',
    signoff: `With love, the ${bride.family} & ${groom.family} parivaar`,
    elders: [
      { photo: '/photos/family-1.webp', focus: '50% 40%', role: 'Dadi ji & Dada ji', name: grandparentsOf(bride) },
      { photo: '/photos/family-2.webp', focus: '50% 30%', role: 'Bride’s parents', name: `${bride.mother} & ${bride.father}` },
      { photo: '/photos/family-3.webp', focus: '50% 35%', role: 'Groom’s parents', name: `${groom.mother} & ${groom.father}` },
    ],
  },

  // The Venue page shows this event's place (its venue and address come from the events list above),
  // and its Save the Date button adds this event to the calendar.
  venue: {
    event: 'anand-karaj',
    note: 'Shuttles leave Hotel Ranjit every 30 minutes from 8 AM. Parking beside the gurdwara.',
  },

  // Pages of the 'Moments' book. Each page: a photo, a Gurmukhi line, a title, a place and a few words below.
  gallery: [
    { photo: '/photos/gallery-6.webp', focus: '50% 35%', gurmukhi: 'ਪ੍ਰੀ-ਵੈਡਿੰਗ', caption: 'Pre-Wedding, Pink Hour', place: 'Chandigarh · Pre-wedding shoot', text: 'A pink pagg, a phulkari dupatta and one very shy smile when the ring came out.' },
    { photo: '/photos/gallery-8.webp', focus: '40% 50%', gurmukhi: 'ਪਹਾੜਾਂ ਵਿੱਚ', caption: 'Pallu in the Wind', place: 'Pre-wedding shoot', text: 'A rock face, a pink drape caught by the wind, and neither of us watching the camera.' },
    { photo: '/photos/gallery-9.webp', focus: '50% 40%', gurmukhi: 'ਨੇੜੇ', caption: 'Closer', place: 'Pre-wedding shoot', text: 'Foreheads together, no words needed.' },
    { photo: '/photos/gallery-10.webp', focus: '50% 50%', gurmukhi: 'ਸ਼ਾਮ ਦੀ ਸੈਰ', caption: 'Golden Evening', place: 'Pre-wedding shoot', text: 'Lawns, long shadows and the calm before the wedding chaos.' },
    { photo: '/photos/gallery-3.webp', focus: '45% 40%', gurmukhi: 'ਸਵਾਲ', caption: 'The Question', place: 'Wagah Border · 2023', text: 'Golden hour, nervous hands, and a ring hidden in a box of pinnis from Bibi ji.' },
  ],

  notes: [
    {
      title: 'At the Gurdwara',
      text: 'Please cover your head (rumals will be available), remove shoes at the entrance and sit on the floor in the darbar hall.',
    },
    {
      title: 'Getting there',
      text: 'Sri Guru Ram Dass Jee International Airport (ATQ) is 20 minutes from all venues. Shuttles run between the hotels and every event.',
    },
    {
      title: 'Stay',
      text: `Rooms are held for guests near the Golden Temple. Mention “${bride.name} & ${groom.name}” when booking to receive the family rate.`,
    },
  ],

  rsvp: {
    deadline: 'Kindly respond by 15 January 2027',
    // Optional: a WhatsApp number in international format without '+', e.g. '9198XXXXXXXX'.
    // When set, submitting the form opens WhatsApp with a pre-filled RSVP message.
    whatsapp: '',
  },

  contacts: [
    { label: 'Bride’s family', name: bride.father, phone: '+91 98XXX XXXXX' },
    { label: 'Groom’s family', name: groom.father, phone: '+91 98XXX XXXXX' },
  ],

  // Both families — shown on the 'Our Families' page: the two sides side by side, their red and gold
  // threads tied into one knot over the couple's names
  bothFamilies: {
    bride: {
      label: 'The Bride’s Family',
      family: bride.family,
      familyGurmukhi: bride.familyGurmukhi,
      mother: `Sardarni ${bride.mother}`,
      father: `Sardar ${bride.father}`,
      name: bride.fullName,
      grandLabel: 'Granddaughter of',
      grand: grandparentsOf(bride),
      blessing: 'A daughter’s laughter, now lighting up two homes.',
    },
    groom: {
      label: 'The Groom’s Family',
      family: groom.family,
      familyGurmukhi: groom.familyGurmukhi,
      mother: `Sardarni ${groom.mother}`,
      father: `Sardar ${groom.father}`,
      name: groom.fullName,
      grandLabel: 'Grandson of',
      grand: grandparentsOf(groom),
      blessing: 'A son’s promise, to cherish and to stand beside.',
    },
    invite: 'joyfully invite you to the wedding of their children',
  },

  // Ashirwad wall — starter blessings; guests can add their own (saved on their device only)
  wishes: [
    { name: `Bibi ${bride.grandmother}`, text: 'Rab tuhanu hamesha hasde-vasde rakhe. May your home always smell of fresh rotis and laughter.' },
    { name: 'Simran Masi', text: 'Two of my favourite people, one beautiful journey. The giddha will be loud, I promise!' },
    { name: 'Gurdeep Chacha', text: 'Jodi salamat rahe! Save a plate of sarson da saag for me.' },
    { name: `The ${groom.family} Parivaar`, text: `Welcome to our family, ${bride.name}. Our door, and our kitchen, are always yours.` },
  ],

  // People to call for travel, stay and the day itself (whatsapp: international digits, no '+', optional)
  help: [
    { label: 'Travel & stay', name: 'Simranjeet Kaur', phone: '+91 98XXX XXXXX', whatsapp: '' },
    { label: 'On the wedding day', name: 'Arshdeep Singh', phone: '+91 98XXX XXXXX', whatsapp: '' },
  ],
}

// each event's written date ("Friday, 19 February 2027") follows its start time
wedding.events.forEach((e) => { e.date ??= longDate(e.start) })

// the Venue page's place is the chosen event's
{
  const e = wedding.events.find((x) => x.id === wedding.venue.event) || wedding.events[0]
  Object.assign(wedding.venue, { name: e.venue, address: e.address })
}

