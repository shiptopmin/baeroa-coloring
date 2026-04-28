import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const ANIMALS = ['🐶', '🐱', '🐻', '🐨', '🦊', '🐸', '🐼', '🐯'];
const HEARTS = ['❤️', '🧡', '💛', '💚', '💙', '💜', '🩷', '🤍'];

const Heart = ({ id, x, emoji, size, delay }) => (
  <motion.div
    key={id}
    className="fixed bottom-4 pointer-events-none select-none z-50"
    style={{ left: `${x}%`, fontSize: size }}
    initial={{ y: 0, opacity: 1, rotate: 0 }}
    animate={{ y: -window.innerHeight - 80, opacity: [1, 1, 0], rotate: (Math.random() - 0.5) * 60 }}
    transition={{ duration: 2.8 + Math.random(), delay, ease: 'easeOut' }}
  >
    {emoji}
  </motion.div>
);

export const PraiseModal = ({ visible, onClose }) => {
  const [hearts, setHearts] = useState([]);
  const animalRef = useRef(ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);

  useEffect(() => {
    if (!visible) return;
    animalRef.current = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setHearts(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: 2 + Math.random() * 96,
        emoji: HEARTS[Math.floor(Math.random() * HEARTS.length)],
        size: Math.random() * 22 + 18,
        delay: Math.random() * 1.2,
      }))
    );
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Dark overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Floating hearts */}
          {hearts.map(h => <Heart key={h.id} {...h} />)}

          {/* Character + speech bubble */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            {/* Speech bubble */}
            <motion.div
              className="relative bg-white rounded-3xl border-4 border-yellow-300 shadow-2xl px-10 py-5 mb-6 text-center"
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            >
              <p className="text-4xl font-black text-pink-500 leading-tight">정말 멋진 그림이야!</p>
              <p className="text-3xl font-black text-orange-400 mt-1">최고야! ⭐⭐⭐</p>
              {/* Tail */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[22px] border-l-transparent border-r-transparent border-t-yellow-300"/>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[18px] border-l-transparent border-r-transparent border-t-white"/>
            </motion.div>

            {/* Animal */}
            <motion.div
              className="text-[9rem] leading-none drop-shadow-xl"
              animate={{ rotate: [-6, 6, -6], scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'easeInOut' }}
            >
              {animalRef.current}
            </motion.div>

            {/* Stars burst */}
            {[...Array(8)].map((_, i) => {
              const angle = (i / 8) * 360;
              return (
                <motion.div
                  key={i}
                  className="absolute text-3xl pointer-events-none"
                  style={{ top: '50%', left: '50%' }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * 180,
                    y: Math.sin((angle * Math.PI) / 180) * 180,
                    opacity: [0, 1, 0],
                    scale: [0, 1.4, 0],
                  }}
                  transition={{ duration: 1.2, delay: 0.1, repeat: Infinity, repeatDelay: 1.5 }}
                >
                  ⭐
                </motion.div>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
