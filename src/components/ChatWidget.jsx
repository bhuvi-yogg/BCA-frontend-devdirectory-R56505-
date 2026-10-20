import { useState, useRef, useEffect } from 'react';
import { chatAi, getAiStatus } from '../services/aiService';
import { getUsers } from '../services/postService';
import useFetch from '../hooks/useFetch';

const SUGGESTED = ['How do I find a developer?', 'How do I publish an article?', 'How does login work?'];
// Built-in answers (clearly labeled) used only when no AI provider is configured.
const FAQ = [
  [/find|search|developer|skill/i, 'Open Developers, then search by name, username, company or skill. Filters and sorting are above the grid.'],
  [/publish|article|post|write/i, 'Sign in, open Publish, choose an author, then write a title (5–80 chars) and body (20–500 chars). Use "Improve with AI" if AI is configured.'],
  [/login|log in|sign|account/i, 'Log in with email, username or mobile. Demo accounts: admin, publisher, user — password demo1234 (demonstration only).'],
  [/profile|edit/i, 'Profiles are read-only in this demo; admins can deactivate developers from the Admin page (local demo storage).'],
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [last, setLast] = useState('');
  const end = useRef(null);
  const status = useFetch(() => getAiStatus().catch(() => ({ configured: false })), []);
  const users = useFetch(() => getUsers().catch(() => []), []);
  const ai = status.data?.configured;
  const context = (users.data || []).map((u) => `${u.name} (${u.role}, ${u.company.name}; ${u.skills.join('/')})`).join('; ');

  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs, busy, open]);

  const send = async (text, retry = false) => {
    const q = text.trim(); if (!q || busy) return;
    const history = retry ? msgs : [...msgs, { role: 'user', content: q }];
    setMsgs(history); setInput(''); setErr(null); setLast(q); setBusy(true);
    try {
      if (ai) {
        const r = await chatAi(history, context);
        setMsgs([...history, { role: 'assistant', content: r.text, src: `AI · ${r.provider}` }]);
      } else {
        const hit = FAQ.find(([re]) => re.test(q));
        setMsgs([...history, { role: 'assistant', content: hit ? hit[1] : 'I can answer basic questions about searching developers, publishing and login. Real AI chat needs the AI proxy configured (see README).', src: 'Built-in help (not AI)' }]);
      }
    } catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  if (!open) return <button className="fab" onClick={() => setOpen(true)} aria-label="Open help assistant">✦ Help</button>;
  return (
    <section className="chat glass" aria-label="Help assistant">
      <div className="row between chat-head">
        <strong>Help assistant</strong>
        <span className="row">
          <button className="btn btn-ghost btn-sm" onClick={() => { setMsgs([]); setErr(null); }}>Clear</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)} aria-label="Collapse assistant">—</button>
        </span>
      </div>
      <div className="chat-body" aria-live="polite">
        {!msgs.length && <><p className="muted">{ai ? 'Ask about developers and publishing.' : 'AI provider not configured — answering from built-in help.'}</p>
          <div className="chips">{SUGGESTED.map((s) => <button key={s} className="chip chip-btn" onClick={() => send(s)}>{s}</button>)}</div></>}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>{m.content}{m.src && <small className="muted"> {m.src}</small>}</div>
        ))}
        {busy && <div className="bubble assistant muted">Thinking…</div>}
        {err && <div className="alert alert-error" role="alert">{err} <button className="btn btn-sm" onClick={() => send(last, true)}>Retry</button></div>}
        <div ref={end} />
      </div>
      <form className="row chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input aria-label="Your question" value={input} maxLength={300} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question…" />
        <button className="btn btn-sm" disabled={busy || !input.trim()}>Send</button>
      </form>
    </section>
  );
}
