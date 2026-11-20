import { useRef,useMemo,useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { createOrbits,orbitPosition } from '../systems/OrbitalSystem.js';
import { useStellarStore } from '../store/useStellarStore.js';
import { uvVertex,plasmaFragment } from '../shaders/stellar.js';
const origin=new THREE.Vector3();
function Collectors({quality}){
 const panel=useRef(),hubs=useRef(),truss=useRef();const count=quality==='ultra'?3600:quality==='medium'?2400:1000;
 const orbits=useMemo(()=>createOrbits(count),[count]);const temp=useMemo(()=>new THREE.Object3D(),[]);const frame=useRef(0);
 useFrame(()=>{const s=useStellarStore.getState();const t=s.physics.time;frame.current++;if(quality==='low'&&frame.current%2===0)return;
  for(let i=0;i<count;i++){const pos=orbitPosition(orbits[i],t);temp.position.set(...pos);temp.lookAt(origin);temp.rotateY(s.controls.alignment*Math.PI/180+(s.controls.protection?1.05:0));const active=i/count<s.controls.active/100;const scale=active?1:.55;temp.scale.set(1.05*scale,.24*scale,.035);temp.updateMatrix();panel.current.setMatrixAt(i,temp.matrix);temp.scale.set(.12,.12,.15);temp.updateMatrix();hubs.current.setMatrixAt(i,temp.matrix);temp.scale.set(1.14,.018,.055);temp.updateMatrix();truss.current.setMatrixAt(i,temp.matrix);}
  panel.current.instanceMatrix.needsUpdate=true;hubs.current.instanceMatrix.needsUpdate=true;truss.current.instanceMatrix.needsUpdate=true;
  panel.current.material.emissiveIntensity=s.controls.initialized&&!s.controls.shutdown?.14:.01;
 });
 const select=e=>{e.stopPropagation();useStellarStore.setState({selected:{type:'collector',name:`Collector ${String(e.instanceId+1).padStart(4,'0')}`,position:orbitPosition(orbits[e.instanceId],useStellarStore.getState().physics.time),sector:orbits[e.instanceId].sector}});};
 return <group><instancedMesh ref={panel} args={[null,null,count]} onClick={select} frustumCulled={false}><boxGeometry/><meshStandardMaterial color="#9c6335" metalness={.85} roughness={.32} emissive="#e87921" side={THREE.DoubleSide}/></instancedMesh><instancedMesh ref={hubs} args={[null,null,count]} frustumCulled={false}><octahedronGeometry/><meshStandardMaterial color="#b0becb" metalness={.9} roughness={.27}/></instancedMesh><instancedMesh ref={truss} args={[null,null,count]} frustumCulled={false}><boxGeometry/><meshStandardMaterial color="#3f4d5d" metalness={.8} roughness={.4}/></instancedMesh></group>;
}
function Ring({radius,rotation,index}){
 const group=useRef(),segments=useRef();const s=useStellarStore(s=>s.controls.initialized&&!s.controls.shutdown);
 useLayoutEffect(()=>{const temp=new THREE.Object3D(),color=new THREE.Color();for(let i=0;i<72;i++){const a=i*Math.PI/36;temp.position.set(Math.cos(a)*radius,Math.sin(a)*radius,0);temp.rotation.z=a;temp.updateMatrix();segments.current.setMatrixAt(i,temp.matrix);segments.current.setColorAt(i,color.set(i%9===0?'#d1b083':'#3d4650'));}segments.current.instanceMatrix.needsUpdate=true;segments.current.instanceColor.needsUpdate=true;},[radius]);
 useFrame(()=>{if(group.current)group.current.rotation.z=useStellarStore.getState().physics.time*(index%2?-.002:.003);});
 return <group rotation={rotation}><group ref={group}>
 {[radius-.2,radius+.2].map(r=><mesh key={r}><torusGeometry args={[r,.07,5,200]}/><meshStandardMaterial color="#738395" metalness={.88} roughness={.32}/></mesh>)}
 <mesh><torusGeometry args={[radius,.02,4,200]}/><meshBasicMaterial color={s?'#6cd9e9':'#5d3d2b'} toneMapped={false}/></mesh>
 <instancedMesh ref={segments} args={[null,null,72]} frustumCulled={false}><boxGeometry args={[.65,.9,.25]}/><meshStandardMaterial metalness={.9} roughness={.38}/></instancedMesh>
 </group></group>;
}
function EnergyNode({position,index}){
 const group=useRef(),ring=useRef(),beam=useRef();const uniforms=useMemo(()=>({uTime:{value:0},uPower:{value:.04}}),[]);const curve=useMemo(()=>new THREE.CatmullRomCurve3([new THREE.Vector3(...position),new THREE.Vector3(position[0]*.7,position[1]+5,position[2]*.7),new THREE.Vector3(0,0,19)]),[position]);
 useFrame((_,dt)=>{const s=useStellarStore.getState();const power=s.physics.power/2200;uniforms.uTime.value=s.physics.time;uniforms.uPower.value=s.controls.shutdown?0:power*(s.ignited?Math.min(1,Math.max(0,s.ignitionTime-index)):.4);if(ring.current&&!s.paused)ring.current.rotation.z+=dt*.2;});
 return <><group ref={group} position={position} onClick={e=>{e.stopPropagation();useStellarStore.setState({selected:{type:'node',name:`Energy relay ${index+1}`,position}});}}><mesh><cylinderGeometry args={[.5,.7,2,8]}/><meshStandardMaterial color="#4d5d70" metalness={.85} roughness={.3}/></mesh><mesh ref={ring} rotation={[Math.PI/2,0,0]}><torusGeometry args={[1.15,.12,6,28]}/><meshStandardMaterial color="#7b8e9b" metalness={.9} roughness={.25}/></mesh><mesh><sphereGeometry args={[.32,12,12]}/><meshBasicMaterial color="#64e6ff" toneMapped={false}/></mesh></group><mesh ref={beam}><tubeGeometry args={[curve,40,.045,5,false]}/><shaderMaterial vertexShader={uvVertex} fragmentShader={plasmaFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending}/></mesh></>;
}
export default function DysonSwarm({quality}){
 const trajectories=useStellarStore(s=>s.trajectories);const paths=useMemo(()=>createOrbits(4).map(o=>Array.from({length:161},(_,i)=>orbitPosition(o,i/160*o.period))),[]);
 return <group><Collectors quality={quality}/><Ring radius={29} rotation={[1.1,.4,.3]} index={0}/><Ring radius={40} rotation={[.6,-.5,-.55]} index={1}/><Ring radius={52} rotation={[1.45,.25,.45]} index={2}/>{Array.from({length:6},(_,i)=><EnergyNode key={i} index={i} position={[Math.cos(i*Math.PI/3)*38,Math.sin(i*Math.PI/3)*13,Math.sin(i*Math.PI/3)*30]}/>)}{trajectories&&paths.map((p,i)=><Line key={i} points={p} color="#58b9d4" opacity={.4} transparent lineWidth={.7}/>)}</group>;
}
