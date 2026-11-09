import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js';

document.addEventListener('DOMContentLoaded',()=>{
 const lobby=document.querySelector('[data-arcade-lobby]');if(!lobby)return;
 const stages=[...document.querySelectorAll('[data-arcade-stage]')];let dune=null,sea=null;
 const snd=n=>window.playGameSound?.(n),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);
 const mat=(c,r=.82,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 function rendererFor(old){
  const wrap=old.parentElement,r=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(devicePixelRatio||1,1.7));r.outputColorSpace=THREE.SRGBColorSpace;
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  r.domElement.setAttribute('aria-label',old.getAttribute('aria-label')||'Interactive 3D game');r.domElement.style.cssText='display:block;width:100%;height:auto';
  old.replaceWith(r.domElement);
  const resize=()=>r.setSize(Math.max(320,wrap.clientWidth||960),Math.max(147,(wrap.clientWidth||960)*440/960),false);
  const ob=new ResizeObserver(resize);ob.observe(wrap);resize();return {r,dispose:()=>{ob.disconnect();r.dispose();}};
 }
 function lighting(scene,sky,ground){
  scene.add(new THREE.HemisphereLight(sky,ground,1.65));
  const l=new THREE.DirectionalLight(0xffe6c4,2.35);l.position.set(-25,38,18);l.castShadow=true;
  l.shadow.mapSize.set(1536,1536);l.shadow.camera.left=-55;l.shadow.camera.right=55;l.shadow.camera.top=55;l.shadow.camera.bottom=-55;l.shadow.bias=-.00035;scene.add(l);
 }
 function rock(c=0x847564,s=1){
  const g=new THREE.IcosahedronGeometry(1,1),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const q=rand(.82,1.18);p.setXYZ(i,p.getX(i)*q,p.getY(i)*q,p.getZ(i)*q);}
  g.computeVertexNormals();const m=new THREE.Mesh(g,mat(c,.96));m.scale.set(s*1.2,s*.8,s);m.castShadow=true;return m;
 }
 function fail(stage){
  const o=stage.querySelector('.runner-overlay');o.hidden=false;
  o.querySelector('strong').textContent='3D needs WebGL.';
  o.querySelector('p').textContent='This browser could not start its 3D graphics renderer. Try a current browser with hardware acceleration enabled.';
  o.querySelector('button').textContent='Back to games';
  o.querySelector('button').onclick=()=>{stages.forEach(s=>s.hidden=true);lobby.hidden=false;};
 }

 function createDune(){
  const stage=document.querySelector('[data-arcade-stage="dune"]');let view;
  try{view=rendererFor(document.getElementById('dune-canvas'));}catch(e){fail(stage);return {pause(){},resume(){}};}
  const renderer=view.r,scene=new THREE.Scene();scene.background=new THREE.Color(0xa4c5c4);scene.fog=new THREE.Fog(0xdcc9a8,78,265);
  const camera=new THREE.PerspectiveCamera(48,960/440,.1,500);camera.position.set(0,8.2,17.5);camera.lookAt(0,1.4,-19);
  lighting(scene,0xe8f1df,0x80634b);
  const sun=new THREE.Mesh(new THREE.SphereGeometry(5,24,16),new THREE.MeshBasicMaterial({color:0xffedc7}));sun.position.set(-44,42,-126);scene.add(sun);
  const h=(x,z)=>.4+Math.sin(z*.052)*1.4+Math.sin(z*.105+x*.032)*.48+Math.sin(x*.15+z*.022)*.23;
  const geo=new THREE.PlaneGeometry(100,420,100,220),p=geo.attributes.position;
  for(let i=0;i<p.count;i++)p.setZ(i,h(p.getX(i),-p.getY(i)-175));
  geo.rotateX(-Math.PI/2);geo.computeVertexNormals();
  const sandMat=mat(0xd4a06e,1),terrain=new THREE.Mesh(geo,sandMat);terrain.position.z=-175;terrain.receiveShadow=true;scene.add(terrain);
  const mountainMat=mat(0xb4b89e,1);
  for(let i=0;i<12;i++){const ht=rand(16,34),m=new THREE.Mesh(new THREE.ConeGeometry(rand(12,23),ht,6),mountainMat);m.position.set((i%2?1:-1)*rand(38,72),ht/2,-rand(90,240));scene.add(m);}
  const ruins=new THREE.Group();
  for(let i=0;i<5;i++){const x=(i%2?1:-1)*(18+Math.floor(i/2)*5),z=-45-i*28;
   const col=new THREE.Mesh(new THREE.BoxGeometry(2,11,2),mat(0x98785f));col.position.set(x,5.5,z);col.castShadow=true;ruins.add(col);
   const cap=new THREE.Mesh(new THREE.BoxGeometry(3.4,.8,2.8),mat(0xd1a176));cap.position.set(x,11.1,z);ruins.add(cap);}
  scene.add(ruins);

  const player=new THREE.Group(),rider=new THREE.Group();scene.add(player);player.add(rider);
  const board=new THREE.Mesh(new THREE.BoxGeometry(2.05,.16,.55),mat(0x59463d,.5));board.position.y=.17;board.castShadow=true;rider.add(board);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(1.5,.025,.09),mat(0xe7b96d,.5));stripe.position.y=.26;rider.add(stripe);
  const robe=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.78,4,7),mat(0xb96d54));robe.position.y=1.03;robe.castShadow=true;rider.add(robe);
  const face=new THREE.Mesh(new THREE.SphereGeometry(.28,12,9),mat(0xd5a078));face.position.y=1.82;rider.add(face);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(.34,12,9,0,Math.PI*2,0,Math.PI*.66),mat(0x566f68));hood.position.set(0,1.94,-.05);rider.add(hood);
  for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.62,3,6),robe.material);arm.position.set(side*.47,1.08,0);arm.rotation.z=side*.55;rider.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.42,3,6),mat(0x354b4b));leg.position.set(side*.2,.48,0);rider.add(leg);}
  const scarf=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.25,1.65,0),new THREE.Vector3(-.65,1.7,.05),new THREE.Vector3(-1.15,1.85,.2),new THREE.Vector3(-1.7,1.72,.24)]),24,.065,6,false),mat(0x73aaa4,.55));rider.add(scarf);
  const chars={sol:{robe:0xb96d54,hood:0x566f68,scarf:0x73aaa4,jump:1,glide:1,speed:1},mira:{robe:0xd09c51,hood:0x596f83,scarf:0xa8d0c6,jump:1.05,glide:1.35,speed:.95},tavi:{robe:0x617f78,hood:0x4b5866,scarf:0xd78b69,jump:.95,glide:.92,speed:1.12}};
  let character='sol';
  const charBtns=[...stage.querySelectorAll('[data-dune-character]')];
  const applyChar=()=>{const c=chars[character];robe.material.color.setHex(c.robe);hood.material.color.setHex(c.hood);scarf.material.color.setHex(c.scarf);};
  charBtns.forEach(b=>b.addEventListener('click',()=>{if(state.running)return;character=b.dataset.duneCharacter;charBtns.forEach(x=>x.classList.toggle('is-selected',x===b));applyChar();}));applyChar();

  const objects=[];
  function addShard(){const m=new THREE.Mesh(new THREE.OctahedronGeometry(.66,0),new THREE.MeshStandardMaterial({color:0xffe8a5,emissive:0xb88435,emissiveIntensity:.65,metalness:.25,roughness:.23}));m.castShadow=true;scene.add(m);objects.push({mesh:m,type:'shard',phase:rand(0,6)});}
  function addObstacle(){
   const g=new THREE.Group();
   if(Math.random()<.72){const r=rock(0x867665,1.25);r.position.y=.8;g.add(r);}
   else{const stem=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.7,6),mat(0x657b60));stem.position.y=.85;g.add(stem);
    for(let i=0;i<3;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.28,.95,5),mat(0x82916a));b.position.set((i-1)*.33,1.45+(i%2)*.25,0);b.rotation.z=(i-1)*-.45;g.add(b);}}
   g.traverse(o=>{if(o.isMesh)o.castShadow=true;});
   g.position.set([-6,0,6][Math.floor(Math.random()*3)],h(0,-112),-112);scene.add(g);objects.push({mesh:g,type:'obstacle',passed:false});
  }
  const el={dist:stage.querySelector('[data-dune-distance]'),shards:stage.querySelector('[data-dune-shards]'),best:stage.querySelector('[data-dune-best]'),biome:stage.querySelector('[data-dune-biome]'),status:stage.querySelector('[data-dune-status]'),overlay:stage.querySelector('[data-dune-overlay]'),title:stage.querySelector('[data-dune-overlay-title]'),copy:stage.querySelector('[data-dune-overlay-copy]'),start:stage.querySelector('[data-dune-start]'),jump:stage.querySelector('[data-dune-jump]'),trick:stage.querySelector('[data-dune-trick]'),reset:stage.querySelector('[data-dune-reset]')};
  const BEST='aayan-dune-3d-best',readBest=()=>{try{return Number(localStorage.getItem(BEST)||0);}catch(_){return 0;}},writeBest=v=>{try{localStorage.setItem(BEST,String(v));}catch(_){}};
  const state={running:false,distance:0,shards:0,speed:28,jump:0,jumpV:0,grounded:true,trick:false,trickTime:0,x:0,spawn:.7,shardSpawn:1,elapsed:0};
  let raf=0,last=0,active=true;
  const ground=(x,z)=>h(x,z)-.1;
  function render(){
   player.position.x+=(state.x-player.position.x)*.18;player.position.y=ground(player.position.x,4)+state.jump;
   rider.rotation.z=state.grounded?Math.sin(state.elapsed*6)*.025:state.trick?state.trickTime*2.2:0;
   rider.rotation.x=state.grounded?0:state.trick?state.trickTime*1.1:0;
   scarf.rotation.z=Math.sin(state.elapsed*5)*.11;camera.position.x+=(state.x*.18-camera.position.x)*.04;camera.lookAt(state.x*.12,1.5,-19);
   sun.position.y=42+Math.sin(state.elapsed*.1)*2;
   objects.forEach(o=>{if(o.type==='shard'){o.mesh.rotation.y=state.elapsed*1.8+o.phase;o.mesh.rotation.x=Math.sin(state.elapsed*2+o.phase)*.25;}});
   renderer.render(scene,camera);
  }
  function reset(){
   state.running=false;state.distance=0;state.shards=0;state.speed=28;state.jump=0;state.jumpV=0;state.grounded=true;state.trick=false;state.trickTime=0;state.x=0;state.spawn=.7;state.shardSpawn=1;state.elapsed=0;
   while(objects.length){const o=objects.pop();dispose(scene,o.mesh);}
   player.position.set(0,ground(0,4),4);el.dist.textContent='0 m';el.shards.textContent='0';el.best.textContent=readBest()+' m';el.biome.textContent='DUNES';render();
  }
  function biome(){
   if(state.distance<450){sandMat.color.setHex(0xd4a06e);scene.fog.color.setHex(0xd9c6a5);el.biome.textContent='DUNES';}
   else if(state.distance<1200){sandMat.color.setHex(0xb88b6b);scene.fog.color.setHex(0xbac0ac);el.biome.textContent='CANYON';}
   else{sandMat.color.setHex(0x9eaa78);scene.fog.color.setHex(0xd7e4c6);el.biome.textContent='OASIS';}
   scene.background.copy(scene.fog.color);
  }
  function finish(msg){
   if(!state.running)return;state.running=false;const d=Math.floor(state.distance);if(d>readBest())writeBest(d);
   el.best.textContent=readBest()+' m';el.title.textContent='The horizon can wait.';el.copy.textContent=msg+' You travelled '+d+' m and found '+state.shards+' sunshards.';
   el.start.textContent='Ride again ↗';el.overlay.hidden=false;el.status.textContent=msg;snd('bump');if(raf)cancelAnimationFrame(raf);raf=0;
  }
  function jump(){if(!state.running||!state.grounded)return;state.grounded=false;state.jumpV=10.2*chars[character].jump;snd('jump');}
  function frame(now){
   if(!state.running||!active)return;const dt=Math.min(.04,Math.max(.001,(now-last)/1000));last=now;state.elapsed+=dt;
   state.speed=Math.min(42,28*chars[character].speed+state.distance*.0008);state.distance+=state.speed*dt;state.spawn-=dt;state.shardSpawn-=dt;
   if(state.spawn<=0){addObstacle();state.spawn=rand(.95,1.45);}if(state.shardSpawn<=0){addShard();state.shardSpawn=rand(1.1,1.7);}
   if(!state.grounded){state.jumpV-=23*dt*(state.trick?chars[character].glide:1);state.jump+=state.jumpV*dt;
    if(state.jump<=0){state.jump=0;state.grounded=true;if(state.trick&&state.trickTime>.32){el.status.textContent='Smooth landing! A clean trick.';snd('collect');}state.trickTime=0;}else if(state.trick)state.trickTime+=dt;}
   for(let i=objects.length-1;i>=0;i--){
    const o=objects[i],m=o.mesh;m.position.z+=state.speed*dt;
    if(o.type==='shard'&&m.position.distanceTo(new THREE.Vector3(state.x,player.position.y+1.2,4))<2.5){state.shards++;snd('collect');dispose(scene,m);objects.splice(i,1);continue;}
    if(o.type==='obstacle'&&!o.passed&&m.position.z>2&&m.position.z<7&&Math.abs(m.position.x-state.x)<2.1){o.passed=true;if(state.jump<1.45){finish('A rocky turn sent you back to the sand.');return;}}
    if(m.position.z>18){dispose(scene,m);objects.splice(i,1);}
   }
   el.dist.textContent=Math.floor(state.distance)+' m';el.shards.textContent=String(state.shards);biome();render();raf=requestAnimationFrame(frame);
  }
  function start(){if(state.running)return;reset();state.running=true;el.overlay.hidden=true;el.status.textContent='Find your rhythm. Jump to leap; hold Trick in the air to spin.';last=performance.now();raf=requestAnimationFrame(frame);snd('start');}
  el.start.addEventListener('click',start);el.reset.addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);reset();el.overlay.hidden=false;el.title.textContent='Take the long way.';el.copy.textContent='Jump, hold tricks in the air and collect sunshards.';el.start.textContent='Start riding ↗';});
  el.jump.addEventListener('click',jump);el.trick.addEventListener('pointerdown',e=>{e.preventDefault();state.trick=true;});
  ['pointerup','pointercancel','pointerleave','lostpointercapture'].forEach(k=>el.trick.addEventListener(k,()=>state.trick=false));
  document.addEventListener('keydown',e=>{if(stage.hidden)return;if(e.code==='Space'){e.preventDefault();jump();}if(e.code==='ArrowDown'||e.key.toLowerCase()==='s')state.trick=true;if(e.code==='ArrowLeft'||e.key.toLowerCase()==='a')state.x=clamp(state.x-3,-9,9);if(e.code==='ArrowRight'||e.key.toLowerCase()==='d')state.x=clamp(state.x+3,-9,9);});
  document.addEventListener('keyup',e=>{if(e.code==='ArrowDown'||e.key.toLowerCase()==='s')state.trick=false;});
  renderer.domElement.addEventListener('pointermove',e=>{if(!state.running)return;const r=renderer.domElement.getBoundingClientRect();state.x=clamp(((e.clientX-r.left)/r.width-.5)*19,-9,9);});
  reset();return {pause(){active=false;if(raf)cancelAnimationFrame(raf);},resume(){active=true;if(state.running){last=performance.now();raf=requestAnimationFrame(frame);}}};
 }

 function createSea(){
  const stage=document.querySelector('[data-arcade-stage="saily"]');let view;
  try{view=rendererFor(document.getElementById('saily-canvas'));}catch(e){fail(stage);return {pause(){},resume(){}};}
  const renderer=view.r,scene=new THREE.Scene();scene.background=new THREE.Color(0xa3c7cb);scene.fog=new THREE.Fog(0xa3c7cb,100,315);
  const camera=new THREE.PerspectiveCamera(48,960/440,.1,600);camera.position.set(0,8,17);camera.lookAt(0,1,-18);lighting(scene,0xe7f2ec,0x24495a);
  const sun=new THREE.Mesh(new THREE.SphereGeometry(5,24,16),new THREE.MeshBasicMaterial({color:0xffefc9}));sun.position.set(45,35,-130);scene.add(sun);
  const wave=(x,z,t)=>Math.sin(z*.085+t*1.25)*.56+Math.sin(z*.037+x*.045-t*.7)*.34+Math.cos(x*.09+t*.58)*.12;
  const wg=new THREE.PlaneGeometry(150,380,72,150);wg.rotateX(-Math.PI/2);const wp=wg.attributes.position;
  for(let i=0;i<wp.count;i++)wp.setY(i,wave(wp.getX(i),wp.getZ(i),0));wg.computeVertexNormals();
  const water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({color:0x438995,roughness:.23,metalness:.12,transparent:true,opacity:.91,side:THREE.DoubleSide}));water.receiveShadow=true;scene.add(water);
  const deep=new THREE.Mesh(new THREE.PlaneGeometry(300,400),new THREE.MeshBasicMaterial({color:0x153e56,side:THREE.DoubleSide}));deep.rotation.x=-Math.PI/2;deep.position.set(0,-7,-140);scene.add(deep);
  for(let i=0;i<12;i++){const ht=rand(8,24),rad=rand(8,18),x=(i%2?1:-1)*rand(34,73),z=-rand(72,280);const m=new THREE.Mesh(new THREE.ConeGeometry(rad,ht,6),mat(0x8eaa97,1));m.position.set(x,ht/2-2,z);scene.add(m);const cap=new THREE.Mesh(new THREE.ConeGeometry(rad*.33,ht*.36,5),mat(0xeee0bf));cap.position.set(x,m.position.y+ht*.38,z);scene.add(cap);}
  const boat=new THREE.Group();scene.add(boat);
  const shape=new THREE.Shape();shape.moveTo(-2,.28);shape.lineTo(2,.28);shape.lineTo(1.38,-.48);shape.quadraticCurveTo(0,-.68,-1.38,-.48);shape.closePath();
  const hullGeo=new THREE.ExtrudeGeometry(shape,{depth:.9,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.09,bevelThickness:.09});hullGeo.rotateX(-Math.PI/2);
  const hull=new THREE.Mesh(hullGeo,mat(0x9a5f48,.45));hull.position.y=.38;hull.castShadow=true;boat.add(hull);
  const inner=new THREE.Mesh(new THREE.BoxGeometry(2.2,.11,.42),mat(0xc58b60));inner.position.set(0,.75,.02);boat.add(inner);
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,4.7,9),mat(0x725441));mast.position.set(-.25,2.65,-.05);boat.add(mast);
  const sailGeo=new THREE.BufferGeometry();sailGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.18,.45,.16,1.68,3.9,.05,-.18,3.9,.08,-.18,.45,.16,-.18,3.9,.08,-1.23,1.1,.12],3));sailGeo.setIndex([0,1,2,3,4,5]);sailGeo.computeVertexNormals();
  const sail=new THREE.Mesh(sailGeo,new THREE.MeshStandardMaterial({color:0xf0e1bd,roughness:.84,side:THREE.DoubleSide}));sail.position.set(-.25,.45,0);boat.add(sail);
  const sailor=new THREE.Group();boat.add(sailor);
  const coat=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.5,4,8),mat(0x547e78));coat.position.set(.7,1.05,.05);sailor.add(coat);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.22,12,10),mat(0xd6a47d));head.position.set(.7,1.62,.05);sailor.add(head);
  const hat=new THREE.Mesh(new THREE.SphereGeometry(.24,10,6),mat(0xd18b61));hat.scale.y=.42;hat.position.set(.7,1.79,.05);sailor.add(hat);
  function fish(){
   const g=new THREE.Group(),body=new THREE.Mesh(new THREE.SphereGeometry(.48,12,8),mat(0xe8c579,.32,.1));body.scale.set(1.45,.7,.65);g.add(body);
   const tail=new THREE.Mesh(new THREE.ConeGeometry(.32,.55,4),mat(0xd88d63,.5));tail.rotation.z=Math.PI/2;tail.position.x=-.78;g.add(tail);
   const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,8,6),new THREE.MeshBasicMaterial({color:0x1d3c45}));eye.position.set(.4,.12,.25);g.add(eye);return g;
  }
  function bird(){
   const g=new THREE.Group(),body=new THREE.Mesh(new THREE.SphereGeometry(.23,10,7),mat(0xf3ead4));body.scale.set(1.35,.6,.65);g.add(body);
   const w=mat(0x597d78),l=new THREE.Mesh(new THREE.BoxGeometry(.85,.07,.28),w),r=new THREE.Mesh(new THREE.BoxGeometry(.85,.07,.28),w);
   l.position.set(0,.15,-.42);r.position.set(0,.15,.42);g.add(l,r);g.userData.wings=[l,r];return g;
  }
  function seaObject(type){
   if(type==='fish')return fish();if(type==='bird')return bird();const g=new THREE.Group();
   if(type==='reef'){for(let i=0;i<4;i++){const r=rock(i%2?0x607f7b:0x78918a,rand(.8,1.5));r.position.set(rand(-1,1),rand(.1,.9),rand(-.5,.5));g.add(r);}}
   else{const log=new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,3.2,8),mat(0x987253));log.rotation.z=Math.PI/2;log.position.y=.18;g.add(log);}return g;
  }
  const objects=[];
  function spawnObstacle(){const type=Math.random()<.62?'reef':'drift',m=seaObject(type),x=rand(-8,8);m.position.set(x,wave(x,-116,0),-116);m.traverse(o=>{if(o.isMesh)o.castShadow=true;});scene.add(m);objects.push({mesh:m,type});}
  function spawnFind(){const type=Math.random()<.58?'fish':'bird',m=seaObject(type);m.position.set(rand(-8,8),type==='fish'?-2.7:rand(4.2,6.5),-105);scene.add(m);objects.push({mesh:m,type,phase:rand(0,6)});}
  const el={dist:stage.querySelector('[data-saily-distance]'),finds:stage.querySelector('[data-saily-finds]'),best:stage.querySelector('[data-saily-best]'),wind:stage.querySelector('[data-saily-wind]'),status:stage.querySelector('[data-saily-status]'),overlay:stage.querySelector('[data-saily-overlay]'),title:stage.querySelector('[data-saily-overlay-title]'),copy:stage.querySelector('[data-saily-overlay-copy]'),start:stage.querySelector('[data-saily-start]'),sail:stage.querySelector('[data-saily-sail]'),jump:stage.querySelector('[data-saily-jump]'),dive:stage.querySelector('[data-saily-dive]'),reset:stage.querySelector('[data-saily-reset]'),upgrades:stage.querySelector('[data-saily-upgrades]')};
  const btns=[...stage.querySelectorAll('[data-saily-upgrade]')],BEST='aayan-saily-3d-best',COINS='aayan-saily-3d-coins';
  const num=k=>{try{return Number(localStorage.getItem(k)||0);}catch(_){return 0;}},save=(k,v)=>{try{localStorage.setItem(k,String(v));}catch(_){}};
  const up={sail:num('aayan-saily-3d-upgrades-sail'),glide:num('aayan-saily-3d-upgrades-glide'),dive:num('aayan-saily-3d-upgrades-dive')};
  let coins=num(COINS),active=true,raf=0,last=0,sailHeld=false;
  const state={running:false,distance:0,finds:0,speed:15,x:0,y:0,vy:0,air:false,diving:false,spawn:.8,findSpawn:.5,elapsed:0,slow:0};
  function refreshUp(){btns.forEach(b=>{const t=b.dataset.sailyUpgrade,s=b.querySelector('small');b.disabled=coins<5||up[t]>=3;if(s)s.textContent=up[t]+'/3 · 5 shells';});}
  function reset(){
   state.running=false;state.distance=0;state.finds=0;state.speed=15;state.x=0;state.y=0;state.vy=0;state.air=false;state.diving=false;state.spawn=.8;state.findSpawn=.5;state.elapsed=0;state.slow=0;
   sailHeld=false;el.sail.classList.remove('is-held');el.dive.classList.remove('is-held');el.sail.setAttribute('aria-pressed','false');el.dive.setAttribute('aria-pressed','false');
   while(objects.length){const o=objects.pop();scene.remove(o.mesh);}
   boat.position.set(0,wave(0,4,0)+.3,4);el.dist.textContent='0 m';el.finds.textContent='0';el.best.textContent=num(BEST)+' m';el.wind.textContent='CALM';refreshUp();draw(0);
  }
  function setSail(v){sailHeld=v;el.sail.classList.toggle('is-held',v);el.sail.setAttribute('aria-pressed',String(v));if(v&&state.running)snd('wind');}
  function dive(v){state.diving=v&&!state.air;el.dive.classList.toggle('is-held',v);el.dive.setAttribute('aria-pressed',String(v));if(v&&state.running)snd('splash');}
  function jump(){if(!state.running||state.air||state.diving)return;state.air=true;state.vy=9.2;snd('jump');}
  function draw(t){
   const p=water.geometry.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,wave(p.getX(i),p.getZ(i),t));p.needsUpdate=true;water.geometry.computeVertexNormals();
   boat.position.x+=(state.x-boat.position.x)*.13;boat.position.y=wave(boat.position.x,4,t)+(state.air?state.y:state.diving?-2.7:.35);
   boat.rotation.z=Math.sin(t*1.7+state.distance*.012)*.045;boat.rotation.x=Math.sin(t*1.2+state.distance*.01)*.035;
   sail.rotation.z=sailHeld?-.12+Math.sin(t*2)*.035:Math.sin(t*1.6)*.025;sail.scale.x=sailHeld?1.04:.9;sailor.rotation.z=Math.sin(t*2)*.035;
   objects.forEach(o=>{if(o.type==='bird'&&o.mesh.userData.wings){const f=Math.sin(t*11+o.phase)*.45;o.mesh.userData.wings[0].rotation.x=f;o.mesh.userData.wings[1].rotation.x=-f;}});
   sun.position.y=35+Math.sin(t*.1)*1.8;renderer.render(scene,camera);
  }
  function finish(msg){
   if(!state.running)return;state.running=false;const d=Math.floor(state.distance);if(d>num(BEST))save(BEST,d);coins+=state.finds;save(COINS,coins);
   el.title.textContent='A lovely voyage.';el.copy.textContent=msg+' You sailed '+d+' m and found '+state.finds+' treasures. You have '+coins+' shells for the workshop.';
   el.start.textContent='Sail again ↗';el.overlay.hidden=false;el.upgrades.hidden=coins<5;el.status.textContent=msg;refreshUp();snd('bump');if(raf)cancelAnimationFrame(raf);raf=0;
  }
  function frame(now){
   if(!state.running||!active)return;const dt=Math.min(.04,Math.max(.001,(now-last)/1000));last=now;state.elapsed+=dt;
   const target=sailHeld?34+up.sail*5+(state.air?7+up.glide*2:0):13;state.speed+=(target-state.speed)*Math.min(1,dt*1.5);
   if(state.speed<8)state.slow+=dt;else state.slow=Math.max(0,state.slow-dt);
   state.distance+=state.speed*dt;state.spawn-=dt;state.findSpawn-=dt;if(state.spawn<=0){spawnObstacle();state.spawn=rand(1.8,2.7);}if(state.findSpawn<=0){spawnFind();state.findSpawn=rand(.65,1.05);}
   if(state.air){state.vy-=(sailHeld?12+up.glide*1.5:23)*dt;state.y+=state.vy*dt;if(state.y<=0){state.y=0;state.air=false;state.vy=0;}}
   else if(state.diving)state.y=-2.7-up.dive*.35;else state.y=0;
   for(let i=objects.length-1;i>=0;i--){
    const o=objects[i],m=o.mesh;m.position.z+=state.speed*dt;
    if(o.type==='fish'||o.type==='bird'){
      if(Math.abs(m.position.z-4)<2.6&&Math.abs(m.position.x-state.x)<2.7&&(o.type==='fish'?state.diving:state.air)){
       state.finds++;snd(o.type==='fish'?'splash':'bird');el.status.textContent=o.type==='fish'?'A silver fish joined the voyage.':'A seabird caught the same current.';
       dispose(scene,m);objects.splice(i,1);continue;
      }
    }else if(Math.abs(m.position.z-4)<3&&Math.abs(m.position.x-state.x)<2.8){
      const safe=o.type==='reef'?(state.air&&state.y>1.4||state.diving):state.air&&state.y>1.1;
      if(!safe){finish('A reef interrupted the voyage. There is always another tide.');return;}dispose(scene,m);objects.splice(i,1);continue;
    }
    if(m.position.z>18){dispose(scene,m);objects.splice(i,1);}
   }
   if(state.slow>5){finish('The wind went quiet. Find a better current.');return;}
   el.dist.textContent=Math.floor(state.distance)+' m';el.finds.textContent=String(state.finds);el.best.textContent=num(BEST)+' m';el.wind.textContent=sailHeld?'FULL SAIL':state.speed>26?'TAILWIND':'LIGHT WIND';
   draw(state.elapsed);raf=requestAnimationFrame(frame);
  }
  function start(){if(state.running)return;reset();state.running=true;el.overlay.hidden=true;el.upgrades.hidden=true;el.status.textContent='Hold Sail for speed. Jump for birds, dive for fish.';last=performance.now();raf=requestAnimationFrame(frame);snd('start');}
  function hold(btn,down,upFn){btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture?.(e.pointerId);down();});['pointerup','pointercancel','pointerleave','lostpointercapture'].forEach(k=>btn.addEventListener(k,upFn));}
  el.start.addEventListener('click',start);el.reset.addEventListener('click',()=>{if(raf)cancelAnimationFrame(raf);reset();el.overlay.hidden=false;el.upgrades.hidden=true;el.title.textContent='Follow the wind.';el.copy.textContent='Raise your sail, ride the waves, and see how far the little boat can go.';el.start.textContent='Set sail ↗';});
  el.jump.addEventListener('click',jump);hold(el.sail,()=>setSail(true),()=>setSail(false));hold(el.dive,()=>dive(true),()=>dive(false));
  btns.forEach(b=>b.addEventListener('click',()=>{const t=b.dataset.sailyUpgrade;if(coins<5||up[t]>=3)return;coins-=5;up[t]++;save(COINS,coins);save('aayan-saily-3d-upgrades-'+t,up[t]);refreshUp();snd('collect');el.status.textContent='The '+t+' upgrade is ready for your next voyage.';}));
  document.addEventListener('keydown',e=>{if(stage.hidden)return;if(e.code==='Space'){e.preventDefault();jump();}if(e.key.toLowerCase()==='w')setSail(true);if(e.code==='ArrowDown'||e.key.toLowerCase()==='s')dive(true);if(e.code==='ArrowLeft'||e.key.toLowerCase()==='a')state.x=clamp(state.x-3,-10,10);if(e.code==='ArrowRight'||e.key.toLowerCase()==='d')state.x=clamp(state.x+3,-10,10);});
  document.addEventListener('keyup',e=>{if(e.key.toLowerCase()==='w')setSail(false);if(e.code==='ArrowDown'||e.key.toLowerCase()==='s')dive(false);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!state.running)return;const r=renderer.domElement.getBoundingClientRect();state.x=clamp(((e.clientX-r.left)/r.width-.5)*20,-10,10);});
  refreshUp();reset();return {pause(){active=false;if(raf)cancelAnimationFrame(raf);},resume(){active=true;if(state.running){last=performance.now();raf=requestAnimationFrame(frame);}}};
 }

 function open(id){
  lobby.hidden=true;stages.forEach(s=>{s.hidden=s.dataset.arcadeStage!==id;});
  if(id==='dune'){if(!dune)dune=createDune();else dune.resume();sea?.pause();}
  else{if(!sea)sea=createSea();else sea.resume();dune?.pause();}
  snd('start');
 }
 function back(){stages.forEach(s=>s.hidden=true);lobby.hidden=false;dune?.pause();sea?.pause();snd('back');}
 document.querySelectorAll('[data-open-game]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.openGame)));
 document.querySelectorAll('[data-arcade-back]').forEach(b=>b.addEventListener('click',back));
});
