// Local storage wrapper with subscriber event dispatcher for real-time reactivity

type StorageKey = 'prism_inquiries' | 'prism_portfolio' | 'prism_testimonials' | 'prism_legal' | 'prism_admin_user' | 'prism_testimonials_v2' | 'prism_inquiries_v2' | string;

type Listener = (key: StorageKey, data: any) => void;
const listeners = new Set<Listener>();

export const subscribeToStorage = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = (key: StorageKey, data: any) => {
  listeners.forEach((fn) => {
    try {
      fn(key, data);
    } catch (err) {
      console.error('Storage listener error:', err);
    }
  });
};

export const getStoredItem = <T>(key: StorageKey, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
};

export const setStoredItem = <T>(key: StorageKey, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners(key, value);
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
};
