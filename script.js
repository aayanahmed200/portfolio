document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) revealItems.forEach(el => el.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver((entries, obs) => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
    }), {threshold:.12, rootMargin:'0px 0px -35px 0px'});
    revealItems.forEach(el => observer.observe(el));
  }

  const navLinks = document.querySelectorAll('[data-nav]');
  const path = window.location.pathname;
  const current = path.includes('experience') ? 'resume' : path.includes('facts') ? 'facts' : path.includes('projects') ? 'projects' : 'home';
  navLinks.forEach(link => {
    const active = link.dataset.nav === current;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });

  // A small pixel mouse companion, fixed to the viewport so it follows across the whole tab.
  const mouse = document.querySelector('.pixel-mouse');
  if (mouse && !reduceMotion && matchMedia('(pointer:fine)').matches) {
    let targetX=-60,targetY=-60,x=-60,y=-60,raf=0;
    const animate=()=>{
      x+=(targetX-x)*.22; y+=(targetY-y)*.22;
      mouse.style.transform='translate3d('+x+'px,'+y+'px,0)';
      if(Math.abs(targetX-x)+Math.abs(targetY-y)>.4) raf=requestAnimationFrame(animate); else raf=0;
    };
    window.addEventListener('pointermove',e=>{
      targetX=e.clientX+15; targetY=e.clientY+14; mouse.classList.add('is-visible');
      if(!raf) raf=requestAnimationFrame(animate);
    },{passive:true});
    window.addEventListener('pointerleave',()=>mouse.classList.remove('is-visible'));
    document.addEventListener('visibilitychange',()=>{if(document.hidden) mouse.classList.remove('is-visible');});
  }

  // Night Shift: a compact maze with walls, a cheese checkpoint, and an exit.
  const maze=document.querySelector('[data-maze-board]');
  if(maze){
    const layout=[
      '#########',
      '#...#...#',
      '#.#.#.#.#',
      '#.#...#.#',
      '#.###.#.#',
      '#.....#.#',
      '###.#.#.#',
      '#...#...#',
      '#########'
    ];
    let player={x:1,y:1},cheese=false,moves=0,done=false;
    const movesEl=document.querySelector('[data-maze-moves]');
    const bestEl=document.querySelector('[data-maze-best]');
    const status=document.querySelector('[data-maze-status]');
    let best=Number(sessionStorage.getItem('night-shift-best')||0);
    bestEl.textContent=best?String(best):'—';
    const draw=()=>{
      maze.innerHTML='';
      layout.forEach((row,y)=>[...row].forEach((cell,x)=>{
        const tile=document.createElement('div');
        tile.className='maze-cell'+(cell==='#'?' is-wall':'');
        tile.setAttribute('role','gridcell');
        if(player.x===x&&player.y===y){tile.classList.add('is-player');tile.textContent='●';tile.setAttribute('aria-label','You');}
        else if(x===7&&y===1&&!cheese){tile.classList.add('is-cheese');tile.textContent='✦';tile.setAttribute('aria-label','Cheese');}
        else if(x===7&&y===7){tile.classList.add('is-exit');tile.textContent='↗';tile.setAttribute('aria-label','Exit');}
        maze.append(tile);
      }));
      movesEl.textContent=String(moves);
    };
    const move=(dx,dy)=>{
      if(done)return;
      const nx=player.x+dx,ny=player.y+dy;
      if(layout[ny]?.[nx]!==' .'.trim() && layout[ny]?.[nx]!=='.') return;
      player={x:nx,y:ny};moves++;
      if(player.x===7&&player.y===1&&!cheese){cheese=true;status.textContent='Cheese collected. Now find the exit in the bottom-right corner.';}
      if(player.x===7&&player.y===7){
        if(cheese){done=true;status.textContent='Escaped in '+moves+' moves. Nicely navigated.';if(!best||moves<best){best=moves;bestEl.textContent=String(best);sessionStorage.setItem('night-shift-best',String(best));}}
        else status.textContent='The door is locked. Find the cheese first.';
      }
      draw();
    };
    const reset=()=>{player={x:1,y:1};cheese=false;moves=0;done=false;status.textContent='Use arrow keys or the buttons. Find the cheese, then the door.';draw();};
    document.querySelector('[data-maze-reset]').addEventListener('click',reset);
    document.querySelectorAll('[data-maze-move]').forEach(btn=>btn.addEventListener('click',()=>{
      const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};move(...dirs[btn.dataset.mazeMove]);
    }));
    window.addEventListener('keydown',e=>{
      if(!document.querySelector('.maze-game:hover'))return;
      const dirs={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
      if(dirs[e.key]){e.preventDefault();move(...dirs[e.key]);}
    });
    reset();
  }

  // Type Desk: timed transcription with live accuracy and words-per-minute.
  const typeInput=document.querySelector('[data-type-input]');
  if(typeInput){
    const lines=[
      'Good ideas often begin as small experiments.',
      'Make something useful, then make it better.',
      'Curiosity is a habit worth keeping.',
      'A little progress is still progress.'
    ];
    const quote=document.querySelector('[data-type-quote]');
    const timeEl=document.querySelector('[data-type-time]');
    const wpmEl=document.querySelector('[data-type-wpm]');
    const accEl=document.querySelector('[data-type-accuracy]');
    const status=document.querySelector('[data-type-status]');
    const start=document.querySelector('[data-type-start]');
    let target='',started=0,remaining=30,ticker=0,running=false,finished=false;
    const update=()=>{
      const typed=typeInput.value;
      let correct=0;
      for(let i=0;i<typed.length;i++) if(typed[i]===target[i]) correct++;
      const elapsed=Math.max(1,(30-remaining)/60);
      const wpm=Math.round((correct/5)/elapsed);
      const accuracy=typed.length?Math.round(correct/typed.length*100):100;
      wpmEl.textContent=String(wpm);accEl.textContent=accuracy+'%';
      timeEl.textContent=String(remaining);
      if(typed===target){finish('Perfect copy. Clean run.');}
      else if(typed.length>=target.length){finish('Line complete. Nice work.');}
    };
    const finish=(message)=>{
      if(finished)return;finished=true;running=false;clearInterval(ticker);typeInput.disabled=true;status.textContent=message;start.textContent='Run again';
    };
    const begin=()=>{
      clearInterval(ticker);target=lines[Math.floor(Math.random()*lines.length)];quote.textContent=target;
      typeInput.value='';typeInput.disabled=false;typeInput.focus();remaining=30;running=true;finished=false;started=Date.now();
      timeEl.textContent='30';wpmEl.textContent='0';accEl.textContent='100%';status.textContent='Go — copy the sentence above.';start.textContent='Restart';
      ticker=setInterval(()=>{
        remaining=Math.max(0,30-Math.floor((Date.now()-started)/1000));timeEl.textContent=String(remaining);
        if(remaining===0)finish('Time. Your final speed is '+wpmEl.textContent+' WPM.');
      },200);
    };
    typeInput.addEventListener('input',update);
    start.addEventListener('click',begin);
  }
});

/* Miscellaneous page: accessible topic filters and a tiny rabbit-hole generator. */
document.addEventListener('DOMContentLoaded', () => {
  const filters = [...document.querySelectorAll('[data-misc-filter]')];
  const cards = [...document.querySelectorAll('[data-misc-category]')];
  const empty = document.querySelector('.misc-empty');
  if (filters.length && cards.length) {
    filters.forEach(button => button.addEventListener('click', () => {
      const selected = button.dataset.miscFilter;
      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      cards.forEach(card => {
        const show = selected === 'all' || card.dataset.miscCategory === selected;
        card.hidden = !show;
        if (show) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    }));
  }

  const prompt = document.querySelector('[data-rabbit-hole]');
  const next = document.querySelector('[data-rabbit-hole-next]');
  if (prompt && next) {
    const ideas = [
      'What would a school look like if it were designed around curiosity instead of a timetable?',
      'Could an offline-first assistant make useful AI available in places with unreliable internet?',
      'What can piano practice teach us about learning any difficult skill?',
      'How might brain-computer interfaces change accessibility over the next decade?',
      'Why do some interfaces feel human while others feel like filling out a form?',
      'What gets lost when a language has almost no digital footprint?'
    ];
    let previous = -1;
    next.addEventListener('click', () => {
      let choice = Math.floor(Math.random() * ideas.length);
      if (ideas.length > 1) while (choice === previous) choice = Math.floor(Math.random() * ideas.length);
      previous = choice;
      prompt.classList.remove('is-changing');
      void prompt.offsetWidth;
      prompt.classList.add('is-changing');
      prompt.textContent = ideas[choice];
    });
  }
});


/* Lightweight original sound cues for Dune Drift and Saily Seas. */
document.addEventListener('DOMContentLoaded', () => {
  const toggles=[...document.querySelectorAll('[data-sound-toggle]')];
  if(!toggles.length)return;
  let enabled=true,audio=null;
  const getAudio=()=>{
    if(!audio){
      const AudioContext=window.AudioContext||window.webkitAudioContext;
      if(AudioContext)audio=new AudioContext();
    }
    if(audio&&audio.state==='suspended')audio.resume();
    return audio;
  };
  const note=(frequency,duration=.16,delay=0,waveform='sine',volume=.035,slide=null)=>{
    if(!enabled)return;
    const ctx=getAudio();if(!ctx)return;
    const now=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=waveform;osc.frequency.setValueAtTime(frequency,now);
    if(slide)osc.frequency.exponentialRampToValueAtTime(slide,now+duration);
    gain.gain.setValueAtTime(.0001,now);
    gain.gain.exponentialRampToValueAtTime(volume,now+.018);
    gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+duration+.03);
  };
  window.playGameSound=name=>{
    if(!enabled)return;
    const sounds={
      select:()=>note(520,.07,0,'sine',.025,650),
      start:()=>{note(392,.18,0,'sine',.035,523);note(587,.22,.12,'sine',.032,784);},
      jump:()=>{note(294,.12,0,'triangle',.026,440);note(587,.16,.08,'sine',.025,784);},
      trick:()=>{note(523,.13,0,'sine',.03,784);note(784,.18,.09,'sine',.025,1046);},
      wind:()=>{note(174,.34,0,'sine',.025,262);note(330,.42,.08,'sine',.02,392);},
      splash:()=>{note(330,.11,0,'triangle',.026,196);note(523,.18,.08,'sine',.023,392);},
      bird:()=>{note(784,.13,0,'sine',.028,988);note(1175,.2,.08,'sine',.025,1397);},
      collect:()=>{note(587,.13,0,'sine',.034);note(784,.18,.09,'sine',.029);},
      bump:()=>{note(220,.13,0,'triangle',.026,165);note(174,.17,.08,'triangle',.019,130);},
      win:()=>{note(523,.22,0,'sine',.038);note(659,.22,.12,'sine',.033);note(784,.3,.24,'sine',.03);note(1046,.38,.36,'sine',.025);},
      back:()=>note(587,.08,0,'sine',.02,440)
    };
    (sounds[name]||sounds.select)();
  };
  const refresh=()=>toggles.forEach(button=>{
    button.textContent=enabled?'Sound: On ♪':'Sound: Off';
    button.setAttribute('aria-pressed',String(enabled));
  });
  toggles.forEach(button=>button.addEventListener('click',()=>{
    enabled=!enabled;refresh();
    if(enabled)window.playGameSound('select');
  }));
  refresh();
});

/* Faster page entrance and same-site navigation without waiting for every font/image. */
document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('site-page-loader');
  if (!loader) return;

  const showLoader = () => loader.classList.add('is-visible');
  const hideLoader = () => loader.classList.remove('is-visible');

  const waitForLeadVisual = async () => {
    const leadImage = document.querySelector('img.hero-portrait');
    const imageReady = !leadImage || leadImage.complete
      ? Promise.resolve()
      : new Promise(resolve => {
          leadImage.addEventListener('load', resolve, { once: true });
          leadImage.addEventListener('error', resolve, { once: true });
        });
    const safetyLimit = new Promise(resolve => window.setTimeout(resolve, 550));

    await Promise.race([imageReady, safetyLimit]);
    window.requestAnimationFrame(() => window.requestAnimationFrame(hideLoader));
  };

  showLoader();
  waitForLeadVisual();

  document.addEventListener('click', event => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || link.target === '_blank' ||
        link.hasAttribute('download')) return;

    let url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname &&
        url.search === window.location.search) return;

    event.preventDefault();
    showLoader();
    window.setTimeout(() => window.location.assign(url.href), 45);
  });
});


/* Small 2D mouse mascot cursor: decorative only, never intercepts clicks. */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'site-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML = `
    <svg class="site-cursor-mouse" viewBox="0 0 52 58" width="44" height="50" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M35 43 C42 47 46 44 48 39 C49 36 47 34 44 35" fill="none" stroke="#36415A" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M11 19 C4 11 7 3 14 4 C20 5 22 12 21 19Z" fill="#FFFCF5" stroke="#171815" stroke-width="2"/>
      <path d="M32 18 C34 8 42 4 46 10 C49 16 44 22 38 24Z" fill="#FFFCF5" stroke="#171815" stroke-width="2"/>
      <path d="M12 15 C9 10 12 7 15 9 C17 10 17 13 16 16Z" fill="#E9673B"/>
      <path d="M38 16 C40 11 43 10 44 13 C45 16 42 18 39 19Z" fill="#E9673B"/>
      <ellipse cx="27" cy="31" rx="18" ry="19" fill="#FFFCF5" stroke="#171815" stroke-width="2.2"/>
      <ellipse cx="20" cy="28" rx="2" ry="2.6" fill="#171815"/>
      <ellipse cx="34" cy="28" rx="2" ry="2.6" fill="#171815"/>
      <ellipse cx="27" cy="35" rx="6.2" ry="4.4" fill="#F5C9BC"/>
      <ellipse cx="27" cy="33.5" rx="2.4" ry="1.7" fill="#E9673B" stroke="#171815" stroke-width=".8"/>
      <path d="M27 35.2 Q24 39 20.5 37 M27 35.2 Q30 39 33.5 37" fill="none" stroke="#171815" stroke-width="1.25" stroke-linecap="round"/>
      <path d="M10 33 L3.5 30.5 M10 37 L3 37 M43 33 L50 30.5 M43 37 L50 37" fill="none" stroke="#36415A" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M19 48 Q27 44 35 48 L31 54 L25 52.5Z" fill="#BCE8ED" stroke="#171815" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M22 48 L24 53" stroke="#E9673B" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `;
  document.body.appendChild(cursor);
  document.body.classList.add('has-custom-cursor');

  const selector = [
    'a','button','[role="button"]','.project-card','.project-card-small',
    '.project-detail','.featured-card','.resume-section-summary',
    '.error-home-link','.error-project-link'
  ].join(',');

  document.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    cursor.style.left = event.clientX + 'px';
    cursor.style.top = event.clientY + 'px';
    cursor.classList.add('is-visible');
  }, { passive:true });

  document.addEventListener('pointerover', event => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const target = event.target && event.target.closest ? event.target : null;
    cursor.classList.toggle('is-hover', Boolean(target && target.closest(selector)));
    cursor.classList.toggle('is-text-entry', Boolean(target && target.closest('input,textarea,[contenteditable="true"]')));
  });

  document.addEventListener('pointerout', event => {
    const next = event.relatedTarget && event.relatedTarget.closest ? event.relatedTarget : null;
    cursor.classList.toggle('is-hover', Boolean(next && next.closest(selector)));
    cursor.classList.toggle('is-text-entry', Boolean(next && next.closest('input,textarea,[contenteditable="true"]')));
    if (!event.relatedTarget) cursor.classList.remove('is-visible','is-hover','is-down','is-text-entry');
  });

  document.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') cursor.classList.add('is-down');
  });
  document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
  document.addEventListener('pointercancel', () => cursor.classList.remove('is-down'));
});