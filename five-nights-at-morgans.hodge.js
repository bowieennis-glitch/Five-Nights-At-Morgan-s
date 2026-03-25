// Dr Hodge AI Module
// Appears on cameras, moves closer to YOU (6B), then shows at a door.
// Only leaves after you close the door on him.

function hideHodgeOnCam(){
  const el=$id('hodge-on-cam');
  if(el) el.style.display='none';
}

function showHodgeOnCam(){
  // Show if: light is currently on (first reveal) OR was already seen with light on (persistent)
  if(!state.camLightOn && !state.hodgeSeenWithLight) return;
  if(state.camLightOn) state.hodgeSeenWithLight = true;
  const el=$id('hodge-on-cam');
  if(el) el.style.display='flex';
  $id('cam-static').className='cam-static on';
}

function updateHodgeOnCurrentCam(){
  const onCam=(isCamPanelOpen() && state.hodgeCamLoc && state.currentCam===state.hodgeCamLoc);
  if(onCam) showHodgeOnCam(); else hideHodgeOnCam();
}

function hideHodgeAtDoor(side){
  const el=$id(`hodge-${side}`);
  if(el) el.style.display='none';
}

function showHodgeAtDoor(side){
  const el=$id(`hodge-${side}`);
  if(el) el.style.display='block';
}

function hodgeSecondsBetweenMoves(ai){
  const d=ai-10;
  const baseMin=Math.max(6,Math.round(16 - (d*0.7)));
  const baseMax=Math.max(baseMin+4,Math.round(26 - (d*0.9)));
  return randInt(baseMin,baseMax);
}

function hodgeDoorScareLimit(ai){
  const d=ai-10;
  const min=Math.max(3,Math.round(12 - (d*0.55)));
  const max=Math.max(min+2,Math.round(18 - (d*0.65)));
  return randInt(min,max);
}

function pickHodgePath(){
  const left=['5A','4A','3A','2A','1A','6A'];
  const right=['5A','4A','3A','2A','1B','7A'];
  return (Math.random()<0.5)?left:right;
}

window.HodgeAI={
  reset(){
    state.hodgeCamLoc=null;
    state.hodgePath=pickHodgePath();
    state.hodgePathIndex=0;
    state.hodgeAtDoor=null;
    state.hodgeDoorPresenceSeconds=0;
    state.hodgeDoorScareLimitSeconds=0;
    const ai=(typeof getAILevel==='function')?getAILevel('hodge'):10;
    state.hodgeMoveCooldownSeconds=hodgeSecondsBetweenMoves(ai);
    hideHodgeOnCam();
    hideHodgeAtDoor('left');
    hideHodgeAtDoor('right');
  },

  update(){
    if(!state.running||state.gameOver||state.power<=0) return;
    const ai=(typeof getAILevel==='function')?getAILevel('hodge'):10;

    if(state.hodgeAtDoor){
      const side=state.hodgeAtDoor;
      const closed=(side==='left')?state.doorLeft:state.doorRight;
      if(closed){
        hideHodgeAtDoor(side);
        state.hodgeAtDoor=null;
        state.hodgeDoorPresenceSeconds=0;
        state.hodgeDoorScareLimitSeconds=0;
        state.hodgeCamLoc=null;
        state.hodgePath=pickHodgePath();
        state.hodgePathIndex=0;
        state.hodgeMoveCooldownSeconds=hodgeSecondsBetweenMoves(ai);
        updateHodgeOnCurrentCam();
        return;
      }

      state.hodgeDoorPresenceSeconds++;
      if(state.hodgeDoorScareLimitSeconds<=0){
        state.hodgeDoorScareLimitSeconds=hodgeDoorScareLimit(ai);
      }
      if(state.hodgeDoorPresenceSeconds>=state.hodgeDoorScareLimitSeconds){
        triggerJumpscare('hodge');
      }
      return;
    }

    if(state.hodgeMoveCooldownSeconds>0){
      state.hodgeMoveCooldownSeconds--;
      updateHodgeOnCurrentCam();
      return;
    }

    if(!Array.isArray(state.hodgePath) || state.hodgePath.length===0){
      state.hodgePath=pickHodgePath();
      state.hodgePathIndex=0;
    }

    if(state.hodgePathIndex<=0){
      const startChoices=state.hodgePath.slice(0,4);
      state.hodgePathIndex=Math.max(0,Math.floor(Math.random()*startChoices.length));
      state.hodgeCamLoc=state.hodgePath[state.hodgePathIndex]||null;
    } else if(state.hodgePathIndex < state.hodgePath.length-1){
      state.hodgePathIndex++;
      state.hodgeCamLoc=state.hodgePath[state.hodgePathIndex]||null;
    } else {
      const last=state.hodgePath[state.hodgePath.length-1];
      const side=(last==='6A')?'left':'right';
      state.hodgeCamLoc=null;
      state.hodgeAtDoor=side;
      state.hodgeDoorPresenceSeconds=0;
      state.hodgeDoorScareLimitSeconds=hodgeDoorScareLimit(ai);
      showAlert(side==='left'?'⚠ DR HODGE — LEFT DOOR ⚠':'⚠ DR HODGE — RIGHT DOOR ⚠');
      showHodgeAtDoor(side);
    }

    state.hodgeMoveCooldownSeconds=hodgeSecondsBetweenMoves(ai);
    updateHodgeOnCurrentCam();
  },

  updateCameraOverlay(){
    updateHodgeOnCurrentCam();
  }
};
