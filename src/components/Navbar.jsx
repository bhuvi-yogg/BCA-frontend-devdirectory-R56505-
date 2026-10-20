import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ theme, onToggleTheme }) {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="nav glass">
      <Link to="/" className="logo">⌘ Dev<span>Directory</span></Link>
      <nav aria-label="Main" className="row wrap">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/users">Developers</NavLink>
        <NavLink to="/add-post">Publish</NavLink>
        {isAuthenticated && ['admin', 'publisher'].includes(user.role) && <NavLink to="/admin">Admin</NavLink>}
      </nav>
      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? '☀' : '☾'}</button>
        {isAuthenticated ? (
          <>
            <span className="chip" title={`Role: ${user.role}`}>{user.name} · {user.role}</span>
            <button className="btn btn-sm" onClick={() => { logout(); nav('/'); }}>Log out</button>
          </>
        ) : <Link className="btn btn-sm" to="/login">Log in</Link>}
      </div>
    </header>
  );
}
