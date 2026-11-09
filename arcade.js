/* Dune Drift + Saily Seas — two original endless-runner games. */
document.addEventListener('DOMContentLoaded', () => {
  const lobby = document.querySelector('[data-arcade-lobby]');
  if (!lobby) return;

  const stages = [...document.querySelectorAll('[data-arcade-stage]')];
  const openStage = id => {
    lobby.hidden = true;
    stages.forEach(stage => { stage.hidden = stage.dataset.arcadeStage !== id; });
    window.playGameSound?.('start');
  };
  const returnToLobby = () => {
    stages.forEach(stage => { stage.hidden = true; });
    lobby.hidden = false;
    window.playGameSound?.('back');
  };
  document.querySelectorAll('[data-open-game]').forEach(button => {
    button.addEventListener('click', () => openStage(button.dataset.openGame));
  });
  document.querySelectorAll('[data-arcade-back]').forEach(button => {
    button.addEventListener('click', returnToLobby);
  });

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const random = (min, max) => min + Math.random() * (max - min);
  const fitText = (ctx, text, x, y, color, font='700 12px DM Sans, Arial') => {
    ctx.font = font; ctx.fillStyle = color; ctx.fillText(text, x, y);
  };
  const makeImage = src => {
    const img = new Image();
    img.src = src;
    return img;
  };

  /* -----------------------------------------------------------
     DUNE DRIFT — sandboarding, jumps, held tricks and biomes.
  ----------------------------------------------------------- */
  const duneCanvas = document.getElementById('dune-canvas');
  if (duneCanvas) {
    const ctx = duneCanvas.getContext('2d');
    const W = 960, H = 440, playerX = 205;
    const scene = makeImage('/assets/dune-drift-scene.svg');
    const overlay = document.querySelector('[data-dune-overlay]');
    const overlayTitle = document.querySelector('[data-dune-overlay-title]');
    const overlayCopy = document.querySelector('[data-dune-overlay-copy]');
    const startBtn = document.querySelector('[data-dune-start]');
    const status = document.querySelector('[data-dune-status]');
    const distanceHud = document.querySelector('[data-dune-distance]');
    const shardsHud = document.querySelector('[data-dune-shards]');
    const bestHud = document.querySelector('[data-dune-best]');
    const biomeHud = document.querySelector('[data-dune-biome]');
    const characterButtons = [...document.querySelectorAll('[data-dune-character]')];
    const bestKey = 'aayan-dune-drift-best';
    const stats = {
      sol: {name:'Sol', jump:1, glide:1, speed:1, color:'#b96d54', scarf:'#79aaa3'},
      mira: {name:'Mira', jump:1.08, glide:1.32, speed:.96, color:'#d2a45d', scarf:'#6b9891'},
      tavi: {name:'Tavi', jump:.96, glide:.92, speed:1.12, color:'#71877f', scarf:'#d98b69'}
    };
    let character = 'sol';
    let state = null;
    let running = false, raf = 0, lastTime = 0, trickHeld = false;

    const getBest = () => { try { return Number(localStorage.getItem(bestKey) || 0); } catch (_) { return 0; } };
    const setBest = value => { try { localStorage.setItem(bestKey, String(value)); } catch (_) {} };
    const biomeFor = distance => distance < 900 ? 'DUNES' : distance < 2100 ? 'CANYON' : 'OASIS';
    const groundY = (x, offset) => 333
      + Math.sin((x + offset) / 156) * 24
      + Math.sin((x + offset) / 61) * 7
      + Math.sin((x + offset) / 310) * 10;

    function newDuneRun() {
      state = {
        distance:0, shards:0, points:0, speed:260 * stats[character].speed,
        playerY:groundY(playerX,0)-23, vy:0, onGround:true,
        trickTime:0, trickHeld:false, rotation:0, trickScore:0,
        obstacles:[], shardsList:[], dust:[], spawn:0, shardSpawn:0,
        elapsed:0, biome:'DUNES', finished:false, lastShard:0
      };
      updateDuneHud();
      drawDune();
    }
    function updateDuneHud() {
      if (!state) return;
      distanceHud.textContent = Math.floor(state.distance) + ' m';
      shardsHud.textContent = String(state.shards);
      bestHud.textContent = Math.floor(getBest()) + ' m';
      const biome = biomeFor(state.distance);
      biomeHud.textContent = biome;
      if (biome !== state.biome) {
        state.biome = biome;
        status.textContent = biome === 'CANYON'
          ? 'The canyon opens ahead. Watch the old stone arches.'
          : biome === 'OASIS'
            ? 'An oasis in the distance. Keep your rhythm.'
            : 'The dunes are calling. Find your line.';
      }
    }
    function duneJump() {
      if (!running || !state || !state.onGround) return;
      state.onGround = false;
      state.vy = -500 * stats[character].jump;
      state.trickScore = 0;
      window.playGameSound?.('jump');
    }
    function setTrick(on) {
      trickHeld = on;
      if (state) state.trickHeld = on;
    }

    function spawnDuneItems() {
      if (state.spawn <= 0) {
        const type = Math.random() < .25 ? 'pillar' : Math.random() < .7 ? 'rock' : 'shrub';
        state.obstacles.push({x:W+30, type, passed:false, height:type==='pillar'?65:type==='rock'?24:34});
        state.spawn = random(1.05,1.6) * (290 / state.speed);
      }
      if (state.shardSpawn <= 0) {
        const count = 3 + Math.floor(Math.random()*3);
        const baseY = groundY(W-50, state.distance*1.55) - random(72,128);
        for (let i=0;i<count;i++) state.shardsList.push({x:W+20+i*38,y:baseY-Math.sin((i/(count-1))*Math.PI)*24,taken:false});
        state.shardSpawn = random(1.45,2.25) * (290 / state.speed);
      }
    }
    function drawDune() {
      if (!ctx || !state) return;
      const biome = biomeFor(state.distance);
      if (scene.complete && scene.naturalWidth) ctx.drawImage(scene,0,0,W,H);
      else {
        const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#92bcc0');g.addColorStop(1,'#f1bd8d');
        ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      }
      if (biome==='CANYON') {
        ctx.fillStyle='rgba(104,93,75,.19)';
        ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(80,0);ctx.lineTo(170,260);ctx.lineTo(0,300);ctx.fill();
        ctx.beginPath();ctx.moveTo(960,0);ctx.lineTo(860,0);ctx.lineTo(760,250);ctx.lineTo(960,300);ctx.fill();
      } else if (biome==='OASIS') {
        ctx.fillStyle='rgba(114,165,133,.15)';ctx.fillRect(0,160,W,250);
      }
      const offset=state.distance*1.55;
      ctx.beginPath();ctx.moveTo(0,H);
      for(let x=0;x<=W;x+=8) ctx.lineTo(x,groundY(x,offset));
      ctx.lineTo(W,H);ctx.closePath();
      const sand=ctx.createLinearGradient(0,300,0,H);
      sand.addColorStop(0,biome==='OASIS'?'#b2ad78':'#dfaa79');
      sand.addColorStop(1,biome==='CANYON'?'#916d5b':'#a86153');
      ctx.fillStyle=sand;ctx.fill();
      ctx.strokeStyle='rgba(255,230,183,.65)';ctx.lineWidth=4;
      ctx.beginPath();for(let x=0;x<=W;x+=8){const y=groundY(x,offset);if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();

      // Distant marker stones and shrubs drift past at a slower parallax.
      for(let i=0;i<7;i++){
        const x=((i*183 - offset*.28)%(W+160)+W+160)%(W+160)-40;
        const y=groundY(x,offset)-8;
        ctx.fillStyle=biome==='CANYON'?'#8d7863':'#82917b';
        ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x-6,y-37-(i%2)*13);ctx.lineTo(x+6,y-42);ctx.lineTo(x+15,y);ctx.closePath();ctx.fill();
      }
      state.obstacles.forEach(o=>{
        const x=o.x,y=groundY(x,offset);
        if(o.type==='rock'){
          ctx.fillStyle='#796f5f';ctx.beginPath();ctx.moveTo(x-22,y);ctx.lineTo(x-17,y-17);ctx.lineTo(x-4,y-29);ctx.lineTo(x+11,y-24);ctx.lineTo(x+23,y);ctx.closePath();ctx.fill();
          ctx.fillStyle='rgba(255,236,195,.25)';ctx.beginPath();ctx.moveTo(x-14,y-6);ctx.lineTo(x-7,y-21);ctx.lineTo(x+1,y-23);ctx.lineTo(x-4,y-5);ctx.fill();
        } else if(o.type==='pillar'){
          ctx.fillStyle='#90765e';ctx.fillRect(x-10,y-o.height,20,o.height);
          ctx.fillStyle='#b99b78';ctx.fillRect(x-18,y-o.height-9,36,10);
          ctx.fillStyle='rgba(255,239,198,.4)';ctx.fillRect(x-8,y-o.height+5,4,o.height-8);
        } else {
          ctx.strokeStyle='#607b68';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y-26);ctx.moveTo(x-4,y-12);ctx.lineTo(x-18,y-24);ctx.moveTo(x-3,y-17);ctx.lineTo(x+12,y-29);ctx.stroke();
        }
      });
      state.shardsList.forEach(sh=>{
        if(sh.taken)return;
        ctx.save();ctx.translate(sh.x,sh.y+Math.sin(state.elapsed*4+sh.x*.01)*4);ctx.rotate(Math.PI/4);
        ctx.fillStyle='rgba(255,239,177,.22)';ctx.fillRect(-15,-15,30,30);
        ctx.fillStyle='#fff0b1';ctx.fillRect(-7,-7,14,14);
        ctx.strokeStyle='#dcae63';ctx.lineWidth=2;ctx.strokeRect(-7,-7,14,14);ctx.restore();
      });

      // The rider is an original little silhouette with a long scarf and sandboard.
      const pY=state.playerY;
      ctx.save();ctx.translate(playerX,pY);ctx.rotate(state.rotation);
      ctx.fillStyle='rgba(76,54,45,.23)';ctx.beginPath();ctx.ellipse(0,31,34,6,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#6b4d42';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-34,22);ctx.quadraticCurveTo(0,29,37,17);ctx.stroke();
      ctx.fillStyle='#d6a56a';ctx.beginPath();ctx.moveTo(-18,7);ctx.quadraticCurveTo(-28,-16,-7,-37);ctx.quadraticCurveTo(17,-38,21,5);ctx.quadraticCurveTo(0,19,-18,7);ctx.fill();
      ctx.fillStyle=stats[character].color;ctx.beginPath();ctx.moveTo(-13,-4);ctx.quadraticCurveTo(-31,18,-18,27);ctx.lineTo(19,24);ctx.quadraticCurveTo(27,1,12,-13);ctx.quadraticCurveTo(1,-23,-13,-4);ctx.fill();
      ctx.fillStyle='#dcae82';ctx.beginPath();ctx.arc(0,-33,12,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#536d68';ctx.beginPath();ctx.moveTo(-12,-36);ctx.quadraticCurveTo(-15,-54,1,-56);ctx.quadraticCurveTo(16,-52,13,-35);ctx.quadraticCurveTo(1,-43,-12,-36);ctx.fill();
      ctx.strokeStyle=stats[character].scarf;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-9,-12);ctx.quadraticCurveTo(-34,-29,-57,-18-Math.sin(state.elapsed*7)*8);ctx.stroke();
      ctx.strokeStyle='#d99b6c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-6,20);ctx.lineTo(-18,29);ctx.moveTo(9,20);ctx.lineTo(21,25);ctx.stroke();
      if(state.trickHeld&&!state.onGround){ctx.strokeStyle='#fff0b1';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-4,36,-.9,.9);ctx.stroke();}
      ctx.restore();

      // Dust follows the board but never obscures the track.
      state.dust.forEach(d=>{
        ctx.globalAlpha=clamp(d.life,0,1)*.35;ctx.fillStyle='#fff0c7';ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill();
      });
      ctx.globalAlpha=1;
      fitText(ctx,'BIOME  '+biome,24,30,'rgba(255,250,231,.9)','800 12px DM Sans, Arial');
      fitText(ctx,state.trickHeld?'HOLDING THE LINE':'TAP TO JUMP · HOLD TRICK','24',0,'rgba(255,250,231,.0)'); // harmless font reset
    }
    function finishDune(message) {
      if (!running) return;
      running=false;state.finished=true;
      const score=Math.floor(state.distance);
      if(score>getBest())setBest(score);
      overlay.hidden=false;
      overlayTitle.textContent='The horizon can wait.';
      overlayCopy.textContent=message+' You rode '+score+' m and found '+state.shards+' sunshards.';
      startBtn.textContent='Ride again ↗';
      status.textContent=message;
      window.playGameSound?.('bump');
      updateDuneHud();drawDune();
      if(raf)cancelAnimationFrame(raf);raf=0;
    }
    function tickDune(now) {
      if(!running||!state)return;
      const dt=Math.min(.04,Math.max(.001,(now-lastTime)/1000));lastTime=now;
      state.elapsed+=dt;
      state.speed=Math.min(390,260*stats[character].speed+state.distance*.012);
      state.distance+=state.speed*dt*.25;
      state.spawn-=dt;state.shardSpawn-=dt;spawnDuneItems();
      const offset=state.distance*1.55;
      state.vy+=1120*dt;
      state.playerY+=state.vy*dt;
      const floor=groundY(playerX,offset)-22;
      if(state.playerY>=floor){
        if(!state.onGround&&state.trickHeld){state.trickScore+=120;state.points+=120;status.textContent='Clean landing! +120 trick points.';window.playGameSound?.('trick');}
        state.playerY=floor;state.vy=0;state.onGround=true;state.rotation=0;state.trickTime=0;
      } else {
        state.onGround=false;
        if(state.trickHeld){state.trickTime+=dt;state.rotation+=dt*4.2;}
      }
      state.obstacles.forEach(o=>{
        o.x-=state.speed*dt;
        const obstacleY=groundY(o.x,offset);
        if(!o.passed&&o.x<playerX+24&&o.x>playerX-28){
          if(state.playerY+18>obstacleY-o.height+5 || (o.type==='shrub'&&state.playerY+22>obstacleY-26)){
            finishDune('A rocky turn sent you back to the sand.');return;
          }
          o.passed=true;state.points+=20;
        }
      });
      state.shardsList.forEach(sh=>{
        sh.x-=state.speed*dt;
        if(!sh.taken&&Math.hypot(sh.x-playerX,sh.y-(state.playerY-8))<28){
          sh.taken=true;state.shards++;state.points+=45;window.playGameSound?.('collect');
        }
      });
      state.obstacles=state.obstacles.filter(o=>o.x>-55);
      state.shardsList=state.shardsList.filter(sh=>sh.x>-25&&!sh.taken);
      state.dust.push({x:playerX-25+random(-5,5),y:floor+20,r:random(2,5),life:1});
      state.dust.forEach(d=>{d.x-=state.speed*dt*.45;d.y+=random(-5,8)*dt;d.life-=dt*.8;});
      state.dust=state.dust.filter(d=>d.life>0);
      if(running){updateDuneHud();drawDune();raf=requestAnimationFrame(tickDune);}
    }
    function startDune() {
      if(running)return;
      newDuneRun();running=true;overlay.hidden=true;
      status.textContent='Find your rhythm. The first rise is just ahead.';
      lastTime=performance.now();raf=requestAnimationFrame(tickDune);
    }
    function resetDune() {
      if(raf)cancelAnimationFrame(raf);raf=0;running=false;newDuneRun();
      overlay.hidden=false;overlayTitle.textContent='Take the long way.';
      overlayCopy.textContent='Collect sunshards, jump the rocks and keep your board flowing.';
      startBtn.textContent='Start riding ↗';
      status.textContent='Choose a traveller, then start your ride.';
    }
    startBtn.addEventListener('click',startDune);
    document.querySelector('[data-dune-reset]').addEventListener('click',resetDune);
    document.querySelector('[data-dune-jump]').addEventListener('click',duneJump);
    const trickBtn=document.querySelector('[data-dune-trick]');
    trickBtn.addEventListener('pointerdown',e=>{e.preventDefault();setTrick(true);});
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>trickBtn.addEventListener(ev,()=>setTrick(false)));
    duneCanvas.addEventListener('pointerdown',()=>duneJump());
    characterButtons.forEach(button=>button.addEventListener('click',()=>{
      if(running)return;
      character=button.dataset.duneCharacter;
      characterButtons.forEach(b=>b.classList.toggle('is-selected',b===button));
      status.textContent=stats[character].name+' is ready for the ride.';
      newDuneRun();
    }));
    document.addEventListener('keydown',e=>{
      const stage=document.querySelector('[data-arcade-stage="dune"]');
      if(!stage||stage.hidden)return;
      if(e.code==='Space'){e.preventDefault();duneJump();}
      if(e.code==='ArrowDown'){e.preventDefault();setTrick(true);}
    });
    document.addEventListener('keyup',e=>{if(e.code==='ArrowDown')setTrick(false);});
    scene.onload=()=>{if(!running)drawDune();};
    newDuneRun();
  }

  /* -----------------------------------------------------------
     SAILY SEAS — sail, jump, glide, dive and gather sea finds.
  ----------------------------------------------------------- */
  const seaCanvas=document.getElementById('saily-canvas');
  if(seaCanvas) {
    const ctx=seaCanvas.getContext('2d');
    const W=960,H=440,boatX=228;
    const scene=makeImage('/assets/saily-seas-scene.svg');
    const overlay=document.querySelector('[data-saily-overlay]');
    const title=document.querySelector('[data-saily-overlay-title]');
    const copy=document.querySelector('[data-saily-overlay-copy]');
    const startBtn=document.querySelector('[data-saily-start]');
    const status=document.querySelector('[data-saily-status]');
    const distanceHud=document.querySelector('[data-saily-distance]');
    const findsHud=document.querySelector('[data-saily-finds]');
    const bestHud=document.querySelector('[data-saily-best]');
    const windHud=document.querySelector('[data-saily-wind]');
    const upgradesPanel=document.querySelector('[data-saily-upgrades]');
    const upgradesButtons=[...document.querySelectorAll('[data-saily-upgrade]')];
    const bestKey='aayan-saily-seas-best',upgradeKey='aayan-saily-seas-upgrades',shellKey='aayan-saily-seas-shells';
    const safeRead=(key,fallback)=>{try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v);}catch(_){return fallback;}};
    const save=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}};
    const getBest=()=>{try{return Number(localStorage.getItem(bestKey)||0);}catch(_){return 0;}};
    const setBest=v=>{try{localStorage.setItem(bestKey,String(v));}catch(_){}};
    let upgrades=safeRead(upgradeKey,{sail:0,glide:0,dive:0});
    let shells=Number(safeRead(shellKey,0));
    let state=null,running=false,raf=0,lastTime=0,sailHeld=false,diveHeld=false;

    const waveY=(x,offset)=>267+Math.sin((x+offset)/75)*18+Math.sin((x+offset)/151)*12+Math.sin((x+offset)/35)*4;
    function newSeaRun(){
      state={distance:0,finds:0,fish:0,birds:0,speed:195,boatY:waveY(boatX,0)-14,vy:0,
        air:false,diving:false,elapsed:0,offset:0,spawn:0,items:[],obstacles:[],
        slowTime:0,finished:false,biome:'OPEN SEA',wind:0,sailOn:false};
      updateSeaHud();drawSea();
    }
    function updateSeaHud(){
      distanceHud.textContent=Math.floor(state.distance)+' m';
      findsHud.textContent=String(state.finds);
      bestHud.textContent=Math.floor(getBest())+' m';
      windHud.textContent=sailHeld?'FULL SAIL':state.speed<155?'LIGHT WIND':state.speed>260?'TAILWIND':'STEADY';
    }
    function seaJump(){
      if(!running||!state||state.air||state.diving)return;
      state.air=true;state.vy=-390;window.playGameSound?.('jump');
      status.textContent='Catch the lift. Keep the sail open to glide.';
    }
    function setSail(on){
      sailHeld=on;
      if(state)state.sailOn=on;
      const button=document.querySelector('[data-saily-sail]');
      button.setAttribute('aria-pressed',String(on));
      button.classList.toggle('is-held',on);
      if(on&&running)window.playGameSound?.('wind');
    }
    function setDive(on){
      diveHeld=on;
      if(state){state.diving=on&&!state.air; if(on&&state.air){state.vy=Math.max(state.vy,80);}}
      const button=document.querySelector('[data-saily-dive]');
      button.setAttribute('aria-pressed',String(on));
      button.classList.toggle('is-held',on);
      if(on&&running)window.playGameSound?.('splash');
    }
    function spawnSeaItems(){
      if(state.spawn<=0){
        state.obstacles.push({x:W+50,type:Math.random()<.55?'reef':'driftwood'});
        state.spawn=random(1.45,2.2);
      }
      if(Math.random()<.055){
        const bird=Math.random()<.42;
        state.items.push({x:W+40,y:bird?random(130,185):random(320,360),type:bird?'bird':'fish',taken:false});
      }
    }
    function drawSea(){
      if(!ctx||!state)return;
      if(scene.complete&&scene.naturalWidth)ctx.drawImage(scene,0,0,W,H);
      else {const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#9fc8ce');g.addColorStop(1,'#285b70');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
      const offset=state.distance*1.15;
      // Distant wind and seabirds.
      ctx.strokeStyle='rgba(255,251,227,.7)';ctx.lineWidth=3;
      for(let i=0;i<4;i++){
        const x=((i*260-offset*.3)%(W+80)+W+80)%(W+80)-20;
        ctx.beginPath();ctx.moveTo(x,90+i%2*35);ctx.quadraticCurveTo(x+10,80+i%2*35,x+20,90+i%2*35);ctx.quadraticCurveTo(x+30,100+i%2*35,x+40,90+i%2*35);ctx.stroke();
      }
      // The water has three layers and a moving, hand-drawn wave line.
      for(let layer=0;layer<3;layer++){
        const base=waveY(0,offset)+layer*48;
        ctx.beginPath();ctx.moveTo(0,H);
        for(let x=0;x<=W;x+=8){
          const y=waveY(x,offset)+layer*48+Math.sin((x+offset*.6)/120+layer)*5;
          ctx.lineTo(x,y);
        }
        ctx.lineTo(W,H);ctx.closePath();
        ctx.fillStyle=layer===0?'rgba(66,139,148,.92)':layer===1?'rgba(43,105,124,.92)':'rgba(27,66,91,.97)';ctx.fill();
        ctx.strokeStyle=layer===0?'rgba(227,246,222,.72)':'rgba(150,207,202,.28)';
        ctx.lineWidth=layer===0?4:2;ctx.beginPath();
        for(let x=0;x<=W;x+=8){const y=waveY(x,offset)+layer*48+Math.sin((x+offset*.6)/120+layer)*5;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
      }
      // A soft current trail shows how much wind the sail has gathered.
      if(sailHeld){
        ctx.strokeStyle='rgba(255,239,192,.6)';ctx.lineWidth=3;ctx.setLineDash([11,13]);
        ctx.beginPath();ctx.moveTo(25,boatY+5);ctx.quadraticCurveTo(90,boatY-20,150,boatY+5);ctx.stroke();ctx.setLineDash([]);
      }
      state.obstacles.forEach(o=>{
        const surface=waveY(o.x,offset);
        if(o.type==='reef'){
          ctx.fillStyle='#587d7c';ctx.beginPath();ctx.moveTo(o.x-30,surface+4);ctx.lineTo(o.x-15,surface-25);ctx.lineTo(o.x,surface-37);ctx.lineTo(o.x+20,surface-15);ctx.lineTo(o.x+35,surface+6);ctx.closePath();ctx.fill();
          ctx.fillStyle='rgba(240,231,198,.35)';ctx.beginPath();ctx.moveTo(o.x-15,surface-20);ctx.lineTo(o.x,surface-34);ctx.lineTo(o.x+8,surface-12);ctx.fill();
        } else {
          ctx.save();ctx.translate(o.x,surface-8);ctx.rotate(-.13);
          ctx.fillStyle='#a56f56';ctx.beginPath();ctx.roundRect(-35,-7,70,15,7);ctx.fill();
          ctx.fillStyle='#d6a17a';ctx.beginPath();ctx.roundRect(-22,-6,22,5,2);ctx.fill();ctx.restore();
        }
      });
      state.items.forEach(item=>{
        if(item.taken)return;
        if(item.type==='fish'){
          ctx.save();ctx.translate(item.x,item.y);ctx.fillStyle='#f1d77f';ctx.beginPath();ctx.ellipse(0,0,13,7,0,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-22,-8);ctx.lineTo(-22,8);ctx.closePath();ctx.fill();
          ctx.fillStyle='#244d5c';ctx.beginPath();ctx.arc(6,-1,1.8,0,Math.PI*2);ctx.fill();ctx.restore();
        } else {
          ctx.save();ctx.translate(item.x,item.y);ctx.fillStyle='#fff4d1';ctx.beginPath();ctx.ellipse(0,0,11,5,0,0,Math.PI*2);ctx.fill();
          ctx.beginPath();ctx.moveTo(-2,0);ctx.quadraticCurveTo(-8,-13,-19,-12);ctx.quadraticCurveTo(-14,-3,-2,0);ctx.quadraticCurveTo(7,-14,18,-9);ctx.quadraticCurveTo(12,-2,-2,0);ctx.fill();ctx.restore();
        }
      });
      // The sailboat and little triangular sail.
      const bx=boatX,by=state.boatY;
      ctx.save();ctx.translate(bx,by);
      ctx.fillStyle='rgba(20,43,52,.2)';ctx.beginPath();ctx.ellipse(0,29,46,7,0,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#915d49';ctx.beginPath();ctx.moveTo(-40,0);ctx.quadraticCurveTo(-5,17,42,0);ctx.lineTo(28,17);ctx.quadraticCurveTo(-9,27,-30,14);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#674b41';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-4,-8);ctx.lineTo(-4,-75);ctx.stroke();
      ctx.fillStyle='#f1e2bd';ctx.beginPath();ctx.moveTo(-1,-70);ctx.lineTo(-1,-12);ctx.lineTo(35,-15);ctx.closePath();ctx.fill();
      ctx.fillStyle='#e28a62';ctx.beginPath();ctx.moveTo(-8,-65);ctx.lineTo(-8,-19);ctx.lineTo(-32,-23);ctx.closePath();ctx.fill();
      if(sailHeld){ctx.strokeStyle='#f6d77d';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-73);ctx.quadraticCurveTo(28,-88,48,-63);ctx.stroke();}
      ctx.fillStyle='#b8755c';ctx.beginPath();ctx.arc(-5,-10,7,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#415c5c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-6,-2);ctx.lineTo(-12,7);ctx.stroke();
      ctx.restore();
      if(state.diving){
        ctx.fillStyle='rgba(207,240,225,.5)';
        for(let i=0;i<5;i++){const x=bx+random(-30,30),y=by+random(-12,12);ctx.beginPath();ctx.arc(x,y,random(2,5),0,Math.PI*2);ctx.fill();}
      }
      fitText(ctx,'WIND IS A LITTLE PROMISE',24,30,'rgba(255,250,230,.9)','800 12px DM Sans, Arial');
    }
    function finishSea(message){
      if(!running)return;
      running=false;state.finished=true;
      const distance=Math.floor(state.distance);
      if(distance>getBest())setBest(distance);
      shells+=state.finds;save(shellKey,shells);
      overlay.hidden=false;title.textContent='A lovely voyage.';
      copy.textContent=message+' You sailed '+distance+' m and found '+state.finds+' little treasures.';
      startBtn.textContent='Sail again ↗';
      upgradesPanel.hidden=shells<5;
      status.textContent=message;
      window.playGameSound?.('bump');
      updateSeaHud();drawSea();
      if(raf)cancelAnimationFrame(raf);raf=0;
    }
    function tickSea(now){
      if(!running||!state)return;
      const dt=Math.min(.04,Math.max(.001,(now-lastTime)/1000));lastTime=now;
      state.elapsed+=dt;
      const windBonus=sailHeld?(58+upgrades.sail*22):0;
      const desired=195+windBonus+(state.air&&sailHeld?25+upgrades.glide*15:0);
      state.speed+=(desired-state.speed)*Math.min(1,dt*1.4);
      if(state.speed<135)state.slowTime+=dt;else state.slowTime=Math.max(0,state.slowTime-dt*.7);
      state.distance+=state.speed*dt*.27;
      state.offset+=state.speed*dt;
      state.spawn-=dt;spawnSeaItems();
      const surface=waveY(boatX,state.offset);
      if(state.air){
        state.vy+=(sailHeld?-350:850)*dt;
        state.boatY+=state.vy*dt;
        if(state.boatY>=surface-14){state.boatY=surface-14;state.vy=0;state.air=false;status.textContent='Nice landing. Catch the next wave.';}
      }else if(state.diving){
        state.boatY+=(surface+68-state.boatY)*Math.min(1,dt*6);
      }else{
        state.boatY+=(surface-14-state.boatY)*Math.min(1,dt*7);
      }
      state.obstacles.forEach(o=>{
        o.x-=state.speed*dt;
        if(Math.abs(o.x-boatX)<35){
          const canPass=state.air&&state.boatY<surface-62 || state.diving&&o.type==='driftwood';
          if(!canPass){finishSea('A reef interrupts the voyage. There is always another tide.');return;}
        }
      });
      state.items.forEach(item=>{
        item.x-=state.speed*dt;
        if(!item.taken&&Math.abs(item.x-boatX)<30){
          const playerY=state.boatY;
          const near=Math.abs(item.y-playerY)<(item.type==='fish'?84:95);
          if(near&&(item.type==='fish'?state.diving:state.air)){
            item.taken=true;state.finds++;if(item.type==='fish')state.fish++;else state.birds++;
            window.playGameSound?.(item.type==='fish'?'splash':'bird');
            status.textContent=item.type==='fish'?'A silver fish joined the journey.':'A seabird flew alongside you.';
          }
        }
      });
      state.obstacles=state.obstacles.filter(o=>o.x>-80);
      state.items=state.items.filter(i=>i.x>-40&&!i.taken);
      if(state.slowTime>5){finishSea('The wind grew quiet and the swell caught up.');return;}
      if(running){updateSeaHud();drawSea();raf=requestAnimationFrame(tickSea);}
    }
    function startSea(){
      if(running)return;
      newSeaRun();running=true;overlay.hidden=true;upgradesPanel.hidden=true;
      status.textContent='Hold Sail to build speed. Jump for birds, dive for fish.';
      lastTime=performance.now();raf=requestAnimationFrame(tickSea);
    }
    function resetSea(){
      if(raf)cancelAnimationFrame(raf);raf=0;running=false;newSeaRun();
      overlay.hidden=false;title.textContent='Follow the wind.';
      copy.textContent='Raise your sail, ride the waves, and see how far the little boat can go.';
      startBtn.textContent='Set sail ↗';upgradesPanel.hidden=true;
    }
    function bindHold(button,onDown,onUp){
      button.addEventListener('pointerdown',e=>{e.preventDefault();onDown();});
      ['pointerup','pointercancel','pointerleave'].forEach(ev=>button.addEventListener(ev,onUp));
    }
    startBtn.addEventListener('click',startSea);
    document.querySelector('[data-saily-reset]').addEventListener('click',resetSea);
    document.querySelector('[data-saily-jump]').addEventListener('click',seaJump);
    bindHold(document.querySelector('[data-saily-sail]'),()=>setSail(true),()=>setSail(false));
    bindHold(document.querySelector('[data-saily-dive]'),()=>setDive(true),()=>setDive(false));
    seaCanvas.addEventListener('pointerdown',seaJump);
    upgradesButtons.forEach(button=>button.addEventListener('click',()=>{
      const type=button.dataset.sailyUpgrade;
      if(shells<5||upgrades[type]>=2)return;
      shells-=5;upgrades[type]++;save(shellKey,shells);save(upgradeKey,upgrades);
      status.textContent=type==='sail'?'The sail catches the wind a little faster.':type==='glide'?'Your glide lasts a little longer.':'The deeper current reveals more fish.';
      button.disabled=upgrades[type]>=2||shells<5;
    }));
    document.addEventListener('keydown',e=>{
      const stage=document.querySelector('[data-arcade-stage="saily"]');
      if(!stage||stage.hidden)return;
      if(e.code==='Space'){e.preventDefault();seaJump();}
      if(e.key.toLowerCase()==='w'&&!sailHeld){e.preventDefault();setSail(true);}
      if(e.key==='ArrowDown'&&!diveHeld){e.preventDefault();setDive(true);}
    });
    document.addEventListener('keyup',e=>{
      if(e.key.toLowerCase()==='w')setSail(false);
      if(e.key==='ArrowDown')setDive(false);
    });
    scene.onload=()=>{if(!running)drawSea();};
    upgradesButtons.forEach(button=>{button.disabled=upgrades[button.dataset.sailyUpgrade]>=2||shells<5;});
    newSeaRun();
  }
});
