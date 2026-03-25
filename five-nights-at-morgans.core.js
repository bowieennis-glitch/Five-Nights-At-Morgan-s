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
  try {
    if(!id) {
      console.warn('$id called with no id');
      return null;
    }
    return document.getElementById(id);
  } catch(error){
    console.error('Error in $id function:', error);
    return null;
  }
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
    <image href="Images/Cam 1.png" x="10" y="20" width="220" height="82" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="20" width="220" height="82" fill="#000" opacity="0.35"/>
  `),
  '1B': () => camSvgTemplate('HALLWAY B', `
    <image href="Images/Cam 2.png" x="10" y="20" width="220" height="82" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="20" width="220" height="82" fill="#000" opacity="0.35"/>
  `),
  '2A': () => camSvgTemplate('CLASSROOM 2A', `
    <image href="Images/Cam 3.png" x="10" y="20" width="220" height="82" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="20" width="220" height="82" fill="#000" opacity="0.35"/>
  `),
  '3A': () => camSvgTemplate('CAFETERIA', `
    <image href="Images/Cam 4.png" x="10" y="20" width="220" height="82" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="20" width="220" height="82" fill="#000" opacity="0.35"/>
  `),
  '4A': () => camSvgTemplate('LIBRARY', `
    <image href="Images/Cam 5.png" x="10" y="20" width="220" height="82" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="20" width="220" height="82" fill="#000" opacity="0.35"/>
  `),
  '5A': () => camSvgTemplate('MAIN ENTRANCE', `
    <image href="Images/Cam 6.png" x="10" y="20" width="220" height="82" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="20" width="220" height="82" fill="#000" opacity="0.35"/>
  `),
  '6A': () => camSvgTemplate('LEFT DOOR', `
    <image href="Images/Left door.png" x="10" y="18" width="220" height="90" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="18" width="220" height="90" fill="#000" opacity="0.35"/>
  `),
  '6B': () => camSvgTemplate('SCIENCE LAB', `
  `),
  '7A': () => camSvgTemplate('RIGHT DOOR', `
    <image href="Images/Right door.png" x="10" y="18" width="220" height="90" preserveAspectRatio="xMidYMid slice" opacity="0.5"/>
    <rect x="10" y="18" width="220" height="90" fill="#000" opacity="0.35"/>
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

  mode:'story',
  deaths:{morgan:0,shadow:0,hamlet:0,twigg:0,hodge:0,power:0},

  aiLevels:{morgan:10,shadow:10,hamlet:10,twigg:10,hodge:10},
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

  hodgeCamLoc:null,
  hodgePath:null,
  hodgePathIndex:0,
  hodgeMoveCooldownSeconds:0,
  hodgeAtDoor:null,
  hodgeDoorPresenceSeconds:0,
  hodgeDoorScareLimitSeconds:0,
};

function loadProgress(){
  try{
    const raw=localStorage.getItem('fnam_progress');
    if(!raw) return;
    const data=JSON.parse(raw);
    if(data && typeof data==='object'){
      if(typeof data.night==='number') state.night=Math.max(1,Math.round(data.night));
      if(data.deaths && typeof data.deaths==='object'){
        Object.keys(state.deaths).forEach(k=>{
          if(typeof data.deaths[k]==='number') state.deaths[k]=Math.max(0,Math.round(data.deaths[k]));
        });
      }
    }
  }catch(e){
  }
}

function saveProgress(){
  try{
    const data={night:state.night,deaths:state.deaths};
    localStorage.setItem('fnam_progress',JSON.stringify(data));
  }catch(e){
  }
}

loadProgress();

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
  if(!state.aiLevels) state.aiLevels={morgan:10,shadow:10,hamlet:10,twigg:10,hodge:10};
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

  bell(){
    if(!this.unlocked) return;
    if(!this.ensure()) return;
    const t=this.ctx.currentTime;
    const out=this.ctx.createGain();
    out.gain.value=0.0;
    out.connect(this.master);

    const hit=(freq,delay,peak,decay)=>{
      const o=this.ctx.createOscillator();
      const g=this.ctx.createGain();
      o.type='sine';
      o.frequency.setValueAtTime(freq,t+delay);
      g.gain.setValueAtTime(0.0,t+delay);
      g.gain.linearRampToValueAtTime(peak,t+delay+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001,t+delay+decay);
      o.connect(g);
      g.connect(out);
      o.start(t+delay);
      o.stop(t+delay+decay+0.05);
    };

    hit(880,0.00,0.35,0.55);
    hit(1320,0.00,0.18,0.40);
    hit(1760,0.01,0.10,0.30);

    out.gain.setValueAtTime(0.0,t);
    out.gain.linearRampToValueAtTime(1.0,t+0.01);
    out.gain.exponentialRampToValueAtTime(0.0001,t+0.75);
  },
  unlock(){
    if(!this.ensure()) return;
    if(this.ctx.state==='suspended') this.ctx.resume();
    this.unlocked=true;
  },
  startAmbience(){
    if(!this.unlocked) return;
    if(!this.ensure()) return;
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
