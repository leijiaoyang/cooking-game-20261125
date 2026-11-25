// Sizzle & Serve — every pixel is drawn in code: kitchen, food, chef, HUD.
// No images, no photos, no external fonts.
import { CANVAS_W, CANVAS_H, COLORS, STATIONS, DIFFICULTIES, CHEF_LANE_Y } from './config.js';
import { INGREDIENTS, INGREDIENT_LIST, DISHES, dishById, dishSteps, possibleDishes } from './recipes.js';

const FONT = "'Trebuchet MS', Verdana, sans-serif";

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function button(ctx, input, id, x, y, w, h, label, onClick, opts = {}) {
  const hover = input.button(id, x, y, w, h, onClick);
  ctx.fillStyle = hover ? (opts.hoverColor || '#ffb74d') : (opts.color || '#e4572e');
  rr(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, opts.size || 18, opts.textColor || '#fff', 'center');
  return hover;
}

// --- Food drawing ----------------------------------------------------------

export function drawIngredient(ctx, shape, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  const u = s / 40; // unit scale
  ctx.lineWidth = 2 * u;
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  switch (shape) {
    case 'bun': {
      ctx.fillStyle = '#e8b06a';
      ctx.beginPath(); ctx.arc(0, 2 * u, 16 * u, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c98d4b';
      ctx.fillRect(-16 * u, 2 * u, 32 * u, 6 * u);
      ctx.fillStyle = '#fff3d6';
      [[-8, -8], [0, -12], [8, -8]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * u, dy * u, 1.6 * u, 0, 7); ctx.fill(); });
      break;
    }
    case 'patty': {
      ctx.fillStyle = '#7a4a21';
      rr(ctx, -17 * u, -7 * u, 34 * u, 14 * u, 7 * u); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#5d3413';
      [[-9, 0], [0, -2], [9, 1]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * u, dy * u, 2 * u, 0, 7); ctx.fill(); });
      break;
    }
    case 'tomato': {
      ctx.fillStyle = '#e4572e';
      ctx.beginPath(); ctx.arc(0, 2 * u, 15 * u, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c7431f';
      ctx.beginPath(); ctx.arc(-5 * u, -3 * u, 5 * u, 0, 7); ctx.fill();
      ctx.fillStyle = '#4caf50';
      ctx.beginPath(); ctx.moveTo(0, -10 * u); ctx.lineTo(-7 * u, -16 * u); ctx.lineTo(0, -13 * u); ctx.lineTo(7 * u, -16 * u); ctx.closePath(); ctx.fill();
      break;
    }
    case 'lettuce': {
      ctx.fillStyle = '#66bb6a';
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        ctx.lineTo(Math.cos(a) * 15 * u, Math.sin(a) * 11 * u);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#2e7d32';
      ctx.beginPath(); ctx.moveTo(-12 * u, 0); ctx.lineTo(12 * u, 0); ctx.stroke();
      break;
    }
    case 'cheese': {
      ctx.fillStyle = '#f2b705';
      ctx.beginPath(); ctx.moveTo(-16 * u, 10 * u); ctx.lineTo(16 * u, 10 * u); ctx.lineTo(16 * u, -8 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d89a00';
      [[-6, 3], [4, 0], [9, 5]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * u, dy * u, 2.2 * u, 0, 7); ctx.fill(); });
      break;
    }
    case 'onion': {
      ctx.fillStyle = '#f3e5f5';
      ctx.beginPath(); ctx.arc(0, 0, 14 * u, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ba68c8';
      [6, 10].forEach((r) => { ctx.beginPath(); ctx.arc(0, 0, r * u, 0, 7); ctx.stroke(); });
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(-5 * u, -2 * u, 10 * u, 14 * u);
      ctx.fillStyle = '#a1887f';
      ctx.beginPath(); ctx.arc(0, -2 * u, 15 * u, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      [[-7, -8], [2, -11]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx * u, dy * u, 2 * u, 0, 7); ctx.fill(); });
      break;
    }
    case 'egg': {
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.ellipse(0, 0, 17 * u, 12 * u, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffca28';
      ctx.beginPath(); ctx.arc(2 * u, 0, 7 * u, 0, 7); ctx.fill();
      break;
    }
    case 'fish': {
      ctx.fillStyle = '#90caf9';
      ctx.beginPath(); ctx.ellipse(0, 0, 17 * u, 8 * u, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(15 * u, 0); ctx.lineTo(22 * u, -7 * u); ctx.lineTo(22 * u, 7 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1e3a5f';
      ctx.beginPath(); ctx.arc(-9 * u, -2 * u, 1.8 * u, 0, 7); ctx.fill();
      break;
    }
    case 'potato': {
      ctx.fillStyle = '#ffd54f';
      [-8, 0, 8].forEach((dx) => { rr(ctx, dx * u - 4 * u, -14 * u, 8 * u, 28 * u, 3 * u); ctx.fill(); ctx.stroke(); });
      break;
    }
    case 'lemon': {
      ctx.fillStyle = '#ffee58';
      ctx.beginPath(); ctx.moveTo(-14 * u, 6 * u); ctx.quadraticCurveTo(0, -20 * u, 14 * u, 6 * u); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff9c4';
      ctx.beginPath(); ctx.moveTo(-9 * u, 4 * u); ctx.quadraticCurveTo(0, -11 * u, 9 * u, 4 * u); ctx.closePath(); ctx.fill();
      break;
    }
    case 'pasta': {
      ctx.strokeStyle = '#ffca28';
      ctx.lineWidth = 3.5 * u;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc((i - 1) * 9 * u, 0, 8 * u, Math.PI * 0.15, Math.PI * 1.1);
        ctx.stroke();
      }
      break;
    }
    default:
      ctx.fillStyle = '#ccc';
      ctx.beginPath(); ctx.arc(0, 0, 12 * u, 0, 7); ctx.fill();
  }
  ctx.restore();
}

function drawChef(ctx, x, feetY, walk, carrying, t) {
  const bob = walk > 0 ? Math.abs(Math.sin(walk)) * 4 : Math.sin(t * 2) * 1.5;
  const y = feetY - bob;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath(); ctx.ellipse(x, feetY + 4, 34, 8, 0, 0, 7); ctx.fill();
  // body (apron)
  ctx.fillStyle = '#ffffff';
  rr(ctx, x - 26, y - 62, 52, 58, 14); ctx.fill();
  ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#e4572e';
  ctx.fillRect(x - 26, y - 40, 52, 20);
  // arms
  ctx.fillStyle = '#f6c89f';
  ctx.beginPath(); ctx.arc(x - 28, y - 34, 9, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 28, y - 34, 9, 0, 7); ctx.fill();
  // head
  ctx.fillStyle = '#f6c89f';
  ctx.beginPath(); ctx.arc(x, y - 74, 20, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.stroke();
  // chef hat
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(x - 10, y - 90, 10, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 10, y - 90, 10, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 96, 12, 0, 7); ctx.fill();
  ctx.fillRect(x - 18, y - 92, 36, 8);
  // face
  ctx.fillStyle = '#3a2410';
  ctx.beginPath(); ctx.arc(x - 7, y - 76, 2.2, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 7, y - 76, 2.2, 0, 7); ctx.fill();
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y - 68, 6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // carried item above the hat
  if (carrying) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(x, y - 122, 20, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d9c08a'; ctx.stroke();
    drawIngredient(ctx, INGREDIENTS[carrying.ingredient]?.shape || 'bun', x, y - 122, 30);
  }
}

// --- Screens ----------------------------------------------------------------

function drawTitle(state, ctx, input, ui) {
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // decorative kitchen tiles
  ctx.fillStyle = '#f3d9a4';
  for (let i = 0; i < 8; i++) ctx.fillRect(40 + i * 160, 620, 120, 130);
  // big sign
  ctx.fillStyle = COLORS.red;
  rr(ctx, 240, 60, 800, 150, 24); ctx.fill();
  ctx.strokeStyle = '#b23a17'; ctx.lineWidth = 4; ctx.stroke();
  text(ctx, 'SIZZLE & SERVE', 640, 118, 64, '#fff', 'center');
  text(ctx, 'A fast, funny cooking game — chop, fry, plate, serve!', 640, 172, 22, '#ffe0b2', 'center');
  // food parade
  ['tomato', 'patty', 'cheese', 'fish', 'egg', 'pasta', 'mushroom', 'lemon'].forEach((s, i) => {
    drawIngredient(ctx, INGREDIENTS[s].shape, 300 + i * 95, 260, 64);
  });
  text(ctx, 'Pick a shift:', 640, 330, 24, COLORS.ink, 'center');
  DIFFICULTIES.forEach((d, i) => {
    const x = 290 + i * 240;
    const sel = state.difficultyIndex === i;
    ctx.fillStyle = sel ? '#ffe082' : COLORS.panel;
    rr(ctx, x, 350, 210, 130, 16); ctx.fill();
    ctx.strokeStyle = sel ? COLORS.red : COLORS.panelEdge; ctx.lineWidth = sel ? 4 : 2; ctx.stroke();
    input.button(`diff-${i}`, x, 350, 210, 130, () => { state.difficultyIndex = i; ui.sound.click(); });
    text(ctx, d.name, x + 105, 380, 26, COLORS.ink, 'center');
    text(ctx, d.blurb, x + 105, 410, 15, COLORS.inkSoft, 'center');
    text(ctx, `${d.timeLimit / 60} min  ·  ${d.maxCustomers} customers`, x + 105, 438, 14, COLORS.inkSoft, 'center');
    text(ctx, `★ ${d.starScore[2]} pts for 3 stars`, x + 105, 462, 14, COLORS.inkSoft, 'center');
  });
  button(ctx, input, 'start', 490, 510, 300, 64, '▶  START COOKING', () => ui.onStart(state.difficultyIndex), { size: 24, color: '#2e7d32', hoverColor: '#43a047' });
  button(ctx, input, 'recipes-title', 490, 590, 300, 44, '📖  Recipe Book', () => { state.showRecipes = true; ui.sound.click(); }, { size: 18, color: '#5b8def', hoverColor: '#7aa5f5' });
  const best = state.best;
  text(ctx, best.score ? `Best shift score: ${best.score} pts (${best.dishes || 0} dishes)` : 'No shifts cooked yet — make your first one count!', 640, 672, 18, COLORS.inkSoft, 'center');
  text(ctx, 'Click a station to walk there · Space to use it · 1–5 jump to a station · R recipes · P pause · M mute · X toss', 640, 706, 15, COLORS.inkSoft, 'center');
  text(ctx, 'Chop on the board, fry or boil on the stove, plate it, then click the ticket to serve. Customers leave if kept waiting!', 640, 732, 15, COLORS.inkSoft, 'center');
  if (state.showRecipes) drawRecipeBook(state, ctx, input, ui);
}

function drawEnd(state, ctx, input, ui) {
  const s = state.endStats;
  ctx.fillStyle = 'rgba(30,18,6,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.panel;
  rr(ctx, 290, 70, 700, 640, 24); ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'SHIFT OVER', 640, 118, 40, COLORS.ink, 'center');
  text(ctx, s.reason, 640, 156, 17, COLORS.inkSoft, 'center');
  // stars
  for (let i = 0; i < 3; i++) {
    const x = 560 + i * 80;
    ctx.fillStyle = i < s.stars ? COLORS.gold : '#ddd';
    drawStar(ctx, x, 205, i < s.stars ? 34 : 30);
  }
  text(ctx, `${s.score} points`, 640, 268, 44, COLORS.red, 'center');
  if (s.isRecord) text(ctx, '★ NEW BEST SCORE! ★', 640, 302, 20, '#2e7d32', 'center');
  const rows = [
    ['Dishes served', `${s.dishes}`],
    ['Coins earned', `${s.coins}`],
    ['Customers lost', `${s.strikes}`],
    ['Shift length', `${Math.floor(s.timeUsed / 60)}:${String(s.timeUsed % 60).padStart(2, '0')}`],
    ['Best score ever', `${state.best.score || 0} pts`],
  ];
  rows.forEach(([k, v], i) => {
    text(ctx, k, 420, 350 + i * 30, 18, COLORS.inkSoft, 'left');
    text(ctx, v, 860, 350 + i * 30, 18, COLORS.ink, 'right');
  });
  text(ctx, 'Best per dish (score / fastest serve):', 640, 512, 16, COLORS.inkSoft, 'center');
  DISHES.forEach((d, i) => {
    const b = s.dishBest[d.id];
    const label = b ? `${d.name}: ${b.score} pts / ${b.time < 9999 ? b.time + 's' : '—'}` : `${d.name}: not served yet`;
    text(ctx, label, 640, 536 + i * 20, 15, COLORS.ink, 'center');
  });
  button(ctx, input, 'again', 440, 662, 180, 40, '↻  Cook Again', () => ui.onStart(state.difficultyIndex), { size: 18, color: '#2e7d32', hoverColor: '#43a047' });
  button(ctx, input, 'title', 660, 662, 180, 40, 'Title Screen', () => ui.onTitle(), { size: 18, color: '#5b8def', hoverColor: '#7aa5f5' });
}

function drawStar(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.stroke();
}

// --- Play screen ------------------------------------------------------------

function drawKitchen(state, ctx, input, ui, t) {
  // wall and floor
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.wallTop;
  ctx.fillRect(0, 0, CANVAS_W, 96);
  ctx.fillStyle = '#f3d9a4';
  for (let x = 0; x < CANVAS_W; x += 80) ctx.fillRect(x, 96, 40, 8);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 480, CANVAS_W, 320);
  ctx.fillStyle = COLORS.floorDark;
  for (let x = 0; x < CANVAS_W; x += 120) ctx.fillRect(x, 640, 60, 160);
  // wall decor: menu board + clock
  ctx.fillStyle = '#3a2410';
  rr(ctx, 24, 108, 220, 60, 10); ctx.fill();
  text(ctx, "TODAY'S MENU", 134, 128, 16, '#ffe082', 'center');
  text(ctx, '6 dishes · fresh daily', 134, 150, 13, '#fff', 'center');
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(1200, 140, 26, 0, 7); ctx.fill();
  ctx.strokeStyle = COLORS.ink; ctx.lineWidth = 3; ctx.stroke();
  const ang = ((state.timeLeft / state.difficulty.timeLimit) * Math.PI * 2) - Math.PI / 2;
  ctx.beginPath(); ctx.moveTo(1200, 140); ctx.lineTo(1200 + Math.cos(ang) * 18, 140 + Math.sin(ang) * 18); ctx.stroke();

  // stations
  for (const s of STATIONS) {
    const at = state.chef.station === s.id;
    const hover = input.button(`st-${s.id}`, s.x, s.y, s.w, s.h, () => ui.onStation(s.id));
    ctx.fillStyle = at ? '#fff3c4' : s.color;
    rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
    ctx.strokeStyle = at ? COLORS.red : 'rgba(0,0,0,0.3)'; ctx.lineWidth = at ? 4 : 2; ctx.stroke();
    // counter top
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(s.x + 6, s.y + 6, s.w - 12, 26);
    text(ctx, s.name.toUpperCase(), s.x + s.w / 2, s.y + 20, 15, COLORS.ink, 'center');
    text(ctx, `key ${s.key}`, s.x + 10, s.y + s.h - 12, 12, 'rgba(0,0,0,0.55)', 'left');
    drawStationProps(state, ctx, s, t);
    if (hover && !at) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
    }
  }

  // chef
  drawChef(ctx, state.chef.x, CHEF_LANE_Y + 90, state.chef.walk, state.hand, t);

  // plate on the plating counter
  const plating = STATIONS[3];
  const px = plating.x + plating.w / 2;
  const py = plating.y + 88;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(px, py, 62, 20, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 2; ctx.stroke();
  state.plate.forEach((c, i) => {
    const [ingId] = c.split(':');
    drawIngredient(ctx, INGREDIENTS[ingId].shape, px - 40 + i * 26, py - 14 - (i % 2) * 10, 30);
  });
  if (state.readyDish) {
    const pulse = 1 + Math.sin(t * 6) * 0.08;
    ctx.save();
    ctx.translate(px, py - 58);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = COLORS.greenDark;
    rr(ctx, -52, -16, 104, 32, 16); ctx.fill();
    text(ctx, 'READY!', 0, 1, 17, '#fff', 'center');
    ctx.restore();
  } else if (state.plate.length > 0) {
    const possible = possibleDishes(state.plate);
    text(ctx, possible.length ? `${possible.length} dish${possible.length > 1 ? 'es' : ''} possible` : 'No recipe matches!', px, py + 34, 13, possible.length ? COLORS.inkSoft : COLORS.danger, 'center');
  }

  // inventory bar (bottom)
  ctx.fillStyle = 'rgba(58,36,16,0.85)';
  rr(ctx, 16, 700, 1248, 84, 14); ctx.fill();
  text(ctx, 'INVENTORY — click a station, then use it. Press X to toss what you carry.', 36, 720, 14, '#ffe082', 'left');
  INGREDIENT_LIST.forEach((ing, i) => {
    const x = 36 + i * 100;
    const stock = state.inventory[ing.id] || 0;
    ctx.fillStyle = stock > 0 ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)';
    rr(ctx, x, 730, 88, 44, 8); ctx.fill();
    drawIngredient(ctx, ing.shape, x + 22, 752, 34);
    text(ctx, `×${stock}`, x + 48, 744, 15, stock > 0 ? '#fff' : '#e57373', 'left');
    text(ctx, ing.name, x + 48, 762, 11, '#ffe0b2', 'left');
  });
  // hand indicator
  text(ctx, state.hand ? `Carrying: ${state.hand.label}` : 'Hands empty', 1180, 720, 14, '#fff', 'right');
}

function drawStationProps(state, ctx, s, t) {
  const cx = s.x + s.w / 2;
  const cy = s.y + 88;
  if (s.id === 'pantry') {
    // jars on shelves
    ['#e4572e', '#4caf50', '#f2b705', '#90caf9'].forEach((c, i) => {
      ctx.fillStyle = c;
      rr(ctx, s.x + 22 + i * 42, cy - 26, 30, 40, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillRect(s.x + 26 + i * 42, cy - 18, 22, 8);
    });
  } else if (s.id === 'chopping') {
    ctx.fillStyle = '#f5deb3';
    rr(ctx, cx - 62, cy - 18, 124, 52, 8); ctx.fill();
    ctx.strokeStyle = '#c9a86a'; ctx.stroke();
    const mg = state.minigame;
    if (mg && mg.type === 'chop') {
      drawIngredient(ctx, INGREDIENTS[mg.ingredient].shape, cx - 30, cy + 8, 40);
      ctx.fillStyle = '#cfd8dc';
      ctx.fillRect(cx + 8, cy - 8, 44, 6);
      ctx.fillStyle = '#78909c';
      ctx.beginPath(); ctx.moveTo(cx + 44, cy - 14); ctx.lineTo(cx + 52, cy - 2); ctx.lineTo(cx + 44, cy + 4); ctx.closePath(); ctx.fill();
    } else {
      drawIngredient(ctx, 'tomato', cx - 30, cy + 8, 36);
      drawIngredient(ctx, 'lettuce', cx + 28, cy + 8, 36);
    }
  } else if (s.id === 'stove') {
    // two burners
    [-42, 42].forEach((dx) => {
      ctx.fillStyle = '#37474f';
      ctx.beginPath(); ctx.ellipse(cx + dx, cy + 6, 36, 12, 0, 0, 7); ctx.fill();
    });
    const mg = state.minigame;
    if (mg && mg.type === 'cook') {
      // pan with food + steam
      ctx.fillStyle = '#455a64';
      ctx.beginPath(); ctx.ellipse(cx, cy - 2, 34, 12, 0, 0, 7); ctx.fill();
      drawIngredient(ctx, INGREDIENTS[mg.ingredient].shape, cx, cy - 14, 36);
      const steam = 0.5 + 0.5 * Math.sin(t * 5);
      ctx.fillStyle = `rgba(255,255,255,${0.35 + steam * 0.3})`;
      ctx.beginPath(); ctx.arc(cx - 10, cy - 34 - steam * 8, 6, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 8, cy - 40 - steam * 6, 5, 0, 7); ctx.fill();
      // flame under pan
      ctx.fillStyle = mg.temp > 85 ? '#ff5722' : '#ff9800';
      ctx.beginPath(); ctx.moveTo(cx - 16, cy + 14); ctx.quadraticCurveTo(cx, cy - 6 - Math.sin(t * 9) * 4, cx + 16, cy + 14); ctx.closePath(); ctx.fill();
    } else {
      ctx.fillStyle = '#eceff1';
      ctx.beginPath(); ctx.ellipse(cx - 42, cy - 4, 30, 10, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = '#90a4ae'; ctx.stroke();
    }
  } else if (s.id === 'plating') {
    // plates stack + garnish
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.ellipse(cx - 52, cy + 4, 22, 7, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx - 52, cy - 2, 22, 7, 0, 0, 7); ctx.fill();
    drawIngredient(ctx, 'lemon', cx + 44, cy - 6, 30);
  } else if (s.id === 'serving') {
    // heat lamp + bell
    ctx.fillStyle = '#ff8f00';
    ctx.fillRect(cx - 46, cy - 52, 92, 10);
    ctx.fillStyle = `rgba(255,214,64,${0.5 + 0.3 * Math.sin(t * 4)})`;
    ctx.beginPath(); ctx.moveTo(cx - 40, cy - 42); ctx.lineTo(cx + 40, cy - 42); ctx.lineTo(cx + 22, cy + 10); ctx.lineTo(cx - 22, cy + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath(); ctx.arc(cx, cy + 8, 14, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(cx - 2, cy - 10, 4, 8);
  }
}

function drawTickets(state, ctx, input, ui) {
  // order board: up to maxCustomers tickets
  for (let i = 0; i < state.difficulty.maxCustomers; i++) {
    const x = 24 + i * 212;
    const y = 8;
    const c = state.customers[i];
    ctx.fillStyle = c ? COLORS.ticket : 'rgba(255,255,255,0.35)';
    rr(ctx, x, y, 200, 84, 10); ctx.fill();
    ctx.strokeStyle = c ? '#d9c08a' : 'rgba(0,0,0,0.1)'; ctx.lineWidth = 2; ctx.stroke();
    if (!c) {
      text(ctx, '— waiting —', x + 100, y + 42, 14, COLORS.inkSoft, 'center');
      continue;
    }
    const dish = dishById(c.dishId);
    input.button(`ticket-${c.id}`, x, y, 200, 84, () => ui.onTicket(c.id));
    drawIngredient(ctx, dishComponentsIcon(dish), x + 30, y + 30, 44);
    text(ctx, dish.name, x + 58, y + 20, 14, COLORS.ink, 'left');
    text(ctx, `${Math.ceil(c.patience)}s`, x + 188, y + 20, 14, c.patience < 15 ? COLORS.danger : COLORS.inkSoft, 'right');
    // plate progress: how many components already on the plate
    if (state.plate.length > 0) {
      const have = state.plate.filter((comp) => dish.components.includes(comp)).length;
      text(ctx, `${have}/${dish.components.length} on plate`, x + 58, y + 42, 12, '#2e7d32', 'left');
    } else {
      text(ctx, 'Patience', x + 58, y + 42, 12, COLORS.inkSoft, 'left');
    }
    // patience bar
    const frac = Math.max(0, c.patience / c.maxPatience);
    ctx.fillStyle = '#e0e0e0';
    rr(ctx, x + 12, y + 64, 176, 10, 5); ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.gold : COLORS.danger;
    rr(ctx, x + 12, y + 64, 176 * frac, 10, 5); ctx.fill();
    if (state.readyDish && state.readyDish.id === c.dishId) {
      const pulse = 1 + Math.sin(performance.now() / 150) * 0.06;
      ctx.save();
      ctx.translate(x + 186, y + 42);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = COLORS.greenDark;
      ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill();
      text(ctx, '✓', 0, 1, 12, '#fff', 'center');
      ctx.restore();
    }
  }
}

function dishComponentsIcon(dish) {
  const first = dish.components[0].split(':')[0];
  return INGREDIENTS[first].shape;
}

function drawHUD(state, ctx, input, ui) {
  const mm = Math.floor(state.timeLeft / 60);
  const ss = String(Math.floor(state.timeLeft % 60)).padStart(2, '0');
  const urgent = state.timeLeft < 30;
  text(ctx, `${mm}:${ss}`, 1130, 34, 34, urgent ? COLORS.danger : COLORS.ink, 'right');
  text(ctx, 'TIME LEFT', 1130, 62, 11, COLORS.inkSoft, 'right');
  text(ctx, `Score ${state.score}`, 860, 30, 20, COLORS.ink, 'right');
  text(ctx, `🪙 ${state.coins} coins`, 860, 56, 16, '#8d6e00', 'right');
  text(ctx, `Dishes ${state.dishesServed}   Strikes ${'✖'.repeat(state.strikes)}${'·'.repeat(Math.max(0, 3 - state.strikes))}`, 860, 80, 14, state.strikes > 0 ? COLORS.danger : COLORS.inkSoft, 'right');
  // mute + pause buttons
  button(ctx, input, 'mute', 1216, 8, 52, 34, ui.muted ? '🔇' : '🔊', () => ui.onMute(), { size: 16, color: '#8d6e63', hoverColor: '#a1887f' });
  button(ctx, input, 'pause', 1216, 48, 52, 34, state.paused ? '▶' : '⏸', () => ui.onPause(), { size: 16, color: '#8d6e63', hoverColor: '#a1887f' });
  // recipe book button
  button(ctx, input, 'recipes', 880, 8, 118, 34, '📖 Recipes', () => { state.showRecipes = true; ui.sound.click(); }, { size: 15, color: '#5b8def', hoverColor: '#7aa5f5' });
  if (state.message && state.elapsed < state.messageUntil) {
    ctx.fillStyle = 'rgba(58,36,16,0.88)';
    const w = Math.min(700, 40 + state.message.length * 8.5);
    rr(ctx, 640 - w / 2, 104, w, 34, 17); ctx.fill();
    text(ctx, state.message, 640, 122, 16, '#fff', 'center');
  }
  // floaters
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    text(ctx, f.text, f.x, f.y, 24, f.color, 'center');
    ctx.globalAlpha = 1;
  }
  // particles
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMinigame(state, ctx, input, ui) {
  const mg = state.minigame;
  if (!mg) return;
  ctx.fillStyle = 'rgba(30,18,6,0.5)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.panel;
  rr(ctx, 320, 200, 640, 300, 20); ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge; ctx.lineWidth = 3; ctx.stroke();
  const ing = INGREDIENTS[mg.ingredient];
  if (mg.type === 'chop') {
    text(ctx, `CHOP THE ${ing.name.toUpperCase()}`, 640, 232, 26, COLORS.ink, 'center');
    text(ctx, 'Click (or press Space) when the knife is inside the green zone!', 640, 264, 16, COLORS.inkSoft, 'center');
    drawIngredient(ctx, ing.shape, 640, 320, 72);
    // sweep bar
    ctx.fillStyle = '#e0e0e0';
    rr(ctx, 380, 380, 520, 34, 17); ctx.fill();
    ctx.fillStyle = '#81c784';
    const [z0, z1] = mg.zone;
    ctx.fillRect(380 + 520 * z0, 380, 520 * (z1 - z0), 34);
    const mx = 380 + 520 * mg.marker;
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(mx - 4, 372, 8, 50);
    text(ctx, `Hits: ${mg.hits} / ${mg.needed}`, 640, 448, 20, COLORS.ink, 'center');
    button(ctx, input, 'chop-hit', 540, 460, 200, 40, '🔪  CHOP!', () => ui.onMinigameClick(), { size: 20, color: '#2e7d32', hoverColor: '#43a047' });
  } else {
    const verb = mg.action === 'boil' ? 'BOIL' : 'FRY';
    text(ctx, `${verb} THE ${ing.name.toUpperCase()}`, 640, 232, 26, COLORS.ink, 'center');
    text(ctx, 'Hold mouse / Space to heat — keep the needle in the green zone!', 640, 264, 16, COLORS.inkSoft, 'center');
    drawIngredient(ctx, ing.shape, 640, 320, 72);
    // thermometer
    ctx.fillStyle = '#e0e0e0';
    rr(ctx, 600, 360, 80, 90, 12); ctx.fill();
    ctx.fillStyle = '#81c784';
    ctx.fillRect(600, 360 + 90 * (1 - 0.78), 80, 90 * (0.78 - 0.45));
    const ty = 360 + 90 * (1 - mg.temp / 100);
    ctx.fillStyle = mg.temp > 92 ? COLORS.danger : '#37474f';
    ctx.fillRect(596, ty - 3, 88, 6);
    text(ctx, `${Math.round(mg.temp)}°`, 700, 405, 20, COLORS.ink, 'left');
    // progress bar
    ctx.fillStyle = '#e0e0e0';
    rr(ctx, 420, 470, 440, 22, 11); ctx.fill();
    ctx.fillStyle = COLORS.gold;
    rr(ctx, 420, 470, 440 * (mg.progress / 100), 22, 11); ctx.fill();
    text(ctx, `Cooking… ${Math.floor(mg.progress)}%`, 640, 448, 16, COLORS.ink, 'center');
    if (mg.overheat > 0) text(ctx, '⚠ TOO HOT — release to cool down!', 640, 500, 18, COLORS.danger, 'center');
  }
}

function drawPantry(state, ctx, input, ui) {
  ctx.fillStyle = 'rgba(30,18,6,0.5)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.panel;
  rr(ctx, 240, 110, 800, 560, 20); ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'PANTRY — take what you need, buy what you ran out of', 640, 142, 22, COLORS.ink, 'center');
  text(ctx, `Coins: ${state.coins}   ·   Hands: ${state.hand ? state.hand.label : 'empty'}`, 640, 170, 16, COLORS.inkSoft, 'center');
  INGREDIENT_LIST.forEach((ing, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 270 + col * 195;
    const y = 195 + row * 145;
    const stock = state.inventory[ing.id] || 0;
    ctx.fillStyle = stock > 0 ? '#fff8e7' : '#f5f5f5';
    rr(ctx, x, y, 180, 130, 12); ctx.fill();
    ctx.strokeStyle = COLORS.panelEdge; ctx.lineWidth = 2; ctx.stroke();
    drawIngredient(ctx, ing.shape, x + 34, y + 34, 52);
    text(ctx, ing.name, x + 66, y + 24, 15, COLORS.ink, 'left');
    text(ctx, `Stock ×${stock}`, x + 66, y + 46, 13, stock > 0 ? '#2e7d32' : COLORS.danger, 'left');
    text(ctx, ing.action === 'raw' ? 'ready to plate' : `needs: ${ing.action}`, x + 66, y + 64, 12, COLORS.inkSoft, 'left');
    input.button(`take-${ing.id}`, x, y, 180, 130, () => ui.onTake(ing.id));
    button(ctx, input, `buy-${ing.id}`, x + 14, y + 88, 152, 30, `Buy +1 — ${ing.price} 🪙`, () => ui.onBuy(ing.id), { size: 14, color: '#8d6e00', hoverColor: '#b08d00' });
  });
  button(ctx, input, 'pantry-close', 560, 620, 160, 40, 'Close', () => { state.showPantry = false; ui.sound.click(); }, { size: 18, color: '#8d6e63', hoverColor: '#a1887f' });
}

function drawRecipeBook(state, ctx, input, ui) {
  ctx.fillStyle = 'rgba(30,18,6,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.panel;
  rr(ctx, 180, 60, 920, 660, 20); ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, '📖  RECIPE BOOK', 640, 96, 30, COLORS.ink, 'center');
  text(ctx, 'Every dish needs at least two cooking actions and one timed step. Swap an ingredient to change the dish!', 640, 126, 15, COLORS.inkSoft, 'center');
  DISHES.forEach((d, i) => {
    const y = 150 + i * 88;
    const best = state.dishBest[d.id];
    ctx.fillStyle = i % 2 === 0 ? '#fff8e7' : '#fdf3d0';
    rr(ctx, 210, y, 860, 80, 12); ctx.fill();
    text(ctx, d.name, 230, y + 18, 19, COLORS.ink, 'left');
    text(ctx, d.blurb, 230, y + 42, 13, COLORS.inkSoft, 'left');
    text(ctx, `${d.price} coins on serve · par ${d.par}s`, 230, y + 64, 13, '#8d6e00', 'left');
    dishSteps(d).forEach((step, j) => {
      const ing = INGREDIENTS[step.ingredient];
      drawIngredient(ctx, ing.shape, 700 + j * 56, y + 40, 44);
      text(ctx, step.action, 700 + j * 56, y + 68, 11, COLORS.inkSoft, 'center');
    });
    if (best) text(ctx, `Best: ${best.score} pts / ${best.time < 9999 ? best.time + 's' : '—'}`, 1050, y + 40, 13, '#2e7d32', 'right');
  });
  button(ctx, input, 'recipes-close', 560, 668, 160, 40, 'Close', () => { state.showRecipes = false; ui.sound.click(); }, { size: 18, color: '#8d6e63', hoverColor: '#a1887f' });
}

function drawPaused(state, ctx, input, ui) {
  ctx.fillStyle = 'rgba(30,18,6,0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = COLORS.panel;
  rr(ctx, 440, 300, 400, 200, 20); ctx.fill();
  ctx.strokeStyle = COLORS.panelEdge; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, '⏸ PAUSED', 640, 350, 32, COLORS.ink, 'center');
  text(ctx, 'Take a breath, chef.', 640, 390, 16, COLORS.inkSoft, 'center');
  button(ctx, input, 'resume', 540, 420, 200, 44, 'Resume (P)', () => ui.onPause(), { size: 18, color: '#2e7d32', hoverColor: '#43a047' });
}

// --- Main render ------------------------------------------------------------

export function render(state, ctx, input, ui, t) {
  input.beginFrame();
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (state.screen === 'title') {
    drawTitle(state, ctx, input, ui);
  } else if (state.screen === 'end') {
    // keep the kitchen visible behind the end panel
    drawKitchen(state, ctx, input, ui, t);
    drawTickets(state, ctx, input, ui);
    drawHUD(state, ctx, input, ui);
    drawEnd(state, ctx, input, ui);
  } else {
    drawKitchen(state, ctx, input, ui, t);
    drawTickets(state, ctx, input, ui);
    drawHUD(state, ctx, input, ui);
    if (state.minigame) drawMinigame(state, ctx, input, ui);
    else if (state.showPantry) drawPantry(state, ctx, input, ui);
    else if (state.showRecipes) drawRecipeBook(state, ctx, input, ui);
    else if (state.paused) drawPaused(state, ctx, input, ui);
  }
}
