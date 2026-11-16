// All invitation content lives here — edit this file to personalise the site.

export const wedding = {
  // Shown at the very top. 'ੴ' suits a Sikh wedding; swap for 'ॐ' or similar if needed.
  blessingSymbol: 'ੴ',
  blessingLine: 'ਸ਼ੁਭ ਵਿਆਹ',
  blessingEnglish: 'With the blessings of Waheguru',

  bride: {
    name: 'Harleen',
    nameGurmukhi: 'ਹਰਲੀਨ',
    fullName: 'Harleen Kaur',
    parents: 'Daughter of Sardarni Manjit Kaur & Sardar Gurpreet Singh Sandhu',
    blurb: 'Architect, chai loyalist and the loudest voice at every giddha circle.',
    photo: '/photos/bride.jpg', // drop the file in /public/photos (see README there); missing = placeholder
  },
  groom: {
    name: 'Jasraj',
    nameGurmukhi: 'ਜਸਰਾਜ',
    fullName: 'Jasraj Singh',
    parents: 'Son of Sardarni Rajwinder Kaur & Sardar Harjit Singh Gill',
    blurb: 'Engineer, part-time dhol player, full-time believer in second helpings.',
    photo: '/photos/groom.jpg',
  },

  // The dhol that plays once the plane has taken off (same recording as the Shahi Haveli invitation)
  music: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/09/DHOL_BEAT.wav/DHOL_BEAT.wav.mp3',
    credit: '“Dhol Beat” by Johnny Kalsi',
    license: 'CC BY 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:DHOL_BEAT.wav',
  },

  // Used by the countdown (local time of the Anand Karaj)
  date: '2027-02-21T10:30:00+05:30',
  dateLabel: 'Sunday, 21 February 2027',
  city: 'Amritsar, Punjab',
  hashtag: '#HarJasDaViah',
  families: 'the Sandhu & Gill families',

  invitation:
    'Together with our families, we joyfully invite you to share in the celebrations as we begin our forever — with laughter at the Sangeet, colour at the Mehndi, and blessings at the Anand Karaj.',

  story: [
    {
      year: '2019',
      headline: ['Ik', '& Lohri', 'Mulaqat'],
      place: 'Amritsar · 2019',
      photo: '/photos/story-1.jpg',
      title: 'Ik Mulaqat',
      text: 'A cousin’s Lohri bonfire, one shared plate of gajak and a debate about who makes the better sarson da saag.',
    },
    {
      year: '2023',
      headline: ['The', '& Wagah', 'Question'],
      place: 'Wagah Border · 2023',
      photo: '/photos/story-2.jpg',
      title: 'The Question',
      text: 'Golden hour at Wagah, nervous hands, and a ring hidden in a box of pinnis from Bibi ji.',
    },
    {
      year: '2026',
      headline: ['The Roka', '& chunni', 'Ceremony'],
      place: 'Chandigarh · 2026',
      photo: '/photos/story-3.jpg',
      title: 'Roka & Chunni',
      text: 'Two families, one very long dinner table, and enough laddoos to feed the whole mohalla.',
    },
  ],

  // `theme` picks a colour treatment for each event card (see Events.css)
  events: [
    {
      id: 'mehndi',
      start: '2027-02-19T17:00:00+05:30',
      name: 'Mehndi & Sangeet',
      gurmukhi: 'ਮਹਿੰਦੀ ਤੇ ਸੰਗੀਤ',
      date: 'Friday, 19 February 2027',
      time: '5:00 PM onwards',
      venue: 'The Haveli Lawns',
      address: 'GT Road, Amritsar, Punjab',
      attire: 'Shades of green & pink — come ready to dance',
      description: 'Henna, boliyan and a dance floor that will not rest until the dhol does.',
      theme: 'mehndi',
    },
    {
      id: 'maiyan',
      start: '2027-02-20T11:00:00+05:30',
      name: 'Maiyan & Jaggo',
      gurmukhi: 'ਮਾਈਆਂ ਤੇ ਜਾਗੋ',
      date: 'Saturday, 20 February 2027',
      time: '11:00 AM & 9:00 PM',
      venue: 'Sandhu Residence',
      address: 'Ranjit Avenue, Amritsar, Punjab',
      attire: 'Yellows in the morning, phulkari at night',
      description: 'Vatna for the bride in the morning; the lit gaagar procession wakes the neighbourhood at night.',
      theme: 'maiyan',
    },
    {
      id: 'anand-karaj',
      start: '2027-02-21T09:00:00+05:30',
      name: 'Anand Karaj',
      gurmukhi: 'ਅਨੰਦ ਕਾਰਜ',
      date: 'Sunday, 21 February 2027',
      time: '9:00 AM Milni · 10:30 AM Laavan',
      venue: 'Gurdwara Sahib',
      address: 'Lawrence Road, Amritsar, Punjab',
      attire: 'Traditional · heads covered · shoes removed inside',
      description: 'The four laavan in the presence of Sri Guru Granth Sahib Ji, followed by langar.',
      theme: 'anand',
    },
    {
      id: 'reception',
      start: '2027-02-21T19:30:00+05:30',
      name: 'Reception',
      gurmukhi: 'ਰਿਸੈਪਸ਼ਨ',
      date: 'Sunday, 21 February 2027',
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
    signoff: 'With love, the Sandhu & Gill parivaar',
    elders: [
      { photo: '/photos/family-1.jpg', role: 'Dadi ji & Dada ji', name: 'Bibi Surjit Kaur & S. Balwant Singh' },
      { photo: '/photos/family-2.jpg', role: 'Bride’s parents', name: 'Manjit Kaur & Gurpreet Singh Sandhu' },
      { photo: '/photos/family-3.jpg', role: 'Groom’s parents', name: 'Rajwinder Kaur & Harjit Singh Gill' },
    ],
  },

  venue: {
    name: 'The Haveli Lawns',
    address: 'GT Road, Amritsar, Punjab 143001',
    note: 'Shuttles leave Hotel Ranjit every 30 minutes from 4 PM. Parking inside the haveli gates.',
    mapQuery: 'Amritsar, Punjab',
  },

  gallery: [
    { photo: '/photos/gallery-1.jpg', caption: 'Ik Mulaqat', gurmukhi: 'ਇੱਕ ਮੁਲਾਕਾਤ', tone: 'maroon' },
    { photo: '/photos/gallery-2.jpg', caption: 'Chai at Wagah', gurmukhi: 'ਵਾਹਗਾ ਦੀ ਸ਼ਾਮ', tone: 'emerald' },
    { photo: '/photos/gallery-3.jpg', caption: 'The Question', gurmukhi: 'ਸਵਾਲ', tone: 'gold' },
    { photo: '/photos/gallery-4.jpg', caption: 'Roka & Chunni', gurmukhi: 'ਰੋਕਾ', tone: 'maroon' },
    { photo: '/photos/gallery-5.jpg', caption: 'Bhangra nights', gurmukhi: 'ਭੰਗੜਾ', tone: 'emerald' },
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
      text: 'Rooms are held for guests near the Golden Temple. Mention “Harleen & Jasraj” when booking to receive the family rate.',
    },
  ],

  rsvp: {
    deadline: 'Kindly respond by 15 January 2027',
    // Optional: a WhatsApp number in international format without '+', e.g. '9198XXXXXXXX'.
    // When set, submitting the form opens WhatsApp with a pre-filled RSVP message.
    whatsapp: '',
  },

  contacts: [
    { label: 'Bride’s family', name: 'Gurpreet Singh Sandhu', phone: '+91 98XXX XXXXX' },
    { label: 'Groom’s family', name: 'Harjit Singh Gill', phone: '+91 98XXX XXXXX' },
  ],
}
