import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
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

  // sparkle stars
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
  // 3 slightly offset strokes for waxy texture
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(px + i * 2.5, py + i * 1.5);
    ctx.lineTo(x + i * 2.5, y + i * 1.5);
    ctx.strokeStyle = hexToRgba(color, 0.28 + Math.abs(i) * 0.04);
    ctx.lineWidth = 18 - Math.abs(i) * 4;
    ctx.stroke();
  }
  // grain texture dots
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

// ─── component ────────────────────────────────────────────────────────────────

const CANVAS_W = 1600;
const CANVAS_H = 900;

export const CanvasEngine = forwardRef(({ color, brushType, mirrorMode, coloringPage }, ref) => {
  const canvasRef = useRef(null);      // drawing layer
  const overlayRef = useRef(null);     // coloring page outlines on top
  const drawing = useRef(false);
  const last = useRef(null);
  const hueRef = useRef(0);
  const bgImageRef = useRef(null);
  const { playDraw } = useSound();
  const vibrate = useVibration();

  // expose save() and clear() to parent
  useImperativeHandle(ref, () => ({
    save() {
      const out = document.createElement('canvas');
      out.width = CANVAS_W;
      out.height = CANVAS_H;
      const oc = out.getContext('2d');
      oc.fillStyle = '#fff';
      oc.fillRect(0, 0, CANVAS_W, CANVAS_H);
      oc.drawImage(canvasRef.current, 0, 0);
      if (bgImageRef.current) oc.drawImage(overlayRef.current, 0, 0);
      const link = document.createElement('a');
      link.download = `my-art-${Date.now()}.png`;
      link.href = out.toDataURL('image/png');
      link.click();
    },
    clear() {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    },
  }));

  // draw coloring page outline on the overlay canvas
  useEffect(() => {
    const canvas = overlayRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    if (!coloringPage) {
      bgImageRef.current = null;
      return;
    }
    const img = new Image();
    img.onload = () => {
      bgImageRef.current = img;
      // center the SVG on the canvas
      const aspect = img.naturalWidth / img.naturalHeight || 1;
      let dw = CANVAS_W * 0.7;
      let dh = dw / aspect;
      if (dh > CANVAS_H * 0.85) { dh = CANVAS_H * 0.85; dw = dh * aspect; }
      const dx = (CANVAS_W - dw) / 2;
      const dy = (CANVAS_H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    };
    img.src = coloringPage.src;
  }, [coloringPage]);

  // init drawing canvas
  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

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

    if (mirrorMode) {
      // mirror across vertical centre
      render(CANVAS_W - x, y, CANVAS_W - p.x, p.y);
    }

    last.current = { x, y };
    playDraw(brushType);
    vibrate(5);
  }, [brushType, color, mirrorMode, playDraw, vibrate]);

  const onStart = useCallback((e) => {
    e.preventDefault();
    drawing.current = true;
    const { x, y } = getCoords(canvasRef.current, e);
    last.current = { x, y };
    draw(x, y);
  }, [draw]);

  const onMove = useCallback((e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const { x, y } = getCoords(canvasRef.current, e);
    draw(x, y);
  }, [draw]);

  const onEnd = useCallback(() => {
    drawing.current = false;
    last.current = null;
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Mirror line indicator */}
      {mirrorMode && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-px w-0.5 bg-pink-400/40 pointer-events-none z-10" />
      )}

      {/* Drawing canvas (bottom) */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="absolute inset-0 w-full h-full touch-none"
        style={{ cursor: 'crosshair' }}
        onPointerDown={onStart}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerLeave={onEnd}
        onPointerCancel={onEnd}
      />

      {/* Coloring page overlay (top, pointer-events none) */}
      <canvas
        ref={overlayRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
});

CanvasEngine.displayName = 'CanvasEngine';
