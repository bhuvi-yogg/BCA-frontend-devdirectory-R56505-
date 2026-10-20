import { useState } from 'react';
export default function useLocalStorage(key, initial) {
  const [v, setV] = useState(() => { try { return JSON.parse(localStorage.getItem(key)) ?? initial; } catch { return initial; } });
  const set = (next) => setV((prev) => {
    const val = typeof next === 'function' ? next(prev) : next;
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ }
    return val;
  });
  return [v, set];
}
