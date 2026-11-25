// Sizzle & Serve — boot, game loop and input routing.
// All screens are drawn on one canvas; every control on screen works.
import { CANVAS_W, CANVAS_H, STATIONS } from './config.js';
import { SoundEngine } from './audio.js';
import { Input } from './input.js';
import {
  createGame, startShift, updateGame, stationAction, serveTicket,
  takeIngredient, buyIngredient, discardHand, togglePause,
  minigameClick, setCookHeating, goToStation, chefStation,
} from './world.js';
import { render } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const state = createGame();
const sound = new SoundEngine();
const input = new Input(canvas);
window.__game = state; // exposed for playtesting and debugging

const ui = {
  sound,
  muted: false,
  onStart(diffIndex) {
    sound.ensure();
    sound.click();
    startShift(state, diffIndex, sound);
  },
  onTitle() {
    sound.click();
    sound.stopMusic();
    sound.stopSizzle();
    state.screen = 'title';
    state.showRecipes = false;
    state.minigame = null;
    state.paused = false;
  },
  onStation(id) {
    if (state.screen !== 'play') return;
    sound.ensure();
    if (chefStation(state) === id) stationAction(state, id, sound);
    else goToStation(state, id);
  },
  onTicket(id) {
    if (state.screen !== 'play') return;
    serveTicket(state, id, sound);
  },
  onTake(id) {
    takeIngredient(state, id, sound);
    if (!state.hand) return;
    state.showPantry = false;
  },
  onBuy(id) { buyIngredient(state, id, sound); },
  onMinigameClick() { minigameClick(state, sound); },
  onPause() { togglePause(state, sound); },
  onMute() {
    ui.muted = !ui.muted;
    sound.setMuted(ui.muted);
    try { localStorage.setItem('sizzle-and-serve-muted', ui.muted ? '1' : '0'); } catch (e) { /* ignore */ }
  },
};

try {
  ui.muted = localStorage.getItem('sizzle-and-serve-muted') === '1';
  sound.setMuted(ui.muted);
} catch (e) { /* storage unavailable */ }

// Screenshot scenes: ?shot=start|play|serve|end (also used by shots.json).
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) applyShot(state, shot, sound);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;

  // Keyboard.
  for (const key of input.consumeKeys()) {
    if (key === 'm') { ui.onMute(); continue; }
    if (state.screen === 'title') {
      if (key === 'Enter' || key === ' ') ui.onStart(state.difficultyIndex);
      if (key === 'r') state.showRecipes = !state.showRecipes;
      if (key === 'ArrowLeft') state.difficultyIndex = Math.max(0, state.difficultyIndex - 1);
      if (key === 'ArrowRight') state.difficultyIndex = Math.min(2, state.difficultyIndex + 1);
      continue;
    }
    if (state.screen === 'end') {
      if (key === 'Enter' || key === ' ') ui.onStart(state.difficultyIndex);
      continue;
    }
    if (key === 'p' || key === 'Escape') { ui.onPause(); continue; }
    if (key === 'r') { state.showRecipes = !state.showRecipes; continue; }
    if (key === 'x') { discardHand(state, sound); continue; }
    if (key >= '1' && key <= '5') {
      const st = STATIONS[Number(key) - 1];
      if (st) goToStation(state, st.id);
      continue;
    }
    if (key === 'ArrowLeft' || key === 'ArrowRight') {
      const order = STATIONS.map((s) => s.id);
      const cur = chefStation(state);
      let idx = cur ? order.indexOf(cur) : -1;
      if (idx < 0) idx = key === 'ArrowRight' ? -1 : 1;
      idx = Math.max(0, Math.min(order.length - 1, idx + (key === 'ArrowRight' ? 1 : -1)));
      goToStation(state, order[idx]);
      continue;
    }
    if (key === ' ') {
      if (state.minigame && state.minigame.type === 'chop') minigameClick(state, sound);
      else if (!state.minigame) {
        const cur = chefStation(state);
        if (cur) stationAction(state, cur, sound);
      }
    }
  }

  // Hold-to-heat for the stove minigame.
  if (state.minigame && state.minigame.type === 'cook') {
    setCookHeating(state, input.mouse.down || input.isHeld(' '));
  }

  updateGame(state, dt, sound);
  render(state, ctx, input, ui, now / 1000);

  // Clicks: buttons first, then a fallback that walks the chef / chops.
  input.dispatchClicks((c) => {
    if (state.screen !== 'play') return;
    if (state.minigame && state.minigame.type === 'chop') { minigameClick(state, sound); return; }
    if (state.minigame || state.showPantry || state.showRecipes || state.paused) return;
    for (const s of STATIONS) {
      if (c.x >= s.x && c.x <= s.x + s.w && c.y >= s.y && c.y <= s.y + s.h) {
        ui.onStation(s.id);
        return;
      }
    }
  });

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
