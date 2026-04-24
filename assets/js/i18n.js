/* =========================================================
   Arthlens — i18n & geo-localisation
   Detects country via IP, maps to locale (language, currency,
   amount bands, country name), caches in localStorage.

   Fallback chain:
   1. ?country=XX URL param (testing / override)
   2. localStorage cache (6h TTL)
   3. IP geo APIs (ipapi.co → geojs.io → ipwho.is)
   4. navigator.language country suffix
   5. Default: India
   ========================================================= */
(function (root) {
  'use strict';

  /* ---------- Locale registry ---------- */
  // Add more locales by copying any block and adjusting the fields.
  const LOCALES = {
    IN: {
      country: 'India', countryPrep: 'in India',
      lang: 'en-IN', currency: 'INR', symbol: '₹',
      bands: {
        lt50:       'Under ₹50,000',
        '50-200':   '₹50,000 – ₹200,000',
        '200-1000': '₹200,000 – ₹1,000,000',
        gt1000:     'Above ₹1,000,000'
      },
      bureaus: ['CIBIL', 'Experian', 'CRIF High Mark', 'Equifax']
    },
    US: {
      country: 'the United States', countryPrep: 'in the United States',
      lang: 'en-US', currency: 'USD', symbol: '$',
      bands: {
        lt50:       'Under $1,000',
        '50-200':   '$1,000 – $5,000',
        '200-1000': '$5,000 – $25,000',
        gt1000:     'Above $25,000'
      },
      bureaus: ['Experian', 'Equifax', 'TransUnion']
    },
    BR: {
      country: 'o Brasil', countryPrep: 'no Brasil',
      lang: 'pt-BR', currency: 'BRL', symbol: 'R$',
      bands: {
        lt50:       'Até R$ 2.000',
        '50-200':   'R$ 2.000 – R$ 10.000',
        '200-1000': 'R$ 10.000 – R$ 50.000',
        gt1000:     'Acima de R$ 50.000'
      },
      bureaus: ['Serasa', 'SPC Brasil', 'Boa Vista']
    },
    MX: {
      country: 'México', countryPrep: 'en México',
      lang: 'es-MX', currency: 'MXN', symbol: '$',
      bands: {
        lt50:       'Menos de $5,000',
        '50-200':   '$5,000 – $25,000',
        '200-1000': '$25,000 – $150,000',
        gt1000:     'Más de $150,000'
      },
      bureaus: ['Buró de Crédito', 'Círculo de Crédito']
    },
    GB: {
      country: 'the United Kingdom', countryPrep: 'in the UK',
      lang: 'en-GB', currency: 'GBP', symbol: '£',
      bands: {
        lt50:       'Under £500',
        '50-200':   '£500 – £2,500',
        '200-1000': '£2,500 – £15,000',
        gt1000:     'Above £15,000'
      },
      bureaus: ['Experian', 'Equifax', 'TransUnion']
    },
    CA: {
      country: 'Canada', countryPrep: 'in Canada',
      lang: 'en-CA', currency: 'CAD', symbol: 'C$',
      bands: {
        lt50:       'Under C$1,000',
        '50-200':   'C$1,000 – C$5,000',
        '200-1000': 'C$5,000 – C$25,000',
        gt1000:     'Above C$25,000'
      },
      bureaus: ['Equifax Canada', 'TransUnion Canada']
    },
    AU: {
      country: 'Australia', countryPrep: 'in Australia',
      lang: 'en-AU', currency: 'AUD', symbol: 'A$',
      bands: {
        lt50:       'Under A$1,000',
        '50-200':   'A$1,000 – A$5,000',
        '200-1000': 'A$5,000 – A$25,000',
        gt1000:     'Above A$25,000'
      },
      bureaus: ['Equifax', 'Experian', 'illion']
    },
    ES: {
      country: 'España', countryPrep: 'en España',
      lang: 'es-ES', currency: 'EUR', symbol: '€',
      bands: {
        lt50:       'Menos de 500 €',
        '50-200':   '500 € – 2.500 €',
        '200-1000': '2.500 € – 15.000 €',
        gt1000:     'Más de 15.000 €'
      },
      bureaus: ['ASNEF', 'Experian España']
    },
    PT: {
      country: 'Portugal', countryPrep: 'em Portugal',
      lang: 'pt-PT', currency: 'EUR', symbol: '€',
      bands: {
        lt50:       'Até 500 €',
        '50-200':   '500 € – 2.500 €',
        '200-1000': '2.500 € – 15.000 €',
        gt1000:     'Acima de 15.000 €'
      },
      bureaus: ['Banco de Portugal · CRC']
    },
    DE: {
      country: 'Germany', countryPrep: 'in Germany',
      lang: 'de-DE', currency: 'EUR', symbol: '€',
      bands: {
        lt50:       'Under €500',
        '50-200':   '€500 – €2,500',
        '200-1000': '€2,500 – €15,000',
        gt1000:     'Above €15,000'
      },
      bureaus: ['SCHUFA', 'Creditreform']
    },
    FR: {
      country: 'France', countryPrep: 'in France',
      lang: 'fr-FR', currency: 'EUR', symbol: '€',
      bands: {
        lt50:       'Under €500',
        '50-200':   '€500 – €2,500',
        '200-1000': '€2,500 – €15,000',
        gt1000:     'Above €15,000'
      },
      bureaus: ['Banque de France · FICP']
    },
    NG: {
      country: 'Nigeria', countryPrep: 'in Nigeria',
      lang: 'en-NG', currency: 'NGN', symbol: '₦',
      bands: {
        lt50:       'Under ₦500,000',
        '50-200':   '₦500,000 – ₦2,500,000',
        '200-1000': '₦2,500,000 – ₦15,000,000',
        gt1000:     'Above ₦15,000,000'
      },
      bureaus: ['CRC Credit Bureau', 'First Central', 'CreditRegistry']
    },
    ZA: {
      country: 'South Africa', countryPrep: 'in South Africa',
      lang: 'en-ZA', currency: 'ZAR', symbol: 'R',
      bands: {
        lt50:       'Under R10,000',
        '50-200':   'R10,000 – R50,000',
        '200-1000': 'R50,000 – R250,000',
        gt1000:     'Above R250,000'
      },
      bureaus: ['TransUnion', 'Experian', 'Compuscan', 'XDS']
    },
    PH: {
      country: 'the Philippines', countryPrep: 'in the Philippines',
      lang: 'en-PH', currency: 'PHP', symbol: '₱',
      bands: {
        lt50:       'Under ₱25,000',
        '50-200':   '₱25,000 – ₱100,000',
        '200-1000': '₱100,000 – ₱500,000',
        gt1000:     'Above ₱500,000'
      },
      bureaus: ['CIC', 'CIBI', 'CRIF Philippines']
    }
  };

  const DEFAULT_CC = 'IN';
  const CACHE_KEY = 'arthlens.geo';
  const TTL_MS    = 6 * 60 * 60 * 1000; // 6 hours

  /* ---------- Public API ---------- */
  const i18n = {
    LOCALES,
    current: null,

    /** Resolve locale, firing callback when ready. Always returns a Promise. */
    async ready() {
      if (this.current) return this.current;
      const cc = await resolveCountry();
      this.current = LOCALES[cc] || LOCALES[DEFAULT_CC];
      this.current.cc = LOCALES[cc] ? cc : DEFAULT_CC;
      document.documentElement.setAttribute('data-country', this.current.cc);
      document.documentElement.setAttribute('data-currency', this.current.currency);
      document.dispatchEvent(new CustomEvent('arthlens:i18n-ready', { detail: this.current }));
      return this.current;
    },

    /** Override current locale (used by the manual switcher). */
    set(cc) {
      if (!LOCALES[cc]) return;
      writeCache(cc);
      this.current = Object.assign({ cc }, LOCALES[cc]);
      document.documentElement.setAttribute('data-country', cc);
      document.documentElement.setAttribute('data-currency', LOCALES[cc].currency);
      document.dispatchEvent(new CustomEvent('arthlens:i18n-ready', { detail: this.current }));
    },

    /** Format a number using the current locale. */
    fmt(n) {
      const loc = this.current || LOCALES[DEFAULT_CC];
      try {
        return new Intl.NumberFormat(loc.lang, { style: 'currency', currency: loc.currency, maximumFractionDigits: 0 }).format(n);
      } catch (_) {
        return loc.symbol + n.toLocaleString();
      }
    }
  };

  /* ---------- Helpers ---------- */
  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { cc, at } = JSON.parse(raw);
      if (!cc || Date.now() - at > TTL_MS) return null;
      return cc;
    } catch (_) { return null; }
  }
  function writeCache(cc) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ cc, at: Date.now() })); } catch (_) {}
  }

  async function resolveCountry() {
    // 1. URL override
    const urlCC = new URLSearchParams(location.search).get('country');
    if (urlCC && LOCALES[urlCC.toUpperCase()]) {
      const cc = urlCC.toUpperCase();
      writeCache(cc);
      return cc;
    }
    // 2. Cache
    const cached = readCache();
    if (cached) return cached;
    // 3. IP geo APIs (parallel race)
    try {
      const cc = await raceGeoProviders();
      if (cc && LOCALES[cc]) { writeCache(cc); return cc; }
    } catch (_) {}
    // 4. navigator.language fallback
    try {
      const nav = (navigator.language || '').split('-').pop().toUpperCase();
      if (LOCALES[nav]) { writeCache(nav); return nav; }
    } catch (_) {}
    // 5. Default
    return DEFAULT_CC;
  }

  function raceGeoProviders() {
    const providers = [
      () => fetch('https://ipapi.co/json/', { cache: 'no-store' }).then(r => r.json()).then(d => d.country_code),
      () => fetch('https://get.geojs.io/v1/ip/country.json', { cache: 'no-store' }).then(r => r.json()).then(d => d.country),
      () => fetch('https://ipwho.is/?fields=country_code,success', { cache: 'no-store' }).then(r => r.json()).then(d => d.success ? d.country_code : null)
    ];
    return new Promise((resolve) => {
      let settled = false, pending = providers.length;
      const timer = setTimeout(() => { if (!settled) { settled = true; resolve(null); } }, 4000);
      providers.forEach(p => {
        Promise.resolve().then(p).then(cc => {
          if (settled) return;
          if (cc && typeof cc === 'string' && cc.length === 2) {
            settled = true; clearTimeout(timer); resolve(cc.toUpperCase());
          } else if (--pending === 0) {
            settled = true; clearTimeout(timer); resolve(null);
          }
        }).catch(() => {
          if (--pending === 0 && !settled) { settled = true; clearTimeout(timer); resolve(null); }
        });
      });
    });
  }

  root.Arthlens = root.Arthlens || {};
  root.Arthlens.i18n = i18n;

  // Auto-resolve on load (non-blocking)
  i18n.ready();
})(window);
