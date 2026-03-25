function initCamStareTimers(){
  const ai=(typeof getAILevel==='function')?getAILevel('morgan'):10;
  const d=ai-10;
  state.morganCamObservedSeconds=0;
  const obsMin=Math.max(2,Math.round(3 + (d*0.12)));
  const obsMax=Math.max(obsMin+1,Math.round(5 + (d*0.12)));
  state.morganCamObserveTargetSeconds=randInt(obsMin,obsMax);
  state.morganCamPresenceSeconds=0;
  const limMin=Math.max(12,Math.round(30 - (d*1.0)));
  const limMax=Math.max(limMin+5,Math.round(50 - (d*1.2)));
  state.morganCamScareLimitSeconds=randInt(limMin,limMax);
  state.morganCamReappearSeconds=0;
  state.morganCamNextLoc=null;
  updateCamButtonDanger();
}

function updateCamButtonDanger(){
  const btn=$id('btn-cam');
  if(!btn){
    return;
  }

  if(state.gameOver || !state.running){
    btn.classList.remove('danger');
    btn.style.animationDuration='';
    return;
  }

  if(isCamPanelOpen()){
    btn.classList.remove('danger');
    btn.style.animationDuration='';
    return;
  }

  if(!state.morganCamLoc){
    btn.classList.remove('danger');
    btn.style.animationDuration='';
    return;
  }

  const limit=Math.max(1,(state.morganCamScareLimitSeconds||0));
  const presence=Math.max(0,(state.morganCamPresenceSeconds||0));
  const t=Math.min(1,Math.max(0,presence/limit));

  if(t<=0.15){
    btn.classList.remove('danger');
    btn.style.animationDuration='';
    return;
  }

  btn.classList.add('danger');
  const dur=0.95-(0.75*t);
  btn.style.animationDuration=`${Math.max(0.18,dur).toFixed(2)}s`;
}

function chaseMorganOffCam(){
  const ai=(typeof getAILevel==='function')?getAILevel('morgan'):10;
  const d=ai-10;
  const next=pickRandomMorganCam(state.morganCamLoc || state.currentCam);
  state.morganCamNextLoc=next;
  state.morganCamLoc=null;
  state.morganLoc='offcam';
  state.morganCamObservedSeconds=0;
  state.morganCamPresenceSeconds=0;
  const rMin=Math.max(5,Math.round(10 - (d*0.3)));
  const rMax=Math.max(rMin+2,Math.round(15 - (d*0.3)));
  state.morganCamReappearSeconds=randInt(rMin,rMax);
  updateCamDanger();
  updateCamButtonDanger();
  checkMorganOnCurrentCam();
}

function handleMorganCameraBehavior(){
  if(state.gameOver || !state.running) return;

  if(state.morganCamReappearSeconds>0){
    state.morganCamReappearSeconds--;
    if(state.morganCamReappearSeconds===0 && state.morganCamNextLoc){
      state.morganCamLoc=state.morganCamNextLoc;
      state.morganCamNextLoc=null;
      state.morganLoc=state.morganCamLoc;
      state.morganCamObservedSeconds=0;
      const ai=(typeof getAILevel==='function')?getAILevel('morgan'):10;
      const d=ai-10;
      const obsMin=Math.max(2,Math.round(3 + (d*0.12)));
      const obsMax=Math.max(obsMin+1,Math.round(5 + (d*0.12)));
      state.morganCamObserveTargetSeconds=randInt(obsMin,obsMax);
      state.morganCamPresenceSeconds=0;
      const limMin=Math.max(12,Math.round(30 - (d*1.0)));
      const limMax=Math.max(limMin+5,Math.round(50 - (d*1.2)));
      state.morganCamScareLimitSeconds=randInt(limMin,limMax);
      updateCamDanger();
      updateCamButtonDanger();
      checkMorganOnCurrentCam();
    }
    return;
  }

  if(!state.morganCamLoc && CAMS.includes(state.morganLoc)){
    state.morganCamLoc=state.morganLoc;
    state.morganCamObservedSeconds=0;
    const ai=(typeof getAILevel==='function')?getAILevel('morgan'):10;
    const d=ai-10;
    const obsMin=Math.max(2,Math.round(3 + (d*0.12)));
    const obsMax=Math.max(obsMin+1,Math.round(5 + (d*0.12)));
    state.morganCamObserveTargetSeconds=randInt(obsMin,obsMax);
    state.morganCamPresenceSeconds=0;
    const limMin=Math.max(12,Math.round(30 - (d*1.0)));
    const limMax=Math.max(limMin+5,Math.round(50 - (d*1.2)));
    state.morganCamScareLimitSeconds=randInt(limMin,limMax);
  }

  if(!state.morganCamLoc) return;

  if(isCamPanelOpen()){
    const watching=(state.currentCam===state.morganCamLoc);
    if(watching && state.camLightOn){
      state.morganCamObservedSeconds++;
      if(state.morganCamObservedSeconds>=state.morganCamObserveTargetSeconds){
        showAlert('⚠ HE DOESN\'T LIKE TO BE WATCHED ⚠');
        chaseMorganOffCam();
        return;
      }
    } else {
      state.morganCamObservedSeconds=0;
    }

    updateCamButtonDanger();

    return;
  }

  state.morganCamPresenceSeconds++;
  updateCamButtonDanger();
  if(state.morganCamPresenceSeconds>=state.morganCamScareLimitSeconds){
    triggerJumpscare('morgan');
  }
  return;
}

function getMorganActiveCam(){
  if(state.morganCamReappearSeconds>0) return null;
  if(state.morganAtDoor==='left') return '1A';
  if(state.morganAtDoor==='right') return '1B';
  if(state.morganCamLoc) return state.morganCamLoc;
  if(CAMS.includes(state.morganLoc)) return state.morganLoc;
  return null;
}

function moveMorganCloser(){
  const goDoorChance=Math.min(0.75, 0.18 + state.morganAggression*0.22 + (state.night-1)*0.05);
  if(Math.random()<goDoorChance){
    const side=(Math.random()<0.5)?'left':'right';
    state.morganAtDoor=side;
    state.morganLoc=side+'_door';
    showMorganAtDoor(side);
  } else {
    const nextCam=pickRandomMorganCam(CAMS.includes(state.morganLoc)?state.morganLoc:null);
    state.morganLoc=nextCam;
  }
  checkMorganOnCurrentCam();
}

function attemptEntry(){
  const side=state.morganAtDoor;
  const closed=side==='left'?state.doorLeft:state.doorRight;
  if(closed){
    state.morganAtDoor=null; state.morganLoc=pickRandomMorganCam(null);
    hideMorganAtDoor(side);
    showAlert('⚠ DOOR HELD — HE WALKED AWAY ⚠');
  } else {
    triggerJumpscare('morgan');
  }
}

function showMorganAtDoor(side){
  $id(`morgan-${side}`).className=`morgan-office ${side} peek`;
  showAlert(side==='left'?'⚠ HE\'S AT THE LEFT DOOR ⚠':'⚠ HE\'S AT THE RIGHT DOOR ⚠');
}

function hideMorganAtDoor(side){
  $id(`morgan-${side}`).className=`morgan-office ${side}`;
}

function checkMorganOnCurrentCam(){
  const active=getMorganActiveCam();
  const onCam=(active && state.currentCam===active);
  if(onCam) showMorganOnCam(); else hideMorganOnCam();
}

function showMorganOnCam(){
  // Only show if camera light is ON
  if(!state.camLightOn) {
    $id('morgan-on-cam').style.display='none';
    return;
  }
  $id('morgan-on-cam').style.display='flex';
  $id('cam-static').className='cam-static on';
}

function hideMorganOnCam(){
  $id('morgan-on-cam').style.display='none';
  $id('cam-static').className='cam-static';
}

function updateCamDanger(){
  CAMS.forEach(c=>{
    const btn=$id(`cambtn-${c}`);if(!btn)return;
    const active=getMorganActiveCam();
    const has=(active===c);
    if(has){
      btn.classList.add('danger');
      if(state.morganCamLoc && active===state.morganCamLoc){
        const remaining=Math.max(0,(state.morganCamScareLimitSeconds||0)-(state.morganCamPresenceSeconds||0));
        const t=Math.min(1,Math.max(0,1-(remaining/Math.max(1,(state.morganCamScareLimitSeconds||1)))));
        const dur=(0.6-(0.48*t));
        btn.style.animationDuration=`${dur.toFixed(2)}s`;
      } else {
        btn.style.animationDuration='0.50s';
      }
    } else {
      btn.classList.remove('danger');
      btn.style.animationDuration='';
    }
  });
}
