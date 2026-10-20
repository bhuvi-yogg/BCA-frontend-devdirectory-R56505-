import { useMemo, useState } from 'react';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { getUsers, getPosts } from '../services/postService';
import { loadAdmin, saveAdmin, loadLocalPosts } from '../services/adminStore';
import AlertBanner from '../components/AlertBanner';
import ConfirmDialog from '../components/ConfirmDialog';
import SkeletonLoader from '../components/SkeletonLoader';

const STATUSES = ['draft', 'pending', 'published', 'rejected'];
const PER = 5;

export default function Admin() {
  const { user: me } = useAuth();
  const isAdmin = me.role === 'admin';
  const users = useFetch(getUsers);
  const posts = useFetch(getPosts);
  const [s, setS] = useState(loadAdmin);
  const [tab, setTab] = useState('articles');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const commit = (mut, msg) => {
    const next = { ...s, ...mut(s), audit: [{ t: new Date().toISOString(), by: me.username, msg }, ...s.audit].slice(0, 50) };
    saveAdmin(next); setS(next); setToast(msg);
  };
  const setDev = (id, name, v) => commit((x) => ({ devs: { ...x.devs, [id]: v } }), `${v === 'active' ? 'Activated' : v === 'deleted' ? 'Deleted' : 'Deactivated'} developer ${name}`);
  const setPost = (id, v) => commit((x) => ({ posts: { ...x.posts, [id]: v } }), `Set article ${id} to ${v}`);

  const articles = useMemo(() => [
    ...loadLocalPosts().map((p) => ({ ...p, status: s.posts[p.id] || 'pending' })),
    ...(posts.data || []).slice(0, 20).map((p) => ({ ...p, status: s.posts[p.id] || 'published' })),
  ].filter((p) => (!q || p.title.toLowerCase().includes(q.toLowerCase())) && (!filter || p.status === filter)), [posts.data, s, q, filter]);
  const devs = useMemo(() => (users.data || []).filter((u) => s.devs[u.id] !== 'deleted' && (!q || `${u.name} ${u.company.name}`.toLowerCase().includes(q.toLowerCase()))), [users.data, s, q]);

  const rows = tab === 'articles' ? articles : tab === 'developers' ? devs : s.audit;
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const cur = Math.min(page, pages);
  const slice = rows.slice((cur - 1) * PER, cur * PER);
  const go = (t) => { setTab(t); setPage(1); setQ(''); setFilter(''); };

  return (
    <section className="container">
      <h1>Admin workspace</h1>
      <AlertBanner type="warning" message="Local demo adapter: changes are saved only in this browser. Roles are checked in the client, so this is not real authorization or a real database." />
      <AlertBanner type="success" message={toast} onDismiss={() => setToast(null)} />
      <div className="stats">
        <div className="glass stat"><strong>{users.data?.length ?? '–'}</strong><span className="muted">Developers</span></div>
        <div className="glass stat"><strong>{articles.filter((a) => a.status === 'pending').length}</strong><span className="muted">Pending</span></div>
        <div className="glass stat"><strong>{articles.filter((a) => a.status === 'published').length}</strong><span className="muted">Published</span></div>
        <div className="glass stat"><strong>{s.audit.length}</strong><span className="muted">Audit events</span></div>
      </div>
      <div className="row wrap pad" role="tablist">
        {['articles', 'developers', 'audit'].map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`btn btn-sm ${tab === t ? '' : 'btn-ghost'}`} onClick={() => go(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>
      {tab !== 'audit' && <div className="filters glass">
        <input type="search" aria-label="Search" placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        {tab === 'articles' && <select aria-label="Status filter" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}><option value="">All statuses</option>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select>}
      </div>}

      {(users.error || posts.error) && <AlertBanner message={users.error || posts.error} onRetry={() => { users.reload(); posts.reload(); }} />}
      {(users.loading || posts.loading) ? <SkeletonLoader count={4} variant="row" /> : (
        <div className="table-wrap glass"><table>
          {tab === 'articles' && <><thead><tr><th>Title</th><th>Author</th><th>Status</th></tr></thead><tbody>
            {slice.map((a) => <tr key={a.id}><td>{a.title}</td><td>#{a.userId}</td><td>
              <select aria-label={`Status of ${a.title}`} value={a.status} onChange={(e) => setPost(a.id, e.target.value)}>{STATUSES.map((x) => <option key={x}>{x}</option>)}</select></td></tr>)}</tbody></>}
          {tab === 'developers' && <><thead><tr><th>Name</th><th>Company</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {slice.map((u) => { const st = s.devs[u.id] || 'active'; return (
              <tr key={u.id}><td>{u.name}</td><td>{u.company.name}</td><td>{st}</td><td className="row">
                <button className="btn btn-sm" disabled={!isAdmin} title={isAdmin ? '' : 'Admins only'} onClick={() => setDev(u.id, u.name, st === 'active' ? 'inactive' : 'active')}>{st === 'active' ? 'Deactivate' : 'Activate'}</button>
                <button className="btn btn-sm btn-danger" disabled={!isAdmin} onClick={() => setConfirm(u)}>Delete</button></td></tr>); })}</tbody></>}
          {tab === 'audit' && <><thead><tr><th>Time</th><th>By</th><th>Event</th></tr></thead><tbody>
            {slice.map((a, i) => <tr key={i}><td>{new Date(a.t).toLocaleString()}</td><td>{a.by}</td><td>{a.msg}</td></tr>)}</tbody></>}
        </table>{!slice.length && <p className="pad muted">Nothing to show.</p>}</div>
      )}
      <div className="row center pad">
        <button className="btn btn-sm" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Previous</button><span>Page {cur} of {pages}</span>
        <button className="btn btn-sm" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next</button>
      </div>
      <ConfirmDialog open={!!confirm} message={`Delete ${confirm?.name} from the local demo directory? (Remote data is not affected.)`}
        onCancel={() => setConfirm(null)} onConfirm={() => { setDev(confirm.id, confirm.name, 'deleted'); setConfirm(null); }} />
    </section>
  );
}
