const toggle = document.querySelector('.menu-button');
const menu = document.querySelector('.main-nav');
const topbar = document.querySelector('.topbar');
const tiltCard = document.querySelector('[data-tilt]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('mobile-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? '×' : '☰';
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('mobile-open');
  toggle?.setAttribute('aria-expanded', 'false');
  if (toggle) toggle.textContent = '☰';
}));

const updateHeader = () => topbar?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealTargets = document.querySelectorAll('.section-heading, .solution-card, .feature-visual, .feature-copy, .contact-intro, .contact-form');
revealTargets.forEach((element) => element.classList.add('reveal'));

if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealTargets.forEach((element) => observer.observe(element));
} else {
  revealTargets.forEach((element) => element.classList.add('visible'));
}

if (tiltCard && !reducedMotion) {
  tiltCard.addEventListener('pointermove', (event) => {
    const rect = tiltCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltCard.style.setProperty('--tilt-x', String(x * 4.5));
    tiltCard.style.setProperty('--tilt-y', String(y * -4.5));
    tiltCard.style.setProperty('--move-x', String(x * -10));
    tiltCard.style.setProperty('--move-y', String(y * -10));
  });

  tiltCard.addEventListener('pointerleave', () => {
    ['--tilt-x', '--tilt-y', '--move-x', '--move-y'].forEach((property) => tiltCard.style.setProperty(property, '0'));
  });
}
