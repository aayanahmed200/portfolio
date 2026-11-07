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

  const path = window.location.pathname;
  const activePage = path.includes('experience') ? 'resume'
    : path.includes('projects') ? 'projects'
    : path.includes('miscellaneous') ? 'miscellaneous'
    : 'home';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === activePage;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  const cursorArrow = document.querySelector('.cursor-arrow');
  if (cursorArrow && !reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursorArrow.style.setProperty('--cursor-x', event.clientX + 'px');
      cursorArrow.style.setProperty('--cursor-y', event.clientY + 'px');
      cursorArrow.classList.add('is-following');
    }, { passive: true });
  }

  const wikiGame = document.querySelector('[data-wiki-game]');
  if (wikiGame) {
    const graph = {
      lahore: {
        title: 'Lahore',
        prompt: 'Choose a link to follow.',
        choices: [
          { label: 'Education in Pakistan', next: 'education-pakistan', good: true },
          { label: 'Punjab', next: 'punjab' }
        ]
      },
      'education-pakistan': {
        title: 'Education in Pakistan',
        prompt: 'You are getting warmer. Keep following the ideas.',
        choices: [
          { label: 'Education', next: 'education', good: true },
          { label: 'Pakistan', next: 'pakistan' }
        ]
      },
      education: {
        title: 'Education',
        prompt: 'One more hop to the destination.',
        choices: [
          { label: 'Artificial intelligence', next: 'goal', good: true },
          { label: 'Computer science', next: 'computer-science' }
        ]
      },
      punjab: { title: 'Punjab', prompt: 'This trail wanders away from the target.', choices: [] },
      pakistan: { title: 'Pakistan', prompt: 'A fascinating detour, but not this route.', choices: [] },
      'computer-science': { title: 'Computer science', prompt: 'Close, but you have taken a side path.', choices: [] }
    };
    const title = wikiGame.querySelector('[data-wiki-title]');
    const prompt = wikiGame.querySelector('[data-wiki-prompt]');
    const choices = wikiGame.querySelector('[data-wiki-choices]');
    const trail = wikiGame.querySelector('[data-wiki-trail]');
    const reset = wikiGame.querySelector('[data-wiki-reset]');
    let route = ['lahore'];

    const render = () => {
      const current = route[route.length - 1];
      const node = graph[current];
      title.textContent = current === 'goal' ? 'Artificial intelligence' : node.title;
      trail.textContent = route.map((key) => key === 'goal' ? 'Artificial intelligence' : graph[key].title).join('  →  ');
      choices.replaceChildren();
      if (current === 'goal') {
        prompt.textContent = 'Trail complete. Three hops, one destination. Nice bit of lateral thinking.';
        const done = document.createElement('p');
        done.className = 'wiki-success';
        done.textContent = 'You found the connection.';
        choices.append(done);
        return;
      }
      prompt.textContent = node.prompt;
      if (!node.choices.length) {
        const deadEnd = document.createElement('p');
        deadEnd.className = 'wiki-dead-end';
        deadEnd.textContent = 'Dead end. The best route is still waiting.';
        choices.append(deadEnd);
        return;
      }
      node.choices.forEach((choice) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wiki-choice';
        button.textContent = choice.label;
        button.addEventListener('click', () => {
          route.push(choice.next);
          render();
        });
        choices.append(button);
      });
    };
    reset.addEventListener('click', () => { route = ['lahore']; render(); });
    render();
  }
});