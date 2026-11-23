/** Tiny WebAudio helpers: ambient noise beds and soft chimes. No audio files needed. */
let ctx: AudioContext | null = null;
const ac = () => (ctx ??= new AudioContext());

function noiseBuffer(kind: "pink" | "brown") {
  const c = ac();
  const len = c.sampleRate * 4;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (kind === "brown") { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else { b0 = 0.997 * b0 + w * 0.029591; b1 = 0.985 * b1 + w * 0.032534; b2 = 0.95 * b2 + w * 0.048056; d[i] = (b0 + b1 + b2 + w * 0.05) * 0.6; }
  }
  return buf;
}

export type Ambient = "rain" | "wind" | "waves";

export function startAmbient(kind: Ambient): () => void {
  const c = ac();
  void c.resume();
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(kind === "rain" ? "pink" : "brown");
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = kind === "rain" ? "highpass" : "lowpass";
  filter.frequency.value = kind === "rain" ? 800 : kind === "wind" ? 500 : 700;
  const gain = c.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(kind === "rain" ? 0.12 : 0.35, c.currentTime + 1.5);
  let lfo: OscillatorNode | null = null;
  if (kind !== "rain") {
    lfo = c.createOscillator();
    lfo.frequency.value = kind === "waves" ? 0.12 : 0.07;
    const lg = c.createGain();
    lg.gain.value = 0.2;
    lfo.connect(lg).connect(gain.gain);
    lfo.start();
  }
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
  return () => {
    gain.gain.cancelScheduledValues(c.currentTime);
    gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.8);
    setTimeout(() => { src.stop(); lfo?.stop(); }, 900);
  };
}

export function chime(freq = 528) {
  const c = ac();
  void c.resume();
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.8);
  o.connect(g).connect(c.destination);
  o.start();
  o.stop(c.currentTime + 2);
}

/** Soft evolving pad for the Rewind. */
export function startPad(): () => void {
  const c = ac();
  void c.resume();
  const master = c.createGain();
  master.gain.value = 0;
  master.gain.linearRampToValueAtTime(0.06, c.currentTime + 2);
  master.connect(c.destination);
  const notes = [261.63, 329.63, 392, 493.88];
  const oscs = notes.map((f, i) => {
    const o = c.createOscillator();
    o.type = i % 2 ? "triangle" : "sine";
    o.frequency.value = f / 2;
    o.detune.value = (i - 1.5) * 6;
    o.connect(master);
    o.start();
    return o;
  });
  return () => {
    master.gain.linearRampToValueAtTime(0, c.currentTime + 1);
    setTimeout(() => oscs.forEach((o) => o.stop()), 1100);
  };
}
