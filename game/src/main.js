// Gobble Dash — the game loop and state machine.
// One clear job: own the phase (title / playing / caught / escaped),
// wire input, audio, world and rendering together, and score the run.
import { GAME, BEST_KEY, stageFor } from './config.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createWorld } from './world.js';
import { createTurkey, rectanglesOverlap, circleHitsRect, obstacleBounds, farmerBounds } from './entities.js';
import { createRenderer } from './render.js';

function mulberry32(seed) {
  let value = seed >>> 0;
  return function seededRandom() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const params = new URLSearchParams(window.location.search);
const seedParam = params.get('seed');
if (seedParam !== null) {
  Math.random = mulberry32(Number(seedParam) || 1);
}

const canvas = document.getElementById('game');
const input = createInput(canvas);
const audio = createAudio();
const world = createWorld();
const turkeyApi = createTurkey();
const renderer = createRenderer(canvas);

const game = {
  phase: 'title',
  score: 0,
  distance: 0,
  lives: GAME.startLives,
  stage: stageFor(0),
  time: 0,
  best: 0,
  muted: false,
  turkey: turkeyApi.turkey,
  world,
};

try {
  game.best = Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
} catch {
  game.best = 0;
}

function saveBest() {
  if (game.score > game.best) {
    game.best = game.score;
    try {
      window.localStorage.setItem(BEST_KEY, String(game.best));
    } catch {
      // Private browsing may block storage; the run still counts.
    }
  }
}

function startRun() {
  world.reset();
  turkeyApi.reset();
  game.score = 0;
  game.distance = 0;
  game.lives = GAME.startLives;
  game.phase = 'playing';
  game.stage = stageFor(0);
  audio.unlock();
  audio.click();
}

function endRun(escaped) {
  game.phase = escaped ? 'escaped' : 'caught';
  saveBest();
  audio.stopAlarm();
  if (escaped) audio.win();
  else audio.caught();
}

function loseLife() {
  game.lives -= 1;
  turkeyApi.turkey.invulnerable = GAME.invulnerableSeconds;
  world.stumble();
  audio.hit();
  if (game.lives <= 0) endRun(false);
}

function updatePlaying(dt) {
  const turkey = turkeyApi.turkey;
  // Read the pointer jump first: short-circuiting the key checks below
  // must never leave a tap unconsumed into the next frame (it would
  // double-jump on its own a frame later).
  const tapped = input.consumePointerJump();
  if (input.pressed('Space') || input.pressed('ArrowUp') || input.pressed('KeyW') || tapped) {
    turkeyApi.jump(audio);
  }
  turkeyApi.update(dt, input.ducking(), world.state.speed);
  world.update(dt, input.paceDirection(), turkey, null);

  game.distance = world.state.distance;
  game.stage = world.stage();
  game.score += Math.floor(world.state.speed * dt * 0.1);

  // Gravy slows the turkey and makes the farmer gain ground.
  const turkeyBox = turkeyApi.bounds();
  for (const obstacle of world.state.obstacles) {
    if (obstacle.kind === 'gravy' && rectanglesOverlap(turkeyBox, obstacleBounds(obstacle))) {
      turkey.slippery = 0.4;
      world.state.farmerGap = Math.max(56, world.state.farmerGap - 18 * dt);
    }
  }

  // Farmer alarm follows his distance.
  if (world.isFarmerClose()) audio.startAlarm();
  else audio.stopAlarm();

  if (world.isCaught()) {
    endRun(false);
    return;
  }
  if (world.hasEscaped()) {
    endRun(true);
    return;
  }

  // Collisions with hazards.
  if (turkey.invulnerable <= 0) {
    for (const obstacle of world.state.obstacles) {
      if (obstacle.kind === 'gravy') continue;
      if (obstacle.kind === 'oven' && !obstacle.flame) continue;
      if (rectanglesOverlap(turkeyBox, obstacleBounds(obstacle))) {
        loseLife();
        break;
      }
    }
  }

  // Pickups.
  for (const pickup of world.state.pickups) {
    if (circleHitsRect(pickup, turkeyBox)) {
      pickup.taken = true;
      if (pickup.kind === 'corn') {
        game.score += GAME.cornScore;
        world.cornBurst(pickup.x, pickup.y);
        audio.pickup();
      } else if (pickup.kind === 'feather') {
        game.score += GAME.featherScore;
        world.featherBurst(pickup.x, pickup.y);
        audio.feather();
      } else if (pickup.kind === 'pie') {
        game.lives = Math.min(5, game.lives + 1);
        world.featherBurst(pickup.x, pickup.y);
        audio.life();
      }
    }
  }
  world.state.pickups = world.state.pickups.filter((p) => !p.taken);
}

function update(dt) {
  game.time += dt;
  if (input.pressed('KeyM')) {
    game.muted = audio.toggleMute();
  }
  if (game.phase === 'title') {
    // Consume the tap up front for the same reason as in updatePlaying.
    const tapped = input.consumePointerJump();
    if (input.pressed('Space') || input.pressed('Enter') || tapped) {
      startRun();
    }
    return;
  }
  if (game.phase === 'playing') {
    updatePlaying(dt);
    return;
  }
  const tappedAgain = input.consumePointerJump();
  if (input.pressed('KeyR') || input.pressed('Space') || input.pressed('Enter') || tappedAgain) {
    startRun();
  }
}

// Screenshot poses for the bounty dossier (?shot=start|play|end&seed=1).
// The game itself is unchanged; these poses only pre-arrange a scene.
function applyShotPose() {
  const shot = params.get('shot');
  if (!shot) return;
  if (shot === 'play') {
    startRun();
    world.state.distance = 420;
    world.state.speed = 380;
    game.score = 1250;
    game.lives = 2;
    world.state.obstacles.push(
      { kind: 'hay', x: 620, y: GAME.groundY, w: 58, h: 52, passed: false },
      { kind: 'fence', x: 780, y: GAME.groundY, w: 30, h: 74, passed: false },
      { kind: 'pumpkin', x: 880, y: GAME.groundY, w: 46, h: 46, roll: 0.4, passed: false },
    );
    world.state.pickups.push(
      { kind: 'corn', x: 520, y: GAME.groundY - 90, r: 12 },
      { kind: 'corn', x: 556, y: GAME.groundY - 124, r: 12 },
      { kind: 'feather', x: 700, y: GAME.groundY - 150, r: 13 },
    );
    world.state.farmerGap = 150;
    world.state.farmerX = turkeyApi.turkey.x - 150;
  } else if (shot === 'end') {
    startRun();
    game.score = 2840;
    game.distance = 512;
    world.state.distance = 512;
    game.lives = 0;
    endRun(false);
  }
}

applyShotPose();

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  renderer.draw(game);
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
