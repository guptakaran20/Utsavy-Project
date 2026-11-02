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
    photo: null, // e.g. '/photos/bride.jpg' — drop images in /public/photos
  },
  groom: {
    name: 'Jasraj',
    nameGurmukhi: 'ਜਸਰਾਜ',
    fullName: 'Jasraj Singh',
    parents: 'Son of Sardarni Rajwinder Kaur & Sardar Harjit Singh Gill',
    blurb: 'Engineer, part-time dhol player, full-time believer in second helpings.',
    photo: null,
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
      title: 'Ik Mulaqat',
      text: 'A cousin’s Lohri bonfire, one shared plate of gajak and a debate about who makes the better sarson da saag.',
    },
    {
      year: '2023',
      title: 'The Question',
      text: 'Golden hour at Wagah, nervous hands, and a ring hidden in a box of pinnis from Bibi ji.',
    },
    {
      year: '2026',
      title: 'Roka & Chunni',
      text: 'Two families, one very long dinner table, and enough laddoos to feed the whole mohalla.',
    },
  ],

  // `theme` picks a colour treatment for each event card (see Events.css)
  events: [
    {
      id: 'mehndi',
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
