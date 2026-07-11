// Single source of truth for the Guilin Food module (2nd-level category pages).
// Reuses SITE config from attractions-data.mjs so URLs / brand stay consistent.
// Restaurants are real, well-reviewed Guilin / Yangshuo venues sourced from
// public travel platforms (TripAdvisor, Trip.com) — chosen because international
// visitors repeatedly recommend them. Prices are reference averages in RMB/person.
import { SITE } from './attractions-data.mjs';

// ---------------------------------------------------------------------------
// Signature dishes (for the Guilin Food Guide page)
// img points to images/food-dish-{slug}.webp (generated)
// ---------------------------------------------------------------------------
const DISHES = [
  {
    slug: 'beer-fish',
    name: 'Yangshuo Beer Fish',
    cnName: '啤酒鱼',
    img: 'food-dish-beerfish',
    desc: 'Fresh Li River fish simmered in local beer with tomatoes and chili — the dish Yangshuo is famous for. Tender, slightly sweet, gently spicy.',
    where: 'Try it at Liujie Beer Fish, Master Chef’s Beer Fish or Sister Xie’s Beer Fish.'
  },
  {
    slug: 'rice-noodles',
    name: 'Guilin Rice Noodles',
    cnName: '桂林米粉',
    img: 'food-dish-noodles',
    desc: 'Silky rice noodles in a fragrant bone broth, topped with pickled vegetables, peanuts and braised meat. The local breakfast staple — eaten standing up, mixed well, in minutes.',
    where: 'Try it at Chongshan Rice Noodles or Gan’s Noodle House.'
  },
  {
    slug: 'oil-tea',
    name: 'Guangxi Oil Tea',
    cnName: '油茶',
    img: 'food-dish-yongcha',
    desc: 'A savory “tea” of pounded green tea, ginger and garlic, served with rice puffs and fried snacks. An acquired, warming taste unique to the region.',
    where: 'Served at Xinguichu and many farmhouse restaurants.'
  },
  {
    slug: 'snail-hotpot',
    name: 'Snail & Duck-Feet Hotpot',
    cnName: '螺蛳鸭脚煲',
    img: 'food-dish-hotpot',
    desc: 'A bubbling hotpot of river snails and braised duck feet in a sour-spicy broth — messy, addictive and best shared.',
    where: 'A specialty at Lao Biao Ji and home-style eateries.'
  },
  {
    slug: 'stuffed-snails',
    name: 'Stuffed Li River Snails',
    cnName: '田螺酿',
    img: 'food-dish-dumpling',
    desc: 'Freshwater snails stuffed with minced pork and herbs, then stir-fried with chili and peppermint — a delicate local craft dish.',
    where: 'Order it as a side at beer-fish restaurants and countryside inns.'
  },
  {
    slug: 'lipu-taro',
    name: 'Lipu Taro Braised Pork',
    cnName: '荔浦芋扣肉',
    img: 'food-dish-hotpot',
    desc: 'Layers of taro and pork belly braised until melting-soft — a festive Guangxi classic with a nutty, savory depth.',
    where: 'On the menu at Pu Shi and traditional banquet restaurants.'
  },
  {
    slug: 'pomelo-stuffed',
    name: 'Pomelo with Pork',
    cnName: '柚子酿',
    img: 'food-dish-dumpling',
    desc: 'Yangshuo pomelo shells filled with seasoned pork and steamed — fragrant, juicy and gently sweet.',
    where: 'A seasonal dish at countryside farmhouses in autumn.'
  },
  {
    slug: 'bamboo-rice',
    name: 'Bamboo-Tube Rice',
    cnName: '竹筒饭',
    img: 'food-dish-street',
    desc: 'Glutinous rice with mushroom, pork and chestnut roasted inside a bamboo tube, picking up a subtle smoky aroma.',
    where: 'Found at rural farmhouse dining and village stops.'
  },
  {
    slug: 'osmanthus-cake',
    name: 'Osmanthus Cake',
    cnName: '桂花糕',
    img: 'food-dish-street',
    desc: 'A light floral jelly made from osmanthus flowers and glutinous rice — sweet, fragrant and perfect with tea.',
    where: 'Sold at bakeries, tea houses and West Street stalls.'
  },
  {
    slug: 'mountain-tofu',
    name: 'Mountain Tofu',
    cnName: '山水豆腐',
    img: 'food-dish-riverview',
    desc: 'Silky tofu made with mountain spring water, gently braised — clean, tender and a good counterpoint to spicy dishes.',
    where: 'Served at Wang Jiang Lou and riverside restaurants.'
  }
];

// ---------------------------------------------------------------------------
// Restaurants (real venues, international-visitor favorites)
// cardImg points to images/food-dish-{slug}.webp (generated, by cuisine)
// ---------------------------------------------------------------------------
export const restaurants = [
  {
    slug: 'ganga-impression',
    name: 'Ganga Impression (NAMO NAMO)',
    cnName: '甘伽印度餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$$',
    avgPrice: 90,
    cuisine: 'Indian',
    cardImg: 'food-dish-indian',
    tagline: 'The most-reviewed Indian restaurant in Yangshuo — butter chicken and garlic naan that regulars cross continents for.',
    mustTry: ['Butter chicken', 'Garlic naan', 'Prawn curry'],
    address: 'West Street area, Yangshuo Town, Guilin',
    note: 'Vegetarian-friendly and English-menu. A safe, beloved choice when you crave a break from Chinese food.'
  },
  {
    slug: 'desi-indian',
    name: 'Desi Indian Restaurant',
    cnName: '德西印度餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$$',
    avgPrice: 85,
    cuisine: 'Indian',
    cardImg: 'food-dish-indian',
    tagline: 'Small, warm and highly rated — honest North Indian flavors near the center of town.',
    mustTry: ['Tandoori mixer', 'Dal makhani', 'Garlic naan'],
    address: 'Near West Street, Yangshuo Town, Guilin',
    note: 'Often recommended over the bigger western-style places for authentic Indian food.'
  },
  {
    slug: 'lucys-cafe',
    name: 'Lucy’s Cafe & Bar',
    cnName: '露西餐厅酒吧',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$$',
    avgPrice: 75,
    cuisine: 'Chinese · Bar',
    cardImg: 'food-dish-cafe',
    tagline: 'A long-running West Street institution with an English menu and the best Chinese dishes some expats had in years.',
    mustTry: ['Sizzling beef', 'Kung pao chicken', 'Cold beer'],
    address: 'West Street, Yangshuo Town, Guilin',
    note: 'Run by a local family; bilingual menu makes ordering easy for first-timers.'
  },
  {
    slug: 'cloud-9',
    name: 'Cloud 9 Restaurant',
    cnName: '云九餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Town',
    priceTier: '$$',
    avgPrice: 75,
    cuisine: 'Guilin Chinese',
    cardImg: 'food-dish-hotpot',
    tagline: 'Consistently called the best local food in Yangshuo — hearty Chinese plates done right.',
    mustTry: ['Beer fish', 'Twice-cooked pork', 'Mapo tofu'],
    address: 'Yangshuo Town, Guilin',
    note: 'Busy and popular; arrive early or expect a short wait on weekends.'
  },
  {
    slug: 'secret-garden',
    name: 'Secret Garden Cafe',
    cnName: '秘密花园餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Old Town',
    priceTier: '$$',
    avgPrice: 90,
    cuisine: 'Chinese Fine Dining',
    cardImg: 'food-dish-riverview',
    tagline: 'Fine dining inside a restored Qing-dynasty house — rustic elegance and refined local cooking.',
    mustTry: ['Set tasting menu', 'Mountain tofu', 'Seasonal vegetables'],
    address: 'Old town, Yangshuo County, Guilin',
    note: 'Connected to a boutique guesthouse; book ahead for dinner.'
  },
  {
    slug: 'amys-on-the-li',
    name: 'Amy’s on the Li',
    cnName: '漓江艾米餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Li River',
    priceTier: '$$',
    avgPrice: 100,
    cuisine: 'Italian · Chinese',
    cardImg: 'food-dish-riverview',
    tagline: 'Awesome food with a river view — a rare spot where Italian and Chinese share one menu beautifully.',
    mustTry: ['Wood-fired pizza', 'Catch of the day', 'River-view table'],
    address: 'Li River riverside, Yangshuo County, Guilin',
    note: 'Outdoor seating with the water; great for a slower lunch.'
  },
  {
    slug: 'rock-n-grill',
    name: 'Rock N Grill Cafe',
    cnName: '摇滚烤吧',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$$',
    avgPrice: 70,
    cuisine: 'Italian · Pizza',
    cardImg: 'food-dish-pizza',
    tagline: 'Wood-fired pizza and grills on the main strip — a reliable crowd-pleaser for groups and kids.',
    mustTry: ['Margherita pizza', 'Grilled ribs', 'Craft soda'],
    address: 'West Street, Yangshuo Town, Guilin',
    note: 'Popular with travelers; good for a casual dinner and drinks.'
  },
  {
    slug: 'gans-noodle',
    name: 'Gan’s Noodle House',
    cnName: '甘记米粉',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Town',
    priceTier: '$',
    avgPrice: 20,
    cuisine: 'Rice Noodles',
    cardImg: 'food-dish-noodles',
    tagline: 'A no-frills local favorite for Guilin rice noodles — cheap, fast and genuinely good.',
    mustTry: ['Braised pork noodles', 'Extra peanuts', 'Pickled veg'],
    address: 'Yangshuo Town, Guilin',
    note: 'Locals eat here daily; expect a line at breakfast. Cash-friendly prices.'
  },
  {
    slug: 'demo-bar',
    name: 'Demo Bar',
    cnName: 'Demo酒吧',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$$',
    avgPrice: 80,
    cuisine: 'Bar · Grill',
    cardImg: 'food-dish-cafe',
    tagline: 'Great food, stunning views and chill vibes — a rooftop bar with a quiz night and live jams.',
    mustTry: ['Burgers', 'Cocktails', 'Sunset view'],
    address: 'West Street, Yangshuo Town, Guilin',
    note: 'As much a nightlife stop as a restaurant; food is better than expected.'
  },
  {
    slug: 'garden-bamboo-leaf',
    name: 'The Garden @ Bamboo Leaf Hotel',
    cnName: '竹叶花园餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Countryside',
    priceTier: '$$',
    avgPrice: 100,
    cuisine: 'Pizza · European',
    cardImg: 'food-dish-pizza',
    tagline: 'Poolside pizza and a Greek salad — a genuine respite from the heat and crowds of town.',
    mustTry: ['Margherita', 'Greek salad', 'Poolside table'],
    address: 'Bamboo Leaf Hotel, Yangshuo County, Guilin',
    note: 'Open to non-guests; pair it with a swim or a quiet afternoon.'
  },
  {
    slug: 'explorer',
    name: 'Explorer',
    cnName: '探索餐厅',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Town',
    priceTier: '$$',
    avgPrice: 70,
    cuisine: 'Chinese · European',
    cardImg: 'food-dish-riverview',
    tagline: 'A quaint, adorable place with kind hosts — charming and easy, whether you want Chinese or Western.',
    mustTry: ['Daily special', 'Homemade cake', 'Coffee'],
    address: 'Yangshuo Town, Guilin',
    note: 'Small and personal; the owner is known for warm hospitality.'
  },
  {
    slug: 'home-cooking',
    name: 'Home Cooking Place',
    cnName: '家厨小馆',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Town',
    priceTier: '$',
    avgPrice: 40,
    cuisine: 'Home-style Chinese',
    cardImg: 'food-dish-hotpot',
    tagline: 'Worth seeking out — lovely owner, relaxed atmosphere and delicious honest home cooking.',
    mustTry: ['Stir-fried seasonal veg', 'Braised pork', 'Homemade soup'],
    address: 'Yangshuo Town, Guilin',
    note: 'Tiny and well-loved; a calm alternative to the busy strips.'
  },
  {
    slug: 'liujie-beer-fish',
    name: 'Liujie Beer Fish',
    cnName: '刘姐啤酒鱼',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Pantao Road',
    priceTier: '$$',
    avgPrice: 100,
    cuisine: 'Beer Fish',
    cardImg: 'food-dish-beerfish',
    tagline: 'The “ultimate beer-fish experience” per regulars — fresh fish, generous portions, no tourist traps.',
    mustTry: ['Beer fish (by weight)', 'Spicy beef skewers', 'Bamboo shoots'],
    address: 'Pantao Road, Yangshuo Town, Guilin',
    note: 'Beer fish is priced by weight — confirm the price before ordering.'
  },
  {
    slug: 'master-chef-beer-fish',
    name: 'Master Chef’s Beer Fish',
    cnName: '大师傅啤酒鱼',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$$',
    avgPrice: 95,
    cuisine: 'Beer Fish',
    cardImg: 'food-dish-beerfish',
    tagline: 'A long-standing West Street favorite for beer-baked fish — crisp outside, tender inside.',
    mustTry: ['Beer-baked fish', 'Mugwort cake', 'Set for two'],
    address: 'Deye Building, West Street, Yangshuo Town, Guilin',
    note: 'The West Street main branch is the one visitors recommend; arrive before peak.'
  },
  {
    slug: 'chongshan-noodles',
    name: 'Chongshan Rice Noodles',
    cnName: '崇善米粉',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · West Street',
    priceTier: '$',
    avgPrice: 10,
    cuisine: 'Rice Noodles',
    cardImg: 'food-dish-noodles',
    tagline: 'A no-frills spot with authentic Guilin rice-noodle flavors — the real local breakfast.',
    mustTry: ['Classic rice noodles', 'Extra braised meat', 'Pickled bamboo'],
    address: 'West Street, Yangshuo Town, Guilin',
    note: 'Eat standing at the counter like a local; cheap and fast.'
  },
  {
    slug: 'sister-xie-beer-fish',
    name: 'Sister Xie’s Beer Fish',
    cnName: '谢姐啤酒鱼',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Diecui Road',
    priceTier: '$$',
    avgPrice: 95,
    cuisine: 'Beer Fish',
    cardImg: 'food-dish-beerfish',
    tagline: 'A 30-year-old shop known for its stuffed snails and heritage beer-fish recipe.',
    mustTry: ['Heritage beer fish', 'Stuffed snails', 'Cold Liquan beer'],
    address: 'Rongyin Road / Diecui Road, Yangshuo Town, Guilin',
    note: 'Family-run; the stuffed snails are the sleeper hit.'
  },
  {
    slug: 'pu-shi',
    name: 'Pu Shi (Guangxi Fusion)',
    cnName: '璞食·桂北融合菜',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Near West Street',
    priceTier: '$$',
    avgPrice: 85,
    cuisine: 'Guangxi Fusion',
    cardImg: 'food-dish-hotpot',
    tagline: 'Guangxi-north fusion in a beautiful setting — a must-try for a proper sit-down dinner.',
    mustTry: ['Sour-spicy snail chicken', 'Passionfruit ribs', 'Beer fish'],
    address: 'Near West Street, by the Li River, Yangshuo County, Guilin',
    note: 'Popular and can fill up; kitchen closes ~9 PM, arrive earlier.'
  },
  {
    slug: 'wang-jiang-lou',
    name: 'Wang Jiang Lou',
    cnName: '望江楼餐吧',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Riverside',
    priceTier: '$$',
    avgPrice: 80,
    cuisine: 'River-view Chinese',
    cardImg: 'food-dish-riverview',
    tagline: 'Ancient-style interior with scenic riverside seating — one of the most photogenic dinners in town.',
    mustTry: ['Signature fish', 'Stuffed snails & chicken', 'Mountain tofu'],
    address: 'Near West Street, riverside, Yangshuo Town, Guilin',
    note: 'Outdoor riverside tables book fast on holidays.'
  },
  {
    slug: 'xinguichu',
    name: 'Xinguichu',
    cnName: '新桂厨',
    region: 'yangshuo',
    regionLabel: 'Yangshuo · Town',
    priceTier: '$',
    avgPrice: 55,
    cuisine: 'Guilin Cuisine · Oil Tea',
    cardImg: 'food-dish-yongcha',
    tagline: 'Old-style Guilin cooking with a free oil-tea welcome — easy on the budget, good for all ages.',
    mustTry: ['Oil tea (free)', 'Stir-fried Li River shrimp', 'Guilin rice noodles'],
    address: 'Yangshuo Town, Guilin',
    note: 'A relaxed, family-friendly local canteen.'
  }
];

// ---------------------------------------------------------------------------
// 2nd-level category pages
// ---------------------------------------------------------------------------
export const foodCategories = [
  {
    slug: 'guide',
    name: 'Guilin Food Guide',
    cnName: '桂林美食',
    tagline: 'What to eat, where to find it, and how to order like a local.',
    heroImage: 'food-hero-guide',
    intro: [
      'Guilin’s food is its own kind of scenery — river fish, rice noodles, taro and oil tea you will not taste quite the same way anywhere else. This guide covers the dishes worth planning around and the simple phrases that make ordering painless.',
      'Start with the signatures below, then jump to the restaurant collections by cuisine or by “must-eat” shortlist.'
    ],
    isDishes: true,
    dishSlugs: DISHES.map((d) => d.slug),
    faqs: [
      { q: 'What is the one dish I must try?', a: 'Yangshuo beer fish (啤酒鱼) — fresh Li River fish braised in local beer with tomato and chili. It is the dish the town is built around.' },
      { q: 'Is Guilin food very spicy?', a: 'Milder than Sichuan. Ask for “不太辣” (not too spicy) and you’ll be fine; many dishes are savory rather than hot.' },
      { q: 'How do I order without Chinese?', a: 'Point at the picture menu, or show the dish name in Chinese from this guide. West Street restaurants widely have English menus.' },
      { q: 'Any vegetarian options?', a: 'Yes — mountain tofu, stir-fried seasonal vegetables, and Indian restaurants (Ganga, Desi) are very veg-friendly.' }
    ]
  },
  {
    slug: 'featured',
    name: 'Featured Restaurants',
    cnName: '特色餐厅',
    tagline: 'Scenic, characterful and experience-led tables worth the trip.',
    heroImage: 'food-hero-featured',
    intro: [
      'These are the restaurants travelers remember — a Qing-dynasty house, a riverside terrace, a poolside garden, a rooftop with a view. Less about the category, more about the moment.',
      'Great for a celebration, a slow lunch, or a first proper dinner in town.'
    ],
    restaurantSlugs: ['secret-garden', 'amys-on-the-li', 'wang-jiang-lou', 'pu-shi', 'demo-bar', 'garden-bamboo-leaf', 'lucys-cafe', 'explorer'],
    faqs: [
      { q: 'Which has the best view?', a: 'Amy’s on the Li and Wang Jiang Lou both sit by the water; Demo Bar and The Garden offer elevated, relaxed settings.' },
      { q: 'Do I need a reservation?', a: 'For dinner at Secret Garden, Wang Jiang Lou and Amy’s, yes — especially on weekends and holidays.' },
      { q: 'Are these English-friendly?', a: 'Most have picture menus or bilingual staff; we can translate and book for you on WhatsApp.' }
    ]
  },
  {
    slug: 'chinese',
    name: 'Chinese Restaurants',
    cnName: '中餐厅',
    tagline: 'Local Guilin cooking, Guangxi fusion and home-style favorites.',
    heroImage: 'food-hero-chinese',
    intro: [
      'From a ¥10 bowl of rice noodles to a multi-course beer-fish feast, this is where you eat like a local. All venues below are real, well-reviewed and foreigner-friendly.',
      'Not sure where to start? The beer-fish houses and the noodle shops are the purest intro to Guilin flavor.'
    ],
    restaurantSlugs: ['cloud-9', 'lucys-cafe', 'secret-garden', 'liujie-beer-fish', 'master-chef-beer-fish', 'sister-xie-beer-fish', 'chongshan-noodles', 'gans-noodle', 'pu-shi', 'wang-jiang-lou', 'explorer', 'home-cooking', 'xinguichu'],
    faqs: [
      { q: 'Where do locals actually eat noodles?', a: 'Chongshan Rice Noodles and Gan’s Noodle House — cheap, fast and authentic, often eaten standing at the counter.' },
      { q: 'How is beer fish priced?', a: 'Usually by weight. Agree the price per jin (500g) before ordering; a meal for two can be had for just over ¥100 at the right spot.' },
      { q: 'Too spicy for me?', a: 'Ask for “微辣” (mild) — most kitchens will adjust, and noodle shops are naturally mild.' }
    ]
  },
  {
    slug: 'western',
    name: 'Western & International',
    cnName: '西餐与国际',
    tagline: 'Pizza, Indian, cafés and grills — a familiar break when you need it.',
    heroImage: 'food-hero-western',
    intro: [
      'Yangshuo has a surprising international scene: Indian curries that expats rank among the best anywhere, wood-fired pizza, riverside Italian and easy café brunches.',
      'Ideal for travel-weary palates, kids, or anyone who just wants a good coffee and a view.'
    ],
    restaurantSlugs: ['ganga-impression', 'desi-indian', 'amys-on-the-li', 'rock-n-grill', 'garden-bamboo-leaf', 'demo-bar'],
    faqs: [
      { q: 'Best Indian food in town?', a: 'Ganga Impression (NAMO NAMO) is the most-reviewed; Desi Indian is the smaller, highly-rated alternative.' },
      { q: 'Good pizza?', a: 'Rock N Grill and The Garden @ Bamboo Leaf both do wood-fired pizza; Amy’s on the Li mixes Italian with a river view.' },
      { q: 'Family / kid friendly?', a: 'Yes — pizza and café spots are easy wins with children; most have high chairs or relaxed seating.' }
    ]
  },
  {
    slug: 'must-eat',
    name: 'Must-Eat List',
    cnName: '必吃榜',
    tagline: 'The shortlist we’d give a friend with three days in town.',
    heroImage: 'food-hero-musteat',
    intro: [
      'If you only eat out a few times, make it these. A blend of local icons and foreigner-loved gems, ranked by how much travelers talk about them afterward.',
      'Two beer-fish houses, a noodle counter, an Indian favorite and a riverside table — that’s a very happy three days.'
    ],
    restaurantSlugs: ['liujie-beer-fish', 'master-chef-beer-fish', 'sister-xie-beer-fish', 'cloud-9', 'ganga-impression', 'chongshan-noodles', 'home-cooking', 'secret-garden'],
    faqs: [
      { q: 'The single best dinner?', a: 'Beer fish at Liujie or Master Chef’s, followed by a riverside table at Wang Jiang Lou if you want the view.' },
      { q: 'Cheapest unforgettable bite?', a: 'A ¥10 bowl of Chongshan rice noodles — pure Guilin, no fuss.' },
      { q: 'Something for a homesick day?', a: 'Ganga Impression’s butter chicken and naan, or a pizza at Rock N Grill.' }
    ]
  }
];

export const foodSlugSet = new Set(restaurants.map((r) => r.slug));
export const dishSlugSet = new Set(DISHES.map((d) => d.slug));
// expose dishes for the guide page renderer
export const dishList = DISHES;
