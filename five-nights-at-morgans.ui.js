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
  AUDIO.sfxCamOpen();
  state.camLightOn=false;
  updateCamLightVisual();
  if(typeof addHamletProgress==='function'){
    const ai=(typeof getAILevel==='function')?getAILevel('hamlet'):10;
    const scale=ai/10;
    addHamletProgress(Math.max(1,Math.round(4*scale)));
  }
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
  checkMorganOnCurrentCam();
  checkShadowOnCurrentCam();
}

function closeCamPanel(){
  $id('cam-panel-overlay').style.display='none';
  AUDIO.sfxCamClose();
  state.camLightOn=false;
  updateCamLightVisual();
  state.hamletCamSessionSeconds=0;
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
  hideMorganOnCam();
  hideShadowOnCam();
}

function updateCamLightVisual(){
  const feed=$id('cam-feed');
  if(feed) feed.classList.toggle('cam-lit',!!state.camLightOn);
  const btn=$id('btn-cam-light');
  if(btn) btn.classList.toggle('on',!!state.camLightOn);
}

function toggleCamLight(){
  if(!state.running||state.gameOver||state.power<=0) return;
  if(!isCamPanelOpen()) return;
  state.camLightOn=!state.camLightOn;
  AUDIO.sfxLight();
  updateCamLightVisual();
  if(typeof updateUsageDisplay==='function' && typeof getRawDrain==='function' && typeof getNightMultiplier==='function'){
    updateUsageDisplay(getRawDrain(),getNightMultiplier());
  }
}

function toggleCamPanel(){
  const overlay=$id('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display==='none' || overlay.style.display==='') openCamPanel();
  else closeCamPanel();
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
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $id(id).classList.add('active');
}

function showAlert(msg){
  const bar=$id('alert-bar');
  bar.textContent=msg;bar.classList.add('show');
  if(alertTimeout)clearTimeout(alertTimeout);
  alertTimeout=setTimeout(()=>bar.classList.remove('show'),2800);
}

function clearAlert(){$id('alert-bar').classList.remove('show');}

function updateNightIndicator(){
  $id('night-indicator').textContent=`— Night ${state.night} —`;
}
