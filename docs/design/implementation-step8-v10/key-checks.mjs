import assert from 'node:assert/strict';
import { fakeAnimationClock } from './drum-checks.mjs';

export async function checkKeys(api, drums) {
  const {playSvgDrums,playKeyWaves,keyWaveFrames,keyWavePlans,decorativeKeyOrder,keyWaveDuration,keyWaveDelay,keyWaveStagger,keyTravel}=api;
  const scenarios=[];
  assert.equal(decorativeKeyOrder.length,19);assert.equal(new Set(decorativeKeyOrder).size,19);
  const plans=keyWavePlans(1);
  const frames=keyWaveFrames(plans[0].starts);
  assert.equal(frames[0].offset,0);assert.equal(frames.at(-1).offset,1);
  assert.equal(frames[0].transform,'translateY(0px)');assert.equal(frames.at(-1).transform,'translateY(0px)');
  assert.equal(frames[0].filter,'none');assert.equal(frames.at(-1).filter,'none');
  assert.equal(frames.filter(frame=>frame.transform===`translateY(${keyTravel}px)`).length,4);
  assert.equal(keyTravel,4.5);
  assert.ok(frames.every((frame,index)=>index===0||frame.offset>frames[index-1].offset));
  assert.ok(frames.every(frame=>['translateY(0px)','translateY(4.5px)'].includes(frame.transform)));
  assert.equal(keyWaveDelay+keyWaveDuration,2270);
  const waveOrder=(plans,wave)=>plans.toSorted((a,b)=>a.starts[wave]-b.starts[wave]).map(plan=>plan.letter);
  assert.deepEqual(keyWavePlans(1),plans);
  assert.notDeepEqual(waveOrder(plans,0),waveOrder(plans,1));
  assert.notDeepEqual(waveOrder(plans,0),waveOrder(keyWavePlans(2),0));
  for(let spin=1;spin<=500;spin++){
    const sequence=keyWavePlans(spin);
    assert.deepEqual(sequence.map(plan=>plan.letter),decorativeKeyOrder);
    for(let wave=0;wave<2;wave++)assert.deepEqual(sequence.map(plan=>plan.starts[wave]).toSorted((a,b)=>a-b),Array.from({length:19},(_,i)=>wave*1040+i*keyWaveStagger));
    for(const plan of sequence){
      const profile=keyWaveFrames(plan.starts);
      assert.equal(profile[0].offset,0);assert.equal(profile.at(-1).offset,1);
      assert.ok(profile.every((frame,i)=>i===0||frame.offset>profile[i-1].offset));
      for(const start of plan.starts){
        const down=profile.find(frame=>Math.abs(frame.offset-(start+45)/keyWaveDuration)<1e-9);
        const hold=profile.find(frame=>Math.abs(frame.offset-(start+85)/keyWaveDuration)<1e-9);
        const up=profile.find(frame=>Math.abs(frame.offset-(start+180)/keyWaveDuration)<1e-9);
        assert.equal(down.transform,'translateY(4.5px)');assert.equal(hold.transform,down.transform);assert.equal(up.transform,'translateY(0px)');
      }
    }
  }
  scenarios.push('All 19 keys press twice in shuffled orders; 500 cycles preserve 4.5-unit travel, 45 ms down, 40 ms hold, 95 ms return and neutral endpoints');

  const keyNodes=clock=>Array.from({length:19},()=>({animate:clock.tracks[0].animate}));
  const normal=fakeAnimationClock();let normalCommits=0;
  const playback=playSvgDrums(normal.tracks,drums,()=>normalCommits++,normal.env,keyNodes(normal));
  assert.equal(normal.calls.length,22);
  const keys=normal.calls.slice(3);
  assert.ok(keys.every(call=>call.options.delay===240));
  assert.ok(keys.every(call=>call.options.fill==='none' && call.options.duration===2030 && call.animation.startTime===10000 && !call.options.iterations));
  await normal.advance(1959);assert.ok(keys.every(call=>!call.animation.settled));assert.equal(normalCommits,0);
  await normal.advance(311);assert.ok(keys.every(call=>call.animation.settled));assert.equal(normalCommits,0);
  await normal.advance(170);assert.equal(normalCommits,1);assert.ok(keys.every(call=>call.animation.cancelled));
  playback.cancel();assert.equal(normal.tasks.size,0);
  scenarios.push('Keys share the drum clock, finish by 2270 ms and never delay the 2440 ms result; natural completion clears all effects');

  for(const mode of ['finish','cancel']){
    const interrupted=fakeAnimationClock();let commits=0;
    const active=playSvgDrums(interrupted.tracks,drums,()=>commits++,interrupted.env,keyNodes(interrupted));
    await interrupted.advance(700);active[mode]();
    assert.ok(interrupted.calls.slice(3).every(call=>call.animation.cancelled));
    assert.equal(commits,mode==='finish'?1:0);
    active.cancel();await interrupted.advance(4000);assert.equal(commits,mode==='finish'?1:0);assert.equal(interrupted.tasks.size,0);
  }
  scenarios.push('Forced completion (hide/resize/reduce) and unmount cancel key waves immediately without extra result commits');

  const missing=fakeAnimationClock();let watchdogCommits=0;
  const watchdog=playSvgDrums(missing.tracks,drums,()=>watchdogCommits++,missing.env,keyNodes(missing));
  for(const call of missing.calls.slice(0,3))missing.env.clear(call.timer);
  await missing.advance(2270);assert.ok(missing.calls.slice(3).every(call=>call.animation.settled));assert.equal(watchdogCommits,0);
  await missing.advance(930);assert.equal(watchdogCommits,1);assert.ok(missing.calls.slice(3).every(call=>call.animation.cancelled));
  watchdog.cancel();await missing.flush();assert.equal(missing.tasks.size,0);
  scenarios.push('A missing drum finish does not leave keys moving; watchdog clears secondary effects');

  for(const mode of ['missing','throw','reject']){
    const failed=fakeAnimationClock();let commits=0;
    const nodes=keyNodes(failed);
    if(mode==='missing')nodes.fill(null);
    if(mode==='throw')nodes[1]={animate(){throw new Error('Decorative animation failure');}};
    const main=playSvgDrums(failed.tracks,drums,()=>commits++,failed.env,nodes);
    if(mode==='reject')failed.calls[3].animation.cancel();
    await failed.flush();assert.equal(commits,0,'Decorative failure must not commit the drums early');
    await failed.advance(2440);assert.equal(commits,1);
    main.cancel();await failed.flush();assert.equal(failed.tasks.size,0);
  }
  scenarios.push('Missing keys, partial launch failure and decorative rejection leave all three drums and their result intact');

  const rejected=fakeAnimationClock();let rejectedCommits=0;
  const rejection=playSvgDrums(rejected.tracks,drums,()=>rejectedCommits++,rejected.env,keyNodes(rejected));
  rejected.calls[0].animation.cancel();await rejected.flush();
  assert.equal(rejectedCommits,1);assert.ok(rejected.calls.slice(3).every(call=>call.animation.cancelled));
  rejection.cancel();assert.equal(rejected.tasks.size,0);
  scenarios.push('Unexpected main-animation rejection cancels decorative waves with the prepared result');

  for(let spin=0;spin<3;spin++){
    const next=fakeAnimationClock();
    const wave=playKeyWaves(keyNodes(next),10000);
    assert.equal(next.calls.length,19);wave.cancel();wave.cancel();await next.advance(4000);assert.equal(next.tasks.size,0);
  }
  scenarios.push('Repeated setup/cleanup starts fresh waves without queued timers or lingering effects');
  return scenarios;
}
