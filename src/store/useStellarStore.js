import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { initialPhysics, stepEnergy, canIgnite, clamp } from '../systems/EnergySystem.js';
const defaults={active:78,alignment:38,distribution:70,cooling:70,allocation:65,protection:false,initialized:false,shutdown:false};
export const zones=[{name:'Observation nexus',tag:'SYSTEM INITIALIZATION',short:'NEXUS',description:'Your window into a civilization-scale machine. Activate the main terminal to bring the station online.'},{name:'Solar harvest',tag:'COLLECTOR ALIGNMENT',short:'HARVEST',description:'Align the solar collectors. A smaller incidence angle captures more stellar energy.'},{name:'Reactor chamber',tag:'ENERGY STABILIZATION',short:'REACTOR',description:'Balance incoming power and thermal load. Keep the reactor below 70°C for five simulation seconds.'},{name:'Solar storm',tag:'EMERGENCY RESPONSE',short:'STORM',description:'Run a 35-second stellar event. Feather the arrays, increase cooling, and keep the system below 95°C.'},{name:'Ascension',tag:'STELLAR IGNITION',short:'ASCENSION',description:'Synchronize the swarm after alignment, stabilization and a successful storm response.'}];
export const useStellarStore=create((set,get)=>({
  mode:'menu',zone:0,cameraMode:'orbit',paused:false,settingsOpen:false,ready:false,contextLost:false,
  controls:{...defaults},physics:initialPhysics(),completed:[],selected:null,toast:'',
  quality:typeof navigator!=='undefined'&&(navigator.hardwareConcurrency<=4||navigator.maxTouchPoints>0)?'low':'medium',automaticQuality:true,resolution:1,sensitivity:1,volume:0.35,muted:true,reduceMotion:false,trajectories:false,speed:1,cinematicSpeed:1,cinematicProgress:0,cinematicPaused:false,ignited:false,ignitionTime:0,
  set:(patch)=>set(patch),
  control:(key,value)=>set(s=>({controls:{...s.controls,[key]:value}})),
  message:(toast)=>{set({toast});clearTimeout(get()._toastTimer);set({_toastTimer:setTimeout(()=>set({toast:''}),5000)});},
  enter:(mode='explorer')=>{set({mode,paused:false,cameraMode:mode==='explorer'?'orbit':'orbit',selected:null});},
  goZone:(zone)=>{set({zone,selected:null,cameraMode:'orbit',paused:false});},
  initialize:()=>{set(s=>({controls:{...s.controls,initialized:true,shutdown:false},completed:[...new Set([...s.completed,0])]}));get().message('Observation Nexus online. Proceed to Solar Harvest.');},
  emergency:()=>{set(s=>({controls:{...s.controls,shutdown:true}}));get().message('Emergency shutdown. Collectors isolated; cooling remains active.');},
  restart:()=>{if(get().physics.temperature>80){get().message('Allow the reactor to cool below 80°C before restarting.');return;}set(s=>({controls:{...s.controls,shutdown:false,initialized:true}}));},
  storm:()=>{if(!get().controls.initialized){get().message('Initialize the station before starting the storm test.');return;}if(get().physics.stormRemaining>0)return;set(s=>({physics:{...s.physics,stormRemaining:35,stormElapsed:0,stormSurvived:false}}));get().message('Stellar event detected. Engage protection and increase cooling.');},
  ignite:()=>{const s=get();if(!canIgnite(s.physics,s.controls,s.completed)){s.message('Complete alignment, reactor stabilization and the storm trial first.');return;}set({ignited:true,ignitionTime:0,mode:'cinematic',zone:4,cinematicProgress:0,cinematicPaused:false,completed:[0,1,2,3,4]});},
  reset:()=>set({mode:'menu',zone:0,cameraMode:'orbit',controls:{...defaults},physics:initialPhysics(),completed:[],ignited:false,ignitionTime:0,speed:1,paused:false,selected:null}),
  tick:(realDt)=>{const s=get();if(s.paused||s.contextLost)return;let remaining=Math.min(realDt,0.1)*s.speed;let p=s.physics;while(remaining>0){const dt=Math.min(remaining,0.1);p=stepEnergy(p,s.controls,dt);remaining-=dt;}
    const completed=[...s.completed];
    if(s.controls.initialized&&s.controls.alignment<15&&s.controls.active>60&&!completed.includes(1))completed.push(1);
    if(p.stableFor>=5&&!completed.includes(2))completed.push(2);
    if(p.stormSurvived&&!completed.includes(3))completed.push(3);
    const controls=p.temperature>=120?{...s.controls,shutdown:true}:s.controls;
    set({physics:p,controls,completed:completed.length===s.completed.length?s.completed:completed,ignitionTime:s.ignited&&!s.cinematicPaused?s.ignitionTime+realDt:s.ignitionTime});
  },
}));
export const useStellarUI=()=>useStellarStore(useShallow(s=>({mode:s.mode,zone:s.zone,controls:s.controls,muted:s.muted,paused:s.paused,ready:s.ready,toast:s.toast,settingsOpen:s.settingsOpen,contextLost:s.contextLost,set:s.set,enter:s.enter,goZone:s.goZone})));
