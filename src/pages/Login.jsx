
import { useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

export default function Login() {
  const { isAuthenticated, signIn } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from?.pathname || '/';

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(null);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();

    const v = {};
    const identifier = id.trim();

    if (!identifier) {
      v.id = 'Enter your email, username or mobile number.';
    }

    if (pw.length < 8) {
      v.pw = 'Password must be at least 8 characters.';
    }

    setErrs(v);
    setFail(null);

    if (Object.keys(v).length) return;

    setBusy(true);

    try {
      await signIn(identifier, pw);
      nav(from, { replace: true });
    } catch (err) {
      setFail(err.message || 'Login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container narrow">
      <form
        className="glass pad stack"
        onSubmit={submit}
        noValidate
      >
        <h1>Log in to DevDirectory</h1>

        {from !== '/' && (
          <p className="muted">
            Sign in to continue to <code>{from}</code>.
          </p>
        )}

        <AlertBanner
          message={fail}
          onDismiss={() => setFail(null)}
        />

        <label htmlFor="login-id">
          Email, username or mobile number
          <input
            id="login-id"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Email, username or +919876543210"
            autoComplete="username"
            aria-invalid={!!errs.id}
            aria-describedby={errs.id ? 'e-id' : undefined}
            required
          />
        </label>

        {errs.id && (
          <p id="e-id" className="field-error">
            {errs.id}
          </p>
        )}

        <label htmlFor="login-password">
          Password
          <input
            id="login-password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-invalid={!!errs.pw}
            aria-describedby={errs.pw ? 'e-pw' : undefined}
            required
          />
        </label>

        {errs.pw && (
          <p id="e-pw" className="field-error">
            {errs.pw}
          </p>
        )}

        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Log in'}
        </button>

        <p className="muted small">
          New to DevDirectory?{' '}
          <Link to="/register">Create an account</Link>
        </p>

        <div className="muted small">
          <p>Demo accounts for testing:</p>
          <p>
            Admin: <code>admin</code>
            <br />
            Publisher: <code>publisher</code>
            <br />
            User: <code>user</code>
            <br />
            Password for all three: <code>demo1234</code>
          </p>
        </div>
      </form>
    </section>
  );
}
