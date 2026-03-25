function updatePowerDisplay(){
  const pct=Math.max(0,Math.round(state.power));
  const bar=$id('power-bar');
  const pctEl=$id('power-pct');
  const camPctEl=$id('cam-power-pct');
  bar.style.width=pct+'%';
  pctEl.textContent=pct+'%';
  if(camPctEl) camPctEl.textContent=pct+'%';
  if(pct>50){bar.style.background='var(--green)';pctEl.style.color='var(--green)';}
  else if(pct>20){bar.style.background='var(--amber)';pctEl.style.color='var(--amber)';}
  else{bar.style.background='var(--red)';pctEl.style.color='var(--red)';}
}

function getStoryUnlocks(){
  const n=Math.max(1,Number(state.night)||1);
  return {
    morgan:true,
    shadow:n>=2,
    hamlet:n>=3,
    twigg:n>=4,
    hodge:n>=5,
  };
}

function isEnemyEnabled(name){
  const key=String(name||'').toLowerCase();
  if(key==='morgan') return true;
  if(state && state.mode==='custom') return true;
  const u=getStoryUnlocks();
  return !!u[key];
}

function applyStoryAILevels(){
  if(state && state.mode==='custom') return;
  const n=Math.max(1,Number(state.night)||1);
  const base=clampAI(5 + ((n-1)*2));
  const u=getStoryUnlocks();
  Object.keys(u).forEach(k=>{
    if(u[k]) setAILevel(k,base);
  });
}

function updateClock(){
  const p=state.timeElapsed/NIGHT_DURATION;
  const hi=Math.min(5,Math.floor(p*6));
  const min=Math.floor((p*6-hi)*60);
  const s=`${CLOCK_HOURS[hi]}:${String(min).padStart(2,'0')} AM`;
  $id('clock-display').textContent=s;
  const camClock=$id('cam-clock-display');
  if(camClock) camClock.textContent=s;
}

function updateUsageDisplay(rawDrain,nightMultiplier){
  const camFill=$id('cam-usage-fill');
  const camTxt=$id('cam-usage-text');
  const officeFill=$id('office-usage-fill');
  const officeTxt=$id('office-usage-text');
  if(!camFill && !camTxt && !officeFill && !officeTxt) return;

  const baseRaw=0.5;
  const factor=(rawDrain>0)?(rawDrain/baseRaw):1;
  const shown=Math.max(1,Math.round(factor*10)/10);
  const pct=Math.max(0,Math.min(100,((factor-1)/3)*100));
  const w=pct.toFixed(0)+'%';
  const label=`x${shown.toFixed(1)}`;
  if(camFill) camFill.style.width=w;
  if(camTxt) camTxt.textContent=label;
  if(officeFill) officeFill.style.width=w;
  if(officeTxt) officeTxt.textContent=label;
}

function getNightMultiplier(){
  return (1+(state.night-1)*0.07);
}

function getRawDrain(){
  let raw=0.5;
  if(state.doorLeft) raw+=0.3;
  if(state.doorRight) raw+=0.3;
  if(state.lightLeft) raw+=0.22;
  if(state.lightRight) raw+=0.22;
  if(state.camLightOn) raw+=0.15;
  return raw;
}

function setNextMorganMoveCooldown(){
  const ai=(typeof getAILevel==='function')?getAILevel('morgan'):10;
  const d=ai-10;
  const min=Math.max(4,Math.round(10 - (d*0.35)));
  const max=Math.max(min+2,Math.round(16 - (d*0.45)));
  state.morganMoveCooldown=randInt(min,max);
}

function handleMorganOfficeBehavior(){
  if(state.gameOver || !state.running || state.power<=0) return;
  if(typeof moveMorganCloser!=='function' || typeof attemptEntry!=='function') return;

  if(state.morganMoveCooldown>0) state.morganMoveCooldown--;
  if(state.morganMoveCooldown>0) return;

  if(state.morganAtDoor){
    attemptEntry();
  } else {
    moveMorganCloser();
  }
  setNextMorganMoveCooldown();
}

function updateHamletVisual(){
  const el=$id('hamlet-hallucination');
  if(!el) return;
  const p=Math.max(0,Math.min(100,state.hamletProgress||0));
  const o=Math.max(0,Math.min(0.95,(p/100)*0.95));
  const t=p/100;
  el.style.opacity=String(o);
  el.style.transform=`scale(${(1.00 + (t*0.03)).toFixed(3)})`;
  const blur=Math.max(0,(1.0-(t*1.25)));
  const contrast=(1.06+(t*0.55));
  const bright=(0.95+(t*0.18));
  el.style.filter=`blur(${blur.toFixed(2)}px) contrast(${contrast.toFixed(2)}) saturate(1.25) brightness(${bright.toFixed(2)})`;
}

function addHamletProgress(amount){
  if(state.gameOver || !state.running) return;
  state.hamletProgress=Math.max(0,Math.min(100,(state.hamletProgress||0)+amount));
  updateHamletVisual();
  if(state.hamletProgress>=100){
    triggerJumpscare('hamlet');
  }
}

let twiggInterval=null;

function scheduleNextTwigg(){
  const hourSeconds=Math.max(1,Math.round(NIGHT_DURATION/6));
  const base=hourSeconds*2;
  const jitter=randInt(-Math.round(hourSeconds*0.4),Math.round(hourSeconds*0.4));
  state.twiggNextAt=state.timeElapsed+Math.max(hourSeconds,base+jitter);
}

function updateTwiggUI(){
  const ov=$id('twigg-overlay');
  if(!ov) return;
  ov.style.display=state.twiggActive?'flex':'none';

  const safe=$id('twigg-safe');
  const needle=$id('twigg-needle');
  if(safe){
    const left=(state.twiggSafeCenter-(state.twiggSafeWidth/2))*100;
    const w=state.twiggSafeWidth*100;
    safe.style.left=`${left.toFixed(2)}%`;
    safe.style.width=`${w.toFixed(2)}%`;
  }
  if(needle){
    needle.style.left=`${(state.twiggNeedle*100).toFixed(2)}%`;
  }
}

function startTwiggMinigame(){
  if(state.gameOver || !state.running) return;
  if(state.twiggActive) return;

  state.twiggActive=true;
  state.twiggFailSeconds=randInt(15,20);
  state.twiggNeedle=Math.random();
  state.twiggNeedleDir=Math.random()<0.5?-1:1;

  const ai=(typeof getAILevel==='function')?getAILevel('twigg'):10;
  const width=Math.max(0.20, 0.60 - (ai*0.008));
  state.twiggSafeWidth=width;
  state.twiggSafeCenter=0.25 + Math.random()*0.50;

  updateTwiggUI();
  showAlert('⚠ MR TWIGG — DON\'T MISS ⚠');

  if(twiggInterval) clearInterval(twiggInterval);
  twiggInterval=setInterval(()=>{
    if(!state.twiggActive || state.gameOver) return;
    const ai2=(typeof getAILevel==='function')?getAILevel('twigg'):10;
    const speed=0.008 + (ai2*0.001);
    state.twiggNeedle+=state.twiggNeedleDir*speed;
    if(state.twiggNeedle<=0){state.twiggNeedle=0;state.twiggNeedleDir=1;}
    if(state.twiggNeedle>=1){state.twiggNeedle=1;state.twiggNeedleDir=-1;}
    const needle=$id('twigg-needle');
    if(needle) needle.style.left=`${(state.twiggNeedle*100).toFixed(2)}%`;
  },16);
}

function endTwiggMinigame(success){
  state.twiggActive=false;
  state.twiggFailSeconds=0;
  updateTwiggUI();
  if(twiggInterval){clearInterval(twiggInterval);twiggInterval=null;}
  if(success){
    showAlert('⚠ NICE SAVE ⚠');
    scheduleNextTwigg();
  } else {
    triggerJumpscare('twigg');
  }
}

function twiggAttempt(){
  if(!state.twiggActive || state.gameOver || !state.running) return;
  const min=state.twiggSafeCenter-(state.twiggSafeWidth/2);
  const max=state.twiggSafeCenter+(state.twiggSafeWidth/2);
  const hit=(state.twiggNeedle>=min && state.twiggNeedle<=max);
  endTwiggMinigame(hit);
}

function startGame(){
  try {
    console.log('Starting game...');
    if(!state.mode) state.mode='story';
    applyStoryAILevels();
    if(window.AUDIO){
      AUDIO.unlock();
      AUDIO.startAmbience();
    }
    resetState();
    showScreen('game-screen');
    $id('topbar-night').textContent=`NIGHT ${state.night}`;
    updatePowerDisplay();
    updateCamScene();
    initCamStareTimers();

    setNextMorganMoveCooldown();
    if(gameInterval) clearInterval(gameInterval);
    gameInterval=setInterval(tick,1000);
    if(camTsInterval) clearInterval(camTsInterval);
    let s=0;
    camTsInterval=setInterval(()=>{
      s++;
      const hh=String(Math.floor(s/3600)).padStart(2,'0');
      const mm=String(Math.floor((s%3600)/60)).padStart(2,'0');
      const ss=String(s%60).padStart(2,'0');
      const el=$id('cam-timestamp');
      if(el) el.textContent=`${hh}:${mm}:${ss}`;
    },1000);
    console.log('Game started successfully');
  } catch(error){
    console.error('Error starting game:', error);
  }
}

function resetState(){
  try {
    console.log('Resetting game state...');
    if(!state) {
      console.error('Game state not initialized');
      return;
    }
    
    state.running=true; 
    state.power=100; 
    state.timeElapsed=0;
    state.doorLeft=false; 
    state.doorRight=false; 
    state.currentCam='1A';
    state.morganLoc=pickRandomMorganCam(null); 
    state.morganMoveCooldown=0; 
    state.morganAtDoor=null;
    
    {
      const ai=(typeof getAILevel==='function')?getAILevel('morgan'):10;
      const factor=(0.6 + (ai/20));
      state.morganAggression=(0.55+(state.night-1)*0.1)*factor;
    }
    
    state.jumpscarePending=false; 
    state.gameOver=false; 
    state.won=false;
    state.lastKiller=null;
    state.morganCamLoc=null;
    initCamStareTimers();

  state.shadowCamLoc=null;
  state.shadowAtDoor=null;
  state.shadowDoorPresenceSeconds=0;
  state.shadowDoorScareLimitSeconds=0;
  state.shadowMoveToDoorSeconds=0;
  state.shadowPresenceSeconds=0;
  {
    const ai=(typeof getAILevel==='function')?getAILevel('shadow'):10;
    const d=ai-10;
    const min=Math.max(4,Math.round(10 - (d*0.35)));
    const max=Math.max(min+3,Math.round(18 - (d*0.45)));
    state.shadowCooldownSeconds=randInt(min,max);
  }

  state.lightLeft=false; state.lightRight=false;
  state.camLightOn=false;
  if(typeof updateCamLightVisual === 'function') updateCamLightVisual();

  state.hamletProgress=0;
  state.hamletCamSeconds=0;
  state.hamletCamSessionSeconds=0;
  updateHamletVisual();

  state.twiggActive=false;
  state.twiggFailSeconds=0;
  state.twiggNeedle=0;
  state.twiggNeedleDir=1;
  state.twiggSafeCenter=0.5;
  state.twiggSafeWidth=0.22;
  if(twiggInterval){clearInterval(twiggInterval);twiggInterval=null;}
  if(isEnemyEnabled('twigg')) scheduleNextTwigg(); else state.twiggNextAt=0;
  updateTwiggUI();

  // Initialize Dr Hodge
  if(window.HodgeAI) HodgeAI.reset();

  updateUsageDisplay(getRawDrain(),getNightMultiplier());

  setDoorVisual('left',false); setDoorVisual('right',false);
  setLightVisual('left',false); setLightVisual('right',false);
  updateShadowOfficeVisual();
  $id('morgan-left').className='morgan-office left';
  $id('morgan-right').className='morgan-office right';
  $id('fear-overlay').className='fear-overlay';
  $id('powerout-overlay').classList.remove('show');
  hideMorganOnCam(); clearAlert();
  hideShadowOnCam();
  const hL=$id('hodge-left');
  const hR=$id('hodge-right');
  if(hL) hL.style.display='none';
  if(hR) hR.style.display='none';
  const hC=$id('hodge-on-cam');
  if(hC) hC.style.display='none';
  CAMS.forEach(c=>{const b=document.getElementById(`cambtn-${c}`);if(b)b.className='cam-btn'+(c==='1A'?' active':'');});
  updateCamScene();
  updateCamDanger();
  console.log('Game state reset successfully');
  } catch(error){
    console.error('Error resetting game state:', error);
  }
}

function tick(){
  if(!state.running) return;
  state.timeElapsed++;

  if(!state.gameOver){
    if(state.twiggActive){
      state.twiggFailSeconds=Math.max(0,(state.twiggFailSeconds||0)-1);
      if(state.twiggFailSeconds<=0){
        endTwiggMinigame(false);
        return;
      }
      const rawDrain=getRawDrain();
      const mult=getNightMultiplier();
      const drain=rawDrain*mult;
      updateUsageDisplay(rawDrain,mult);
      state.power=Math.max(0,state.power-drain);
      updatePowerDisplay();
      updateClock();
      if(state.power<=0&&!state.gameOver){powerOut();return;}
      return;
    } else if(state.timeElapsed>0 && state.twiggNextAt>0 && state.timeElapsed>=state.twiggNextAt){
      startTwiggMinigame();
    }
  }

  if(isCamPanelOpen() && isEnemyEnabled('hamlet')){
    state.hamletCamSeconds=(state.hamletCamSeconds||0)+1;
    state.hamletCamSessionSeconds=(state.hamletCamSessionSeconds||0)+1;
    if(state.hamletCamSeconds>=6){
      state.hamletCamSeconds=0;
      const s=(state.hamletCamSessionSeconds||0);
      const ai=(typeof getAILevel==='function')?getAILevel('hamlet'):10;
      const scale=ai/10;
      const accel=Math.min(2.4, 1 + (s/36));
      const amt=Math.max(1,Math.round(2*accel*scale));
      addHamletProgress(amt);
    }
  }
  const rawDrain=getRawDrain();
  const mult=getNightMultiplier();
  const drain=rawDrain*mult;
  updateUsageDisplay(rawDrain,mult);
  state.power=Math.max(0,state.power-drain);
  updatePowerDisplay();
  updateClock();
  if(isEnemyEnabled('shadow')) handleShadowAI();
  handleMorganOfficeBehavior();
  handleMorganCameraBehavior();
  if(isEnemyEnabled('hodge') && window.HodgeAI) HodgeAI.update();
  if(state.timeElapsed/NIGHT_DURATION>=1&&!state.gameOver){winNight();return;}
  if(state.power<=0&&!state.gameOver){powerOut();return;}
}

function toggleDoor(side){
  if(!state.running||state.gameOver||state.power<=0)return;
  AUDIO.sfxDoor();
  if(side==='left'){
    state.doorLeft=!state.doorLeft;
    setDoorVisual('left',state.doorLeft);
    if(state.doorLeft && state.shadowAtDoor==='left') repelShadowFromDoor('left',true);
    if(state.doorLeft && state.hodgeAtDoor==='left'){
      showAlert('⚠ DOOR SHUT — DR HODGE BACKED OFF ⚠');
    }
  }
  else{
    state.doorRight=!state.doorRight;
    setDoorVisual('right',state.doorRight);
    if(state.doorRight && state.shadowAtDoor==='right') repelShadowFromDoor('right',true);
    if(state.doorRight && state.hodgeAtDoor==='right'){
      showAlert('⚠ DOOR SHUT — DR HODGE BACKED OFF ⚠');
    }
  }
  updateShadowOfficeVisual();
  updateUsageDisplay(getRawDrain(),getNightMultiplier());
}

function setDoorVisual(side,closed){
  const btn=$id(`btn-${side}`);
  const ov=$id(`door-overlay-${side}`);
  if(closed){btn.classList.add('closed');btn.innerHTML=`${side.toUpperCase()}<br>SHUT`;ov.classList.add('closed');}
  else{btn.classList.remove('closed');btn.innerHTML=`${side.toUpperCase()}<br>DOOR`;ov.classList.remove('closed');}
}

function switchCam(cam){
  if(cam==='6B') return;
  state.currentCam=cam;
  // Reset enemy visibility flags when switching cameras
  state.morganSeenWithLight=false;
  state.shadowSeenWithLight=false;
  state.hodgeSeenWithLight=false;
  CAMS.forEach(c=>{const b=document.getElementById(`cambtn-${c}`);if(b)b.classList.toggle('active',c===cam);});
  $id('cam-static').className='cam-static on';
  setTimeout(()=>{
    const m=$id('morgan-on-cam');
    const s=$id('shadow-on-cam');
    const h=$id('hodge-on-cam');
    const mOn=!!m && m.style.display!=='none' && m.style.display!=='';
    const sOn=!!s && s.style.display!=='none' && s.style.display!=='';
    const hOn=!!h && h.style.display!=='none' && h.style.display!=='';
    if(!mOn && !sOn && !hOn) $id('cam-static').className='cam-static';
  },180);
  $id('cam-feed-label').textContent=`CAM ${cam} — ${CAM_LABELS[cam]||cam}`;
  if(typeof updateCamLightVisual === 'function') updateCamLightVisual();
  updateCamScene();
  checkMorganOnCurrentCam();
  checkShadowOnCurrentCam();
  if(window.HodgeAI && typeof window.HodgeAI.updateCameraOverlay==='function') window.HodgeAI.updateCameraOverlay();
}

function powerOut(){
  state.running=false;state.gameOver=true;
  clearInterval(gameInterval);
  $id('powerout-overlay').classList.add('show');
  setTimeout(()=>triggerJumpscare('power'),3500);
}

function triggerJumpscare(killer){
  if(state.jumpscarePending||state.won) return;
  try {
    state.lastKiller=killer||state.lastKiller||'morgan';
    if(state.deaths && typeof state.deaths==='object'){
      const k=String(state.lastKiller||'').toLowerCase();
      if(typeof state.deaths[k]==='number') state.deaths[k]++;
      else state.deaths[k]=1;
      if(typeof saveProgress==='function') saveProgress();
    }
    if(typeof AUDIO !== 'undefined' && AUDIO.scream) {
      AUDIO.scream();
    }
    if(typeof AUDIO !== 'undefined' && AUDIO.stopAmbience) {
      AUDIO.stopAmbience();
    }
    
    // Stop any existing scream and play new one
    if(typeof screamAudio !== 'undefined' && screamAudio) {
      screamAudio.pause();
      screamAudio.currentTime = 0;
    }
    screamAudio = new Audio('Scream.m4a');
    screamAudio.volume = 0.8;
    screamAudio.play().catch(err => console.log('Scream audio play error:', err));
    
    state.jumpscarePending=true;state.running=false;state.gameOver=true;
    clearInterval(gameInterval);clearInterval(camTsInterval);
    if(twiggInterval){clearInterval(twiggInterval);twiggInterval=null;}
    state.twiggActive=false;
    updateTwiggUI();

    const img=document.querySelector('#jumpscare-screen .jumpscare-img');
    if(img){
      img.classList.remove('shadow');
      img.classList.remove('hamlet');
      img.classList.remove('twigg');
      img.classList.remove('hodge');
      img.classList.remove('zoom-scare');
      if(state.lastKiller==='shadow') img.classList.add('shadow');
      if(state.lastKiller==='hamlet') img.classList.add('hamlet');
      if(state.lastKiller==='twigg') img.classList.add('twigg');
      if(state.lastKiller==='hodge') img.classList.add('hodge');
      // Trigger zoom animation
      img.classList.add('zoom-scare');
    }

    const t=document.getElementById('scare-text');
    const sub=document.getElementById('scare-sub');
    const tip=$id('scare-tip');
    if(t && sub){
      if(state.lastKiller==='shadow'){
        t.textContent='CAUGHT YOU';
        sub.textContent='the blue shadow slipped in when you blinked';
      } else if(state.lastKiller==='hamlet'){
        t.textContent='TOO CLOSE';
        sub.textContent='mr hamlet was already in the room';
      } else if(state.lastKiller==='twigg'){
        t.textContent='MISSED IT';
        sub.textContent='mr twigg doesn\'t forgive mistakes';
      } else if(state.lastKiller==='hodge'){
        t.textContent='NO ESCAPE';
        sub.textContent='dr hodge waited at the door for you to slip';
      } else if(state.lastKiller==='power'){
        t.textContent='LIGHTS OUT';
        sub.textContent='with no power, you were never safe';
      } else {
        t.textContent='FOUND YOU';
        sub.textContent='morgan was right behind you the whole time';
      }
    }
    
    if(tip){
      if(state.lastKiller==='shadow'){
        const tips=['TIP: Something at the door doesn\'t always show itself. Try using light at the right time.','TIP: If you sense you\'re being watched from one side, act fast—waiting is dangerous.','TIP: Some things back off when you take control of the doorway.'];
        tip.textContent=tips[Math.floor(Math.random()*tips.length)];
      } else if(state.lastKiller==='hamlet'){
        const tips=['TIP: Some things don\'t come from the halls. Pay attention to what you bring back with you.','TIP: The more you hide behind the screens, the more the office changes.','TIP: If something feels wrong after checking cameras, trust that feeling.'];
        tip.textContent=tips[Math.floor(Math.random()*tips.length)];
      } else if(state.lastKiller==='twigg'){
        const tips=['TIP: When the room goes quiet, keep your hands ready. Hesitation gets punished.','TIP: Not every threat comes from a door. Sometimes you only get one chance.','TIP: The safe moment is smaller than it looks. Wait too long and it\'s over.'];
        tip.textContent=tips[Math.floor(Math.random()*tips.length)];
      } else if(state.lastKiller==='hodge'){
        const tips=['TIP: Close the door to make him leave. Keeping it open only buys him time.','TIP: If you see him creeping closer on cameras, prepare to shut the right door.','TIP: Don\'t wait for the last second—he punishes hesitation.'];
        tip.textContent=tips[Math.floor(Math.random()*tips.length)];
      } else if(state.lastKiller==='power'){
        const tips=['TIP: Power is safety. Waste it, and you\'ll pay for it later.','TIP: If the night feels quiet, that\'s when you should save power the most.','TIP: Lights and doors are expensive. Use them like they\'re your last.'];
        tip.textContent=tips[Math.floor(Math.random()*tips.length)];
      } else {
        const tips=['TIP: Staring too long can make things move. Sometimes that\'s exactly what you want.','TIP: Don\'t get comfortable on one camera. Keep control of what you\'re seeing.','TIP: If you lose track of him, the office gets a lot smaller.'];
        tip.textContent=tips[Math.floor(Math.random()*tips.length)];
      }
    }
    
    document.body.style.background='#fff';
    setTimeout(()=>{document.body.style.background='#000';},80);
    
    switchScreen('jumpscare-screen');
  } catch(e) {
    console.error('Error in triggerJumpscare:', e);
    state.gameOver = true;
  }
}

function winNight(){
  state.running=false;state.won=true;state.gameOver=true;
  clearInterval(gameInterval);clearInterval(camTsInterval);
  $id('win-stat').textContent=`NIGHT ${state.night} COMPLETE · POWER: ${Math.round(state.power)}% LEFT`;
  state.night++;
  updateNightIndicator();
  if(typeof saveProgress==='function') saveProgress();
  if(window.AUDIO && AUDIO.bell) AUDIO.bell();
  setTimeout(()=>showScreen('win-screen'),600);
}

function nextNight(){
  try {
    console.log('Starting next night...');
    updateNightIndicator();
    if(state) state.mode='story';
    startGame();
  } catch(error){
    console.error('Error starting next night:', error);
  }
}
function retryNight(){
  try {
    // Stop scream audio
    if(screamAudio){
      screamAudio.pause();
      screamAudio.currentTime = 0;
      screamAudio = null;
    }
    console.log('Retrying night...');
    updateNightIndicator();
    startGame();
  } catch(error){
    console.error('Error retrying night:', error);
  }
}
function goTitle(){
  try {
    // Stop scream audio
    if(screamAudio){
      screamAudio.pause();
      screamAudio.currentTime = 0;
      screamAudio = null;
    }
    clearInterval(gameInterval);
    clearInterval(camTsInterval);
    updateNightIndicator();
    showScreen('title-screen');
  } catch(error){
    console.error('Error going to title:', error);
  }
}

function updateCamLightVisual(){
  const feed=$id('cam-feed');
  if(feed) feed.classList.toggle('cam-lit',!!state.camLightOn);
  const btn=$id('btn-cam-light');
  if(btn) btn.classList.toggle('on',!!state.camLightOn);
}

function isCamPanelOpen(){
  const overlay=$id('cam-panel-overlay');
  if(!overlay) return false;
  return overlay.style.display!=='none' && overlay.style.display!=='';
}

function closeCamPanel(){
  $id('cam-panel-overlay').style.display='none';
  if(typeof AUDIO !== 'undefined' && AUDIO.sfxCamClose) AUDIO.sfxCamClose();
  state.camLightOn=false;
  state.morganSeenWithLight=false;
  state.shadowSeenWithLight=false;
  state.hodgeSeenWithLight=false;
  updateCamLightVisual();
  if(typeof hideMorganOnCam === 'function') hideMorganOnCam();
  if(typeof hideShadowOnCam === 'function') hideShadowOnCam();
}

function toggleCamLight(){
  if(!state.running||state.gameOver||state.power<=0) return;
  if(!isCamPanelOpen()) return;
  state.camLightOn=!state.camLightOn;
  if(typeof AUDIO !== 'undefined' && AUDIO.sfxLight) AUDIO.sfxLight();
  updateCamLightVisual();
  if(typeof checkMorganOnCurrentCam === 'function') checkMorganOnCurrentCam();
  if(typeof checkShadowOnCurrentCam === 'function') checkShadowOnCurrentCam();
  if(typeof updateHodgeOnCurrentCam === 'function') updateHodgeOnCurrentCam();
}

updateNightIndicator();
