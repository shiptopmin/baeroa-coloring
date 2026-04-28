import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { coloringPages } from '../utils/coloringPages';
import { useSound } from '../hooks/useSound';
import { useVibration } from '../hooks/useVibration';

const COLORS = [
  '#FF3B3B', '#FF8C00', '#FFD700', '#32CD32',
  '#1E90FF', '#9B59B6', '#FF69B4', '#A0522D',
  '#FFFFFF', '#222222', '#00CED1', '#FF6347',
  '#98FB98', '#DDA0DD', '#87CEEB', '#FFA07A',
  '#40E0D0', '#F0E68C',
];

const BRUSHES = [
  { id: 'rainbow', label: '무지개', emoji: '🌈', tip: '반짝이 무지개펜' },
  { id: 'cloud',   label: '구름',   emoji: '☁️', tip: '몽글몽글 구름' },
  { id: 'crayon',  label: '크레파스', emoji: '🖍️', tip: '크레파스 질감' },
];

const LONG_PRESS_MS = 3000;

// ─── sub-components ───────────────────────────────────────────────────────────

const ColorSwatch = ({ c, selected, onSelect }) => (
  <motion.button
    className="rounded-full border-4 shadow-md flex-shrink-0"
    style={{
      width: 38, height: 38,
      background: c,
      borderColor: selected ? '#FF6B9D' : c === '#FFFFFF' ? '#ddd' : c,
      boxShadow: selected ? '0 0 0 3px #FF6B9D, 0 2px 8px rgba(0,0,0,0.2)' : undefined,
    }}
    whileTap={{ scale: 0.8 }}
    whileHover={{ scale: 1.18 }}
    onPointerDown={() => onSelect(c)}
  />
);

const ToolBtn = ({ emoji, label, active, onClick, children }) => (
  <motion.button
    className={`flex flex-col items-center justify-center rounded-2xl p-2 gap-0.5 w-full
      ${active ? 'bg-pink-100 ring-2 ring-pink-400' : 'bg-white/70 hover:bg-white'} shadow`}
    whileTap={{ scale: 0.88 }}
    whileHover={{ scale: 1.06 }}
    onClick={onClick}
  >
    {children ?? <span className="text-2xl leading-none">{emoji}</span>}
    <span className="text-[10px] font-black text-gray-600 leading-none">{label}</span>
  </motion.button>
);

// Long-press clear button with radial progress ring
const ClearBtn = ({ onClear }) => {
  const [progress, setProgress] = useState(0); // 0–1
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const { playLongPressProgress, playClear } = useSound();
  const vibrate = useVibration();

  const startPress = useCallback((e) => {
    e.preventDefault();
    startRef.current = performance.now();
    const tick = () => {
      const p = Math.min((performance.now() - startRef.current) / LONG_PRESS_MS, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
        if (Math.random() < 0.05) { playLongPressProgress(); vibrate(10); }
      } else {
        playClear(); vibrate([50, 30, 80]);
        onClear();
        setProgress(0);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onClear, playClear, playLongPressProgress, vibrate]);

  const cancel = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
    setProgress(0);
  }, []);

  const r = 18;
  const circ = 2 * Math.PI * r;

  return (
    <motion.button
      className="flex flex-col items-center justify-center rounded-2xl p-2 gap-0.5 w-full bg-white/70 shadow select-none"
      style={{ WebkitUserSelect: 'none' }}
      whileTap={{ scale: 0.92 }}
      onPointerDown={startPress}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      <div className="relative w-10 h-10">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4"/>
          <circle
            cx="22" cy="22" r={r} fill="none"
            stroke={progress > 0 ? '#EF4444' : '#d1d5db'} strokeWidth="4"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: 'none' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-2xl">🗑️</span>
      </div>
      <span className="text-[9px] font-black text-red-400 leading-none">꾹 눌러!</span>
    </motion.button>
  );
};

// ─── main Toolbar ─────────────────────────────────────────────────────────────

export const Toolbar = ({
  color, setColor,
  brushType, setBrushType,
  mirrorMode, setMirrorMode,
  coloringPage, setColoringPage,
  onSave, onClear,
}) => {
  const [showPages, setShowPages] = useState(false);
  const { playColorSelect, playBrushChange, playMirrorToggle, playPageSelect } = useSound();
  const vibrate = useVibration();

  const handleColor = (c) => { setColor(c); playColorSelect(); vibrate(15); };
  const handleBrush = (id) => { setBrushType(id); playBrushChange(); vibrate(20); };
  const handleMirror = () => {
    const next = !mirrorMode;
    setMirrorMode(next);
    playMirrorToggle(next);
    vibrate(next ? [20, 10, 20] : 15);
  };
  const handlePage = (p) => {
    setColoringPage(coloringPage?.id === p.id ? null : p);
    setShowPages(false);
    playPageSelect();
    vibrate(25);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-pink-50 to-purple-50 border-r-4 border-pink-200 px-2 py-3 gap-2 overflow-y-auto select-none"
      style={{ width: 90 }}>

      {/* App icon */}
      <motion.div
        className="text-4xl text-center leading-none mb-1"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
      >🎨</motion.div>

      {/* Color palette */}
      <div className="grid grid-cols-2 gap-1.5 justify-items-center">
        {COLORS.map(c => (
          <ColorSwatch key={c} c={c} selected={color === c} onSelect={handleColor} />
        ))}
      </div>

      <div className="border-t-2 border-pink-200 my-1" />

      {/* Brush selector */}
      <p className="text-[9px] font-black text-pink-400 text-center">브러시</p>
      <div className="flex flex-col gap-1">
        {BRUSHES.map(b => (
          <ToolBtn key={b.id} emoji={b.emoji} label={b.label} active={brushType === b.id}
            onClick={() => handleBrush(b.id)} />
        ))}
      </div>

      <div className="border-t-2 border-pink-200 my-1" />

      {/* Mirror mode toggle */}
      <ToolBtn emoji="🪞" label="거울" active={mirrorMode} onClick={handleMirror}>
        <motion.span
          className="text-2xl leading-none"
          animate={mirrorMode ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >🪞</motion.span>
      </ToolBtn>

      {/* Coloring page selector */}
      <div className="relative">
        <ToolBtn emoji="📖" label="색칠판" active={!!coloringPage || showPages}
          onClick={() => setShowPages(v => !v)} />

        <AnimatePresence>
          {showPages && (
            <motion.div
              className="absolute left-full ml-2 top-0 bg-white rounded-2xl shadow-2xl border-2 border-pink-200 p-2 z-50"
              style={{ width: 220 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <p className="text-xs font-black text-pink-500 mb-2 text-center">밑그림 선택</p>
              <div className="grid grid-cols-2 gap-2">
                {/* No outline option */}
                <motion.button
                  className={`rounded-xl p-2 text-center border-2 text-sm font-bold
                    ${!coloringPage ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-gray-50'}`}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => { setColoringPage(null); setShowPages(false); }}
                >
                  <div className="text-2xl mb-1">✏️</div>
                  <div className="text-[11px] text-gray-600">자유롭게</div>
                </motion.button>
                {coloringPages.map(p => (
                  <motion.button
                    key={p.id}
                    className={`rounded-xl p-2 text-center border-2 font-bold
                      ${coloringPage?.id === p.id ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-gray-50'}`}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handlePage(p)}
                  >
                    <div className="text-2xl mb-1">{p.emoji}</div>
                    <div className="text-[11px] text-gray-600">{p.label}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1" />

      {/* Save button */}
      <motion.button
        className="flex flex-col items-center justify-center rounded-2xl p-2 gap-0.5 w-full bg-yellow-100 shadow ring-2 ring-yellow-300"
        whileTap={{ scale: 0.85 }}
        whileHover={{ scale: 1.08 }}
        onClick={onSave}
      >
        <motion.span
          className="text-2xl leading-none"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >📸</motion.span>
        <span className="text-[10px] font-black text-yellow-700">저장</span>
      </motion.button>

      {/* Clear button (long press) */}
      <ClearBtn onClear={onClear} />
    </div>
  );
};
