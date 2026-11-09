/* Minimal navigation progress indicator. */
document.addEventListener('DOMContentLoaded', () => {
  const bar=document.createElement('div');
  bar.id='page-loading-bar';
  bar.setAttribute('aria-hidden','true');
  bar.appendChild(document.createElement('span'));
  document.body.appendChild(bar);
  document.querySelectorAll('a[href]').forEach(link=>{
    link.addEventListener('click',event=>{
      const url=new URL(link.href,window.location.href);
      if(event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target==='_blank' || link.hasAttribute('download')) return;
      if(url.origin!==window.location.origin || url.pathname===window.location.pathname && url.hash) return;
      bar.classList.remove('is-finishing','is-loading');
      void bar.offsetWidth;
      bar.classList.add('is-loading');
    });
  });
  window.addEventListener('pageshow',()=>{
    bar.classList.remove('is-loading');
    bar.classList.add('is-finishing');
  });
});

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
  const current = path.includes('experience') ? 'resume' : path.includes('miscellaneous') ? 'miscellaneous' : path.includes('projects') ? 'projects' : 'home';
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
