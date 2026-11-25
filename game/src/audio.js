// Sizzle & Serve — all sound is generated with WebAudio, no audio files.
// 10 sound effects plus a light music loop; a mute toggle silences everything.
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicOn = false;
    this.sizzleNodes = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return !!this.ctx;
  }

  setMuted(m) {
    this.muted = m;
    if (m) this.stopSizzle();
  }

  tone(freq, dur, type = 'sine', vol = 0.15, when = 0, slideTo = null) {
    if (!this.ensure() || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  noise(dur, vol = 0.2, filterFreq = 1200, when = 0) {
    if (!this.ensure() || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterFreq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start(t0);
  }

  click() { this.tone(660, 0.06, 'square', 0.06); }
  pop() { this.tone(420, 0.09, 'sine', 0.14, 0, 880); }
  chop() { this.noise(0.09, 0.3, 2400); this.tone(180, 0.07, 'triangle', 0.12); }
  ding() { this.tone(880, 0.25, 'sine', 0.16); this.tone(1320, 0.3, 'sine', 0.1, 0.05); }
  coin() { this.tone(988, 0.09, 'square', 0.08); this.tone(1319, 0.18, 'square', 0.08, 0.08); }
  error() { this.tone(160, 0.18, 'sawtooth', 0.1, 0, 110); }
  burn() { this.noise(0.35, 0.22, 500); this.tone(220, 0.3, 'sawtooth', 0.1, 0, 90); }
  pour() { this.noise(0.25, 0.12, 3000); }
  pickup() { this.tone(520, 0.08, 'triangle', 0.1, 0, 700); }
  success() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.14, i * 0.09));
  }
  fanfare() {
    [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.14, i * 0.11));
  }
  newOrder() { this.tone(740, 0.12, 'sine', 0.12); this.tone(988, 0.15, 'sine', 0.1, 0.1); }

  startSizzle() {
    if (!this.ensure() || this.muted || this.sizzleNodes) return;
    const len = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = 2500;
    const g = this.ctx.createGain();
    g.gain.value = 0.05;
    src.connect(f).connect(g).connect(this.ctx.destination);
    src.start();
    this.sizzleNodes = { src, g };
  }

  stopSizzle() {
    if (!this.sizzleNodes) return;
    try { this.sizzleNodes.src.stop(); } catch (e) { /* already stopped */ }
    this.sizzleNodes = null;
  }

  // A gentle loop: walking bass + a simple pentatonic melody, one step per 240 ms.
  startMusic() {
    if (this.musicOn || !this.ensure()) return;
    this.musicOn = true;
    const bass = [130.8, 98, 110, 146.8];
    const melody = [523, 587, 659, 784, 659, 587, 523, 440, 523, 659, 784, 880, 784, 659, 587, 523];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const step = this.musicStep++;
      const bar = Math.floor(step / 4) % 4;
      if (step % 4 === 0) this.tone(bass[bar], 0.5, 'triangle', 0.07);
      if (step % 2 === 0) this.tone(melody[step % 16], 0.22, 'sine', 0.045);
    }, 240);
  }

  stopMusic() {
    this.musicOn = false;
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    this.stopSizzle();
  }
}
