---
name: mcmaster-web-performance
description: Harness-neutral skill for building fast sites with an app shell, inline critical CSS, immutable assets, and hover-prefetch navigation.
---

# Build for McMaster-Carr-grade performance

McMaster-Carr is one of the fastest large sites on the web. Its speed is **not** a
framework — it's a set of techniques: an app shell with inlined critical CSS and
zero render-blocking resources, immutable version-prefixed asset URLs, and
**prefetch-on-hover** that loads the next page before you click. This skill is a
**build kit** that reproduces those techniques — **and** a clean, themeable base
look — so a new site starts fast and finished.

Two pieces, both in this skill directory:

- **`reference/`** — a runnable, framework-free starter (plain Node + HTML/CSS/JS).
  It carries both the **base visual style** (`reference/theme.css`: a token-driven
  design system — masthead, left-flush sidebar, hero, tiles, cards, footer) and
  every performance technique. Read it, run it, **start new sites from it**: rebrand
  by overriding the `:root` tokens in `theme.css`, then fill in your content. See
  **Base visual style** below.
- **`audit.mjs`** — a Playwright verifier that loads any URL and grades it against
  **hardcoded** McMaster targets (no call to mcmaster.com). Run it against the
  reference build (all PASS) and against the site you're building.

Paths below are relative to the directory that contains this `SKILL.md`.

## Prerequisites

The reference site needs only Node 18+. The verifier additionally needs Playwright:

```bash
cd path/to/mcmaster-web-performance
npm i playwright@latest
npx playwright install chromium
```

## Run the reference build, then verify it (agent path)

Start the reference site (it has no dependencies), then grade it:

```bash
# terminal 1 — the reference implementation:
cd path/to/mcmaster-web-performance/reference
node server.mjs            # -> http://localhost:8000

# terminal 2 — verify it against the hardcoded McMaster targets:
cd path/to/mcmaster-web-performance
node audit.mjs            # defaults to http://localhost:8000
```

The reference build scores **all PASS** (verified output — local numbers are
near-zero because there's no network/CDN in front of it):

```
METRIC               THIS PAGE        McMASTER     VERDICT
TTFB                 4ms              217ms        PASS
First Contentful Pnt 0ms              372ms        PASS
Doc transfer         11878 B          ~14.5 KB     PASS
Render-blocking CSS  0                0            PASS
Sync <script> in head 0               0            PASS
Inline critical CSS  yes (7546 ch)    yes (~32k)   PASS
preload hints        2                13           PASS
dns-prefetch hints   1                3            PASS
hover-prefetch       yes              yes          PASS
```

Point it at the site you're building to find what's missing (a MISS names the
technique to add):

```bash
node audit.mjs https://your-site.com
node audit.mjs https://your-site.com --no-prefetch   # skip hover test, ~2.5s faster
```

It writes a screenshot to `audit-shot.png`. The verifier discriminates: a typical
site (e.g. getbootstrap.com) MISSes on render-blocking CSS, sync `<head>` scripts,
inline critical CSS, preload, and hover-prefetch.

## The techniques (and where to copy them from)

Each maps to a measured McMaster behavior and a spot in `reference/`.

1. **App shell + inline critical CSS, zero render-blocking.** The first HTML
   response carries everything needed for first paint: a `<style>` block of
   above-the-fold CSS, no `<link rel=stylesheet>`, no synchronous `<script src>`
   in `<head>`. McMaster inlines ~32 KB CSS + ~8 KB JS; the whole shell is
   ~14.5 KB over the wire (brotli). → `reference/server.mjs` `shell()`.

2. **Defer + preload the rest, together.** Non-critical CSS loads via
   `<link rel=preload as=style>` **plus** `<link rel=stylesheet media=print
   onload="this.media='all'">` (downloads early, applies without blocking paint);
   JS uses `<script defer>` after a `<link rel=preload as=script>`. McMaster pairs
   an inert `data-deferred-src` tag with a `preload` link and a loader that
   promotes it. → `reference/server.mjs` `shell()`, `<head>` + end of `<body>`.

3. **Prefetch on hover-intent, then memoize.** Hovering/touching/focusing an
   internal link fetches its destination and caches it; the click swaps `<main>`
   from cache with `history.pushState` and **no full reload**. Each target is
   fetched at most once. This is the biggest "feels instant" win — the reference
   build swaps prefetched content in **~1 ms**. → `reference/public/assets/v1/app.js`.

4. **Immutable, version-prefixed asset URLs.** Static assets and prefetch
   fragments return `cache-control: public, max-age=31536000, immutable`;
   cache-bust by changing a version segment in the path (`/assets/v1/...`,
   McMaster uses `/mv1780687622/...`). The HTML *document* stays `no-cache` so a
   new release ships instantly — freshness lives in the asset URLs, not the doc.
   → `reference/server.mjs` response headers (the `VER` constant).

5. **Resource hints.** `dns-prefetch` for asset/font origins; `preload` for the
   handful of resources first paint truly needs (fonts, hero, the deferred
   CSS/JS). → `reference/server.mjs` `shell()` `<head>`.

### Further McMaster techniques (measured, for scaling up)

- **HTTP-level bundling**: combine many JS/CSS files into one hash-named, immutable
  request (`ScriptCombiner/mcm_<hash>.js?files=<packed-ids>`). Keep scripts ≤6,
  stylesheets ≤3.
- **Differential serving**: ES6 vs ES5 bundles by feature detection
  (`supportsES6 → ?useEs6=true`).
- **CSS sprites** for many small icons; preload the above-the-fold ones.
- **Service worker** for repeat visits, self-healing (404 → clear caches +
  unregister + reload).
- **RUM via image beacons** (`GET /204.asp?navigationStart=...&domInteractive=...`)
  — measure field performance, not just lab.

The lesson is the *techniques*, not the stack (McMaster is server-rendered
ASP.NET). They port directly: in **Next.js** use the App Router with
`next/link` prefetch + `Cache-Control: immutable` on `/_next/static`; in **Astro**
use `<ClientRouter>`/view transitions + `prefetch`; anywhere, inline critical CSS
and serve hashed assets as immutable.

## Base visual style (the reusable look)

So every new site starts clean and structured — not plain — without re-deriving it.
The look lives in **`reference/theme.css`**, a token-driven design system that is
inlined as critical CSS by `reference/server.mjs`. It is content-agnostic: it suits
a store, dashboard, docs site, or landing page.

**Rebrand by overriding the `:root` tokens** at the top of `theme.css` — nothing
else needs to change:

```css
:root{ --brand:#0b7a9b; --accent:#137a42; --ink:#15242c; --line:#e2e8ec;
       --font:-apple-system,Segoe UI,Roboto,sans-serif; --r:8px; --head:56px; }
```

**The shell skeleton** (in `server.mjs` `shell()`) — masthead + **left-flush**
sidebar + content + footer, with `#app` as the client-nav swap target:

```html
<div class="promo">…</div>
<header class="masthead"><a class="brand" data-nav href="/">Brand</a>
  <form class="search"><input placeholder="Search…"></form><span class="acct">…</span></header>
<div class="shell">
  <aside class="sidebar"><nav class="nav"><a data-nav href="/x" class="active">…</a></nav></aside>
  <div class="content"><main id="app"><!-- page --></main></div>
</div>
<footer class="site">…</footer>
```

**Component classes** (all in `theme.css`, all generic): `.masthead/.brand/.search`,
`.shell/.sidebar/.nav` (left sidebar, sticky, full-height, `.active` state synced by
`app.js` `setActive()`), `.content`, `.hero`, `.tiles/.tile` (collage category tiles),
`.grid/.card/.thumb/.price/.rate/.badge`, `.btn`/`.btn.ghost`, `footer.site`, `#flash`
(toast). Cards/tiles get hover-lift from the deferred `main.css`.

**Optional modules** (kept out of the base — add only when the site needs them; see
the `aquatic-haven` example for working versions): a **cart** (localStorage + count
badge, rendered client-side and served `no-cache` like McMaster's personalized
parts), **search** (a `/api/suggest` autocomplete + a `/search` results page), and a
product **spec table**.

**Cache-bust discipline (don't skip):** assets are served `immutable`, so a browser
pins them forever. **Bump `VER`** (`/assets/v1` → `/assets/v2`, the `VER` constant —
and any hardcoded asset paths) on *every* asset change, or your edits won't show up
and a stale `app.js` can make features look broken. Freshness lives in the URL.

## Gotchas

- **Measure render-blocking on the INITIAL HTML, not the loaded DOM.**
  `page.content()` returns the post-load DOM where deferred stylesheets have been
  promoted to real `<link rel=stylesheet>` — making a perfectly-optimized page
  look like it has render-blocking CSS. `audit.mjs` reads `await resp.text()` (the
  first response body) for this. Any static-HTML audit must do the same.
- **A reference fragment/prefetch endpoint must be same-origin** for the hover
  probe to count it. The verifier counts `xhr`/`fetch`/`document` requests fired
  after dispatching hover on same-origin links.
- **Don't name a JS variable `URL`** — it shadows the global `URL` constructor and
  `new URL(...)` throws `URL is not a constructor`.
- **`cache-control: no-cache` on the HTML document is correct**, not a bug: the
  shell revalidates so releases ship instantly; the *versioned assets* it points
  to are `immutable`.
- **The reference server does not gzip/brotli** (so `compression: 0/N` locally) —
  that's the CDN/host's job in production. Don't "fix" it in the demo.
- **The inline-critical-CSS check passes above ~800 chars.** A real critical-CSS
  block is ≥1 KB; the demo's is 1590 chars. Tune the threshold in `audit.mjs` if
  your critical CSS is legitimately tiny.

## Troubleshooting

- `browserType.launch: Executable doesn't exist` → `npx playwright install chromium`.
- `Cannot find package 'playwright'` when running a script → run it from the skill
  directory (where `node_modules` lives), not from `/tmp`.
- `audit.mjs` reports `ECONNREFUSED` / goto timeout on the default URL → the
  reference server isn't running; start `node reference/server.mjs` first, or pass
  your own URL.
- `hover-prefetch: no` on a site you expect to prefetch → it may use
  `<link rel=prefetch>` injection or `IntersectionObserver` viewport prefetch
  instead of hover; check the `requests:` delta and `prefetch links` count
  manually.
- Port 8000 in use → `PORT=9000 node server.mjs` then `node audit.mjs http://localhost:9000`.
