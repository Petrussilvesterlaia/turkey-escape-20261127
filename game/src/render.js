// Gobble Dash — all drawing: vector art, parallax scenery, HUD and menus.
// One clear job: given the game state, paint one frame on the canvas.
// Nothing here changes the simulation; it only reads it.
import { GAME } from './config.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255, 246, 220, 0.9)';
  ctx.beginPath();
  ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 24 * scale, y - 8 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 48 * scale, y, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawTree(ctx, x, groundY, scale, color) {
  ctx.fillStyle = '#6e4423';
  ctx.fillRect(x - 5 * scale, groundY - 62 * scale, 10 * scale, 62 * scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, groundY - 78 * scale, 30 * scale, 0, Math.PI * 2);
  ctx.arc(x - 22 * scale, groundY - 62 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, groundY - 62 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawTurkey(ctx, turkey, time) {
  const x = turkey.x;
  const y = turkey.y;
  const bob = turkey.onGround ? Math.sin(turkey.runPhase) * 3 : 0;
  const blink = turkey.invulnerable > 0 && Math.floor(time * 14) % 2 === 0;
  ctx.save();
  if (blink) ctx.globalAlpha = 0.35;
  ctx.translate(x, y + bob);
  if (turkey.ducking) ctx.scale(1.15, 0.62);

  // Tail feathers, fanned.
  ctx.fillStyle = '#8a4a2b';
  for (let i = -2; i <= 2; i += 1) {
    ctx.save();
    ctx.translate(-16, 26);
    ctx.rotate(i * 0.32);
    ctx.beginPath();
    ctx.ellipse(-14, 0, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#c96a2e';
  for (let i = -1; i <= 1; i += 1) {
    ctx.save();
    ctx.translate(-14, 24);
    ctx.rotate(i * 0.3);
    ctx.beginPath();
    ctx.ellipse(-12, 0, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Body.
  ctx.fillStyle = '#7a4a26';
  ctx.beginPath();
  ctx.ellipse(0, 30, 26, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#9c5f30';
  ctx.beginPath();
  ctx.ellipse(2, 34, 20, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  // Wing.
  ctx.fillStyle = '#5d3419';
  ctx.beginPath();
  ctx.ellipse(-4, 30, 14, 9, -0.4, 0, Math.PI * 2);
  ctx.fill();
  // Neck and head.
  ctx.fillStyle = '#8a4a2b';
  ctx.fillRect(14, -6, 12, 26);
  ctx.fillStyle = '#a85a30';
  ctx.beginPath();
  ctx.arc(20, -10, 12, 0, Math.PI * 2);
  ctx.fill();
  // Beak, wattle and eye.
  ctx.fillStyle = '#e8a020';
  ctx.beginPath();
  ctx.moveTo(30, -12);
  ctx.lineTo(42, -8);
  ctx.lineTo(30, -4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  ctx.beginPath();
  ctx.ellipse(24, 2, 4, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(22, -14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1d1d1d';
  ctx.beginPath();
  ctx.arc(23, -14, 2, 0, Math.PI * 2);
  ctx.fill();
  // Legs, pedalling while running.
  const legSwing = turkey.onGround ? Math.sin(turkey.runPhase) * 7 : 4;
  ctx.strokeStyle = '#e8a020';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, 50);
  ctx.lineTo(-6 + legSwing, 62);
  ctx.moveTo(8, 50);
  ctx.lineTo(8 - legSwing, 62);
  ctx.stroke();
  ctx.restore();
}

function drawFarmer(ctx, x, time, close) {
  const y = GAME.groundY;
  const swing = Math.sin(time * 11) * 6;
  ctx.save();
  ctx.translate(x, 0);
  // Legs.
  ctx.strokeStyle = '#2e3a5c';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-6, y - 44);
  ctx.lineTo(-6 + swing, y);
  ctx.moveTo(6, y - 44);
  ctx.lineTo(6 - swing, y);
  ctx.stroke();
  // Overalls and shirt.
  ctx.fillStyle = '#3f6db3';
  ctx.fillRect(-14, y - 78, 28, 40);
  ctx.fillStyle = '#b8452f';
  ctx.fillRect(-16, y - 96, 32, 22);
  // Arms reaching forward.
  ctx.strokeStyle = '#b8452f';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(10, y - 90);
  ctx.lineTo(28, y - 78 + swing * 0.4);
  ctx.moveTo(8, y - 86);
  ctx.lineTo(26, y - 66 - swing * 0.4);
  ctx.stroke();
  // Head, hat and moustache.
  ctx.fillStyle = '#e8b98a';
  ctx.beginPath();
  ctx.arc(0, y - 104, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a5a2e';
  ctx.fillRect(-16, y - 122, 32, 8);
  ctx.fillRect(-10, y - 134, 20, 14);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-8, y - 102, 16, 5);
  // Angry eyes.
  ctx.fillStyle = '#1d1d1d';
  ctx.fillRect(2, y - 110, 3, 3);
  ctx.fillRect(9, y - 110, 3, 3);
  if (close) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GET BACK HERE!', 0, y - 146);
  }
  ctx.restore();
}

function drawObstacle(ctx, obstacle, time) {
  const { kind } = obstacle;
  if (kind === 'hay') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.ellipse(obstacle.x + 29, obstacle.y - 26, 30, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a87c22';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(obstacle.x + 29 + i * 10, obstacle.y - 48);
      ctx.lineTo(obstacle.x + 29 + i * 12, obstacle.y - 6);
      ctx.stroke();
    }
  } else if (kind === 'fence') {
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(obstacle.x, obstacle.y - 74, 8, 74);
    ctx.fillRect(obstacle.x + 22, obstacle.y - 74, 8, 74);
    ctx.fillRect(obstacle.x - 4, obstacle.y - 66, 38, 8);
    ctx.fillRect(obstacle.x - 4, obstacle.y - 40, 38, 8);
  } else if (kind === 'pumpkin') {
    ctx.save();
    ctx.translate(obstacle.x + 23, obstacle.y - 23);
    ctx.rotate(obstacle.roll || 0);
    ctx.fillStyle = '#e07b24';
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b85c14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 21, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#4a7a2e';
    ctx.fillRect(-3, -26, 6, 8);
    ctx.restore();
  } else if (kind === 'gravy') {
    ctx.fillStyle = '#8a5a2e';
    ctx.beginPath();
    ctx.ellipse(obstacle.x + 55, obstacle.y - 4, 55, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c98a3d';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('GRAVY!', obstacle.x + 55, obstacle.y - 16);
  } else if (kind === 'knife') {
    ctx.save();
    ctx.translate(obstacle.x + 8, obstacle.y + 29);
    ctx.fillStyle = '#c8ccd4';
    ctx.beginPath();
    ctx.moveTo(0, -29);
    ctx.lineTo(7, -8);
    ctx.lineTo(7, 8);
    ctx.lineTo(-7, 8);
    ctx.lineTo(-7, -8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4a2e1a';
    ctx.fillRect(-6, 8, 12, 20);
    ctx.restore();
  } else if (kind === 'oven') {
    ctx.fillStyle = '#3a3a3f';
    ctx.fillRect(obstacle.x, obstacle.y - 96, 74, 96);
    ctx.fillStyle = '#222226';
    ctx.fillRect(obstacle.x + 8, obstacle.y - 58, 58, 40);
    ctx.fillStyle = obstacle.flame ? '#ff9a2e' : '#5a3a22';
    ctx.fillRect(obstacle.x + 12, obstacle.y - 54, 50, 32);
    ctx.fillStyle = '#e8e8e8';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('OVEN', obstacle.x + 37, obstacle.y - 68);
    if (obstacle.flame) {
      const flicker = Math.sin(time * 22) * 6;
      ctx.fillStyle = '#ff6a1a';
      ctx.beginPath();
      ctx.moveTo(obstacle.x + 14, obstacle.y - 96);
      ctx.quadraticCurveTo(obstacle.x + 24, obstacle.y - 132 - flicker, obstacle.x + 37, obstacle.y - 96);
      ctx.quadraticCurveTo(obstacle.x + 50, obstacle.y - 132 - flicker, obstacle.x + 60, obstacle.y - 96);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffd23e';
      ctx.beginPath();
      ctx.moveTo(obstacle.x + 24, obstacle.y - 96);
      ctx.quadraticCurveTo(obstacle.x + 32, obstacle.y - 116, obstacle.x + 37, obstacle.y - 96);
      ctx.quadraticCurveTo(obstacle.x + 42, obstacle.y - 116, obstacle.x + 50, obstacle.y - 96);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawPickup(ctx, pickup, time) {
  const bob = Math.sin(time * 5 + pickup.x * 0.01) * 4;
  ctx.save();
  ctx.translate(pickup.x, pickup.y + bob);
  if (pickup.kind === 'corn') {
    ctx.fillStyle = '#f7c531';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a020';
    for (let row = -1; row <= 1; row += 1) {
      ctx.fillRect(-5, row * 7, 10, 2);
    }
    ctx.fillStyle = '#4a7a2e';
    ctx.fillRect(-2, 12, 4, 6);
  } else if (pickup.kind === 'feather') {
    ctx.fillStyle = '#f3e2b8';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 14, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a94f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 14);
    ctx.stroke();
  } else if (pickup.kind === 'pie') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a84a33';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3d9a4';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('+1', 0, 5);
  }
  ctx.restore();
}

function drawBackground(ctx, stage, world, distance) {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME.groundY);
  gradient.addColorStop(0, stage.sky[0]);
  gradient.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME.width, GAME.groundY);
  // Sun.
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.arc(820, 74, 34, 0, Math.PI * 2);
  ctx.fill();
  for (const cloud of world.clouds) drawCloud(ctx, cloud.x, cloud.y, cloud.scale);
  // Far hills and trees, scrolling slowly.
  ctx.fillStyle = stage.hill;
  ctx.beginPath();
  ctx.moveTo(0, GAME.groundY);
  for (let x = 0; x <= GAME.width; x += 60) {
    const offset = ((x + distance * 2) % 480) / 480;
    ctx.lineTo(x, GAME.groundY - 60 - Math.sin(offset * Math.PI * 2) * 34);
  }
  ctx.lineTo(GAME.width, GAME.groundY);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 6; i += 1) {
    const treeX = ((i * 190 - distance * 4) % (GAME.width + 120) + GAME.width + 120) % (GAME.width + 120) - 60;
    drawTree(ctx, treeX, GAME.groundY, 0.8, stage.accent);
  }
  // Ground.
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, GAME.groundY, GAME.width, GAME.height - GAME.groundY);
  ctx.fillStyle = stage.groundTop;
  ctx.fillRect(0, GAME.groundY, GAME.width, 10);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  ctx.lineWidth = 2;
  for (let x = 0; x < GAME.width; x += 48) {
    const dashX = ((x - distance * 14) % 96 + 96) % 96 - 48;
    ctx.beginPath();
    ctx.moveTo(dashX, GAME.groundY + 30);
    ctx.lineTo(dashX + 22, GAME.groundY + 30);
    ctx.stroke();
  }
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(43, 26, 18, 0.82)';
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#f3d9a4';
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 14);
  ctx.stroke();
}

function drawHud(ctx, game) {
  ctx.fillStyle = 'rgba(43, 26, 18, 0.66)';
  roundRect(ctx, 12, 10, 560, 44, 10);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 19px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score ${game.score}`, 26, 39);
  ctx.fillText(`${Math.floor(game.distance)} m`, 210, 39);
  ctx.fillStyle = '#f3d9a4';
  ctx.font = '16px Georgia, serif';
  ctx.fillText(game.stage.name, 340, 38);
  ctx.fillStyle = '#ff8a7a';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'right';
  let hearts = '';
  for (let i = 0; i < game.lives; i += 1) hearts += '♥ ';
  ctx.fillText(hearts.trim(), 948, 39);
  ctx.textAlign = 'left';
  if (game.world.isFarmerClose() && game.phase === 'playing') {
    const pulse = 0.6 + Math.sin(game.time * 8) * 0.4;
    ctx.fillStyle = `rgba(200, 40, 30, ${pulse})`;
    ctx.font = 'bold 22px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠ THE FARMER IS CLOSE! ⚠', GAME.width / 2, 92);
    ctx.textAlign = 'left';
  }
}

function drawTitle(ctx, game) {
  panel(ctx, 150, 84, 660, 330);
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 52px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('GOBBLE DASH', GAME.width / 2, 152);
  ctx.fillStyle = '#f3d9a4';
  ctx.font = 'italic 24px Georgia, serif';
  ctx.fillText("Turkey's Great Escape", GAME.width / 2, 190);
  ctx.fillStyle = '#fff';
  ctx.font = '18px Georgia, serif';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster.', GAME.width / 2, 228);
  ctx.fillText('Dodge hay, fences, pumpkins, gravy, knives and the oven.', GAME.width / 2, 256);
  ctx.fillText('Run 1000 m to freedom. Corn +100 · Golden feather +500 · Pie +1 life.', GAME.width / 2, 284);
  ctx.fillStyle = '#ffd23e';
  ctx.font = 'bold 22px Georgia, serif';
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) ctx.fillText('Press SPACE to run', GAME.width / 2, 330);
  ctx.fillStyle = '#f3d9a4';
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Space / ↑ / W jump (double jump) · ↓ / S duck · ← / → pace · M mute', GAME.width / 2, 366);
  ctx.fillText(`Best score: ${game.best}`, GAME.width / 2, 394);
  ctx.textAlign = 'left';
}

function drawEnd(ctx, game) {
  const won = game.phase === 'escaped';
  panel(ctx, 190, 110, 580, 300);
  ctx.fillStyle = won ? '#ffd23e' : '#ff8a7a';
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(won ? 'YOU ESCAPED!' : 'CAUGHT!', GAME.width / 2, 178);
  ctx.fillStyle = '#fff';
  ctx.font = '20px Georgia, serif';
  ctx.fillText(
    won
      ? 'Gobble slipped past the kitchen and into the wild. Free at last!'
      : 'The farmer finally got his turkey. Thanksgiving dinner it is…',
    GAME.width / 2, 220,
  );
  ctx.fillStyle = '#ffe9a8';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.fillText(`Score ${game.score} · Distance ${Math.floor(game.distance)} m`, GAME.width / 2, 262);
  ctx.fillStyle = '#f3d9a4';
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`Best score: ${game.best}`, GAME.width / 2, 294);
  const blink = Math.floor(game.time * 2) % 2 === 0;
  if (blink) {
    ctx.fillStyle = '#ffd23e';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('Press R or click to run again', GAME.width / 2, 340);
  }
  ctx.textAlign = 'left';
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return {
    draw(game) {
      const world = game.world.state;
      ctx.save();
      if (world.shake > 0) {
        ctx.translate((Math.random() - 0.5) * world.shake, (Math.random() - 0.5) * world.shake);
      }
      drawBackground(ctx, game.stage, world, game.distance);
      for (const pickup of world.pickups) drawPickup(ctx, pickup, game.time);
      for (const obstacle of world.obstacles) drawObstacle(ctx, obstacle, game.time);
      // Particles.
      for (const particle of world.particles) {
        ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
      ctx.globalAlpha = 1;
      drawFarmer(ctx, world.farmerX, game.time, game.world.isFarmerClose());
      drawTurkey(ctx, game.turkey, game.time);
      if (world.flash > 0) {
        ctx.fillStyle = `rgba(200, 40, 30, ${world.flash * 0.35})`;
        ctx.fillRect(0, 0, GAME.width, GAME.height);
      }
      ctx.restore();
      if (game.phase === 'playing' || game.phase === 'caught' || game.phase === 'escaped') {
        drawHud(ctx, game);
      }
      if (game.phase === 'title') drawTitle(ctx, game);
      if (game.phase === 'caught' || game.phase === 'escaped') drawEnd(ctx, game);
      if (game.muted) {
        ctx.fillStyle = '#f3d9a4';
        ctx.font = '15px Georgia, serif';
        ctx.textAlign = 'right';
        ctx.fillText('Muted (M)', 948, 524);
        ctx.textAlign = 'left';
      }
    },
  };
}
