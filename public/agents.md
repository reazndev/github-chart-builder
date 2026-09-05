---
name: github-chart-builder
description: |
  GitHub Chart Builder renders any GitHub user's contribution history as a
  customizable SVG chart for READMEs and portfolios. Use this skill to choose
  the path that matches the work the agent needs to do.
---

# GitHub Chart Builder

Turn any GitHub contribution history into an embeddable SVG. No SDK, no signup
for public data. One image endpoint, one repo-list endpoint, one theme store.

Base: `https://gh.ruu.by` (override with your deploy origin in dev).
Machine spec: [`/openapi.json`](./openapi.json) · Short ref: [`/llms.txt`](./llms.txt)

## Choose your path

Choose the path that matches the task:

- **Public chart for a README/portfolio** -> Path A (embed)
- **Private contributions included** -> Path B (OAuth)
- **Browse or reuse community themes** -> Path C (theme store)
- **Just need raw schemas** -> `/openapi.json`

---

## Path A: Embed a public chart

```md
![contributions](https://gh.ruu.by/api/github-contributions/USERNAME?months=12)
```

1. Replace `USERNAME` with the GitHub login.
2. Tune query params (all optional, defaults shown):
   `months=12` (1–48, overrides `from`/`to`) · `from`/`to` as `YYYY-MM-DD`
   (`to` defaults to today) · `repo=owner/repo,other/repo` (bare names count
   as owned by the user) · `boxSize=12` / `boxSpacing=3` / `borderRadius=3` ·
   `backgroundColor=transparent` / `inactiveColor` / `minActivityColor` /
   `maxActivityColor` / `labelColor` as `#rrggbb` · `showLabels=true` /
   `showYears=false` / `ignoreOutliers=false`.
3. Paste the URL as a Markdown image or `<img>` tag. No token needed.

Output is `image/svg+xml` (cached ~10 min server, 1h CDN). Days carry
`<title>` tooltips. `500 {error, details}` means bad username or GitHub
upstream trouble — surface `details`.

## Path B: Private contributions (OAuth)

Public charts need no token. For private activity the human must log in first:

1. Human opens `GET /api/auth/github` (`repo,read:user` scope) and approves.
2. The callback lands on `/?token=<aes-256-gcm>&username=<login>`; the app
   stores the blob in localStorage and attaches it as `?token=` (chart) or
   `Authorization: Bearer` (repo list).

Hard rules:

- `token=` is **always** the encrypted payload. Never send, log, or commit
  a raw GitHub PAT.
- Never publish or embed a URL containing `?token=`. Anyone holding it can
  list private repo **names** (`/api/github-repos/{username}`) and private
  per-day **counts** until the grant is revoked. It cannot read source code
  — this API only exposes names + counts, and GitHub rejects the blob.

## Path C: Community themes

Human page: `/themes`. To apply a theme, set its three colors on the chart URL.

- `GET /api/themes` → newest-first `[{id,name,inactiveColor,minActivityColor,maxActivityColor,likes,createdAt}]`
- `POST /api/themes` → `{name,inactiveColor,minActivityColor,maxActivityColor,clientId}`
  (anonymous browser id, salted+hashed server-side; 3/hour + 10 total per id
  in production)
- `POST /api/themes/:id/like` → `{clientId}`, one like per id
- Built-in preset hexes live under `x-presets` in `/openapi.json`.
