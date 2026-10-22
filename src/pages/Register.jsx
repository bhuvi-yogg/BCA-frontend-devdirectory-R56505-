
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/AlertBanner';

export default function Register() {
  const { isAuthenticated, signUp, verifyPhoneOtp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim()) return setError('Please enter your name.');
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    setBusy(true);

    try {
      const result = await signUp({ name, identifier, password });

      if (result.method === 'phone' && result.needsVerification) {
        setPendingPhone(result.identifier);
        setMessage('SMS OTP sent. Enter the code you received.');
      } else if (result.method === 'email' && result.needsVerification) {
        setMessage('Check your email and confirm your account before logging in.');
      } else {
        setMessage('Account created successfully.');
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      await verifyPhoneOtp(pendingPhone, otp.trim());
      navigate('/');
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="container narrow">
      <form
        className="glass pad stack"
        onSubmit={pendingPhone ? verify : submit}
        noValidate
      >
        <h1>Create your account</h1>
        <p className="muted">
          Join DevDirectory to discover developers and opportunities.
        </p>

        <AlertBanner message={error || null} onDismiss={() => setError('')} />
        {message && <p role="status">{message}</p>}

        {!pendingPhone ? (
          <>
            <label>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </label>

            <label>
              Email or mobile number
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@example.com or +919876543210"
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <button className="btn" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
            </button>
          </>
        ) : (
          <>
            <label>
              SMS verification code
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
            </label>
            <button className="btn" disabled={busy || !otp.trim()}>
              {busy ? 'Verifying…' : 'Verify phone'}
            </button>
          </>
        )}

        <p className="muted small">
          Already registered? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
