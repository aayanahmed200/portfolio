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


/* Side-quest arcade: three original, non-violent mini-games. */
document.addEventListener('DOMContentLoaded', () => {
  const lobby = document.querySelector('[data-arcade-lobby]');
  const stages = [...document.querySelectorAll('[data-arcade-stage]')];
  if (!lobby || !stages.length) return;

  const showGame = id => {
    lobby.hidden = true;
    stages.forEach(stage => { stage.hidden = stage.dataset.arcadeStage !== id; });
    if (id === 'orbit') drawOrbit();
    if (id === 'mouse') renderMouse();
    if (id === 'garden') renderGarden();
  };
  const showLobby = () => {
    stages.forEach(stage => { stage.hidden = true; });
    lobby.hidden = false;
    pauseOrbit();
  };
  document.querySelectorAll('[data-open-game]').forEach(button => button.addEventListener('click', () => showGame(button.dataset.openGame)));
  document.querySelectorAll('[data-arcade-back]').forEach(button => button.addEventListener('click', showLobby));

  /* Star Catcher: collect 12 falling stars in 45 seconds. */
  const orbitCanvas = document.getElementById('orbit-canvas');
  if (orbitCanvas) {
    const ctx = orbitCanvas.getContext('2d');
    const overlay = document.querySelector('[data-orbit-overlay]');
    const scoreEl = document.querySelector('[data-orbit-score]');
    const timeEl = document.querySelector('[data-orbit-time]');
    const bestEl = document.querySelector('[data-orbit-best]');
    const statusEl = document.querySelector('[data-orbit-status]');
    const startButton = document.querySelector('[data-orbit-start]');
    const resetButton = document.querySelector('[data-orbit-reset]');
    const W = 960, H = 440, bestKey = 'aayan-star-catcher-best';
    let running = false, score = 0, timeLeft = 45, basketX = W / 2, stars = [], spawnClock = 0, lastFrame = 0, raf = 0, callPulse = 0;
    const getBest = () => { try { return Number(localStorage.getItem(bestKey) || 0); } catch (_) { return 0; } };
    const setBest = value => { try { localStorage.setItem(bestKey, String(value)); } catch (_) {} };

    function starShape(x,y,outer,inner,rotation,color) {
      ctx.save(); ctx.translate(x,y); ctx.rotate(rotation); ctx.beginPath();
      for (let i=0;i<10;i++) { const r=i%2?inner:outer; const a=-Math.PI/2+i*Math.PI/5; ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); }
      ctx.closePath(); ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=15; ctx.fill(); ctx.restore();
    }
    const atlasScene = new Image();
    atlasScene.src = '/assets/wayfinder-dunes.svg';
    atlasScene.onload = () => { if (!running) drawOrbit(); };
    function drawEcho(x,y,r,phase) {
      ctx.save(); ctx.translate(x,y); ctx.rotate(Math.sin(phase)*.14);
      ctx.fillStyle='rgba(255,246,195,.23)';
      ctx.beginPath(); ctx.arc(0,0,r*2.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff0ae';
      ctx.beginPath(); ctx.ellipse(-2,2,r*.76,r*.55,-.34,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#fff5cf'; ctx.lineWidth=Math.max(2,r*.22); ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(r*.5,1); ctx.lineTo(r*.5,-r*2.1); ctx.quadraticCurveTo(r*1.8,-r*2.2,r*1.6,-r*1.1); ctx.stroke();
      ctx.restore();
    }
    function drawOrbit() {
      if (!ctx) return;
      if (atlasScene.complete && atlasScene.naturalWidth) {
        ctx.drawImage(atlasScene, 0, 0, W, H);
      } else {
        const bg=ctx.createLinearGradient(0,0,W,H);
        bg.addColorStop(0,'#91b8c0'); bg.addColorStop(.6,'#e6d9b9'); bg.addColorStop(1,'#c98f76');
        ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#a3ae91'; ctx.beginPath(); ctx.moveTo(0,280); ctx.lineTo(150,170); ctx.lineTo(300,275); ctx.lineTo(470,140); ctx.lineTo(640,285); ctx.lineTo(800,185); ctx.lineTo(960,260); ctx.lineTo(960,440); ctx.lineTo(0,440); ctx.fill();
      }
      // Echo motes drift across the valley like tiny notes in the wind.
      stars.forEach(item => {
        const pulse = 1 + Math.sin(item.spin * 2) * .12;
        ctx.save();
        ctx.globalAlpha = .28;
        ctx.fillStyle = '#fff4bd';
        ctx.beginPath(); ctx.arc(item.x,item.y,item.r*2.7*pulse,0,Math.PI*2); ctx.fill();
        ctx.restore();
        drawEcho(item.x,item.y,item.r*pulse,item.spin);
        ctx.strokeStyle='rgba(255,247,207,.65)';
        ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(item.x,item.y+item.r); ctx.lineTo(item.x-2,item.y+item.r+12); ctx.stroke();
      });
      if(callPulse>0){ctx.save();ctx.globalAlpha=Math.min(.6,callPulse*.55);ctx.strokeStyle='#d7f5e8';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(basketX,385,38+(1-callPulse)*70,18+(1-callPulse)*30,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      // A small original hooded wayfinder replaces the old basket catcher.
      ctx.save();
      ctx.translate(basketX, 371);
      ctx.fillStyle='rgba(71,62,54,.2)';
      ctx.beginPath(); ctx.ellipse(0,54,32,8,0,0,Math.PI*2); ctx.fill();
      ctx.shadowColor='rgba(49,53,42,.2)'; ctx.shadowBlur=12;
      ctx.fillStyle='#B66E58';
      ctx.beginPath();
      ctx.moveTo(-10,-56); ctx.quadraticCurveTo(-28,-31,-27,22);
      ctx.quadraticCurveTo(0,39,27,22); ctx.quadraticCurveTo(28,-31,10,-56);
      ctx.quadraticCurveTo(0,-68,-10,-56); ctx.closePath(); ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle='#D99B72';
      ctx.beginPath(); ctx.ellipse(0,-49,13,14,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#586D68';
      ctx.beginPath(); ctx.moveTo(-13,-47); ctx.quadraticCurveTo(-15,-73,0,-77);
      ctx.quadraticCurveTo(17,-73,14,-47); ctx.quadraticCurveTo(0,-57,-13,-47); ctx.fill();
      ctx.fillStyle='#F5E2B5';
      ctx.beginPath(); ctx.arc(4,-49,2,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#D8B76B'; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(-4,-35); ctx.quadraticCurveTo(-32,-22,-39,-4); ctx.stroke();
      ctx.strokeStyle='#84B5B0'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(-19,-16); ctx.quadraticCurveTo(-43,-8,-46,9); ctx.stroke();
      ctx.fillStyle='#F2D77F';
      ctx.beginPath(); ctx.arc(0,4,5,0,Math.PI*2); ctx.fill();
      ctx.restore();
      ctx.fillStyle='rgba(255,250,225,.9)';
      ctx.font='800 13px DM Sans,Arial';
      ctx.fillText('FOLLOW THE ECHOES',25,30);
    }
        function hud(){scoreEl.textContent=String(score);timeEl.textContent=String(Math.ceil(timeLeft));bestEl.textContent=String(getBest());}
    function finish(message){
      running=false; if(raf)cancelAnimationFrame(raf); raf=0;
      if(score>getBest())setBest(score); hud(); overlay.hidden=false;
      overlay.querySelector('strong').textContent=score>=12?'Star collector!':'Nice little run.';
      overlay.querySelector('span').textContent=message; startButton.textContent='Play again ↗';
      statusEl.textContent=message; drawOrbit();
    }
    function tick(now){
      if(!running)return;
      const dt=Math.min(.04,Math.max(.001,(now-lastFrame)/1000)); lastFrame=now;
      timeLeft=Math.max(0,timeLeft-dt); callPulse=Math.max(0,callPulse-dt); spawnClock+=dt;
      if(spawnClock>.57){spawnClock=0;stars.push({x:32+Math.random()*(W-64),y:-15,r:9+Math.random()*5,speed:175+Math.random()*95,drift:(Math.random()-.5)*28,spin:0});}
      stars=stars.filter(item=>{
        item.y+=item.speed*dt; item.x+=Math.sin(item.y/46)*item.drift*dt; item.spin+=dt*1.7; if(callPulse>0&&Math.abs(item.x-basketX)<300)item.x+=(basketX-item.x)*Math.min(.08,dt*.7);
        if(item.y>345&&item.y<420&&Math.abs(item.x-basketX)<56){window.playGameSound?.('echo');score++;hud();if(score>=12)finish('You caught all 12 stars. That was lovely.');return false;}
        return item.y<H+20;
      });
      if(!running)return;
      if(timeLeft<=0){finish('Time is up. Try another run and beat your score.');return;}
      hud(); drawOrbit(); raf=requestAnimationFrame(tick);
    }
    function startOrbit(){
      if(running)return; window.playGameSound?.('start'); score=0;timeLeft=45;basketX=W/2;stars=[];spawnClock=0;callPulse=0;running=true;overlay.hidden=true;
      statusEl.textContent='Go! Catch the falling stars.';hud();lastFrame=performance.now();raf=requestAnimationFrame(tick);
    }
    function pauseOrbit(){running=false;if(raf)cancelAnimationFrame(raf);raf=0;}
    function resetOrbit(){
      pauseOrbit();score=0;timeLeft=45;stars=[];basketX=W/2;callPulse=0;overlay.hidden=false;
      overlay.querySelector('strong').textContent='Ready?';overlay.querySelector('span').textContent='Catch 12 stars before the clock runs out.';
      startButton.textContent='Start game ↗';statusEl.textContent='Ready when you are.';hud();drawOrbit();
    }
    startButton.addEventListener('click',startOrbit); resetButton.addEventListener('click',resetOrbit);
    const callButton=document.querySelector('[data-orbit-call]');
    const callEcho=()=>{if(!running)return;callPulse=1.1;window.playGameSound?.('call');};
    if(callButton)callButton.addEventListener('click',callEcho);
    document.addEventListener('keydown',event=>{if(event.code==='Space'&&running){event.preventDefault();callEcho();}});
    orbitCanvas.addEventListener('pointermove',event=>{
      if(!running)return;const rect=orbitCanvas.getBoundingClientRect();
      basketX=Math.max(58,Math.min(W-58,((event.clientX-rect.left)/rect.width)*W));
    });
    document.addEventListener('keydown',event=>{
      if(!running)return;
      if(event.key==='ArrowLeft'||event.key.toLowerCase()==='a'){basketX=Math.max(58,basketX-32);event.preventDefault();}
      else if(event.key==='ArrowRight'||event.key.toLowerCase()==='d'){basketX=Math.min(W-58,basketX+32);event.preventDefault();}
    });
    resetOrbit();
  }

  /* SpyMouse: collect the cheese and key, then reach the exit. */
  const mouseBoard=document.querySelector('[data-mouse-board]');
  if(mouseBoard){
    const map=['###########','#S..#....E#','#.#.#.##..#','#.#...#...#','#.###...###','#C....#..K#','###########'];
    const start={x:1,y:1};
    const patrols=[[[7,1],[8,1],[9,1],[9,2],[8,2],[7,2],[7,1]],[[5,3],[5,4],[5,5],[4,5],[3,5],[4,5],[5,5],[5,4]]];
    let player={...start},cheese=false,key=false,alerts=3,moves=0,guardIndexes=[0,0],finished=false;
    const status=document.querySelector('[data-mouse-status]'),cheeseHud=document.querySelector('[data-mouse-cheese]');
    const keyHud=document.querySelector('[data-mouse-key]'),alertHud=document.querySelector('[data-mouse-alerts]'),moveHud=document.querySelector('[data-mouse-moves]');
    function guardPositions(){return patrols.map((route,i)=>route[guardIndexes[i]%route.length]);}
    const mouseSprite = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 39C2 44 4 29 10 28" fill="none" stroke="#6C625D" stroke-width="4" stroke-linecap="round"/><ellipse cx="33" cy="39" rx="19" ry="15" fill="#B7B9B1"/><circle cx="20" cy="19" r="11" fill="#C6BFB1"/><circle cx="42" cy="18" r="10" fill="#C6BFB1"/><circle cx="20" cy="19" r="5" fill="#D78D82"/><circle cx="42" cy="18" r="5" fill="#D78D82"/><ellipse cx="34" cy="30" rx="16" ry="13" fill="#D8D5C9"/><circle cx="29" cy="29" r="2.5" fill="#282B2D"/><circle cx="40" cy="29" r="2.5" fill="#282B2D"/><path d="M31 35q4 4 8 0" fill="none" stroke="#665B55" stroke-width="2" stroke-linecap="round"/><path d="M18 46q15 9 29-1l-3 9q-12 6-23-1Z" fill="#C8755D"/></svg>';
    const catSprite = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 26 11 8l16 10q7-3 14 0L55 8l-4 20q7 12-2 23-8 9-20 8-15-1-20-14-3-10 5-19Z" fill="#536B69"/><path d="M19 30q6-7 13 0M34 30q6-7 12 0" fill="none" stroke="#E9D9A5" stroke-width="4" stroke-linecap="round"/><circle cx="25" cy="32" r="2" fill="#182B2B"/><circle cx="41" cy="32" r="2" fill="#182B2B"/><path d="M28 41q5 5 10 0" fill="none" stroke="#E9D9A5" stroke-width="2" stroke-linecap="round"/><path d="M13 46q-8 8-2 13" fill="none" stroke="#C8755D" stroke-width="4" stroke-linecap="round"/></svg>';
    const cheeseSprite = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 26 53 11l5 31-43 13Z" fill="#EEC96F" stroke="#A57D45" stroke-width="3" stroke-linejoin="round"/><circle cx="25" cy="34" r="5" fill="#D5A64E"/><circle cx="42" cy="26" r="4" fill="#D5A64E"/><circle cx="34" cy="47" r="3" fill="#D5A64E"/></svg>';
    const keySprite = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="24" r="12" fill="none" stroke="#D8B65D" stroke-width="7"/><path d="M32 32 52 52m-7-7 6-6m-12 0 6-6" fill="none" stroke="#B58B4B" stroke-width="7" stroke-linecap="round"/></svg>';
    const doorSprite = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 55V13q20-12 40 0v42Z" fill="#A95F49" stroke="#69483F" stroke-width="3"/><path d="M20 55V20q12-8 24 0v35Z" fill="#E3C291"/><circle cx="38" cy="39" r="3" fill="#6C5648"/></svg>';
    function renderMouse(){
      const guards=guardPositions();mouseBoard.innerHTML='';
      map.forEach((row,y)=>[...row].forEach((cell,x)=>{
        const tile=document.createElement('div');tile.className='spy-cell';tile.setAttribute('role','gridcell');
        if(cell==='#'){tile.classList.add('spy-wall');tile.innerHTML='<span class="spy-stone-mark"></span>';}
        else if(player.x===x&&player.y===y){tile.classList.add('spy-player');tile.innerHTML=mouseSprite;tile.setAttribute('aria-label','Pip the mouse');}
        else if(guards.some(pos=>pos[0]===x&&pos[1]===y)){tile.classList.add('spy-guard');tile.innerHTML=catSprite;tile.setAttribute('aria-label','Lantern watcher');}
        else if(cell==='C'&&!cheese){tile.classList.add('spy-cheese');tile.innerHTML=cheeseSprite;}
        else if(cell==='K'&&!key){tile.classList.add('spy-key');tile.innerHTML=keySprite;}
        else if(cell==='E'){tile.classList.add('spy-exit');tile.innerHTML=doorSprite;}
        else{tile.classList.add('spy-floor');}
        mouseBoard.appendChild(tile);
      }));
      cheeseHud.textContent=cheese?'COLLECTED':'MISSING';keyHud.textContent=key?'COLLECTED':'MISSING';alertHud.textContent=String(alerts);moveHud.textContent=String(moves);
    }
    function resetMouse(){player={...start};cheese=false;key=false;alerts=3;moves=0;guardIndexes=[0,0];finished=false;status.textContent='Find the cheese and key. Avoid the patrols, then make it to the red exit.';renderMouse();}
    function moveMouse(dx,dy){
      if(finished)return;const nx=player.x+dx,ny=player.y+dy,cell=map[ny]?.[nx];
      if(!cell||cell==='#'){status.textContent='A wall! Try another corridor.';return;}
      if(cell==='E'&&(!cheese||!key)){status.textContent='The exit needs both the cheese and the little key.';return;}
      player={x:nx,y:ny};moves++;window.playGameSound?.('step');
      if(cell==='C'){cheese=true;window.playGameSound?.('collect');status.textContent='Cheese secured. One more thing to find.';}
      if(cell==='K'){key=true;window.playGameSound?.('collect');status.textContent='Key collected. Find the exit at the top-right.';}
      if(moves%2===0){
        guardIndexes=guardIndexes.map((n,i)=>(n+1)%patrols[i].length);
        if(guardPositions().some(pos=>pos[0]===player.x&&pos[1]===player.y)){
          alerts--;window.playGameSound?.('alert');
          if(alerts<=0){finished=true;status.textContent='The pantry patrol caught up. Start a fresh run and try a different route.';}
          else{player={...start};status.textContent='Spotted! You slipped back to the start. Alerts remaining: '+alerts+'.';}
        }
      }
      if(player.x===9&&player.y===1&&cheese&&key){finished=true;window.playGameSound?.('win');status.textContent='Perfect getaway! You found both treasures in '+moves+' moves.';}
      renderMouse();
    }
    document.querySelector('[data-mouse-reset]').addEventListener('click',resetMouse);
    document.querySelectorAll('[data-mouse-move]').forEach(button=>{
      const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
      button.addEventListener('click',()=>moveMouse(...dirs[button.dataset.mouseMove]));
    });
    document.addEventListener('keydown',event=>{
      const stage=document.querySelector('[data-arcade-stage="mouse"]');if(!stage||stage.hidden)return;
      const dirs={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
      if(dirs[event.key]){event.preventDefault();moveMouse(...dirs[event.key]);}
    });
    resetMouse();
  }

  /* Garden Lanes: place helpers, earn sunshine, and protect three garden lanes. */
  const gardenBoard=document.querySelector('[data-garden-board]');
  if(gardenBoard){
    const costs={bee:2,dew:3,sun:4},icons={bee:'<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="26" rx="13" ry="10" fill="#E8B64F"/><path d="M16 18 13 34m11-18-2 20m11-17 3 13" stroke="#4A4940" stroke-width="4" stroke-linecap="round"/><path d="M18 15q-8-13-12-2 4 9 12 5m12-3q8-13 12-2-4 9-12 5" fill="#D7E5D9"/></svg>',dew:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4Q9 25 12 32a12 12 0 0 0 24 0Q39 24 24 4Z" fill="#82B8C1" stroke="#456D73" stroke-width="2"/><path d="M19 29q0 6 5 7" fill="none" stroke="#EAF7EC" stroke-width="3" stroke-linecap="round"/></svg>',sun:'<svg viewBox="0 0 48 48" aria-hidden="true"><g stroke="#CDA24D" stroke-width="3"><path d="M24 3v8m0 26v8M3 24h8m26 0h8M9 9l6 6m18 18 6 6m0-30-6 6M15 33l-6 6"/></g><circle cx="24" cy="24" r="11" fill="#E9C66A"/><circle cx="24" cy="24" r="5" fill="#F6E3A0"/></svg>'},names={bee:'Bee Beacon',dew:'Dew Fountain',sun:'Sunflower'};
    let sun=8,turn=0,hearts=3,petals=0,selected='bee',helpers={},weeds=[],over=false;
    const sunHud=document.querySelector('[data-garden-sun]'),heartsHud=document.querySelector('[data-garden-hearts]');
    const turnHud=document.querySelector('[data-garden-turn]'),petalsHud=document.querySelector('[data-garden-petals]');
    const hint=document.querySelector('[data-garden-hint]'),status=document.querySelector('[data-garden-status]');
    const nextButton=document.querySelector('[data-garden-next]'),unitButtons=[...document.querySelectorAll('[data-garden-unit]')];
    const key=(row,col)=>row+'-'+col;
    function renderGarden(){
      gardenBoard.innerHTML='';const labels=['UPPER','MIDDLE','LOWER'];
      for(let row=0;row<3;row++){
        const lane=document.createElement('div');lane.className='garden-lane';
        const label=document.createElement('span');label.className='garden-lane-label';label.textContent=labels[row];lane.appendChild(label);
        const cells=document.createElement('div');cells.className='garden-lane-cells';
        for(let col=0;col<5;col++){
          const button=document.createElement('button');button.type='button';button.className='garden-cell';button.dataset.row=row;button.dataset.col=col;
          const helper=helpers[key(row,col)],hasWeed=weeds.some(w=>w.row===row&&w.col===col);
          if(helper)button.classList.add('has-helper');if(hasWeed)button.classList.add('has-weed');
          button.innerHTML='<span class="garden-helper-icon">'+(helper?icons[helper.type]:'')+'</span><span class="garden-weed-icon">'+(hasWeed?'<svg viewBox="0 0 36 36" aria-hidden="true"><path d="M18 33V15m0 10Q2 23 5 9q12-1 13 16m0-5Q17 7 31 5q4 13-13 18Z" fill="#7D9A6F" stroke="#42694E" stroke-width="2" stroke-linejoin="round"/></svg>':'')+'</span>';
          button.setAttribute('aria-label',labels[row]+' lane, tile '+(col+1)+(helper?', '+names[helper.type]:', empty')+(hasWeed?', weed':''));
          button.addEventListener('click',()=>buildGarden(row,col));cells.appendChild(button);
        }
        lane.appendChild(cells);gardenBoard.appendChild(lane);
      }
      sunHud.textContent=String(sun);heartsHud.textContent='♥ '.repeat(hearts).trim()||'0';turnHud.textContent=turn+' / 8';petalsHud.textContent=String(petals);
      nextButton.disabled=over;unitButtons.forEach(b=>{b.classList.toggle('is-selected',b.dataset.gardenUnit===selected);b.disabled=over;});
    }
    function buildGarden(row,col){
      if(over)return;const slot=key(row,col);
      if(helpers[slot]){status.textContent='That tile already has a helper. Pick an empty one.';return;}
      if(sun<costs[selected]){status.textContent='Not enough sunshine for that helper yet.';return;}
      helpers[slot]={type:selected};sun-=costs[selected];window.playGameSound?.('plant');status.textContent=names[selected]+' planted in the '+['upper','middle','lower'][row]+' lane.';
      hint.textContent='Good placement. Plant another helper or advance the season.';renderGarden();
    }
    function advanceGarden(){
      if(over)return;window.playGameSound?.('season');turn++;sun+=1+Object.values(helpers).filter(h=>h.type==='sun').length;
      const moved=[];
      weeds.forEach(w=>{const col=w.col-1;if(col<0)hearts--;else moved.push({row:w.row,col});});
      const cleared=new Set();
      moved.forEach((w,i)=>{
        const helper=helpers[key(w.row,w.col)];if(!helper)return;
        if(helper.type==='bee')cleared.add(i);
        if(helper.type==='dew')moved.forEach((other,j)=>{if(other.row===w.row&&Math.abs(other.col-w.col)<=1)cleared.add(j);});
      });
      petals+=cleared.size;sun+=cleared.size;
      weeds=moved.filter((w,i)=>!cleared.has(i)&&w.col>0);
      hearts-=moved.filter((w,i)=>w.col===0&&!cleared.has(i)).length;
      const lane=Math.floor(Math.random()*3),spawn=helpers[key(lane,4)];
      if(spawn&&(spawn.type==='bee'||spawn.type==='dew')){petals++;sun++;}
      else weeds.push({row:lane,col:4});
      if(hearts<=0){hearts=0;over=true;status.textContent='The garden needs a rest. Reset and try a different helper layout.';}
      else if(turn>=8){over=true;window.playGameSound?.('win');status.textContent='Eight turns complete — your garden is still blooming. Lovely strategy!';}
      else status.textContent='Season '+turn+' complete. Choose your next helper, then advance again.';
      renderGarden();
    }
    function resetGarden(){
      sun=8;turn=0;hearts=3;petals=0;selected='bee';helpers={};weeds=[];over=false;
      hint.textContent='Select a helper, then choose an empty tile. Helpers work automatically as weeds drift in.';
      status.textContent='Plant your first helper to get started.';renderGarden();
    }
    unitButtons.forEach(button=>button.addEventListener('click',()=>{
      if(over)return;selected=button.dataset.gardenUnit;hint.textContent=names[selected]+' costs '+costs[selected]+' sunshine. Choose an empty tile.';renderGarden();
    }));
    nextButton.addEventListener('click',advanceGarden);document.querySelector('[data-garden-reset]').addEventListener('click',resetGarden);resetGarden();
  }

  /* Resume chapter shortcuts open the relevant disclosure before scrolling. */
  document.querySelectorAll('[data-resume-jump]').forEach(link=>link.addEventListener('click',event=>{
    const id=link.getAttribute('href'),section=id?document.querySelector(id):null;if(!section)return;
    event.preventDefault();section.open=true;window.requestAnimationFrame(()=>section.scrollIntoView({behavior:'smooth',block:'start'}));history.replaceState(null,'',id);
  }));
});


/* The Wayfinder Atlas sound palette: soft wind-chimes, footsteps and garden notes. */
document.addEventListener('DOMContentLoaded', () => {
  const toggles = [...document.querySelectorAll('[data-sound-toggle]')];
  if (!toggles.length) return;
  let enabled = true, audio = null;
  const getAudio = () => {
    if (!audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audio = new AudioContext();
    }
    if (audio && audio.state === 'suspended') audio.resume();
    return audio;
  };
  const note = (frequency, duration=.16, delay=0, waveform='sine', volume=.04, slide=null) => {
    if (!enabled) return;
    const ctx = getAudio(); if (!ctx) return;
    const now = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(slide, now + duration);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain); gain.connect(ctx.destination);
    oscillator.start(now); oscillator.stop(now + duration + .03);
  };
  window.playGameSound = name => {
    if (!enabled) return;
    const patterns = {
      select: () => note(520,.07,0,'sine',.025,650),
      start: () => { note(392,.18,0,'sine',.035,523); note(587,.22,.12,'sine',.032,784); },
      echo: () => { note(659,.23,0,'sine',.04,784); note(988,.28,.07,'sine',.032,1175); },
      call: () => { note(392,.32,0,'sine',.04,523); note(659,.36,.10,'sine',.032,784); note(988,.42,.22,'sine',.026,1175); },
      step: () => note(245,.055,0,'triangle',.018,195),
      collect: () => { note(587,.13,0,'sine',.035); note(784,.18,.09,'sine',.03); },
      alert: () => { note(330,.12,0,'triangle',.025,260); note(246,.16,.10,'triangle',.022,196); },
      plant: () => { note(392,.16,0,'sine',.026); note(523,.2,.08,'sine',.025); note(659,.2,.16,'sine',.022); },
      season: () => { note(392,.17,0,'sine',.028); note(494,.17,.10,'sine',.026); note(587,.2,.20,'sine',.024); },
      win: () => { note(523,.25,0,'sine',.04); note(659,.25,.12,'sine',.035); note(784,.34,.24,'sine',.032); note(1046,.42,.38,'sine',.026); },
      back: () => { note(587,.08,0,'sine',.02,440); }
    };
    (patterns[name] || patterns.select)();
  };
  const refresh = () => toggles.forEach(button => {
    button.textContent = enabled ? 'Sound: On ♪' : 'Sound: Off';
    button.setAttribute('aria-pressed', String(enabled));
  });
  toggles.forEach(button => button.addEventListener('click', () => {
    enabled = !enabled; refresh();
    if (enabled) window.playGameSound('select');
  }));
  document.querySelectorAll('[data-open-game]').forEach(button => button.addEventListener('click', () => window.playGameSound('select')));
  document.querySelectorAll('[data-arcade-back]').forEach(button => button.addEventListener('click', () => window.playGameSound('back')));
  document.querySelectorAll('[data-garden-unit]').forEach(button => button.addEventListener('click', () => window.playGameSound('select')));
  refresh();
});
