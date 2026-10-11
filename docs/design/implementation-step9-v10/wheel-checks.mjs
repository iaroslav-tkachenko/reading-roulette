import assert from 'node:assert/strict';
import { fakeAnimationClock } from './drum-checks.mjs';

export async function checkWheels(api, drums) {
  const { wheelProgress, wheelFrames, wheelPitch, wheelStartDelay, playWheelRims, playSvgDrums } = api;
  const profile = drums[2], scenarios = [];
  const node = clock => ({style:{},dataset:{},animate:clock.tracks[0].animate});
  const displacement = transform => Number(transform.match(/translateY\(([^p]+)px\)/)[1]);
  const phaseOf = (time, phase=0) => (phase + 12*wheelPitch*wheelProgress(time-wheelStartDelay,profile)) % wheelPitch;
  let previous = -1;
  for(let time=-100;time<=profile.duration+100;time++) {
    const progress=wheelProgress(time,profile);
    assert.ok(progress>=previous && progress>=0 && progress<=1);
    previous=progress;
  }
  const frames=wheelFrames(23,profile);
  assert.equal(displacement(frames[0].transform),23);
  assert.equal(displacement(frames.at(-1).transform),23+12*wheelPitch);
  assert.equal(frames[1].offset,140/profile.duration);
  assert.equal(frames[2].offset,(140+profile.cruise)/profile.duration);
  // Velocity grows during acceleration and falls during braking; both seams
  // preserve velocity (last drum's brake/settle are one monotonic wheel brake).
  const speed=t=>wheelProgress(t+0.01,profile)-wheelProgress(t,profile);
  assert.ok(speed(100)>speed(10));
  assert.ok(speed(profile.duration-10)<speed(profile.duration-100));
  for(const seam of [140,140+profile.cruise]) assert.ok(Math.abs(speed(seam-0.01)-speed(seam))<1e-8);
  scenarios.push('Monotonic acceleration, cruise, smooth braking, periodic end and shared last-drum duration');

  {
    const c=fakeAnimationClock(), wheels=[node(c),node(c)];let commits=0;
    const playback=playSvgDrums(c.tracks,drums,()=>commits++,c.env,[],1,wheels);
    assert.equal(c.calls.length,5);
    for(const call of c.calls.slice(3)) {
      assert.equal(call.animation.startTime,10000);
      assert.equal(call.options.delay,100);
      assert.equal(call.options.duration,2340);
      assert.equal(call.options.fill,'both');
    }
    await c.advance(2439);assert.equal(commits,0);
    await c.advance(1);assert.equal(commits,1);
    assert.ok(wheels.every(w=>Number(w.dataset.wheelPhase)===0));
    assert.ok(c.calls.slice(3).every(call=>call.animation.cancelled));
    playback.cancel();assert.equal(c.tasks.size,0);
    scenarios.push('Both wheels share drum clock, stop at 2440 ms and do not delay the result');
  }

  for(const time of [0,50,170,800,2250]) {
    const c=fakeAnimationClock(), wheel=node(c);
    const playback=playWheelRims([wheel],10000,profile);
    c.calls[0].animation.currentTime=time;
    playback.cancel();playback.cancel();
    const phase=phaseOf(time);
    assert.ok(Math.abs(Number(wheel.dataset.wheelPhase)-phase)<1e-9);
    assert.equal(wheel.style.transform,`translateY(${phase}px)`);
    const next=playWheelRims([wheel],10000,profile);
    assert.equal(displacement(c.calls[1].frames[0].transform),phase);
    c.calls[1].animation.currentTime=700;next.cancel();
    assert.ok(Math.abs(Number(wheel.dataset.wheelPhase)-phaseOf(700,phase))<1e-9);
    assert.equal(c.tasks.size,0);
  }
  scenarios.push('Interrupt in delay, acceleration, cruise or braking freezes the tread and next SPIN continues that phase');

  for(const mode of ['finish','cancel','watchdog','drum-rejection']) {
    const c=fakeAnimationClock(), wheel=node(c);let commits=0;
    const playback=playSvgDrums(c.tracks,drums,()=>commits++,c.env,[],1,[wheel]);
    c.calls[3].animation.currentTime=800;
    if(mode==='finish') playback.finish();
    if(mode==='cancel') playback.cancel();
    if(mode==='watchdog') {
      // Simulate non-settling main animations while the fallback timer survives.
      for(const call of c.calls.slice(0,3))c.env.clear(call.timer);
      await c.advance(3200);
    }
    if(mode==='drum-rejection') {c.calls[0].animation.cancel();await c.flush();}
    assert.equal(commits,mode==='cancel'?0:1);
    assert.ok(c.calls[3].animation.cancelled);
    if(mode==='watchdog') assert.equal(Number(wheel.dataset.wheelPhase),0);
    else assert.ok(Math.abs(Number(wheel.dataset.wheelPhase)-phaseOf(800))<1e-9);
    playback.cancel();assert.equal(c.tasks.size,0);
  }
  scenarios.push('Forced finish, resize/hidden-style cleanup, watchdog and main-animation rejection stop wheel effects');

  for(const mode of ['missing','no-api','throw','reject']) {
    const c=fakeAnimationClock(), good=node(c);let commits=0;
    const bad=mode==='missing'?null:mode==='no-api'?{}:mode==='throw'?{animate(){throw Error('wheel failed')}}:node(c);
    const playback=playSvgDrums(c.tracks,drums,()=>commits++,c.env,[],1,[bad,good]);
    if(mode==='reject') c.calls[3].animation.cancel();
    await c.advance(2000);assert.equal(commits,0);
    await c.advance(440);assert.equal(commits,1);
    playback.cancel();assert.equal(c.tasks.size,0);
  }
  scenarios.push('Missing, unsupported, throwing or rejected wheel animation never commits a result early');

  {
    const c=fakeAnimationClock(), wheel=node(c);
    for(let spin=0;spin<50;spin++) {
      const playback=playWheelRims([wheel],10000,profile);
      await c.advance(2440);playback.cancel();
      assert.equal(Number(wheel.dataset.wheelPhase),0);
      assert.equal(c.tasks.size,0);
    }
    scenarios.push('Fifty successive natural cycles retain phase without leftover animations or timers');
  }
  return scenarios;
}
