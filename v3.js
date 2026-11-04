// ===== v3: fluxo interativo, cortinas das fotos e parallax =====
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Fluxo "Seu fluxo, automatizado"
  const steps = [...document.querySelectorAll('.flow-board .step')];
  const detail = document.querySelector('#step-detail');
  const texts = [
    ['Coleta de informações', 'Dados de sistemas, portais, e-mails e documentos capturados por horário ou evento.'],
    ['Leitura, validação e consolidação', 'A IA interpreta as informações e aplica as regras definidas para cada processo.'],
    ['Entrega no destino certo', 'Lançamento no sistema, envio de comunicados e registro de cada atividade executada.']
  ];
  let stepIndex = 1, stepTimer, userPicked = false;
  function setStep(i) {
    stepIndex = i;
    steps.forEach((s, n) => s.setAttribute('aria-pressed', String(n === i)));
    if (detail) {
      detail.innerHTML = `<b>${texts[i][0]}</b><p>${texts[i][1]}</p>`;
      detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap');
    }
  }
  steps.forEach((s, i) => s.addEventListener('click', () => { userPicked = true; clearInterval(stepTimer); setStep(i); }));
  if (steps.length && !reduce.matches) {
    stepTimer = setInterval(() => { if (!userPicked && !document.hidden) setStep((stepIndex + 1) % steps.length); }, 3600);
  }

  // Cortina nas fotos + reveal das novas peças
  const photos = [...document.querySelectorAll('.bi-card .photo')];
  photos.forEach(p => p.classList.add('curtain'));
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible'); io.unobserve(e.target);
        e.target.querySelectorAll('[data-count]').forEach(el => typeof countUp === 'function' && countUp(el));
      }
    }), {threshold: .12});
    photos.forEach(p => io.observe(p));
  } else {
    photos.forEach(p => p.classList.add('visible'));
  }

  // Parallax suave nas imagens de fundo
  const layers = [...document.querySelectorAll('.parallax')];
  if (layers.length && !reduce.matches) {
    let ticking = false;
    const update = () => {
      ticking = false;
      layers.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const progress = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        el.style.transform = `translate3d(0, ${(progress * -60).toFixed(1)}px, 0)`;
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive: true});
    addEventListener('resize', update);
    update();
  }
})();

// ===== Chatbot: conversa animada no celular =====
(function () {
  const chat = document.querySelector('.phone-chat');
  if (!chat) return;
  const items = [...chat.children];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { items.forEach(el => { if (!el.classList.contains('typing')) el.classList.add('shown'); }); return; }
  let timers = [], running = false;
  function play() {
    timers.forEach(clearTimeout); timers = [];
    items.forEach(el => el.classList.remove('shown'));
    let t = 400;
    items.forEach((el, i) => {
      if (el.classList.contains('typing')) {
        timers.push(setTimeout(() => el.classList.add('shown'), t));
        t += 1300;
        timers.push(setTimeout(() => el.classList.remove('shown'), t));
      } else {
        timers.push(setTimeout(() => el.classList.add('shown'), t));
        t += 1500;
      }
    });
    timers.push(setTimeout(() => { if (running) play(); }, t + 3500));
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; play(); }
      else if (!e.isIntersecting && running) { running = false; timers.forEach(clearTimeout); }
    }, {threshold: .3}).observe(chat);
  } else { running = true; play(); }
})();
