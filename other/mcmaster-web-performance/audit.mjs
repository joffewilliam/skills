#!/usr/bin/env node
// McMaster-Carr performance verifier.
// Loads any URL in a real headless Chromium, measures the signals that make
// mcmaster.com feel instant, detects each technique, tests hover-prefetch, and
// grades the page against HARDCODED McMaster reference targets (see MCM below).
// No network call to mcmaster.com - the targets are baked in.
//
//   node audit.mjs                         # audit the local reference build (default)
//   node audit.mjs https://your-site.com   # audit the site you are building
//   node audit.mjs https://your-site.com --no-prefetch   # skip hover test (faster)
//
// Requires: npm i playwright@latest && npx playwright install chromium
import { chromium } from 'playwright';

const target = process.argv.find(a => a.startsWith('http')) || 'http://localhost:8000';
const doPrefetch = !process.argv.includes('--no-prefetch');
const origin = new URL(target).origin;

// ---- McMaster reference targets (hardcoded; measured from mcmaster.com) ----
const MCM = { ttfb: 217, fcp: 372, docTransfer: 14492, renderBlocking: 0, inlineCss: true,
              preload: 13, dnsPrefetch: 3, hoverPrefetch: true };

const reqs = [];
const isBeacon = u => /204\.asp|google-analytics|googletagmanager|doubleclick|\/collect\b/i.test(u);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1366, height: 1000 } });
const page = await ctx.newPage();

page.on('response', async r => {
  try {
    const req = r.request();
    if (isBeacon(r.url())) return;
    const h = r.headers();
    reqs.push({ url: r.url(), type: req.resourceType(), status: r.status(),
      cc: h['cache-control'] || '', ce: h['content-encoding'] || '',
      len: +(h['content-length'] || 0) });
  } catch {}
});

const t0 = Date.now();
const resp = await page.goto(target, { waitUntil: 'load', timeout: 60000 });
const wallMs = Date.now() - t0;
// The INITIAL HTML response body - what the browser must parse before first
// paint. Render-blocking analysis must run on this, NOT the post-load DOM
// (page.content()), because deferred/injected <link>s appear there after paint.
const initialHtml = await resp.text().catch(() => '');

// ---- timing / paint metrics from the page itself ----
const m = await page.evaluate(() => {
  const n = performance.getEntriesByType('navigation')[0] || {};
  const paint = {}; performance.getEntriesByType('paint').forEach(p => paint[p.name] = Math.round(p.startTime));
  return { ttfb: Math.round(n.responseStart || 0), dcl: Math.round(n.domContentLoadedEventEnd || 0),
    domComplete: Math.round(n.domComplete || 0), transfer: n.transferSize || 0,
    decoded: n.decodedBodySize || 0, fcp: paint['first-contentful-paint'] || 0 };
});

// ---- static HTML analysis (render-blocking, inline css/js, resource hints) ----
// Run on the INITIAL response body so we measure what blocks first paint.
const html = initialHtml || await page.content();
const headHtml = (html.match(/<head[\s\S]*?<\/head>/i) || [html])[0];
const count = (re, s = headHtml) => (s.match(re) || []).length;
const renderBlockingCss = count(/<link[^>]+rel=["']?stylesheet["']?(?![^>]*\bmedia=["']?print)[^>]*>/gi);
const syncScripts = (headHtml.match(/<script\b[^>]*\bsrc=[^>]*>/gi) || [])
  .filter(s => !/\b(async|defer|type=["']?module)/i.test(s)).length;
const inlineStyleChars = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].reduce((a, x) => a + x[1].length, 0);
const inlineScriptChars = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].reduce((a, x) => a + x[1].length, 0);
const hint = k => count(new RegExp(`rel=["']?${k}["']?`, 'gi'));

// ---- caching: share of static assets cached long/immutable ----
const statics = reqs.filter(r => /script|stylesheet|font|image/.test(r.type));
const longCached = statics.filter(r => /immutable|max-age=(?:[0-9]{5,})/.test(r.cc)).length;
const versionedUrls = statics.filter(r => /\/(v|mv|ver|build|assets)[-_]?\d|[?&]ver=|[?&]v=|\.[a-f0-9]{8,}\./i.test(r.url)).length;
const brotli = reqs.filter(r => /br|zstd/.test(r.ce)).length;

await page.screenshot({ path: 'audit-shot.png' });

// ---- hover-prefetch probe ----
let hoverResult = 'skipped';
if (doPrefetch) {
  const before = reqs.length;
  const links = await page.evaluate((origin) => {
    const seen = new Set(), out = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const u = a.href;
      if (u.startsWith(origin) && u !== location.href && !seen.has(u)) { seen.add(u); out.push(u); }
    });
    return out.slice(0, 8);
  }, origin);
  const tH = Date.now();
  // dispatch real pointer/mouse events (works even for off-viewport custom nav)
  await page.evaluate((origin) => {
    document.querySelectorAll('a[href]').forEach(a => {
      if (a.href.startsWith(origin) && a.href !== location.href) {
        ['pointerover', 'mouseover', 'mouseenter'].forEach(t =>
          a.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })));
      }
    });
  }, origin).catch(() => {});
  await page.waitForTimeout(2500);
  const fired = reqs.slice(before).filter(r => /xhr|fetch|document/.test(r.type));
  // prefer a content prefetch over a tracking/guid beacon for the example
  const example = (fired.find(r => /srch|search|product|catalog|data|api/i.test(r.url)) || fired[0] || {}).url || '';
  hoverResult = fired.length ? `YES - ${fired.length} request(s) fired on hover (e.g. ${decodeURIComponent(example).slice(0, 80)})` : 'no - nothing prefetched on hover';
}

await browser.close();

// ---- report ----
const byType = {}; reqs.forEach(r => byType[r.type] = (byType[r.type] || 0) + 1);
const pad = (s, n) => String(s).padEnd(n);
const grade = (ok) => ok ? 'PASS' : 'MISS';
console.log(`\n=== McMaster Performance Audit ===\n${target}\n`);
console.log(`wall load: ${wallMs}ms   status: ${resp.status()}\n`);
console.log('METRIC               THIS PAGE        McMASTER     VERDICT');
console.log(`TTFB                 ${pad(m.ttfb + 'ms', 16)} ${pad(MCM.ttfb + 'ms', 12)} ${grade(m.ttfb <= MCM.ttfb * 2)}`);
console.log(`First Contentful Pnt ${pad(m.fcp + 'ms', 16)} ${pad(MCM.fcp + 'ms', 12)} ${grade(m.fcp <= 1000)}`);
console.log(`Doc transfer         ${pad(m.transfer + ' B', 16)} ${pad('~14.5 KB', 12)} ${grade(m.transfer <= 60000)}`);
console.log(`Render-blocking CSS  ${pad(renderBlockingCss, 16)} ${pad(0, 12)} ${grade(renderBlockingCss === 0)}`);
console.log(`Sync <script> in head${pad(' ' + syncScripts, 16)} ${pad(0, 12)} ${grade(syncScripts === 0)}`);
console.log(`Inline critical CSS  ${pad((inlineStyleChars > 800 ? 'yes ' : 'no ') + '(' + inlineStyleChars + ' ch)', 16)} ${pad('yes (~32k)', 12)} ${grade(inlineStyleChars > 800)}`);
console.log(`preload hints        ${pad(hint('preload'), 16)} ${pad(MCM.preload, 12)} ${grade(hint('preload') > 0)}`);
console.log(`dns-prefetch hints   ${pad(hint('dns-prefetch'), 16)} ${pad(MCM.dnsPrefetch, 12)} ${grade(hint('dns-prefetch') + hint('preconnect') > 0)}`);
console.log(`hover-prefetch       ${pad(doPrefetch ? (hoverResult.startsWith('YES') ? 'yes' : 'no') : 'skipped', 16)} ${pad('yes', 12)} ${grade(hoverResult.startsWith('YES'))}`);
console.log('');
console.log(`requests: ${reqs.length}   by type: ${JSON.stringify(byType)}`);
console.log(`compression: ${brotli}/${reqs.length} br/zstd   long-cached statics: ${longCached}/${statics.length}   versioned-URL statics: ${versionedUrls}/${statics.length}`);
console.log(`inline JS: ${inlineScriptChars} chars   modulepreload: ${hint('modulepreload')}   prefetch links: ${hint('prefetch')}`);
console.log(`hover-prefetch detail: ${hoverResult}`);
console.log('\nscreenshot -> audit-shot.png');
