import { Link, useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { getUser, getPostsByUser } from '../services/postService';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';

export default function UserProfile() {
  const { id } = useParams();
  const user = useFetch(() => getUser(id), [id]);
  const posts = useFetch(() => getPostsByUser(id), [id]);
  return (
    <section className="container">
      <Link to="/users">← All developers</Link>
      {user.error ? <AlertBanner message={user.error} onRetry={user.reload} /> : user.loading ? <SkeletonLoader count={1} /> : (
        <div className="glass pad profile">
          <div className="avatar big" aria-hidden="true">{user.data.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</div>
          <div>
            <h1>{user.data.name}</h1>
            <p className="muted">@{user.data.username} · {user.data.role} at {user.data.company.name}</p>
            <p>{user.data.company.catchPhrase}</p>
            <h3>Skills</h3><div className="chips">{user.data.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            <h3>Projects <small className="muted">(sample data)</small></h3><div className="chips">{user.data.projects.map((p) => <span key={p} className="chip">{p}</span>)}</div>
            <h3>Links</h3>
            <p className="row wrap"><a href={`https://${user.data.website}`} target="_blank" rel="noreferrer noopener">{user.data.website}</a><span className="muted">{user.data.address.city}</span></p>
          </div>
        </div>
      )}
      <h2>Publications</h2>
      {posts.error ? <AlertBanner message={posts.error} onRetry={posts.reload} /> : posts.loading ? <SkeletonLoader count={3} variant="row" /> :
        !posts.data.length ? <EmptyState title="No articles yet" /> :
        <div className="stack">{posts.data.map((p) => <article key={p.id} className="glass card"><h3>{p.title}</h3><p className="muted">{p.body}</p></article>)}</div>}
    </section>
  );
}
