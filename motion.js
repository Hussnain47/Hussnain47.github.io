(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const targets = document.querySelectorAll('.sectionhead, .workrow, .job, .strengths > div, .contact > div, .article section');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });
  targets.forEach((element, index) => {
    if (element.getBoundingClientRect().bottom <= 0) return;
    element.style.setProperty('--reveal-delay', `${Math.min(index % 3, 2) * 60}ms`);
    element.classList.add('reveal-pending', 'reveal-ready');
    observer.observe(element);
  });
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    targets.forEach(element => element.classList.add('is-visible'));
  });
})();
