// Sizzle & Serve — game state, orders, minigames, scoring.
// The renderer draws this state; main.js owns the loop and input routing.
import { DIFFICULTIES, STATIONS, CHEF_LANE_Y, SAVE_KEY, DISH_BEST_KEY } from './config.js';
import { INGREDIENTS, INGREDIENT_LIST, DISHES, dishById, matchDish, possibleDishes } from './recipes.js';

let customerSeq = 1;

export function loadBest() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch (e) { return {}; }
}
export function loadDishBest() {
  try { return JSON.parse(localStorage.getItem(DISH_BEST_KEY) || '{}'); } catch (e) { return {}; }
}
export function saveBest(best) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(best)); } catch (e) { /* storage unavailable */ }
}
export function saveDishBest(best) {
  try { localStorage.setItem(DISH_BEST_KEY, JSON.stringify(best)); } catch (e) { /* storage unavailable */ }
}

export function createGame() {
  return {
    screen: 'title',
    difficultyIndex: 1,
    difficulty: DIFFICULTIES[1],
    timeLeft: 0,
    elapsed: 0,
    score: 0,
    coins: 0,
    dishesServed: 0,
    strikes: 0,
    chef: { x: 640, targetX: 640, station: null, walk: 0, carrying: null },
    hand: null, // {label, component, ingredient, action} or {label:'Burnt mess', burnt:true}
    plate: [], // component strings on the plating counter
    plateReadyAt: 0,
    readyDish: null,
    inventory: {},
    customers: [],
    spawnIn: 6,
    minigame: null, // {type:'chop'|'cook', ...}
    particles: [],
    floaters: [],
    message: null,
    messageUntil: 0,
    showRecipes: false,
    showPantry: false,
    paused: false,
    endStats: null,
    best: loadBest(),
    dishBest: loadDishBest(),
    muted: false,
    shiftOver: false,
    lastDishId: null,
  };
}

export function startShift(state, difficultyIndex, sound) {
  const d = DIFFICULTIES[difficultyIndex];
  state.difficultyIndex = difficultyIndex;
  state.difficulty = d;
  state.screen = 'play';
  state.timeLeft = d.timeLimit;
  state.elapsed = 0;
  state.score = 0;
  state.coins = d.startCoins;
  state.dishesServed = 0;
  state.strikes = 0;
  state.chef = { x: 640, targetX: 640, station: null, walk: 0, carrying: null };
  state.hand = null;
  state.plate = [];
  state.plateReadyAt = 0;
  state.readyDish = null;
  state.inventory = {};
  for (const ing of INGREDIENT_LIST) state.inventory[ing.id] = d.startStock;
  state.customers = [];
  state.spawnIn = 4;
  state.minigame = null;
  state.particles = [];
  state.floaters = [];
  state.showRecipes = false;
  state.showPantry = false;
  state.paused = false;
  state.shiftOver = false;
  state.endStats = null;
  state.lastDishId = null;
  showMessage(state, `Shift started — ${d.name}! Serve as many dishes as you can.`, 3);
  if (sound) { sound.ensure(); sound.startMusic(); }
}

export function showMessage(state, text, secs = 2.5) {
  state.message = text;
  state.messageUntil = state.elapsed + secs;
}

export function addFloater(state, x, y, text, color = '#2e7d32') {
  state.floaters.push({ x, y, text, color, life: 1.4 });
}

export function addParticles(state, x, y, n, color) {
  for (let i = 0; i < n; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 40,
      vy: -20 - Math.random() * 40,
      life: 0.6 + Math.random() * 0.5,
      max: 1.1,
      color,
      size: 2 + Math.random() * 3,
    });
  }
}

function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

export function chefStation(state) {
  for (const s of STATIONS) {
    if (Math.abs(state.chef.x - (s.x + s.w / 2)) < 12) return s.id;
  }
  return null;
}

export function goToStation(state, id) {
  const s = stationById(id);
  if (!s) return;
  state.chef.targetX = s.x + s.w / 2;
  state.showPantry = false;
}

function pickDishId(state) {
  const pool = DISHES.filter((d) => d.id !== state.lastDishId);
  const d = pool[Math.floor(Math.random() * pool.length)];
  state.lastDishId = d.id;
  return d.id;
}

export function spawnCustomer(state, sound) {
  const d = state.difficulty;
  if (state.customers.length >= d.maxCustomers) return false;
  const slot = state.customers.length;
  state.customers.push({
    id: customerSeq++,
    slot,
    dishId: pickDishId(state),
    patience: d.patience,
    maxPatience: d.patience,
    placedAt: state.elapsed,
    state: 'waiting',
  });
  if (sound) sound.newOrder();
  return true;
}

function endShift(state, reason, sound) {
  if (state.shiftOver) return;
  state.shiftOver = true;
  state.screen = 'end';
  if (sound) { sound.stopSizzle(); sound.stopMusic(); sound.fanfare(); }
  const d = state.difficulty;
  const stars = state.score >= d.starScore[2] ? 3 : state.score >= d.starScore[1] ? 2 : state.score >= d.starScore[0] ? 1 : 0;
  const best = state.best;
  const isRecord = state.score > (best.score || 0);
  if (isRecord) { best.score = state.score; best.dishes = state.dishesServed; saveBest(best); }
  state.best = best;
  state.endStats = {
    reason, stars, isRecord,
    score: state.score, coins: state.coins,
    dishes: state.dishesServed, strikes: state.strikes,
    timeUsed: Math.round(state.elapsed),
    dishBest: state.dishBest,
  };
  addParticles(state, 640, 300, 60, '#f2b705');
}

export function updateGame(state, dt, sound) {
  // Chef walking animation.
  const chef = state.chef;
  const dx = chef.targetX - chef.x;
  if (Math.abs(dx) > 2) {
    chef.x += Math.sign(dx) * Math.min(Math.abs(dx), 420 * dt);
    chef.walk += dt * 12;
  } else {
    chef.x = chef.targetX;
    chef.walk = 0;
  }
  chef.station = chefStation(state);

  // Particles and floaters always animate.
  for (const p of state.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const f of state.floaters) { f.y -= 30 * dt; f.life -= dt; }
  state.floaters = state.floaters.filter((f) => f.life > 0);

  if (state.screen !== 'play' || state.paused) return;
  state.elapsed += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    endShift(state, "Time's up — the shift is over!", sound);
    return;
  }

  // Customers arrive.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    if (spawnCustomer(state, sound)) state.spawnIn = state.difficulty.spawnInterval;
    else state.spawnIn = 3;
  }

  // Patience drains; a customer who waits too long storms out.
  for (const c of state.customers) {
    if (c.state !== 'waiting') continue;
    c.patience -= dt;
    if (c.patience <= 0) {
      c.state = 'angry';
      c.patience = 0;
      state.strikes += 1;
      state.score = Math.max(0, state.score - 25);
      showMessage(state, `${dishById(c.dishId).name} customer left angry! −25 points (strike ${state.strikes}/3)`, 3);
      if (sound) sound.error();
      if (state.strikes >= 3) {
        endShift(state, 'Three customers stormed out — the shift is over!', sound);
        return;
      }
    }
  }
  state.customers = state.customers.filter((c) => c.state === 'waiting' || c.angerT > 0);
  state.customers = state.customers.filter((c) => c.state === 'waiting');

  // Minigame timers.
  const mg = state.minigame;
  if (mg) {
    if (mg.type === 'chop') {
      mg.marker += mg.dir * mg.speed * dt;
      if (mg.marker > 1) { mg.marker = 1; mg.dir = -1; }
      if (mg.marker < 0) { mg.marker = 0; mg.dir = 1; }
    } else if (mg.type === 'cook') {
      const heating = mg.heating;
      mg.temp += (heating ? 52 : -34) * dt;
      mg.temp = Math.max(0, Math.min(100, mg.temp));
      if (mg.temp >= 45 && mg.temp <= 78) {
        mg.progress += 26 * dt;
      } else if (mg.temp > 92) {
        mg.overheat += dt;
        if (mg.overheat > 1.1) {
          finishCook(state, true, sound);
          return;
        }
      } else {
        mg.overheat = Math.max(0, mg.overheat - dt);
      }
      if (mg.progress >= 100) finishCook(state, false, sound);
    }
  }
}

function finishCook(state, burnt, sound) {
  const mg = state.minigame;
  state.minigame = null;
  if (sound) sound.stopSizzle();
  if (burnt) {
    state.hand = { label: 'Burnt mess', burnt: true };
    showMessage(state, 'Burnt! Toss it (press X) and try again.', 2.5);
    if (sound) sound.burn();
    addParticles(state, 613, 330, 16, '#616161');
    return;
  }
  const ing = INGREDIENTS[mg.ingredient];
  state.hand = {
    label: `${ing.name} (${mg.action === 'boil' ? 'boiled' : 'fried'})`,
    component: `${mg.ingredient}:${mg.action}`,
    ingredient: mg.ingredient,
    action: mg.action,
  };
  showMessage(state, `${ing.name} ${mg.action === 'boil' ? 'boiled' : 'fried'} — take it to the plating counter!`, 2);
  if (sound) { sound.ding(); }
  addParticles(state, 613, 330, 14, '#ffb74d');
}

export function minigameClick(state, sound) {
  const mg = state.minigame;
  if (!mg) return;
  if (mg.type === 'chop') {
    if (mg.marker >= mg.zone[0] && mg.marker <= mg.zone[1]) {
      mg.hits += 1;
      if (sound) sound.chop();
      addParticles(state, 378, 330, 8, '#aed581');
      if (mg.hits >= mg.needed) {
        const ing = INGREDIENTS[mg.ingredient];
        state.minigame = null;
        state.hand = { label: `Chopped ${ing.name}`, component: `${mg.ingredient}:chop`, ingredient: mg.ingredient, action: 'chop' };
        showMessage(state, `${ing.name} chopped — take it to the plating counter!`, 2);
        if (sound) sound.pop();
      } else {
        mg.speed += 0.25;
      }
    } else {
      mg.hits = Math.max(0, mg.hits - 1);
      if (sound) sound.error();
      showMessage(state, 'Missed the chop zone — watch the marker!', 1.5);
    }
  }
}

export function setCookHeating(state, heating) {
  if (state.minigame && state.minigame.type === 'cook') state.minigame.heating = heating;
}

// --- Station actions -------------------------------------------------------

export function stationAction(state, stationId, sound) {
  if (state.screen !== 'play' || state.minigame || state.showRecipes) return;
  if (state.paused) return;
  const station = stationById(stationId);
  if (!station) return;
  if (chefStation(state) !== stationId) { goToStation(state, stationId); return; }

  if (stationId === 'pantry') {
    state.showPantry = !state.showPantry;
    if (sound) sound.click();
    return;
  }
  if (stationId === 'chopping') {
    if (!state.hand) { showMessage(state, 'Grab an ingredient from the pantry first.', 2); if (sound) sound.error(); return; }
    if (state.hand.burnt) { showMessage(state, 'That is burnt — toss it first (press X).', 2); return; }
    const ing = INGREDIENTS[state.hand.ingredient];
    if (!ing || ing.action !== 'chop') { showMessage(state, `${ing ? ing.name : 'That'} does not need chopping.`, 2); if (sound) sound.error(); return; }
    state.minigame = { type: 'chop', ingredient: ing.id, marker: 0, dir: 1, speed: 0.9, zone: [0.38, 0.62], hits: 0, needed: 3 };
    state.hand = null;
    if (sound) sound.click();
    return;
  }
  if (stationId === 'stove') {
    if (!state.hand) { showMessage(state, 'Grab an ingredient from the pantry first.', 2); if (sound) sound.error(); return; }
    if (state.hand.burnt) { showMessage(state, 'That is burnt — toss it first (press X).', 2); return; }
    const ing = INGREDIENTS[state.hand.ingredient];
    if (!ing || (ing.action !== 'fry' && ing.action !== 'boil')) { showMessage(state, `${ing ? ing.name : 'That'} does not go on the stove.`, 2); if (sound) sound.error(); return; }
    state.minigame = { type: 'cook', ingredient: ing.id, action: ing.action, temp: 18, progress: 0, overheat: 0, heating: false };
    state.hand = null;
    if (sound) { sound.click(); sound.startSizzle(); }
    return;
  }
  if (stationId === 'plating') {
    if (state.hand) {
      if (state.hand.burnt) { showMessage(state, 'That is burnt — toss it (press X), do not plate it!', 2); return; }
      state.plate.push(state.hand.component);
      showMessage(state, `Added ${state.hand.label} to the plate.`, 1.5);
      if (sound) sound.pop();
      state.hand = null;
      const dish = matchDish(state.plate);
      if (dish) {
        state.readyDish = dish;
        state.plateReadyAt = state.elapsed;
        showMessage(state, `${dish.name} is ready to serve!`, 2.5);
        if (sound) sound.ding();
      } else {
        state.readyDish = null;
        const possible = possibleDishes(state.plate);
        if (possible.length === 0) showMessage(state, 'That combination matches no recipe — clear the plate!', 2.5);
      }
    } else if (state.plate.length > 0) {
      state.plate = [];
      state.readyDish = null;
      showMessage(state, 'Plate cleared.', 1.5);
      if (sound) sound.click();
    } else {
      showMessage(state, 'Bring a prepared ingredient here to plate it.', 2);
    }
    return;
  }
  if (stationId === 'serving') {
    if (state.readyDish) showMessage(state, `Click a customer's ticket to serve the ${state.readyDish.name}.`, 2.5);
    else showMessage(state, 'No dish is ready yet — finish one at the plating counter.', 2);
    if (sound) sound.click();
  }
}

export function takeIngredient(state, id, sound) {
  if (state.hand) { showMessage(state, 'Your hands are full — plate or toss what you carry first.', 2); return; }
  if ((state.inventory[id] || 0) <= 0) { showMessage(state, `Out of ${INGREDIENTS[id].name} — buy more with coins.`, 2); if (sound) sound.error(); return; }
  state.inventory[id] -= 1;
  const ing = INGREDIENTS[id];
  state.hand = { label: ing.name, ingredient: id, action: ing.action, component: null };
  if (ing.action === 'raw') state.hand.component = `${id}:raw`;
  showMessage(state, `Picked up ${ing.name}.`, 1.2);
  if (sound) sound.pickup();
}

export function buyIngredient(state, id, sound) {
  const ing = INGREDIENTS[id];
  if (state.coins < ing.price) { showMessage(state, `Not enough coins for ${ing.name} (${ing.price} coins). Serve a dish first!`, 2.5); if (sound) sound.error(); return; }
  state.coins -= ing.price;
  state.inventory[id] = (state.inventory[id] || 0) + 1;
  if (sound) sound.coin();
  showMessage(state, `Bought 1 ${ing.name} for ${ing.price} coins.`, 1.5);
}

export function discardHand(state, sound) {
  if (!state.hand) return;
  state.hand = null;
  if (sound) sound.click();
  showMessage(state, 'Tossed it in the bin.', 1.2);
}

export function serveTicket(state, customerId, sound) {
  const c = state.customers.find((x) => x.id === customerId && x.state === 'waiting');
  if (!c) return;
  if (!state.readyDish) { showMessage(state, 'No dish is ready to serve yet.', 2); if (sound) sound.error(); return; }
  if (state.readyDish.id !== c.dishId) {
    showMessage(state, `That customer ordered ${dishById(c.dishId).name}, not ${state.readyDish.name}.`, 2.5);
    if (sound) sound.error();
    return;
  }
  const dish = state.readyDish;
  const patienceFrac = Math.max(0, c.patience / c.maxPatience);
  const tip = Math.round(patienceFrac * 10);
  const fresh = state.elapsed - state.plateReadyAt < 12 ? 5 : 0;
  const earned = dish.price + tip + fresh;
  state.score += earned;
  state.coins += earned;
  state.dishesServed += 1;
  const serveTime = Math.round(state.elapsed - c.placedAt);
  const db = state.dishBest[dish.id] || { score: 0, time: 9999 };
  if (earned > db.score) db.score = earned;
  if (serveTime < db.time) db.time = serveTime;
  state.dishBest[dish.id] = db;
  saveDishBest(state.dishBest);
  const ticket = documentTicketPos(state, c);
  addFloater(state, ticket.x, ticket.y, `+${earned}`, '#2e7d32');
  addParticles(state, ticket.x, ticket.y + 30, 18, '#ffd54f');
  showMessage(state, `Served ${dish.name}! +${earned} points (${dish.price} + ${tip} tip${fresh ? ' + 5 fresh' : ''})`, 2.5);
  if (sound) { sound.coin(); sound.success(); }
  state.customers = state.customers.filter((x) => x.id !== c.id);
  state.plate = [];
  state.readyDish = null;
  state.plateReadyAt = 0;
}

function documentTicketPos(state, c) {
  const idx = state.customers.indexOf(c);
  return { x: 60 + idx * 210 + 95, y: 30 };
}

export function togglePause(state, sound) {
  if (state.screen !== 'play') return;
  state.paused = !state.paused;
  if (sound) sound.click();
}
