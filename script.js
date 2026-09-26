document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initReveal();
  updateFooterYear();
});

function setActiveNav() {
  const path = window.location.pathname;
  const current = path.split('/').pop() || 'index.html';
  
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    const isActive = href === current || (current === '' && href === 'index.html');
    link.classList.toggle('active', isActive);
  });
}

function updateFooterYear() {
  const labels = document.querySelectorAll('.footer-label');
  const year = new Date().getFullYear();
  labels.forEach((label) => {
    if (label.textContent.includes('Aayan Ahmed')) {
      label.textContent = `Aayan Ahmed • ${year}`;
    }
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