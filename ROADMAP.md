# MHTMLens Roadmap

MHTML forensics toolkit for userscript / extension authors — parse MHTML, score selector stability, diff page versions, export ready-to-install `.user.js`. v0.2.0, single HTML file. Roadmap targets deeper DOM coverage, live browser integration, and a proper selector-health pipeline.

## Planned Features

### DOM & CSS Coverage
- **Shadow DOM detection** — parse `<template shadowrootmode>` declarative shadow roots, inspect + generate selectors across shadow boundaries
- **CSS-in-JS runtime style extraction** — inject a tiny agent into the sandboxed preview, harvest computed styles for elements with hashed classes
- **Computed style viewer** — show final cascaded values per element (not just declared)
- **CSS variable dependency graph** — visualize which rules consume which custom properties
- **Iframe inventory** — list same-origin + cross-origin iframes, parse same-origin ones recursively
- **Dynamic-import detection** — flag `<script type="module">` and inline imports whose resources are missing from the MHTML

### Selector Engine
- **Selector fallback chain** — emit primary + N backup selectors per element so generated userscripts self-heal
- **Multi-version comparison** — diff across 3+ MHTMLs showing selector survival rate over time
- **Selector minimality check** — shorten selectors while preserving uniqueness (e.g. `div.a > span.b > em` → `.b em` if unique)
- **Attribute-based scoring uplift** — `aria-label`, `data-testid`, `role` get extra stability weight
- **Obfuscation model upgrade** — ML-based classifier trained on Tailwind hash / CSS modules / Emotion / styled-components signatures
- **Selector playground** — live type a selector, see matches highlighted in the preview

### Code Generation
- **Framework-aware templates** — Tampermonkey MV2, Violentmonkey, Greasemonkey 4, Chrome MV3 content script, Firefox MV2, bookmarklet
- **Trusted Types policy** — include `trustedTypes.createPolicy` boilerplate when target domain is YouTube/Google/Meta
- **Settings panel generator** — drag-to-arrange UI of toggles for generated script
- **MutationObserver strategy picker** — subtree vs direct children, attribute filter, debouncing; pick one that matches element churn

### Live Integration
- **Chrome extension companion** — right-click any page → "Analyze in MHTMLens" (saves MHTML via `chrome.pageCapture.saveAsMHTML` and opens the toolkit)
- **Userscript companion** — open current page in MHTMLens with state snapshot
- **Auto-refresh mode** — extension re-captures on site update, pushes into Compare tab

### Theme & Design Tokens
- **Design token export** — Figma Tokens / Style Dictionary JSON
- **Contrast grid** — WCAG AA/AAA pass/fail for every foreground/background pair in the palette
- **Light/dark detection** — identify `prefers-color-scheme: dark` blocks and surface as a separate theme

### Batch & Automation
- **CLI port (Node/Deno)** — `mhtmlens score input.mhtml --out selectors.json` for CI pipelines
- **GitHub Action** — run on every site change, fail the build if stable selector count drops
- **Selector-health dashboard** — aggregate results from multiple captures over time into a static report

## Competitive Research
- **Browser DevTools (Inspect Element)** — unbeatable for live debugging; no scoring, no offline, no diff. MHTMLens fills the offline + scoring + export gaps.
- **WebHarvy / Octoparse** — scraping tools; care about selector stability but closed-source and upload-first.
- **SelectorGadget** — browser bookmarklet for quick CSS selector picking; very limited, no scoring.
- **Playwright codegen** — records selectors from a browser session; great for tests, doesn't score stability or export userscripts.
- **TamperDAV / Userscript IDE** — script-dev UX. Confirms authors want better dev loop; MHTMLens is the analysis side.

## Nice-to-Haves
- Collaborative review mode (export a shareable bundle with selectors + notes + screenshots)
- AI-suggested selector repair: paste broken selector + target page's current MHTML, get a suggested replacement
- Visual regression thumbnail diff between two MHTMLs (not just selector diff)
- Built-in selector test runner in the preview iframe to validate generated userscript logic
- Lighthouse-style score card: overall "site friendliness for scripting" rating
- Support for `.maff` (Firefox) and Singlefile outputs as alternate archive formats

## Open-Source Research (Round 2)

### Related OSS Projects
- https://github.com/AScriver/MHTMLExtractor — Python CLI MHTML extractor, chunked streaming, dry-run preview, filter flags (`--no-css`, `--no-images`, `--html-only`)
- https://github.com/obsidianforensics/hindsight — Chrome/Chromium forensics parser (cache, history, cookies, LocalStorage) — patterns for artifact extraction
- https://github.com/sepinf-inc/IPED — Java-based forensic evidence processor with pluggable parsers (WhatsApp, Skype, browser artifacts)
- https://github.com/mesquidar/ForensicsTools — curated forensics tool index, discovery channel for adjacent parsers
- https://github.com/cugu/awesome-forensics — curated forensic analysis tools list
- https://github.com/ivmartel/dwv — zero-footprint browser-side binary parser reference (pure JS, no backend) — similar single-file delivery model

### Features to Borrow
- Dry-run / preview mode listing parts without extracting (MHTMLExtractor) — mirror as "Analyze without export" toggle
- Per-type filters (skip CSS, images, scripts) for selective export (MHTMLExtractor `--no-*` flags)
- Chunked streaming parser for large MHTML files (MHTMLExtractor memory optimization) — avoid OOM on multi-GB saved pages
- Comprehensive statistics summary (part counts, size breakdown by MIME) (MHTMLExtractor)
- CLI companion mode for scripting / batch processing (MHTMLExtractor)
- Hindsight-style artifact timeline view — order MHTML parts by `Content-Location` resource load order
- SHA256 per-part hashing for tamper detection (standard forensics pattern from awesome-forensics)

### Patterns & Architectures Worth Studying
- Streaming MIME multipart boundary parser with constant memory (MHTMLExtractor) — critical for browser tab crashes on 500MB+ MHTML
- Pluggable output sinks (filesystem, zip, in-memory) to support browser-only deployment (IPED architecture)
- Type-hinted parser API with per-part metadata records — enables selector/DOM diff pipelines downstream
- Offline-first single-HTML delivery (dwv reference) — keep MHTMLens 100% client-side, never add a backend
