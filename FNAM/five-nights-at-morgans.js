const NIGHT_DURATION = 90;
const CAMS = ['1A','1B','2A','3A','4A','5A','6A','6B','7A'];
const CAM_LABELS = {
  '1A':'HALLWAY A',
  '1B':'HALLWAY B',
  '2A':'CLASSROOM 2A',
  '3A':'CAFETERIA',
  '4A':'LIBRARY',
  '5A':'MAIN ENTRANCE',
  '6A':'LEFT DOOR',
  '6B':'YOU',
  '7A':'RIGHT DOOR',
};
const LEFT_CHAIN  = ['5A','4A','2A','1A'];
const RIGHT_CHAIN = ['5A','4A','2A','1B'];

function camSvgTemplate(title, scene){
  return `
    <defs>
      <linearGradient id="cam_wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#040a0a"/>
        <stop offset="60%" stop-color="#020404"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>
      <linearGradient id="cam_floor" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#020404"/>
        <stop offset="100%" stop-color="#000"/>
      </linearGradient>
      <radialGradient id="cam_light" cx="50%" cy="30%" r="80%">
        <stop offset="0%" stop-color="#0a1a0a" stop-opacity="0.25"/>
        <stop offset="60%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.55"/>
      </radialGradient>
    </defs>

    <rect width="240" height="104" fill="url(#cam_wall)"/>
    <rect x="0" y="104" width="240" height="56" fill="url(#cam_floor)"/>
    <rect width="240" height="160" fill="url(#cam_light)"/>

    <line x1="0" y1="104" x2="240" y2="104" stroke="#081008" stroke-width="1" opacity="0.9"/>
    <line x1="120" y1="104" x2="120" y2="160" stroke="#071307" stroke-width="1" opacity="0.25"/>
    <line x1="60" y1="104" x2="72" y2="160" stroke="#071307" stroke-width="1" opacity="0.15"/>
    <line x1="180" y1="104" x2="168" y2="160" stroke="#071307" stroke-width="1" opacity="0.15"/>
    <line x1="24" y1="118" x2="216" y2="118" stroke="#050d05" stroke-width="1" opacity="0.10"/>
    <line x1="30" y1="134" x2="210" y2="134" stroke="#050d05" stroke-width="1" opacity="0.08"/>
    <line x1="38" y1="148" x2="202" y2="148" stroke="#050d05" stroke-width="1" opacity="0.06"/>

    ${scene}

    <text x="120" y="14" font-size="8" fill="#0b220b" text-anchor="middle" font-family="monospace" opacity="0.8">${title}</text>
    <text x="4" y="156" font-size="7" fill="#004400" font-family="monospace" id="cam-timestamp">00:00:00</text>
    <text x="236" y="156" font-size="7" fill="#005500" font-family="monospace" text-anchor="end">● REC</text>
  `;
}

function setLightVisual(side,on){
  const btn=document.getElementById(`btn-light-${side}`);
  const ov=document.getElementById(`light-overlay-${side}`);
  if(btn) btn.classList.toggle('on',!!on);
  if(ov) ov.classList.toggle('on',!!on);
}

function updateEpsilonVisual(){
  const elL=document.getElementById('epsilon-left');
  const elR=document.getElementById('epsilon-right');
  if(elL) elL.style.display=(state.epsilonAtDoor==='left' && state.lightLeft)?'block':'none';
  if(elR) elR.style.display=(state.epsilonAtDoor==='right' && state.lightRight)?'block':'none';

  checkEpsteinOnCurrentCam();
}

function showEpsteinOnCam(){
  const el=document.getElementById('epstein-on-cam');
  if(el) el.style.display='flex';
}
function hideEpsteinOnCam(){
  const el=document.getElementById('epstein-on-cam');
  if(el) el.style.display='none';
}

function checkEpsteinOnCurrentCam(){
  if(!isCamPanelOpen()){
    hideEpsteinOnCam();
    return;
  }
  const epCam = state.epsilonAtDoor==='left' ? '6A' : (state.epsilonAtDoor==='right' ? '7A' : null);
  const onCam = (epCam && state.currentCam===epCam);
  if(onCam) showEpsteinOnCam(); else hideEpsteinOnCam();
}

function toggleLight(side){
  if(!state.running||state.gameOver||state.power<=0) return;
  AUDIO.sfxLight();
  if(side==='left') state.lightLeft=!state.lightLeft;
  else state.lightRight=!state.lightRight;
  setLightVisual(side,side==='left'?state.lightLeft:state.lightRight);

  if(state.epsilonAtDoor===side && (side==='left'?state.lightLeft:state.lightRight) && state.epsilonFleeSeconds<=0){
    showAlert('⚠ YOU FLASHED EPSTEIN — HE RAN ⚠');
    state.epsilonFleeSeconds=1;
    updateEpsilonVisual();
  } else {
    updateEpsilonVisual();
  }
}

function handleEpsilon(){
  if(state.gameOver || !state.running) return;

  if(state.epsilonFleeSeconds>0){
    state.epsilonFleeSeconds--;
    updateEpsilonVisual();
    if(state.epsilonFleeSeconds===0){
      state.epsilonAtDoor=null;
      state.epsilonDoorSeconds=0;
      state.epsilonCooldownSeconds=randInt(6,12);
      updateEpsilonVisual();
    }
    return;
  }

  if(state.epsilonCooldownSeconds>0){
    state.epsilonCooldownSeconds--;
  }

  if(!state.epsilonAtDoor){
    if(state.epsilonCooldownSeconds<=0 && chance(0.06 + (state.night-1)*0.01)){
      state.epsilonAtDoor=(Math.random()<0.5)?'left':'right';
      state.epsilonDoorSeconds=0;
      state.epsilonScareLimitSeconds=randInt(5,9);
      state.epsilonFleeSeconds=0;
      showAlert(state.epsilonAtDoor==='left'?'⚠ EPSTEIN AT THE LEFT DOOR ⚠':'⚠ EPSTEIN AT THE RIGHT DOOR ⚠');
      updateEpsilonVisual();
    }
    return;
  }

  state.epsilonDoorSeconds++;
  updateEpsilonVisual();

  if(state.epsilonDoorSeconds>=state.epsilonScareLimitSeconds){
    triggerJumpscare();
  }
}

const CAM_SCENES = {
  '1A': () => camSvgTemplate('HALLWAY A', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.75"/>

    <g opacity="0.95">
      <rect x="16" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="46" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="76" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="106" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="136" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="166" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="196" y="28" width="28" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="16" y1="44" x2="224" y2="44" stroke="#071307" stroke-width="1" opacity="0.45"/>
      <line x1="16" y1="60" x2="224" y2="60" stroke="#071307" stroke-width="1" opacity="0.35"/>
      <line x1="16" y1="76" x2="224" y2="76" stroke="#071307" stroke-width="1" opacity="0.25"/>
    </g>

    <rect x="18" y="102" width="204" height="4" fill="#001800" opacity="0.25"/>
    <rect x="26" y="106" width="188" height="3" fill="#001800" opacity="0.18"/>
    <rect x="38" y="110" width="164" height="2" fill="#001800" opacity="0.12"/>

    <g opacity="0.8">
      <rect x="18" y="120" width="56" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="78" y="122" width="36" height="18" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="120" y="124" width="44" height="16" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="168" y="122" width="50" height="20" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <circle cx="54" cy="142" r="6" fill="#001200" opacity="0.15"/>
    </g>
  `),
  '1B': () => camSvgTemplate('HALLWAY B', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.7"/>

    <rect x="16" y="28" width="118" height="34" fill="#001800" opacity="0.22" stroke="#0a1a0a" stroke-width="1"/>
    <text x="75" y="46" font-size="7" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.85">NOTICE BOARD</text>

    <g opacity="0.9">
      <rect x="150" y="28" width="74" height="68" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="156" y="34" width="62" height="20" fill="#021b02" opacity="0.18"/>
      <rect x="156" y="58" width="62" height="32" fill="#030303" opacity="0.65"/>
      <circle cx="170" cy="80" r="4" fill="#001200" opacity="0.18"/>
      <circle cx="186" cy="80" r="4" fill="#001200" opacity="0.18"/>
      <circle cx="202" cy="80" r="4" fill="#001200" opacity="0.18"/>
      <path d="M156 90 Q187 70 218 90" stroke="#0a1a0a" stroke-width="2" fill="none" opacity="0.75"/>
      <path d="M156 46 Q187 28 218 46" stroke="#0a1a0a" stroke-width="1.5" fill="none" opacity="0.55"/>
    </g>

    <g opacity="0.8">
      <rect x="20" y="112" width="70" height="30" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="98" y="116" width="44" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="148" y="114" width="78" height="26" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="20" y1="128" x2="90" y2="128" stroke="#071307" stroke-width="1" opacity="0.25"/>
    </g>
  `),
  '2A': () => camSvgTemplate('CLASSROOM 2A', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.7"/>
    <rect x="16" y="26" width="124" height="30" fill="#001800" opacity="0.40" stroke="#0a1a0a" stroke-width="1"/>
    <text x="78" y="45" font-size="8" fill="#006600" font-family="monospace" text-anchor="middle" opacity="0.85">WHITEBOARD</text>
    <rect x="148" y="26" width="76" height="30" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
    <text x="186" y="44" font-size="6" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.75">POSTERS</text>

    <g opacity="0.9">
      <rect x="18" y="62" width="46" height="34" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="70" y="62" width="46" height="34" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="122" y="62" width="46" height="34" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="174" y="62" width="46" height="34" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="18" y1="79" x2="220" y2="79" stroke="#071307" stroke-width="1" opacity="0.18"/>
    </g>

    <g opacity="0.85">
      <rect x="26" y="112" width="52" height="24" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="84" y="114" width="52" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="142" y="116" width="52" height="20" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="38" y="138" width="10" height="10" fill="#020404" opacity="0.7"/>
      <rect x="96" y="140" width="10" height="8" fill="#020404" opacity="0.7"/>
      <rect x="154" y="142" width="10" height="6" fill="#020404" opacity="0.7"/>
    </g>
  `),
  '3A': () => camSvgTemplate('CAFETERIA', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.65"/>

    <rect x="14" y="26" width="150" height="18" fill="#001800" opacity="0.18" stroke="#0a1a0a" stroke-width="1"/>
    <text x="88" y="39" font-size="7" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.75">CAFETERIA</text>

    <g opacity="0.9">
      <rect x="170" y="26" width="56" height="70" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <text x="198" y="40" font-size="6" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.75">SERVE</text>
      <rect x="176" y="44" width="44" height="10" fill="#021b02" opacity="0.18"/>
      <rect x="176" y="58" width="44" height="10" fill="#021b02" opacity="0.14"/>
      <rect x="176" y="72" width="44" height="18" fill="#030303" opacity="0.65"/>
    </g>

    <g opacity="0.88">
      <rect x="20" y="54" width="56" height="16" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="84" y="54" width="56" height="16" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="20" y="74" width="56" height="16" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="84" y="74" width="56" height="16" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="48" y1="54" x2="48" y2="90" stroke="#071307" stroke-width="1" opacity="0.18"/>
      <line x1="112" y1="54" x2="112" y2="90" stroke="#071307" stroke-width="1" opacity="0.18"/>
    </g>

    <g opacity="0.85">
      <rect x="24" y="112" width="70" height="26" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="102" y="114" width="70" height="24" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="180" y="116" width="44" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <circle cx="54" cy="138" r="5" fill="#001200" opacity="0.12"/>
      <circle cx="132" cy="138" r="5" fill="#001200" opacity="0.12"/>
    </g>
  `),
  '4A': () => camSvgTemplate('LIBRARY', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.65"/>

    <g opacity="0.92">
      <rect x="14" y="24" width="56" height="76" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="72" y="24" width="56" height="76" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="130" y="24" width="56" height="76" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="188" y="24" width="38" height="76" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>

      <line x1="14" y1="36" x2="226" y2="36" stroke="#071307" stroke-width="1" opacity="0.55"/>
      <line x1="14" y1="50" x2="226" y2="50" stroke="#071307" stroke-width="1" opacity="0.45"/>
      <line x1="14" y1="64" x2="226" y2="64" stroke="#071307" stroke-width="1" opacity="0.35"/>
      <line x1="14" y1="78" x2="226" y2="78" stroke="#071307" stroke-width="1" opacity="0.25"/>
      <line x1="14" y1="92" x2="226" y2="92" stroke="#071307" stroke-width="1" opacity="0.18"/>
    </g>

    <text x="40" y="16" font-size="7" fill="#063006" font-family="monospace" opacity="0.65">SILENCE</text>

    <g opacity="0.85">
      <rect x="22" y="112" width="76" height="28" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="108" y="114" width="58" height="24" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="172" y="116" width="54" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="22" y1="126" x2="98" y2="126" stroke="#071307" stroke-width="1" opacity="0.18"/>
    </g>
  `),
  '5A': () => camSvgTemplate('MAIN ENTRANCE', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.65"/>

    <g opacity="0.92">
      <rect x="80" y="22" width="80" height="78" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="120" y1="22" x2="120" y2="100" stroke="#0a1a0a" stroke-width="1" opacity="0.9"/>
      <circle cx="112" cy="62" r="2" fill="#001200"/>
      <circle cx="128" cy="62" r="2" fill="#001200"/>
      <rect x="84" y="26" width="32" height="18" fill="#021b02" opacity="0.16"/>
      <rect x="124" y="26" width="32" height="18" fill="#021b02" opacity="0.16"/>
      <rect x="84" y="48" width="72" height="48" fill="#030303" opacity="0.6"/>
    </g>

    <rect x="14" y="26" width="58" height="20" fill="#001800" opacity="0.22" stroke="#0a1a0a" stroke-width="1"/>
    <text x="43" y="40" font-size="6" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.8">OFFICE</text>

    <rect x="168" y="26" width="58" height="20" fill="#001800" opacity="0.15" stroke="#0a1a0a" stroke-width="1"/>
    <text x="197" y="40" font-size="6" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.7">TROPHY</text>

    <g opacity="0.82">
      <rect x="18" y="112" width="70" height="28" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="92" y="114" width="56" height="24" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="152" y="112" width="74" height="28" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="18" y1="126" x2="88" y2="126" stroke="#071307" stroke-width="1" opacity="0.16"/>
    </g>
  `),
  '6A': () => camSvgTemplate('GYM', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.6"/>
    <rect x="16" y="26" width="208" height="72" fill="#020404" stroke="#0a1a0a" stroke-width="1" opacity="0.75"/>

    <g opacity="0.85">
      <line x1="22" y1="36" x2="218" y2="36" stroke="#071307" stroke-width="1" opacity="0.32"/>
      <line x1="22" y1="50" x2="218" y2="50" stroke="#071307" stroke-width="1" opacity="0.22"/>
      <line x1="22" y1="64" x2="218" y2="64" stroke="#071307" stroke-width="1" opacity="0.18"/>
      <line x1="22" y1="78" x2="218" y2="78" stroke="#071307" stroke-width="1" opacity="0.14"/>
      <line x1="120" y1="26" x2="120" y2="98" stroke="#071307" stroke-width="1" opacity="0.16"/>
    </g>

    <g opacity="0.9">
      <circle cx="72" cy="62" r="14" fill="none" stroke="#0a1a0a" stroke-width="2" opacity="0.75"/>
      <circle cx="168" cy="62" r="14" fill="none" stroke="#0a1a0a" stroke-width="2" opacity="0.75"/>
      <rect x="112" y="30" width="16" height="64" fill="#001800" opacity="0.14"/>
      <rect x="30" y="30" width="18" height="12" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="192" y="30" width="18" height="12" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <path d="M30 36 Q39 30 48 36" stroke="#0a1a0a" stroke-width="2" fill="none" opacity="0.75"/>
      <path d="M192 36 Q201 30 210 36" stroke="#0a1a0a" stroke-width="2" fill="none" opacity="0.75"/>
    </g>

    <g opacity="0.85">
      <rect x="22" y="112" width="92" height="30" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="122" y="114" width="46" height="24" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="174" y="112" width="52" height="28" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="22" y1="126" x2="114" y2="126" stroke="#071307" stroke-width="1" opacity="0.14"/>
    </g>
  `),
  '6B': () => camSvgTemplate('SCIENCE LAB', `
    <rect x="10" y="20" width="220" height="82" fill="#030707" stroke="#081408" stroke-width="1" opacity="0.6"/>

    <rect x="16" y="28" width="208" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
    <text x="120" y="43" font-size="7" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.8">LAB BENCH</text>

    <g opacity="0.9">
      <rect x="18" y="56" width="52" height="44" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="74" y="56" width="52" height="44" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="130" y="56" width="52" height="44" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="186" y="56" width="38" height="44" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>

      <circle cx="34" cy="70" r="4" fill="#001200" opacity="0.16"/>
      <circle cx="50" cy="72" r="3" fill="#001200" opacity="0.12"/>
      <path d="M40 92 Q44 84 48 92" stroke="#0a1a0a" stroke-width="1" fill="none" opacity="0.6"/>

      <rect x="86" y="66" width="12" height="16" fill="#001800" opacity="0.18"/>
      <rect x="102" y="64" width="14" height="18" fill="#001800" opacity="0.12"/>
      <circle cx="156" cy="72" r="5" fill="#001200" opacity="0.12"/>
      <circle cx="204" cy="70" r="4" fill="#001200" opacity="0.12"/>
    </g>

    <g opacity="0.82">
      <rect x="24" y="112" width="76" height="28" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="106" y="114" width="56" height="24" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="168" y="116" width="58" height="22" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="24" y1="126" x2="100" y2="126" stroke="#071307" stroke-width="1" opacity="0.14"/>
    </g>
  `),
  '7A': () => camSvgTemplate('ROOFTOP ACCESS', `
    <rect x="10" y="20" width="220" height="82" fill="#020404" stroke="#081408" stroke-width="1" opacity="0.65"/>

    <rect x="10" y="20" width="220" height="46" fill="#030606" opacity="0.9"/>
    <path d="M10 66 L52 48 L92 64 L136 44 L176 64 L206 50 L230 60 L230 102 L10 102 Z" fill="#020404" opacity="0.92"/>
    <line x1="10" y1="66" x2="230" y2="66" stroke="#0a1a0a" stroke-width="1" opacity="0.6"/>
    <line x1="10" y1="84" x2="230" y2="84" stroke="#071307" stroke-width="1" opacity="0.12"/>

    <rect x="92" y="72" width="56" height="28" fill="#020404" stroke="#0a1a0a" stroke-width="1" opacity="0.95"/>
    <text x="120" y="90" font-size="7" fill="#063006" font-family="monospace" text-anchor="middle" opacity="0.75">ACCESS DOOR</text>
    <circle cx="102" cy="86" r="2" fill="#001200"/>

    <g opacity="0.65">
      <rect x="16" y="112" width="96" height="30" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <rect x="118" y="114" width="108" height="26" fill="#020404" stroke="#0a1a0a" stroke-width="1"/>
      <line x1="16" y1="126" x2="112" y2="126" stroke="#071307" stroke-width="1" opacity="0.12"/>
    </g>

    <circle cx="210" cy="32" r="10" fill="#001200" opacity="0.08"/>
  `),
};

function updateCamScene(){
  const svg=document.getElementById('cam-svg');
  if(!svg) return;
  const maker=CAM_SCENES[state.currentCam] || CAM_SCENES['1A'];
  svg.innerHTML=maker();
}


let state = {
  night:1, running:false, power:100, timeElapsed:0,
  doorLeft:false, doorRight:false, currentCam:'1A',
  morganLoc:'5A', morganMoveCooldown:0, morganAtDoor:null,
  morganAggression:0.55, jumpscarePending:false, gameOver:false, won:false,
  morganCamLoc:null,
  morganCamObservedSeconds:0,
  morganCamObserveTargetSeconds:0,
  morganCamPresenceSeconds:0,
  morganCamScareLimitSeconds:0,
  morganCamReappearSeconds:0,
  morganCamNextLoc:null,

  lightLeft:false,
  lightRight:false,
  epsilonAtDoor:null,
  epsilonDoorSeconds:0,
  epsilonScareLimitSeconds:0,
  epsilonCooldownSeconds:0,
  epsilonFleeSeconds:0,
};

let gameInterval=null, camTsInterval=null, alertTimeout=null;

function randInt(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

const AUDIO={
  ctx:null,
  master:null,
  ambience:null,
  unlocked:false,
  ensure(){
    if(this.ctx) return true;
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;
      if(!Ctx) return false;
      this.ctx=new Ctx();
      this.master=this.ctx.createGain();
      this.master.gain.value=0.55;
      this.master.connect(this.ctx.destination);
      return true;
    }catch(e){
      return false;
    }
  },
  unlock(){
    if(!this.ensure()) return;
    if(this.ctx.state==='suspended') this.ctx.resume();
    this.unlocked=true;
  },
  startAmbience(){
    if(!this.unlocked) return;
    if(this.ambience) return;
    const ctx=this.ctx;
    const out=ctx.createGain();
    out.gain.value=0.16;
    out.connect(this.master);

    const humOsc=ctx.createOscillator();
    humOsc.type='sawtooth';
    humOsc.frequency.value=52;
    const humGain=ctx.createGain();
    humGain.gain.value=0.12;
    const humFilter=ctx.createBiquadFilter();
    humFilter.type='lowpass';
    humFilter.frequency.value=180;
    humFilter.Q.value=0.7;
    humOsc.connect(humGain);
    humGain.connect(humFilter);
    humFilter.connect(out);

    const lfo=ctx.createOscillator();
    lfo.type='sine';
    lfo.frequency.value=0.09;
    const lfoGain=ctx.createGain();
    lfoGain.gain.value=7;
    lfo.connect(lfoGain);
    lfoGain.connect(humOsc.frequency);

    const noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);
    const data=noiseBuf.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1);
    const noiseSrc=ctx.createBufferSource();
    noiseSrc.buffer=noiseBuf;
    noiseSrc.loop=true;
    const noiseFilter=ctx.createBiquadFilter();
    noiseFilter.type='bandpass';
    noiseFilter.frequency.value=420;
    noiseFilter.Q.value=0.7;
    const noiseGain=ctx.createGain();
    noiseGain.gain.value=0.06;
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(out);

    const t=ctx.currentTime;
    humGain.gain.setValueAtTime(0.0,t);
    humGain.gain.linearRampToValueAtTime(0.12,t+0.6);
    noiseGain.gain.setValueAtTime(0.0,t);
    noiseGain.gain.linearRampToValueAtTime(0.06,t+1.0);

    humOsc.start();
    lfo.start();
    noiseSrc.start();

    this.ambience={out,humOsc,humGain,humFilter,lfo,lfoGain,noiseSrc,noiseFilter,noiseGain};
  },
  stopAmbience(){
    if(!this.ambience) return;
    const ctx=this.ctx;
    const a=this.ambience;
    const t=ctx.currentTime;
    try{
      a.out.gain.cancelScheduledValues(t);
      a.out.gain.setValueAtTime(a.out.gain.value,t);
      a.out.gain.linearRampToValueAtTime(0,t+0.25);
      a.humGain.gain.cancelScheduledValues(t);
      a.noiseGain.gain.cancelScheduledValues(t);
      setTimeout(()=>{
        try{a.humOsc.stop();}catch(e){}
        try{a.lfo.stop();}catch(e){}
        try{a.noiseSrc.stop();}catch(e){}
        try{a.out.disconnect();}catch(e){}
      },320);
    }catch(e){}
    this.ambience=null;
  },
  blip(freq,dur,vol,type){
    if(!this.unlocked) return;
    const ctx=this.ctx;
    const o=ctx.createOscillator();
    o.type=type||'square';
    o.frequency.value=freq;
    const g=ctx.createGain();
    g.gain.value=0;
    o.connect(g);
    g.connect(this.master);
    const t=ctx.currentTime;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol||0.12,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+(dur||0.08));
    o.start(t);
    o.stop(t+(dur||0.08)+0.02);
  },
  noiseBurst(dur,vol,filterFreq){
    if(!this.unlocked) return;
    const ctx=this.ctx;
    const len=Math.max(1,Math.floor(ctx.sampleRate*(dur||0.2)));
    const b=ctx.createBuffer(1,len,ctx.sampleRate);
    const d=b.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-(i/len));
    const s=ctx.createBufferSource();
    s.buffer=b;
    const f=ctx.createBiquadFilter();
    f.type='highpass';
    f.frequency.value=filterFreq||800;
    const g=ctx.createGain();
    g.gain.value=(vol||0.18);
    s.connect(f);
    f.connect(g);
    g.connect(this.master);
    s.start();
  },
  sfxCamOpen(){
    this.unlock();
    this.blip(880,0.06,0.09,'square');
    this.blip(1320,0.05,0.05,'square');
    this.noiseBurst(0.08,0.05,1200);
  },
  sfxCamClose(){
    this.unlock();
    this.blip(520,0.07,0.09,'square');
    this.noiseBurst(0.06,0.04,900);
  },
  sfxDoor(){
    this.unlock();
    this.blip(140,0.12,0.13,'sawtooth');
    this.noiseBurst(0.10,0.06,450);
  },
  sfxLight(){
    this.unlock();
    this.blip(980,0.05,0.07,'triangle');
    this.blip(490,0.06,0.05,'triangle');
  },
  scream(){
    this.unlock();
    if(!this.unlocked) return;
    const ctx=this.ctx;
    const t=ctx.currentTime;
    const o=ctx.createOscillator();
    o.type='sawtooth';
    o.frequency.setValueAtTime(320,t);
    o.frequency.exponentialRampToValueAtTime(960,t+0.18);
    o.frequency.exponentialRampToValueAtTime(180,t+0.65);
    const f=ctx.createBiquadFilter();
    f.type='bandpass';
    f.frequency.setValueAtTime(1100,t);
    f.Q.value=0.9;
    const g=ctx.createGain();
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(0.75,t+0.03);
    g.gain.exponentialRampToValueAtTime(0.08,t+0.7);
    o.connect(f);
    f.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t+0.78);
    this.noiseBurst(0.55,0.25,600);
  }
};

function chance(p){
  return Math.random()<p;
}

function isCamPanelOpen(){
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return false;
  return overlay.style.display!=='none' && overlay.style.display!=='';
}

function pickRandomCam(exclude){
  const choices=CAMS.filter(c=>c!==exclude);
  return choices[Math.floor(Math.random()*choices.length)];
}

function initCamStareTimers(){
  state.morganCamObservedSeconds=0;
  state.morganCamObserveTargetSeconds=randInt(6,10);
  state.morganCamPresenceSeconds=0;
  state.morganCamScareLimitSeconds=randInt(30,50);
  state.morganCamReappearSeconds=0;
  state.morganCamNextLoc=null;
}

function chaseMorganOffCam(){
  state.morganCamLoc=pickRandomCam(state.currentCam);
  state.morganLoc=state.morganCamLoc;
  state.morganCamObservedSeconds=0;
  state.morganCamPresenceSeconds=0;
  state.morganCamReappearSeconds=0;
  state.morganCamNextLoc=null;
  state.morganCamObserveTargetSeconds=randInt(6,10);
  state.morganCamScareLimitSeconds=randInt(30,50);
  updateCamDanger();
  checkMorganOnCurrentCam();
}

function handleMorganCameraBehavior(){
  if(state.gameOver || !state.running) return;

  if(!state.morganCamLoc && CAMS.includes(state.morganLoc)){
    state.morganCamLoc=state.morganLoc;
    state.morganCamObservedSeconds=0;
    state.morganCamObserveTargetSeconds=randInt(6,10);
    state.morganCamPresenceSeconds=0;
    state.morganCamScareLimitSeconds=randInt(30,50);
  }

  if(!state.morganCamLoc) return;

  if(isCamPanelOpen()){
    const watching=(state.currentCam===state.morganCamLoc);
    if(watching){
      state.morganCamObservedSeconds++;
      if(state.morganCamObservedSeconds>=state.morganCamObserveTargetSeconds){
        showAlert('⚠ HE DOESN\'T LIKE TO BE WATCHED ⚠');
        chaseMorganOffCam();
        return;
      }
    } else {
      state.morganCamObservedSeconds=0;
    }

    return;
  }

  state.morganCamPresenceSeconds++;
  if(state.morganCamPresenceSeconds>=state.morganCamScareLimitSeconds){
    triggerJumpscare();
  }
  return;
}

function getMorganActiveCam(){
  if(state.morganAtDoor==='left') return '1A';
  if(state.morganAtDoor==='right') return '1B';
  if(state.morganCamLoc) return state.morganCamLoc;
  if(CAMS.includes(state.morganLoc)) return state.morganLoc;
  return null;
}

function openCamPanel(){
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return;
  overlay.style.display='flex';
  AUDIO.sfxCamOpen();
  checkMorganOnCurrentCam();
  checkEpsteinOnCurrentCam();
}

function closeCamPanel(){
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return;
  overlay.style.display='none';
  AUDIO.sfxCamClose();
  hideEpsteinOnCam();
}

function toggleCamPanel(){
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display==='none' || overlay.style.display==='') openCamPanel();
  else closeCamPanel();
}

document.addEventListener('keydown',(e)=>{
  if(e.key!=='Escape') return;
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display!=='none' && overlay.style.display!=='') closeCamPanel();
});

document.addEventListener('click',(e)=>{
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return;
  if(overlay.style.display==='none' || overlay.style.display==='') return;
  if(e.target===overlay) closeCamPanel();
});

function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateNightIndicator(){
  document.getElementById('night-indicator').textContent=`— Night ${state.night} —`;
}

function startGame(){
  AUDIO.unlock();
  AUDIO.startAmbience();
  resetState();
  showScreen('game-screen');
  document.getElementById('topbar-night').textContent=`NIGHT ${state.night}`;
  updatePowerDisplay();
  updateCamScene();
  initCamStareTimers();
  if(gameInterval) clearInterval(gameInterval);
  gameInterval=setInterval(tick,1000);
  if(camTsInterval) clearInterval(camTsInterval);
  let s=0;
  camTsInterval=setInterval(()=>{
    s++;
    const hh=String(Math.floor(s/3600)).padStart(2,'0');
    const mm=String(Math.floor((s%3600)/60)).padStart(2,'0');
    const ss=String(s%60).padStart(2,'0');
    const el=document.getElementById('cam-timestamp');
    if(el) el.textContent=`${hh}:${mm}:${ss}`;
  },1000);
}

function resetState(){
  state.running=true; state.power=100; state.timeElapsed=0;
  state.doorLeft=false; state.doorRight=false; state.currentCam='1A';
  state.morganLoc=pickRandomCam(null); state.morganMoveCooldown=0; state.morganAtDoor=null;
  state.morganAggression=0.55+(state.night-1)*0.1;
  state.jumpscarePending=false; state.gameOver=false; state.won=false;
  state.morganCamLoc=null;
  initCamStareTimers();

  state.lightLeft=false; state.lightRight=false;
  state.epsilonAtDoor='left';
  state.epsilonDoorSeconds=0;
  state.epsilonScareLimitSeconds=randInt(5,9);
  state.epsilonCooldownSeconds=randInt(4,10);
  state.epsilonFleeSeconds=0;

  setDoorVisual('left',false); setDoorVisual('right',false);
  setLightVisual('left',false); setLightVisual('right',false);
  updateEpsilonVisual();
  document.getElementById('morgan-left').className='morgan-office left';
  document.getElementById('morgan-right').className='morgan-office right';
  document.getElementById('fear-overlay').className='fear-overlay';
  document.getElementById('powerout-overlay').classList.remove('show');
  hideMorganOnCam(); clearAlert();
  hideEpsteinOnCam();
  CAMS.forEach(c=>{const b=document.getElementById(`cambtn-${c}`);if(b)b.className='cam-btn'+(c==='1A'?' active':'');});
  updateCamScene();
  updateCamDanger();
}

function tick(){
  if(!state.running) return;
  state.timeElapsed++;
  let drain=0.5;
  if(state.doorLeft) drain+=0.3;
  if(state.doorRight) drain+=0.3;
  if(state.lightLeft) drain+=0.22;
  if(state.lightRight) drain+=0.22;
  drain*=(1+(state.night-1)*0.07);
  state.power=Math.max(0,state.power-drain);
  updatePowerDisplay();
  updateClock();
  handleEpsilon();
  handleMorganCameraBehavior();
  runMorganAI();
  if(state.timeElapsed/NIGHT_DURATION>=1&&!state.gameOver){winNight();return;}
  if(state.power<=0&&!state.gameOver){powerOut();return;}
}

function updateClock(){
  const p=state.timeElapsed/NIGHT_DURATION;
  const hi=Math.min(5,Math.floor(p*6));
  const min=Math.floor((p*6-hi)*60);
  document.getElementById('clock-display').textContent=`${[12,1,2,3,4,5][hi]}:${String(min).padStart(2,'0')} AM`;
}

function updatePowerDisplay(){
  const pct=Math.max(0,Math.round(state.power));
  const bar=document.getElementById('power-bar');
  const pctEl=document.getElementById('power-pct');
  bar.style.width=pct+'%';
  pctEl.textContent=pct+'%';
  if(pct>50){bar.style.background='var(--green)';pctEl.style.color='var(--green)';}
  else if(pct>20){bar.style.background='var(--amber)';pctEl.style.color='var(--amber)';}
  else{bar.style.background='var(--red)';pctEl.style.color='var(--red)';}
}

function runMorganAI(){
  return;
}

function moveMorganCloser(){
  const goDoorChance=Math.min(0.75, 0.18 + state.morganAggression*0.22 + (state.night-1)*0.05);
  if(Math.random()<goDoorChance){
    const side=(Math.random()<0.5)?'left':'right';
    state.morganAtDoor=side;
    state.morganLoc=side+'_door';
    showMorganAtDoor(side);
  } else {
    const nextCam=pickRandomCam(CAMS.includes(state.morganLoc)?state.morganLoc:null);
    state.morganLoc=nextCam;
  }
  checkMorganOnCurrentCam();
}

function attemptEntry(){
  const side=state.morganAtDoor;
  const closed=side==='left'?state.doorLeft:state.doorRight;
  if(closed){
    state.morganAtDoor=null; state.morganLoc=pickRandomCam(null);
    hideMorganAtDoor(side);
    showAlert('⚠ DOOR HELD — HE WALKED AWAY ⚠');
  } else {
    triggerJumpscare();
  }
}

const kidPhrases=['close the door... close the door...','don\'t breathe...','please please please...','he\'s right there...','i want to go home...'];

function showMorganAtDoor(side){
  document.getElementById(`morgan-${side}`).className=`morgan-office ${side} peek`;
  document.getElementById('fear-overlay').className='fear-overlay high';
  showAlert(side==='left'?'⚠ HE\'S AT THE LEFT DOOR ⚠':'⚠ HE\'S AT THE RIGHT DOOR ⚠');
}

function hideMorganAtDoor(side){
  document.getElementById(`morgan-${side}`).className=`morgan-office ${side}`;
  document.getElementById('fear-overlay').className='fear-overlay';
}

function checkMorganOnCurrentCam(){
  const active=getMorganActiveCam();
  const onCam=(active && state.currentCam===active);
  if(onCam) showMorganOnCam(); else hideMorganOnCam();
}

function showMorganOnCam(){
  document.getElementById('morgan-on-cam').style.display='flex';
  document.getElementById('cam-static').className='cam-static on';
}
function hideMorganOnCam(){
  document.getElementById('morgan-on-cam').style.display='none';
  document.getElementById('cam-static').className='cam-static';
}

function updateCamDanger(){
  CAMS.forEach(c=>{
    const btn=document.getElementById(`cambtn-${c}`);if(!btn)return;
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

function toggleDoor(side){
  if(!state.running||state.gameOver||state.power<=0)return;
  AUDIO.sfxDoor();
  if(side==='left'){state.doorLeft=!state.doorLeft;setDoorVisual('left',state.doorLeft);}
  else{state.doorRight=!state.doorRight;setDoorVisual('right',state.doorRight);}
}

function setDoorVisual(side,closed){
  const btn=document.getElementById(`btn-${side}`);
  const ov=document.getElementById(`door-overlay-${side}`);
  if(closed){btn.classList.add('closed');btn.innerHTML=`${side.toUpperCase()}<br>SHUT`;ov.classList.add('closed');}
  else{btn.classList.remove('closed');btn.innerHTML=`${side.toUpperCase()}<br>DOOR`;ov.classList.remove('closed');}
}

function switchCam(cam){
  state.currentCam=cam;
  CAMS.forEach(c=>{const b=document.getElementById(`cambtn-${c}`);if(b)b.classList.toggle('active',c===cam);});
  document.getElementById('cam-static').className='cam-static on';
  setTimeout(()=>{if(document.getElementById('morgan-on-cam').style.display==='none')document.getElementById('cam-static').className='cam-static';},180);
  document.getElementById('cam-feed-label').textContent=`CAM ${cam} — ${CAM_LABELS[cam]||cam}`;
  updateCamScene();
  checkMorganOnCurrentCam();
  checkEpsteinOnCurrentCam();
}

function showAlert(msg){
  const bar=document.getElementById('alert-bar');
  bar.textContent=msg;bar.classList.add('show');
  if(alertTimeout)clearTimeout(alertTimeout);
  alertTimeout=setTimeout(()=>bar.classList.remove('show'),2800);
}
function clearAlert(){document.getElementById('alert-bar').classList.remove('show');}

function powerOut(){
  state.running=false;state.gameOver=true;
  clearInterval(gameInterval);
  document.getElementById('powerout-overlay').classList.add('show');
  setTimeout(()=>triggerJumpscare(),3500);
}

function triggerJumpscare(){
  if(state.jumpscarePending||state.won)return;
  AUDIO.scream();
  AUDIO.stopAmbience();
  state.jumpscarePending=true;state.running=false;state.gameOver=true;
  clearInterval(gameInterval);clearInterval(camTsInterval);
  document.body.style.background='#fff';
  setTimeout(()=>{document.body.style.background='#000';showScreen('jumpscare-screen');},80);
}

function showLose(){
  const p=state.timeElapsed/NIGHT_DURATION;
  const hi=Math.min(5,Math.floor(p*6));
  document.getElementById('lose-stat').textContent=`NIGHT ${state.night} · CAUGHT AROUND ${['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM'][hi]}`;
  showScreen('lose-screen');
}

function winNight(){
  state.running=false;state.won=true;state.gameOver=true;
  clearInterval(gameInterval);clearInterval(camTsInterval);
  document.getElementById('win-stat').textContent=`NIGHT ${state.night} COMPLETE · FLASHLIGHT: ${Math.round(state.power)}% LEFT`;
  setTimeout(()=>showScreen('win-screen'),600);
}

function nextNight(){state.night++;updateNightIndicator();startGame();}
function retryNight(){updateNightIndicator();startGame();}
function goTitle(){clearInterval(gameInterval);clearInterval(camTsInterval);updateNightIndicator();showScreen('title-screen');}

updateNightIndicator();
