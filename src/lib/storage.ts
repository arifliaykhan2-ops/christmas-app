import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

// In-memory cache + subscribers so every screen using the same key stays in sync.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<(v: unknown) => void>>();
const loading = new Map<string, Promise<void>>();

function load(key: string): Promise<void> {
  if (!loading.has(key)) {
    loading.set(
      key,
      AsyncStorage.getItem(key)
        .then((raw) => {
          if (raw != null && !cache.has(key)) cache.set(key, JSON.parse(raw));
        })
        .catch(() => {}),
    );
  }
  return loading.get(key)!;
}

function write(key: string, value: unknown) {
  cache.set(key, value);
  listeners.get(key)?.forEach((fn) => fn(value));
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}

/** useState persisted as JSON on the device (no server involved). */
export function useStored<T>(key: string, initial: T): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(() => (cache.has(key) ? (cache.get(key) as T) : initial));
  const [loaded, setLoaded] = useState(cache.has(key));

  useEffect(() => {
    let alive = true;
    const fn = (v: unknown) => alive && setValue(v as T);
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(fn);
    load(key).then(() => {
      if (!alive) return;
      if (cache.has(key)) setValue(cache.get(key) as T);
      setLoaded(true);
    });
    return () => {
      alive = false;
      listeners.get(key)?.delete(fn);
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = (cache.has(key) ? cache.get(key) : initial) as T;
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      write(key, resolved);
    },
    // initial is only a fallback for the first write
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, update, loaded];
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
