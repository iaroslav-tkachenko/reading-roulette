import assert from 'node:assert/strict';
import { fakeAnimationClock } from './drum-checks.mjs';

export async function checkPointers(api, drums) {
  const {pointerFrames,pointerCycles,pointerDefinitions,pointerMounts,playSvgDrums,playDrumPointers}=api;
  const scenarios=[];
  pointerDefinitions.forEach((pointer,index)=>{
    const drum=drums[pointer.drum],frames=pointerFrames(drum,index),cycles=pointerCycles(drum);
    assert.equal(cycles.length,[3,3,5,5,6,6][index]);
    assert.equal(frames[0].transform,'rotate(0deg)');
    assert.equal(frames.at(-1).transform,frames[0].transform);
    assert.equal(frames[0].offset,0);assert.equal(frames.at(-1).offset,1);
    assert.ok(frames.every((frame,i)=>frame.offset>=0 && frame.offset<=1 && (!i || frame.offset>frames[i-1].offset)));
    assert.ok(pointerMounts.some(mount=>mount.x===pointer.x && mount.y===pointer.y),'Every finger has a fixed pin');
    // Independently evaluate the drum's travel at each slow lift/return phase.
    cycles.forEach((cycle,number)=>{
      assert.ok(cycle.end-cycle.start>280,'No high-frequency clicks');
      assert.ok(cycle.lifted-cycle.start>190,'Gradual drag by the paper');
      assert.ok(cycle.end-cycle.lifted>85,'Visible spring return, no 10 ms kick');
      for(const [time,expected] of [[cycle.start,number/cycles.length],[cycle.lifted,(number+.7)/cycles.length],[cycle.end,(number+1)/cycles.length]]){
        const d=70+drum.cruise+260/3,a=70/d,c=drum.cruise/d;
        const progress=time<140?a*(time/140)**2:time<140+drum.cruise?a+c*(time-140)/drum.cruise:
          a+c+(1-a-c)*(1-(1-(time-140-drum.cruise)/260)**3);
        assert.ok(Math.abs(progress-expected)<1e-8);
      }
    });
    assert.equal(cycles.at(-1).end,drum.duration-80);
    assert.ok(cycles.at(-1).end-cycles.at(-1).start>cycles[0].end-cycles[0].start);
    const angles=frames.map(frame=>Number(frame.transform.match(/rotate\(([^d]+)deg\)/)[1]));
    assert.ok(angles.every(angle=>angle===0 || angle===-pointer.side*18),'Lift is always with the paper, without reverse kicks');
    assert.equal(angles.filter(angle=>angle!==0).length,cycles.length);
    assert.ok(frames.every(frame=>!frame.transform.includes('translate') && !frame.easing.includes('steps')));
  });
  scenarios.push('Six hinged fingers make 3/5/6 broad cycles, drag with the paper, return smoothly and rest during final settlement');
  {
    const c=fakeAnimationClock(),animatedPointers=[];
    const nodes=Array.from({length:6},(_,index)=>({animate(...args){
      animatedPointers.push(pointerDefinitions[index].id);
      return c.tracks[0].animate(...args);
    }}));let commits=0;
    const playback=playSvgDrums(c.tracks,drums,()=>commits++,c.env,[],1,[],nodes);
    assert.deepEqual(animatedPointers,['left','middle-left-format','right'],'Only the left finger of Topic, left finger of Format and right finger of Angle move');
    assert.equal(c.calls.length,6);
    assert.deepEqual(c.calls.slice(3).map(call=>call.options.duration),[1380,1860,2340]);
    c.calls.slice(3).forEach(call=>{
      assert.equal(call.animation.startTime,10000);assert.equal(call.options.delay,100);assert.equal(call.options.fill,'none');
    });
    await c.advance(1480);assert.equal(commits,0);
    assert.equal(c.calls[3].animation.settled,true);assert.equal(c.calls[4].animation.settled,false);
    await c.advance(480);assert.equal(c.calls[4].animation.settled,true);assert.equal(c.calls[5].animation.settled,false);assert.equal(commits,0);
    await c.advance(480);assert.equal(commits,1);
    playback.cancel();assert.equal(c.tasks.size,0);
    scenarios.push('Exactly three selected fingers animate, one per drum; others stay still, with shared clock, ordered stops and complete cleanup');
  }
  for(const mode of ['finish','cancel','watchdog','drum-error']){
    const c=fakeAnimationClock(),nodes=Array.from({length:6},()=>({animate:c.tracks[0].animate}));let commits=0;
    const playback=playSvgDrums(c.tracks,drums,()=>commits++,c.env,[],1,[],nodes);
    if(mode==='finish')playback.finish();
    if(mode==='cancel')playback.cancel();
    if(mode==='watchdog'){
      c.calls.forEach(call=>c.env.clear(call.timer));await c.advance(3200);
    }
    if(mode==='drum-error'){c.calls[0].animation.cancel();await c.flush();}
    assert.equal(commits,mode==='cancel'?0:1);
    assert.ok(c.calls.slice(3).every(call=>call.animation.cancelled));
    playback.cancel();assert.equal(c.tasks.size,0);
  }
  scenarios.push('Forced completion, unmount/resize-style cancel, watchdog and drum rejection remove every pointer effect');
  for(const mode of ['missing','unsupported','throw','reject']){
    const c=fakeAnimationClock();let commits=0;
    const good=()=>({animate:c.tracks[0].animate});
    const bad=mode==='missing'?null:mode==='unsupported'?{}:mode==='throw'?{animate(){throw Error('pointer')}}:good();
    const playback=playSvgDrums(c.tracks,drums,()=>commits++,c.env,[],1,[],[bad,good(),good(),good(),good(),good()]);
    if(mode==='reject')c.calls[3].animation.cancel();
    await c.advance(1960);assert.equal(commits,0);
    await c.advance(480);assert.equal(commits,1);
    playback.cancel();assert.equal(c.tasks.size,0);
  }
  scenarios.push('Missing or failing decorative pointer never blocks or prematurely finishes the roulette');
  {
    const c=fakeAnimationClock(),nodes=Array.from({length:6},()=>({animate:c.tracks[0].animate}));
    const first=playDrumPointers(nodes,drums,10000);first.cancel();
    const second=playDrumPointers(nodes,drums,10000);await c.advance(2440);second.cancel();
    assert.equal(c.calls.length,6);assert.equal(c.tasks.size,0);
    assert.ok(c.calls.every(call=>call.frames.at(-1).transform==='rotate(0deg)'));
    scenarios.push('Setup-cleanup-setup and successive runs return pointers to their exact resting transform');
  }
  return scenarios;
}
