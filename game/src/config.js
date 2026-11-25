// Sizzle & Serve — configuration: canvas, palette, difficulties.
// All values are plain data; the world module owns the mutable state.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

export const COLORS = {
  wall: '#f7e8c9',
  wallTop: '#ffe9b8',
  floor: '#e8b06a',
  floorDark: '#d99a52',
  counterTop: '#8a5a2b',
  counterFront: '#6e4520',
  counterEdge: '#a9743c',
  cream: '#fff8e7',
  ink: '#3a2410',
  inkSoft: '#6b4a26',
  red: '#e4572e',
  green: '#4caf50',
  greenDark: '#2e7d32',
  gold: '#f2b705',
  blue: '#3d8bfd',
  panel: '#fffdf5',
  panelEdge: '#d9c08a',
  danger: '#d32f2f',
  ticket: '#fffbe8',
};

export const DIFFICULTIES = [
  {
    id: 'easy',
    name: 'Easy',
    blurb: 'Relaxed shift',
    timeLimit: 240,
    patience: 95,
    maxCustomers: 2,
    spawnInterval: 26,
    starScore: [180, 320, 480],
    startCoins: 30,
    startStock: 4,
  },
  {
    id: 'normal',
    name: 'Normal',
    blurb: 'A busy lunch rush',
    timeLimit: 180,
    patience: 70,
    maxCustomers: 3,
    spawnInterval: 20,
    starScore: [220, 400, 600],
    startCoins: 24,
    startStock: 3,
  },
  {
    id: 'rush',
    name: 'Rush',
    blurb: 'Dinner service chaos',
    timeLimit: 150,
    patience: 50,
    maxCustomers: 4,
    spawnInterval: 14,
    starScore: [260, 480, 720],
    startCoins: 20,
    startStock: 2,
  },
];

// Station geometry: five counters along the kitchen wall.
export const STATIONS = [
  { id: 'pantry', name: 'Pantry', short: 'PANTRY', x: 48, y: 300, w: 200, h: 150, key: '1', color: '#b08954' },
  { id: 'chopping', name: 'Chopping Board', short: 'CHOP', x: 278, y: 300, w: 200, h: 150, key: '2', color: '#7fb069' },
  { id: 'stove', name: 'Stove', short: 'STOVE', x: 508, y: 300, w: 210, h: 150, key: '3', color: '#e4572e' },
  { id: 'plating', name: 'Plating Counter', short: 'PLATE', x: 748, y: 300, w: 200, h: 150, key: '4', color: '#5b8def' },
  { id: 'serving', name: 'Serving Window', short: 'SERVE', x: 978, y: 300, w: 254, h: 150, key: '5', color: '#f2b705' },
];

export const CHEF_LANE_Y = 560;
export const SAVE_KEY = 'sizzle-and-serve-best-v1';
export const DISH_BEST_KEY = 'sizzle-and-serve-dish-best-v1';
