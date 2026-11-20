import { useMemo,useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomSeed } from '../systems/OrbitalSystem.js';
export default function Starfield({quality}){
 const points=useRef();const data=useMemo(()=>{const rnd=randomSeed(72),count=quality==='low'?2000:6500,p=new Float32Array(count*3),c=new Float32Array(count*3),sizes=new Float32Array(count);for(let i=0;i<count;i++){const y=rnd()*2-1,a=rnd()*Math.PI*2,r=800;const radial=Math.sqrt(1-y*y);p.set([Math.cos(a)*radial*r,y*r,Math.sin(a)*radial*r],i*3);const b=.3+Math.pow(rnd(),3)*1.1;c.set([b*(.7+rnd()*.3),b*(.8+rnd()*.2),b],i*3);sizes[i]=.5+rnd()*1.6;}return {p,c,sizes};},[quality]);
 useFrame(({camera})=>{points.current.position.copy(camera.position);});
 return <group ref={points}><points frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[data.p,3]}/><bufferAttribute attach="attributes-color" args={[data.c,3]}/><bufferAttribute attach="attributes-size" args={[data.sizes,1]}/></bufferGeometry><shaderMaterial transparent depthWrite={false} vertexColors vertexShader="attribute float size;varying vec3 vColor;void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=size;}" fragmentShader="varying vec3 vColor;void main(){float r=length(gl_PointCoord-.5);float a=1.-smoothstep(.05,.5,r);gl_FragColor=vec4(vColor,a);}"/></points>
 {[[-350,210,-550],[480,-180,-500],[-400,-50,580]].map((pos,i)=><mesh key={i} position={pos} rotation={[0,i*.7,0]}><sphereGeometry args={[190,24,16]}/><meshBasicMaterial color={i===0?'#4a2431':'#142b4b'} transparent opacity={.045} side={THREE.BackSide} depthWrite={false}/></mesh>)}
 </group>;
}
