export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const TOTAL_COLLECTORS = 3600;
export const CAPACITY_MWH = 800;
export const initialPhysics = () => ({time:0,power:0,delivered:0,storage:160,temperature:32,activity:1,stormRemaining:0,stormElapsed:0,status:'STANDBY',efficiency:0,thermalLoad:0,stableFor:0,stormSurvived:false,history:[],sampleTime:0});
export function stepEnergy(previous, controls, dt) {
  const s={...previous};
  dt=clamp(dt,0,0.25);
  if (dt===0) return s;
  s.time+=dt;
  const storm=s.stormRemaining>0;
  s.activity=storm?1+1.25*Math.sin(Math.PI*clamp(s.stormElapsed/35,0,1))**2:1+0.035*Math.sin(s.time*0.08);
  s.efficiency=Math.max(0,Math.cos(controls.alignment*Math.PI/180))*(controls.protection?0.42:1);
  const on=controls.initialized&&!controls.shutdown;
  const input=on?2200*(controls.active/100)*s.efficiency*s.activity:0;
  const output=input*0.91;
  const demand=controls.distribution*12;
  const surplus=Math.max(0,output-demand);
  const charge=surplus*(controls.allocation/100);
  const discharge=on?Math.min(Math.max(0,demand-output),s.storage*3600/dt):0;
  s.power=input;
  s.delivered=on?Math.min(output,demand)+discharge:0;
  // Power is MW, energy is MWh; dt is simulation seconds.
  s.storage=clamp(s.storage+(charge-discharge)*dt/3600,0,CAPACITY_MWH);
  const waste=input*0.08+(on?45:0);
  const cooling=controls.cooling*2.8;
  s.thermalLoad=waste-cooling-(s.temperature-25)*0.9;
  s.temperature=clamp(s.temperature+s.thermalLoad*dt/18,25,125);
  s.status=!controls.initialized?'STANDBY':controls.shutdown?'SHUTDOWN':s.temperature>105?'OVERLOADED':s.temperature>80?'WARNING':storm?'STORM':s.temperature>65?'COOLING':'NOMINAL';
  s.stableFor=on&&input>650&&s.temperature<70?s.stableFor+dt:0;
  if(storm){s.stormRemaining=Math.max(0,s.stormRemaining-dt);s.stormElapsed+=dt;if(s.stormRemaining===0&&s.temperature<95&&on)s.stormSurvived=true;}
  s.sampleTime+=dt;
  if(s.sampleTime>=0.4){s.sampleTime=0;s.history=[...s.history.slice(-79),{power:input,temp:s.temperature}];}
  return s;
}
export function canIgnite(s,c,completed) {return c.initialized&&!c.shutdown&&s.temperature<70&&s.power>650&&completed.includes(1)&&completed.includes(2)&&s.stormSurvived;}
