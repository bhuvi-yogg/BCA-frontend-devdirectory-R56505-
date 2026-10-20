import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getUsers, getPosts } from '../services/postService';
import UserCard from '../components/UserCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';

export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const users = useFetch(getUsers);
  const posts = useFetch(getPosts);

  const suggestions = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t || !users.data) return [];
    return users.data.filter((u) => [u.name, u.username, u.company.name, ...u.skills].join(' ').toLowerCase().includes(t)).slice(0, 5);
  }, [q, users.data]);

  const skillCounts = useMemo(() => {
    const m = {};
    (users.data || []).forEach((u) => u.skills.forEach((s) => { m[s] = (m[s] || 0) + 1; }));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [users.data]);

  const stats = users.data && posts.data ? [
    [users.data.length, 'Developers'], [posts.data.length, 'Articles'],
    [new Set(users.data.map((u) => u.company.name)).size, 'Companies'], [new Set(users.data.flatMap((u) => u.skills)).size, 'Technologies'],
  ] : [];

  return (
    <>
      <section className="container hero">
        <p className="eyebrow">Blackhall Ultra Neon</p>
        <h1>Discover <span className="gradient-text">developers</span>.<br />Publish what you know.</h1>
        <form className="search-wrap" role="search" onSubmit={(e) => { e.preventDefault(); nav(`/users?q=${encodeURIComponent(q.trim())}`); }}>
          <input type="search" aria-label="Search developers" placeholder="Search by name, company or skill…" value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQ('')}>Clear</button>}
          <button className="btn">Search</button>
          {suggestions.length > 0 && (
            <ul className="suggest glass">
              {suggestions.map((u) => <li key={u.id}><Link to={`/users/${u.id}`}>{u.name} <span className="muted">· {u.company.name}</span></Link></li>)}
            </ul>
          )}
        </form>
        <div className="row center"><Link className="btn" to="/users">Explore developers</Link><Link className="btn btn-ghost" to="/add-post">Publish an article</Link></div>
      </section>

      <section className="container"><div className="stats">
        {stats.map(([n, l]) => <div key={l} className="glass stat"><strong>{n}</strong><span className="muted">{l}</span></div>)}
      </div></section>

      <section className="container"><h2>Featured developers</h2>
        {users.error ? <AlertBanner message={users.error} onRetry={users.reload} /> : users.loading ? <SkeletonLoader count={3} /> :
          <div className="grid">{users.data.slice(0, 3).map((u) => <UserCard key={u.id} user={u} />)}</div>}
      </section>

      <section className="container"><h2>Technologies</h2>
        <div className="chips">{skillCounts.map(([s, n]) => <Link key={s} className="chip" to={`/users?q=${encodeURIComponent(s)}`}>{s} · {n}</Link>)}</div>
      </section>

      <section className="container"><h2>Recent articles</h2>
        {posts.error ? <AlertBanner message={posts.error} onRetry={posts.reload} /> : posts.loading ? <SkeletonLoader count={3} variant="row" /> :
          <div className="grid">{posts.data.slice(-3).reverse().map((p) => (
            <article key={p.id} className="glass card"><h3>{p.title}</h3><p className="muted clamp">{p.body}</p><Link to={`/users/${p.userId}`}>By developer #{p.userId} →</Link></article>
          ))}</div>}
      </section>
    </>
  );
}
