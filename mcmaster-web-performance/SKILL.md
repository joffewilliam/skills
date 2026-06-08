---
name: mcmaster-web-performance
description: Use when building or improving a website where speed, Lighthouse score, instant navigation, cache headers, app-shell UX, left-sidebar catalog browsing, or McMaster-Carr-style performance matters.
---

# McMaster Web Performance

Build the real site, not a demo shell. The goal is a fast first paint, stable
layout, instant-feeling navigation, and Lighthouse scores that can reach 100
when the hosting environment cooperates.

## McMaster-Carr Method

Use McMaster-Carr as the performance model. Do not treat this as a generic
Lighthouse cleanup skill. The site should use the same core ideas:

- Render a small HTML/app shell first.
- Inline the CSS needed for the first viewport.
- Keep blocking stylesheets and synchronous scripts out of the head.
- Load non-critical CSS and JavaScript after the first paint.
- Prefetch likely next pages on hover, focus, or touch.
- Swap prefetched content into the page without a full reload when the stack
  allows it.
- Serve static assets from versioned or hashed URLs.
- Cache static assets for a long time, including `Cache-Control` and `Expires`.
- Keep the HTML document revalidatable so new releases can point at new asset
  URLs.
- Favor dense, useful navigation over decorative landing-page weight.

## Core Pattern

Use these rules when creating or improving a site:

1. Serve a small app shell.
   Inline the critical CSS needed for the first viewport. Do not put blocking
   stylesheets or synchronous scripts in the document head.

2. Defer everything else.
   Load non-critical CSS with `preload` plus a delayed stylesheet apply. Load JS
   with `defer`, and preload the script only when it is needed for the first
   interaction.

3. Make navigation feel instant.
   Prefetch same-origin internal pages or fragments on hover, focus, or touch.
   Memoize each request. On click, swap the main content, update history, and
   keep active navigation state in sync.

4. Use cacheable, versioned assets.
   Put static assets behind versioned or hashed URLs. Serve them with
   `Cache-Control: public, max-age=31536000, immutable` and an `Expires` date far
   in the future. Serve HTML with `Cache-Control: no-cache` so releases can point
   at new asset URLs immediately.

5. Protect layout stability.
   Give every image, logo, tile, card, toolbar, grid, and fixed-format control a
   stable width, height, aspect ratio, or grid track. Hover states must not move
   surrounding content.

6. Use the right image for the job.
   Compress large images, prefer WebP or AVIF when practical, and keep fallback
   formats when needed. Preload the LCP image and any above-the-fold brand mark.
   Use eager loading for visible images and lazy loading for below-the-fold
   images. Always include useful `alt` text, or empty `alt` for decorative images.

7. Keep the page accessible by default.
   Use landmarks, one clear `h1`, real buttons for actions, real links for
   navigation, visible focus styles, accessible names on icon buttons, readable
   contrast, and form labels or `aria-label` values.

8. Keep SEO basics intact.
   Include a descriptive title, meta description, viewport tag, canonical URL
   when appropriate, useful link text, and crawlable content in the initial HTML
   for important pages.

9. Keep JavaScript boring and small.
   Avoid large frameworks unless the product needs them. Minify production JS.
   Avoid console errors, unhandled promise rejections, third-party scripts in the
   first paint path, and work that blocks the main thread.

10. Design for mobile first.
    Verify that text fits, controls are tappable, horizontal scrolling is absent,
    and the main workflow works on a narrow viewport.

## Lighthouse 100 Checklist

Before calling the site finished, check these items:

- Performance: no render-blocking resources, fast LCP, compressed images,
  explicit image dimensions, no layout shift, minimal unused JS/CSS, long-lived
  cache headers on static assets, and `Expires` headers for older audits.
- Accessibility: labeled controls, valid heading order, sufficient contrast,
  alt text, keyboard focus, no duplicate IDs, and no inaccessible custom widgets.
- Best Practices: HTTPS in production, no browser console errors, no deprecated
  APIs, no mixed content, and correctly sized images.
- SEO: title, meta description, viewport, crawlable links, sensible headings,
  and content available without client-only rendering.

## Common Fixes

- If Lighthouse reports render-blocking CSS, inline only critical CSS and defer
  the rest.
- If Lighthouse reports poor LCP, preload the hero or primary image, compress it,
  and make sure it has stable dimensions.
- If old performance graders complain about Expires headers, keep the modern
  `Cache-Control` header and also add `Expires` for static assets.
- If CLS moves, reserve space with dimensions or aspect ratio before images,
  badges, buttons, and dynamic counts render.
- If accessibility drops, audit icon buttons, quantity steppers, search inputs,
  cart controls, and generated cards first.
- If SEO drops, check that each route has a real title, description, heading, and
  crawlable body content.

## What Not To Ship

Do not ship sample product data, demo images, or a starter site just because this
skill was used. The site should be tailored to the user's domain. Borrow the
performance patterns, not old content.
