function isAfter1AM(){
  return state.timeElapsed >= (NIGHT_DURATION/6);
}

function spawnShadow(){
  const ai=(typeof getAILevel==='function')?getAILevel('shadow'):10;
  const d=ai-10;
  const side=(Math.random()<0.5)?'left':'right';
  // Shadow spawns directly at a door (not at camera)
  state.shadowCamLoc=null;
  state.shadowAtDoor=side;
  state.shadowDoorPresenceSeconds=0;
  const min=Math.max(8,Math.round(15 - (d*0.35)));
  const max=Math.max(min+2,Math.round(25 - (d*0.45)));
  state.shadowDoorScareLimitSeconds=randInt(min,max);
  state.shadowCooldownSeconds=0;
  showAlert(side==='left'?'⚠ SOMETHING IS AT THE LEFT DOOR ⚠':'⚠ SOMETHING IS AT THE RIGHT DOOR ⚠');
  updateShadowOfficeVisual();
  checkShadowOnCurrentCam();
}

function handleShadowAI(){
  if(!state.running||state.gameOver||state.power<=0) return;
  if(!isAfter1AM()) return;

  if(state.shadowCooldownSeconds>0) state.shadowCooldownSeconds--;

  // Shadow spawns directly at door (no camera location phase)
  if(!state.shadowAtDoor){
    if(state.shadowCooldownSeconds<=0){
      spawnShadow();
    }
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
  // Shadow no longer appears on cameras - always at doors
  hideShadowOnCam();
}

function showShadowOnCam(){
  // Only show if camera light is ON
  if(!state.camLightOn) {
    const el=$id('shadow-on-cam');
    if(el) el.style.display='none';
    return;
  }
  const el=$id('shadow-on-cam');
  if(el) el.style.display='flex';
  $id('cam-static').className='cam-static on';
}

function hideShadowOnCam(){
  const el=$id('shadow-on-cam');
  if(el) el.style.display='none';
}
