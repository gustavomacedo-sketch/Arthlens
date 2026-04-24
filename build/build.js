#!/usr/bin/env node
/* =========================================================
   Arthlens — static site generator
   Generates:
     /index.html               (country selector hub)
     /<cc>/index.html          (country hub — category grid)
     /<cc>/<cat>/index.html    (category landing — article list)
     /<cc>/<cat>/<slug>.html   (individual articles)
     /sitemap.xml              (regenerated)
   Data + templates embedded for single-file reproducibility.
   ========================================================= */
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ADS_CLIENT = 'ca-pub-7173834602416158';
const SITE = 'https://arthlens.example';
const BRAND = 'Arthlens';

/* ---------- COUNTRIES (22) ---------- */
const COUNTRIES = [
  { cc:'ae', name:'United Arab Emirates', short:'UAE',          flag:'🇦🇪', currency:'AED' },
  { cc:'au', name:'Australia',            short:'Australia',    flag:'🇦🇺', currency:'AUD' },
  { cc:'be', name:'Belgium',              short:'Belgium',      flag:'🇧🇪', currency:'EUR' },
  { cc:'br', name:'Brazil',               short:'Brazil',       flag:'🇧🇷', currency:'BRL' },
  { cc:'ca', name:'Canada',               short:'Canada',       flag:'🇨🇦', currency:'CAD' },
  { cc:'ch', name:'Switzerland',          short:'Switzerland',  flag:'🇨🇭', currency:'CHF' },
  { cc:'de', name:'Germany',              short:'Germany',      flag:'🇩🇪', currency:'EUR' },
  { cc:'dk', name:'Denmark',              short:'Denmark',      flag:'🇩🇰', currency:'DKK' },
  { cc:'fr', name:'France',               short:'France',       flag:'🇫🇷', currency:'EUR' },
  { cc:'ie', name:'Ireland',              short:'Ireland',      flag:'🇮🇪', currency:'EUR' },
  { cc:'il', name:'Israel',               short:'Israel',       flag:'🇮🇱', currency:'ILS' },
  { cc:'jp', name:'Japan',                short:'Japan',        flag:'🇯🇵', currency:'JPY' },
  { cc:'kr', name:'South Korea',          short:'South Korea',  flag:'🇰🇷', currency:'KRW' },
  { cc:'mx', name:'Mexico',               short:'Mexico',       flag:'🇲🇽', currency:'MXN' },
  { cc:'nl', name:'Netherlands',          short:'the Netherlands', flag:'🇳🇱', currency:'EUR' },
  { cc:'no', name:'Norway',               short:'Norway',       flag:'🇳🇴', currency:'NOK' },
  { cc:'nz', name:'New Zealand',          short:'New Zealand',  flag:'🇳🇿', currency:'NZD' },
  { cc:'sa', name:'Saudi Arabia',         short:'Saudi Arabia', flag:'🇸🇦', currency:'SAR' },
  { cc:'se', name:'Sweden',               short:'Sweden',       flag:'🇸🇪', currency:'SEK' },
  { cc:'sg', name:'Singapore',            short:'Singapore',    flag:'🇸🇬', currency:'SGD' },
  { cc:'uk', name:'United Kingdom',       short:'the UK',       flag:'🇬🇧', currency:'GBP' },
  { cc:'us', name:'United States',        short:'the US',       flag:'🇺🇸', currency:'USD' }
];

/* ---------- CATEGORIES (22) with 10 article templates each ---------- */
const CAT = (slug, emoji, name, desc, titles, sections) => ({ slug, emoji, name, desc, titles, sections });

const CATEGORIES = [
  CAT('b2b-tech','💼','B2B Technology',
    'Tools, platforms and workflows teams rely on to operate and scale.',
    [
      'Top 10 B2B SaaS Tools Teams Use in {C} in 2026',
      'Common B2B Tech Mistakes Teams Make in {C}',
      'How to Choose the Right CRM for a {C} Business',
      'Practical Guide to B2B Procurement in {C}',
      'Evaluating B2B Vendors: A {C} Checklist',
      'Best Project Management Platforms for {C} Teams',
      'Cybersecurity Basics for B2B Companies in {C}',
      'A {C} Guide to Cloud Infrastructure for Growing Teams',
      'Integrating Payments, CRM and Billing in {C}',
      'The B2B Buyer Journey in {C}: What Actually Works'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local consideration']),

  CAT('cooking','🍳','Cooking & Recipes',
    'Everyday meals, pantry basics and local ingredient pairings.',
    [
      'Top 10 Dishes to Try at Home in {C}',
      'A Beginner\'s Guide to Weekly Meal Planning in {C}',
      'How to Build a Smart Pantry in {C}',
      '7 Cooking Mistakes People Make at Home in {C}',
      'Budget Grocery Shopping Tips for Families in {C}',
      'Essential Kitchen Tools Every Home Should Have in {C}',
      'Easy Weeknight Recipes Using Local Ingredients in {C}',
      'How to Reduce Food Waste at Home in {C}',
      'Simple Meal Prep Ideas Popular in {C}',
      'How to Cook Healthier on a Budget in {C}'
    ],
    ['What to know first','Common mistakes','A simple framework','A practical checklist','A local angle']),

  CAT('digital-marketing','📣','Digital Marketing, SaaS & Hosting',
    'Practical playbooks for owners, marketers and small teams.',
    [
      'Top Digital Marketing Channels That Work in {C}',
      'How to Pick a Hosting Provider for a {C} Business',
      'A Small-Business SEO Starter Guide for {C}',
      'Email Marketing Basics for Founders in {C}',
      'Common SaaS Pricing Mistakes in {C}',
      'Landing Page Patterns That Convert in {C}',
      'How to Build a Content Calendar That Lasts in {C}',
      'Paid Ads Budget Framework for Small Teams in {C}',
      'Analytics Setup Checklist for Websites in {C}',
      'How to Protect Customer Data Online in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local consideration']),

  CAT('money','💰','Money & Investing',
    'Everyday finance, budgeting, saving and responsible investing.',
    [
      'How to Build an Emergency Fund in {C}',
      'A Beginner\'s Guide to Budgeting in {C}',
      '7 Money Mistakes People Make in {C}',
      'How to Compare Savings Accounts in {C}',
      'Understanding Credit Scores in {C}',
      'A Calm Framework for Paying Off Debt in {C}',
      'How to Start Investing for Beginners in {C}',
      'Taxes Basics Every Working Adult Should Know in {C}',
      'How to Plan a Big Purchase Without Overextending in {C}',
      'Retirement Planning: a Practical Primer for {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local consideration']),

  CAT('devices','📱','Devices & Electronics',
    'Buying, maintaining and upgrading phones, laptops and home tech.',
    [
      'Top Phones Worth Considering in {C} in 2026',
      'How to Choose a Laptop for Work or Study in {C}',
      '7 Mistakes People Make When Buying Electronics in {C}',
      'Extending Your Phone Battery Life: Practical Tips for {C}',
      'Comparing Tablets: What Actually Matters in {C}',
      'How to Set Up a Reliable Home Wi-Fi in {C}',
      'Smart Home Starter Guide for {C}',
      'How to Maintain Your Laptop for Longer in {C}',
      'Choosing the Right Headphones for Daily Use in {C}',
      'A Realistic Guide to Upgrading Your Devices in {C}'
    ],
    ['What to compare','Common pitfalls','Budget considerations','A practical checklist','A local angle']),

  CAT('gaming','🎮','Gaming',
    'Guides for players of all ages: setups, titles, safety and spend.',
    [
      'Best Games to Play on a Budget in {C} 2026',
      'How to Choose the Right Gaming Console in {C}',
      '7 Mistakes New Players Make in {C}',
      'Setting Up a Home Gaming Space in {C}',
      'Online Gaming Safety Tips for Families in {C}',
      'Should You Build a PC or Buy a Console in {C}?',
      'A Realistic Monthly Gaming Budget for {C}',
      'Accessibility Settings Worth Knowing in {C}',
      'How to Manage Screen Time for Kids in {C}',
      'Indie Games Worth Discovering in {C}'
    ],
    ['What to know first','Common pitfalls','Budget considerations','A practical checklist','A local angle']),

  CAT('high-value-travel','✈️','High-Value Travel',
    'Thoughtful trip planning: destinations, timing and smart spend.',
    [
      'Top Destinations to Visit from {C} in 2026',
      'How to Plan a Honeymoon from {C} Without Overspending',
      '7 Travel Mistakes People Make Leaving {C}',
      'Long-Haul Flight Tips from {C}',
      'How to Build a Smart Travel Budget in {C}',
      'Off-Season Travel Ideas from {C}',
      'Travel Insurance Basics for Travellers from {C}',
      'Packing Checklist for International Trips from {C}',
      'How to Earn and Redeem Travel Points in {C}',
      'First-Time Family Holiday Guide for {C}'
    ],
    ['What to plan first','Budget considerations','Common pitfalls','A practical checklist','A local angle']),

  CAT('legal','⚖️','Legal Services & Lawyers',
    'Practical guides for common legal questions everyday readers face.',
    [
      'How to Find a Reliable Lawyer in {C}',
      'Everyday Legal Rights People Miss in {C}',
      '7 Questions to Ask Before Hiring a Lawyer in {C}',
      'Understanding Rental Contracts in {C}',
      'Small-Claims Basics for Consumers in {C}',
      'How to Read a Contract Without a Law Degree in {C}',
      'Wills and Estate Planning Basics in {C}',
      'Family Law Questions People Commonly Ask in {C}',
      'Consumer Protection: Know Your Rights in {C}',
      'When to Consult a Lawyer vs. Handle It Yourself in {C}'
    ],
    ['Why this matters','What to prepare','Common pitfalls','A practical checklist','A local consideration']),

  CAT('movies','🎬','Movies',
    'Streaming, theatre and movie-night picks — without the spoilers.',
    [
      'Top Movies Worth Watching in {C} in 2026',
      'How to Build a Family Movie Night Tradition in {C}',
      'Best Streaming Services Compared for Viewers in {C}',
      '7 Under-the-Radar Films Popular in {C}',
      'How to Discover Local Cinema in {C}',
      'Parental Controls: a Practical Guide for {C}',
      'Classic Movies to Introduce to Kids in {C}',
      'A Sensible Monthly Streaming Budget for {C}',
      'Home Cinema Setup Tips for {C} Living Rooms',
      'International Films Worth Discovering from {C}'
    ],
    ['What to watch first','Budget considerations','Common pitfalls','A practical checklist','A local angle']),

  CAT('news','📰','News',
    'Media literacy, reading habits and sorting signal from noise.',
    [
      'How to Build a Balanced News Diet in {C}',
      'Spotting Misinformation: a Reader\'s Guide in {C}',
      '7 Common News-Reading Habits Worth Changing in {C}',
      'Local vs. International News: Finding the Mix in {C}',
      'How to Read Financial News Without Panic in {C}',
      'A Parent\'s Guide to Talking About News with Kids in {C}',
      'Evaluating Sources: a Practical Checklist for {C}',
      'How to Subscribe Wisely to Quality Media in {C}',
      'Why Slow News Matters in {C}',
      'Building a Weekend News Routine That Sticks in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('personal-blog','✍️','Personal Blog',
    'Writing, publishing and growing a voice online.',
    [
      'How to Start a Personal Blog in {C} in 2026',
      'Writing Habits That Last for Bloggers in {C}',
      '7 Mistakes New Bloggers Make in {C}',
      'How to Pick a Niche That Works in {C}',
      'SEO Basics for Personal Blogs in {C}',
      'Monetising a Personal Blog the Ethical Way in {C}',
      'How to Build an Audience Without Burning Out in {C}',
      'Writing Weekly: a Realistic Schedule for {C}',
      'Editorial Calendars for Part-Time Bloggers in {C}',
      'Reader Emails: Growing a Newsletter from {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('luxury-cars','🚗','Cars & Transport',
    'Buying, owning and running a car sensibly — including luxury options.',
    [
      'Top Cars Worth Considering in {C} in 2026',
      'How to Decide: New vs. Used Car in {C}',
      '7 Mistakes First-Time Car Buyers Make in {C}',
      'Understanding Car Financing in {C}',
      'Insurance Essentials for New Drivers in {C}',
      'Fuel, EV or Hybrid? A Practical Comparison for {C}',
      'Servicing and Maintenance Basics in {C}',
      'How to Negotiate a Fair Price in {C}',
      'Total Cost of Ownership: a Realistic Guide for {C}',
      'Luxury Car Ownership Without Surprises in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('education','🎓','Premium Education',
    'Schools, courses, scholarships and lifelong learning.',
    [
      'Top Online Courses Worth Taking in {C} in 2026',
      'How to Choose a University Programme in {C}',
      '7 Study Mistakes to Avoid in {C}',
      'Scholarships Explained: a Reader\'s Guide in {C}',
      'Upskilling After 30 in {C}',
      'Financing Your Studies in {C}: a Practical Guide',
      'Languages Worth Learning from {C}',
      'How to Balance Work and Study in {C}',
      'Building a Personal Learning Plan in {C}',
      'Professional Certifications That Matter in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('health','🏥','Premium Health',
    'Everyday wellbeing, preventive health and sensible spending.',
    [
      'Building a Sustainable Exercise Routine in {C}',
      'How to Choose Health Insurance in {C}',
      '7 Sleep Habits Worth Changing in {C}',
      'Mental Health Basics: a Calm Guide for {C}',
      'Preventive Check-Ups Adults Commonly Miss in {C}',
      'Nutrition Basics on an Everyday Budget in {C}',
      'How to Find a Reliable Doctor in {C}',
      'Managing Stress at Work: a Guide for {C}',
      'Dental Care Essentials in {C}',
      'Ageing Well: a Practical Playbook for {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('parenting','👨‍👩‍👧','Premium Parenting',
    'Everyday parenting — routines, tools and calmer decisions.',
    [
      'Building a Family Morning Routine in {C}',
      'How to Choose a School in {C}',
      '7 Parenting Habits Worth Keeping in {C}',
      'Screen Time: a Balanced Approach for Families in {C}',
      'Teaching Kids About Money in {C}',
      'A Practical Chore Framework for Families in {C}',
      'Healthy Meals Kids Will Actually Eat in {C}',
      'Managing Tantrums: a Calm Playbook for {C}',
      'Reading Habits That Last for Kids in {C}',
      'A Family Budget Guide for New Parents in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('pets','🐾','Premium Pets',
    'Everyday care, adoption, feeding and travel with pets.',
    [
      'Top Pet-Friendly Cafés to Visit in {C}',
      'How to Choose a Vet in {C}',
      '7 First-Year Puppy Mistakes to Avoid in {C}',
      'A Sensible Pet Budget for Families in {C}',
      'Cat or Dog? A Thoughtful Guide for {C} Households',
      'Travelling with Pets: a Practical Guide from {C}',
      'Pet Insurance Basics in {C}',
      'Rescue Adoption: a Calm Checklist for {C}',
      'Feeding Pets Well Without Overspending in {C}',
      'Training Basics for New Pet Owners in {C}'
    ],
    ['Why this matters','What to prepare','Common pitfalls','A practical checklist','A local angle']),

  CAT('productivity','⚡','Productivity',
    'Planning, focus and calmer routines for work and life.',
    [
      'Building a Weekly Planning Habit in {C}',
      '7 Productivity Myths Worth Dropping in {C}',
      'How to Run Better Meetings in {C}',
      'A Calm Morning Routine Framework for {C}',
      'Email Management Without the Guilt in {C}',
      'Focus Blocks: a Practical Guide in {C}',
      'How to Say No at Work in {C}',
      'Managing Energy, Not Just Time, in {C}',
      'A Realistic Habit-Tracker Setup for {C}',
      'How to Wrap Up Your Week Intentionally in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('real-estate','🏠','Real Estate',
    'Buying, renting and understanding housing markets.',
    [
      'How to Buy Your First Home in {C}',
      'Rent vs. Buy: a Calm Comparison for {C}',
      '7 Real-Estate Mistakes Buyers Make in {C}',
      'Understanding Mortgages in {C}',
      'How to Read a Property Listing Honestly in {C}',
      'Closing Costs Explained for {C} Buyers',
      'A First-Time Landlord\'s Checklist for {C}',
      'Moving Cities: a Practical Guide in {C}',
      'Home Insurance Basics in {C}',
      'Renovating Without Regret in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local consideration']),

  CAT('reviews','⭐','Review Sites',
    'How to read and write product reviews honestly.',
    [
      'How to Evaluate Online Reviews Without Getting Fooled in {C}',
      '7 Signs a Review Is Fake in {C}',
      'How to Write an Honest Product Review in {C}',
      'Comparison Sites: What Actually Helps in {C}',
      'Rating Systems Explained for Readers in {C}',
      'Building a Personal Review Notebook in {C}',
      'How Review Incentives Work — and Why It Matters in {C}',
      'Finding Reliable Local Reviewers in {C}',
      'Beginner\'s Guide to Researching Before Buying in {C}',
      'How to Respond to a Bad Review as a Business in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('careers','💼','Specialised Jobs & Careers',
    'Practical guides for job seekers and mid-career changers.',
    [
      'How to Write a Résumé That Reads in 10 Seconds in {C}',
      'Career Switches That Actually Work in {C}',
      '7 Interview Mistakes to Avoid in {C}',
      'How to Negotiate Salary in {C}',
      'Networking Without Feeling Awkward in {C}',
      'LinkedIn Essentials for Professionals in {C}',
      'Skills Worth Investing in for {C}\'s Job Market',
      'Freelancing vs. Employment: a Calm Comparison for {C}',
      'Building a Portfolio That Gets You Hired in {C}',
      'How to Prepare for a Performance Review in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('variety','🎭','Variety & Lifestyle',
    'Everyday interests, hobbies and life in general.',
    [
      'Weekend Ideas for Busy People in {C}',
      'Hobbies Worth Starting at Any Age in {C}',
      'A Practical Declutter Guide for Homes in {C}',
      'How to Build a Reading Habit That Lasts in {C}',
      'Everyday Sustainability Tips for {C} Households',
      'Community Groups Worth Joining in {C}',
      'Small Celebrations That Matter in {C}',
      'Personal Finance for Creatives in {C}',
      'Learning a New Skill Without Burnout in {C}',
      'How to Take a Proper Day Off in {C}'
    ],
    ['Why this matters','What to compare','Common pitfalls','A practical checklist','A local angle']),

  CAT('weddings','💍','Weddings',
    'Thoughtful wedding planning, without the overspend.',
    [
      '10 Unique Wedding Themes Popular in {C} 2026',
      '7 Common Wedding Planning Mistakes to Avoid in {C}',
      'Essential Guide to Planning a Wedding in {C}',
      'How to Choose the Best Wedding Venue in {C}',
      'Guide to Planning a Beach Wedding in {C}',
      'How to Save Money on Your Wedding in {C} in 2026',
      'Top Honeymoon Destinations for Couples from {C}',
      'How to Choose the Perfect Wedding Dress in {C}',
      'Top Wedding Photography Tips for Couples in {C}',
      'The Ultimate Wedding Planning Guide for {C}'
    ],
    ['What to plan first','Budget considerations','Common pitfalls','A practical checklist','A local angle'])
];

/* ---------- Slug helper ---------- */
const slugify = (s) => s
  .toLowerCase()
  .replace(/[{}]/g,'')
  .replace(/[^a-z0-9]+/g,'-')
  .replace(/^-+|-+$/g,'')
  .slice(0, 80);

/* ---------- Content generator ---------- */
// Section-body bank keyed by section name (generic but country-aware at runtime).
const SECTION_BANKS = {
  'Why this matters':
    "Before diving into tactics, it's worth stepping back. In {C}, readers often start this journey with a rushed search, pick the first option that looks good on a glossy page, and regret the fine print later. This guide takes the opposite approach. We pause, walk through the landscape calmly, and focus on the decisions that compound over time.",
  'What to compare':
    "When you compare options in {C}, the headline number is rarely the full story. Pay attention to ongoing costs, flexibility to change your mind, and how the product behaves when your circumstances change — a job move, a new family member, or an unexpected bill. The three-option rule is a good habit: collect at least three comparable choices before committing.",
  'What to know first':
    "Before you begin, write down exactly what you want this decision to solve in {C}. One sentence. Short and specific. This single habit eliminates most of the impulse mistakes readers tell us about. It also makes it easier to say no to upsells, bundles, and add-ons that drift you away from the original plan.",
  'What to plan first':
    "Start with the non-negotiables. Every couple, household or team in {C} has constraints — budget, calendar, family logistics, regulations. Write them down first, in plain language. Only then move on to the nicer-to-haves. When trade-offs appear later, you'll have a reference to protect the things that actually matter.",
  'What to prepare':
    "Preparation in {C} is usually boring, and boring is the point. Gather identification, address proof, any required income or registration documents, and a simple folder of receipts or contracts. Having your paperwork ready before you start tends to cut the end-to-end time roughly in half.",
  'Budget considerations':
    "A realistic budget in {C} is one you can stick to with a small buffer, not one optimised down to the last digit. Build your number in three layers: the fixed essentials, a flexible middle, and a reserve for the unexpected. The reserve is often what separates a good decision from a stressful one.",
  'Common pitfalls':
    "Three mistakes come up repeatedly from readers in {C}. First, skipping the comparison step and taking the most convenient offer. Second, stretching the timeline to reduce the monthly cost, only to pay more in total. Third, ignoring the fine print around cancellation, prepayment or renewal terms. None of these are avoided by being clever — they're avoided by being patient.",
  'A practical checklist':
    "A useful checklist for readers in {C} fits on one page. Include: the decision you're trying to make, the three options you'll compare, the all-in cost of each, how easy it is to back out, and the single most important feature for your situation. Print it. Tick each row. Come back to it if the decision feels foggy.",
  'A local consideration':
    "Local context matters in {C}. Regulations, calendars, and consumer protection norms shift the right answer meaningfully. Before acting on general advice, check with a local professional if the decision is large. A short conversation often saves weeks of back-and-forth.",
  'A local angle':
    "The way people approach this in {C} has its own rhythm. Costs tend to be quoted differently, timelines shift around local holidays, and well-regarded providers may not show up first in generic global searches. Spend a little time on local sources — search in the local language if relevant — before finalising a choice."
};

const CTA_BANK = {
  finance: "Compare two or three options side by side before committing. If something feels rushed, it probably is.",
  family:  "Take it one small habit at a time. Sustainable is better than spectacular.",
  travel:  "Plan the big beats first — dates, destination, budget — then the details. The details rarely hold the trip together.",
  content: "Publish small, often, and honestly. Consistency beats polish.",
  generic: "Slow decisions compound well. Rushed ones rarely do."
};

const ctaFor = (catSlug) => {
  if (['money','legal','real-estate','careers','b2b-tech','digital-marketing'].includes(catSlug)) return CTA_BANK.finance;
  if (['parenting','pets','health','education'].includes(catSlug)) return CTA_BANK.family;
  if (['high-value-travel','weddings'].includes(catSlug)) return CTA_BANK.travel;
  if (['personal-blog','news','reviews'].includes(catSlug)) return CTA_BANK.content;
  return CTA_BANK.generic;
};

/* ---------- HTML templates ---------- */

function head({ title, desc, canonical, ogType = 'article', hreflangs = [], extra = '' }) {
  const hreflangHtml = hreflangs.length
    ? hreflangs.map(h => `  <link rel="alternate" hreflang="${h.lang}" href="${h.url}">`).join('\n')
    : '';
  const ogImage = `${SITE}/assets/og-default.svg`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(desc)}">
  <meta name="author" content="${BRAND} Editorial Board">
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">
  <meta name="theme-color" content="#C21E38">
  <link rel="canonical" href="${canonical}">
${hreflangHtml}
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${escapeAttr(title)}">
  <meta property="og:description" content="${escapeAttr(desc)}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_US">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttr(title)}">
  <meta name="twitter:description" content="${escapeAttr(desc)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@500;600;700&display=swap">
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/pages.css">
  ${extra}
  <meta name="google-adsense-account" content="${ADS_CLIENT}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CLIENT}" crossorigin="anonymous"></script>
</head>
<body>`;
}

/* Map country code to hreflang locale */
const CC_TO_HREFLANG = {
  ae:'en-AE', au:'en-AU', be:'en-BE', br:'en-BR', ca:'en-CA', ch:'en-CH',
  de:'en-DE', dk:'en-DK', fr:'en-FR', ie:'en-IE', il:'en-IL', jp:'en-JP',
  kr:'en-KR', mx:'en-MX', nl:'en-NL', no:'en-NO', nz:'en-NZ', sa:'en-SA',
  se:'en-SE', sg:'en-SG', uk:'en-GB', us:'en-US'
};
/* Generate hreflang entries for a given path pattern (e.g. /<cc>/money/) */
function hreflangsFor(pathFn) {
  const entries = COUNTRIES.map(c => ({
    lang: CC_TO_HREFLANG[c.cc],
    url:  `${SITE}${pathFn(c)}`
  }));
  entries.push({ lang:'x-default', url: `${SITE}${pathFn(COUNTRIES.find(c=>c.cc==='us'))}` });
  return entries;
}

function topStripCountry(country) {
  return `<div class="top-strip">
  <div class="container row">
    <a href="/">Home</a>
    <span class="divider"></span>
    <a href="/${country.cc}/" class="hide-tablet">${country.flag} ${country.short}</a>
    <span class="divider hide-tablet"></span>
    <a href="/about.html" class="hide-tablet">About</a>
    <span class="spacer"></span>
    <span class="date">${country.flag} ${country.short} · ${country.currency}</span>
    <span class="divider"></span>
    <a href="/contact.html">Contact</a>
  </div>
</div>`;
}

function topStripGlobal() {
  return `<div class="top-strip">
  <div class="container row">
    <a href="/">Home</a>
    <span class="divider"></span>
    <a href="/about.html" class="hide-tablet">About</a>
    <span class="divider hide-tablet"></span>
    <a href="/contact.html" class="hide-tablet">Contact</a>
    <span class="spacer"></span>
    <span class="date">Global · Editorial · Multi-country</span>
    <span class="divider"></span>
    <a href="/contact.html">Newsletter</a>
  </div>
</div>`;
}

function brandBar(sectionLabel = 'Editorial Guide', currentCC = null) {
  return `<header class="brand-bar">
  <div class="container row">
    <a class="brand" href="/"><span class="mark">A</span><span>${BRAND}</span><span class="section-label">${sectionLabel}</span></a>
    <nav aria-label="Primary">
      <ul class="nav-links" id="nav-menu" data-open="false">
        <li><a href="/">Home</a></li>
        <li><a href="/#countries">Countries</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
        <li><a href="/policies/privacy.html">Privacy</a></li>
      </ul>
    </nav>
    <div class="tools"><a class="cta" href="/guided-check.html">Guided Check</a></div>
    <button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="nav-menu"><span></span></button>
  </div>
</header>`;
}

function footer() {
  return `<aside class="ad ad-footer-banner" aria-label="Advertisement"><div class="placeholder">Pre-footer banner</div></aside>

<footer class="site-footer">
  <div class="container">
    <div class="grid">
      <div class="footer-brand"><a class="brand" href="/"><span class="mark">A</span><span>${BRAND}</span></a><p class="about">Independent editorial content curated by country, language and local context. Not a bank, not a broker.</p></div>
      <div><h4>Browse</h4><ul><li><a href="/">All countries</a></li><li><a href="/about.html">About &amp; methodology</a></li><li><a href="/contact.html">Contact</a></li><li><a href="/faq.html">FAQ</a></li><li><a href="/guided-check.html">Guided check</a></li></ul></div>
      <div><h4>Policies</h4><ul><li><a href="/policies/privacy.html">Privacy Policy</a></li><li><a href="/policies/terms.html">Terms of Use</a></li><li><a href="/policies/advertising-disclosure.html">Advertising Disclosure</a></li><li><a href="/policies/cookies.html">Cookie Policy</a></li></ul></div>
      <div><h4>Desk</h4><ul><li><a href="mailto:editorial@arthlens.example">editorial@arthlens.example</a></li><li><a href="mailto:privacy@arthlens.example">privacy@arthlens.example</a></li><li><a href="mailto:ads@arthlens.example">ads@arthlens.example</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© <span id="year">2026</span> ${BRAND} Editorial · Independent multi-country publisher.</span><span>Editorial content · We are not a bank.</span></div>
  </div>
</footer>

<aside class="ad ad-sticky-mobile" role="complementary" aria-label="Advertisement"><div class="placeholder">320 × 50 mobile</div><button class="close" type="button" aria-label="Dismiss ad">×</button></aside>
<script src="/assets/js/main.js" defer></script>
</body>
</html>`;
}

/* ---------- HOMEPAGE: country selector hub ---------- */
function renderHome() {
  const title = `${BRAND} — Global Editorial Guides for Money, Family, Travel & Life in 22 Countries`;
  const desc  = `Independent editorial guides for money, family, travel, and everyday life — curated across 22 countries. Pick a country and read guides adapted to local context, currency, and regulations. No bank. No broker. Just editorial.`;

  const grid = COUNTRIES.map(c => `
    <a class="country-card" href="/${c.cc}/" aria-label="Open ${c.name} hub">
      <span class="flag" aria-hidden="true">${c.flag}</span>
      <span class="body">
        <span class="cname">${c.name}</span>
        <span class="ccode">${c.cc.toUpperCase()}</span>
      </span>
      <span class="arrow" aria-hidden="true">→</span>
    </a>`).join('\n');

  // Rich schemas for homepage: Organization + WebSite with SearchAction
  const orgSchema = {
    "@context":"https://schema.org","@type":"Organization",
    "name": BRAND,
    "url": `${SITE}/`,
    "logo": `${SITE}/assets/og-default.svg`,
    "sameAs": [],
    "description": "Independent editorial publisher for money, family, travel, and lifestyle guides across 22 countries.",
    "contactPoint": {
      "@type":"ContactPoint",
      "email":"editorial@arthlens.example",
      "contactType":"editorial"
    }
  };
  const siteSchema = {
    "@context":"https://schema.org","@type":"WebSite",
    "name": BRAND,
    "url": `${SITE}/`,
    "description": desc,
    "inLanguage":"en",
    "potentialAction": {
      "@type":"SearchAction",
      "target": `${SITE}/?q={search_term_string}`,
      "query-input":"required name=search_term_string"
    }
  };
  const hreflangs = [
    ...COUNTRIES.map(c => ({ lang: CC_TO_HREFLANG[c.cc].slice(0,2) === 'en' ? 'en' : 'en', url: `${SITE}/` })).slice(0,1),
    { lang:'en', url: `${SITE}/` },
    { lang:'x-default', url: `${SITE}/` }
  ];

  return head({
    title, desc, canonical: `${SITE}/`, ogType:'website',
    hreflangs,
    extra: `<script type="application/ld+json">${JSON.stringify(orgSchema)}</script>\n  <script type="application/ld+json">${JSON.stringify(siteSchema)}</script>`
  }) + `
${topStripGlobal()}
${brandBar('Global Editorial')}

<section class="hero-global">
  <div class="container">
    <span class="eyebrow is-ink">Global · Editorial · Multi-country</span>
    <h1 class="display">Explore financial, family, and lifestyle guides worldwide.</h1>
    <p class="deck">Independent content curated by country, language, and local context. Choose your location and start reading.</p>

    <div class="country-search-box">
      <label for="country-search" class="sr-only">Search country</label>
      <input type="search" id="country-search" placeholder="Search country by name or code (e.g. Brazil, BR, US…)" autocomplete="off">
    </div>
  </div>
</section>

<section class="section" id="countries" style="padding-top:20px;">
  <div class="container">
    <div class="section-head"><h2>Explore by location</h2><span class="link">${COUNTRIES.length} countries</span></div>
    <div class="country-grid" id="country-grid">
${grid}
    </div>
    <p class="muted tiny" id="country-empty" style="display:none;margin-top:20px;">No country found. Try another name or code.</p>
  </div>
</section>

<div class="container">
  <aside class="ad ad-leaderboard" aria-label="Advertisement">
    <div class="placeholder">Leaderboard ad unit</div>
  </aside>
</div>

<div class="container">
  <aside class="ad ad-inline" aria-label="Advertisement">
    <div class="placeholder">In-content ad unit</div>
  </aside>
</div>

<section class="section-tight">
  <div class="container">
    <div class="section-head"><h2>How this site works</h2></div>
    <div class="steps-strip">
      <div class="step"><h4>Pick a country</h4><p>Local context matters. Each country hub is built with regional financial, legal, and lifestyle references.</p></div>
      <div class="step"><h4>Browse categories</h4><p>22 editorial categories per country — from money and real estate to parenting and travel.</p></div>
      <div class="step"><h4>Read calmly</h4><p>No guaranteed-approval claims. No fake urgency. Just editorial guides written to help you decide well.</p></div>
      <div class="step"><h4>Or take the guided check</h4><p>Our five-question financial check adapts to your country and currency automatically.</p></div>
    </div>
  </div>
</section>

<script>
// Country search filter
(function(){
  const input = document.getElementById('country-search');
  const grid  = document.getElementById('country-grid');
  const empty = document.getElementById('country-empty');
  if (!input || !grid) return;
  const cards = [...grid.querySelectorAll('.country-card')];
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let any = false;
    cards.forEach(card => {
      const name = card.querySelector('.cname').textContent.toLowerCase();
      const code = card.querySelector('.ccode').textContent.toLowerCase();
      const hit = !q || name.includes(q) || code.includes(q);
      card.style.display = hit ? '' : 'none';
      if (hit) any = true;
    });
    if (empty) empty.style.display = any ? 'none' : 'block';
  });
})();
</script>

${footer()}
`;
}

/* ---------- COUNTRY HUB: category grid ---------- */
function renderCountryHub(country) {
  const title = `${country.short} Guides — ${BRAND}`;
  const desc  = `Practical guides for everyday life in ${country.short}. Money, family, travel, lifestyle — 22 editorial categories adapted to local context.`;

  const grid = CATEGORIES.map(cat => `
    <a class="cat-card" href="/${country.cc}/${cat.slug}/" aria-label="${cat.name} in ${country.short}">
      <span class="cat-emoji" aria-hidden="true">${cat.emoji}</span>
      <span class="cat-name">${cat.name}</span>
      <span class="cat-explore">Explore →</span>
    </a>`).join('\n');

  const hreflangs = hreflangsFor(c => `/${c.cc}/`);
  const breadcrumbs = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE}/`},
      {"@type":"ListItem","position":2,"name":country.name,"item":`${SITE}/${country.cc}/`}
    ]
  };
  const collection = {
    "@context":"https://schema.org","@type":"CollectionPage",
    "name":title,"description":desc,"inLanguage":"en",
    "about":country.name,"url":`${SITE}/${country.cc}/`,
    "isPartOf":{"@type":"WebSite","name":BRAND,"url":`${SITE}/`}
  };

  return head({
    title, desc,
    canonical: `${SITE}/${country.cc}/`,
    ogType:'website', hreflangs,
    extra: `<script type="application/ld+json">${JSON.stringify(collection)}</script>\n  <script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>`
  }) + `
${topStripCountry(country)}
${brandBar(`${country.short} Editorial`, country.cc)}

<section class="hero-country">
  <div class="container">
    <div class="country-hero-head">
      <span class="flag-big" aria-hidden="true">${country.flag}</span>
      <div>
        <span class="eyebrow is-ink">${country.name} · ${country.currency} · Editorial</span>
        <h1 class="display">Practical guides for everyday life.</h1>
        <p class="deck">Editorial content, we are not a bank. Make better decisions about money, career, travel, and life in ${country.short}.</p>
        <p class="muted tiny"><strong>${CATEGORIES.length} categories</strong> · Updated regularly</p>
      </div>
    </div>
    <div class="country-search-box">
      <label for="cat-search" class="sr-only">Search category</label>
      <input type="search" id="cat-search" placeholder="What do you want to learn today? Credit cards, budgeting, family…" autocomplete="off">
    </div>
  </div>
</section>

<div class="container">
  <aside class="ad ad-leaderboard" aria-label="Advertisement">
    <div class="placeholder">Top leaderboard unit</div>
  </aside>
</div>

<section class="section">
  <div class="container">
    <div class="cat-grid" id="cat-grid">
${grid}
    </div>
    <p class="muted tiny" id="cat-empty" style="display:none;margin-top:20px;">No category found. Try another term.</p>
  </div>
</section>

<div class="container">
  <aside class="ad ad-inline" aria-label="Advertisement">
    <div class="placeholder">In-content ad unit</div>
  </aside>
</div>

<script>
(function(){
  const input = document.getElementById('cat-search');
  const grid  = document.getElementById('cat-grid');
  const empty = document.getElementById('cat-empty');
  if (!input || !grid) return;
  const cards = [...grid.querySelectorAll('.cat-card')];
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let any = false;
    cards.forEach(c => {
      const t = c.textContent.toLowerCase();
      const hit = !q || t.includes(q);
      c.style.display = hit ? '' : 'none';
      if (hit) any = true;
    });
    if (empty) empty.style.display = any ? 'none' : 'block';
  });
})();
</script>

${footer()}
`;
}

/* ---------- CATEGORY PAGE: article list ---------- */
function renderCategory(country, cat) {
  const catDisplay = cat.name.replace(/^(Premium |High-Value )/,'');
  const title = `${cat.name} in ${country.short} — ${BRAND}`;
  const desc  = `Reliable ${cat.name.toLowerCase()} guides made for everyday life in ${country.short}. ${cat.desc}`;

  const articles = cat.titles.map(t => {
    const realTitle = t.replace(/\{C\}/g, country.short);
    const slug = slugify(t.replace(/\s*in\s*\{C\}/gi,'').replace(/\{C\}/g,'').replace(/\s*from the?\s*$/i,'').replace(/\s*for\s*$/i,'').trim());
    return { title: realTitle, slug };
  });

  const articleCards = articles.map(a => `
      <article class="article-card">
        <a href="/${country.cc}/${cat.slug}/${a.slug}.html">
          <span class="kicker">${cat.emoji} ${catDisplay}</span>
          <h3>${escapeHtml(a.title)}</h3>
          <p>Explore comparisons, tools and practical analysis from ${BRAND} — written for readers in ${country.short}.</p>
          <span class="meta">${country.flag} ${country.short} · 6 min read · Updated 2026</span>
        </a>
      </article>`).join('\n');

  // Cross-category recommendations
  const otherCats = CATEGORIES.filter(c => c.slug !== cat.slug).sort(()=>0.5-Math.random()).slice(0,4);
  const crossLinks = otherCats.map(c => `<a class="chip" href="/${country.cc}/${c.slug}/">${c.emoji} ${c.name}</a>`).join(' ');
  const relatedItems = otherCats.slice(0,2).map(c => {
    const firstTitle = c.titles[0].replace(/\{C\}/g, country.short);
    const firstSlug  = slugify(c.titles[0].replace(/\{C\}/g, country.cc));
    return `
      <article class="article-card">
        <a href="/${country.cc}/${c.slug}/${firstSlug}.html">
          <span class="kicker">${c.emoji} ${c.name}</span>
          <h3>${escapeHtml(firstTitle)}</h3>
          <p>From ${BRAND} — practical guidance written for readers in ${country.short}.</p>
          <span class="meta">${country.flag} ${country.short} · 5 min read</span>
        </a>
      </article>`;
  }).join('\n');

  const hreflangs = hreflangsFor(c => `/${c.cc}/${cat.slug}/`);
  const breadcrumbs = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE}/`},
      {"@type":"ListItem","position":2,"name":country.name,"item":`${SITE}/${country.cc}/`},
      {"@type":"ListItem","position":3,"name":catDisplay,"item":`${SITE}/${country.cc}/${cat.slug}/`}
    ]
  };
  const collection = {
    "@context":"https://schema.org","@type":"CollectionPage",
    "name":title,"description":desc,"inLanguage":"en",
    "about":country.name,"url":`${SITE}/${country.cc}/${cat.slug}/`,
    "isPartOf":{"@type":"WebSite","name":BRAND,"url":`${SITE}/`},
    "hasPart": articles.map(a => ({
      "@type":"Article",
      "name": a.title,
      "url": `${SITE}/${country.cc}/${cat.slug}/${a.slug}.html`
    }))
  };

  return head({
    title, desc,
    canonical: `${SITE}/${country.cc}/${cat.slug}/`,
    ogType:'website', hreflangs,
    extra: `<script type="application/ld+json">${JSON.stringify(collection)}</script>\n  <script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>`
  }) + `
${topStripCountry(country)}
${brandBar(`${country.short} · ${catDisplay}`)}

<section class="article-head">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span class="sep">›</span>
      <a href="/${country.cc}/">${country.flag} ${country.short}</a><span class="sep">›</span>
      <span>${catDisplay}</span>
    </nav>
    <span class="eyebrow">${cat.emoji} ${catDisplay}</span>
    <h1>${cat.name} in ${country.short}</h1>
    <p class="deck">Reliable guides on ${cat.name.toLowerCase()} made for everyday life in ${country.short}. ${cat.desc}</p>
    <div class="chip-row" style="margin-top:18px;">${crossLinks}</div>
  </div>
</section>

<div class="container">
  <aside class="ad ad-leaderboard" aria-label="Advertisement">
    <div class="placeholder">Top leaderboard unit</div>
  </aside>
</div>

<section class="article-shell">
  <div class="container">
    <div class="section-head"><h2>Latest guides</h2></div>
    <div class="article-grid">
${articleCards}
    </div>
  </div>
</section>

<div class="container">
  <aside class="ad ad-inline" aria-label="Advertisement">
    <div class="placeholder">In-content ad unit</div>
  </aside>
</div>

<section class="related-strip">
  <div class="container">
    <div class="section-head"><h2>Keep exploring</h2><a class="link" href="/${country.cc}/">All categories →</a></div>
    <p class="muted">Other recommended topics and guides adapted to ${country.short}.</p>
    <div class="article-grid" style="margin-top:20px;">
${relatedItems}
    </div>
  </div>
</section>

${footer()}
`;
}

/* ---------- ARTICLE PAGE ---------- */
function renderArticle(country, cat, article) {
  const title = `${article.title} — ${BRAND}`;
  const shortDesc = articleDescription(article.title, country, cat);
  const bodyHtml = articleBody(article.title, country, cat);
  const catDisplay = cat.name.replace(/^(Premium |High-Value )/,'');

  const otherArticles = cat.titles
    .filter(t => slugify(t.replace(/\s*in\s*\{C\}/gi,'').replace(/\{C\}/g,'').replace(/\s*from the?\s*$/i,'').replace(/\s*for\s*$/i,'').trim()) !== article.slug)
    .slice(0, 4)
    .map(t => ({
      title: t.replace(/\{C\}/g, country.short),
      slug: slugify(t.replace(/\s*in\s*\{C\}/gi,'').replace(/\{C\}/g,'').replace(/\s*from the?\s*$/i,'').replace(/\s*for\s*$/i,'').trim())
    }));

  const relatedCards = otherArticles.map(a => `
      <article class="article-card">
        <a href="/${country.cc}/${cat.slug}/${a.slug}.html">
          <span class="kicker">${cat.emoji} ${catDisplay}</span>
          <h3>${escapeHtml(a.title)}</h3>
          <span class="meta">${country.flag} ${country.short}</span>
        </a>
      </article>`).join('\n');

  const canonical = `${SITE}/${country.cc}/${cat.slug}/${article.slug}.html`;
  const hreflangs = hreflangsFor(c => `/${c.cc}/${cat.slug}/${article.slug}.html`);

  const articleSchema = {
    "@context":"https://schema.org",
    "@type":"NewsArticle",
    "headline": article.title,
    "description": shortDesc,
    "author":{"@type":"Organization","name":`${BRAND} Editorial Board`,"url":`${SITE}/about.html`},
    "publisher":{"@type":"Organization","name":BRAND,"logo":{"@type":"ImageObject","url":`${SITE}/assets/og-default.svg`}},
    "datePublished":"2026-04-01",
    "dateModified":"2026-04-22",
    "inLanguage":"en",
    "mainEntityOfPage":{"@type":"WebPage","@id":canonical},
    "about": country.name,
    "articleSection": cat.name,
    "keywords": `${cat.name}, ${country.short}, ${country.name}, editorial guide, ${BRAND}`,
    "image": [`${SITE}/assets/og-default.svg`]
  };
  const breadcrumbs = {
    "@context":"https://schema.org","@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"Home","item":`${SITE}/`},
      {"@type":"ListItem","position":2,"name":country.name,"item":`${SITE}/${country.cc}/`},
      {"@type":"ListItem","position":3,"name":catDisplay,"item":`${SITE}/${country.cc}/${cat.slug}/`},
      {"@type":"ListItem","position":4,"name":article.title,"item":canonical}
    ]
  };
  // FAQPage schema for article FAQ block
  const faqsForSchema = generateFaqs(article.title, country, cat);
  const faqSchema = {
    "@context":"https://schema.org","@type":"FAQPage",
    "mainEntity": faqsForSchema.map(f => ({
      "@type":"Question",
      "name": f.q,
      "acceptedAnswer":{"@type":"Answer","text":f.a}
    }))
  };

  return head({
    title, desc: shortDesc, canonical,
    ogType:'article', hreflangs,
    extra:
      `<script type="application/ld+json">${JSON.stringify(articleSchema)}</script>\n  ` +
      `<script type="application/ld+json">${JSON.stringify(breadcrumbs)}</script>\n  ` +
      `<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>`
  }) + `

<div class="read-progress"><span id="read-progress"></span></div>

${topStripCountry(country)}
${brandBar(`${country.short} · ${catDisplay}`)}

<section class="article-head">
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span class="sep">›</span>
      <a href="/${country.cc}/">${country.flag} ${country.short}</a><span class="sep">›</span>
      <a href="/${country.cc}/${cat.slug}/">${catDisplay}</a><span class="sep">›</span>
      <span>${escapeHtml(shortTrim(article.title, 38))}</span>
    </nav>
    <span class="eyebrow">${cat.emoji} ${catDisplay}</span>
    <h1>${escapeHtml(article.title)}</h1>
    <p class="deck">${escapeHtml(shortDesc)}</p>

    <div class="byline-row">
      <div class="avatar">AE</div>
      <div class="author">${BRAND} Editorial Board<small>Finance &amp; Lifestyle Desk · Global</small></div>
      <div class="meta">${country.flag} ${country.short} · Updated 22 Apr 2026 · 6 min read</div>
    </div>

    <div class="share-row">
      <span class="lbl">Share</span>
      <a class="share-btn" href="#" aria-label="Share on X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 4H22l-7.3 8.3L23 20h-6.5l-5.1-6.7L5.7 20H2.5l7.8-8.9L2 4h6.6l4.6 6.1L18.9 4z"/></svg></a>
      <a class="share-btn" href="#" aria-label="Share on LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5 2.5 2.5 0 0 1 4.98 3.5zM3 10h4v11H3V10zm7 0h3.8v1.5h.1c.5-1 1.9-2 3.9-2 4.2 0 5 2.7 5 6.3V21h-4v-4.7c0-1.1 0-2.6-1.6-2.6-1.6 0-1.8 1.2-1.8 2.5V21h-4V10z"/></svg></a>
      <a class="share-btn" href="#" aria-label="Share via email"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a>
    </div>
  </div>
</section>

<div class="container">
  <aside class="ad ad-leaderboard" aria-label="Advertisement">
    <div class="placeholder">Top leaderboard unit</div>
  </aside>
</div>

<section class="article-shell">
  <div class="container">
    <div class="layout-with-aside">
      <main class="article-body">
${bodyHtml}
      </main>
      <aside class="aside-sticky">
        <nav class="toc" aria-label="On this page">
          <span class="label">On this page</span>
          <ol>
${cat.sections.map((s,i) => `            <li><a href="#s${i+1}">${s}</a></li>`).join('\n')}
            <li><a href="#conclusion">Key takeaways</a></li>
          </ol>
        </nav>
        <aside class="ad ad-sidebar" style="margin-top:20px;" aria-label="Advertisement">
          <div class="placeholder">Sidebar ad</div>
        </aside>
      </aside>
    </div>
  </div>
</section>

<section class="related-strip">
  <div class="container">
    <div class="section-head"><h2>Continue reading in ${country.short}</h2><a class="link" href="/${country.cc}/${cat.slug}/">All ${catDisplay} →</a></div>
    <div class="article-grid">
${relatedCards}
    </div>
  </div>
</section>

${footer()}
`;
}

function articleDescription(title, country, cat) {
  const topic = extractTopicFromTitle(title).toLowerCase();
  const cleanTitle = title.replace(/\{C\}/g, country.short);
  const meta = `${cleanTitle} — a practical ${cat.name.toLowerCase()} guide for readers in ${country.short}. Compare options, avoid common mistakes, and make calmer decisions with ${BRAND}.`;
  return meta.slice(0, 158);
}

function articleBody(title, country, cat) {
  const topic = extractTopicFromTitle(title).toLowerCase();
  const catLower = cat.name.toLowerCase();

  // Extended intro — 2 paragraphs
  const intro = `<p><strong>${title}</strong> is one of those ${catLower} topics that looks simple on the surface and turns tricky once you actually sit down to decide. This guide walks you through it calmly, with a framework we've used across our ${catLower} coverage in ${country.short} and 21 other countries. No guaranteed outcomes. No urgency tricks. Just an editorial breakdown you can trust, revisit, and share.</p>

<p>Throughout this article, we'll use the same structure we apply to every ${BRAND} guide: what matters most before you begin, what to compare, where people typically slip up, a printable checklist, and a local angle specific to ${country.short}. If you're new to the topic, read top to bottom. If you already have a shortlist, jump to the comparison section via the table of contents on the right.</p>

<p>${BRAND} is an independent multi-country editorial publisher. We don't issue credit, we don't sell products, and we don't earn commissions from any decision you make. That independence is what makes the framework below worth reading — we have no incentive to tilt the advice toward any particular provider, bank, or vendor in ${country.short}.</p>`;

  // Sections — each gets 3 paragraphs (intro bank, extra paragraph, a practical note)
  const sections = cat.sections.map((sname, i) => {
    const bank = SECTION_BANKS[sname] || SECTION_BANKS['Why this matters'];
    const para1 = bank.replace(/\{C\}/g, country.short);
    const para2 = sectionExtraParagraph(sname, title, country, cat);
    const para3 = sectionPracticalNote(sname, country, cat, i);
    return `<h2 id="s${i+1}">${sname}</h2>\n<p>${para1}</p>\n<p>${para2}</p>\n<p>${para3}</p>`;
  }).join('\n');

  // Mid-article in-content ad
  const inlineAd = `<aside class="ad ad-inline" aria-label="Advertisement"><div class="placeholder">In-content ad unit</div></aside>`;

  // Key takeaways block
  const takeaways = `<div class="takeaways" id="conclusion">
  <div class="label">Key takeaways</div>
  <h4>A short summary you can keep.</h4>
  <ul>
    <li>Define the decision you're making in one sentence before you begin.</li>
    <li>Compare at least three credible options before committing anything in ${country.short}.</li>
    <li>Read the fine print on cancellation, prepayment, or renewal terms.</li>
    <li>Budget with a buffer — not down to the last digit.</li>
    <li>When in doubt, slow down. ${ctaFor(cat.slug)}</li>
  </ul>
</div>`;

  // FAQ (each article gets 3 FAQs for rich snippet eligibility on article pages)
  const faqs = generateFaqs(title, country, cat);
  const faqHtml = `<h2 id="faq">Questions readers ask</h2>
${faqs.map(f => `<h3>${escapeHtml(f.q)}</h3>\n<p>${escapeHtml(f.a)}</p>`).join('\n')}`;

  // Guided check cross-link (in-site CTA)
  const cta = `<div class="callout">
  <div class="ic">▶</div>
  <div>
    <h4>Want a personalised starting point?</h4>
    <p>Our 60-second guided check adapts questions, currency and amount ranges to ${country.short}. It returns an editorial guide — not an approval — so you can compare calmly.</p>
    <p><a class="btn btn-ghost btn-sm" href="/guided-check.html?country=${country.cc.toUpperCase()}">Start guided check</a></p>
  </div>
</div>`;

  // Final editorial note
  const editorNote = `<div class="editor-note">
  <div class="label">Editor's note</div>
  <p>${BRAND} reviews this guide at least twice a year. Numbers, ranges and product characteristics described here are illustrative at the time of publication and may differ from current offers in ${country.short}. Always verify with the provider before making a decision. See our <a href="/about.html">editorial methodology</a> for how we review guides.</p>
</div>`;

  return `${intro}\n${sections}\n${inlineAd}\n${takeaways}\n${faqHtml}\n${cta}\n${editorNote}`;
}

function sectionPracticalNote(sname, country, cat, i) {
  const pool = [
    `Readers in ${country.short} often return to the ${cat.name.toLowerCase()} topic months later with a clearer view. Save this article, come back to it, and notice which points have become more relevant to your situation. A decision made with 72 hours of reflection almost always beats one made under pressure.`,
    `If you're researching this in ${country.short} for the first time, resist the urge to act on day one. Spend two or three short sessions across a week reading, comparing and discussing with someone you trust. The best ${cat.name.toLowerCase()} decisions come from thinking, not speed.`,
    `A useful habit when working through ${cat.name.toLowerCase()} decisions in ${country.short}: write down the question you're actually trying to answer before you read anything else. That sentence becomes your compass when the internet sends you in six directions at once.`,
    `One detail that matters more in ${country.short} than most readers expect: small fees, quiet terms, and default settings add up across the life of a ${cat.name.toLowerCase()} decision. Scroll past them and you lose the power to compare.`,
    `Remember that ${cat.name.toLowerCase()} guides online — including this one — are starting points, not personalised advice. For big decisions in ${country.short}, pair the reading with a conversation with someone who knows your specific situation: a local professional, a more experienced friend, or a family member.`,
    `In our reader mailbag from ${country.short}, the most common regret with ${cat.name.toLowerCase()} choices is not the decision itself — it's not asking one extra question before committing. If you're about to sign something, ask one more. It rarely costs anything, and it sometimes saves a lot.`
  ];
  return pool[Math.abs(hashString(cat.slug + country.cc + String(i))) % pool.length];
}

function generateFaqs(title, country, cat) {
  const topic = extractTopicFromTitle(title);
  return [
    {
      q: `Is ${title} relevant for everyone in ${country.short}?`,
      a: `This guide is written for adult readers in ${country.short} who want a calmer, non-salesy starting point on ${cat.name.toLowerCase()}. Individual situations vary; use it as a framework rather than personalised advice.`
    },
    {
      q: `How often does ${BRAND} update ${cat.name.toLowerCase()} guides for ${country.short}?`,
      a: `Our ${cat.name.toLowerCase()} guides are reviewed at least twice a year, and immediately when a material change happens — a new regulation, a major market shift, or a significant product-category update relevant to ${country.short}.`
    },
    {
      q: `Does ${BRAND} earn money from the decisions I make after reading this guide?`,
      a: `No. ${BRAND} is funded by clearly labelled advertising (including Google AdSense). We do not originate credit, we do not operate a lending or broker panel, and we do not receive commissions from any individual decision you make in ${country.short}.`
    }
  ];
}

function sectionExtraParagraph(sname, title, country, cat) {
  const t = title.replace(/\{C\}/g, country.short);
  const pool = [
    `Readers in ${country.short} often tell us the hardest part of ${cat.name.toLowerCase()} decisions is knowing when to slow down. Use the framework above as a checklist you can return to — especially when you feel rushed or pressured.`,
    `If you're new to ${cat.name.toLowerCase()} in ${country.short}, start narrow. One clear decision made well beats five half-decisions made in parallel. Revisit this page after a week of reading — most choices look different with 72 hours of rest between shortlisting and committing.`,
    `The gap between a good and a great decision in ${country.short} is usually not information — it's patience. Ask yourself: what's the worst case if I wait one more week? If the answer is "nothing bad", that's often a signal to keep comparing.`,
    `Write down what "success" looks like before you start. One sentence. Revisit it halfway through. If your current shortlist in ${country.short} doesn't map to that sentence, your criteria have drifted — a normal thing, worth correcting.`,
    `Keep a short log of offers, prices and promises. When quotes change (they will in ${country.short} too), your notes become the evidence you need to push back or walk away without feeling guilty.`,
    `Useful tip from our reader mailbag: always ask for the all-in written quote before you agree to anything. In ${country.short}, the verbal number and the written number can differ by more than people expect — usually due to fees that are legal but unfamiliar.`,
  ];
  // Pick one pseudo-randomly based on title hash
  const idx = Math.abs(hashString(t + sname)) % pool.length;
  return pool[idx];
}

function extractTopicFromTitle(t) {
  return t.replace(/\{C\}/g,'').replace(/\d+/g,'').replace(/[^A-Za-z]+/g,' ').trim().split(' ').slice(0, 3).join(' ');
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return h;
}

function shortTrim(s, n) { return s.length > n ? s.slice(0, n-1) + '…' : s; }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s) { return escapeHtml(s); }

/* ---------- Sitemap ---------- */
// urls: [{ url, priority, changefreq, lastmod }]
function renderSitemap(urls) {
  const today = new Date().toISOString().slice(0,10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => {
  const pr = u.priority || '0.6';
  const cf = u.changefreq || 'monthly';
  const lm = u.lastmod || today;
  return `  <url>
    <loc>${SITE}${u.url}</loc>
    <lastmod>${lm}</lastmod>
    <changefreq>${cf}</changefreq>
    <priority>${pr}</priority>
  </url>`;
}).join('\n')}
</urlset>
`;
}

/* ---------- Write helpers ---------- */
function writeFile(relPath, content) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
}

/* ---------- MAIN ---------- */
function main() {
  const sitemapUrls = [];
  let pages = 0;

  // Homepage
  writeFile('index.html', renderHome());
  sitemapUrls.push({ url:'/', priority:'1.0', changefreq:'weekly' });
  pages++;

  for (const country of COUNTRIES) {
    // Country hub
    writeFile(`${country.cc}/index.html`, renderCountryHub(country));
    sitemapUrls.push({ url:`/${country.cc}/`, priority:'0.9', changefreq:'weekly' });
    pages++;

    for (const cat of CATEGORIES) {
      // Category page
      writeFile(`${country.cc}/${cat.slug}/index.html`, renderCategory(country, cat));
      sitemapUrls.push({ url:`/${country.cc}/${cat.slug}/`, priority:'0.8', changefreq:'weekly' });
      pages++;

      // Articles
      for (const t of cat.titles) {
        const realTitle = t.replace(/\{C\}/g, country.short);
        const slug = slugify(t.replace(/\s*in\s*\{C\}/gi,'').replace(/\{C\}/g,'').replace(/\s*from the?\s*$/i,'').replace(/\s*for\s*$/i,'').trim());
        writeFile(`${country.cc}/${cat.slug}/${slug}.html`,
          renderArticle(country, cat, { title: realTitle, slug }));
        sitemapUrls.push({ url:`/${country.cc}/${cat.slug}/${slug}.html`, priority:'0.6', changefreq:'monthly' });
        pages++;
      }
    }
  }

  // Static pages (included in sitemap so Google indexes them)
  const staticPages = [
    { url:'/about.html',                              priority:'0.7', changefreq:'monthly' },
    { url:'/contact.html',                            priority:'0.5', changefreq:'yearly' },
    { url:'/faq.html',                                priority:'0.6', changefreq:'monthly' },
    { url:'/guided-check.html',                       priority:'0.8', changefreq:'monthly' },
    { url:'/policies/privacy.html',                   priority:'0.4', changefreq:'yearly' },
    { url:'/policies/terms.html',                     priority:'0.4', changefreq:'yearly' },
    { url:'/policies/advertising-disclosure.html',    priority:'0.4', changefreq:'yearly' },
    { url:'/policies/cookies.html',                   priority:'0.4', changefreq:'yearly' }
  ];
  sitemapUrls.push(...staticPages);

  // Sitemap
  writeFile('sitemap.xml', renderSitemap(sitemapUrls));

  console.log(`Generated ${pages} generated pages + ${staticPages.length} static · sitemap with ${sitemapUrls.length} entries.`);
}

main();
