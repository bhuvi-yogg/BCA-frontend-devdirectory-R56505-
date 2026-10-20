import { createContext, useContext, useState } from 'react';

/*
 * DEMONSTRATION AUTH ADAPTER — NOT SECURE.
 * Accounts and the shared demo password live in client code, and the role is
 * checked in the browser only. A production app needs a backend that verifies
 * credentials (hashed passwords), issues sessions, and authorizes every action
 * server-side. Registration and OTP verification are not implemented.
 */
const DEMO_PASSWORD = 'demo1234';
const ACCOUNTS = [
  { id: 'u1', name: 'Demo Admin', username: 'admin', email: 'admin@demo.dev', mobile: '9000000001', role: 'admin' },
  { id: 'u2', name: 'Demo Publisher', username: 'publisher', email: 'publisher@demo.dev', mobile: '9000000002', role: 'publisher' },
  { id: 'u3', name: 'Demo User', username: 'user', email: 'user@demo.dev', mobile: '9000000003', role: 'user' },
];

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('dd_session')); } catch { return null; } });

  const login = (payload) => { setUser(payload); localStorage.setItem('dd_session', JSON.stringify(payload)); };
  const logout = () => { setUser(null); localStorage.removeItem('dd_session'); };

  // Any of email / username / mobile resolves to the same account.
  const signIn = async (identifier, password) => {
    await new Promise((r) => setTimeout(r, 400));
    const id = identifier.trim().toLowerCase();
    const acct = ACCOUNTS.find((a) => [a.email, a.username, a.mobile].includes(id));
    if (!acct || password !== DEMO_PASSWORD) throw new Error('Invalid identifier or password.');
    login(acct);
    return acct;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}
