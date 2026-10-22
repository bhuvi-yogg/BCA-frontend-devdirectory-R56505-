
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const DEMO_PASSWORD = 'demo1234';

const ACCOUNTS = [
  {
    id: 'u1',
    name: 'Demo Admin',
    username: 'admin',
    email: 'admin@demo.dev',
    mobile: '9000000001',
    role: 'admin',
  },
  {
    id: 'u2',
    name: 'Demo Publisher',
    username: 'publisher',
    email: 'publisher@demo.dev',
    mobile: '9000000002',
    role: 'publisher',
  },
  {
    id: 'u3',
    name: 'Demo User',
    username: 'user',
    email: 'user@demo.dev',
    mobile: '9000000003',
    role: 'user',
  },
];

const AuthContext = createContext(null);

// Correct export: Navbar imports useAuth with a capital A.
export function useAuth() {
  return useContext(AuthContext);
}

function formatUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name:
      user.user_metadata?.full_name ||
      user.email ||
      user.phone ||
      'Developer',
    email: user.email || '',
    mobile: user.phone || '',
    role: 'user',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dd_session'));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || error) return;

      if (!localStorage.getItem('dd_session')) {
        setUser(formatUser(data.session?.user));
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!localStorage.getItem('dd_session')) {
          setUser(formatUser(session?.user));
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (identifier, password) => {
    const id = identifier.trim().toLowerCase();

    const demo = ACCOUNTS.find((account) =>
      [account.email, account.username, account.mobile].includes(id)
    );

    if (demo && password === DEMO_PASSWORD) {
      await supabase.auth.signOut();

      localStorage.setItem('dd_session', JSON.stringify(demo));
      setUser(demo);

      return demo;
    }

    const credentials = id.includes('@')
      ? { email: id, password }
      : { phone: id, password };

    const { data, error } =
      await supabase.auth.signInWithPassword(credentials);

    if (error) throw error;

    localStorage.removeItem('dd_session');

    const loggedInUser = formatUser(data.user);
    setUser(loggedInUser);

    return loggedInUser;
  };

  const signUp = async ({ name, identifier, password }) => {
    const id = identifier.trim();
    const isEmail = id.includes('@');

    if (!isEmail && !/^\+[1-9]\d{7,14}$/.test(id)) {
      throw new Error(
        'Enter a valid email, or a phone number with country code, e.g. +919876543210.'
      );
    }

    const credentials = {
      password,
      options: {
        data: {
          full_name: name.trim(),
        },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    };

    if (isEmail) {
      credentials.email = id;
    } else {
      credentials.phone = id;
    }

    const { data, error } = await supabase.auth.signUp(credentials);

    if (error) throw error;

    return {
      user: data.user,
      needsVerification: !data.session,
      method: isEmail ? 'email' : 'phone',
      identifier: id,
    };
  };

  const verifyPhoneOtp = async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) throw error;

    localStorage.removeItem('dd_session');

    const verifiedUser = formatUser(data.user);
    setUser(verifiedUser);

    return verifiedUser;
  };

  const logout = async () => {
    localStorage.removeItem('dd_session');
    setUser(null);

    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login: setUser,
        logout,
        signIn,
        signUp,
        verifyPhoneOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
