import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasEngine } from './components/CanvasEngine';
import { Gallery } from './components/Gallery';
import { PraiseModal } from './components/PraiseModal';
import { StartScreen } from './components/StartScreen';
import { Toast } from './components/Toast';
import { Toolbar } from './components/Toolbar';
import { useSound } from './hooks/useSound';
import { useVibration } from './hooks/useVibration';
import { saveToGallery } from './utils/gallery';

export default function App() {
  const [started, setStarted] = useState(false);
  const [color, setColor] = useState('#FF3B3B');
  const [brushType, setBrushType] = useState('rainbow');
  const [brushSize, setBrushSize] = useState('M');
  const [mirrorMode, setMirrorMode] = useState(false);
  const [coloringPage, setColoringPage] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState('⭐');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [praiseVisible, setPraiseVisible] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [toast, setToast] = useState('');
  const [orientation, setOrientation] = useState('landscape');
  const [pendingPage, setPendingPage] = useState(null); // confirmation dialog

  const canvasRef = useRef(null);
  const toastTimerRef = useRef(null);
  const { playPraise, playSave } = useSound();
  const vibrate = useVibration();

  // ── orientation detection ─────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      setOrientation(window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg, duration = 2200) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), duration);
  }, []);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    playSave();
    vibrate([30, 20, 50, 20, 80]);
    const canvas = canvasRef.current?.getCanvas?.();
    if (canvas) {
      saveToGallery(canvas);
      // Also trigger download
      const link = document.createElement('a');
      link.download = `baeroa-art-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    setPraiseVisible(true);
    showToast('📸 저장됐어요! 잘 그렸어요! 🎉');
  }, [playSave, vibrate, showToast]);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
    showToast('🗑️ 깨끗해졌어요!');
  }, [showToast]);

  const handleUndo = useCallback(() => {
    const ok = canvasRef.current?.undo();
    if (ok) showToast('↩️ 되돌렸어요!');
    else showToast('더 이상 되돌릴 수 없어요');
  }, [showToast]);

  const handlePageSelect = useCallback((page) => {
    // Show confirmation dialog at App level (safe from transform containing blocks)
    setPendingPage(page);
  }, []);

  const handlePageConfirm = useCallback(() => {
    if (!pendingPage) return;
    setColoringPage(prev => prev?.id === pendingPage.id ? null : pendingPage);
    setPendingPage(null);
    showToast(`${pendingPage.emoji} ${pendingPage.label} 밑그림이에요!`);
    vibrate(25);
  }, [pendingPage, showToast, vibrate]);

  const handleHome = useCallback(() => {
    setStarted(false);
    vibrate([20, 10, 40]);
  }, [vibrate]);

  const handleStart = useCallback(() => {
    vibrate([20, 10, 40]);
    setStarted(true);
  }, [vibrate]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div key="start" className="absolute inset-0"
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.3, ease: 'easeIn' }}>
            <StartScreen onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div key="app"
            className="flex absolute inset-0 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}>

            <Toolbar
              color={color} setColor={setColor}
              brushType={brushType} setBrushType={setBrushType}
              brushSize={brushSize} setBrushSize={setBrushSize}
              mirrorMode={mirrorMode} setMirrorMode={setMirrorMode}
              coloringPage={coloringPage} setColoringPage={setColoringPage}
              selectedStamp={selectedStamp} setSelectedStamp={setSelectedStamp}
              bgColor={bgColor} setBgColor={setBgColor}
              onSave={handleSave}
              onClear={handleClear}
              onUndo={handleUndo}
              onHome={handleHome}
              onGallery={() => setShowGallery(true)}
              onPageSelect={handlePageSelect}
            />

            <div className="flex-1 relative overflow-hidden">
              {/* Dot pattern bg */}
              <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #FF6B9D 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <CanvasEngine
                ref={canvasRef}
                color={color}
                brushType={brushType}
                brushSize={brushSize}
                mirrorMode={mirrorMode}
                coloringPage={coloringPage}
                selectedStamp={selectedStamp}
                bgColor={bgColor}
              />
            </div>

            <PraiseModal visible={praiseVisible} onClose={() => setPraiseVisible(false)} />

            {/* Portrait mode warning */}
            <AnimatePresence>
              {orientation === 'portrait' && (
                <motion.div
                  className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-purple-900/90 backdrop-blur-sm gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.span
                    className="text-6xl"
                    animate={{ rotate: [0, 90, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >📱</motion.span>
                  <p className="text-white text-xl font-black text-center px-8">
                    가로로 돌려주세요! 🔄<br />
                    <span className="text-sm font-bold opacity-80">태블릿을 눕히면 더 잘 그릴 수 있어요</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery modal */}
      <AnimatePresence>
        {showGallery && (
          <Gallery onClose={() => setShowGallery(false)} />
        )}
      </AnimatePresence>

      {/* Coloring page confirmation dialog — at root level, no transform ancestors */}
      <AnimatePresence>
        {pendingPage && (
          <motion.div
            className="fixed inset-0 z-[400] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setPendingPage(null)} />
            <motion.div
              className="relative bg-white rounded-3xl p-7 shadow-2xl border-4 border-pink-200 flex flex-col items-center gap-4 mx-4"
              style={{ maxWidth: 340 }}
              initial={{ scale: 0.82, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.82, y: 24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <span className="text-5xl">{pendingPage.emoji}</span>
              <p className="text-base font-black text-gray-700 text-center leading-relaxed">
                <span className="text-pink-500">"{pendingPage.label}"</span> 밑그림으로 바꿀까요?<br />
                <span className="text-sm font-bold text-red-400">지금 그림이 지워져요!</span>
              </p>
              <div className="flex gap-3 w-full">
                <motion.button
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-600 font-black text-base border-2 border-gray-200"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setPendingPage(null)}
                >취소</motion.button>
                <motion.button
                  className="flex-1 py-3 rounded-2xl bg-pink-400 text-white font-black text-base border-2 border-pink-500 shadow"
                  whileTap={{ scale: 0.92 }}
                  onClick={handlePageConfirm}
                >바꿔요! 🎨</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <Toast message={toast} />
    </>
  );
}
