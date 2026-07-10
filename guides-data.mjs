// guides-data.mjs
// Single source of truth for the Guilin travel-guide blog.
// Consumed by scripts/build-attractions.mjs -> renders guides/*.html + guides/index.html
//
// Block types (rendered by renderGuide in build-attractions.mjs):
//   { type: 'p',       text }            paragraph (HTML allowed: <a>, <strong>, <em>)
//   { type: 'h2',      text }            section heading
//   { type: 'h3',      text }            sub heading
//   { type: 'ul',      items: [] }       unordered list
//   { type: 'ol',      items: [] }       ordered list
//   { type: 'quote',   text, cite }      pull quote
//   { type: 'callout', title, text }     highlighted tip box (HTML allowed)
//   { type: 'image',   img, alt, caption }  inline figure (img must exist in /images/*.webp)

export const guides = [
  /* ============================== 1. ITINERARY ============================== */
  {
    slug: 'guilin-itinerary',
    title: 'Guilin Itinerary: How to Spend 3, 4, or 5 Days',
    date: '2026-03-12',
    excerpt:
      'A practical day-by-day Guilin itinerary for 3, 4, and 5 days — covering the Li River cruise, Yangshuo countryside, Longji terraces, and the city classics, with real logistics (travel times, where to base yourself, and what to skip).',
    coverImage: 'hero-liriver',
    tags: ['Itinerary', 'Planning', 'First-timer'],
    readingTime: '9 min read',
    author: 'Visit Guilin Local Team',
    relatedAttraction: 'liriver',
    blocks: [
      { type: 'p', text: 'Guilin is compact enough to see the highlights in three days, but relaxed enough that five days never feels slow. The trick is choosing a <strong>base</strong> and resisting the urge to zig-zag across the region. This guide gives you three ready-made plans — 3, 4, and 5 days — built around the same logic we use when planning trips for international visitors.' },
      { type: 'h2', text: 'The one rule that makes or breaks your trip' },
      { type: 'p', text: 'Base yourself in <strong>one of two places</strong>: Guilin city (better transport hub, closer to the airport and Longji) or Yangshuo (closer to the countryside, climbing, and the prettiest stretch of river). Most first-timers should do <strong>Guilin → Li River cruise → Yangshuo</strong>, then treat Yangshuo as the relaxation base. Only add Longji as a day trip or an overnight if you have 4–5 days.' },
      { type: 'callout', title: 'Quick answer', text: '3 days = Li River + Yangshuo + city classics. 4 days = above + Longji terraces. 5 days = above + a slow Yangshuo countryside day (cycling, rafting, cormorant show).' },
      { type: 'h2', text: '3-Day Guilin itinerary (the essentials)' },
      { type: 'h3', text: 'Day 1 — Guilin city & the Li River' },
      { type: 'ul', items: [
        'Morning: fly or train into Guilin; store bags and visit <a href="../attractions/elephant.html">Elephant Trunk Hill</a> and <a href="../attractions/reedflute.html">Reed Flute Cave</a>.',
        'Afternoon: board the <strong>Li River cruise</strong> from Zhujiang Pier (book ahead in peak season) — 4–5 hours downstream to Yangshuo.',
        'Evening: arrive Yangshuo, walk <a href="../attractions/yangshuo.html">West Street</a>, eat at a riverside restaurant.',
      ] },
      { type: 'h3', text: 'Day 2 — Yangshuo countryside' },
      { type: 'ul', items: [
        'Morning: <a href="../attractions/yulong.html">Yulong River bamboo raft</a> (the quieter, prettier tributary).',
        'Midday: e-bike or cycle through the villages; stop at a lookout over the karst peaks.',
        'Afternoon: try <a href="../attractions/xingping.html">Xingping</a> for the ¥20-banknote viewpoint and the old town.',
        'Evening: cormorant fishing demonstration or a cooking class.',
      ] },
      { type: 'h3', text: 'Day 3 — Back to Guilin & depart' },
      { type: 'ul', items: [
        'Morning: bus back to Guilin (≈90 min); see <a href="../attractions/tworivers.html">Sun & Moon Pagodas</a> and the lakes.',
        'Afternoon: last bites of Guilin rice noodles, then airport/train.',
      ] },
      { type: 'image', img: 'attraction-liriver', alt: 'Xingping riverfront at sunset on the Li River', caption: 'Xingping, where the Li River wraps around dramatic karst towers — the view on the ¥20 banknote.' },
      { type: 'h2', text: '4-Day itinerary (add Longji)' },
      { type: 'p', text: 'Insert Longji as <strong>Day 3</strong>: take an early bus from Yangshuo or Guilin to the <a href="../attractions/longji.html">Longji Rice Terraces</a> (2.5–3.5 hrs). Walk the terraces, stay overnight in a Zhuang or Yao minority village, and catch sunrise over the fields. Return to Guilin on Day 4 for departure.' },
      { type: 'h2', text: '5-Day itinerary (add a slow day)' },
      { type: 'p', text: 'Use the extra day in Yangshuo with <strong>no agenda</strong>: a full-day countryside cycle, a karst climbing lesson, or a private boat to a quiet stretch of river. This is the day international visitors remember most — the pace, not the checklist.' },
      { type: 'h2', text: 'Where to base: Guilin city vs Yangshuo' },
      { type: 'ul', items: [
        'Choose <strong>Guilin city</strong> if: you have ≤4 days, want the airport/train nearby, or plan a Longji day trip.',
        'Choose <strong>Yangshuo</strong> if: the cruise + countryside is your whole trip and you want to wake up among the peaks.',
      ] },
      { type: 'quote', text: 'The best Guilin trips are not the ones with the most stops — they are the ones where you actually sat still long enough to see the mist lift off the river.', cite: 'A Yangshuo guesthouse owner we work with' },
      { type: 'h2', text: 'Logistics that save you hours' },
      { type: 'ul', items: [
        'Guilin → Yangshuo cruise is <strong>one-way</strong>; return by bus (90 min) or private car.',
        'Longji is far — only attempt as an overnight, not a rushed day trip from Yangshuo.',
        'Book the Li River cruise seat class in advance in Apr–Oct; walk-up tickets sell out.',
      ] },
      { type: 'callout', title: 'Plan with a local', text: 'Not sure which base fits your dates? Our <a href="../#tour">local team</a> builds a private itinerary around your flight times and energy level — reply within 24 hours, no obligation.' },
    ],
  },

  /* ============================== 2. LI RIVER CRUISE ============================== */
  {
    slug: 'li-river-cruise-guide',
    title: 'Li River Cruise: The Complete Guide to Routes, Tickets & Tips',
    date: '2026-03-18',
    excerpt:
      'Everything you need to book the Li River cruise: the Guilin–Yangshuo route, bamboo-raft alternatives, 2026 ticket tiers, best seat strategy, and the ¥20-banknote viewpoint at Xingping.',
    coverImage: 'hero-liriver',
    tags: ['Li River', 'Cruise', 'Tickets'],
    readingTime: '8 min read',
    author: 'Visit Guilin Local Team',
    relatedAttraction: 'liriver',
    blocks: [
      { type: 'p', text: 'The Li River cruise is the single most famous journey in China, and for once the reputation is earned. The 83 km from Guilin to Yangshuo threads through one of the world\'s largest karst landscapes — limestone peaks rising straight from the water like a scroll painting. This guide covers how to actually book it without overpaying or ending up on the wrong boat.' },
      { type: 'h2', text: 'The classic route: Guilin → Yangshuo' },
      { type: 'p', text: 'Most cruises depart <strong>Zhujiang Pier</strong> (about 40 min from Guilin city) and arrive at <strong>Yangshuo</strong> 4–5 hours later. The boat slows at the <a href="../attractions/xingping.html">Xingping</a> stretch for the view printed on the back of the ¥20 banknote. Disembark in Yangshuo and the countryside is your playground.' },
      { type: 'image', img: 'attraction-liriver', alt: 'The Li River winding past karst peaks near Xingping', caption: 'The Xingping stretch — the most photographed bend of the river, and the one on the ¥20 note.' },
      { type: 'h2', text: 'Ticket tiers (2026)' },
      { type: 'ul', items: [
        '<strong>Lower deck / standard</strong> (¥300–400): air-conditioned cabin, buffet lunch, open deck access. Best value for most.',
        '<strong>Upper deck / premium</strong> (¥400–500): upper-deck seating with the clearest views and fewer blocked sightlines.',
        '<strong>Private charter</strong>: for groups; book via a local operator, not the public pier.',
      ] },
      { type: 'callout', title: 'Seat strategy', text: 'On the public cruise, the <strong>right side (starboard)</strong> faces the prime peaks for much of the route, but the boat turns — sit near an open deck and move around. Upper-deck open seating photos best.' },
      { type: 'h2', text: 'The bamboo-raft alternative' },
      { type: 'p', text: 'If you want the scenery without the big boat, take a <strong>4-seat motorized bamboo raft</strong> from Xingping (1–1.5 hrs, ¥120–255). It covers the most scenic section — past Nine Horse Fresco Hill and the ¥20 viewpoint — at water level. Families with very small children should note rafts have age/size restrictions.' },
      { type: 'image', img: 'exp-liriver', alt: 'A bamboo raft with cormorants on the Li River', caption: 'Bamboo rafts and cormorants remain an iconic Li River sight — a slower, lower alternative to the cruise ship.' },
      { type: 'h2', text: 'Best time of day & year' },
      { type: 'ul', items: [
        'Cruises leave in the <strong>morning</strong> (around 9:00–9:30); there is no afternoon public cruise.',
        '<strong>Apr–May</strong> brings green hillsides and light mist — the most painterly season.',
        'Avoid the first week of May (Labor Day) and early October (National Day) — prices double and decks are packed.',
      ] },
      { type: 'h2', text: 'Common mistakes' },
      { type: 'ul', items: [
        'Booking a "Li River" raft that is actually on a different tributary — confirm it covers Xingping.',
        'Forgetting the cruise is one-way; pre-arrange your Yangshuo→Guilin return.',
        'Assuming walk-up tickets exist in peak season — they often don\'t.',
      ] },
      { type: 'callout', title: 'Let us handle the booking', text: 'We secure cruise seats and pair them with a private car, a Yangshuo hotel, and a Yulong raft — one message to our <a href="../#tour">local team</a> replaces three separate bookings.' },
    ],
  },

  /* ============================== 3. BEST TIME ============================== */
  {
    slug: 'best-time-to-visit-guilin',
    title: 'Best Time to Visit Guilin: Month-by-Month Weather & Crowds',
    date: '2026-02-26',
    excerpt:
      'When to visit Guilin in 2026: a month-by-month breakdown of weather, crowd levels, and what to expect on the Li River and Longji terraces — plus the two weeks to avoid.',
    coverImage: 'attraction-longji',
    tags: ['Weather', 'Planning', 'Seasons'],
    readingTime: '7 min read',
    author: 'Visit Guilin Local Team',
    relatedAttraction: 'longji',
    blocks: [
      { type: 'p', text: 'Guilin has a humid subtropical climate: warm, wet summers and mild, drier winters. The scenery is green year-round, but the <strong>experience</strong> changes a lot by season — especially at the Longji terraces, where the fields are flooded in spring and golden in autumn.' },
      { type: 'h2', text: 'The short version' },
      { type: 'ul', items: [
        '<strong>Best overall:</strong> April–May and September–October (mild, photogenic, manageable crowds).',
        '<strong>Best for Longji golden terraces:</strong> late September–early October (but avoid National Day week).',
        '<strong>Best value / fewest crowds:</strong> November–March (cool, some mist, cheaper hotels).',
        '<strong>Avoid:</strong> the first week of May and Oct 1–7 (National Day) — prices and crowds peak.',
      ] },
      { type: 'image', img: 'exp-longji', alt: 'Longji terraced rice fields', caption: 'Longji changes completely by season — flooded and mirror-like in spring, golden in early autumn.' },
      { type: 'h2', text: 'Month by month' },
      { type: 'h3', text: 'March–May (spring)' },
      { type: 'p', text: 'Warm, lush, and often misty — the classic "ink painting" weather. April–May is peak-photography season for the Li River. Longji is flooded and being planted (mirror reflections). Occasional rain; pack a light shell.' },
      { type: 'h3', text: 'June–August (summer)' },
      { type: 'p', text: 'Hot and humid (30°C+), with afternoon thunderstorms. Crowds are moderate (school holidays spike in July–Aug). Rafting and swimming spots are at their best; do outdoor stuff early to dodge the heat.' },
      { type: 'h3', text: 'September–October (autumn)' },
      { type: 'p', text: 'The most comfortable temperatures and clearest air. Late September–early October is when Longji turns gold — spectacular, but the National Day week (Oct 1–7) is the busiest, priciest window of the year. Go the week before or after.' },
      { type: 'h3', text: 'November–March (winter)' },
      { type: 'p', text: 'Cool (5–15°C), drier, and quiet. Some mist on the river; fewer tour boats. Hotels are cheapest. Longji can be cold and bare (harvest done by mid-Oct), but the layered geometry is still striking after light snow.' },
      { type: 'callout', title: 'If you only have one trip', text: 'Target <strong>mid-April to mid-May</strong> or <strong>mid-September to late September</strong>. You get the scenery at its best without the holiday-week chaos. Tell our <a href="../#tour">local team</a> your dates and we will shape the itinerary around the weather.' },
      { type: 'h2', text: 'What "best" depends on' },
      { type: 'ul', items: [
        'Photography → Apr–May mist or late-Sep golden Longji.',
        'Fewer crowds + low cost → Nov–Mar.',
        'Family summer break → Jun–Aug, start early, embrace the rain.',
      ] },
    ],
  },

  /* ============================== 4. GUILIN VS YANGSHUO ============================== */
  {
    slug: 'guilin-vs-yangshuo',
    title: 'Guilin vs Yangshuo: Where to Stay & Which Is Better',
    date: '2026-03-05',
    excerpt:
      'Guilin city or Yangshuo? A straight comparison of where to base your trip — transport, scenery, nightlife, hotels, and which one fits a first-time visit to the Li River region.',
    coverImage: 'attraction-yangshuo',
    tags: ['Planning', 'Where to stay', 'Yangshuo'],
    readingTime: '6 min read',
    author: 'Visit Guilin Local Team',
    relatedAttraction: 'yangshuo',
    blocks: [
      { type: 'p', text: 'First-time visitors almost always ask the same thing: should I stay in Guilin city or in Yangshuo? They are only 65 km apart, but they feel like different trips. Here is the honest comparison, with no sugar-coating.' },
      { type: 'h2', text: 'Guilin city' },
      { type: 'p', text: 'The regional hub: airport, high-speed trains, and the civic sights — <a href="../attractions/elephant.html">Elephant Trunk Hill</a>, <a href="../attractions/reedflute.html">Reed Flute Cave</a>, and the <a href="../attractions/tworivers.html">Sun & Moon Pagodas</a> on the lakes. It is convenient and has the best hotels, but the karst scenery is <em>around</em> the city, not in it.' },
      { type: 'image', img: 'attraction-elephant', alt: 'Elephant Trunk Hill on the Li River in Guilin city', caption: 'Elephant Trunk Hill — Guilin city\'s signature landmark, a short taxi from the airport.' },
      { type: 'h2', text: 'Yangshuo' },
      { type: 'p', text: 'A county town dropped into the prettiest stretch of karst in the region. This is where the Li River cruise <strong>ends</strong>, and where the <a href="../attractions/yulong.html">Yulong River</a>, climbing crags, and countryside cycling begin. West Street gets rowdy at night; a 10-minute scooter ride puts you in silence among the peaks.' },
      { type: 'image', img: 'attraction-yangshuo', alt: 'Yangshuo West Street lit by lanterns at night', caption: 'Yangshuo\'s West Street at night — lively, touristy, and a short ride from total quiet.' },
      { type: 'h2', text: 'Head-to-head' },
      { type: 'ul', items: [
        '<strong>Transport:</strong> Guilin wins (airport + trains). Yangshuo has a station but fewer direct links.',
        '<strong>Scenery at your door:</strong> Yangshuo wins by a mile.',
        '<strong>Hotels:</strong> Guilin has more international-standard options; Yangshuo has characterful boutique inns.',
        '<strong>Nightlife:</strong> Yangshuo (West Street) is livelier; Guilin is calmer.',
        '<strong>Family / first trip:</strong> many do one night Guilin + two nights Yangshuo.',
      ] },
      { type: 'callout', title: 'Our default recommendation', text: 'Spend your first night near Guilin (easy arrival + cave/city sights), take the <a href="../attractions/liriver.html">Li River cruise</a> down, then base in Yangshuo for 2–3 nights. Our <a href="../#tour">local team</a> can book both stays and the transfer in one go.' },
      { type: 'h2', text: 'Can you do both without moving hotels?' },
      { type: 'p', text: 'Yes, if you base in Guilin and take the cruise + a Yangshuo day trip. But you will miss the magic of Yangshuo at dawn, before the tour buses arrive. If your trip is 4+ days, splitting bases is worth it.' },
    ],
  },

  /* ============================== 5. LONGJI ============================== */
  {
    slug: 'longji-rice-terraces-guide',
    title: 'Longji Rice Terraces: Everything You Need to Know',
    date: '2026-03-22',
    excerpt:
      'How to visit the Longji Rice Terraces from Guilin: which village to choose (Ping\'an, Jinkeng, Dazhai), when the terraces are flooded vs golden, hiking routes, and where to stay overnight.',
    coverImage: 'attraction-longji',
    tags: ['Longji', 'Day trip', 'Villages'],
    readingTime: '8 min read',
    author: 'Visit Guilin Local Team',
    relatedAttraction: 'longji',
    blocks: [
      { type: 'p', text: 'The Longji (Dragon\'s Backbone) Rice Terraces are the region\'s most jaw-dropping contrast to the river scenery — thousands of layered fields climbing the slopes for over 1,000 years, farmed by Zhuang and Yao minority villages. They are a half-day\'s drive from Guilin, and worth an overnight if your schedule allows.' },
      { type: 'image', img: 'attraction-longji', alt: 'Layered Longji rice terraces climbing the hillside', caption: 'The Longji terraces — carved into the mountains over a thousand years by Zhuang and Yao farmers.' },
      { type: 'h2', text: 'Which village area to choose' },
      { type: 'ul', items: [
        '<strong>Ping\'an (Peace Village):</strong> the classic postcard terraces, two famous viewpoints (Nine Dragons & Five Tigers, Seven Stars with Moon). Easy to reach, more developed.',
        '<strong>Jinkeng / Dazhai:</strong> larger, wilder terraces with cable car access and the best sunrise/sunset viewpoints (Golden Buddha Peak). Better if you want to hike between hamlets.',
        '<strong>Ancient Zhuang Village (Anjiang):</strong> quieter, older architecture, fewer tour groups.',
      ] },
      { type: 'image', img: 'exp-longji', alt: 'Close view of Longji terraced fields', caption: 'Up close, the terraces become mirror steps in spring and ribbons of gold in early autumn.' },
      { type: 'h2', text: 'When to go (the terraces change completely)' },
      { type: 'ul', items: [
        '<strong>April–mid-May:</strong> fields flooded and planted — mirror reflections, lush green.',
        '<strong>June–August:</strong> deep green, rice growing tall.',
        '<strong>Late Sep–early Oct:</strong> golden harvest — the iconic shot (avoid National Day week).',
        '<strong>Winter:</strong> bare but sculptural; possible light snow on the ridges.',
      ] },
      { type: 'h2', text: 'Getting there from Guilin' },
      { type: 'ul', items: [
        'Direct bus from Guilin (≈3 hrs) to the Longji scenic area entrance.',
        'Private car (≈2.5 hrs) is faster and lets you stop at a viewpoint en route.',
        'Entrance ticket + (optional) cable car at Jinkeng.',
      ] },
      { type: 'callout', title: 'Overnight beats day-trip', text: 'A day trip is possible but rushed. Staying in a village guesthouse lets you catch <strong>sunrise over the terraces</strong> — the payoff shot. Our <a href="../#tour">local team</a> pairs the transfer with a village homestay and a guide who knows the quiet ridges.' },
      { type: 'h2', text: 'What to expect' },
      { type: 'ul', items: [
        'Real hiking: stone paths between terraces; decent shoes, not sandals.',
        'Yao women with long hair often demonstrate traditional weaving — ask before photographing.',
        'Food is hearty mountain fare: bamboo rice, cured pork, fresh veg.',
      ] },
      { type: 'quote', text: 'You don\'t "see" Longji in ten minutes from a car window. You walk the ridges, and the scale only hits you at the third switchback.', cite: 'A Dazhai homestay host' },
    ],
  },

  /* ============================== 6. FOOD ============================== */
  {
    slug: 'guilin-food-guide',
    title: 'Guilin Food Guide: 12 Dishes to Try & Where to Eat',
    date: '2026-04-02',
    excerpt:
      'What to eat in Guilin: from Guilin rice noodles and beer fish to osmanthus sweets and minority village fare — 12 dishes worth seeking out, plus where locals actually eat in the city and Yangshuo.',
    coverImage: 'attraction-yangshuo',
    tags: ['Food', 'Local eats', 'Yangshuo'],
    readingTime: '7 min read',
    author: 'Visit Guilin Local Team',
    relatedAttraction: 'yangshuo',
    blocks: [
      { type: 'p', text: 'Guilin\'s food is subtle, sour, and rice-forward — quieter than Sichuan heat or Cantonese sweetness, but addictive once you tune in. This is a practical eat-list, not a restaurant directory: the dishes worth chasing, and the neighborhoods where locals actually queue.' },
      { type: 'h2', text: 'The 12 dishes' },
      { type: 'ol', items: [
        '<strong>Guilin rice noodles (桂林米粉):</strong> the breakfast of the city — thin rice noodles in a fragrant broth with peanuts, pickles, and your choice of braised meat. Eat standing up at a corner shop like a local.',
        '<strong>Beer fish (啤酒鱼):</strong> Yangshuo\'s signature — river fish braised in beer with tomatoes and chili. Best on <a href="../attractions/yangshuo.html">West Street</a> side lanes, not the main strip.',
        '<strong>Stuffed tofu / stuffed snails (酿):</strong> the "niang" technique — tofu, eggplant, or river snails stuffed with pork. A regional specialty.',
        '<strong>Osmanthus treats (桂花):</strong> the city\'s flower appears in sweet soups, jelly, and tea cakes. Try osmanthus liangfen (cold jelly).',
        '<strong>Lipu taro pork (荔浦芋扣肉):</strong> steamed layers of taro and pork belly — rich, festive, from nearby Lipu county.',
        '<strong>Bamboo rice (竹筒饭):</strong> rice steamed inside a bamboo tube, smoky and fluffy — common around <a href="../attractions/longji.html">Longji</a> villages.',
        '<strong>Cured pork & mountain veg:</strong> the highland version of comfort food near the terraces.',
        '<strong>Guilin chili sauce (桂林辣椒酱):</strong> a fermented staple — buy a jar at the market, not the airport.',
        '<strong>River shrimp & snails:</strong> small, sweet, best at a riverside stall.',
        '<strong>Oil tea (油茶):</strong> a salty, savory tea whipped with ginger and rice — an acquired, very local habit.',
        '<strong>Sticky rice in lotus leaf:</strong> a portable, fragrant lunch.',
        '<strong>Sweet fermented rice balls (酒酿圆子):</strong> a warm dessert soup for cool evenings.',
      ] },
      { type: 'image', img: 'attraction-yangshuo', alt: 'Yangshuo West Street food stalls in the evening', caption: 'Yangshuo\'s lanes feed you late — beer fish, stuffed tofu, and osmanthus sweets within a few steps.' },
      { type: 'h2', text: 'Where locals actually eat' },
      { type: 'ul', items: [
        '<strong>Guilin city:</strong> morning rice-noodle shops near the train station and along the riverside; the night market for snacks.',
        '<strong>Yangshuo:</strong> West Street side alleys for beer fish; the riverside for river shrimp.',
        '<strong>Longji:</strong> your guesthouse kitchen — the homestay meal is the experience.',
      ] },
      { type: 'callout', title: 'Dietary notes', text: 'Vegetarians do fine on noodles, tofu, and mountain veg, but broths often contain meat — say so clearly. Our <a href="../#tour">local team</a> can flag vegetarian-friendly stops when we plan your route.' },
      { type: 'h2', text: 'One rule' },
      { type: 'p', text: 'Follow the queue. A shop with a line of scooters at 7 a.m. is serving better noodles than any glossy restaurant with a tripadvisor plaque. The food in Guilin rewards the unpretentious.' },
    ],
  },
];
