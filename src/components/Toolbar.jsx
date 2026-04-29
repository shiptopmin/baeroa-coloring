import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
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
  { id: 'rainbow', label: '무지개', emoji: '🌈' },
  { id: 'cloud',   label: '구름',   emoji: '☁️' },
  { id: 'crayon',  label: '크레파스', emoji: '🖍️' },
  { id: 'stamp',   label: '스탬프',  emoji: '🎯' },
];

const STAMPS = [
  { id: 'star',    emoji: '⭐' },
  { id: 'heart',   emoji: '❤️' },
  { id: 'dog',     emoji: '🐶' },
  { id: 'cat',     emoji: '🐱' },
  { id: 'poop',    emoji: '💩' },
  { id: 'flower',  emoji: '🌸' },
  { id: 'rainbow', emoji: '🌈' },
  { id: 'candy',   emoji: '🍭' },
  { id: 'dino',    emoji: '🦕' },
  { id: 'unicorn', emoji: '🦄' },
];

const LONG_PRESS_MS = 3000;

// ─── sub-components ───────────────────────────────────────────────────────────

const ColorSwatch = ({ c, selected, onSelect }) => (
  <motion.button
    className="rounded-full border-4 shadow-md flex-shrink-0"
    style={{
      width: 36, height: 36,
      background: c,
      borderColor: selected ? '#FF6B9D' : c === '#FFFFFF' ? '#ddd' : c,
      boxShadow: selected ? '0 0 0 3px #FF6B9D' : undefined,
    }}
    whileTap={{ scale: 0.8 }}
    whileHover={{ scale: 1.18 }}
    onPointerDown={() => onSelect(c)}
  />
);

const ToolBtn = ({ emoji, label, active, onClick, children }) => (
  <motion.button
    className={`flex flex-col items-center justify-center rounded-2xl p-1.5 gap-0.5 w-full
      ${active ? 'bg-pink-100 ring-2 ring-pink-400' : 'bg-white/70 hover:bg-white'} shadow`}
    whileTap={{ scale: 0.88 }}
    whileHover={{ scale: 1.06 }}
    onClick={onClick}
  >
    {children ?? <span className="text-xl leading-none">{emoji}</span>}
    <span className="text-[9px] font-black text-gray-600 leading-none">{label}</span>
  </motion.button>
);

const ClearBtn = ({ onClear }) => {
  const [progress, setProgress] = useState(0);
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
    setProgress(0);
  }, []);

  const r = 16;
  const circ = 2 * Math.PI * r;

  return (
    <motion.button
      className="flex flex-col items-center justify-center rounded-2xl p-1.5 gap-0.5 w-full bg-white/70 shadow select-none"
      style={{ WebkitUserSelect: 'none' }}
      whileTap={{ scale: 0.92 }}
      onPointerDown={startPress}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      <div className="relative w-9 h-9">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4"/>
          <circle cx="20" cy="20" r={r} fill="none"
            stroke={progress > 0 ? '#EF4444' : '#d1d5db'} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
            strokeLinecap="round" style={{ transition: 'none' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xl">🗑️</span>
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
  selectedStamp, setSelectedStamp,
  onSave, onClear,
}) => {
  const [showPages, setShowPages] = useState(false);
  const [showStamps, setShowStamps] = useState(false);
  const { playColorSelect, playBrushChange, playMirrorToggle, playPageSelect } = useSound();
  const vibrate = useVibration();

  const handleColor = (c) => {
    setColor(c); playColorSelect(); vibrate(15);
    // Switch away from stamp when picking color
    if (brushType === 'stamp') setBrushType('crayon');
  };

  const handleBrush = (id) => {
    setBrushType(id); playBrushChange(); vibrate(20);
    if (id === 'stamp') setShowStamps(true);
    else setShowStamps(false);
  };

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

  const handleStamp = (s) => {
    setSelectedStamp(s.emoji);
    playBrushChange();
    vibrate(20);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-pink-50 to-purple-50 border-r-4 border-pink-200 px-2 py-2 gap-1.5 overflow-y-auto select-none"
      style={{ width: 88 }}>

      {/* App icon */}
      <motion.div className="text-3xl text-center leading-none mb-0.5"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}>
        🎨
      </motion.div>

      {/* Color palette */}
      <div className="grid grid-cols-2 gap-1 justify-items-center">
        {COLORS.map(c => (
          <ColorSwatch key={c} c={c} selected={color === c} onSelect={handleColor} />
        ))}
      </div>

      <div className="border-t-2 border-pink-200 my-0.5" />

      {/* Brush selector */}
      <p className="text-[9px] font-black text-pink-400 text-center">브러시</p>
      <div className="flex flex-col gap-1">
        {BRUSHES.map(b => (
          <ToolBtn key={b.id} emoji={b.emoji} label={b.label} active={brushType === b.id}
            onClick={() => handleBrush(b.id)} />
        ))}
      </div>

      {/* Stamp picker — shown when stamp mode active */}
      <AnimatePresence>
        {brushType === 'stamp' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[9px] font-black text-purple-400 text-center mt-0.5">스탬프</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {STAMPS.map(s => (
                <motion.button
                  key={s.id}
                  className={`text-xl rounded-xl p-1 border-2 leading-none
                    ${selectedStamp === s.emoji ? 'border-pink-400 bg-pink-100' : 'border-transparent bg-white/60'}`}
                  whileTap={{ scale: 0.82 }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => handleStamp(s)}
                >
                  {s.emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t-2 border-pink-200 my-0.5" />

      {/* Mirror mode */}
      <ToolBtn emoji="🪞" label="거울" active={mirrorMode} onClick={handleMirror}>
        <motion.span className="text-xl leading-none"
          animate={mirrorMode ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}>🪞</motion.span>
      </ToolBtn>

      {/* Coloring page selector — inline expansion (no popup, avoids overflow-x clipping on mobile) */}
      <ToolBtn emoji="📖" label="색칠판" active={!!coloringPage || showPages}
        onClick={() => setShowPages(v => !v)} />

      <AnimatePresence>
        {showPages && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[9px] font-black text-pink-400 text-center mt-0.5">밑그림</p>
            <div className="flex flex-col gap-1 mt-1">
              {/* No outline */}
              <motion.button
                className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 border-2 w-full
                  ${!coloringPage ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white/60'}`}
                whileTap={{ scale: 0.93 }}
                onClick={() => { setColoringPage(null); setShowPages(false); }}
              >
                <span className="text-lg leading-none">✏️</span>
                <span className="text-[10px] font-bold text-gray-600">자유롭게</span>
              </motion.button>
              {coloringPages.map(p => (
                <motion.button
                  key={p.id}
                  className={`flex items-center gap-1.5 rounded-xl px-2 py-1.5 border-2 w-full
                    ${coloringPage?.id === p.id ? 'border-pink-400 bg-pink-50' : 'border-gray-200 bg-white/60'}`}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => handlePage(p)}
                >
                  <span className="text-lg leading-none">{p.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-600">{p.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" />

      {/* Save */}
      <motion.button
        className="flex flex-col items-center justify-center rounded-2xl p-1.5 gap-0.5 w-full bg-yellow-100 shadow ring-2 ring-yellow-300"
        whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
        onClick={onSave}
      >
        <motion.span className="text-xl leading-none"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}>📸</motion.span>
        <span className="text-[9px] font-black text-yellow-700">저장</span>
      </motion.button>

      {/* Clear (long press) */}
      <ClearBtn onClear={onClear} />
    </div>
  );
};
