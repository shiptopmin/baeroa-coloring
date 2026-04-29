import { AnimatePresence, motion } from 'framer-motion';

export const Toast = ({ message }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        key={message}
        className="fixed bottom-8 left-1/2 z-[300] pointer-events-none"
        style={{ x: '-50%' }}
        initial={{ opacity: 0, y: 24, scale: 0.88 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        exit={{    opacity: 0, y: 24, scale: 0.88 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        <div className="bg-gray-800/90 text-white px-6 py-3 rounded-full shadow-2xl text-base font-black whitespace-nowrap">
          {message}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
