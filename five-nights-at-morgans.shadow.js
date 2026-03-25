function isAfter1AM(){
  return state.timeElapsed >= (NIGHT_DURATION/6);
}

function spawnShadow(){
  const ai=(typeof getAILevel==='function')?getAILevel('shadow'):10;
  const d=ai-10;
  const side=(Math.random()<0.5)?'left':'right';
  state.shadowCamLoc=(side==='left')?'6A':'7A';
  state.shadowPresenceSeconds=0;
  const moveBase=Math.round(randInt(30,50)*0.8);
  const move=Math.max(5,Math.round(moveBase - (d*1.2)));
  state.shadowMoveToDoorSeconds=move;
  state.shadowAtDoor=null;
  state.shadowCooldownSeconds=0;
  checkShadowOnCurrentCam();
}

function handleShadowAI(){
  if(!state.running||state.gameOver||state.power<=0) return;
  if(!isAfter1AM()) return;

  if(state.shadowCooldownSeconds>0) state.shadowCooldownSeconds--;

  if(!state.shadowCamLoc && !state.shadowAtDoor){
    if(state.shadowCooldownSeconds<=0){
      spawnShadow();
    }
    return;
  }

  if(state.shadowCamLoc){
    state.shadowPresenceSeconds++;
    if(state.shadowPresenceSeconds>=state.shadowMoveToDoorSeconds){
      const side=(state.shadowCamLoc==='6A')?'left':'right';
      state.shadowCamLoc=null;
      state.shadowAtDoor=side;
      state.shadowDoorPresenceSeconds=0;
      const ai=(typeof getAILevel==='function')?getAILevel('shadow'):10;
      const d=ai-10;
      const min=Math.max(4,Math.round(10 - (d*0.35)));
      const max=Math.max(min+2,Math.round(16 - (d*0.45)));
      state.shadowDoorScareLimitSeconds=randInt(min,max);
      showAlert(side==='left'?'⚠ SOMETHING IS AT THE LEFT DOOR ⚠':'⚠ SOMETHING IS AT THE RIGHT DOOR ⚠');
      checkShadowOnCurrentCam();
      updateShadowOfficeVisual();
    }
    checkShadowOnCurrentCam();
    return;
  }

  if(state.shadowAtDoor){
    const side=state.shadowAtDoor;
    const closed=(side==='left')?state.doorLeft:state.doorRight;
    if(closed){
      repelShadowFromDoor(side,true);
      return;
    }

    state.shadowDoorPresenceSeconds++;
    updateShadowOfficeVisual();
    if(state.shadowDoorPresenceSeconds>=state.shadowDoorScareLimitSeconds){
      triggerJumpscare('shadow');
    }
  }
}

function repelShadowFromDoor(side,showMsg){
  const ai=(typeof getAILevel==='function')?getAILevel('shadow'):10;
  const d=ai-10;
  state.shadowAtDoor=null;
  state.shadowDoorPresenceSeconds=0;
  state.shadowDoorScareLimitSeconds=0;
  const min=Math.max(4,Math.round(12 - (d*0.4)));
  const max=Math.max(min+3,Math.round(20 - (d*0.5)));
  state.shadowCooldownSeconds=randInt(min,max);
  updateShadowOfficeVisual();
  if(showMsg) showAlert('⚠ DOOR SHUT — IT BACKED OFF ⚠');
}

function updateShadowOfficeVisual(){
  const l=$id('shadow-left');
  const r=$id('shadow-right');
  if(l) l.className='shadow-office left';
  if(r) r.className='shadow-office right';

  if(!state.shadowAtDoor) return;
  const side=state.shadowAtDoor;
  const lightOn=(side==='left')?state.lightLeft:state.lightRight;
  const doorClosed=(side==='left')?state.doorLeft:state.doorRight;
  if(doorClosed) return;
  if(!lightOn) return;
  const el=$id(`shadow-${side}`);
  if(el) el.classList.add('peek');
}

function checkShadowOnCurrentCam(){
  const onCam=(isCamPanelOpen() && state.shadowCamLoc && state.currentCam===state.shadowCamLoc);
  if(onCam) showShadowOnCam(); else hideShadowOnCam();
}

function showShadowOnCam(){
  // Show if: light is currently on (first reveal) OR was already seen with light on (persistent)
  if(!state.camLightOn && !state.shadowSeenWithLight) return;
  if(state.camLightOn) state.shadowSeenWithLight = true;
  const el=$id('shadow-on-cam');
  if(el) el.style.display='flex';
  $id('cam-static').className='cam-static on';
}

function hideShadowOnCam(){
  const el=$id('shadow-on-cam');
  if(el) el.style.display='none';
}
