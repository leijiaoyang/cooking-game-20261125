// Sizzle & Serve — deterministic scenes for screenshots (?shot=start|play|serve|end).
// The game itself never depends on these; they only preset state for the camera.
import { startShift } from './world.js';
import { dishById } from './recipes.js';

export function applyShot(state, shot, sound) {
  if (shot === 'start') {
    state.screen = 'title';
    state.difficultyIndex = 1;
    state.showRecipes = false;
    return;
  }
  // A mid-shift kitchen for play / serve / end.
  startShift(state, 1, null);
  state.timeLeft = 132;
  state.elapsed = 48;
  state.score = 84;
  state.coins = 41;
  state.dishesServed = 3;
  state.strikes = 0;
  state.inventory = {
    bun: 3, patty: 2, tomato: 4, lettuce: 3, cheese: 2, onion: 2,
    mushroom: 1, egg: 2, fish: 1, potato: 2, lemon: 3, pasta: 2,
  };
  state.customers = [
    { id: 101, slot: 0, dishId: 'burger', patience: 45, maxPatience: 70, placedAt: 20, state: 'waiting' },
    { id: 102, slot: 1, dishId: 'salad', patience: 58, maxPatience: 70, placedAt: 32, state: 'waiting' },
  ];
  if (shot === 'play') {
    // One dish mid-assembly: bun + fried patty on the plate, chopped tomato in hand.
    state.plate = ['bun:raw', 'patty:fry'];
    state.readyDish = null;
    state.hand = { label: 'Chopped Tomato', component: 'tomato:chop', ingredient: 'tomato', action: 'chop' };
    state.chef.x = 848;
    state.chef.targetX = 848;
    return;
  }
  if (shot === 'serve') {
    // A finished burger on the plate, its customer waiting with a green tick.
    state.plate = ['bun:raw', 'patty:fry', 'tomato:chop', 'lettuce:chop', 'cheese:raw'];
    state.readyDish = dishById('burger');
    state.plateReadyAt = 44;
    state.hand = null;
    state.chef.x = 1105;
    state.chef.targetX = 1105;
    state.customers[0].patience = 52;
    return;
  }
  if (shot === 'end') {
    state.timeLeft = 0;
    state.score = 520;
    state.coins = 96;
    state.dishesServed = 9;
    state.strikes = 1;
    state.screen = 'end';
    state.endStats = {
      reason: "Time's up — the shift is over!",
      stars: 3,
      isRecord: true,
      score: 520,
      coins: 96,
      dishes: 9,
      strikes: 1,
      timeUsed: 180,
      dishBest: {
        burger: { score: 33, time: 38 },
        salad: { score: 24, time: 31 },
        'fish-chips': { score: 30, time: 44 },
      },
    };
    state.best = { score: 520, dishes: 9 };
    state.plate = ['bun:raw', 'patty:fry'];
    state.chef.x = 848;
    state.chef.targetX = 848;
  }
}
