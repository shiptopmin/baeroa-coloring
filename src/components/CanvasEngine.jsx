import { AnimatePresence, motion } from 'framer-motion';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSound } from '../hooks/useSound';
import { useVibration } from '../hooks/useVibration';
import { floodFill } from '../utils/floodFill';

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

const brushRainbow = (ctx, x, y, px, py, hueRef, size) => {
  const dist = Math.hypot(x - px, y - py);
  hueRef.current = (hueRef.current + dist * 3) % 360;
  const hue = hueRef.current;
  const lw = 6 * size;

  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.shadowColor = `hsl(${hue},100%,65%)`;
  ctx.shadowBlur = 10 * size;
  ctx.strokeStyle = `hsl(${hue},100%,58%)`;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();

  if (Math.random() < 0.35) {
    for (let i = 0; i < 2; i++) {
      const spread = 24 * size;
      const sx = x + (Math.random() - 0.5) * spread;
      const sy = y + (Math.random() - 0.5) * spread;
      const sh = (hue + Math.random() * 80 - 40 + 360) % 360;
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = `hsla(${sh},100%,68%,${0.6 + Math.random() * 0.4})`;
      drawStar(ctx, sx, sy, (Math.random() * 5 + 3) * size, (Math.random() * 2 + 1) * size, 4);
      ctx.fill();
      ctx.restore();
    }
  }
};

const brushCloud = (ctx, x, y, color, size) => {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 7; i++) {
    const spread = 20 * size;
    const ox = (Math.random() - 0.5) * spread;
    const oy = (Math.random() - 0.5) * spread;
    const r = (Math.random() * 16 + 10) * size;
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

const brushCrayon = (ctx, x, y, px, py, color, size) => {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const lw = 14 * size;
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(px + i * 2 * size, py + i * 1.5 * size);
    ctx.lineTo(x + i * 2 * size, y + i * 1.5 * size);
    ctx.strokeStyle = hexToRgba(color, 0.28 + Math.abs(i) * 0.04);
    ctx.lineWidth = lw - Math.abs(i) * 3 * size;
    ctx.stroke();
  }
  const steps = Math.max(1, Math.ceil(Math.hypot(x - px, y - py) / 4));
  for (let s = 0; s < steps; s++) {
    const t = s / steps;
    const tx = px + (x - px) * t;
    const ty = py + (y - py) * t;
    const spread = 16 * size;
    for (let j = 0; j < 8; j++) {
      if (Math.random() > 0.45) {
        ctx.fillStyle = hexToRgba(color, Math.random() * 0.18);
        ctx.fillRect(
          tx + (Math.random() - 0.5) * spread,
          ty + (Math.random() - 0.5) * spread,
          (Math.random() * 3 + 1) * size,
          (Math.random() * 3 + 1) * size,
        );
      }
    }
  }
  ctx.restore();
};

const brushEraser = (ctx, x, y, px, py, bgColor, size) => {
  const lw = 28 * size;
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = bgColor || '#ffffff';
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.restore();
};

// ─── constants ────────────────────────────────────────────────────────────────

const CANVAS_W = 1600;
const CANVAS_H = 900;
const STAMP_SIZE = 88;
const MAX_UNDO = 10;

// Brush size multipliers: S, M, L, XL
const SIZE_MAP = { S: 0.6, M: 1, L: 1.8, XL: 3 };

// ─── component ────────────────────────────────────────────────────────────────

export const CanvasEngine = forwardRef(({
  color, brushType, mirrorMode, coloringPage, selectedStamp, brushSize = 'M', bgColor = '#ffffff',
}, ref) => {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const stampStart = useRef(null);
  const hueRef = useRef(0);
  const coloringPageRef = useRef(null);
  const bgColorRef = useRef(bgColor);
  const undoStackRef = useRef([]);
  const [pops, setPops] = useState([]);

  const { playDraw, playStamp, playFill, playUndo } = useSound();
  const vibrate = useVibration();

  // keep bgColorRef in sync
  useEffect(() => { bgColorRef.current = bgColor; }, [bgColor]);

  // ── coloring page ─────────────────────────────────────────────────────────

  const drawPageOnCanvas = useCallback((page) => {
    if (!page) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
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

  // Fill canvas with bgColor helper
  const fillBg = useCallback((ctx, col) => {
    ctx.fillStyle = col || bgColorRef.current || '#ffffff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  // Init white canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    fillBg(ctx, bgColor);
  }, []); // eslint-disable-line

  // When coloring page changes, reset canvas and draw new page
  useEffect(() => {
    coloringPageRef.current = coloringPage;
    const ctx = canvasRef.current.getContext('2d');
    fillBg(ctx, bgColorRef.current);
    if (coloringPage) drawPageOnCanvas(coloringPage);
    undoStackRef.current = [];
  }, [coloringPage, drawPageOnCanvas, fillBg]);

  // When background color changes, repaint bg only (won't erase drawing)
  // We keep this simple: bgColor change only affects future eraser/clear operations.

  // ── undo helpers ──────────────────────────────────────────────────────────

  const pushUndo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const snap = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    undoStackRef.current.push(snap);
    if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
  }, []);

  // ── imperative API ────────────────────────────────────────────────────────

  useImperativeHandle(ref, () => ({
    save() {
      const link = document.createElement('a');
      link.download = `baeroa-art-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    },
    getCanvas() {
      return canvasRef.current;
    },
    clear() {
      pushUndo();
      const ctx = canvasRef.current.getContext('2d');
      fillBg(ctx, bgColorRef.current);
      if (coloringPageRef.current) drawPageOnCanvas(coloringPageRef.current);
    },
    undo() {
      if (!undoStackRef.current.length) return false;
      const snap = undoStackRef.current.pop();
      const ctx = canvasRef.current.getContext('2d');
      ctx.putImageData(snap, 0, 0);
      playUndo();
      vibrate([20, 10, 20]);
      return true;
    },
  }), [drawPageOnCanvas, fillBg, pushUndo, playUndo, vibrate]);

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
    pushUndo();
    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${STAMP_SIZE}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, x, y);
    ctx.restore();
    addPop(x, y, emoji);
    playStamp();
    vibrate([20, 10, 30]);
  }, [selectedStamp, addPop, pushUndo, playStamp, vibrate]);

  // ── brush drawing ─────────────────────────────────────────────────────────

  const sizeMultiplier = SIZE_MAP[brushSize] ?? 1;

  const draw = useCallback((x, y) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const p = last.current ?? { x, y };
    const sz = SIZE_MAP[brushSize] ?? 1;

    const render = (cx, cy, px, py) => {
      if (brushType === 'rainbow') brushRainbow(ctx, cx, cy, px, py, hueRef, sz);
      else if (brushType === 'cloud') brushCloud(ctx, cx, cy, color, sz);
      else if (brushType === 'eraser') brushEraser(ctx, cx, cy, px, py, bgColorRef.current, sz);
      else brushCrayon(ctx, cx, cy, px, py, color, sz);
    };

    render(x, y, p.x, p.y);
    if (mirrorMode) render(CANVAS_W - x, y, CANVAS_W - p.x, p.y);

    last.current = { x, y };
    playDraw(brushType);
    vibrate(5);
  }, [brushType, brushSize, color, mirrorMode, playDraw, vibrate]);

  // ── pointer events ────────────────────────────────────────────────────────

  const onStart = useCallback((e) => {
    e.preventDefault();
    const { x, y } = getCoords(canvasRef.current, e);

    if (brushType === 'fill') {
      // Flood fill on pointer down
      pushUndo();
      const ctx = canvasRef.current.getContext('2d');
      floodFill(ctx, x, y, color, CANVAS_W, CANVAS_H);
      playFill();
      vibrate([30, 10, 30]);
      return;
    }

    if (brushType === 'stamp') {
      stampStart.current = { x, y };
      return;
    }

    pushUndo();
    drawing.current = true;
    last.current = { x, y };
    draw(x, y);
  }, [brushType, color, draw, pushUndo, playFill, vibrate]);

  const onMove = useCallback((e) => {
    e.preventDefault();
    if (brushType === 'stamp' || brushType === 'fill') return;
    if (!drawing.current) return;
    const { x, y } = getCoords(canvasRef.current, e);
    draw(x, y);
  }, [brushType, draw]);

  const onEnd = useCallback((e) => {
    if (brushType === 'stamp') {
      if (!stampStart.current) return;
      try {
        const { x, y } = getCoords(canvasRef.current, e);
        const dist = Math.hypot(x - stampStart.current.x, y - stampStart.current.y);
        if (dist < 80) placeStamp(x, y);
      } catch (_) {}
      stampStart.current = null;
      return;
    }
    drawing.current = false;
    last.current = null;
  }, [brushType, placeStamp]);

  const onLeave = useCallback(() => {
    drawing.current = false;
    last.current = null;
  }, []);

  const onCancel = useCallback(() => {
    stampStart.current = null;
    drawing.current = false;
    last.current = null;
  }, []);

  // ── render ────────────────────────────────────────────────────────────────

  const cursorStyle = () => {
    if (brushType === 'stamp') return 'pointer';
    if (brushType === 'fill') return 'cell';
    if (brushType === 'eraser') return 'cell';
    return 'crosshair';
  };

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
        style={{ cursor: cursorStyle() }}
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
