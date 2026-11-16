/*
  Product catalogue for the concept store.

  price      aesop.fr price in euros (what the store promises to match)
  priceNote  where the price came from; "check" means confirm on aesop.fr before the pitch
  shape      which illustration art.js draws (pump | cap | tube | perfume | spray | candle | kit)
  aromas     used by the ritual quiz and the filters
  photo      optional: set to "img/your-photo.jpg" to replace the illustration with a real photo
  rating / reviews are placeholders for the mock-up.
*/
window.AESOP = {
  products: [
    {
      id: 'reverence-hand-wash',
      name: 'Reverence Aromatique Hand Wash',
      size: '500 mL',
      price: 39,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'hand',
      shape: 'pump',
      aromas: ['woody'],
      aromaText: 'Woody, earthy. Vetiver root, petitgrain, bergamot rind.',
      rating: 4.8, reviews: 1243,
      focus: true, subscribe: true, refill: true, gift: true,
      tagline: 'An exfoliating hand cleanser with finely milled pumice.',
      bullets: [
        'Gently exfoliates and cleanses with finely milled pumice',
        'Woody, earthy aroma of vetiver root, petitgrain and bergamot rind',
        'Amber glass bottle with pump; a 500 mL refill is available',
        'Leaping Bunny approved: certified cruelty-free',
        'Sold and shipped by Amazon at the aesop.fr price'
      ]
    },
    {
      id: 'resurrection-hand-wash',
      name: 'Resurrection Aromatique Hand Wash',
      size: '500 mL',
      price: 39,
      priceNote: 'aesop.fr, team check 26 Sept 2026',
      cat: 'hand',
      shape: 'pump',
      aromas: ['fresh', 'citrus'],
      aromaText: 'Citrus, woody, herbaceous. Mandarin rind, rosemary leaf, cedar atlas.',
      rating: 4.8, reviews: 3120,
      refill: true,
      tagline: 'A gentle cleansing gel for hard-working hands.',
      bullets: [
        'A superior cleansing gel for hard-working hands',
        'Mandarin rind, rosemary leaf and cedar atlas',
        'Use whenever and as often as required',
        'Resold elsewhere on Amazon.fr for €79.35; here it is €39'
      ]
    },
    {
      id: 'resurrection-hand-balm',
      name: 'Resurrection Aromatique Hand Balm',
      size: '75 mL',
      price: 30,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'hand',
      shape: 'tube',
      aromas: ['citrus', 'light'],
      aromaText: 'Citrus, woody. Mandarin rind, rosemary leaf, cedar atlas.',
      rating: 4.9, reviews: 2874,
      light: true, gift: true,
      tagline: 'A rich, fast-absorbing balm for hands and cuticles.',
      bullets: [
        'Rich blend of botanicals that soothes and softens hands',
        'Absorbs quickly with no greasy finish',
        'Pocket-sized 75 mL tube, easy to keep at a desk',
        'Resold elsewhere on Amazon.fr for up to €59; here it is €30'
      ]
    },
    {
      id: 'trusted-companions',
      name: 'Trusted Companions Hand Care Trio',
      size: '3 formulations',
      price: 83,
      priceNote: 'aesop.fr (Fidèles Compagnons), Nov 2026',
      cat: 'hand',
      shape: 'kit',
      aromas: ['citrus', 'woody'],
      aromaText: 'Three hand-care aromas to keep by the basin.',
      rating: 4.8, reviews: 412,
      gift: true,
      tagline: 'Three hand-care essentials to keep by the basin.',
      bullets: [
        'Three hand-care essentials in one gift-ready carton',
        'Cleanse and nourish: a complete hand routine',
        'Arrives tomorrow with Prime'
      ]
    },
    {
      id: 'reverence-refill',
      name: 'Reverence Aromatique Hand Wash Refill',
      size: '500 mL',
      price: 38,
      priceNote: 'check: €38 is the aesop.ie refill price',
      cat: 'hand',
      shape: 'cap',
      aromas: ['woody'],
      aromaText: 'Woody, earthy. Vetiver root, petitgrain, bergamot rind.',
      rating: 4.8, reviews: 640,
      refill: true, subscribe: true,
      tagline: 'Refill your pump bottle instead of buying a new one.',
      bullets: [
        'Screw-cap refill for your Reverence pump bottle',
        'Less packaging, same formulation',
        'Subscribe and it arrives before you run out'
      ]
    },
    {
      id: 'geranium-body-cleanser',
      name: 'Geranium Leaf Body Cleanser',
      size: '500 mL',
      price: 59,
      priceNote: 'check: search result for aesop.fr',
      cat: 'body',
      shape: 'pump',
      aromas: ['fresh'],
      aromaText: 'Green, citrus, herbaceous.',
      rating: 4.7, reviews: 1508,
      tagline: 'A gentle, uplifting body cleanser.',
      bullets: [
        'Cleanses without stripping the skin',
        'Green, herbaceous aroma for morning showers',
        'Amber glass bottle with pump'
      ]
    },
    {
      id: 'evergreen-affections',
      name: 'Evergreen Affections Body Care Trio',
      size: '3 formulations',
      price: 115,
      priceNote: 'aesop.fr (Affections Persistantes), Nov 2026',
      cat: 'body',
      shape: 'kit',
      aromas: ['fresh', 'light'],
      aromaText: 'Geranium Leaf: green, citrus, herbaceous.',
      rating: 4.8, reviews: 733,
      light: true, gift: true,
      tagline: 'Three Geranium Leaf formulations for the body.',
      bullets: [
        'Three Geranium Leaf formulations to cleanse and hydrate the body',
        'Green, uplifting aroma that stays light on the skin',
        'Gift-ready carton, arrives tomorrow with Prime'
      ]
    },
    {
      id: 'marrakech-intense',
      name: 'Marrakech Intense Eau de Parfum',
      size: '50 mL',
      price: 170,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'fragrance',
      family: 'Woody',
      shape: 'perfume',
      aromas: ['opulent', 'woody'],
      aromaText: 'Woody, spicy. Clove, cardamom, jasmine, sandalwood.',
      rating: 4.7, reviews: 486,
      focus: true, gift: true,
      tagline: 'A warm, spiced fragrance inspired by Marrakech.',
      bullets: [
        'Spiced, woody eau de parfum',
        'Notes of clove, cardamom, jasmine and sandalwood',
        'Unisex, made to be worn day or night',
        'Sold by Amazon: authentic stock, Transparency-coded'
      ]
    },
    {
      id: 'hwyl',
      name: 'Hwyl Eau de Parfum',
      size: '50 mL',
      price: 170,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'fragrance',
      family: 'Woody',
      shape: 'perfume',
      aromas: ['woody'],
      aromaText: 'Woody, smoky. Cypress, frankincense, vetiver.',
      rating: 4.6, reviews: 352,
      gift: true,
      tagline: 'A smoky, woody fragrance that evokes ancient forests.',
      bullets: ['Smoky, woody eau de parfum', 'Cypress, frankincense and vetiver', 'Unisex']
    },
    {
      id: 'tacit',
      name: 'Tacit Eau de Parfum',
      size: '50 mL',
      price: 170,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'fragrance',
      family: 'Fresh',
      shape: 'perfume',
      aromas: ['fresh', 'citrus'],
      aromaText: 'Fresh, citrus. Yuzu, basil, vetiver.',
      rating: 4.6, reviews: 418,
      tagline: 'A bright citrus and herbaceous fragrance.',
      bullets: ['Fresh, citrus eau de parfum', 'Yuzu, basil and vetiver', 'Unisex']
    },
    {
      id: 'karst',
      name: 'Karst Eau de Parfum',
      size: '50 mL',
      price: 170,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'fragrance',
      family: 'Fresh',
      shape: 'perfume',
      aromas: ['fresh'],
      aromaText: 'Fresh, aquatic. Juniper, cumin, sandalwood.',
      rating: 4.5, reviews: 207,
      tagline: 'A fresh, coastal fragrance.',
      bullets: ['Fresh, aquatic eau de parfum', 'Juniper, cumin and sandalwood', 'Unisex']
    },
    {
      id: 'post-poo-drops',
      name: 'Post-Poo Drops',
      size: '100 mL',
      price: 30,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'home',
      shape: 'cap',
      small: true,
      aromas: ['citrus', 'fresh'],
      aromaText: 'Citrus, floral, fresh. Tangerine peel, ylang-ylang, mandarin peel.',
      rating: 4.8, reviews: 1967,
      focus: true, gift: true,
      tagline: 'A few drops after you flush. The next visitor will never know.',
      bullets: [
        'Add a few drops to the bowl after flushing, for the next visitor',
        'A blend of botanicals with bright citrus and subtle floral notes',
        'Key ingredients: tangerine peel, ylang-ylang, mandarin peel',
        'Child-resistant cap: press down and turn anticlockwise to open',
        'A witty, useful gift for €30'
      ]
    },
    {
      id: 'cythera-room-spray',
      name: 'Cythera Aromatique Room Spray',
      size: '100 mL',
      price: 55,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'home',
      shape: 'spray',
      aromas: ['woody'],
      aromaText: 'Woody, herbaceous.',
      rating: 4.6, reviews: 388,
      gift: true,
      tagline: 'A woody, herbaceous mist for any room.',
      bullets: ['Spray into the air, away from fabrics', 'Woody, herbaceous aroma', '100 mL amber glass']
    },
    {
      id: 'olous-room-spray',
      name: 'Olous Aromatique Room Spray',
      size: '100 mL',
      price: 55,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'home',
      shape: 'spray',
      aromas: ['fresh', 'citrus'],
      aromaText: 'Fresh, citrus.',
      rating: 4.6, reviews: 264,
      tagline: 'A bright, citrus mist that lifts a room.',
      bullets: ['Spray into the air, away from fabrics', 'Fresh, citrus aroma', '100 mL amber glass']
    },
    {
      id: 'ptolemy-candle',
      name: 'Ptolemy Aromatique Candle',
      size: '300 g',
      price: 93,
      priceNote: 'aesop.fr, Nov 2026',
      cat: 'home',
      shape: 'candle',
      aromas: ['woody'],
      aromaText: 'Woody, green. Cedar, vetiver, cypress.',
      rating: 4.7, reviews: 301,
      gift: true,
      tagline: 'A slow-burning candle with a woody, green aroma.',
      bullets: ['About 60 hours of burn time', 'Woody, green aroma', 'Reusable vessel']
    },
    {
      id: 'arms-outstretched',
      name: 'Arms Outstretched Hand Balm Trio',
      size: '3 hand balms',
      price: 45,
      priceNote: 'aesop.fr (À Bras Ouverts), Nov 2026',
      cat: 'gift',
      shape: 'kit',
      aromas: ['citrus', 'woody', 'light'],
      aromaText: 'Three hand balm aromas to try.',
      rating: 4.9, reviews: 522,
      gift: true, light: true,
      tagline: 'Three hydrating balms for hands that deserve them.',
      bullets: [
        'Three hand balms in one gift-ready carton',
        'Arrives tomorrow with Prime',
        'Add a gift message at checkout'
      ]
    },
    {
      id: 'gentle-embraces',
      name: 'Gentle Embraces Hand & Body Duet',
      size: '2 formulations',
      price: 59,
      priceNote: 'aesop.fr (Douces Étreintes), Nov 2026',
      cat: 'gift',
      shape: 'kit',
      aromas: ['woody', 'light'],
      aromaText: 'A hand and body pairing in a gift carton.',
      rating: 4.8, reviews: 286,
      gift: true, light: true,
      tagline: 'A hand and body duet, wrapped and ready to give.',
      bullets: [
        'A hand and body pairing in one gift-ready carton',
        'Arrives tomorrow with Prime',
        'Add a gift message at checkout'
      ]
    }
  ],

  /*
    Home page video banner. Leave src empty to show the animated still life.
    To use real footage: put an .mp4 in video/ and set e.g.
      src: 'video/ritual.mp4', poster: 'video/ritual.jpg'
    Keep it silent, 10 to 20 seconds, loopable, under ~8 MB.
  */
  media: {
    homeVideo: { src: '', poster: '' }
  },

  /*
    Store tabs, in the order of the sticky store navigation. Like every Amazon
    Brand Store there is no "Home" tab: the logo band links to the store home.
    `menu` adds a dropdown; each entry opens the page with that filter applied.
  */
  tabs: [
    { route: 'gifts', label: 'Gift Guide' },
    { route: 'hand-body', label: 'Hand & Body', menu: [
      { label: 'All hand & body', filter: 'all' }, { label: 'Hands', filter: 'hand' },
      { label: 'Body', filter: 'body' }, { label: 'Light aroma', filter: 'light' },
      { label: 'Refills & subscribe', filter: 'refill' }] },
    { route: 'fragrance', label: 'Fragrance', menu: [
      { label: 'All eaux de parfum', filter: 'all' }, { label: 'Woody', filter: 'Woody' },
      { label: 'Fresh', filter: 'Fresh' }] },
    { route: 'for-the-home', label: 'For the home' },
    { route: 'ritual', label: 'Find your ritual' },
    { route: 'values', label: 'Our values' }
  ],

  // What each page answers in the pitch. Shown only when "Show pitch notes" is on.
  notes: {
    '': 'Answers "Is this listing real?" and "Why does it cost double?". Every product is sold by Amazon at the aesop.fr price, replacing resellers charging +73% to +103%.',
    'hand-body': 'Persona: Thomas Laurent, 39, Bordeaux. Dislikes strong fragrance and wants a simple routine, so the page leads with a 3-step routine and a "Light aroma" filter. Subscribe and refill answer "I ran out again".',
    'fragrance': 'Focus product: Marrakech Intense (€170). Fragrance families help with "Which one is for me?" without a boutique visit.',
    'for-the-home': 'Focus product: Post-Poo Drops. The witty, giftable entry point to the brand at €30.',
    'gifts': 'Persona: the Gifters. "I need a gift by Friday" is answered by Prime next-day delivery and budget filters.',
    'ritual': 'Persona: Laura Bennett, 28, Paris. The quiz rebuilds the in-boutique advice online ("find your ritual" guide from the strategy).',
    'values': 'Persona: Laura. Ethical, vegan, cruelty-free care. B Corp since 2020, renewed 2024.',
    'product': 'Listing mock-up: 1P "Ships from and sold by Amazon", price parity with aesop.fr, Subscribe & refill, Prime delivery.',
    'search': 'Store search keeps shoppers inside the official store instead of landing on reseller listings.'
  }
};
