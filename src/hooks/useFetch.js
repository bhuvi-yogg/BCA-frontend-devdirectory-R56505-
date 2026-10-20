import { useEffect, useState } from 'react';
export default function useFetch(fn, deps = []) {
  const [s, setS] = useState({ data: null, loading: true, error: null });
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    setS((p) => ({ ...p, loading: true, error: null }));
    fn().then((data) => live && setS({ data, loading: false, error: null }))
      .catch((e) => live && setS({ data: null, loading: false, error: e.message || 'Request failed' }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, ...deps]);
  return { ...s, reload: () => setN((x) => x + 1) };
}
