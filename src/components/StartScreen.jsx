import { motion } from 'framer-motion';

const FLOATING = [
  { emoji: '🎨', x: 8, y: 12, delay: 0, size: 52 },
  { emoji: '🖍️', x: 82, y: 8, delay: 0.3, size: 44 },
  { emoji: '✏️', x: 5, y: 72, delay: 0.6, size: 40 },
  { emoji: '🌈', x: 85, y: 68, delay: 0.2, size: 50 },
  { emoji: '⭐', x: 50, y: 5, delay: 0.5, size: 38 },
  { emoji: '🎀', x: 15, y: 42, delay: 0.8, size: 36 },
  { emoji: '💛', x: 78, y: 38, delay: 0.4, size: 36 },
  { emoji: '🌸', x: 45, y: 88, delay: 0.7, size: 42 },
  { emoji: '🦋', x: 68, y: 82, delay: 0.1, size: 38 },
  { emoji: '🐣', x: 22, y: 85, delay: 0.9, size: 36 },
];

export const StartScreen = ({ onStart }) => (
  <motion.div
    className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center"
    style={{
      background: 'linear-gradient(135deg, #FFE0F0 0%, #FFF4E0 40%, #E0F4FF 100%)',
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, scale: 1.08 }}
    transition={{ duration: 0.4 }}
  >
    {/* Background polka dots */}
    <div
      className="absolute inset-0 opacity-25 pointer-events-none"
      style={{
        backgroundImage: 'radial-gradient(circle, #FF6B9D 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px',
      }}
    />

    {/* Floating decorations */}
    {FLOATING.map((f, i) => (
      <motion.div
        key={i}
        className="absolute pointer-events-none select-none"
        style={{ left: `${f.x}%`, top: `${f.y}%`, fontSize: f.size }}
        animate={{ y: [0, -14, 0], rotate: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 2.8 + i * 0.3, delay: f.delay, ease: 'easeInOut' }}
      >
        {f.emoji}
      </motion.div>
    ))}

    {/* Main content */}
    <div className="relative z-10 flex flex-col items-center gap-10">
      {/* Big palette icon */}
      <motion.div
        className="text-[110px] leading-none drop-shadow-xl"
        animate={{ rotate: [-8, 8, -8], scale: [1, 1.06, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        🎨
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 200 }}
      >
        <h1
          className="font-black leading-tight"
          style={{
            fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
            background: 'linear-gradient(135deg, #FF6B9D, #FF8C00, #FFD700, #32CD32, #1E90FF, #9B59B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 8px rgba(255,107,157,0.25))',
          }}
        >
          배로아 색칠놀이
        </h1>
      </motion.div>

      {/* Start button */}
      <motion.button
        className="relative font-black text-white rounded-full shadow-2xl select-none"
        style={{
          fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
          padding: '0.7em 2.4em',
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8C00 100%)',
          boxShadow: '0 8px 32px rgba(255,107,157,0.45), 0 2px 0 rgba(0,0,0,0.12)',
        }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.28, duration: 0.5, type: 'spring', stiffness: 220 }}
        whileHover={{ scale: 1.08, boxShadow: '0 12px 40px rgba(255,107,157,0.55)' }}
        whileTap={{ scale: 0.93 }}
        onClick={onStart}
      >
        시작 🚀
        {/* Shine overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 55%)',
          }}
        />
      </motion.button>
    </div>
  </motion.div>
);
