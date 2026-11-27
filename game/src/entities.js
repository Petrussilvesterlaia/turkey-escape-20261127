// Gobble Dash — the turkey, the farmer and collision checks.
// One clear job: the two characters' physics and the rectangle/circle
// overlaps that decide hits, pickups and the catch. No drawing here.
import { GAME } from './config.js';

export function createTurkey() {
  const turkey = {
    x: 210,
    y: GAME.groundY - 62,
    w: 54,
    h: 62,
    vy: 0,
    jumps: 0,
    onGround: true,
    ducking: false,
    invulnerable: 0,
    slippery: 0,
    runPhase: 0,
  };

  return {
    turkey,
    reset() {
      turkey.x = 210;
      turkey.y = GAME.groundY - 62;
      turkey.vy = 0;
      turkey.jumps = 0;
      turkey.onGround = true;
      turkey.ducking = false;
      turkey.invulnerable = 0;
      turkey.slippery = 0;
      turkey.runPhase = 0;
    },
    jump(audio) {
      if (turkey.jumps === 0 && turkey.onGround) {
        turkey.vy = GAME.jumpVelocity;
        turkey.jumps = 1;
        turkey.onGround = false;
        if (audio) audio.jump();
        return true;
      }
      if (turkey.jumps === 1) {
        turkey.vy = GAME.doubleJumpVelocity;
        turkey.jumps = 2;
        if (audio) audio.doubleJump();
        return true;
      }
      return false;
    },
    update(dt, ducking, speed) {
      turkey.ducking = ducking && turkey.onGround;
      turkey.vy += GAME.gravity * dt;
      turkey.y += turkey.vy * dt;
      if (turkey.slippery > 0) turkey.slippery -= dt;
      const height = turkey.ducking ? 40 : 62;
      if (turkey.y + height >= GAME.groundY) {
        turkey.y = GAME.groundY - height;
        turkey.vy = 0;
        turkey.jumps = 0;
        turkey.onGround = true;
      } else {
        turkey.onGround = false;
      }
      turkey.h = height;
      if (turkey.onGround) turkey.runPhase += dt * (speed / 40);
      if (turkey.invulnerable > 0) turkey.invulnerable -= dt;
    },
    bounds() {
      // A forgiving hitbox: the turkey's drawn tail feathers stick out.
      return {
        x: turkey.x - 18,
        y: turkey.y + 6,
        w: turkey.w - 14,
        h: turkey.h - 8,
      };
    },
  };
}

export function rectanglesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleHitsRect(circle, rect) {
  const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

// The oven only burns while its flame is up; a ducked turkey slips under
// a low flame, a jumping one clears it.
export function obstacleBounds(obstacle) {
  if (obstacle.kind === 'oven') {
    return {
      x: obstacle.x + 6,
      y: obstacle.y - (obstacle.flame ? 132 : 96),
      w: obstacle.w - 12,
      h: obstacle.flame ? 132 : 96,
    };
  }
  if (obstacle.kind === 'knife') {
    return { x: obstacle.x, y: obstacle.y, w: obstacle.w, h: obstacle.h };
  }
  if (obstacle.kind === 'gravy') {
    return { x: obstacle.x, y: obstacle.y - 8, w: obstacle.w, h: 14 };
  }
  return { x: obstacle.x, y: obstacle.y - obstacle.h, w: obstacle.w, h: obstacle.h };
}

export function farmerBounds(farmerX) {
  return { x: farmerX - 20, y: GAME.groundY - 96, w: 44, h: 96 };
}
