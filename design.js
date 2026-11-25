(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  document.body.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }, {rootMargin: '0px 0px -30px 0px', threshold: 0.05});
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  const results = document.getElementById('results');
  const watchCards = () => results.querySelectorAll('.result-card:not(.in-view)').forEach(element => observer.observe(element));
  watchCards();
  new MutationObserver(watchCards).observe(results, {childList: true});
})();
