import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
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

const BG_COLORS = [
  '#ffffff', '#FFF9E6', '#E8F5E9', '#E3F2FD',
  '#FCE4EC', '#EDE7F6', '#FBE9E7', '#E0F7FA',
];

const BRUSHES = [
  { id: 'rainbow', label: '무지개', emoji: '🌈' },
  { id: 'cloud',   label: '구름',   emoji: '☁️' },
  { id: 'crayon',  label: '크레파스', emoji: '🖍️' },
  { id: 'eraser',  label: '지우개', emoji: '⬜' },
  { id: 'fill',    label: '채우기', emoji: '🪣' },
  { id: 'stamp',   label: '스탬프',  emoji: '🎯' },
];

const SIZES = ['S', 'M', 'L', 'XL'];

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

// ─── sub-components ───────────────────────────────────────────────────────────

const ColorSwatch = ({ c, selected, onSelect, size = 32 }) => (
  <motion.button
    className="rounded-full border-4 shadow-md flex-shrink-0"
    style={{
      width: size, height: size,
      background: c,
      borderColor: selected ? '#FF6B9D' : c === '#FFFFFF' || c === '#ffffff' ? '#ddd' : c,
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

// ─── main Toolbar ─────────────────────────────────────────────────────────────

export const Toolbar = ({
  color, setColor,
  brushType, setBrushType,
  brushSize, setBrushSize,
  mirrorMode, setMirrorMode,
  coloringPage, setColoringPage,
  selectedStamp, setSelectedStamp,
  bgColor, setBgColor,
  onSave, onClear, onUndo, onHome, onGallery, onPageSelect,
}) => {
  const [showPages, setShowPages] = useState(false);
  const [showStamps, setShowStamps] = useState(false);
  const [showBgColors, setShowBgColors] = useState(false);

  const { playColorSelect, playBrushChange, playMirrorToggle, playPageSelect, playClear, playHome } = useSound();
  const vibrate = useVibration();

  const handleColor = (c) => {
    setColor(c); playColorSelect(); vibrate(15);
    if (brushType === 'stamp' || brushType === 'fill' || brushType === 'eraser') setBrushType('crayon');
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

  const handlePageRequest = (p) => {
    setShowPages(false);
    onPageSelect(p);  // lift to App for confirmation dialog
  };

  const handleStamp = (s) => {
    setSelectedStamp(s.emoji);
    playBrushChange();
    vibrate(20);
  };

  const handleClear = () => {
    onClear();
    playClear();
    vibrate([50, 30, 80]);
  };

  const handleHome = () => {
    onHome();
    playHome();
    vibrate(20);
  };

  return (
    <div
      className="flex flex-col h-full bg-gradient-to-b from-pink-50 to-purple-50 border-r-4 border-pink-200 px-2 py-2 gap-1.5 overflow-y-auto select-none"
      style={{ width: 88 }}
    >
      {/* App icon */}
      <motion.div
        className="text-2xl text-center leading-none"
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
      >
        🎨
      </motion.div>

      {/* Home + Gallery row */}
      <div className="grid grid-cols-2 gap-1">
        <ToolBtn emoji="🏠" label="홈" onClick={handleHome} />
        <ToolBtn emoji="🖼️" label="갤러리" onClick={onGallery} />
      </div>

      <div className="border-t-2 border-pink-200 my-0.5" />

      {/* Color palette */}
      <div className="grid grid-cols-2 gap-1 justify-items-center">
        {COLORS.map(c => (
          <ColorSwatch key={c} c={c} selected={color === c && brushType !== 'eraser'} onSelect={handleColor} />
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

      {/* Stamp picker */}
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

      {/* Brush size */}
      <p className="text-[9px] font-black text-pink-400 text-center">크기</p>
      <div className="grid grid-cols-4 gap-0.5">
        {SIZES.map(s => (
          <motion.button
            key={s}
            className={`text-[10px] font-black rounded-xl py-1 border-2
              ${brushSize === s ? 'border-pink-400 bg-pink-100 text-pink-600' : 'border-gray-200 bg-white/60 text-gray-500'}`}
            whileTap={{ scale: 0.85 }}
            onClick={() => { setBrushSize(s); vibrate(10); }}
          >
            {s}
          </motion.button>
        ))}
      </div>

      <div className="border-t-2 border-pink-200 my-0.5" />

      {/* Mirror mode */}
      <ToolBtn emoji="🪞" label="거울" active={mirrorMode} onClick={handleMirror}>
        <motion.span
          className="text-xl leading-none"
          animate={mirrorMode ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >🪞</motion.span>
      </ToolBtn>

      {/* Coloring page selector */}
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
                  onClick={() => handlePageRequest(p)}
                >
                  <span className="text-lg leading-none">{p.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-600">{p.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background color */}
      <ToolBtn emoji="🎨" label="배경색" active={showBgColors} onClick={() => setShowBgColors(v => !v)} />

      <AnimatePresence>
        {showBgColors && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[9px] font-black text-pink-400 text-center mt-0.5">배경</p>
            <div className="grid grid-cols-4 gap-1 mt-1 justify-items-center">
              {BG_COLORS.map(c => (
                <ColorSwatch key={c} c={c} size={18} selected={bgColor === c}
                  onSelect={(col) => { setBgColor(col); vibrate(10); }} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1" />

      {/* Undo */}
      <motion.button
        className="flex flex-col items-center justify-center rounded-2xl p-1.5 gap-0.5 w-full bg-blue-50 shadow ring-2 ring-blue-200"
        whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
        onClick={onUndo}
      >
        <span className="text-xl leading-none">↩️</span>
        <span className="text-[9px] font-black text-blue-500">되돌리기</span>
      </motion.button>

      {/* Save */}
      <motion.button
        className="flex flex-col items-center justify-center rounded-2xl p-1.5 gap-0.5 w-full bg-yellow-100 shadow ring-2 ring-yellow-300"
        whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
        onClick={onSave}
      >
        <motion.span
          className="text-xl leading-none"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
        >📸</motion.span>
        <span className="text-[9px] font-black text-yellow-700">저장</span>
      </motion.button>

      {/* Clear — single press */}
      <motion.button
        className="flex flex-col items-center justify-center rounded-2xl p-1.5 gap-0.5 w-full bg-red-50 shadow ring-2 ring-red-200"
        whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
        onClick={handleClear}
      >
        <span className="text-xl leading-none">🗑️</span>
        <span className="text-[9px] font-black text-red-400">초기화</span>
      </motion.button>

    </div>
  );
};
