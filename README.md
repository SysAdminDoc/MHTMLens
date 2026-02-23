# MHTMLens

![Version](https://img.shields.io/badge/version-0.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Any%20Browser-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)
![Status](https://img.shields.io/badge/status-active-success)

> MHTML forensics toolkit for userscript and browser extension development — parse MHTML files, analyze DOM structure, score selector stability, extract themes, diff page versions, and export ready-to-install `.user.js` files. 100% client-side, single HTML file.

https://sysadmindoc.github.io/MHTMLens/

## Why MHTMLens?

Building userscripts and browser extensions means fighting obfuscated class names, unstable selectors, and SPAs that mutate their DOM constantly. Save a page as MHTML, drop it into MHTMLens, and get:

- Every selector on the page scored for stability (0–100)
- Obfuscated classes flagged so you know what NOT to target
- Best-selector recommendations per element
- XPath alternatives and MutationObserver snippets auto-generated
- A complete `.user.js` file exported with one click
- Two-file comparison to see which selectors survived between page versions

Nothing else does this. The closest alternatives are browser DevTools (no scoring, no export, no diffing) and paid SIEM-style tools that don't speak userscript.

## Quick Start

```bash
git clone https://github.com/SysAdminDoc/MHTMLens.git
cd MHTMLens
# Open mhtmlens.html in your browser — that's it
```

Or just download `mhtmlens.html` and double-click it. No server, no install, no dependencies.

### Saving an MHTML File

1. Open the target page in Chrome/Edge
2. Press `Ctrl+S` (or `Cmd+S` on Mac)
3. Choose **"Webpage, Single File (.mhtml)"** as the format
4. Drop the saved `.mhtml` file into MHTMLens

## Features

| Feature | Description |
|---------|-------------|
| MHTML Parser | Multipart MIME parsing with charset detection, quoted-printable/base64 decoding, nested boundary support |
| Parts Explorer | Browse every resource in the MHTML (HTML, CSS, JS, images) with decoded content and metadata |
| Live Preview | Rendered page in sandboxed iframe with inline resource reconstruction |
| Element Picker | Hover to highlight elements, click to inspect — shows best selector, path, XPath, and MutationObserver snippet |
| DOM Tree | Interactive collapsible tree with color-coded tags, IDs, classes, data attributes |
| Stability Scoring | 0–100 score per selector based on type, obfuscation, depth, uniqueness, and semantic strength |
| Best Selector | Auto-recommends the most resilient targeting strategy per element |
| Obfuscation Detection | Pattern + entropy analysis flags generated/hashed class names (CSS modules, Tailwind hashes, Emotion, etc.) |
| XPath Generation | Full XPath for every element alongside CSS selectors |
| MutationObserver Gen | Ready-to-paste observer snippet per element for SPA targeting |
| CSS Analysis | All rules extracted from inline styles and external sheets, grouped by source, with media query detection |
| CSS Variables | Complete list of custom properties with color swatches and one-click copy |
| Theme Extraction | Auto-detected color palette, font stacks, spacing scale, border radii, and breakpoint inventory |
| Selector Comparison | Drop two MHTML saves — see which selectors were added, removed, or survived between versions |
| Code Generation | Complete `.user.js` template, selector maps, CSS overrides, DOM cleanup, settings panel |
| Export .user.js | One-click export of a working userscript with anti-FOUC, trustedTypes, selectors, and MutationObserver |
| Export Selectors JSON | High-scoring selectors as structured JSON for testing frameworks |
| Global Search | Search across selectors, CSS rules, and variables from one input |
| Dark Theme | Catppuccin Mocha palette — deep dark, no light mode |
| Zero Dependencies | Single HTML file, no build step, no server, no npm |

## Tabs

### Parts

Explodes the MHTML into its multipart MIME components. Each part shows:

| Field | Description |
|-------|-------------|
| Content-Type | MIME type (text/html, text/css, image/png, etc.) |
| Content-Transfer-Encoding | quoted-printable, base64, or none |
| Charset | Detected from Content-Type header (UTF-8, windows-1252, Shift_JIS, etc.) |
| Content-Location | Original URL of the resource |
| Decoded Content | Full decoded body — viewable as text or image preview |

### Preview + Picker

Renders the page in a sandboxed iframe with resources reconstructed from MHTML parts (images and CSS resolved inline). The Element Picker mode lets you:

1. Click **Element Picker** to enable
2. Hover over the rendered page — elements highlight with tag/class/dimensions overlay
3. Click any element — the detail panel shows:
   - **Best Selector** with stability score
   - **CSS Path** (full `>` delimited path)
   - **XPath** equivalent
   - **Class stability analysis** (each class tagged STABLE or OBF)
   - **All attributes** with values
   - **MutationObserver snippet** ready to paste
   - **Text content** preview

### DOM Tree

Interactive collapsible tree view of the full document. Color-coded: tags (red), IDs (peach), classes (green), data attributes (yellow), text content (gray). Click any node to see the same detail panel as the Element Picker.

### CSS

All CSS rules extracted from `<style>` tags and external stylesheet parts, grouped by source file. Includes:

- Full property list per rule with color swatches
- Media query context shown per rule
- CSS custom properties listed separately with copy-all
- Click any rule to see selector + properties + source

### Theme

Auto-extracted design tokens from CSS:

| Token Type | How Extracted |
|------------|---------------|
| Colors | From CSS variables and `color`/`background-color`/`border-color`/`fill`/`stroke` properties. Deduplicated, shown as swatch grid |
| Fonts | First font in each `font-family` declaration |
| Spacing | Values from `margin`, `padding`, and `gap` properties |
| Border Radii | All `border-radius` values found |
| Breakpoints | Pixel/em/rem values from `@media` queries |

### Selectors

The core analysis tab. Every selector on the page with:

| Column | Description |
|--------|-------------|
| Selector | CSS selector string with one-click copy |
| Score | 0–100 stability score (green 70+, yellow 40–69, red <40) |
| Type | id, class, data-attr, aria, semantic |
| Stability | STABLE or OBFUSCATED tag |
| Element | HTML tag the selector targets |
| Match Count | Number of elements matched |
| XPath | Full XPath with one-click copy |

**Filters:** All, High Score (70+), Stable, Obfuscated, or by type (id, class, data-attr, aria, semantic). Plus a search box.

### Code Gen

Ready-to-paste code snippets generated from the analysis:

| Snippet | Description |
|---------|-------------|
| Complete Userscript | Full `.user.js` with `@match` for the detected domain, anti-FOUC, trustedTypes policy, stable selector map, GM_addStyle block, MutationObserver |
| Stable Selectors Map | JavaScript const object of all high-scoring selectors with scores and match counts |
| CSS Variable Overrides | GM_addStyle block with all detected CSS variables pre-filled for override |
| MutationObserver Template | Observer pattern using the top-scored selector, SPA-compatible |
| DOM Cleanup | Removes empty spacer divs and aria-hidden non-semantic elements |
| XPath Selectors | `document.evaluate()` examples for top XPath selectors |
| Settings Panel | Complete GM_setValue/GM_getValue settings panel with toggle UI and persistent storage |

### Compare

Drop a second MHTML save of the same page to diff selectors:

- **Added** (green) — selectors that exist in the new version but not the old
- **Removed** (red) — selectors that were in the old version but disappeared
- **Unchanged** — selectors that survived between versions, flagged as safe to target

This is the killer feature for userscript maintenance. Save a page before and after a site update, compare, and immediately know which selectors in your script broke and what the replacements are.

## How It Works

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   MHTML Parser    │────>│   DOM Analysis    │────>│  Selector Engine  │────>│   Code Generator  │
│                  │     │                  │     │                  │     │                  │
│ MIME boundary    │     │ DOMParser        │     │ Stability scoring│     │ .user.js export  │
│ Quoted-printable │     │ CSS extraction   │     │ Obfuscation det. │     │ Selector maps    │
│ Base64 decode    │     │ Theme extraction │     │ XPath generation │     │ Observer snippets│
│ Charset detect   │     │ Resource inline  │     │ Best-sel recomm. │     │ CSS overrides    │
│ Part inventory   │     │ Tree building    │     │ MutationObs gen  │     │ Settings panel   │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
                                                          │
                                                          v
                                                  ┌──────────────────┐
                                                  │    Comparator     │
                                                  │                  │
                                                  │ Selector diff    │
                                                  │ Added / Removed  │
                                                  │ Survival analysis│
                                                  └──────────────────┘
```

### Stability Scoring Algorithm

Each selector starts at a base score of 50 and is adjusted by signals:

| Signal | Weight | Rationale |
|--------|--------|-----------|
| `data-*` attribute | +30 | Data attributes are intentionally placed, rarely change |
| ARIA role/label | +25 | Accessibility attributes are stable by convention |
| Semantic HTML tag | +20 | `<nav>`, `<main>`, `<footer>` are structural anchors |
| Stable ID | +20 | Human-readable IDs are usually intentional |
| Stable class | +15 | Short, readable class names tend to persist |
| Unique match (1 element) | +10 | Uniqueness means less ambiguity |
| Obfuscated name | -40 | Hash/generated names change on every build |
| High match count (50+) | -15 | Too many matches = too broad |
| Deep nesting (6+ levels) | -10 | Deep paths are fragile |
| Uses `:nth-*` | -10 | Positional selectors break when siblings change |

### Obfuscation Detection

Classes are flagged as obfuscated when they match any of:

- Short prefix + camelCase hash: `aB3kX9m`, `_a8f2d1`
- CSS module pattern: `Component__element--modifier`, `css-a1b2c3`
- High entropy: character diversity > 70% with mixed case + digits in names > 6 chars
- Hash suffix: `button-a8Kx2`, `header_f9d3e1`

## Exports

| Export | Format | Content |
|--------|--------|---------|
| Clean HTML | `.html` | Main HTML part extracted and decoded |
| All CSS | `.css` | Combined CSS variables + all rules from all sources |
| Export .user.js | `.user.js` | Complete installable userscript with domain match, anti-FOUC, trustedTypes, selector map, styles, observer |
| Selectors JSON | `.json` | All selectors scoring 50+ as structured data: selector, type, score, xpath, matches, element |

## What It Does and Doesn't Do

**Does:**
- Parse MHTML files with full multipart MIME support including charset detection
- Render the page in a live preview with resource reconstruction
- Let you visually pick elements and get targeting recommendations
- Score every selector for resilience to site updates
- Detect obfuscated/generated class names from CSS modules, Tailwind, Emotion, etc.
- Generate XPath alongside CSS selectors
- Produce MutationObserver snippets for SPA-compatible targeting
- Extract the complete design system (colors, fonts, spacing, breakpoints)
- Diff two MHTML saves to show which selectors survived
- Export a complete working `.user.js` file
- Run 100% client-side with zero data transmission

**Doesn't:**
- Upload any data anywhere — fully offline after page load
- Execute JavaScript from the MHTML (preview is sandboxed)
- Handle Shadow DOM inspection (planned)
- Parse binary formats like `.evtx` or Chromium `.snss` sessions
- Detect CSS-in-JS runtime styles (only static CSS from the MHTML)
- Replace browser DevTools for live debugging — this is for static analysis of saved pages

## Prerequisites

- Any modern browser (Chrome, Firefox, Edge, Safari)
- That's it

## Typical Workflow

1. **Save target page** as MHTML in Chrome/Edge (`Ctrl+S` → Single File)
2. **Drop into MHTMLens** and go to the **Preview + Picker** tab
3. **Pick elements** you want to target — note the best selectors and scores
4. **Check the Selectors tab** — filter by "High Score (70+)" to see your safest targets
5. **Go to Code Gen** — copy the userscript template, selector map, and observer snippet
6. **Export the .user.js** — install in Tampermonkey to test immediately
7. **After a site update** — save the page again, use the **Compare** tab to diff selectors and update your script

## FAQ / Troubleshooting

**Q: The preview is blank or broken**
A: The preview reconstructs resources from MHTML parts by replacing Content-Location URLs with data URIs. If the page used JavaScript rendering (React, Vue, Angular SPAs), the static HTML capture may not include the rendered DOM. Try saving the page after it fully loads. Chrome's "Save as MHTML" captures the current DOM state including SPA-rendered content.

**Q: Some images don't show in the preview**
A: Images must be included as MHTML parts with matching Content-Location URLs. If the page loaded images lazily or from a different CDN domain, they may not be captured. The parts list will show which images were included.

**Q: The Element Picker doesn't highlight anything**
A: Make sure Element Picker mode is toggled on (button should have a teal border). The picker requires the iframe to have loaded the preview content. If the preview is blank, there's nothing to pick.

**Q: My class name is flagged as obfuscated but it's not**
A: The obfuscation detector uses heuristics. Class names with high character entropy, mixed case + digits, or common hash patterns get flagged. This is conservative by design — it's better to flag a stable class as suspicious than to miss an obfuscated one. Check the stability score — a truly stable class with other positive signals (semantic tag, data attributes nearby) will still score well overall.

**Q: Can I use this with regular HTML files, not just MHTML?**
A: Yes. Drop any `.html` or `.htm` file and MHTMLens will parse it as a single part. You'll get full DOM analysis, selector scoring, and code generation. The MHTML-specific features (parts explorer, resource reconstruction, charset detection) will be simpler since there's only one part.

**Q: How does the comparison know which selectors match across files?**
A: Comparison is string-based — it compares the exact CSS selector strings generated from both documents. A selector like `[data-testid="login-button"]` will match if it exists in both. Class selectors like `.header` will match if the same class name appears in both. This means obfuscated classes that changed between versions will correctly show as removed + added (different hash = different selector).

**Q: The exported .user.js doesn't work on the target site**
A: Common issues: the `@match` pattern may need adjustment (check the domain in the userscript header matches the actual site URL), the page may load content dynamically after the initial DOM (the MutationObserver in the template handles this), or the selectors may have changed since you saved the MHTML. Re-save and re-analyze if the site updated.

**Q: Can I compare more than two files?**
A: Currently supports two-file comparison (A vs B). For tracking changes over multiple versions, export the selectors JSON from each version and diff them externally.

## Contributing

Issues and PRs welcome. Areas that could use help:

- Shadow DOM detection and inspection
- CSS-in-JS runtime style extraction
- Computed style viewer (post-cascade resolution)
- CSS variable dependency graph
- Multi-file comparison (3+ versions)
- Iframe inventory and cross-origin detection
- Custom format builder for non-standard MHTML variants

## License

MIT License — see [LICENSE](LICENSE) for details.
