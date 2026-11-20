import { useStellarStore } from '../store/useStellarStore.js';
let ctx,master,drone,oscillator,panner,warningTime=0;
export function activateAudio(){
  if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);panner=ctx.createPanner();panner.panningModel='HRTF';panner.distanceModel='inverse';panner.refDistance=8;panner.positionX.value=0;panner.positionY.value=2;panner.positionZ.value=-6;panner.connect(master);drone=ctx.createGain();drone.gain.value=.06;drone.connect(panner);
    [43.65,65.4,87.3,130.8].forEach((frequency,i)=>{const o=ctx.createOscillator();o.type=i===0?'sine':'triangle';o.frequency.value=frequency;const g=ctx.createGain();g.gain.value=1/(i+2);o.connect(g);g.connect(drone);o.start();if(i===0)oscillator=o;});}
  if(ctx.state==='suspended')ctx.resume();updateAudio();
}
export function tone(frequency=440,duration=.12){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=frequency;g.gain.setValueAtTime(.045,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);o.connect(g);g.connect(master);o.start();o.stop(ctx.currentTime+duration);}
export function updateAudio(position){if(!ctx)return;const s=useStellarStore.getState();master.gain.setTargetAtTime(s.muted?0:s.volume,ctx.currentTime,.15);oscillator.frequency.setTargetAtTime(43.65+s.physics.power/260,ctx.currentTime,.5);drone.gain.setTargetAtTime((s.zone===2?.11:.05)+(s.physics.activity-1)*.035,ctx.currentTime,.5);if(position){ctx.listener.positionX.value=position.x;ctx.listener.positionY.value=position.y;ctx.listener.positionZ.value=position.z;}if(s.physics.temperature>85&&ctx.currentTime-warningTime>2){tone(660,.4);warningTime=ctx.currentTime;}}
