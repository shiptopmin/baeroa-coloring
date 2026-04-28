import { useCallback } from 'react';

export const useVibration = () => {
  const vibrate = useCallback((pattern = 20) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);
  return vibrate;
};
