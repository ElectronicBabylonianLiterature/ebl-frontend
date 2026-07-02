# TASK-743 — Work Log: RlA preview won't open in production

## Symptom

RlA page preview ("Show RlA page") works in dev but does not open in production.

## Investigation

The preview lives in `src/realia/ui/ReallexikonArticle.tsx` and
`src/realia/infrastructure/rlaPageIndex.ts`. It:

1. `fetch()`es the index JSON from `https://publikationen.badw.de/de/rla/index/index.json`
2. renders the page as `<img src="https://publikationen.badw.de/de/rla/a/{volume}.{scan}.jpg">`

Both resources live on the external host `publikationen.badw.de`.

Dev (webpack dev server) sends **no** CSP header → both resources load → works.

Production is served with a strict CSP defined in `public/serve.json`:

- `connect-src 'self' https: ...` — the `https:` scheme-source permits the JSON
  `fetch()` to `publikationen.badw.de`, so index loading succeeds.
- `img-src 'self' data: blob: https://cdli.earth https://cdn.auth0.com
https://*.google-analytics.com https://*.googletagmanager.com` — does **not**
  include `publikationen.badw.de`, so the page `<img>` is blocked by CSP.

## Root cause

The production CSP `img-src` directive in `public/serve.json` omits
`https://publikationen.badw.de`. The panel expands but the RlA page image is
CSP-blocked, so nothing usable appears in production.

## Proposed fix (not yet applied — investigation task)

Add `https://publikationen.badw.de` to the `img-src` directive in
`public/serve.json`.
