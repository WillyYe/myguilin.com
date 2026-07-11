// Single source of truth for the Guilin Hotels module (2nd-level category pages).
// Reuses SITE config from attractions-data.mjs so URLs / brand stay consistent.
import { SITE } from './attractions-data.mjs';

// ---------------------------------------------------------------------------
// Hotels (real Guilin/Yangshuo properties sourced from the operator's folder)
// ---------------------------------------------------------------------------
export const hotels = [
  {
    slug: 'yingu',
    name: 'Yingu Valley Retreat',
    cnName: '阳朔隐谷',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Yulong River',
    priceFrom: 480,
    priceTier: '$$',
    tagline: 'Terraced rooms wrapped in karst peaks, with private terraces and mountain views.',
    category: ['scenic-view', 'selected'],
    cardImg: 'hotel-yingu-1',
    heroImage: 'hotel-yingu-1',
    address: 'Fengming / Yulong River area, Yangshuo County, Guilin',
    intro: [
      'Yingu (隐谷) is a small design-led retreat tucked into the hills beside the Yulong River. Every room opens to the karst landscape — some with private terraces, some with soaking tubs and balcony views.',
      'It suits travellers who want quiet, greenery and a slower pace, while staying a short scooter ride from Yangshuo West Street and the bamboo-raft piers.'
    ],
    highlights: [
      { title: 'Mountain-view rooms', text: 'Most rooms face the karst peaks; terrace and balcony layouts available.' },
      { title: 'Private terraces', text: 'Select rooms come with a terrace or balcony overlooking the valley.' },
      { title: 'Riverside location', text: 'Minutes from Yulong River bamboo-rafting and cycling paths.' },
      { title: 'Calm & green', text: 'Low-rise buildings set among trees — no big-lobby bustle.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'Mountain-view rooms', 'Terrace / balcony', 'Luggage storage', 'English-friendly host'],
    bookingNote: 'Bookable on Ctrip / Trip.com, Booking.com and Agoda (Expedia ID 127230046). Contact us on WhatsApp for bundled stay + tour deals.',
    faqs: [
      { q: 'Is breakfast included?', a: 'Breakfast availability varies by rate — check the plan when booking, or ask us to confirm.' },
      { q: 'How far is it from Yulong River?', a: 'A few minutes by e-bike; we can arrange raft pickup nearby.' },
      { q: 'Do they speak English?', a: 'The host communicates in basic English and we provide full translation support.' }
    ]
  },
  {
    slug: 'minos',
    name: 'MINOS Yangshuo',
    cnName: '阳朔米诺斯民宿',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Shili Gallery',
    priceFrom: 454,
    priceTier: '$$',
    tagline: 'A white-and-blue Aegean-themed guesthouse near the Ten-Mile Gallery.',
    category: ['scenic-view', 'selected'],
    cardImg: 'hotel-minos-1',
    heroImage: 'hotel-minos-1',
    address: 'Fengming 3rd Group, Yangshuo Town, Guilin (near Shili Gallery)',
    intro: [
      'MINOS brings a touch of the Aegean to Yangshuo — white walls, blue accents and a relaxed holiday mood, a short walk from the Shili Gallery (Ten-Mile Gallery) scenery.',
      'Room types range from cosy king rooms to balcony and private-plunge-pool rooms, all with mountain views. Reference rates start around ¥454 on Ctrip.'
    ],
    highlights: [
      { title: 'Aegean design', text: 'Distinctive white-and-blue styling, great for photos.' },
      { title: 'Balcony & plunge rooms', text: 'Some rooms add a balcony or a private plunge pool with a hammock.' },
      { title: 'Near Shili Gallery', text: 'Walking distance to the Ten-Mile Gallery karst corridor.' },
      { title: 'Real guest reviews', text: '20+ bilingual (CN/EN) guest reviews on file.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'Mountain-view rooms', 'Balcony / terrace', 'Some rooms with plunge pool', 'Luggage storage'],
    bookingNote: 'Listed on Ctrip, Booking.com, Expedia (ID 127689996) and Agoda. Rates from ¥454 (reference, varies by season).',
    faqs: [
      { q: 'What is the starting price?', a: 'Ctrip reference rates start around ¥454; peak-season and holiday prices are higher.' },
      { q: 'Are there family rooms?', a: 'Yes — balcony king and plunge-pool rooms suit couples; some layouts fit a small family.' },
      { q: 'How do I get there from the station?', a: 'We arrange private pickup from Yangshuo / Guilin stations on request.' }
    ]
  },
  {
    slug: 'bgdesign',
    name: 'B&G Designer Resort',
    cnName: '光屿设计师度假酒店',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceFrom: 136,
    priceTier: '$',
    tagline: 'Smart, design-forward rooms at West Street value — from ¥136.',
    category: ['budget', 'scenic-view'],
    cardImg: 'hotel-bgdesign-1',
    heroImage: 'hotel-bgdesign-1',
    address: 'No. 9 Xiangshui Road, Yangshuo County, Guilin',
    intro: [
      'B&G (光屿) is a designer budget hotel near Yangshuo West Street and the Qianguqing show. Rooms are compact but smart: zero-pressure mattresses, HD projection and intelligent windows, most with a mountain view.',
      'Reference rates start at ¥136 (twin) and go to about ¥204 (family) — strong value for a design hotel in town.'
    ],
    highlights: [
      { title: 'Smart rooms', text: 'Zero-pressure mattresses, HD projection, intelligent windows.' },
      { title: 'Mountain-view', text: 'Most rooms face the karst hills.' },
      { title: 'Central & walkable', text: 'Near West Street and the Qianguqing theatre district.' },
      { title: 'Best value', text: 'Design-hotel feel from ¥136.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'Smart TV / projection', 'Mountain-view rooms', 'Family rooms', '24h front desk'],
    bookingNote: 'Book on Ctrip / Trip.com. Reference rates ¥136–¥204 (May sample). Great for travellers watching the budget.',
    faqs: [
      { q: 'Is breakfast included?', a: 'Breakfast is not included in the base rate; many cafés are within a short walk.' },
      { q: 'How close to West Street?', a: 'About a 10–15 minute walk to the West Street pedestrian area.' },
      { q: 'Good for families?', a: 'Yes — family rooms sleep up to 4; the圣岛 family room is a popular pick.' }
    ]
  },
  {
    slug: 'hetianye',
    name: 'Hetianye Hotel',
    cnName: '和田野酒店',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Countryside',
    priceFrom: 220,
    priceTier: '$',
    tagline: 'Quiet countryside rooms with sweeping karst and field views.',
    category: ['budget', 'scenic-view'],
    cardImg: 'hotel-hetianye-2',
    heroImage: 'hotel-hetianye-1',
    address: 'Yangshuo countryside, Guilin',
    intro: [
      'Hetianye (和田野) sits among the fields and hills on the outskirts of Yangshuo. Room names say it all — 山色 (mountain colours), 阅景 (view-reading), 观岚 (mist-watching) — all oriented to the landscape.',
      'It is a calm, mid-range pick for travellers who want the scenery without the West Street crowds.'
    ],
    highlights: [
      { title: 'View rooms', text: '山色 / 阅景 / 观岚 rooms frame the karst and fields.' },
      { title: '270° suites', text: 'Corner suites offer wide-angle panoramic views.' },
      { title: 'Quiet countryside', text: 'Away from the busy town centre.' },
      { title: 'Family friendly', text: 'Parent-child suites available.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'Mountain-view rooms', 'Family suites', 'Luggage storage', 'Bike rental nearby'],
    bookingNote: 'Listed on major OTAs; ask us for the best rate and a stay + tour bundle.',
    faqs: [
      { q: 'How do I reach the town from here?', a: 'An e-bike or taxi gets you to West Street in ~10 minutes; we can help arrange.' },
      { q: 'Are there family suites?', a: 'Yes — parent-child and 270° panoramic suites are available.' },
      { q: 'Is it good for photos?', a: 'The view rooms and surrounding fields are very photogenic at sunrise.' }
    ]
  },
  {
    slug: 'junyue',
    name: 'Junyue Hotel Yangshuo',
    cnName: '阳朔君悦大酒店',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Town',
    priceFrom: 420,
    priceTier: '$$',
    tagline: 'A full-service town hotel with larger rooms and a grand lobby.',
    category: ['selected'],
    cardImg: 'hotel-junyue-1',
    heroImage: 'hotel-junyue-2',
    address: 'Yangshuo Town, Guilin',
    intro: [
      'Junyue (君悦) is one of Yangshuo’s larger full-service hotels — bigger rooms, a proper lobby and on-site dining, good for travellers who prefer a conventional hotel over a guesthouse.',
      'Deluxe king rooms and family layouts are available; it works well as a comfortable base for day trips around Guilin.'
    ],
    highlights: [
      { title: 'Full-service hotel', text: 'Larger rooms, lobby lounge and on-site dining.' },
      { title: 'Deluxe rooms', text: '心悦 deluxe king rooms with comfortable bedding.' },
      { title: 'Central base', text: 'Easy taxi access to piers, West Street and shows.' },
      { title: 'Family layouts', text: 'Rooms and suites that fit families.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'On-site restaurant', 'Lobby lounge', 'Family rooms', '24h front desk', 'Concierge'],
    bookingNote: 'Book on Ctrip / Trip.com and major OTAs. Good for travellers wanting hotel-style service.',
    faqs: [
      { q: 'Does it have a restaurant?', a: 'Yes — on-site dining is available.' },
      { q: 'Is it close to the shows?', a: 'A short taxi ride to the Qianguqing / Impression Sanjie Liu venues.' },
      { q: 'Good for groups?', a: 'Yes — larger rooms and a lobby make it group-friendly.' }
    ]
  },
  {
    slug: 'linshuiwan',
    name: 'Linshuiwan Guesthouse',
    cnName: '阳朔临水湾民宿',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Riverside',
    priceFrom: 200,
    priceTier: '$',
    tagline: 'A cosy riverside guesthouse for slow Yangshuo mornings.',
    category: ['budget'],
    cardImg: 'web-yangshuo-countryside',
    heroImage: 'web-yangshuo-countryside',
    address: 'Yangshuo riverside area, Guilin',
    intro: [
      'Linshuiwan (临水湾) is a small riverside guesthouse popular with independent travellers who want a homestay feel and easy access to the water.',
      'Rates are friendly and the setting is classic Yangshuo — green hills, a quiet stream and morning mist.'
    ],
    highlights: [
      { title: 'Riverside setting', text: 'Close to the water for easy morning walks.' },
      { title: 'Homestay feel', text: 'Small-scale, personal hosting.' },
      { title: 'Budget friendly', text: 'One of the lower-priced stays in Yangshuo.' },
      { title: 'Easy cycling', text: 'On the Yangshuo cycling loop.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'Riverside access', 'Bike rental nearby', 'Luggage storage'],
    bookingNote: 'Listed on major OTAs. Ask us to match it with a bamboo-raft or cycling day.',
    faqs: [
      { q: 'Is it on the river?', a: 'It is a short walk from the riverside; exact pier varies by season.' },
      { q: 'Good for cyclists?', a: 'Yes — it sits on the popular Yangshuo cycling route.' },
      { q: 'Best season?', a: 'Spring and autumn for mild weather and clear karst views.' }
    ]
  },
  {
    slug: 'yuyuan',
    name: 'Yuyuan Resort',
    cnName: '阳遇源景舍',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Yulong River',
    priceFrom: 360,
    priceTier: '$$',
    tagline: 'A resort-style stay beside the Yulong River landscape.',
    category: ['selected', 'budget'],
    cardImg: 'web-yulong-karst',
    heroImage: 'web-yulong-karst',
    address: 'Yulong River area, Yangshuo County, Guilin',
    intro: [
      'Yuyuan Resort (阳遇源景舍) is a resort-style property set in the Yulong River scenery — a step up in space and grounds from a standard guesthouse.',
      'It suits travellers who want a planted, open-air environment with easy access to rafting and village walks.'
    ],
    highlights: [
      { title: 'Resort grounds', text: 'More open space and greenery than a typical guesthouse.' },
      { title: 'Yulong River', text: 'Close to rafting piers and village paths.' },
      { title: 'Relaxed pace', text: 'A good unwind base between day trips.' },
      { title: 'Group friendly', text: 'Rooms and layouts that fit small groups.' }
    ],
    facilities: ['Free Wi-Fi', 'Air conditioning', 'Garden / grounds', 'Riverside access', 'Luggage storage'],
    bookingNote: 'Listed on major OTAs. We can bundle it with a private Yulong River tour.',
    faqs: [
      { q: 'Is it on the Yulong River?', a: 'It is in the Yulong River scenic area, a short ride from the rafting piers.' },
      { q: 'Good for a group?', a: 'Yes — the resort layout suits small groups and families.' },
      { q: 'How to book?', a: 'Via OTAs or through us with a tour bundle.' }
    ]
  }
];

// ---------------------------------------------------------------------------
// 2nd-level category pages
// ---------------------------------------------------------------------------
export const hotelCategories = [
  {
    slug: 'scenic-view',
    name: 'Scenic-View Hotels',
    cnName: '山水景观酒店',
    tagline: 'Rooms that frame the karst — mountain views, terraces and riverside calm.',
    heroImage: 'hotel-yingu-1',
    intro: [
      'Guilin’s magic is its landscape. These stays put the karst peaks, terraced hills and rivers right outside your window — ideal if the view is the point of the trip.',
      'All are in Yangshuo, the easiest base for Li River, Yulong River and the countryside loops.'
    ],
    hotelSlugs: ['yingu', 'minos', 'bgdesign', 'hetianye'],
    faqs: [
      { q: 'Which area is best for scenery?', a: 'Yangshuo — especially the Yulong River and Shili Gallery corridors.' },
      { q: 'Do these hotels have mountain-view rooms?', a: 'Yes, most rooms in this collection face the karst hills.' },
      { q: 'Are they near the river?', a: 'Several are a short ride from Yulong River rafting piers.' }
    ]
  },
  {
    slug: 'selected',
    name: 'Curated Stays',
    cnName: '精选酒店',
    tagline: 'Hand-picked properties with character, service and standout design.',
    heroImage: 'hotel-minos-1',
    intro: [
      'A shortlist of stays we’d recommend to friends — design guesthouses, a full-service town hotel and a resort by the river.',
      'Each is chosen for consistent quality, helpful hosts and a location that makes sightseeing easy.'
    ],
    hotelSlugs: ['yingu', 'minos', 'junyue', 'yuyuan'],
    faqs: [
      { q: 'How are these curated?', a: 'By real guest feedback, host responsiveness and location — not paid placement.' },
      { q: 'Are they English-friendly?', a: 'Most hosts speak basic English; we provide full translation support end-to-end.' },
      { q: 'Can I bundle with tours?', a: 'Yes — ask us for a stay + private-guide package.' }
    ]
  },
  {
    slug: 'budget',
    name: 'Great-Value Stays',
    cnName: '性价比酒店',
    tagline: 'Comfortable, well-located rooms that leave more budget for experiences.',
    heroImage: 'hotel-bgdesign-1',
    intro: [
      'Travelling on a budget shouldn’t mean a bad view. These picks keep rates friendly while staying clean, central and scenic.',
      'From a ¥136 design hotel to riverside guesthouses, all are real, bookable properties in Yangshuo.'
    ],
    hotelSlugs: ['bgdesign', 'hetianye', 'linshuiwan', 'yuyuan'],
    faqs: [
      { q: 'What is the cheapest option?', a: 'B&G Designer Resort starts around ¥136 (reference rate).' },
      { q: 'Are budget stays safe and clean?', a: 'Yes — all are listed on major OTAs with real reviews.' },
      { q: 'Do they include breakfast?', a: 'Usually not in the base rate; cafés are nearby.' }
    ]
  },
  {
    slug: 'region',
    name: 'Hotels by Area',
    cnName: '区域酒店',
    tagline: 'Pick your base first — Yangshuo is ready now; more areas coming soon.',
    heroImage: 'web-yangshuo-countryside',
    intro: [
      'Guilin is spread out, so where you stay shapes your days. Start with Yangshuo — it has the scenery, the food and the easiest access to the Li and Yulong rivers.',
      'We are adding Guilin City, Longji Terraces and Xingping ancient town stays next. Listed below are the Yangshuo properties available now.'
    ],
    // region overview: yangshuo has real hotels; other areas are placeholders
    regions: [
      { slug: 'yangshuo', name: 'Yangshuo & Yulong River', note: 'Available now', hotelSlugs: ['yingu', 'minos', 'bgdesign', 'hetianye', 'junyue', 'linshuiwan', 'yuyuan'] },
      { slug: 'guilin-city', name: 'Guilin City', note: 'Coming soon', hotelSlugs: [] },
      { slug: 'longji', name: 'Longji Terraces', note: 'Coming soon', hotelSlugs: [] },
      { slug: 'xingping', name: 'Xingping Ancient Town', note: 'Coming soon', hotelSlugs: [] }
    ],
    faqs: [
      { q: 'Which base should I choose?', a: 'Yangshuo for scenery and food; Guilin City for transport hubs; Longji for terraces; Xingping for a quiet old town.' },
      { q: 'Are city / Longji / Xingping stays available?', a: 'Not yet on this site — Yangshuo is live now, more areas are being added.' },
      { q: 'Can you help me decide?', a: 'Yes — tell us your dates and interests and we’ll suggest a base.' }
    ]
  }
];

export const hotelSlugSet = new Set(hotels.map((h) => h.slug));
