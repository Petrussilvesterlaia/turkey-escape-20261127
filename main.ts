// Gobble Dash hand-in (Node 22, standard library only).
//
// The game is plain static files under game/ in this repository: a 2D canvas
// runner that opens offline in a desktop browser. This program hands it in
// by staging game/ and screenshots/ into the output directory and writing
// the dossier there with the vendored make.fun library.
//
// It never deletes the output directory itself: the grader mounts /output,
// so removing it would remove the mount. It only creates directories and
// copies files into them, which is safe both in the grader and locally.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const gameOut = join(outputDir, 'game');
const shotsOut = join(outputDir, 'screenshots');

mkdirSync(outputDir, { recursive: true });
mkdirSync(gameOut, { recursive: true });
cpSync(join(repoRoot, 'game'), gameOut, { recursive: true });
mkdirSync(shotsOut, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsOut, { recursive: true });
}

// Caps copied from the gate's reference so the dossier refuses exactly what
// the scorer would refuse: at most 160 KiB of source text, 4 screenshots of
// at most 256 KiB each, at most 993 game files totalling 48 MiB, and no game
// path longer than 1000 bytes.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);

// A short run summary on stdout so a local test can see at a glance what
// was staged; the grader only cares about the files on disk.
const dossierBytes = Buffer.byteLength(dossier, 'utf8');
if (dossierBytes > 1572864) {
  throw new Error(`dossier.json is ${dossierBytes} bytes, over the 1.5 MiB gate cap`);
}
console.log(`Gobble Dash handed in: game/ + screenshots/ staged in ${outputDir}, dossier.json ${dossierBytes} bytes`);
