import { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { getUsers, createPost } from '../services/postService';
import { getAiStatus, runAi, looksNonEnglish } from '../services/aiService';
import { addLocalPost } from '../services/adminStore';
import AlertBanner from '../components/AlertBanner';

const LIMITS = { title: [5, 80], body: [20, 500] };
const ACTIONS = [
  ['generate', 'Generate', 'body'], ['rewrite', 'Rewrite', 'body'], ['expand', 'Expand', 'body'],
  ['summarize', 'Summarize', 'body'], ['grammar', 'Fix grammar', 'body'], ['title', 'Suggest title', 'title'],
  ['tags', 'Tags', 'tags'], ['excerpt', 'Excerpt', 'excerpt'],
];
const empty = { userId: '', title: '', body: '' };

export default function AddPost() {
  const users = useFetch(getUsers);
  const ai = useFetch(() => getAiStatus().catch(() => ({ configured: false })), []);
  const [form, setForm] = useState(() => { try { return JSON.parse(localStorage.getItem('dd_draft')) || empty; } catch { return empty; } });
  const [extra, setExtra] = useState({ tags: '', excerpt: '' });
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState(null);
  const [aiBusy, setAiBusy] = useState(null);
  const [aiErr, setAiErr] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [editing, setEditing] = useState(true);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const errors = {};
  if (!form.userId) errors.userId = 'Choose an author.';
  for (const k of ['title', 'body']) {
    const len = form[k].trim().length; const [min, max] = LIMITS[k];
    if (len < min) errors[k] = `Must be at least ${min} characters (${len}/${max}).`;
    else if (len > max) errors[k] = `Must be at most ${max} characters (${len}/${max}).`;
  }
  const valid = !Object.keys(errors).length;
  const show = (k) => touched[k] && errors[k];
  const nonEnglish = looksNonEnglish(`${form.title} ${form.body}`);

  const runAction = async (action, target) => {
    setAiErr(null); setAiBusy(action); setLastAction([action, target]);
    try {
      const r = await runAi(action, { text: form.body, title: form.title });
      const before = target === 'body' || target === 'title' ? form[target] : extra[target];
      setPreview({ target, before, after: r.text, provider: `${r.provider}${r.model ? ' · ' + r.model : ''}` });
    } catch (e) { setAiErr(e.message); } finally { setAiBusy(null); }
  };
  const accept = () => {
    if (preview.target === 'body' || preview.target === 'title') setForm((f) => ({ ...f, [preview.target]: preview.after }));
    else setExtra((x) => ({ ...x, [preview.target]: preview.after }));
    setPreview(null);
  };
  const saveDraft = () => { localStorage.setItem('dd_draft', JSON.stringify(form)); setNote({ type: 'success', msg: 'Draft saved in this browser.' }); };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ userId: true, title: true, body: true });
    if (!valid) return;
    setBusy(true); setNote(null);
    try {
      const res = await createPost({ title: form.title.trim(), body: form.body.trim(), userId: Number(form.userId) });
      if (res.status === 201) {
        addLocalPost({ id: `L${Date.now()}`, title: form.title.trim(), body: form.body.trim(), userId: Number(form.userId), tags: extra.tags, excerpt: extra.excerpt, createdAt: new Date().toISOString() });
        localStorage.removeItem('dd_draft');
        setForm(empty); setExtra({ tags: '', excerpt: '' }); setTouched({}); setPreview(null);
        setNote({ type: 'success', msg: 'Article submitted (HTTP 201). Note: JSONPlaceholder does not store data; a local copy is queued for moderation in Admin.' });
      } else setNote({ type: 'error', msg: `Unexpected response status ${res.status}.` });
    } catch (err) { setNote({ type: 'error', msg: `Could not submit: ${err.message} Your content is preserved.` }); } finally { setBusy(false); }
  };

  const count = (k) => { const n = form[k].length; const [min, max] = LIMITS[k]; return <span className={n < min || n > max ? 'field-error' : 'muted'}>{n}/{max}</span>; };

  return (
    <section className="container narrow">
      <h1>Publish an article</h1>
      <AlertBanner type={note?.type} message={note?.msg} onDismiss={() => setNote(null)} />
      {users.error && <AlertBanner message={`Authors failed to load: ${users.error}`} onRetry={users.reload} />}
      <form className="glass pad stack" onSubmit={submit} noValidate>
        <label>Author
          <select value={form.userId} onChange={set('userId')} onBlur={() => setTouched((t) => ({ ...t, userId: true }))} disabled={users.loading} aria-invalid={!!show('userId')}>
            <option value="">{users.loading ? 'Loading authors…' : 'Select an author'}</option>
            {(users.data || []).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </label>
        {show('userId') && <p className="field-error">{errors.userId}</p>}

        <label><span className="row between">Title {count('title')}</span>
          <input value={form.title} onChange={set('title')} onBlur={() => setTouched((t) => ({ ...t, title: true }))} aria-invalid={!!show('title')} />
        </label>
        {show('title') && <p className="field-error">{errors.title}</p>}

        <div className="row between"><strong>Description</strong>
          <span className="row"><button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} aria-pressed={editing}>Edit</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(false)} aria-pressed={!editing}>Preview</button></span></div>
        {editing ? (
          <label className="sr-label">Description <span className="row between"><span /> {count('body')}</span>
            <textarea rows={6} value={form.body} onChange={set('body')} onBlur={() => setTouched((t) => ({ ...t, body: true }))} aria-invalid={!!show('body')} />
          </label>
        ) : <div className="glass pad preview">{form.body || <span className="muted">Nothing to preview.</span>}</div>}
        {show('body') && <p className="field-error">{errors.body}</p>}

        <details className="ai-panel glass pad" open>
          <summary><strong>✦ Improve with AI</strong></summary>
          {ai.loading ? <p className="muted">Checking AI status…</p> : !ai.data?.configured ? (
            <p className="muted">AI actions are disabled: no provider is configured. Copy <code>.env.example</code> to <code>.env</code>, add a server-side key and model, then run <code>npm run server</code>. See README.</p>
          ) : <p className="muted small">Providers ready: {ai.data.providers.filter((p) => p.ready).map((p) => `${p.name} (${p.model})`).join(', ')}. Suggestions never overwrite your text until you accept.</p>}
          <div className="chips">
            {ACTIONS.map(([a, label, target]) => (
              <button key={a} type="button" className="btn btn-sm" disabled={!ai.data?.configured || !!aiBusy || (!form.body.trim() && !form.title.trim())} onClick={() => runAction(a, target)}>
                {aiBusy === a ? 'Working…' : label}</button>
            ))}
          </div>
          {nonEnglish && (
            <AlertBanner type="warning" message="This text doesn’t look like English. Articles must be published in English."
              onRetry={ai.data?.configured ? () => runAction('translate', 'body') : undefined} />
          )}
          {aiErr && <AlertBanner message={aiErr} onRetry={lastAction ? () => runAction(...lastAction) : undefined} onDismiss={() => setAiErr(null)} />}
          {preview && (
            <div className="compare" aria-live="polite">
              <div><h4>Before ({preview.target})</h4><p className="muted">{preview.before || '—'}</p></div>
              <div><h4>After <small className="muted">AI · {preview.provider}</small></h4><p>{preview.after}</p></div>
              <div className="row"><button type="button" className="btn btn-sm" onClick={accept}>Accept</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>Reject</button></div>
            </div>
          )}
          {(extra.tags || extra.excerpt) && <p className="small">{extra.tags && <>Tags: <strong>{extra.tags}</strong> </>}{extra.excerpt && <>· Excerpt: {extra.excerpt}</>}</p>}
        </details>

        <div className="row wrap">
          <button className="btn" disabled={busy || !valid}>{busy ? 'Submitting…' : 'Submit article'}</button>
          <button type="button" className="btn btn-ghost" onClick={saveDraft}>Save draft</button>
        </div>
      </form>
    </section>
  );
}
