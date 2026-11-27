// Gobble Dash — the world: spawning, stages, hazards and pickups.
// One clear job: own the scrolling world state (obstacles, pickups,
// particles, the chasing farmer) and advance it one frame at a time.
import { GAME, STAGES, stageFor } from './config.js';

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickWeighted(entries) {
  let total = 0;
  for (const entry of entries) total += entry.weight;
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.kind;
  }
  return entries[entries.length - 1].kind;
}

export function createWorld() {
  const state = {
    distance: 0,
    speed: GAME.baseSpeed,
    spawnTimer: 1.1,
    obstacles: [],
    pickups: [],
    particles: [],
    clouds: [],
    farmerX: -90,
    farmerGap: 210,
    shake: 0,
    flash: 0,
    time: 0,
  };

  for (let i = 0; i < 5; i += 1) {
    state.clouds.push({
      x: randomBetween(0, GAME.width),
      y: randomBetween(40, 150),
      scale: randomBetween(0.6, 1.4),
      drift: randomBetween(6, 18),
    });
  }

  function stageIndex() {
    const stage = stageFor(state.distance);
    return STAGES.indexOf(stage);
  }

  function spawnObstacle() {
    const index = stageIndex();
    const table = [
      { kind: 'hay', weight: 5 },
      { kind: 'fence', weight: 4 },
      { kind: 'pumpkin', weight: 2 },
      { kind: 'gravy', weight: 3 },
    ];
    if (index >= 1) table.push({ kind: 'knife', weight: 3 });
    if (index >= 2) table.push({ kind: 'oven', weight: 4 });
    const kind = pickWeighted(table);
    const x = GAME.width + 60;
    if (kind === 'hay') {
      state.obstacles.push({ kind, x, y: GAME.groundY, w: 58, h: 52, passed: false });
    } else if (kind === 'fence') {
      state.obstacles.push({ kind, x, y: GAME.groundY, w: 30, h: 74, passed: false });
    } else if (kind === 'pumpkin') {
      state.obstacles.push({ kind, x, y: GAME.groundY, w: 46, h: 46, roll: 0, passed: false });
    } else if (kind === 'gravy') {
      state.obstacles.push({ kind, x, y: GAME.groundY, w: 110, h: 14, passed: false, slippery: true });
    } else if (kind === 'knife') {
      state.obstacles.push({
        kind, x, y: 60, w: 16, h: 58, vy: 420, passed: false, falling: true,
      });
    } else if (kind === 'oven') {
      state.obstacles.push({
        kind, x, y: GAME.groundY, w: 74, h: 96, passed: false,
        cycle: randomBetween(0, 2.4), flame: false,
      });
    }
  }

  function spawnPickup() {
    const roll = Math.random();
    const x = GAME.width + 60;
    if (roll < 0.07) {
      state.pickups.push({ kind: 'pie', x, y: GAME.groundY - 130, r: 16 });
    } else if (roll < 0.2) {
      state.pickups.push({ kind: 'feather', x, y: GAME.groundY - 150, r: 13 });
    } else {
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i += 1) {
        state.pickups.push({
          kind: 'corn', x: x + i * 36, y: GAME.groundY - 90 - (i % 2) * 34, r: 12,
        });
      }
    }
  }

  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = randomBetween(speed * 0.3, speed);
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 60,
        life: randomBetween(0.4, 0.9),
        maxLife: 0.9,
        size: randomBetween(3, 7),
        color,
      });
    }
  }

  return {
    state,
    reset() {
      state.distance = 0;
      state.speed = GAME.baseSpeed;
      state.spawnTimer = 1.1;
      state.obstacles = [];
      state.pickups = [];
      state.particles = [];
      state.farmerX = -90;
      state.farmerGap = 210;
      state.shake = 0;
      state.flash = 0;
      state.time = 0;
    },
    stage() {
      return stageFor(state.distance);
    },
    update(dt, paceDirection, turkey, onStumble) {
      state.time += dt;
      const target = Math.min(
        GAME.maxSpeed,
        GAME.baseSpeed + state.distance * GAME.speedGainPerMetre + paceDirection * GAME.paceStep,
      );
      state.speed += (target - state.speed) * Math.min(1, dt * 2.5);
      state.distance += (state.speed * dt) / 14;

      // The farmer closes in whenever the turkey stumbles; he falls back
      // slowly while the turkey runs clean.
      state.farmerGap += (paceDirection < 0 ? -14 : 26) * dt;
      state.farmerGap = Math.max(56, Math.min(320, state.farmerGap));
      state.farmerX = turkey.x - state.farmerGap;

      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        spawnObstacle();
        if (Math.random() < 0.55) spawnPickup();
        state.spawnTimer = randomBetween(GAME.spawnIntervalMin, GAME.spawnIntervalMax);
      }

      const scroll = state.speed * dt;
      for (const obstacle of state.obstacles) {
        obstacle.x -= scroll;
        if (obstacle.kind === 'pumpkin') {
          obstacle.roll += (scroll / 23) * 1;
          obstacle.x -= scroll * 0.35;
        }
        if (obstacle.kind === 'knife') {
          obstacle.y += obstacle.vy * dt;
          if (obstacle.y > GAME.groundY - obstacle.h) obstacle.y = GAME.groundY - obstacle.h;
        }
        if (obstacle.kind === 'oven') {
          obstacle.cycle += dt;
          obstacle.flame = (obstacle.cycle % 2.4) < 1.1;
        }
      }
      state.obstacles = state.obstacles.filter((o) => o.x > -140);
      for (const pickup of state.pickups) pickup.x -= scroll;
      state.pickups = state.pickups.filter((p) => p.x > -40);

      // Dust kicked up by running feet.
      if (Math.random() < dt * 14 && turkey.onGround) {
        state.particles.push({
          x: turkey.x - 18, y: GAME.groundY - 2,
          vx: randomBetween(-50, -10), vy: randomBetween(-70, -20),
          life: 0.5, maxLife: 0.5, size: randomBetween(3, 6), color: '#d9b06a',
        });
      }
      for (const particle of state.particles) {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += 300 * dt;
        particle.life -= dt;
      }
      state.particles = state.particles.filter((p) => p.life > 0);

      for (const cloud of state.clouds) {
        cloud.x -= cloud.drift * dt;
        if (cloud.x < -120) {
          cloud.x = GAME.width + 80;
          cloud.y = randomBetween(40, 150);
        }
      }

      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 26);
      if (state.flash > 0) state.flash = Math.max(0, state.flash - dt * 2.2);
      if (onStumble) onStumble(state.farmerGap);
    },
    stumble() {
      state.farmerGap = Math.max(56, state.farmerGap - 62);
      state.shake = 12;
      state.flash = 0.7;
    },
    featherBurst(x, y) {
      burst(x, y, '#f3e2b8', 16, 220);
      burst(x, y, '#b5533c', 8, 160);
    },
    cornBurst(x, y) {
      burst(x, y, '#f7c531', 8, 140);
    },
    isFarmerClose() {
      return state.farmerGap < GAME.farmerCloseDistance;
    },
    isCaught() {
      return state.farmerGap <= GAME.farmerCatchDistance;
    },
    hasEscaped() {
      return state.distance >= GAME.goalDistance;
    },
  };
}
