import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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

  if (isAuthenticated) return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!id.trim()) v.id = 'Enter your email, username or mobile number.';
    if (pw.length < 8) v.pw = 'Password must be at least 8 characters.';
    setErrs(v); setFail(null);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { await signIn(id, pw); nav(from, { replace: true }); } catch (err) { setFail(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="container narrow">
      <form className="glass pad stack" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        {from !== '/' && <p className="muted">Sign in to continue to <code>{from}</code>.</p>}
        <AlertBanner message={fail} onDismiss={() => setFail(null)} />
        <label>Email, username or mobile
          <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" aria-invalid={!!errs.id} aria-describedby="e-id" />
        </label>
        {errs.id && <p id="e-id" className="field-error">{errs.id}</p>}
        <label>Password
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" aria-invalid={!!errs.pw} aria-describedby="e-pw" />
        </label>
        {errs.pw && <p id="e-pw" className="field-error">{errs.pw}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Log in'}</button>
        <p className="muted small">Demonstration login only — not secure authentication. Try <code>admin</code>, <code>publisher</code> or <code>user</code> with password <code>demo1234</code>. Registration needs a real backend and is not implemented.</p>
      </form>
    </section>
  );
}
