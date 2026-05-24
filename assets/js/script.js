/* =============================================================
   Ephraim Daniel Villegas — Portfolio
   Minimal vanilla JS for interactivity.
   ============================================================= */

(() => {
  // -------- Sticky header border on scroll --------
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // -------- Portfolio filter --------
  const filterBtns = document.querySelectorAll('.work-filters button');
  const cards = document.querySelectorAll('.work-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const cat = card.dataset.category;
        card.classList.toggle('hidden', filter !== 'all' && cat !== filter);
      });
    });
  });

  // -------- Lightbox --------
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = lightbox.querySelector('img');
  const closeLightbox = () => lightbox.classList.remove('open');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.querySelector('img').src;
      lightboxImg.src = src;
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  // -------- Active nav link on scroll (top + bottom nav) --------
  const sections = document.querySelectorAll('section[id]');
  const desktopNavAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const setActive = () => {
    const y = window.scrollY + 120;
    let current = 'top';
    sections.forEach(s => {
      if (y >= s.offsetTop) current = s.id;
    });
    desktopNavAnchors.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--fg)' : '';
    });
    mobileNavLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();
})();


/* =============================================================
   Chat widget — guided lead-capture concierge.
   No backend, no dependencies: a scripted flow that qualifies
   the visitor and routes them to WhatsApp / email with a
   pre-filled project summary.
   ============================================================= */
(() => {
  const chat = document.getElementById('chat');
  if (!chat) return;

  const WA_NUMBER = '639948694871';
  const EMAIL = 'mr.ephraiel@gmail.com';
  const MESSENGER = 'https://m.me/eph.nyl';

  const launcher = document.getElementById('chatLauncher');
  const minBtn   = document.getElementById('chatMin');
  const body     = document.getElementById('chatBody');
  const replies  = document.getElementById('chatReplies');
  const form     = document.getElementById('chatForm');
  const input    = document.getElementById('chatInput');
  const nudge    = document.getElementById('chatNudge');
  const nudgeX   = document.getElementById('chatNudgeClose');

  // collected lead context
  const lead = { type: '', timeline: '', note: '' };
  let started = false;
  let nudgeTimer;

  // ---------- helpers ----------
  const scrollDown = () => { body.scrollTop = body.scrollHeight; };

  const addRow = (who, html) => {
    const row = document.createElement('div');
    row.className = `chat-row ${who}`;
    row.innerHTML = `<div class="chat-bubble">${html}</div>`;
    body.appendChild(row);
    scrollDown();
    return row;
  };

  const showTyping = () => {
    const row = document.createElement('div');
    row.className = 'chat-row bot';
    row.innerHTML = '<div class="chat-bubble chat-typing"><span></span><span></span><span></span></div>';
    body.appendChild(row);
    scrollDown();
    return row;
  };

  // Speak one or more bot messages in sequence (with a short "typing" pause),
  // then run `done`.
  const botSay = (messages, done) => {
    const queue = Array.isArray(messages) ? messages.slice() : [messages];
    const next = () => {
      if (!queue.length) { if (done) done(); return; }
      const msg = queue.shift();
      const typing = showTyping();
      setTimeout(() => {
        typing.remove();
        addRow('bot', msg);
        next();
      }, Math.min(900, 350 + msg.length * 12));
    };
    next();
  };

  const setReplies = (chips) => {
    replies.innerHTML = '';
    chips.forEach(chip => {
      const el = document.createElement(chip.href ? 'a' : 'button');
      el.className = `chat-chip ${chip.cls || ''}`.trim();
      el.innerHTML = chip.label;
      if (chip.href) {
        el.href = chip.href;
        el.target = '_blank';
        el.rel = 'noopener';
        el.addEventListener('click', () => { if (chip.onClick) chip.onClick(); });
      } else {
        el.type = 'button';
        el.addEventListener('click', () => chip.onClick && chip.onClick());
      }
      replies.appendChild(el);
    });
  };

  const clearReplies = () => { replies.innerHTML = ''; };

  // ---------- build the hand-off links ----------
  const summary = () => {
    let s = 'Hi Ephraim! 👋\n\n';
    if (lead.type)     s += `I'm interested in: ${lead.type}\n`;
    if (lead.timeline) s += `Timeline: ${lead.timeline}\n`;
    if (lead.note)     s += `Details: ${lead.note}\n`;
    s += '\nCan we chat about it?';
    return s;
  };
  const waLink    = () => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(summary())}`;
  const emailLink = () => `mailto:${EMAIL}?subject=${encodeURIComponent('Project Inquiry')}&body=${encodeURIComponent(summary())}`;

  // ---------- conversation flow ----------
  const askType = () => {
    botSay([
      "Hi there 👋 I'm Ephraim's assistant.",
      "I help businesses turn ideas into working web apps, stores, and systems. What are you looking to build?"
    ], () => {
      setReplies([
        { label: 'A web app',        onClick: () => pickType('a custom web app') },
        { label: 'E-commerce store', onClick: () => pickType('an e-commerce store') },
        { label: 'Custom system / MIS', onClick: () => pickType('a custom system / MIS') },
        { label: 'Automation',       onClick: () => pickType('workflow automation') },
        { label: 'A mobile app',     onClick: () => pickType('a mobile app') },
        { label: '💰 How much?',     cls: 'ghost', onClick: askedPricing },
        { label: 'Just exploring',   cls: 'ghost', onClick: exploring }
      ]);
    });
  };

  const pickType = (type) => {
    lead.type = type;
    clearReplies();
    addRow('user', type.charAt(0).toUpperCase() + type.slice(1));
    botSay([
      "Great choice — that's right in Ephraim's wheelhouse 🛠️",
      "Roughly when are you hoping to get started?"
    ], () => {
      setReplies([
        { label: 'ASAP 🚀',          onClick: () => pickTime('ASAP') },
        { label: 'In 1–2 months',    onClick: () => pickTime('In 1–2 months') },
        { label: 'Just planning ahead', cls: 'ghost', onClick: () => pickTime('Still planning') }
      ]);
    });
  };

  const pickTime = (time) => {
    lead.timeline = time;
    clearReplies();
    addRow('user', time);
    botSay([
      "Perfect, noted ✅",
      "The fastest way to get real answers (and a free quote) is a quick word with Ephraim directly. Want me to pass your details along?"
    ], handoff);
  };

  const exploring = () => {
    lead.type = 'just browsing for now';
    clearReplies();
    addRow('user', 'Just exploring');
    botSay([
      "No pressure at all 🙂 Feel free to look around.",
      "If something sparks an idea, drop it below or jump straight to Ephraim — he's quick to reply."
    ], handoff);
  };

  // pricing — explain the model (no fixed numbers), then route to a quote
  const pricing = () => {
    clearReplies();
    botSay([
      "Great question 💸 Ephraim keeps it simple — every project gets a <strong>fixed price</strong> after a quick chat, so no hourly surprises.",
      "How it works:<br>• Written scope + fixed quote within 24h<br>• 50% to start, 50% on launch<br>• Bigger projects split into 3–4 milestones<br>• Payment via GCash",
      "Tell Ephraim what you're building and he'll send an exact number — free, no obligation 👇"
    ], handoff);
  };

  const askedPricing = () => {
    clearReplies();
    addRow('user', 'How much does it cost?');
    pricing();
  };

  const handoff = () => {
    setReplies([
      { label: '<i class="bi bi-whatsapp"></i> Chat on WhatsApp', cls: 'cta wa', href: waLink(),
        onClick: () => addRow('bot', "Opening WhatsApp — talk soon! 🎉") },
      { label: '<i class="bi bi-messenger"></i> Messenger', cls: 'cta msg', href: MESSENGER,
        onClick: () => addRow('bot', "Opening Messenger — talk soon! 🎉") },
      { label: '<i class="bi bi-envelope"></i> Email instead', cls: 'cta', href: emailLink() },
      { label: 'See his work first', cls: 'ghost', onClick: seeWork }
    ]);
    input.placeholder = 'Or add a detail about your project…';
  };

  const seeWork = () => {
    close();
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  // free-text the visitor types at any point
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addRow('user', text.replace(/</g, '&lt;'));

    // pricing intent — answer with the model instead of just noting it
    if (/price|pricing|cost|how much|budget|rate|charge|quote|magkano|presyo|bayad|fee/i.test(text)) {
      pricing();
      return;
    }

    lead.note = lead.note ? `${lead.note} ${text}` : text;
    clearReplies();
    botSay("Thanks — I've noted that down. Send it straight to Ephraim?", handoff);
  });

  // ---------- open / close ----------
  const open = () => {
    chat.classList.add('open');
    launcher.setAttribute('aria-expanded', 'true');
    hideNudge();
    clearTimeout(nudgeTimer);
    if (!started) { started = true; askType(); }
    setTimeout(() => input.focus(), 300);
  };
  const close = () => {
    chat.classList.remove('open');
    launcher.setAttribute('aria-expanded', 'false');
  };
  const toggle = () => chat.classList.contains('open') ? close() : open();

  launcher.addEventListener('click', toggle);
  minBtn.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chat.classList.contains('open')) close();
  });

  // ---------- greeting nudge ----------
  const hideNudge = () => nudge.classList.remove('show');
  nudgeX.addEventListener('click', (e) => {
    e.stopPropagation();
    hideNudge();
    sessionStorage.setItem('chatNudgeDismissed', '1');
  });
  nudge.addEventListener('click', open);

  if (!sessionStorage.getItem('chatNudgeDismissed')) {
    nudgeTimer = setTimeout(() => {
      if (!chat.classList.contains('open')) nudge.classList.add('show');
    }, 3200);
  }
})();
