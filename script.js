const toggle = document.querySelector('.menu-button');
const menu = document.querySelector('.main-nav');

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
