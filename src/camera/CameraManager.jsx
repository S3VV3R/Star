import { useEffect,useMemo,useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
// A throttled browser tab must not turn a 1.6 second transition into a minute.
gsap.ticker.lagSmoothing(0);
import { useStellarStore } from '../store/useStellarStore.js';
import { updateAudio,tone } from '../systems/AudioSystem.js';
export const input={keys:{},x:0,y:0,up:0,lookX:0,lookY:0,locked:false};
export function indoor(s){return s.mode!=='menu'&&s.mode!=='cinematic'&&(s.zone===0||s.zone===2);}
export function interaction(){const s=useStellarStore.getState();if(s.zone===0)s.initialize();else if(s.zone===1){s.set({mode:'engineer'});s.message('Adjust array alignment in the engineering panel.');}else if(s.zone===2)s.set({mode:'engineer'});else if(s.zone===3)s.storm();else s.ignite();tone(520);}
export default function CameraManager(){
 const {camera,gl}=useThree();const controls=useRef(),transition=useRef(false),velocity=useRef(new THREE.Vector3()),orientation=useRef(new THREE.Euler(0,0,0,'YXZ')),progress=useRef({value:0});
 const mode=useStellarStore(s=>s.mode),zone=useStellarStore(s=>s.zone),cameraMode=useStellarStore(s=>s.cameraMode),paused=useStellarStore(s=>s.paused);
 const inside=indoor({mode,zone});
 const path=useMemo(()=>new THREE.CatmullRomCurve3([[10,40,128],[52,17,55],[24,9,30],[-32,6,38],[-12,3,63],[-23,6,19],[25,30,-30],[30,75,140]].map(p=>new THREE.Vector3(...p))),[]);
 const view=useMemo(()=>new THREE.Vector3(),[]),dir=useMemo(()=>new THREE.Vector3(),[]),local=useMemo(()=>new THREE.Vector3(),[]);
 useEffect(()=>{
  const s=useStellarStore.getState();let position,target;
  if(mode==='menu'){position=[4,27,95];target=[-17,0,0];}
  else if(mode==='cinematic'){position=[10,40,128];target=[0,0,0];progress.current.value=0;}
  else if(zone===0){position=[0,3.2,10];target=[0,2,-16];}
  else if(zone===2){position=[0,3,10];target=[0,3,-4];}
  else if(zone===1){position=[27,11,45];target=[0,0,0];}
  else if(zone===3){position=[25,19,52];target=[0,0,0];}
  else {position=[6,45,110];target=[0,0,0];}
  transition.current=true;velocity.current.set(0,0,0);view.set(...target);
  const duration=s.reduceMotion?0:1.6;
  const tween=gsap.to(camera.position,{x:position[0],y:position[1],z:position[2],duration,ease:'power2.inOut',onUpdate:()=>camera.lookAt(view),onComplete:()=>{camera.lookAt(view);orientation.current.setFromQuaternion(camera.quaternion,'YXZ');transition.current=false;}});
  if(controls.current){controls.current.target.copy(view);controls.current.update();}
  return()=>tween.kill();
 },[mode,zone]);
 useEffect(()=>{if(cameraMode==='free'){orientation.current.setFromQuaternion(camera.quaternion,'YXZ');}else{document.exitPointerLock?.();const forward=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);if(controls.current)controls.current.target.copy(camera.position).addScaledVector(forward,inside?10:camera.position.length());}},[cameraMode]);
 useEffect(()=>{
  const keydown=e=>{if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;input.keys[e.code]=true;const s=useStellarStore.getState();if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Escape'){s.set({paused:!s.paused});document.exitPointerLock?.();}if(e.code==='KeyC')s.set({cameraMode:s.cameraMode==='free'?'orbit':'free'});if(e.code==='KeyE'&&s.mode!=='menu')interaction();if(e.code==='KeyF'&&s.selected){const p=new THREE.Vector3(...s.selected.position);if(controls.current)controls.current.target.copy(p);gsap.to(camera.position,{x:p.x+3,y:p.y+2,z:p.z+4,duration:1});}};
  const keyup=e=>input.keys[e.code]=false;const reset=()=>{input.keys={};input.x=input.y=input.up=0;};
  const mouse=e=>{const s=useStellarStore.getState();if(s.cameraMode!=='free'||s.paused||s.mode==='menu')return;if(document.pointerLockElement===gl.domElement||e.buttons===2){input.lookX+=e.movementX;input.lookY+=e.movementY;}};
  const lock=()=>{const s=useStellarStore.getState();if(s.mode!=='menu'&&s.mode!=='cinematic'&&s.cameraMode==='free'&&!s.paused&&navigator.maxTouchPoints===0)gl.domElement.requestPointerLock?.()?.catch?.(()=>s.message('Pointer lock unavailable. Hold the right mouse button to look around.'));};
  const wheel=e=>{const s=useStellarStore.getState();if(s.mode==='cinematic'){progress.current.value=THREE.MathUtils.clamp(progress.current.value+e.deltaY*.0002,0,1);}};
  const lockChange=()=>{input.locked=document.pointerLockElement===gl.domElement;};
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',reset);window.addEventListener('mousemove',mouse);gl.domElement.addEventListener('click',lock);gl.domElement.addEventListener('wheel',wheel);document.addEventListener('pointerlockchange',lockChange);
  return()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',reset);window.removeEventListener('mousemove',mouse);gl.domElement.removeEventListener('click',lock);gl.domElement.removeEventListener('wheel',wheel);document.removeEventListener('pointerlockchange',lockChange);};
 },[camera,gl]);
 useFrame((_,dt)=>{const s=useStellarStore.getState();dt=Math.min(dt,.05);if(transition.current){if(controls.current)controls.current.enabled=false;return;}
  if(controls.current)controls.current.enabled=!s.paused&&s.cameraMode==='orbit'&&s.mode!=='menu'&&s.mode!=='cinematic';
  if(s.paused)return;
  if(s.mode==='menu'){if(!s.reduceMotion){camera.position.x=4+Math.sin(s.physics.time*.025)*3;camera.lookAt(-17,0,0);}}
  else if(s.mode==='cinematic'){
    if(!s.cinematicPaused&&!s.reduceMotion)progress.current.value=(progress.current.value+dt*.012*s.cinematicSpeed)%1;
    const p=s.ignited?Math.min(1,s.ignitionTime/28):progress.current.value;
    if(s.ignited)camera.position.lerpVectors(new THREE.Vector3(12,12,42),new THREE.Vector3(15,75,155),gsap.parseEase('power2.inOut')(p));else camera.position.copy(path.getPointAt(p));camera.lookAt(0,0,0);
    if(Math.abs(s.cinematicProgress-p)>.005)s.set({cinematicProgress:p});
  }else if(s.cameraMode==='free'){
    orientation.current.y-=input.lookX*.002*s.sensitivity;orientation.current.x=THREE.MathUtils.clamp(orientation.current.x-input.lookY*.002*s.sensitivity,-1.52,1.52);input.lookX=input.lookY=0;camera.quaternion.setFromEuler(orientation.current);
    if(!indoor(s)){local.set((input.keys.KeyD?1:0)-(input.keys.KeyA?1:0)+input.x,(input.keys.Space?1:0)-(input.keys.ControlLeft?1:0)+input.up,(input.keys.KeyS?1:0)-(input.keys.KeyW?1:0)+input.y);if(local.lengthSq()>1)local.normalize();local.applyQuaternion(camera.quaternion);const distance=camera.position.length();let speed=THREE.MathUtils.clamp((distance-14)*.5,2,100)*(input.keys.ShiftLeft?3:1);velocity.current.lerp(local.multiplyScalar(speed),1-Math.exp(-dt*6));camera.position.addScaledVector(velocity.current,dt);if(camera.position.length()<16.6)camera.position.setLength(16.6);if(camera.position.length()>1200)camera.position.setLength(1200);}
  }
  camera.near=indoor(s)?.05:Math.max(.08,camera.position.length()*.0008);camera.far=indoor(s)?2200:4000;camera.updateProjectionMatrix();updateAudio(camera.position);
 });
 return <OrbitControls ref={controls} enabled={false} enableDamping dampingFactor={.055} minDistance={inside?2:19} maxDistance={inside?22:350} enablePan={!inside} maxPolarAngle={Math.PI*.94} minPolarAngle={Math.PI*.06}/>;
}
