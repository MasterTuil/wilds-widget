// Procedural Web Audio sound effects for WILDS.
// No external assets — every sound is synthesized via oscillators + envelopes.

let ctx     = null;
let muted   = false;
let masterGain = null;

function ensureCtx() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);

  try {
    muted = localStorage.getItem('wilds-sfx-muted') === '1';
  } catch {}
}

function osc(type, freq, time, dur, gain = 0.5, freqEnd = null) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, time);
  if (freqEnd !== null) o.frequency.exponentialRampToValueAtTime(Math.max(0.01, freqEnd), time + dur);
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  o.connect(g);
  g.connect(masterGain);
  o.start(time);
  o.stop(time + dur + 0.05);
}

function noise(time, dur, gain = 0.3) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + dur);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1800;
  src.connect(filter); filter.connect(g); g.connect(masterGain);
  src.start(time);
  src.stop(time + dur + 0.05);
}

const SOUNDS = {
  click(t)     { osc('square',   600, t, 0.04, 0.18);                       },
  pet(t)       { osc('triangle', 800, t, 0.18, 0.40, 520);                  },
  feed(t)      { osc('sine',     320, t, 0.16, 0.50, 160);
                 osc('sine',     640, t + 0.06, 0.08, 0.25, 400);           },
  attention(t) { osc('sawtooth', 380, t, 0.22, 0.30, 720);                  },
  train_hit(t) { osc('sine',     900, t, 0.08, 0.45);
                 osc('sine',    1350, t + 0.02, 0.10, 0.20);                },
  levelup(t)   { const n = [523, 659, 784, 1047]; // C E G C
                 n.forEach((f, i) => osc('triangle', f, t + i * 0.08, 0.20, 0.45));
                 noise(t + 0.30, 0.18, 0.10);                                },
  distress(t)  { osc('sine',     220, t, 0.45, 0.40, 180);
                 osc('sine',     180, t + 0.20, 0.35, 0.30, 140);           },
  bathe(t)     { noise(t, 0.35, 0.15);
                 osc('sine',     500, t + 0.10, 0.20, 0.20, 900);           },
};

export const sfx = {
  play(name) {
    if (muted) return;
    ensureCtx();
    const fn = SOUNDS[name];
    if (!fn) return;
    if (ctx.state === 'suspended') ctx.resume();
    fn(ctx.currentTime);
  },

  setMuted(m) {
    ensureCtx();
    muted = !!m;
    try { localStorage.setItem('wilds-sfx-muted', muted ? '1' : '0'); } catch {}
  },

  isMuted() {
    ensureCtx();
    return muted;
  },
};
