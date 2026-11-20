import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStellarStore } from '../store/useStellarStore.js';
import { stellarVertex,stellarFragment,coronaFragment,stellarLowFragment,coronaLowFragment } from '../shaders/stellar.js';
export default function StellarCore(){
 const star=useRef(),halo=useRef(),loops=useRef(),light=useRef();
 const quality=useStellarStore(s=>s.quality);
 const uniforms=useMemo(()=>({uTime:{value:0},uActivity:{value:1},uDetail:{value:quality==='low'?0:1}}),[quality]);
 const curves=useMemo(()=>Array.from({length:quality==='low'?8:16},(_,i)=>{const points=[];const a=i*2.39996;for(let j=0;j<=48;j++){const t=j/48*Math.PI;points.push(new THREE.Vector3(Math.cos(a)*(13.75+Math.sin(t)*(2.3+i%4)),Math.sin(a)*(13.75+Math.sin(t)*(2.3+i%4)),Math.cos(t)*(1.1+i%3*.6)));}return new THREE.CatmullRomCurve3(points);}),[quality]);
 useFrame(()=>{const s=useStellarStore.getState(),t=s.physics.time;uniforms.uTime.value=t;uniforms.uActivity.value=s.physics.activity;if(star.current)star.current.rotation.y=t*.006;if(loops.current){loops.current.rotation.y=t*.009;loops.current.scale.setScalar(1+(s.physics.activity-1)*.06);}if(light.current)light.current.intensity=1200+s.physics.activity*800;});
 return <group>
  <mesh ref={star}><sphereGeometry args={[14,quality==='low'?48:96,quality==='low'?32:64]}/><shaderMaterial vertexShader={stellarVertex} fragmentShader={quality==='low'?stellarLowFragment:stellarFragment} uniforms={uniforms}/></mesh>
  {(quality==='low'?[14.2,16.5]:[14.2,15,16.5]).map((r,i)=><mesh key={r} ref={i===0?halo:undefined}><sphereGeometry args={[r,48,32]}/><shaderMaterial vertexShader={stellarVertex} fragmentShader={quality==='low'?coronaLowFragment:coronaFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.FrontSide}/></mesh>)}
  <group ref={loops}>{curves.map((curve,i)=><group key={i} rotation={[i*.41,i*.71,0]}><mesh><tubeGeometry args={[curve,48,.055+(i%3)*.025,4,false]}/><meshBasicMaterial color={i%2?'#ff9b39':'#ff4c0e'} toneMapped={false}/></mesh><mesh><tubeGeometry args={[curve,48,.2,5,false]}/><meshBasicMaterial color="#ff4d04" transparent opacity={.15} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh></group>)}</group>
  <pointLight ref={light} color="#ffae65" intensity={2600} decay={1.3} distance={500}/>
 </group>;
}
