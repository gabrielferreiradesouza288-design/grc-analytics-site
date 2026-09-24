document.documentElement.classList.add('js');
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
    if (entry.isIntersecting) {
      entry.target.classList.add('visible'); observer.unobserve(entry.target);
      setTimeout(() => entry.target.classList.add('settled'), 1400);
      entry.target.querySelectorAll('[data-count]').forEach(countUp);
    }
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
  if (!motion.matches) {
    const slide = slides[index];
    slide.classList.remove('animate'); void slide.offsetWidth; slide.classList.add('animate');
    slide.querySelectorAll('[data-count]').forEach(countUp);
  }
  restartTabTimer();
}
function restartTabTimer() {
  const bar = tabs[current].querySelector('.tab-progress');
  if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
}
function updateTimer() {
  clearInterval(timer);
  pause.textContent = paused ? '▷' : 'Ⅱ';
  pause.setAttribute('aria-label', paused ? 'Iniciar alternância automática' : 'Pausar alternância automática');
  const running = !paused && !hovering && !document.hidden && !carousel.contains(document.activeElement);
  carousel.classList.toggle('autoplay', running);
  if (running) {
    restartTabTimer();
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

// ===== v2: movimento e acabamento =====
function countUp(el) {
  if (motion.matches) return;
  const target = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || '0', 10);
  const prefix = el.dataset.prefix || '', suffix = el.dataset.suffix || '';
  const fmt = n => prefix + n.toLocaleString('pt-BR', {minimumFractionDigits: dec, maximumFractionDigits: dec}) + suffix;
  const start = performance.now(), duration = 1400;
  cancelAnimationFrame(el._raf);
  const tick = now => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = fmt(target * eased);
    if (t < 1) el._raf = requestAnimationFrame(tick);
  };
  el._raf = requestAnimationFrame(tick);
}

// Entrada da página
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('loaded')));

// Topbar, barra de progresso e link ativo
const topbar = document.querySelector('.topbar');
const progress = document.querySelector('.scroll-progress');
const navLinks = [...menu.querySelectorAll('a')];
const indicator = menu.querySelector('.nav-indicator');
const sectionsById = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
function moveIndicator(link) {
  if (!indicator) return;
  if (!link) { indicator.style.setProperty('--o', 0); return; }
  indicator.style.setProperty('--x', `${link.offsetLeft}px`);
  indicator.style.setProperty('--w', `${link.offsetWidth}px`);
  indicator.style.setProperty('--o', 1);
}
let ticking = false;
function onScroll() {
  ticking = false;
  const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
  topbar.classList.toggle('scrolled', y > 40);
  progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
  document.querySelector('.whats-float')?.classList.toggle('show', y > innerHeight * .6);
  let active = null;
  sectionsById.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * .4) active = navLinks[i]; });
  navLinks.forEach(a => a.classList.toggle('current', a === active));
  moveIndicator(active);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, {passive: true});
addEventListener('resize', onScroll);
onScroll();

// Luz que segue o cursor no hero + inclinação 3D do dashboard
const hero = document.querySelector('.hero');
const stage = document.querySelector('.dashboard-stage');
if (finePointer.matches && !motion.matches) {
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--gx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
  const art = document.querySelector('.hero-art');
  art.addEventListener('pointermove', e => {
    const r = stage.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    stage.style.setProperty('--ry', `${(px - .5) * 7}deg`);
    stage.style.setProperty('--rx', `${(.5 - py) * 6}deg`);
    stage.style.setProperty('--sx', `${px * 100}%`);
    stage.style.setProperty('--sy', `${py * 100}%`);
  });
  art.addEventListener('pointerleave', () => { stage.style.setProperty('--rx', '0deg'); stage.style.setProperty('--ry', '0deg'); });

  // Inclinação sutil nos cartões
  document.querySelectorAll('.solution-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 6}deg`);
      card.style.setProperty('--rx', `${(.5 - (e.clientY - r.top) / r.height) * 6}deg`);
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg'); });
  });

  // Botões magnéticos
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3 - 2}px)`;
    });
    btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
  });
}

// Máscara do telefone
const phone = form.querySelector('[name="telefone"]');
if (phone) phone.addEventListener('input', () => {
  const d = phone.value.replace(/\D/g, '').slice(0, 11);
  phone.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
    : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    : d.length > 2 ? d.replace(/(\d{2})(\d{0,5})/, '($1) $2')
    : d.replace(/(\d{0,2})/, d ? '($1' : '');
});

// Fundo animado em toda a página: rede de dados com pulsos e parallax
(function backgroundNetwork() {
  const canvas = document.querySelector('.bg-canvas');
  if (!canvas || motion.matches) return;
  const ctx = canvas.getContext('2d');
  const small = matchMedia('(max-width: 850px)').matches;
  const frameGap = small ? 1000 / 30 : 0;
  const linkDist = small ? 110 : 150;
  let w, h, dpr, points = [], pulses = [], raf, last = 0, lastW = 0;
  const pointer = {x: -999, y: -999};
  function resize(force) {
    const nw = innerWidth, nh = innerHeight;
    if (!force && nw === lastW && Math.abs(nh - h) < 150) return; // evita recalcular com a barra do celular
    lastW = nw; w = nw; h = nh;
    dpr = Math.min(devicePixelRatio || 1, small ? 1.5 : 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.max(26, Math.min(small ? 38 : 80, w * h / 17000)));
    points = Array.from({length: count}, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
      z: Math.random() * .8 + .2, r: Math.random() * 1.3 + .5
    }));
  }
  function spawnPulse(list) {
    if (pulses.length > (small ? 3 : 6) || !list.length) return;
    const [a, b] = list[(Math.random() * list.length) | 0];
    pulses.push({a, b, t: 0, s: .012 + Math.random() * .01});
  }
  function draw(now) {
    raf = requestAnimationFrame(draw);
    if (frameGap && now - last < frameGap) return;
    last = now;
    ctx.clearRect(0, 0, w, h);
    const scroll = scrollY;
    const pos = points.map(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
      let y = (p.y - scroll * p.z * .12) % (h + 40); if (y < -20) y += h + 40;
      return {x: p.x, y, z: p.z, r: p.r};
    });
    const links = [];
    for (let i = 0; i < pos.length; i++) {
      const a = pos[i];
      for (let j = i + 1; j < pos.length; j++) {
        const b = pos[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          const alpha = (1 - d / linkDist) * .2 * Math.min(a.z, b.z) * 1.4;
          ctx.strokeStyle = `rgba(46,215,209,${alpha})`; ctx.lineWidth = .7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          links.push([i, j]);
        }
      }
      const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
      if (pd < 180) { ctx.strokeStyle = `rgba(46,215,209,${(1 - pd / 180) * .5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke(); }
      ctx.fillStyle = `rgba(46,215,209,${.35 + a.z * .55})`;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r * (.6 + a.z * .6), 0, 6.283); ctx.fill();
    }
    if (Math.random() < (small ? .03 : .06)) spawnPulse(links);
    pulses = pulses.filter(p => {
      p.t += p.s;
      const a = pos[p.a], b = pos[p.b];
      if (p.t >= 1 || Math.hypot(a.x - b.x, a.y - b.y) > linkDist * 1.2) return false;
      const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
      const g = ctx.createRadialGradient(x, y, 0, x, y, 8);
      g.addColorStop(0, 'rgba(159,245,240,.95)'); g.addColorStop(1, 'rgba(46,215,209,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 8, 0, 6.283); ctx.fill();
      return true;
    });
  }
  resize(true); raf = requestAnimationFrame(draw);
  addEventListener('resize', () => resize(false));
  addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, {passive: true});
  addEventListener('pointerdown', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, {passive: true});
  document.addEventListener('pointerleave', () => { pointer.x = pointer.y = -999; });
  addEventListener('touchend', () => setTimeout(() => { pointer.x = pointer.y = -999; }, 600), {passive: true});
  document.addEventListener('visibilitychange', () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(draw); });
})();
