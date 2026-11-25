// Sizzle & Serve — mouse and keyboard input, canvas-relative.
// The game loop reads a queue of clicks and key presses each frame;
// the renderer registers clickable rectangles so clicks hit buttons.
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0, down: false };
    this.clicks = [];
    this.keys = [];
    this.heldKeys = new Set();
    this.buttons = [];

    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
      this.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
    });
    canvas.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) * (canvas.width / r.width);
      const y = (e.clientY - r.top) * (canvas.height / r.height);
      this.clicks.push({ x, y });
    });
    canvas.addEventListener('mouseup', () => { this.mouse.down = false; });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (!e.repeat) this.keys.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      this.heldKeys.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    window.addEventListener('keyup', (e) => {
      this.heldKeys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    });
    window.addEventListener('blur', () => { this.heldKeys.clear(); this.mouse.down = false; });
  }

  beginFrame() {
    this.buttons = [];
  }

  // Register a clickable rectangle for this frame. Returns true on hover.
  button(id, x, y, w, h, onClick) {
    const hover = this.mouse.x >= x && this.mouse.x <= x + w && this.mouse.y >= y && this.mouse.y <= y + h;
    this.buttons.push({ id, x, y, w, h, onClick, hover });
    return hover;
  }

  // Dispatch queued clicks to the topmost registered button, else return the click.
  dispatchClicks(fallback) {
    for (const c of this.clicks) {
      let hit = false;
      for (let i = this.buttons.length - 1; i >= 0; i--) {
        const b = this.buttons[i];
        if (c.x >= b.x && c.x <= b.x + b.w && c.y >= b.y && c.y <= b.y + b.h) {
          b.onClick(c);
          hit = true;
          break;
        }
      }
      if (!hit && fallback) fallback(c);
    }
    this.clicks = [];
  }

  consumeKeys() {
    const k = this.keys;
    this.keys = [];
    return k;
  }

  isHeld(key) {
    return this.heldKeys.has(key);
  }
}
