const toggle = document.querySelector('.menu-button');
const menu = document.querySelector('.main-nav');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const closeMenu = () => {
  menu.classList.remove('mobile-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Abrir menu');
  toggle.textContent = '☰';
};
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('mobile-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  toggle.textContent = open ? '×' : '☰';
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('mobile-open')) { closeMenu(); toggle.focus(); }
});
window.matchMedia('(min-width: 851px)').addEventListener('change', closeMenu);
const revealTargets = document.querySelectorAll('.section-heading, .solution-card, .feature-copy, .contact-intro, .contact-form');
if ('IntersectionObserver' in window && !motion.matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .08});
  revealTargets.forEach(element => { element.classList.add('reveal'); observer.observe(element); });
}
const carousel = document.querySelector('.hero-art');
const slides = [...document.querySelectorAll('.dash-window')];
const tabs = [...document.querySelectorAll('[data-slide]')];
const pause = document.querySelector('.pause-button');
let current = 0, paused = motion.matches, timer, hovering = false;
function showSlide(index) {
  current = index;
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
    slide.setAttribute('aria-hidden', String(i !== index));
    slide.inert = i !== index;
    tabs[i].setAttribute('aria-pressed', String(i === index));
  });
  document.querySelector('#slide-count').textContent = `0${index + 1} / 03`;
}
function updateTimer() {
  clearInterval(timer);
  pause.textContent = paused ? '▷' : 'Ⅱ';
  pause.setAttribute('aria-label', paused ? 'Iniciar alternância automática' : 'Pausar alternância automática');
  if (!paused && !hovering && !document.hidden && !carousel.contains(document.activeElement)) {
    timer = setInterval(() => showSlide((current + 1) % slides.length), 6500);
  }
}
tabs.forEach((tab, i) => tab.addEventListener('click', () => { showSlide(i); paused = true; updateTimer(); }));
pause.addEventListener('click', () => { paused = !paused; updateTimer(); });
carousel.addEventListener('mouseenter', () => { hovering = true; updateTimer(); });
carousel.addEventListener('mouseleave', () => { hovering = false; updateTimer(); });
carousel.addEventListener('focusin', updateTimer);
carousel.addEventListener('focusout', () => setTimeout(updateTimer, 0));
document.addEventListener('visibilitychange', updateTimer);
motion.addEventListener('change', () => { paused = motion.matches; updateTimer(); });
showSlide(0); updateTimer();

// Keep the native POST as a fallback when JavaScript is unavailable.
const form = document.querySelector('.contact-form');
const status = form.querySelector('.form-status');
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity() || form.dataset.sending === 'true') return;
  if (form.elements._honey.value) return;
  const button = form.querySelector('[type="submit"]');
  const original = button.innerHTML;
  form.dataset.sending = 'true';
  button.disabled = true;
  button.textContent = 'Enviando…';
  status.classList.remove('error');
  status.textContent = 'Enviando sua mensagem com segurança…';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('https://formsubmit.co/ajax/gabrielferreiradesouza288@gmail.com', {
      method: 'POST', headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(Object.fromEntries(new FormData(form))), signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Submission rejected');
    status.textContent = 'Mensagem recebida pelo serviço de envio. Obrigado pelo contato!';
    form.reset();
  } catch (error) {
    status.classList.add('error');
    status.textContent = 'Não foi possível confirmar o envio. Seus dados foram mantidos. Você pode tentar novamente ou falar pelo WhatsApp (11) 97784-4753.';
  } finally {
    clearTimeout(timeout); delete form.dataset.sending; button.disabled = false; button.innerHTML = original;
  }
});

// Decorative sequences run on entry/interaction, then settle instead of looping forever.
const motionSurfaces = [...document.querySelectorAll('.solution-card, .feature-visual')];
const motionTimers = new WeakMap();
function playDetail(element) {
  if (motion.matches || document.hidden) return;
  clearTimeout(motionTimers.get(element));
  element.classList.remove('motion-playing');
  void element.offsetWidth;
  element.classList.add('motion-playing');
  motionTimers.set(element, setTimeout(() => element.classList.remove('motion-playing'), 8200));
}
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
motionSurfaces.forEach(element => {
  element.addEventListener('pointerenter', () => { if (finePointer.matches) playDetail(element); });
  element.addEventListener('focusin', () => playDetail(element));
  element.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') playDetail(element);
  });
  let frame;
  element.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches) return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      element.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      element.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    });
  });
});
if ('IntersectionObserver' in window) {
  const detailObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) playDetail(entry.target);
    else { clearTimeout(motionTimers.get(entry.target)); entry.target.classList.remove('motion-playing'); }
  }), {threshold:.35});
  motionSurfaces.forEach(element => detailObserver.observe(element));
}
const flowVisual = document.querySelector('.feature-visual');
const flowSteps = [...document.querySelectorAll('.feature-copy li')];
const signals = [...flowVisual.querySelectorAll('.signal')].map((signal, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = signal.className;
  button.textContent = signal.textContent;
  button.setAttribute('aria-label', flowSteps[index].textContent.trim());
  button.setAttribute('aria-pressed', 'false');
  flowSteps[index].id = `flow-step-${index + 1}`;
  button.setAttribute('aria-controls', flowSteps[index].id);
  signal.replaceWith(button);
  return button;
});
const svgNS = 'http://www.w3.org/2000/svg';
const flowLinks = document.createElementNS(svgNS, 'svg');
flowLinks.setAttribute('class', 'flow-links');
flowLinks.setAttribute('viewBox', '0 0 100 100');
flowLinks.setAttribute('aria-hidden', 'true');
flowLinks.setAttribute('focusable', 'false');
const linkLines = signals.map(() => {
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', '50'); line.setAttribute('y1', '50');
  flowLinks.append(line); return line;
});
flowVisual.prepend(flowLinks);
function positionFlowLinks() {
  const box = flowVisual.getBoundingClientRect();
  if (!box.width) return;
  signals.forEach((signal, index) => {
    const point = signal.getBoundingClientRect();
    linkLines[index].setAttribute('x2', ((point.left + point.width / 2 - box.left) / box.width * 100).toFixed(2));
    linkLines[index].setAttribute('y2', ((point.top + point.height / 2 - box.top) / box.height * 100).toFixed(2));
  });
}
if ('ResizeObserver' in window) new ResizeObserver(positionFlowLinks).observe(flowVisual);
else window.addEventListener('resize', positionFlowLinks);
positionFlowLinks();
signals.forEach((signal, index) => signal.addEventListener('click', () => {
  signals.forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
  flowSteps.forEach((item, i) => item.classList.toggle('flow-selected', i === index));
  linkLines.forEach((line, i) => line.classList.toggle('active', i === index));
  playDetail(flowVisual);
}));
function stopDetails() {
  motionSurfaces.forEach(element => { clearTimeout(motionTimers.get(element)); element.classList.remove('motion-playing'); });
}
motion.addEventListener('change', () => { if (motion.matches) stopDetails(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stopDetails(); });
