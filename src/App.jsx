import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { CanvasEngine } from './components/CanvasEngine';
import { PraiseModal } from './components/PraiseModal';
import { StartScreen } from './components/StartScreen';
import { Toolbar } from './components/Toolbar';
import { useSound } from './hooks/useSound';
import { useVibration } from './hooks/useVibration';

export default function App() {
  const [started, setStarted] = useState(false);
  const [color, setColor] = useState('#FF3B3B');
  const [brushType, setBrushType] = useState('rainbow');
  const [mirrorMode, setMirrorMode] = useState(false);
  const [coloringPage, setColoringPage] = useState(null);
  const [selectedStamp, setSelectedStamp] = useState('⭐');
  const [praiseVisible, setPraiseVisible] = useState(false);

  const canvasRef = useRef(null);
  const { playPraise } = useSound();
  const vibrate = useVibration();

  const handleSave = useCallback(() => {
    playPraise();
    vibrate([30, 20, 50, 20, 80]);
    setPraiseVisible(true);
    setTimeout(() => canvasRef.current?.save(), 300);
  }, [playPraise, vibrate]);

  const handleClear = useCallback(() => {
    canvasRef.current?.clear();
  }, []);

  const handleStart = useCallback(() => {
    vibrate([20, 10, 40]);
    setStarted(true);
  }, [vibrate]);

  return (
    <AnimatePresence mode="wait">
      {!started ? (
        <motion.div key="start" className="absolute inset-0"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.3, ease: 'easeIn' }}>
          <StartScreen onStart={handleStart} />
        </motion.div>
      ) : (
        <motion.div key="app"
          className="flex absolute inset-0 overflow-hidden bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 font-cute"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}>

          <Toolbar
            color={color} setColor={setColor}
            brushType={brushType} setBrushType={setBrushType}
            mirrorMode={mirrorMode} setMirrorMode={setMirrorMode}
            coloringPage={coloringPage} setColoringPage={setColoringPage}
            selectedStamp={selectedStamp} setSelectedStamp={setSelectedStamp}
            onSave={handleSave}
            onClear={handleClear}
          />

          <div className="flex-1 relative overflow-hidden">
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
              mirrorMode={mirrorMode}
              coloringPage={coloringPage}
              selectedStamp={selectedStamp}
            />
          </div>

          <PraiseModal visible={praiseVisible} onClose={() => setPraiseVisible(false)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
