# AGENTS.md

React + Vite frontend (`src/`, `dist/`) + Express API (`server.js`) on port 8030.

## Commands

- `npm run dev` — Vite :5173 proxied to Express :8030
- `npm start` / `node server.js` — serves `dist/` + API
- `npm run build` — Vite build to `dist/`

## Env

`GITHUB_TOKEN` (public data), `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` (private-repo OAuth),
`GITHUB_REDIRECT_URI`, `ENCRYPTION_KEY` (AES-256-GCM for `token=` payloads).

## Rules

- `token=` query is ALWAYS the encrypted OAuth payload. Never accept, log, or commit raw PATs.
- API change → update `public/openapi.json` + `public/llms.txt` in the same PR.
- New page → add to `public/sitemap.xml` + `index.html` JSON-LD if indexable.
- Style: LESS IS MORE. Reuse `.card`, `.btn`, `.form-*` in `src/App.css`. No new deps for static surfaces.
- SPA routes: pathname-based in `src/App.jsx` (no react-router). Server `*` fallback serves `index.html`.
