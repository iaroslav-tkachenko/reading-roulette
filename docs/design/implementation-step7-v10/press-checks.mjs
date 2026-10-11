import assert from 'node:assert/strict';

export function checkPress(createSpinPress, createSpinPressHandlers) {
  let now=0, nextId=0, activations=0;
  const timers=new Map(), states=[], scenarios=[];
  const clock={now:()=>now,schedule:(fn,delay)=>{const id=++nextId;timers.set(id,{fn,at:now+delay});return id;},clear:id=>timers.delete(id)};
  const advance=ms=>{
    const end=now+ms;
    while(true){
      const due=[...timers].filter(([,item])=>item.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];
      if(!due)break;
      now=due[1].at;timers.delete(due[0]);due[1].fn();
    }
    now=end;
  };
  const press=createSpinPress(value=>states.push(value),clock);
  const handlers=createSpinPressHandlers(press,()=>activations++);
  const pointer=(pointerId=1,button=0,isPrimary=true)=>({pointerId,button,isPrimary});
  const key=(key,repeat=false)=>({key,repeat,preventDefault(){this.prevented=true;}});
  const down=()=>states.at(-1);

  handlers.onPointerDown(pointer());
  assert.equal(down(),true);assert.equal(activations,0);
  advance(1000);assert.equal(down(),true);
  handlers.onPointerUp(pointer());assert.equal(down(),false);
  handlers.onClick();assert.equal(activations,1);
  advance(60);assert.equal(down(),false);
  scenarios.push('Pointerdown shows travel without activation; long hold; release; one native click');

  handlers.onPointerDown(pointer());advance(5);handlers.onPointerUp(pointer());
  assert.equal(down(),true);advance(54);assert.equal(down(),true);advance(1);assert.equal(down(),false);
  scenarios.push('A 5 ms tap completes at least 60 ms of downward travel');

  for(const event of ['onPointerLeave','onPointerCancel']){
    handlers.onPointerDown(pointer());advance(100);handlers[event](pointer());
    assert.equal(down(),false);assert.equal(activations,1);
    scenarios.push(event+' releases without selecting a result');
  }

  handlers.onPointerDown(pointer());advance(100);
  handlers.onPointerUp(pointer(2));assert.equal(down(),true);
  handlers.onPointerUp(pointer());assert.equal(down(),false);
  const count=states.length;
  handlers.onPointerDown(pointer(2,2));handlers.onPointerDown(pointer(2,0,false));
  assert.equal(states.length,count);
  scenarios.push('Secondary buttons/non-primary pointers ignored; unrelated pointer cannot release');

  for(const value of ['Enter',' ']){
    const before=activations;
    handlers.onKeyDown(key(value));assert.equal(down(),true);assert.equal(activations,before);
    const repeated=key(value,true);handlers.onKeyDown(repeated);assert.equal(repeated.prevented,true);
    advance(100);handlers.onKeyUp(key('a'));assert.equal(down(),true);
    handlers.onKeyUp(key(value));assert.equal(down(),false);
    handlers.onClick();assert.equal(activations,before+1);advance(60);assert.equal(down(),false);
    scenarios.push(value===' '?'Space uses native click and ignores repeat':'Enter uses native click and ignores repeat');
  }

  const beforeOther=states.length;handlers.onKeyDown(key('a'));assert.equal(states.length,beforeOther);
  handlers.onClick();assert.equal(down(),true);advance(60);assert.equal(down(),false);
  scenarios.push('Other keys do nothing; assistive/programmatic click gets a complete visual pulse');

  for(const cancel of [handlers.onBlur,handlers.onContextMenu,()=>press.cancel()]){
    handlers.onPointerDown(pointer());cancel();assert.equal(down(),false);
    assert.equal(timers.size,0);advance(200);assert.equal(down(),false);
  }
  scenarios.push('Blur, context menu and visibility/window cancellation return immediately');

  handlers.onPointerDown(pointer());advance(5);handlers.onPointerUp(pointer());
  advance(5);handlers.onPointerDown(pointer());advance(100);assert.equal(down(),true);
  handlers.onPointerUp(pointer());assert.equal(down(),false);assert.equal(timers.size,0);
  scenarios.push('A rapid new press clears the previous release timer and remains held');

  handlers.onClick();assert.equal(timers.size,1);press.dispose();assert.equal(timers.size,0);
  const beforeDispose=states.length;advance(200);press.pulse();assert.equal(states.length,beforeDispose);
  press.resume();assert.equal(down(),false);handlers.onClick();advance(60);assert.equal(down(),false);
  scenarios.push('Dispose clears timers and ignores future visual writes; StrictMode setup resumes');

  assert.equal(timers.size,0);
  return scenarios;
}
