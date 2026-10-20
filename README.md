# DevDirectory — Blackhall Ultra Neon

React 18 + React Router 6 + Axios (Vite). Folder layout follows the lab spec (`src/components, context, hooks, pages, services`).

## Run
```bash
npm install
cp .env.example .env      # optional: only needed for real AI
npm run dev               # http://localhost:5173
npm run server            # optional AI proxy on :8787 (Node 20+)
npm run build && npm run preview
```
Demo logins (password `demo1234`): `admin`, `publisher`, `user` — or their email / mobile (see `AuthContext.jsx`).

## What is fully functional (no credentials)
Routes `/ /users /users/:id /login /add-post *`; protected-route redirect with return to original path; debounced search,
company/skill filters, sort, pagination, bookmarks; profiles + publications; loading skeletons, error banners with Retry, empty states;
controlled AddPost form (title 5–80, body 20–500, live counts, inline errors, 201 success + reset, draft save, preview);
persistent dark/light theme; home stats computed from API data; floating help widget (built-in FAQ, labeled "not AI").

## Needs credentials
Real AI (Improve with AI actions, AI chat). Set keys **only** in the server `.env`; the browser never sees them.
Providers: OpenAI-compatible, Gemini, Anthropic, local OpenAI-compatible endpoint; `AI_PRIMARY` + optional `AI_FALLBACK`.
You must set the `*_MODEL` value yourself. Without a provider, AI buttons are disabled with instructions — nothing is faked.
For deployment, host `server/index.js` and set `VITE_AI_PROXY_URL` (a URL, not a secret).

## Needs a backend/database (NOT implemented)
- Real authentication: demo adapter is client-side and insecure by design. No registration, no OTP, no verified email/mobile linking, no server-side role enforcement.
- Durable data: JSONPlaceholder accepts POSTs but stores nothing. Admin deactivate/delete/moderation and the audit log use a **local, per-browser demo adapter** (`services/adminStore.js`).
- Not built: editable developer forms, profile editing, translate-before-publish enforcement (English check warns and offers AI translate), canvas particles, rate limiting on the proxy.

## Environment variables
See `.env.example`.
