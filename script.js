document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initReveal();
  const footer = document.querySelector('.footer-label');
  if (footer) footer.textContent = `Aayan Ahmed • ${new Date().getFullYear()}`;
});

function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const active = link.getAttribute('href') === current || (current === '' && link.getAttribute('href') === 'index.html');
    link.classList.toggle('active', active);
  });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  items.forEach((item) => observer.observe(item));
}
