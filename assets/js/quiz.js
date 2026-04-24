/* =========================================================
   Arthlens — Guided Check (Quiz) logic
   5 steps + contextual insights + localStorage persistence
   Locale-aware: country name, currency, amount bands, bureau list
   ========================================================= */
(function () {
  'use strict';

  const STORE_KEY = 'arthlens.quiz';

  /* ---------- Step factory (built per locale) ---------- */
  function buildSteps(loc) {
    const country = loc.country;
    const countryPrep = loc.countryPrep;
    const bureauList = (loc.bureaus || []).slice(0, 3).join(', ');
    const bands = loc.bands;

    return [
      {
        id: 'credit',
        eyebrow: 'Step 1 of 5 · Profile',
        title: 'How would you describe your current credit profile?',
        lead: "There's no wrong answer. This shapes the categories you'll see next.",
        options: [
          { value: 'declined', label: "I've been declined before" },
          { value: 'limited',  label: 'Limited or no credit history' },
          { value: 'fair',     label: 'Fair credit profile' },
          { value: 'good',     label: 'Good credit profile' },
          { value: 'unsure',   label: "I'm not sure" }
        ],
        insights: {
          declined: `Previous declines don't close the door. Starter or secured products are commonly reviewed first to rebuild the file before reapplying.`,
          limited:  `Users with limited history often review starter or secured options before applying for higher-limit products.`,
          fair:     `A fair profile opens more doors than many realise — the key is comparing APR and fees carefully before choosing.`,
          good:     `Good profiles qualify for a wider selection ${countryPrep}. The decision often shifts from "can I qualify?" to "which product fits best?".`,
          unsure:   `Not knowing is common. A soft bureau check (free on ${bureauList}) clarifies your baseline before you apply anywhere.`
        }
      },
      {
        id: 'goal',
        eyebrow: 'Step 2 of 5 · Intent',
        title: 'What is your main goal right now?',
        lead: 'Goal clarity is the single biggest driver of a healthy application outcome.',
        options: [
          { value: 'build',     label: 'Build my credit profile' },
          { value: 'emergency', label: 'Get access to emergency funds' },
          { value: 'flex',      label: 'Improve monthly flexibility' },
          { value: 'cheaper',   label: 'Compare lower-cost borrowing options' },
          { value: 'exploring', label: "I'm just exploring" }
        ],
        insights: {
          build:     'Choosing the right product type first can reduce unnecessary applications and improve decision quality.',
          emergency: 'For emergency needs, total cost and speed matter more than limit size. Personal loans typically disburse faster than card approvals.',
          flex:      'Monthly flexibility usually points toward revolving credit — but watch the effective interest rate if you carry balances.',
          cheaper:   'Users focused on cost should compare APR, processing fees, and prepayment terms — not just the headline rate.',
          exploring: `Exploring first is a healthy habit ${countryPrep}. Every application creates a footprint; research saves you from unnecessary ones.`
        }
      },
      {
        id: 'amount',
        eyebrow: 'Step 3 of 5 · Access',
        title: `How much access would be most useful to you right now?`,
        lead: `Amounts shown ${countryPrep} · ${loc.currency}. The right figure depends on need, affordability and documentation.`,
        options: [
          { value: 'lt50',     label: bands.lt50 },
          { value: '50-200',   label: bands['50-200'] },
          { value: '200-1000', label: bands['200-1000'] },
          { value: 'gt1000',   label: bands.gt1000 }
        ],
        insights: {
          lt50:       `Smaller amounts (${bands.lt50.toLowerCase()}) are often easier to qualify for and are useful for credit-building — especially on entry-level cards.`,
          '50-200':   `This bracket is the most common for personal loans ${countryPrep}. Documentation requirements rise sharply at the upper end.`,
          '200-1000': `Mid-ticket amounts typically require income proof, tax filings, and a cleaner bureau history. Comparing at least 3 lenders is wise.`,
          gt1000:     `Higher-ticket needs often benefit from secured borrowing — the interest difference can be significant over the loan term.`
        }
      },
      {
        id: 'employment',
        eyebrow: 'Step 4 of 5 · Income',
        title: 'What best describes your current employment situation?',
        lead: 'Different issuers and lenders assess income stability and supporting documents differently.',
        options: [
          { value: 'salaried',  label: 'Salaried' },
          { value: 'self',      label: 'Self-employed' },
          { value: 'freelance', label: 'Freelancer' },
          { value: 'student',   label: 'Student' },
          { value: 'between',   label: 'Between jobs' }
        ],
        insights: {
          salaried:  'Salaried applicants typically need 3 months of pay slips and 6 months of bank statements. Employer category can influence pricing.',
          self:      `Self-employed applicants usually need 2 years of tax returns, business registration proof, and recent bank statements ${countryPrep}.`,
          freelance: 'Freelancers often benefit from showing consistent 12-month inflow patterns rather than peak months.',
          student:   `Students typically review secured cards backed by a fixed deposit or add-on cards from a parent's primary account.`,
          between:   'If between jobs, most lenders prefer a short waiting period after confirmation of new employment before you apply.'
        }
      }
    ];
  }

  /* ---------- Elements ---------- */
  const root      = document.getElementById('quiz-root');
  const progress  = document.getElementById('quiz-progress');
  const stepLabel = document.getElementById('step-label');
  if (!root) return;

  /* ---------- State ---------- */
  let state = loadState();
  let stepIndex = Math.min(state.stepIndex || 0, Infinity);
  let STEPS = null;
  let LOC   = null;

  /* ---------- Boot: wait for locale, then render ---------- */
  const i18n = (window.Arthlens && window.Arthlens.i18n);
  if (i18n) {
    i18n.ready().then(loc => {
      LOC = loc;
      STEPS = buildSteps(loc);
      stepIndex = Math.min(state.stepIndex || 0, STEPS.length);
      render();
    });
    document.addEventListener('arthlens:i18n-ready', (e) => {
      LOC = e.detail;
      STEPS = buildSteps(LOC);
      render();
    });
  } else {
    // Fallback to a minimal hard-coded India locale if i18n.js is missing
    LOC = {
      country:'India', countryPrep:'in India', currency:'INR', symbol:'₹',
      bands:{ lt50:'Under ₹50,000', '50-200':'₹50,000 – ₹200,000', '200-1000':'₹200,000 – ₹1,000,000', gt1000:'Above ₹1,000,000' },
      bureaus:['CIBIL','Experian','CRIF High Mark']
    };
    STEPS = buildSteps(LOC);
    stepIndex = Math.min(state.stepIndex || 0, STEPS.length);
    render();
  }

  function render() {
    if (!STEPS) return;
    updateProgress();
    root.innerHTML = '';
    if (stepIndex < STEPS.length) renderStep(STEPS[stepIndex]);
    else renderContact();
  }

  function updateProgress() {
    const total = (STEPS ? STEPS.length : 4) + 1;
    const pct = Math.min(100, Math.round((stepIndex / total) * 100));
    if (progress) progress.style.width = pct + '%';
    if (stepLabel) stepLabel.textContent = `Step ${Math.min(stepIndex + 1, total)} of ${total}`;
  }

  function renderStep(step) {
    const saved = state.answers[step.id] || '';
    const card = document.createElement('section');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div class="step-counter">${step.eyebrow}</div>
      <h1>${step.title}</h1>
      <p class="lead">${step.lead}</p>
      <div class="option-group" role="radiogroup" aria-label="${step.title}">
        ${step.options.map((opt) => `
          <label class="option">
            <input type="radio" name="${step.id}" value="${opt.value}" ${saved === opt.value ? 'checked' : ''}>
            <span class="radio" aria-hidden="true"></span>
            <span class="text">${opt.label}</span>
          </label>
        `).join('')}
      </div>
      <div id="insight-holder"></div>
      <div class="quiz-actions">
        <button class="btn btn-link back" type="button" ${stepIndex === 0 ? 'disabled style="visibility:hidden"' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          Back
        </button>
        <button class="btn btn-accent next" type="button" disabled>
          Continue
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    `;
    root.appendChild(card);

    const inputs  = card.querySelectorAll('input[type="radio"]');
    const nextBtn = card.querySelector('.next');
    const backBtn = card.querySelector('.back');
    const holder  = card.querySelector('#insight-holder');

    if (saved) {
      nextBtn.disabled = false;
      showInsight(holder, step.insights[saved]);
    }
    inputs.forEach((input) => {
      input.addEventListener('change', () => {
        state.answers[step.id] = input.value;
        saveState();
        nextBtn.disabled = false;
        showInsight(holder, step.insights[input.value]);
      });
    });
    nextBtn.addEventListener('click', advance);
    backBtn.addEventListener('click', retreat);
  }

  function showInsight(holder, text) {
    if (!text) return;
    holder.innerHTML = `
      <div class="insight" role="status">
        <div class="ico" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8 5.8 21.3l2.4-7.4L2 9.4h7.6z"/></svg>
        </div>
        <div><h4>Context</h4><p>${text}</p></div>
      </div>
    `;
  }

  function renderContact() {
    const country = (LOC && LOC.country) || 'your market';
    const card = document.createElement('section');
    card.className = 'quiz-card';
    card.innerHTML = `
      <div class="step-counter">Step 5 of 5 · Save</div>
      <h1>Your personalised guide is almost ready</h1>
      <p class="lead">Save your results so you can revisit them and receive educational comparison content focused on ${country}. No obligation — unsubscribe anytime.</p>
      <form id="contact-form" novalidate>
        <div class="contact-grid">
          <div class="field">
            <label for="q-name">Full name</label>
            <input id="q-name" name="name" type="text" required autocomplete="name" value="${escapeHtml(state.contact.name || '')}">
          </div>
          <div class="field">
            <label for="q-email">Email address</label>
            <input id="q-email" name="email" type="email" required autocomplete="email" value="${escapeHtml(state.contact.email || '')}">
          </div>
        </div>
        <label class="check">
          <input type="checkbox" name="consent" required ${state.contact.consent ? 'checked' : ''}>
          <span>I agree to receive personalised educational updates and comparison content related to loans and credit cards in ${country}. I can unsubscribe at any time.</span>
        </label>
        <div class="secure-strip">
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> TLS encrypted</span>
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l3 2"/></svg> Less than 60 seconds</span>
          <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6z"/></svg> Focused on ${country}</span>
        </div>
        <div class="quiz-actions">
          <button class="btn btn-link back" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <button class="btn btn-accent" type="submit">
            Reveal My Guide
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </form>
    `;
    root.appendChild(card);

    card.querySelector('.back').addEventListener('click', retreat);
    card.querySelector('#contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const name = (fd.get('name') || '').toString().trim();
      const email = (fd.get('email') || '').toString().trim();
      const consent = !!fd.get('consent');
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !consent) {
        alert('Please complete all fields and accept the consent notice to continue.');
        return;
      }
      state.contact = { name, email, consent };
      state.completedAt = Date.now();
      state.locale = LOC ? { cc: LOC.cc, country: LOC.country, currency: LOC.currency } : null;
      saveState();
      // TODO: POST to your backend/endpoint here
      showLoading();
      setTimeout(() => { window.location.href = 'results.html'; }, 1400);
    });
  }

  function showLoading() {
    const country = (LOC && LOC.country) || 'your market';
    root.innerHTML = `
      <section class="quiz-card" aria-live="polite">
        <div class="quiz-loading">
          <div class="spinner" aria-hidden="true"></div>
          <h2 style="font-size:1.25rem;text-align:center;">Reviewing your responses…</h2>
          <p>Analysing pathways commonly reviewed by users with a similar profile ${country === 'your market' ? '' : 'in ' + country}. This takes a few seconds.</p>
        </div>
      </section>
    `;
  }

  function advance() {
    stepIndex++;
    state.stepIndex = stepIndex;
    if (stepIndex === STEPS.length) {
      root.innerHTML = `
        <section class="quiz-card" aria-live="polite">
          <div class="quiz-loading">
            <div class="spinner" aria-hidden="true"></div>
            <h2 style="font-size:1.25rem;text-align:center;">Matching your responses…</h2>
            <p>Finding categories commonly reviewed by users with a similar profile.</p>
          </div>
        </section>
      `;
      saveState();
      setTimeout(render, 1300);
      return;
    }
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function retreat() {
    if (stepIndex === 0) return;
    stepIndex--;
    state.stepIndex = stepIndex;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- State helpers ---------- */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { stepIndex: 0, answers: {}, contact: {}, completedAt: null };
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
})();
