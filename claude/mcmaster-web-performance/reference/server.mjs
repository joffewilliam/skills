#!/usr/bin/env node
// Reference implementation: McMaster-Carr PERFORMANCE techniques + a generic,
// themeable BASE VISUAL STYLE (theme.css). Plain Node, no framework, so both are
// visible in raw form and port to any stack. Rebrand by editing theme.css tokens;
// fill in your own content. Demonstrates:
//   1. App shell + inlined critical CSS (theme.css), ZERO render-blocking <head>
//   2. Deferred + preloaded non-critical CSS/JS
//   3. Prefetch-on-hover -> instant client nav (#app swap) + active-sidebar sync
//   4. Immutable, version-prefixed asset URLs (bump VER to cache-bust)
//   5. Left-flush sidebar shell, masthead, tiles, cards, footer — the base look
//   node server.mjs            # http://localhost:8000
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = +(process.env.PORT || 8000);
const VER = 'v1'; // bump on each asset change -> new immutable URL, instant cache-bust
const THEME = await readFile(join(__dirname, 'theme.css'), 'utf8'); // inlined as critical CSS

// --- placeholder content (swap for your own; the point is the shell + style) ---
const SECTIONS = {
  fastening:  { name: 'Fastening', items: ['Socket Screws', 'Hex Bolts', 'Washers', 'Threaded Rod', 'Rivets', 'Anchors'] },
  hardware:   { name: 'Hardware',  items: ['Hinges', 'Handles', 'Brackets', 'Casters', 'Latches', 'Knobs'] },
  tools:      { name: 'Tools',     items: ['Wrenches', 'Pliers', 'Screwdrivers', 'Hammers', 'Files', 'Calipers'] },
  pipe:       { name: 'Pipe & Fittings', items: ['Elbows', 'Tees', 'Couplings', 'Valves', 'Flanges', 'Caps'] },
  electrical: { name: 'Electrical', items: ['Wire', 'Connectors', 'Conduit', 'Switches', 'Breakers', 'Fuses'] },
  materials:  { name: 'Materials', items: ['Aluminum Bar', 'Steel Sheet', 'Brass Rod', 'Tubing', 'Angle', 'Plate'] },
};
const slugs = Object.keys(SECTIONS);
const price = (s, i) => (4 + ((s.length * 7 + i * 13) % 90)) + 0.99;

// --- views (content of #app; reused for full render AND prefetch fragments) ---
const card = (name, i) => `<div class="card">
  <span class="thumb">${name[0]}</span>
  <span class="pname">${name}</span><span class="pcat">In stock</span>
  <span class="meta"><b class="price">$${price(name, i).toFixed(2)}</b><span class="rate">★★★★☆</span></span></div>`;
const tile = (slug) => {
  const s = SECTIONS[slug];
  return `<a class="tile" data-nav href="/category/${slug}">
    <span class="tile-imgs">${s.items.slice(0, 4).map(n => `<span>${n[0]}</span>`).join('')}</span>
    <span class="tile-name">${s.name}<small>${s.items.length} items</small></span></a>`;
};
const homeMain = () => `<section class="hero">
    <span class="eyebrow">Base reference · themeable</span>
    <h1>A fast site, styled and structured</h1>
    <p>App shell, inlined critical CSS, prefetch-on-hover nav, and immutable assets — wrapped in a clean, left-sidebar layout you re-theme with CSS tokens.</p>
    <a class="btn" data-nav href="/category/tools">Browse tools</a></section>
  <h2 class="sec">Shop by section</h2>
  <div class="tiles">${slugs.map(tile).join('')}</div>`;
const categoryMain = (slug) => {
  const s = SECTIONS[slug];
  if (!s) return `<h1>Not found</h1><p><a data-nav href="/">Back home</a></p>`;
  return `<nav class="crumb"><a data-nav href="/">Home</a><span>›</span>${s.name}</nav>
    <div class="pagehead"><h1>${s.name}</h1><p class="lede">Placeholder ${s.name.toLowerCase()} listing — drop in your own content; the layout and styling carry over.</p></div>
    <div class="toolbar"><span><b>${s.items.length}</b> items</span><span class="muted">Sorted by popularity</span></div>
    <div class="grid">${s.items.map(card).join('')}</div>`;
};

// --- the app shell: masthead + LEFT sidebar + content + footer. theme.css inline. ---
const sidebar = (active) => `<aside class="sidebar"><div class="side-h">Sections</div><nav class="nav">
  <a data-nav href="/"${active === 'home' ? ' class="active"' : ''}>Home</a>
  ${slugs.map(s => `<a data-nav href="/category/${s}"${active === s ? ' class="active"' : ''}>${SECTIONS[s].name}<span class="n">${SECTIONS[s].items.length}</span></a>`).join('')}
  </nav></aside>`;
const footer = `<footer class="site"><div class="foot-in">
  <div><h4>Sections</h4>${slugs.slice(0, 3).map(s => `<a data-nav href="/category/${s}">${SECTIONS[s].name}</a>`).join('')}</div>
  <div><h4>More</h4>${slugs.slice(3).map(s => `<a data-nav href="/category/${s}">${SECTIONS[s].name}</a>`).join('')}</div>
  <div><h4>Help</h4><a>Shipping</a><a>Returns</a><a>Contact</a></div>
  <div><h4>Acme</h4><p class="muted" style="color:#bcd9e2;font-size:12.5px">A base reference for fast, well-structured sites.</p></div>
  </div><div class="foot-bot">© 2026 Acme · base reference built with McMaster-Carr techniques</div></footer>`;

const shell = (main, title, active) => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · Acme</title>
<link rel="dns-prefetch" href="//fonts.gstatic.com">
<link rel="preload" href="/assets/${VER}/app.js" as="script">
<link rel="preload" href="/assets/${VER}/main.css" as="style">
<style>${THEME}</style>
</head><body>
<div class="promo">⚡ <b>Free shipping over $49</b> · ships same day · base reference template</div>
<header class="masthead"><a class="brand" data-nav href="/">Acme <span>· base reference</span></a>
<form class="search" role="search" onsubmit="return false"><input placeholder="Search…" aria-label="Search"></form>
<span class="acct"><a>Account</a><a>Cart</a></span></header>
<div class="shell">${sidebar(active)}<div class="content"><main id="app">${main}</main></div></div>
${footer}
<div id="flash"></div>
<link rel="stylesheet" href="/assets/${VER}/main.css" media="print" onload="this.media='all'">
<script src="/assets/${VER}/app.js" defer></script>
</body></html>`;

const send = (res, status, body, headers = {}) => { res.writeHead(status, headers); res.end(body); };
const IMMUTABLE = { 'cache-control': 'public, max-age=31536000, immutable' };
const DOC = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' };

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  try {
    if (p.startsWith('/assets/')) {
      const body = await readFile(join(__dirname, 'public', p));
      const ct = extname(p) === '.js' ? 'text/javascript' : extname(p) === '.css' ? 'text/css' : 'application/octet-stream';
      return send(res, 200, body, { 'content-type': ct, ...IMMUTABLE });
    }
    if (p.startsWith('/fragment/')) {
      const rest = p.slice('/fragment'.length); // '/home' | '/category/:slug'
      const main = rest === '/home' ? homeMain() : rest.startsWith('/category/') ? categoryMain(rest.slice(10)) : null;
      if (main == null) return send(res, 404, 'no fragment', { 'content-type': 'text/plain' });
      return send(res, 200, main, { 'content-type': 'text/html; charset=utf-8', ...IMMUTABLE });
    }
    if (p === '/') return send(res, 200, shell(homeMain(), 'Home', 'home'), DOC);
    if (p.startsWith('/category/')) {
      const slug = p.slice('/category/'.length).replace(/\/$/, '');
      const s = SECTIONS[slug];
      return send(res, s ? 200 : 404, shell(categoryMain(slug), s ? s.name : 'Not found', slug), DOC);
    }
    return send(res, 404, shell('<h1>404</h1><p><a data-nav href="/">Back home</a></p>', 'Not found', ''), DOC);
  } catch (e) {
    return send(res, 500, 'error: ' + e.message);
  }
});
server.listen(PORT, () => console.log(`base reference -> http://localhost:${PORT}`));
