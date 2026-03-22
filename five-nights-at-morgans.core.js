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

const CLOCK_HOURS=[12,1,2,3,4,5];
const CLOCK_LABELS=['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM'];

function $id(id){
  return document.getElementById(id);
}

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
  '6A': () => camSvgTemplate('LEFT DOOR', `
    <rect x="10" y="18" width="220" height="90" fill="#030606" stroke="#081408" stroke-width="1" opacity="0.75"/>

    <rect x="14" y="22" width="124" height="78" fill="#020404" opacity="0.95"/>
    <rect x="138" y="22" width="88" height="78" fill="#010101" opacity="0.98"/>

    <g opacity="0.65">
      <rect x="18" y="24" width="116" height="74" fill="#050403" opacity="0.70"/>
      <rect x="18" y="24" width="116" height="18" fill="#0a0806" opacity="0.45"/>
      <rect x="18" y="44" width="116" height="2" fill="#120f0c" opacity="0.35"/>
      <rect x="18" y="60" width="116" height="2" fill="#120f0c" opacity="0.25"/>
      <rect x="18" y="76" width="116" height="2" fill="#120f0c" opacity="0.18"/>
    </g>

    <g opacity="0.85">
      <rect x="142" y="22" width="80" height="78" fill="#000" opacity="0.65"/>
      <rect x="142" y="22" width="80" height="78" fill="#001000" opacity="0.06"/>
      <path d="M144 30 L220 30" stroke="#001600" stroke-width="1" opacity="0.10"/>
      <path d="M144 44 L220 44" stroke="#001600" stroke-width="1" opacity="0.08"/>
      <path d="M144 58 L220 58" stroke="#001600" stroke-width="1" opacity="0.06"/>
      <path d="M144 72 L220 72" stroke="#001600" stroke-width="1" opacity="0.05"/>
    </g>

    <g opacity="0.95">
      <rect x="128" y="22" width="12" height="78" fill="#0b0a09"/>
      <rect x="126" y="22" width="2" height="78" fill="#1a1612" opacity="0.9"/>
      <rect x="140" y="22" width="2" height="78" fill="#1a1612" opacity="0.7"/>
    </g>

    <g opacity="0.55">
      <rect x="10" y="108" width="220" height="4" fill="#020404" opacity="0.9"/>
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
  '7A': () => camSvgTemplate('RIGHT DOOR', `
    <rect x="10" y="18" width="220" height="90" fill="#030606" stroke="#081408" stroke-width="1" opacity="0.75"/>

    <rect x="14" y="22" width="88" height="78" fill="#010101" opacity="0.98"/>
    <rect x="102" y="22" width="124" height="78" fill="#020404" opacity="0.95"/>

    <g opacity="0.85">
      <rect x="18" y="22" width="80" height="78" fill="#000" opacity="0.65"/>
      <rect x="18" y="22" width="80" height="78" fill="#001000" opacity="0.06"/>
      <path d="M20 30 L96 30" stroke="#001600" stroke-width="1" opacity="0.10"/>
      <path d="M20 44 L96 44" stroke="#001600" stroke-width="1" opacity="0.08"/>
      <path d="M20 58 L96 58" stroke="#001600" stroke-width="1" opacity="0.06"/>
      <path d="M20 72 L96 72" stroke="#001600" stroke-width="1" opacity="0.05"/>
    </g>

    <g opacity="0.65">
      <rect x="106" y="24" width="116" height="74" fill="#050403" opacity="0.70"/>
      <rect x="106" y="24" width="116" height="18" fill="#0a0806" opacity="0.45"/>
      <rect x="106" y="44" width="116" height="2" fill="#120f0c" opacity="0.35"/>
      <rect x="106" y="60" width="116" height="2" fill="#120f0c" opacity="0.25"/>
      <rect x="106" y="76" width="116" height="2" fill="#120f0c" opacity="0.18"/>
    </g>

    <g opacity="0.95">
      <rect x="100" y="22" width="12" height="78" fill="#0b0a09"/>
      <rect x="98" y="22" width="2" height="78" fill="#1a1612" opacity="0.7"/>
      <rect x="112" y="22" width="2" height="78" fill="#1a1612" opacity="0.9"/>
    </g>

    <g opacity="0.55">
      <rect x="10" y="108" width="220" height="4" fill="#020404" opacity="0.9"/>
    </g>
  `),
};

function updateCamScene(){
  const svg=document.getElementById('cam-svg');
  if(!svg) return;
  if(state.currentCam==='6B') state.currentCam='1A';
  const maker=CAM_SCENES[state.currentCam] || CAM_SCENES['1A'];
  svg.innerHTML=maker();
}

let state = {
  night:1, running:false, power:100, timeElapsed:0,
  doorLeft:false, doorRight:false, currentCam:'1A',
  morganLoc:'5A', morganMoveCooldown:0, morganAtDoor:null,
  morganAggression:0.55, jumpscarePending:false, gameOver:false, won:false,
  lastKiller:null,

  aiLevels:{morgan:10,shadow:10,hamlet:10,twigg:10},
  morganCamLoc:null,
  morganCamObservedSeconds:0,
  morganCamObserveTargetSeconds:0,
  morganCamPresenceSeconds:0,
  morganCamScareLimitSeconds:0,
  morganCamReappearSeconds:0,
  morganCamNextLoc:null,

  shadowCamLoc:null,
  shadowAtDoor:null,
  shadowDoorPresenceSeconds:0,
  shadowDoorScareLimitSeconds:0,
  shadowMoveToDoorSeconds:0,
  shadowPresenceSeconds:0,
  shadowCooldownSeconds:0,

  lightLeft:false,
  lightRight:false,
  camLightOn:false,

  hamletProgress:0,
  hamletCamSeconds:0,
  hamletCamSessionSeconds:0,

  twiggNextAt:0,
  twiggActive:false,
  twiggFailSeconds:0,
  twiggNeedle:0,
  twiggNeedleDir:1,
  twiggSafeCenter:0.5,
  twiggSafeWidth:0.22,
};

let gameInterval=null, camTsInterval=null, alertTimeout=null;

function randInt(min,max){
  return Math.floor(Math.random()*(max-min+1))+min;
}

function clampAI(v){
  const n=Number(v);
  if(!Number.isFinite(n)) return 10;
  return Math.max(1,Math.min(20,Math.round(n)));
}

function getAILevel(name){
  const key=String(name||'').toLowerCase();
  const levels=state.aiLevels||{};
  if(typeof levels[key]==='number') return clampAI(levels[key]);
  return 10;
}

function setAILevel(name,value){
  const key=String(name||'').toLowerCase();
  if(!state.aiLevels) state.aiLevels={morgan:10,shadow:10,hamlet:10,twigg:10};
  state.aiLevels[key]=clampAI(value);
  return state.aiLevels[key];
}

function setAILevels(levels){
  if(!levels || typeof levels!=='object') return;
  Object.keys(levels).forEach(k=>setAILevel(k,levels[k]));
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

function isCamPanelOpen(){
  const overlay=document.getElementById('cam-panel-overlay');
  if(!overlay) return false;
  return overlay.style.display!=='none' && overlay.style.display!=='';
}

function pickRandomMorganCam(exclude){
  const blocked=new Set(['6A','6B','7A']);
  const choices=CAMS.filter(c=>c!==exclude && !blocked.has(c));
  return choices[Math.floor(Math.random()*choices.length)];
}
