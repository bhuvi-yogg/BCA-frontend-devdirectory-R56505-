import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import useDebounce from '../hooks/useDebounce';
import useLocalStorage from '../hooks/useLocalStorage';
import { getUsers } from '../services/postService';
import UserCard from '../components/UserCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AlertBanner from '../components/AlertBanner';
import EmptyState from '../components/EmptyState';
import { loadAdmin } from '../services/adminStore';

const PER_PAGE = 6;

export default function UserDirectory() {
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [company, setCompany] = useState('');
  const [skill, setSkill] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [marks, setMarks] = useLocalStorage('dd_bookmarks', []);
  const [onlyMarked, setOnlyMarked] = useState(false);
  const dq = useDebounce(q, 200);
  const { data, loading, error, reload } = useFetch(getUsers);

  // Honors admin "deactivate/delete" from the local demo adapter.
  const devs = useMemo(() => { const o = loadAdmin().devs; return (data || []).filter((u) => !o[u.id] || o[u.id] === 'active'); }, [data]);
  const companies = useMemo(() => [...new Set(devs.map((u) => u.company.name))].sort(), [devs]);
  const skills = useMemo(() => [...new Set(devs.flatMap((u) => u.skills))].sort(), [devs]);

  const filtered = useMemo(() => {
    const t = dq.trim().toLowerCase();
    return devs
      .filter((u) => !t || [u.name, u.username, u.company.name, u.role, u.address.city, ...u.skills].join(' ').toLowerCase().includes(t))
      .filter((u) => !company || u.company.name === company)
      .filter((u) => !skill || u.skills.includes(skill))
      .filter((u) => !onlyMarked || marks.includes(u.id))
      .sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : a.company.name.localeCompare(b.company.name)));
  }, [devs, dq, company, skill, sort, onlyMarked, marks]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
  const reset = (fn) => (e) => { fn(e.target.value); setPage(1); };
  const toggle = (id) => setMarks((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <section className="container">
      <h1>Developers</h1>
      <div className="filters glass">
        <input type="search" aria-label="Search developers" placeholder="Search name, username, company, skill…" value={q} onChange={reset(setQ)} />
        <select aria-label="Filter by company" value={company} onChange={reset(setCompany)}><option value="">All companies</option>{companies.map((c) => <option key={c}>{c}</option>)}</select>
        <select aria-label="Filter by skill" value={skill} onChange={reset(setSkill)}><option value="">All skills</option>{skills.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Sort" value={sort} onChange={reset(setSort)}><option value="name">Sort: name</option><option value="company">Sort: company</option></select>
        <label className="row"><input type="checkbox" checked={onlyMarked} onChange={(e) => { setOnlyMarked(e.target.checked); setPage(1); }} /> Bookmarked</label>
      </div>
      {error ? <AlertBanner message={error} onRetry={reload} /> : loading ? <SkeletonLoader /> : !shown.length ? (
        <EmptyState title="No developers match" hint="Try a different search or clear filters." action={<button className="btn" onClick={() => { setQ(''); setCompany(''); setSkill(''); setOnlyMarked(false); }}>Clear filters</button>} />
      ) : (
        <>
          <p className="muted" aria-live="polite">{filtered.length} developer{filtered.length !== 1 && 's'}</p>
          <div className="grid">{shown.map((u) => <UserCard key={u.id} user={u} bookmarked={marks.includes(u.id)} onToggleBookmark={toggle} />)}</div>
          <div className="row center pad">
            <button className="btn btn-sm" disabled={cur === 1} onClick={() => setPage(cur - 1)}>Previous</button>
            <span>Page {cur} of {pages}</span>
            <button className="btn btn-sm" disabled={cur === pages} onClick={() => setPage(cur + 1)}>Next</button>
          </div>
        </>
      )}
    </section>
  );
}
