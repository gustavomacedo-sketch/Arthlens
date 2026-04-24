# Arthlens — India's Financial Clarity Guide

A premium, AdSense-ready financial editorial site for India, built in pure HTML + CSS + JavaScript.
Gamified guided-check funnel, rich editorial content, modular ad placements, and full legal scaffolding for monetisation approval.

**No build step. No framework. Open `index.html` in a browser, or serve the folder statically.**

---

## 1. Project structure

```
arthlens/
├─ index.html                     # Homepage
├─ guided-check.html              # 5-step gamified funnel (quiz)
├─ results.html                   # Post-capture editorial hub
├─ types-of-credit.html           # Product-by-product guide
├─ how-to-compare.html            # APR / total-cost framework
├─ requirements.html              # Documents checklist
├─ next-steps.html                # Pre-application playbook
├─ about.html                     # About + editorial methodology
├─ advertising-disclosure.html    # Monetisation disclosure
├─ privacy-policy.html            # Privacy policy
├─ terms.html                     # Terms of use
├─ contact.html                   # Contact form + channels
├─ faq.html                       # Full FAQ page
├─ robots.txt                     # Search robots directives
├─ sitemap.xml                    # XML sitemap
├─ ads.txt                        # AdSense publisher ID (placeholder)
└─ assets/
   ├─ css/
   │  ├─ main.css                 # Design system + components
   │  └─ pages.css                # Page-specific layouts (quiz, results)
   └─ js/
      ├─ main.js                  # Nav, accordion, tabs, TOC scroll-spy, cookies
      └─ quiz.js                  # Guided-check state machine + localStorage
```

---

## 2. Design system

- **Colors** — navy `#0A2540`, emerald `#00C26E`, soft gray bg `#F5F7FA`, amber accent `#F5A623`.
- **Type** — Plus Jakarta Sans (headings), Inter (body). Loaded from Google Fonts with `display=swap`.
- **Radius / shadow / spacing** — tokens defined in `:root` inside `assets/css/main.css`.
- **Components** — `.btn`, `.card`, `.chip`, `.accordion`, `.tabs`, `.tbl`, `.callout`, `.progress`, `.stats`, `.ad-slot`. All class-based, no framework.

Edit tokens in `assets/css/main.css` under `:root`. Everything else cascades.

---

## 3. Editing copy

Copy is written directly into each `.html` file. No CMS. For copy changes:

1. Open the relevant HTML file in an editor.
2. Change the text inside the tags (don't rename class names unless you also update the CSS).
3. Save and refresh the browser — no build required.

The quiz content (questions, options, and contextual insights) lives in a single array at the top of `assets/js/quiz.js`, in the `STEPS` constant.

---

## 4. Ad placements (AdSense-ready)

All ad units are placeholder `<aside class="ad-slot">` blocks with `data-size` attributes:

| Size value    | Usage                                    | Typical unit          |
|---------------|------------------------------------------|-----------------------|
| `leaderboard` | Header / between-sections horizontal     | 728×90 or responsive  |
| `inline`      | In-content (within articles)             | Responsive            |
| `sidebar`     | Sticky sidebar                           | 300×600 / 300×250     |
| `sticky`      | Mobile bottom sticky                     | Responsive            |

### To go live with AdSense after approval:

1. Replace the `ads.txt` placeholder publisher ID with your real one:
   `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
2. Add the AdSense loader script to each page's `<head>`:
   ```html
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
   ```
3. Replace each `<aside class="ad-slot">...</aside>` with an AdSense `<ins>` tag, for example:
   ```html
   <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="0000000000"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
   <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
   ```
4. Keep the "Advertisement" label above each slot (it's part of AdSense's clarity guidance and helps approval).

### AdSense approval audit — state of this build

**Critical requirements (done):**
- [x] Publisher ID installed on all pages (`ca-pub-7173834602416158` meta + loader script)
- [x] `ads.txt` with real publisher ID at site root
- [x] Privacy Policy explicitly names **Google AdSense**, DART cookies, opt-out URLs (Google Ads Settings, aboutads.info, youronlinechoices.eu)
- [x] Terms of Use, About, Contact, Advertising Disclosure, FAQ — all present and linked from every footer
- [x] Cookie consent banner (LGPD / GDPR)
- [x] Editorial content: **7 full editorial pages** (homepage + 4 content guides + results hub + 404)
- [x] No "guaranteed approval", no fake urgency, no misleading financial claims
- [x] No adult, gambling, illegal, or copyrighted content
- [x] Clear navigation: main nav + footer links on every page
- [x] Semantic HTML (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`)
- [x] Mobile-responsive (tested at 375px, 768px, 1280px)
- [x] `<html lang="en">` declared; `data-country` / `data-currency` set by i18n runtime
- [x] `robots.txt`, `sitemap.xml`
- [x] Canonical URLs on every page
- [x] `NewsArticle` JSON-LD on all 4 editorial pages (E-E-A-T: headline, author, publisher, datePublished, dateModified, mainEntityOfPage)
- [x] `WebSite` JSON-LD on homepage
- [x] Byline with avatar and author line on every article
- [x] Breadcrumbs on every article page
- [x] Share row on editorial pages
- [x] Ads clearly labelled "Advertisement" or "Sponsored" on every slot
- [x] No ads placed inside the quiz question flow (only top + below-form + sticky-mobile)
- [x] Working contact form with email disclosure (editorial / privacy / advertising / legal)
- [x] 404 page with site navigation (`404.html`)
- [x] Read-progress indicator on article pages
- [x] Locale / currency / country picker (geo-detected, 14 countries supported)

**Before deploy (YOU must do):**
- [ ] Replace `https://arthlens.example/` with your real deployed domain in:
  - Every `<link rel="canonical">` (13 HTML pages)
  - Every `<meta property="og:url">` (homepage)
  - `sitemap.xml`
  - JSON-LD schemas
  - Privacy Policy email domains (if not using `@arthlens.example`)
- [ ] Deploy to HTTPS host (Vercel / Netlify / Cloudflare Pages / Hostinger)
- [ ] Verify `https://yourdomain.com/ads.txt` returns the publisher line
- [ ] Verify `https://yourdomain.com/sitemap.xml` is reachable
- [ ] Verify `https://yourdomain.com/robots.txt` is reachable
- [ ] Submit sitemap to Google Search Console
- [ ] Wait 30+ days of domain age ideally (AdSense prefers aged domains)
- [ ] Submit to AdSense console → Sites → Add site → your domain
- [ ] AdSense crawler review (usually 1–14 days)

**Once approved:**
- [ ] In AdSense console, create individual ad units
- [ ] Replace each `<aside class="ad …">…</aside>` placeholder with the assigned `<ins class="adsbygoogle">` snippet
- [ ] Alternatively, enable **Auto ads** in AdSense — the existing loader script will then auto-place units (recommended for easy start)
- [ ] Keep the "Advertisement" label above manual ad slots

### AdSense policy compliance — what we do NOT do

- No incentivised clicks ("click here to win")
- No clicks on own ads
- No ads under headings where they could be mistaken for content
- No popups, pop-unders, or auto-playing audio/video
- No content attacking specific groups, hate speech, violence
- No prohibited financial claims ("guaranteed approval", "instant loan", "no credit check")
- No affiliate-only thin pages without editorial value
- No keyword stuffing
- Max 1 sticky ad visible at a time (mobile sticky, dismissible)
- Ads do not exceed ~30% of viewport on any fold

---

## 5. Form handling

Two forms need backend wiring:

### Guided-check contact capture (`assets/js/quiz.js`)
Search for `TODO: POST to your backend/endpoint here`. Replace the simulated delay with:
```js
await fetch('/api/save-guide', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ answers: state.answers, contact: state.contact })
});
```

### Contact form (`contact.html`)
The `<form action="#" method="post">` has an inline `onsubmit` handler for demo purposes. Replace the `action` attribute with your form endpoint (Formspree, Netlify Forms, your own API, etc.) and remove the `onsubmit` attribute.

---

## 6. Analytics

Add your analytics snippet inside the `<head>` of each HTML page (or inject via a small script). Two common choices:

- **Google Analytics 4** — paste the GA4 `gtag` snippet.
- **Plausible / Fathom / Umami** — privacy-friendly, single-line script.

Respect the cookie banner choice: the script should only run when `localStorage.getItem('arthlens.consent') === 'all'`.

---

## 7. Adapting to another country / niche

The structure is modular by design. To clone for another market:

1. Replace currency symbols (`₹`) and country-specific references throughout the HTML.
2. Update the quiz options in `STEPS` (in `quiz.js`) with amount bands suitable to the market.
3. Edit the ticker / stats in `index.html` to reflect local benchmarks.
4. Update the bureau / regulator names (e.g. CIBIL → Equifax, RBI → FCA) on `requirements.html` and `results.html`.
5. Change the ADVERTISER contact / legal jurisdiction in `terms.html`.

---

## 8. Known placeholders to replace before going live

- [ ] `ads.txt` publisher ID
- [ ] AdSense `<script>` loader in every page's `<head>`
- [ ] Ad unit `<ins>` tags in place of `<aside class="ad-slot">` blocks
- [ ] Contact-form backend endpoint
- [ ] Guided-check save endpoint
- [ ] Analytics snippet (GA4 / Plausible)
- [ ] Canonical URLs (`<link rel="canonical">`) — replace `arthlens.example` with your real domain
- [ ] `sitemap.xml` URLs
- [ ] Logo / favicon assets in `assets/images/`
- [ ] Real editorial-team names, if you add bylines
- [ ] Legal address in `terms.html` if required by local law

---

## 9. Deployment

The site is static. Any of these work out of the box:

- **Vercel / Netlify / Cloudflare Pages** — drag-drop or connect the repo
- **GitHub Pages** — push and enable Pages
- **S3 + CloudFront** — upload the folder
- **Any shared hosting** — FTP the folder to `public_html/`

No build step, no Node dependencies, no environment variables required.

---

## 10. Accessibility & performance

- Semantic HTML5 landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`)
- Focus-visible outlines on interactive elements
- `aria-expanded` on accordion and mobile nav
- `aria-current="page"` on nav
- `prefers-reduced-motion` respected
- Fonts preconnected; `display=swap` to avoid invisible text
- No blocking JS — everything is `defer`ed
- CSS is under 30 KB combined

Run Lighthouse on the deployed site for a live score.

---

Built to be read. Not to be scrolled past.
