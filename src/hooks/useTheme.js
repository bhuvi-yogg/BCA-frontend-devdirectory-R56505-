import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
export default function useTheme() {
  const [theme, setTheme] = useLocalStorage('dd_theme', 'dark');
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  return [theme, () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))];
}
