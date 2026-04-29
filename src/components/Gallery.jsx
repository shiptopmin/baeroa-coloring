import { AnimatePresence, motion } from 'framer-motion';
import { getGallery, deleteFromGallery } from '../utils/gallery';
import { useState } from 'react';

export const Gallery = ({ onClose }) => {
  const [items, setItems] = useState(() => getGallery());

  const handleDelete = (id) => {
    deleteFromGallery(id);
    setItems(getGallery());
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl shadow-2xl border-4 border-pink-200 flex flex-col"
        style={{ width: 'min(90vw, 680px)', maxHeight: '82vh' }}
        initial={{ scale: 0.88, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.88, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b-2 border-pink-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🖼️</span>
            <h2 className="text-lg font-black text-pink-500">내 그림 갤러리</h2>
          </div>
          <motion.button
            className="text-2xl leading-none bg-white rounded-full w-9 h-9 flex items-center justify-center shadow border-2 border-pink-200"
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={onClose}
          >
            ✕
          </motion.button>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto flex-1 p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <span className="text-5xl">🎨</span>
              <p className="text-base font-bold">아직 저장된 그림이 없어요!</p>
              <p className="text-sm">그림을 그리고 📸 저장해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    className="relative group rounded-2xl overflow-hidden border-3 border-pink-200 shadow-md bg-white"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    style={{ aspectRatio: '16/9' }}
                  >
                    <img
                      src={item.url}
                      alt={`그림 ${item.date}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 flex items-center justify-center gap-2">
                      <motion.button
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm shadow-lg font-bold transition-opacity"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleDelete(item.id)}
                        title="삭제"
                      >
                        🗑️
                      </motion.button>
                    </div>
                    {/* Date badge */}
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.date}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-2 border-pink-200 flex-shrink-0 text-center">
          <p className="text-[10px] text-gray-400 font-bold">최대 16개까지 저장돼요 · 기기에 저장됩니다</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
