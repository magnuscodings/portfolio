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
