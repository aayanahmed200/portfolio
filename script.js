document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal content once, and keep the rest of the page still.
  const revealItems = document.querySelectorAll('.reveal');
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
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  // The navigation is page-based. The same markup and typography are used everywhere.
  const currentPage = document.body.dataset.page || 'home';
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === currentPage;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Pointer study: a small arrow trails the real cursor inside its stage only.
  const pointerStage = document.getElementById('pointer-stage');
  const pointerFollower = document.getElementById('pointer-follower');
  const pointerCoordinates = document.getElementById('pointer-coordinates');

  if (pointerStage && pointerFollower) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const animateFollower = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      pointerFollower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

      const distance = Math.hypot(targetX - currentX, targetY - currentY);
      if (distance > 0.35) frame = window.requestAnimationFrame(animateFollower);
      else frame = 0;
    };

    pointerStage.addEventListener('pointerenter', () => {
      pointerStage.classList.add('is-active');
    });

    pointerStage.addEventListener('pointermove', (event) => {
      const rect = pointerStage.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;

      if (pointerCoordinates) {
        pointerCoordinates.textContent =
          `X ${String(Math.round(targetX)).padStart(3, '0')} · Y ${String(Math.round(targetY)).padStart(3, '0')}`;
      }

      if (!frame && !reduceMotion) frame = window.requestAnimationFrame(animateFollower);
      else if (reduceMotion) {
        currentX = targetX;
        currentY = targetY;
        pointerFollower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      }
    });

    pointerStage.addEventListener('pointerleave', () => {
      pointerStage.classList.remove('is-active');
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (pointerCoordinates) pointerCoordinates.textContent = 'X 000 · Y 000';
    });
  }

  // Wiki Hop: a small, local graph. Each choice must be linked from the current topic.
  const wikiGraph = {
    'Aitchison College': ['Lahore', 'Education', 'Pakistan'],
    'Lahore': ['Aitchison College', 'Pakistan', 'Education'],
    'Pakistan': ['Lahore', 'Education'],
    'Education': ['Aitchison College', 'Lahore', 'Learning', 'Computer science', 'Research'],
    'Learning': ['Education', 'Psychology', 'Research'],
    'Psychology': ['Learning', 'Neural networks'],
    'Research': ['Education', 'Computer science', 'Data science'],
    'Computer science': ['Education', 'Research', 'Programming', 'Algorithms', 'Artificial intelligence'],
    'Programming': ['Computer science', 'Algorithms', 'Data science'],
    'Algorithms': ['Computer science', 'Programming', 'Artificial intelligence'],
    'Data science': ['Research', 'Programming', 'Machine learning'],
    'Artificial intelligence': ['Computer science', 'Machine learning', 'Neural networks', 'Computer vision'],
    'Machine learning': ['Artificial intelligence', 'Neural networks', 'Data science'],
    'Computer vision': ['Artificial intelligence', 'Neural networks'],
    'Neural networks': ['Artificial intelligence', 'Machine learning', 'Computer vision']
  };

  const wikiChoices = document.getElementById('wiki-choices');
  const wikiPathElement = document.getElementById('wiki-path');
  const wikiCurrent = document.getElementById('wiki-current');
  const wikiStepCount = document.getElementById('wiki-step-count');
  const wikiStatus = document.getElementById('wiki-status');
  const wikiReset = document.getElementById('wiki-reset');

  if (wikiChoices && wikiPathElement && wikiCurrent && wikiStepCount && wikiStatus && wikiReset) {
    const start = 'Aitchison College';
    const target = 'Neural networks';
    const idealHops = 4;
    let route = [start];
    let finished = false;

    const renderRoute = () => {
      wikiPathElement.replaceChildren();
      route.forEach((topic, index) => {
        const node = document.createElement('span');
        node.className = 'wiki-path-node' + (index === route.length - 1 ? ' is-current' : '');
        node.textContent = topic;
        wikiPathElement.appendChild(node);
      });
      wikiCurrent.textContent = route[route.length - 1];
      wikiStepCount.textContent = String(route.length - 1);
    };

    const renderChoices = () => {
      wikiChoices.replaceChildren();
      const current = route[route.length - 1];
      const available = (wikiGraph[current] || []).filter((topic) => !route.includes(topic));

      if (finished) return;

      available.forEach((topic) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'wiki-choice';
        button.textContent = topic;
        button.addEventListener('click', () => {
          if (finished || !(wikiGraph[route[route.length - 1]] || []).includes(topic)) return;
          route.push(topic);

          if (topic === target) {
            finished = true;
            const hops = route.length - 1;
            wikiStatus.textContent = hops <= idealHops
              ? `You made it in ${hops} hops. Nice route.`
              : `You reached the target in ${hops} hops. Try again and see whether you can do it in four.`;
          } else if (route.length - 1 >= 5) {
            finished = true;
            wikiStatus.textContent = 'Five hops used. Restart and try a different trail.';
          } else {
            wikiStatus.textContent = 'Good link. Where does this topic lead?';
          }

          renderRoute();
          renderChoices();
        });
        wikiChoices.appendChild(button);
      });

      if (!available.length && !finished) {
        wikiStatus.textContent = 'No unused links from here. Restart to try another route.';
      }
    };

    const resetWiki = () => {
      route = [start];
      finished = false;
      wikiStatus.textContent = 'Choose one of the connected topics to follow a link.';
      renderRoute();
      renderChoices();
    };

    wikiReset.addEventListener('click', resetWiki);
    resetWiki();
  }
});
