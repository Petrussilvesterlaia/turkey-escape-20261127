// Gobble Dash — tuning constants and stage palette.
// One clear job: every number the game balances on lives here, so tuning
// never means hunting through the simulation code.
export const GAME = {
  width: 960,
  height: 540,
  groundY: 452,
  gravity: 2400,
  jumpVelocity: -820,
  doubleJumpVelocity: -740,
  baseSpeed: 260,
  maxSpeed: 560,
  speedGainPerMetre: 0.22,
  paceStep: 34,
  goalDistance: 1000,
  startLives: 3,
  invulnerableSeconds: 1.6,
  farmerCatchDistance: 46,
  farmerCloseDistance: 190,
  cornScore: 100,
  featherScore: 500,
  spawnIntervalMin: 0.72,
  spawnIntervalMax: 1.35,
};

export const STAGES = [
  {
    name: 'Farmyard',
    from: 0,
    sky: ['#f9c86e', '#f2a65a'],
    hill: '#c98a3d',
    ground: '#a9712f',
    groundTop: '#d9a441',
    accent: '#7a9b3f',
    label: 'The Farmyard — run, Gobble, run!',
  },
  {
    name: 'Barn',
    from: 300,
    sky: ['#e8935a', '#c96a3f'],
    hill: '#8a4f2c',
    ground: '#6e3f22',
    groundTop: '#a06a35',
    accent: '#d8b25a',
    label: 'The Barn — hay, fences and rolling pumpkins!',
  },
  {
    name: 'Kitchen',
    from: 650,
    sky: ['#d97b4f', '#a84a33'],
    hill: '#5d2f24',
    ground: '#4a241c',
    groundTop: '#7d4a30',
    accent: '#e8c25a',
    label: 'The Kitchen — the oven is lit. Almost free!',
  },
];

export function stageFor(distance) {
  let current = STAGES[0];
  for (const stage of STAGES) {
    if (distance >= stage.from) current = stage;
  }
  return current;
}

export const BEST_KEY = 'gobble-dash-best-score';
