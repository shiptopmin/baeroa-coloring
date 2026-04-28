import { useCallback, useRef } from 'react';

// To use external MP3 files instead, import and create Audio objects:
// import drawSfx from '/sounds/draw.mp3';
// const audio = new Audio(drawSfx); audio.play();

export const useSound = () => {
  const ctxRef = useRef(null);
  const drawThrottleRef = useRef(0);

  const ctx = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  };

  const tone = (freq, type, duration, gain, startDelay = 0) => {
    try {
      const ac = ctx();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g);
      g.connect(ac.destination);
      osc.type = type;
      osc.frequency.value = freq;
      const t = ac.currentTime + startDelay;
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.start(t);
      osc.stop(t + duration);
    } catch {}
  };

  // Called during drawing — throttled to avoid audio spam
  const playDraw = useCallback((brushType) => {
    const now = performance.now();
    if (now - drawThrottleRef.current < 120) return;
    drawThrottleRef.current = now;
    try {
      const ac = ctx();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g);
      g.connect(ac.destination);
      const freqMap = { rainbow: 900 + Math.random() * 300, cloud: 500 + Math.random() * 100, crayon: 200 + Math.random() * 80 };
      osc.frequency.value = freqMap[brushType] ?? 600;
      osc.type = brushType === 'crayon' ? 'sawtooth' : 'sine';
      const t = ac.currentTime;
      g.gain.setValueAtTime(0.025, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      osc.start(t);
      osc.stop(t + 0.06);
    } catch {}
  }, []);

  const playColorSelect = useCallback(() => {
    tone(1200, 'sine', 0.08, 0.12);
  }, []);

  const playBrushChange = useCallback(() => {
    tone(600, 'sine', 0.1, 0.2);
    tone(900, 'sine', 0.1, 0.15, 0.08);
  }, []);

  const playMirrorToggle = useCallback((on) => {
    const notes = on ? [523, 659, 784] : [784, 659, 523];
    notes.forEach((f, i) => tone(f, 'sine', 0.18, 0.18, i * 0.09));
  }, []);

  const playPageSelect = useCallback(() => {
    [440, 550, 660].forEach((f, i) => tone(f, 'triangle', 0.2, 0.15, i * 0.07));
  }, []);

  const playPraise = useCallback(() => {
    // Cheerful fanfare: C-E-G-C
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 'triangle', 0.35, 0.28, i * 0.13));
    // Extra sparkle
    [1568, 2093].forEach((f, i) => tone(f, 'sine', 0.2, 0.15, 0.6 + i * 0.1));
  }, []);

  const playClear = useCallback(() => {
    try {
      const ac = ctx();
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g);
      g.connect(ac.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.5);
      g.gain.setValueAtTime(0.18, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.5);
      osc.start();
      osc.stop(ac.currentTime + 0.5);
    } catch {}
  }, []);

  const playLongPressProgress = useCallback(() => {
    tone(300 + Math.random() * 100, 'sine', 0.05, 0.08);
  }, []);

  return { playDraw, playColorSelect, playBrushChange, playMirrorToggle, playPageSelect, playPraise, playClear, playLongPressProgress };
};
