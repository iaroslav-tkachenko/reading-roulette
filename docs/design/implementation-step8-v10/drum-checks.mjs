import assert from 'node:assert/strict';

export function fakeAnimationClock() {
  let now=0, sequence=0;
  const tasks=new Map(), calls=[];
  const env={now:()=>10000,schedule:(fn,delay)=>{const id=++sequence;tasks.set(id,{fn,at:now+delay});return id;},clear:id=>tasks.delete(id)};
  const tracks=Array.from({length:3},(_,index)=>({animate(frames,options){
    let resolve,reject;
    const finished=new Promise((yes,no)=>{resolve=yes;reject=no;});
    const animation={finished,startTime:null,cancelled:false,settled:false,cancel(){this.cancelled=true;env.clear(timer);reject(new Error('cancelled'));}};
    const timer=env.schedule(()=>{animation.settled=true;resolve();},options.delay+options.duration);
    calls.push({index,frames,options,animation,timer});
    return animation;
  }}));
  const flush=async()=>{for(let i=0;i<5;i++)await Promise.resolve();};
  const advance=async ms=>{
    const end=now+ms;
    while(true){
      const next=[...tasks].filter(([,task])=>task.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!next)break;
      now=next[1].at;tasks.delete(next[0]);next[1].fn();await flush();
    }
    now=end;await flush();
  };
  return {env,tracks,calls,tasks,advance,flush};
}

export async function checkDrums(api) {
  const {topics,formats,angles,initial,buildPrompt,prepareSvgDrums,svgDrumFrames,playSvgDrums,createDrumSpinController,createSpinPress,createSpinPressHandlers}=api;
  const combinations=topics.flatMap(topic=>formats.flatMap(format=>format.angleIds.map(id=>({topic,format,angle:angles.find(angle=>angle.id===id)}))));
  const initialSnapshot={settings:initial.initialSettings,combination:initial.initialCombination,prompt:initial.initialPrompt,revision:0,spinCount:0};
  let transitions=0;
  for(const from of combinations)for(const to of combinations){
    const drums=prepareSvgDrums(from,to,transitions+1);
    assert.equal(drums.length,3);
    for(const [index,drum] of drums.entries()){
      assert.equal(drum.rows.length,drum.n+3);
      assert.equal(drum.rows[1].label,from[drum.field].label);
      assert.equal(drum.rows[drum.n+1].label,to[drum.field].label);
      assert.equal(drum.rows[drum.n].role,'previous');assert.equal(drum.rows[drum.n+2].role,'next');
      const pool=drum.field==='topic'?topics.toReversed():drum.field==='format'?formats.toReversed():to.format.angleIds.map(id=>angles.find(item=>item.id===id));
      const position=pool.findIndex(item=>item.id===to[drum.field].id);
      assert.equal(drum.rows[drum.n].label,pool[(position-1+pool.length)%pool.length].label);
      assert.equal(drum.rows[drum.n+2].label,pool[(position+1)%pool.length].label);
      // The first three rows preserve the old result; all subsequent rows use the next format's real catalog.
      for(const row of drum.rows.slice(3))assert.ok(pool.some(item=>item.label===row.label));
      const frames=svgDrumFrames(drum);
      assert.equal(frames[0].transform,'translateY(0px)');
      assert.equal(frames.at(-1).transform,`translateY(${-drum.n*60}px)`);
      assert.equal(frames.at(-2).transform,`translateY(${-(drum.n*60+3)}px)`);
      assert.ok(frames.every((frame,i)=>i===0||frame.offset>frames[i-1].offset));
      assert.equal(drum.duration+100,[1480,1960,2440][index]);
    }
    transitions++;
  }
  const scenarios=['All 729 source/target transitions preserve real labels, compatible final neighbors, exact landing and phase offsets'];

  let draws=0, builds=0;
  const changes=[];
  const next=combinations.at(-1);
  const controller=createDrumSpinController(initialSnapshot,state=>changes.push(state),()=>{draws++;return next;},(settings,combination)=>{builds++;return buildPrompt(settings,combination);});
  controller.start();
  const run=controller.getState().run;
  assert.ok(run);assert.equal(draws,1);assert.equal(builds,1);
  assert.equal(controller.getState().snapshot,initialSnapshot);
  assert.equal(run.to.prompt,buildPrompt(initialSnapshot.settings,next));
  for(let i=0;i<20;i++)controller.start();
  controller.changeSettings({...initialSnapshot.settings,cefrLevel:'A1'});
  assert.equal(draws,1);assert.equal(builds,1);assert.equal(changes.length,1);
  scenarios.push('Preparation selects/builds once; synchronous lock rejects 20 rapid spins and settings changes; old full prompt remains');

  const clock=fakeAnimationClock();
  const playback=playSvgDrums(clock.tracks,run.drums,()=>controller.finish(run.id),clock.env);
  assert.deepEqual(clock.calls.map(call=>call.options.duration+call.options.delay),[1480,1960,2440]);
  assert.ok(clock.calls.every(call=>call.animation.startTime===10000 && call.options.fill==='both'));
  await clock.advance(1479);assert.ok(clock.calls.every(call=>!call.animation.settled));assert.equal(controller.getState().snapshot,initialSnapshot);
  await clock.advance(1);assert.deepEqual(clock.calls.map(call=>call.animation.settled),[true,false,false]);assert.equal(controller.getState().snapshot,initialSnapshot);
  await clock.advance(480);assert.deepEqual(clock.calls.map(call=>call.animation.settled),[true,true,false]);assert.equal(controller.getState().snapshot,initialSnapshot);
  await clock.advance(479);assert.ok(controller.isBusy());
  await clock.advance(1);assert.equal(controller.isBusy(),false);
  assert.equal(controller.getState().snapshot,run.to);assert.equal(changes.length,2);
  controller.finish(run.id);playback.finish();assert.equal(changes.length,2);
  playback.cancel();assert.equal(clock.tasks.size,0);assert.ok(clock.calls.every(call=>call.animation.cancelled));
  scenarios.push('Real playback options stop 1480/1960/2440 ms; old snapshot until last finish; atomic idempotent commit; cleanup cancels filled effects');

  controller.start();const repeated=controller.getState().run;
  assert.deepEqual(repeated.to.combination,next);assert.ok(repeated.to.revision>run.to.revision);
  controller.finish(run.id);assert.equal(controller.getState().run,repeated);
  controller.finishCurrent();controller.finishCurrent();assert.equal(controller.getState().snapshot,repeated.to);
  scenarios.push('Identical repeated results still spin with a new revision; stale finish cannot commit a newer run; interruptions finish once');

  controller.changeSettings({...initialSnapshot.settings,cefrLevel:'A1'});
  assert.equal(controller.getState().snapshot.settings.cefrLevel,'A1');
  assert.equal(controller.getState().snapshot.combination,next);
  assert.equal(controller.getState().snapshot.prompt,buildPrompt(controller.getState().snapshot.settings,next));
  controller.start(true);assert.equal(controller.isBusy(),false);assert.equal(controller.getState().snapshot.spinCount,3);
  scenarios.push('Settings work again after commit; reduced motion/hidden/no-WAAPI immediate mode has no busy run');

  for(const failure of ['selection','build']){
    const failed=createDrumSpinController(initialSnapshot,()=>{},()=>{if(failure==='selection')throw new Error();return next;},()=>{throw new Error();});
    failed.start();assert.equal(failed.getState().snapshot,initialSnapshot);assert.equal(failed.isBusy(),false);assert.ok(failed.getState().error);
  }
  controller.start();const unmounted=controller.getState().run;const count=changes.length;
  controller.dispose();controller.finish(unmounted.id);controller.start();assert.equal(changes.length,count);
  controller.resume();controller.finishCurrent();assert.equal(controller.isBusy(),false);
  scenarios.push('Preparation failure retains the old valid snapshot; unmount blocks callbacks; setup can resume');

  const never=fakeAnimationClock();let watchdogCommits=0;
  const missing=playSvgDrums(never.tracks,run.drums,()=>watchdogCommits++,never.env);
  for(const call of never.calls)never.env.clear(call.timer);
  await never.advance(3199);assert.equal(watchdogCommits,0);
  await never.advance(1);assert.equal(watchdogCommits,1);missing.finish();assert.equal(watchdogCommits,1);
  missing.cancel();await never.flush();assert.equal(never.tasks.size,0);
  scenarios.push('Missing finished promises commit through the 3200 ms watchdog exactly once');

  const cancelled=fakeAnimationClock();let cancelledCommits=0;
  const cleanup=playSvgDrums(cancelled.tracks,run.drums,()=>cancelledCommits++,cancelled.env);
  cleanup.cancel();await cancelled.advance(4000);assert.equal(cancelledCommits,0);assert.equal(cancelled.tasks.size,0);
  const rejected=fakeAnimationClock();let rejectedCommits=0;
  const rejectPlayback=playSvgDrums(rejected.tracks,run.drums,()=>rejectedCommits++,rejected.env);
  rejected.calls[0].animation.cancel();await rejected.flush();assert.equal(rejectedCommits,1);
  rejectPlayback.cancel();assert.equal(rejected.tasks.size,0);
  scenarios.push('Unmount cancellation does not commit; unexpected animation rejection falls back to one prepared commit');

  for(const mode of ['missing','throw','clock']){
    const fallback=fakeAnimationClock();let commits=0;
    if(mode==='missing')fallback.tracks[1]={};
    if(mode==='throw')fallback.tracks[2]={animate(){throw new Error();}};
    if(mode==='clock')fallback.env.now=()=>{throw new Error();};
    const broken=playSvgDrums(fallback.tracks,run.drums,()=>commits++,fallback.env);
    assert.equal(commits,1);broken.cancel();await fallback.flush();assert.equal(fallback.tasks.size,0);
  }
  scenarios.push('Absent WAAPI, partial launch failure and unavailable timeline complete safely and clean up partial effects');

  let busyActivations=0;
  const busyPress=createSpinPress(()=>{throw new Error('Busy must not animate another press');});
  const busyHandlers=createSpinPressHandlers(busyPress,()=>busyActivations++,true);
  busyHandlers.onPointerDown({button:0,isPrimary:true,pointerId:1});busyHandlers.onClick();
  let prevented=0;for(const key of ['Enter',' '])busyHandlers.onKeyDown({key,repeat:false,preventDefault:()=>prevented++});
  assert.equal(busyActivations,0);assert.equal(prevented,2);
  scenarios.push('Busy button rejects pointer, click, Enter and Space without adding a mechanical pulse');
  return {transitions,scenarios,run};
}
