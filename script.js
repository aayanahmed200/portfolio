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
    if (name === "featured" || name === "work") name = "projects";
    if (name === "about" || name === "contact") name = "home";
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
    else if (path.includes('miscellaneous')) setActiveNav('miscellaneous');
    else if (path.includes('projects')) setActiveNav('projects');
    else setActiveNav('home');
  }

  const currentPath = window.location.pathname;
  if (currentPath.includes('experience')) setActiveNav('resume');
  else if (currentPath.includes('miscellaneous')) setActiveNav('miscellaneous');
  else if (currentPath.includes('projects')) setActiveNav('projects');
  else if (!sections.length) setActiveNav('home');


  // Always keep the current document's navigation item active.
  const path = window.location.pathname;
  if (path.includes('experience')) setActiveNav('resume');
  else if (path.includes('miscellaneous')) setActiveNav('miscellaneous');
  else if (path.includes('projects')) setActiveNav('projects');

  // Pixel mouse companion: follows the pointer with a soft, delayed glide.
  const mouse = document.querySelector('.pixel-mouse');
  if (mouse && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let tx = -60, ty = -60, x = tx, y = ty, raf = 0;
    const move = (event) => {
      tx = event.clientX + 18;
      ty = event.clientY + 14;
      mouse.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(animate);
    };
    const animate = () => {
      x += (tx - x) * 0.19;
      y += (ty - y) * 0.19;
      mouse.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (Math.abs(tx-x) + Math.abs(ty-y) > .5) raf = requestAnimationFrame(animate);
      else raf = 0;
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', () => mouse.classList.remove('is-visible'));
  }

  // Memory match game.
  const memoryGrid = document.querySelector('[data-memory-grid]');
  if (memoryGrid) {
    const symbols = ['✦','◈','●','▲','✿','☾','⬟','◆'];
    let deck = [], opened = [], matched = new Set(), moves = 0, locked = false;
    const status = document.querySelector('[data-memory-status]');
    const movesLabel = document.querySelector('[data-memory-moves]');
    const shuffle = (items) => items.map(v => [Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
    const draw = () => {
      memoryGrid.innerHTML = '';
      deck.forEach((symbol,i) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'memory-tile' + (matched.has(i) ? ' is-matched' : '');
        card.textContent = opened.includes(i) || matched.has(i) ? symbol : '?';
        card.setAttribute('aria-label', opened.includes(i) || matched.has(i) ? symbol : 'Hidden card');
        card.disabled = matched.has(i) || opened.includes(i);
        card.addEventListener('click', () => flip(i));
        memoryGrid.append(card);
      });
      movesLabel.textContent = String(moves);
    };
    const flip = (i) => {
      if (locked || opened.length === 2 || matched.has(i)) return;
      opened.push(i); draw();
      if (opened.length === 2) {
        moves++;
        const [a,b] = opened;
        if (deck[a] === deck[b]) {
          matched.add(a); matched.add(b); opened = [];
          status.textContent = matched.size === deck.length ? 'Perfect memory. You cleared the board!' : 'Match found — keep going.';
          draw();
        } else {
          status.textContent = 'Not a pair. Try to remember where they were.';
          locked = true;
          window.setTimeout(() => { opened = []; locked = false; draw(); }, 720);
        }
      }
    };
    const reset = () => {
      deck = shuffle([...symbols,...symbols]); opened=[]; matched=new Set(); moves=0; locked=false;
      status.textContent='Find all eight pairs. Try to finish in as few moves as possible.';
      draw();
    };
    document.querySelector('[data-memory-reset]')?.addEventListener('click',reset);
    reset();
  }

  // Reaction timer.
  const reaction = document.querySelector('[data-reaction]');
  if (reaction) {
    const start = document.querySelector('[data-reaction-start]');
    const result = document.querySelector('[data-reaction-result]');
    let state = 'idle', timer = 0, startedAt = 0;
    const reset = () => { window.clearTimeout(timer); state='idle'; reaction.className='reaction-pad'; reaction.textContent='Ready when you are'; result.textContent='Press start, wait for the panel to turn blue, then tap it as quickly as you can.'; start.textContent='Start test'; };
    start.addEventListener('click', () => {
      if (state === 'waiting' || state === 'ready') { reset(); return; }
      state='waiting'; reaction.className='reaction-pad is-waiting'; reaction.textContent='Wait for blue…'; result.textContent='Stay sharp — don’t click early.';
      start.textContent='Reset';
      timer=window.setTimeout(() => { state='ready'; startedAt=performance.now(); reaction.className='reaction-pad is-ready'; reaction.textContent='CLICK NOW'; }, 1300+Math.random()*2200);
    });
    reaction.addEventListener('click', () => {
      if (state==='waiting') { state='early'; window.clearTimeout(timer); reaction.className='reaction-pad is-early'; reaction.textContent='Too soon!'; result.textContent='False start. Wait until the panel turns blue.'; }
      else if (state==='ready') { const ms=Math.round(performance.now()-startedAt); state='done'; reaction.className='reaction-pad is-done'; reaction.textContent=ms+' ms'; result.textContent=ms<220?'Lightning quick.':ms<320?'Nice reaction.':'Good run — try again and beat your time.'; }
    });
    start.addEventListener('click', () => { if (state==='early'||state==='done') reset(); });
  }
});
