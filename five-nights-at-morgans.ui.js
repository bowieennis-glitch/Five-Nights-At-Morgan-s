function setLightVisual(side,on){
  const btn=$id(`btn-light-${side}`);
  const ov=$id(`light-overlay-${side}`);
  if(btn) btn.classList.toggle('on',!!on);
  if(ov) ov.classList.toggle('on',!!on);
}

function toggleLight(side){
  if(!state.running||state.gameOver||state.power<=0) return;
  AUDIO.sfxLight();
  if(side==='left') state.lightLeft=!state.lightLeft;
  else state.lightRight=!state.lightRight;
  setLightVisual(side,side==='left'?state.lightLeft:state.lightRight);
  updateShadowOfficeVisual();
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
}

function openCamPanel(){
  if(!state.running||state.gameOver||state.power<=0) return;
  $id('cam-panel-overlay').style.display='flex';
  if(typeof AUDIO !== 'undefined' && AUDIO.sfxCamOpen) AUDIO.sfxCamOpen();
  state.camLightOn=false;
  if(typeof updateCamLightVisual === 'function') updateCamLightVisual();
  if(typeof addHamletProgress==='function'){
    const ai=(typeof getAILevel==='function')?getAILevel('hamlet'):10;
    const scale=ai/10;
    addHamletProgress(Math.max(1,Math.round(4*scale)));
  }
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
  if(typeof checkMorganOnCurrentCam === 'function') checkMorganOnCurrentCam();
}

function closeCamPanel(){
  $id('cam-panel-overlay').style.display='none';
  if(typeof AUDIO !== 'undefined' && AUDIO.sfxCamClose) AUDIO.sfxCamClose();
  state.camLightOn=false;
  // Reset enemy visibility flags when closing camera panel
  state.morganSeenWithLight=false;
  state.shadowSeenWithLight=false;
  state.hodgeSeenWithLight=false;
  if(typeof updateCamLightVisual === 'function') updateCamLightVisual();
  state.hamletCamSessionSeconds=0;
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
  if(typeof hideMorganOnCam === 'function') hideMorganOnCam();
  if(typeof hideShadowOnCam === 'function') hideShadowOnCam();
}

function toggleCamLight(){
  if(!state.running||state.gameOver||state.power<=0) return;
  if(!isCamPanelOpen()) return;
  state.camLightOn=!state.camLightOn;
  if(typeof AUDIO !== 'undefined' && AUDIO.sfxLight) AUDIO.sfxLight();
  updateCamLightVisual();
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
  // Update enemy visibility when camera light changes
  if(typeof checkMorganOnCurrentCam === 'function') checkMorganOnCurrentCam();
  if(typeof checkShadowOnCurrentCam === 'function') checkShadowOnCurrentCam();
}

function toggleCamPanel(){
  const overlay=$id('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display==='none' || overlay.style.display==='') openCamPanel();
  else closeCamPanel();
}

function openManual(){
  const ov=$id('manual-overlay');
  if(!ov) return;
  renderManual();
  ov.style.display='flex';
}

function closeManual(){
  const ov=$id('manual-overlay');
  if(!ov) return;
  ov.style.display='none';
}

function renderManual(){
  const body=$id('manual-body');
  if(!body) return;

  const deaths=(state && state.deaths)?state.deaths:{};
  const entries=[
    {k:'morgan',name:'MORGAN',text:'Watch cameras, but don\'t get trapped staring too long. If he reaches your door, shut it before he tries to enter.'},
    {k:'shadow',name:'SHADOW',text:'If Shadow is at the door, use the correct door/light control quickly. Closing the door forces it to back off.'},
    {k:'hamlet',name:'MR HAMLET',text:'The longer you stay on cameras, the more he builds up in the office. Check cameras in short bursts and reset your focus often.'},
    {k:'twigg',name:'MR TWIGG',text:'When the minigame appears, stop the needle inside the safe zone. Don\'t hesitate, but don\'t panic either.'},
    {k:'hodge',name:'DR HODGE',text:'He creeps closer on cameras, then waits at a door. To make him leave, shut that door. Leaving it open gives him time to end the night.'},
    {k:'power',name:'POWER',text:'Conserve energy. Doors and lights drain power fast. If power hits zero, you are not safe.'},
  ];

  const unlocked=entries.filter(e=>Number(deaths[e.k]||0)>0);
  if(unlocked.length===0){
    body.innerHTML='<div class="manual-section"><div class="manual-enemy">NO ENTRIES YET</div><div class="manual-text">Die to an enemy to unlock their page.</div></div>';
    return;
  }

  body.innerHTML=unlocked.map(e=>{
    const n=Number(deaths[e.k]||0);
    return `<div class="manual-section">
      <div class="manual-enemy">${e.name} <span style="opacity:0.7; font-size:12px; letter-spacing:2px;">(DEATHS: ${n})</span></div>
      <div class="manual-text">${e.text}</div>
    </div>`;
  }).join('');
}

document.addEventListener('keydown',(e)=>{
  if(e.key!=='Escape') return;
  const overlay=$id('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display!=='none' && overlay.style.display!=='') closeCamPanel();
});

document.addEventListener('keydown',(e)=>{
  if(e.key!==' ' && e.key!=='Enter') return;
  if(!state || !state.twiggActive) return;
  if(typeof twiggAttempt==='function') twiggAttempt();
});

document.addEventListener('click',(e)=>{
  const overlay=$id('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display==='none' || overlay.style.display==='') return;
  if(e.target===overlay) closeCamPanel();
});

function showScreen(id){
  try {
    if(!id) {
      console.error('showScreen called with no id');
      return;
    }
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const targetScreen = $id(id);
    if(targetScreen) {
      targetScreen.classList.add('active');
      console.log('Switched to screen:', id);
    } else {
      console.error('Screen not found:', id);
    }
  } catch(error){
    console.error('Error showing screen:', error);
  }
}

function showAlert(msg){
  try {
    const bar=$id('alert-bar');
    if(!bar) return;
    bar.textContent=msg;
    bar.classList.add('show');
    if(alertTimeout) clearTimeout(alertTimeout);
    alertTimeout=setTimeout(()=>bar.classList.remove('show'),2800);
  } catch(error){
    console.error('Error showing alert:', error);
  }
}

function clearAlert(){
  try {
    const bar=$id('alert-bar');
    if(bar) bar.classList.remove('show');
  } catch(error){
    console.error('Error clearing alert:', error);
  }
}

function updateNightIndicator(){
  try {
    const indicator = $id('night-indicator');
    if(indicator && state && typeof state.night !== 'undefined') {
      indicator.textContent=`— Night ${state.night} —`;
    }
  } catch(error){
    console.error('Error updating night indicator:', error);
  }
}

function openCustomNight(){
  const ov=$id('custom-night-overlay');
  if(!ov) return;
  const names=['morgan','shadow','hamlet','twigg','hodge'];
  names.forEach(n=>{
    const input=$id(`ai-${n}`);
    const val=$id(`ai-${n}-val`);
    const ai=(typeof getAILevel==='function')?getAILevel(n):10;
    if(input) input.value=String(ai);
    if(val) val.textContent=String(ai);
  });
  ov.style.display='flex';
}

function closeCustomNight(){
  const ov=$id('custom-night-overlay');
  if(!ov) return;
  ov.style.display='none';
}

function syncCustomNightAI(name){
  const n=String(name||'').toLowerCase();
  const input=$id(`ai-${n}`);
  const val=$id(`ai-${n}-val`);
  if(!input || !val) return;
  val.textContent=String(input.value);
}

function startCustomNight(){
  try {
    console.log('Starting custom night...');
    const names=['morgan','shadow','hamlet','twigg','hodge'];
    const levels={};
    names.forEach(n=>{
      const input=$id(`ai-${n}`);
      if(input) levels[n]=Number(input.value);
    });
    if(typeof setAILevels==='function') setAILevels(levels);
    closeCustomNight();
    if(state) state.mode='custom';
    startGame();
  } catch(error){
    console.error('Error starting custom night:', error);
  }
}
