import { Platform, Settings } from 'react-native';

// Tiny synchronous key-value store for prefs that must be known before the
// first render (language, currency). iOS: NSUserDefaults; web: localStorage.

export function readPref(key: string): string | null {
  try {
    if (Platform.OS === 'ios') {
      const v = Settings.get(key);
      return typeof v === 'string' && v ? v : null;
    }
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch {}
  return null;
}

export function writePref(key: string, value: string | null) {
  try {
    if (Platform.OS === 'ios') {
      Settings.set({ [key]: value ?? '' });
      return;
    }
    if (typeof localStorage !== 'undefined') {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    }
  } catch {}
}
