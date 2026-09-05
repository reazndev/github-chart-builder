# GitHub Chart Builder — Agent Guide

> Canonical base: `https://gh.ruu.by` (override with your deploy origin in dev).
> Machine spec: [`/openapi.json`](./openapi.json) · Short ref: [`/llms.txt`](./llms.txt)

## What this is

One image endpoint that renders any GitHub user's contribution history as a
customizable SVG. No SDK, no signup for public data. Embed anywhere with a URL.

## Quick start

```md
![contributions](https://gh.ruu.by/api/github-contributions/USERNAME?months=12)
```

1. Replace `USERNAME` with the GitHub login.
2. Tune query params (below).
3. Paste the URL as a Markdown image into a README / portfolio / `<img>` tag.

## Endpoints

### `GET /api/github-contributions/{username}` → `image/svg+xml`

| Param | Meaning | Example |
|---|---|---|
| `months` (1–48) | Preset range ending today. Overrides `from`/`to`. | `?months=12` |
| `from` / `to` | Custom range `YYYY-MM-DD`. `to` defaults to today. | `?from=2024-01-01` |
| `repo` | Comma-separated `owner/repo` or bare names (bare = owned by user). | `?repo=facebook/react` |
| `boxSize` / `boxSpacing` / `borderRadius` | Cell geometry in px. | `12 / 3 / 3` |
| `backgroundColor` / `inactiveColor` / `minActivityColor` / `maxActivityColor` | Hex `#rrggbb` or `transparent` (bg only). | `#ebedf0` |
| `labelColor` / `showLabels` / `showYears` | Month + year markers. | `true / false` |
| `ignoreOutliers` | Clip color scale to 98th percentile of active days. | `false` |
| `token` | Encrypted OAuth payload for **private** contributions (see Auth). | — |

Output is cached ~10 min server-side, 1h CDN header. Days carry `<title>`
tooltips (`date + count`). Treat `500 {error, details}` as "bad username or
GitHub upstream error" and surface `details`.

### `GET /api/github-repos/{username}` → `["owner/repo", …]`

Repo names for autocomplete (up to 100, newest first). Accepts the same
optional encrypted `token` via `?token=` or `Authorization: Bearer`.

### `GET /api/auth/github` → `302`

Starts GitHub OAuth (`repo,read:user`). The callback returns the browser to
`/?token=<aes-256-gcm>&username=<login>`. The frontend stores the blob in
localStorage and attaches it to API calls.

### Theme store

- `GET /api/themes` → `[{id,name,inactiveColor,minActivityColor,maxActivityColor,likes,createdAt}]` (newest first).
- `POST /api/themes` → `{name,inactiveColor,minActivityColor,maxActivityColor,clientId}` (anonymous browser id; 3/hour + 10 total per id in production).
- `POST /api/themes/:id/like` → `{clientId}`, one like per id.
- Human page: `/themes`. To apply a theme, set the three colors on the chart URL.

## Auth rules (hard requirements)

- `token=` is **always** the encrypted payload from the OAuth callback.
  Never send, log, or commit a raw GitHub PAT.
- Never publish or embed a URL containing `?token=` — anyone holding it can
  list that user's private repo **names** and private contribution **counts**
  via this API until the OAuth grant is revoked. It cannot read source code
  (this API only exposes names + per-day counts, and GitHub rejects the blob).
- Public charts need no token at all.

## Notes

- `CORS: *` on `GET` — safe to fetch/embed from any origin.
- Theme presets (github, sunset, ocean, …) with exact hexes live under
  `x-presets` in `/openapi.json`.
- Something wrong? Retry once after a minute (upstream rate limits), then
  report `details` from the JSON error body.
