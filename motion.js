(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  try { paused = sessionStorage.getItem('portfolio-motion-paused') === 'true'; } catch {}
  const reduce = () => paused || preference.matches;
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'motion-toggle';
  document.body.append(button);
  const diagrams = [...document.querySelectorAll('.diagram-inline')];
  const surfaces = [...document.querySelectorAll('.project-visual, .system, .case-diagram')];
  const reveals = [...document.querySelectorAll('.sectionhead, .workrow, .job, .strengths > div, .skill-path li, .workflow-details article, .contact > div, .article section, .facts')];
  let frame = 0;
  const visible = new Set();
  function updateScroll() {
    frame = 0;
    if (reduce() || document.hidden) return;
    const progress = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
    document.documentElement.style.setProperty('--reading-progress', Math.min(1, Math.max(0, progress)));
    visible.forEach(surface => {
      const rect = surface.getBoundingClientRect();
      const offset = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight));
      surface.style.setProperty('--scroll-depth', `${offset * -12}px`);
      surface.style.setProperty('--scroll-turn', `${offset * 3}deg`);
    });
  }
  function schedule() { if (!frame && !reduce()) frame = requestAnimationFrame(updateScroll); }
  function sync() {
    const off = reduce();
    document.documentElement.classList.toggle('motion-off', off);
    diagrams.forEach(svg => svg.classList.toggle('motion-paused', off));
    button.textContent = off ? 'Motion off' : 'Pause motion';
    button.setAttribute('aria-pressed', String(off));
    button.setAttribute('aria-label', off ? 'Enable motion effects' : 'Pause motion effects');
    button.disabled = preference.matches;
    if (off) reveals.forEach(el => el.classList.add('is-visible'));
    else schedule();
  }
  button.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('portfolio-motion-paused', String(paused)); } catch {}
    sync();
  });
  preference.addEventListener('change', sync);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      entry.target.querySelectorAll('.diagram-inline').forEach(svg => svg.classList.add('is-playing'));
      if (entry.target.matches('.diagram-inline')) entry.target.classList.add('is-playing');
      observer.unobserve(entry.target);
    }), { threshold: 0.08 });
    reveals.forEach((el, i) => {
      if (!reduce() && el.getBoundingClientRect().bottom > 0) {
        el.style.setProperty('--reveal-delay', `${(i % 3) * 65}ms`);
        el.classList.add('reveal-pending', 'reveal-ready');
      }
      observer.observe(el);
    });
    diagrams.forEach(svg => observer.observe(svg));
    const depthObserver = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => isIntersecting ? visible.add(target) : visible.delete(target));
      schedule();
    });
    surfaces.forEach(el => depthObserver.observe(el));
  } else diagrams.forEach(svg => svg.classList.add('is-playing'));
  surfaces.forEach(surface => {
    surface.addEventListener('pointermove', event => {
      if (reduce() || !finePointer.matches) return;
      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--tilt-x', `${-((event.clientY - rect.top) / rect.height - 0.5) * 7}deg`);
      surface.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - 0.5) * 9}deg`);
    }, { passive: true });
    surface.addEventListener('pointerleave', () => {
      surface.style.setProperty('--tilt-x', '0deg');surface.style.setProperty('--tilt-y', '0deg');
    });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('pageshow', schedule);
  document.addEventListener('visibilitychange', schedule);
  sync();
})();
