# Aesop on Amazon.fr: Brand Store concept

Student concept mock-up for the Global Digital Marketing × Amazon pitch (KEDGE, Group 7).
**Not affiliated with Aesop or Amazon.** Nothing can be bought; "Add to basket" only shows a demo message.

The site is plain HTML/CSS/JS with no build step. Open `index.html` through any static server.

## Run locally

```bash
python3 -m http.server 4173
# then open http://localhost:4173
```

## Pages (store tabs)

| Tab | Route | Built for |
|---|---|---|
| Home | `#/` | Brand story, 3 focus products, trust strip |
| Hand & Body | `#/hand-body` | Thomas: 3-step routine, "Light aroma" filter, Subscribe & refill |
| Fragrance | `#/fragrance` | Marrakech Intense |
| For the home | `#/for-the-home` | Post-Poo Drops |
| Gifts | `#/gifts` | Gifters: "Delivered tomorrow with Prime", budget filters |
| Find your ritual | `#/ritual` | Laura: 4-question quiz |
| Our values | `#/values` | Laura: B Corp, vegan, refills, price parity |
| Product page | `#/p/<id>` | Amazon listing mock-up (buy box, Sold by Amazon) |

To show the pitch notes while presenting, open the site with `?notes` added to the link, e.g. `https://aesop-amazon-concept.vercel.app/?notes`. Each page then shows which persona and problem it answers.

## Shopping features (`js/shop.js`)

Every header, menu and product button works the way it does on Amazon:

| Where | What it does |
|---|---|
| Deliver to | Choose a French postcode; updates the header, product pages and checkout |
| EN | Language and currency menu |
| Account & Lists | Menu with Wish List, Orders, Basket, Subscribe & refill, Customer Service |
| Returns & Orders (`#/orders`) | Your orders: track package, return items, cancel, buy again |
| Basket (`#/cart`) | Quantity stepper, delete, save for later, gift option, subtotal, checkout |
| Checkout (`#/checkout`) | Address, delivery date choice, order summary, Place your order |
| ☰ All | Slide-in menu with every store page and help links |
| Today's Deals, Prime, Best Sellers, Customer Service | Their own pages (`#/deals`, `#/prime`, `#/best-sellers`, `#/help`) |
| Search boxes | Live suggestions as you type (arrow keys + Enter) |
| Product tiles | Add to basket opens the "Added to basket" panel; the eye opens Quick look |
| Product page | Quantity, Subscribe & refill, gift options, Buy Now, Add to List, customer reviews |

Concept demo: there is **no sign-in and no payment form**. Checkout uses "Pay on delivery (demo)". The basket, lists, orders, postcode and language are saved in the visitor's own browser (localStorage), so they survive a refresh but are never sent anywhere.

## Deploy

- **Netlify (fastest):** go to https://app.netlify.com/drop and drag this folder in.
- **GitHub Pages:** push to a repo, then go to Settings → Pages → Deploy from branch → `main` / root. The `.nojekyll` file is already included.
- **Vercel:** run `vercel --prod` in this folder.

`<meta name="robots" content="noindex">` keeps the mock-up out of search engines.

## Add real photos and videos

Out of the box, every image is an SVG illustration and the video banner is an animated still life. To use real photos or footage, save files with these names, then run **one command**. Anything you don't add keeps its illustration.

| Slot | File name | Shape |
|---|---|---|
| Store hero (top of every page) | `img/hero.jpg` or a looping `video/hero.mp4` | wide, about 4:1, product on the right |
| Home video banner | `video/banner.mp4` (+ optional `img/video-poster.jpg`) | about 3:1, silent loop |
| 2026 Gift Guide banner (top of home) | `video/gift-guide.mp4`, e.g. the aesop.fr "Gifts for the gathering" film | about 4:3, silent loop |
| Hand & Body banner | `img/banner-hand-body.jpg` | about 3:1, subject on the right |
| Fragrance banner | `img/banner-fragrance.jpg` | about 3:1, dark, subject on the right |
| For the home banner | `img/banner-for-the-home.jpg` | about 3:1, subject on the right |
| Gifts banner | `img/banner-gifts.jpg` | about 2:1 |
| Home category tiles | `img/cat-hand-body.jpg`, `img/cat-fragrance.jpg`, `img/cat-for-the-home.jpg`, `img/cat-gifts.jpg` | about square |
| Product photos | `img/products/<product-id>.jpg`, e.g. `img/products/marrakech-intense.jpg` | about 5:6, plain light background |

Product ids: `reverence-hand-wash`, `resurrection-hand-wash`, `resurrection-hand-balm`, `trusted-companions`, `reverence-refill`, `geranium-body-cleanser`, `evergreen-affections`, `marrakech-intense`, `hwyl`, `tacit`, `karst`, `post-poo-drops`, `cythera-room-spray`, `olous-room-spray`, `ptolemy-candle`, `arms-outstretched`, `gentle-embraces`. Extra listing photos: `img/products/<product-id>-2.webp`, `-3.webp`.

You can use `.jpg`, `.png`, `.webp` or `.avif` for images, and `.mp4` or `.webm` for video. Then run:

```bash
python3 tools/scan_assets.py
```

This updates `js/assets.js`, the list of files the site uses. Run it again whenever you add or remove media, and commit `js/assets.js` with the files.

Banners get a light wash on the text side so the copy stays readable over any photo. Keep videos silent, 10 to 20 seconds and under about 8 MB:

```bash
ffmpeg -i input.mov -an -vf "scale=1600:-2" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p video/banner.mp4
```

**Image rights:** Aesop's photos and films are copyrighted. Using them in a class pitch is generally fine. If you host the site publicly, keep the link unlisted (the site already tells search engines not to index it) and take it down after the pitch.

## Prices: check before the pitch

Most prices come from aesop.fr (November 2026), including the 2026 gift kits read from aesop.fr's own product data. Two are still marked `check:` in `js/data.js`:

- Reverence Aromatique Hand Wash Refill 500 mL: €38 (the aesop.ie refill price)
- Geranium Leaf Body Cleanser 500 mL: €59 (from a search result)

Star ratings and review counts are placeholders.

## Where the photos came from

Product and campaign photos are Aesop's own. They were taken from Internet Archive snapshots of aesop.fr and aesop.ie, because aesop.fr blocks automated access. The homepage film is hosted on Flowplayer and couldn't be downloaded, so the home banner uses a still with slow camera motion. Fonts are free stand-ins: Optima-style headings for Aesop's Zapf Humanist, and Hanken Grotesk for Suisse Int'l.
