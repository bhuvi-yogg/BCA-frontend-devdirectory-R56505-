// LOCAL DEMO ADAPTER — persists to this browser only. Not a database, not authorization.
const K = 'dd_admin', P = 'dd_local_posts';
const empty = { devs: {}, posts: {}, audit: [] };
export const loadAdmin = () => { try { return JSON.parse(localStorage.getItem(K)) || empty; } catch { return empty; } };
export const saveAdmin = (s) => localStorage.setItem(K, JSON.stringify(s));
export const loadLocalPosts = () => { try { return JSON.parse(localStorage.getItem(P)) || []; } catch { return []; } };
export const addLocalPost = (p) => localStorage.setItem(P, JSON.stringify([p, ...loadLocalPosts()]));
