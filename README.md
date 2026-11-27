# Gobble Dash: Turkey's Great Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Petrussilvesterlaia/turkey-escape-20261127/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Petrussilvesterlaia/turkey-escape-20261127/reward.svg)](https://make.fun/c/turkey-run-game-01)

Thanksgiving is coming, and Gobble the turkey is on the menu. Run 1000 metres
from the farmyard, through the barn, and out of the kitchen — outrunning the
farmer, dodging hay bales, fences, rolling pumpkins, gravy puddles, falling
carving knives and the oven's flames — to escape becoming dinner.

## How to play

- **Space / ↑ / W** — jump (press again mid-air for a double jump)
- **↓ / S** — duck under low flames
- **← / →** — ease off or push the pace a little
- **Click / tap** — jump (on-screen friendly, touch works too)
- **M** — mute, **R** — restart after a run ends

Grab corn (+100), rare golden feathers (+500) and slices of pie (+1 life).
You have 3 lives. Every stumble lets the farmer close in — if he catches you,
it is Thanksgiving dinner. Reach 1000 m and Gobble is free.

## Run it locally

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network request: every file the game loads lives under `game/`, and all sound
is synthesized with WebAudio at run time.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
into the output directory and writes `dossier.json` there with the vendored
make.fun library in `vendor/makefun-game.ts`.

## Files

- `game/index.html` — the page that loads the game
- `game/src/config.js` — tuning numbers and stage palettes
- `game/src/input.js` — keyboard, mouse and touch input
- `game/src/audio.js` — synthesized WebAudio sounds
- `game/src/world.js` — scrolling world, spawning, hazards, pickups
- `game/src/entities.js` — turkey and farmer physics and collisions
- `game/src/render.js` — all vector art, scenery, HUD and menus
- `game/src/main.js` — game loop and state machine
- `main.ts` — the hand-in program
- `serve.ts` — tiny local static server for testing

Built as an entry for the make.fun turkey escape game bounty
([turkey-run-game-01](https://make.fun/c/turkey-run-game-01)). Original art,
sound and code — no assets copied from any existing game.
