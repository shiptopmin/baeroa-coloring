const KEY = 'baeroa-gallery';
const MAX = 16;

/** Save a JPEG thumbnail (320×180) of canvas to localStorage. */
export const saveToGallery = (canvas) => {
  try {
    const thumb = document.createElement('canvas');
    thumb.width  = 320;
    thumb.height = 180;
    thumb.getContext('2d').drawImage(canvas, 0, 0, 320, 180);
    const url     = thumb.toDataURL('image/jpeg', 0.75);
    const gallery = getGallery();
    gallery.unshift({ id: Date.now(), url, date: new Date().toLocaleDateString('ko-KR') });
    if (gallery.length > MAX) gallery.pop();
    localStorage.setItem(KEY, JSON.stringify(gallery));
  } catch (e) {
    console.warn('Gallery save failed:', e);
  }
};

export const getGallery = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};

export const deleteFromGallery = (id) => {
  try {
    const gallery = getGallery().filter(g => g.id !== id);
    localStorage.setItem(KEY, JSON.stringify(gallery));
  } catch {}
};
