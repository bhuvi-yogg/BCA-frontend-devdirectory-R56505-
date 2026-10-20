import { Link } from 'react-router-dom';
export default function UserCard({ user, bookmarked, onToggleBookmark }) {
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  return (
    <article className="card glass">
      <div className="row between">
        <div className="avatar" aria-hidden="true">{initials}</div>
        {onToggleBookmark && (
          <button className="btn btn-ghost btn-sm" aria-pressed={bookmarked} aria-label={`${bookmarked ? 'Remove bookmark for' : 'Bookmark'} ${user.name}`} onClick={() => onToggleBookmark(user.id)}>
            {bookmarked ? '★' : '☆'}
          </button>
        )}
      </div>
      <h3>{user.name}</h3>
      <p className="muted">@{user.username} · {user.role}</p>
      <p>{user.company.name}</p>
      <div className="chips">{user.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      <Link className="btn btn-sm" to={`/users/${user.id}`}>View profile</Link>
    </article>
  );
}
