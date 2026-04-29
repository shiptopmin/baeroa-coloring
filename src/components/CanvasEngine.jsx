import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { useVibration } from '../hooks/useVibration';

// ─── helpers ─────────────────────────────────────────────────────────────────

const hexToRgba = (hex, a = 1) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

const getCoords = (canvas, e) => {
  const rect = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return {
    x: ((src.clientX - rect.left) / rect.width) * canvas.width,
    y: ((src.clientY - rect.top) / rect.height) * canvas.height,
  };
};

const drawStar = (ctx, cx, cy, r1, r2, pts) => {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = (i * Math.PI) / pts - Math.PI / 2;
    ctx[i === 0 ? 'moveTo' : 'lineTo'](cx + r * Math.cos(a), cy + r * Math.sin(a));
  }
  ctx.closePath();
};

// ─── brush renderers ──────────────────────────────────────────────────────────

const brushRainbow = (ctx, x, y, px, py, hueRef) => {
  const dist = Math.hypot(x - px, y - py);
  hueRef.current = (hueRef.current + dist * 3) % 360;
  const hue = hueRef.current;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowColor = `hsl(${hue},100%,65%)`;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = `hsl(${hue},100%,58%)`;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();

  if (Math.random() < 0.35) {
    for (let i = 0; i < 2; i++) {
      const sx = x + (Math.random() - 0.5) * 32;
      const sy = y + (Math.random() - 0.5) * 32;
      const sh = (hue + Math.random() * 80 - 40 + 360) % 360;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `hsla(${sh},100%,68%,${0.6 + Math.random() * 0.4})`;
      drawStar(ctx, sx, sy, Math.random() * 5 + 3, Math.random() * 2 + 1, 4);
      ctx.fill();
      ctx.restore();
    }
  }
};

const brushCloud = (ctx, x, y, color) => {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) {
    const ox = (Math.random() - 0.5) * 28;
    const oy = (Math.random() - 0.5) * 28;
    const r = Math.random() * 20 + 12;
    const grad = ctx.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r);
    grad.addColorStop(0, hexToRgba(color, 0.14));
    grad.addColorStop(1, hexToRgba(color, 0));
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
};

const brushCrayon = (ctx, x, y, px, py, color) => {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(px + i * 2.5, py + i * 1.5);
    ctx.lineTo(x + i * 2.5, y + i * 1.5);
    ctx.strokeStyle = hexToRgba(color, 0.28 + Math.abs(i) * 0.04);
    ctx.lineWidth = 18 - Math.abs(i) * 4;
    ctx.stroke();
  }
  const steps = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / 4));
  for (let s = 0; s < steps; s++) {
    const t = s / steps;
    const tx = px + (x - px) * t;
    const ty = py + (y - py) * t;
    for (let j = 0; j < 8; j++) {
      if (Math.random() > 0.45) {
        ctx.fillStyle = hexToRgba(color, Math.random() * 0.18);
        ctx.fillRect(tx + (Math.random() - 0.5) * 20, ty + (Math.random() - 0.5) * 20, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }
    }
  }
  ctx.restore();
};

// ─── constants ────────────────────────────────────────────────────────────────

const CANVAS_W = 1600;
const CANVAS_H = 900;
const STAMP_SIZE = 88; // emoji size in canvas pixels

// ─── component ────────────────────────────────────────────────────────────────

export const CanvasEngine = forwardRef(({ color, brushType, mirrorMode, coloringPage, selectedStamp }, ref) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const stampStart = useRef(null);
  const hueRef = useRef(0);
  const coloringPageRef = useRef(null);
  const [pops, setPops] = useState([]);

  const { playDraw } = useSound();
  const vibrate = useVibration();

  // ── coloring page ─────────────────────────────────────────────────────────

  const drawPageOnCanvas = useCallback((page) => {
    if (!page) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      // SVG reports 0 for naturalWidth/Height in some browsers when using data URL
      // Use the viewBox aspect from the SVG src string instead
      const vwMatch = page.src.match(/viewBox%3D%220%200%20([\d.]+)%20([\d.]+)%22/);
      const aspect = vwMatch
        ? parseFloat(vwMatch[1]) / parseFloat(vwMatch[2])
        : (img.naturalWidth || 400) / (img.naturalHeight || 500);

      let dw = CANVAS_W * 0.76;
      let dh = dw / aspect;
      if (dh > CANVAS_H * 0.9) { dh = CANVAS_H * 0.9; dw = dh * aspect; }
      const dx = (CANVAS_W - dw) / 2;
      const dy = (CANVAS_H - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);
    };
    img.onerror = () => console.warn('SVG load failed for', page.id);
    img.src = page.src;
  }, []);

  // Init white canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  // When coloring page changes, reset canvas and draw new page
  useEffect(() => {
    coloringPageRef.current = coloringPage;
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (coloringPage) drawPageOnCanvas(coloringPage);
  }, [coloringPage, drawPageOnCanvas]);

  // ── imperative API ────────────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    save() {
      const link = document.createElement('a');
      link.download = `baeroa-art-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    },
    clear() {
      const ctx = canvasRef.current.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      if (coloringPageRef.current) drawPageOnCanvas(coloringPageRef.current);
    },
  }), [drawPageOnCanvas]);

  // ── stamp ─────────────────────────────────────────────────────────────────

  const addPop = useCallback((canvasX, canvasY, emoji) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = (canvasX / CANVAS_W) * rect.width;
    const screenY = (canvasY / CANVAS_H) * rect.height;
    const id = Date.now() + Math.random();
    setPops(prev => [...prev, { id, x: screenX, y: screenY, emoji }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 900);
  }, []);

  const placeStamp = useCallback((x, y) => {
    const emoji = selectedStamp || '⭐';
    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${STAMP_SIZE}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
    ctx.restore();
    addPop(x, y, emoji);
    vibrate([20, 10, 30]);
  }, [selectedStamp, addPop, vibrate]);

  // ── brush drawing ─────────────────────────────────────────────────────────

  const draw = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const p = last.current ?? { x, y };

    const render = (cx, cy, px, py) => {
      if (brushType === 'rainbow') brushRainbow(ctx, cx, cy, px, py, hueRef);
      else if (brushType === 'cloud') brushCloud(ctx, cx, cy, color);
      else brushCrayon(ctx, cx, cy, px, py, color);
    };

    render(x, y, p.x, p.y);
    if (mirrorMode) render(CANVAS_W - x, y, CANVAS_W - p.x, p.y);

    last.current = { x, y };
    playDraw(brushType);
    vibrate(5);
  }, [brushType, color, mirrorMode, playDraw, vibrate]);

  // ── pointer events ────────────────────────────────────────────────────────

  const onStart = useCallback((e) => {
    e.preventDefault();
    const { x, y } = getCoords(canvasRef.current, e);

    if (brushType === 'stamp') {
      stampStart.current = { x, y };
      return;
    }

    drawing.current = true;
    last.current = { x, y };
    draw(x, y);
  }, [brushType, draw]);

  const onMove = useCallback((e) => {
    e.preventDefault();
    if (brushType === 'stamp') return;
    if (!drawing.current) return;
    const { x, y } = getCoords(canvasRef.current, e);
    draw(x, y);
  }, [brushType, draw]);

  const onEnd = useCallback((e) => {
    if (brushType === 'stamp') {
      if (!stampStart.current) return;
      try {
        const { x, y } = getCoords(canvasRef.current, e);
        // Use 80 canvas-px threshold (≈ 35 screen-px on typical tablet)
        const dist = Math.hypot(x - stampStart.current.x, y - stampStart.current.y);
        if (dist < 80) placeStamp(x, y);
      } catch (_) {}
      stampStart.current = null;
      return;
    }
    drawing.current = false;
    last.current = null;
  }, [brushType, placeStamp]);

  // pointerleave: stop DRAWING only — do NOT clear stampStart.
  // On mobile, pointerleave can fire before pointerup when finger lifts,
  // so we must let pointerup handle stamp placement.
  const onLeave = useCallback(() => {
    drawing.current = false;
    last.current = null;
  }, []);

  // pointercancel: hard cancel (e.g. system interruption) — clear everything.
  const onCancel = useCallback(() => {
    stampStart.current = null;
    drawing.current = false;
    last.current = null;
  }, []);

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full overflow-hidden">
      {mirrorMode && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-pink-400/40 pointer-events-none z-10" />
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ cursor: brushType === 'stamp' ? 'pointer' : 'crosshair' }}
        onPointerDown={onStart}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerLeave={onLeave}
        onPointerCancel={onCancel}
      />

      {/* Stamp pop animations */}
      <AnimatePresence>
        {pops.map(pop => (
          <motion.div
            key={pop.id}
            className="absolute pointer-events-none select-none z-20"
            style={{ left: pop.x, top: pop.y, fontSize: 56, lineHeight: 1 }}
            initial={{ scale: 0.2, x: '-50%', y: '-50%', opacity: 1 }}
            animate={{ scale: 2.8, x: '-50%', y: '-120%', opacity: 0 }}
            exit={{}}
            transition={{ duration: 0.65, ease: [0.22, 1.5, 0.36, 1] }}
          >
            {pop.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

CanvasEngine.displayName = 'CanvasEngine';
