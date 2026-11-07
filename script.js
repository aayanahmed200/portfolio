document.addEventListener('DOMContentLoaded', () => {
  const revealItems = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = document.querySelectorAll('[data-section]');

  const setActiveNav = (name) => {
    navLinks.forEach((link) => {
      const active = link.dataset.nav === name;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  if (sections.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveNav(entry.target.dataset.section);
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    const path = window.location.pathname;
    if (path.includes('experience')) setActiveNav('resume');
    else if (path.includes('contact')) setActiveNav('contact');
    else if (path.includes('about')) setActiveNav('about');
    else if (path.includes('projects')) setActiveNav('work');
  }

  const currentPath = window.location.pathname;
  if (currentPath.includes('experience')) setActiveNav('resume');
  else if (!sections.length && currentPath.includes('about')) setActiveNav('about');
  else if (!sections.length && currentPath.includes('projects')) setActiveNav('work');
  else if (!sections.length && currentPath.includes('contact')) setActiveNav('contact');
});