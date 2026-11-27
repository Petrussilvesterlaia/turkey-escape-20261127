// Gobble Dash — keyboard, mouse and touch input.
// One clear job: turn raw events into a small set of named intents the
// simulation reads each frame. No game logic lives here.
export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  let pointerJump = false;

  function codeOf(event) {
    return event.code || event.key || '';
  }

  function onKeyDown(event) {
    const code = codeOf(event);
    if (code === 'Space' || code === 'ArrowUp' || code === 'ArrowDown') {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(code);
    held.add(code);
  }

  function onKeyUp(event) {
    held.delete(codeOf(event));
  }

  function onPointerDown(event) {
    event.preventDefault();
    pointerJump = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  return {
    held(code) {
      return held.has(code);
    },
    pressed(code) {
      return pressed.has(code);
    },
    consumePointerJump() {
      const value = pointerJump;
      pointerJump = false;
      return value;
    },
    // Called at the end of every frame so a press is seen exactly once.
    endFrame() {
      pressed.clear();
    },
    ducking() {
      return held.has('ArrowDown') || held.has('KeyS');
    },
    paceDirection() {
      let direction = 0;
      if (held.has('ArrowLeft') || held.has('KeyA')) direction -= 1;
      if (held.has('ArrowRight') || held.has('KeyD')) direction += 1;
      return direction;
    },
  };
}
