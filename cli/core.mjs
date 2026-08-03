import fs from 'node:fs';

const SEMANTIC = new Set(['header', 'nav', 'main', 'footer', 'article', 'aside', 'section', 'form', 'dialog']);

export function decodeQuotedPrintable(value) {
  return value.replace(/=\r?\n/g, '').replace(/=([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function decodePartBody(body, encoding = '') {
  const normalized = encoding.toLowerCase();
  if (normalized === 'quoted-printable') return decodeQuotedPrintable(body);
  if (normalized === 'base64') {
    try { return Buffer.from(body.replace(/\s/g, ''), 'base64').toString('utf8'); } catch { return body; }
  }
  return body;
}

function headerValue(headers, name) {
  const match = headers.match(new RegExp('^' + name + ':\\s*(.+)$', 'im'));
  return match ? match[1].trim() : '';
}

export function parseMhtml(text) {
  const boundaryMatch = text.match(/boundary="?([^"\r\n;]+)"?/i);
  if (!boundaryMatch) return [{ location: 'index.html', contentType: 'text/html', encoding: 'none', decoded: text }];
  const boundary = '--' + boundaryMatch[1];
  const parts = [];
  for (const section of text.split(boundary).slice(1)) {
    if (!section.trim() || section.trim() === '--') continue;
    const headerEnd = section.indexOf('\r\n\r\n');
    const shortHeaderEnd = section.indexOf('\n\n');
    const end = headerEnd >= 0 ? headerEnd : shortHeaderEnd;
    if (end < 0) continue;
    const headers = section.slice(0, end);
    const offset = headerEnd >= 0 ? end + 4 : end + 2;
    const body = section.slice(offset).replace(/\r?\n--?\s*$/, '');
    const contentTypeHeader = headerValue(headers, 'Content-Type');
    parts.push({
      location: headerValue(headers, 'Content-Location') || headerValue(headers, 'Content-ID') || 'part-' + parts.length,
      contentType: (contentTypeHeader.split(';')[0] || 'application/octet-stream').trim().toLowerCase(),
      charset: (contentTypeHeader.match(/charset=["']?([^"';\s]+)/i) || [])[1] || 'utf-8',
      encoding: headerValue(headers, 'Content-Transfer-Encoding').toLowerCase(),
      decoded: decodePartBody(body, headerValue(headers, 'Content-Transfer-Encoding')),
    });
  }
  return parts;
}

function decodeAttribute(value) {
  return value.replace(/&quot;/gi, '"').replace(/&#39;/g, "'").replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
}

export function parseAttributes(raw) {
  const attributes = {};
  const pattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>\x60]+)))?/g;
  for (const match of raw.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeAttribute(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

function escapeCss(value) {
  return String(value).replace(/([^\w-])/g, '\\$1');
}

function obfuscationProfile(value) {
  const name = String(value || '');
  const signals = [];
  if (/^[a-zA-Z]{1,3}[A-Z][a-zA-Z0-9]{3,}$/.test(name)) signals.push('mixed-case hash');
  if (/^[a-z]{1,2}\d{2,}$/i.test(name)) signals.push('numeric suffix');
  if (/^css-[a-z0-9]+$/i.test(name) || /[_-][a-zA-Z0-9]{5,}$/.test(name)) signals.push('generated suffix');
  return { obfuscated: signals.length > 0, signals };
}

export function scoreSelector(selector) {
  let score = 50;
  if (selector.type === 'data-attr') score += selector.selector.includes('data-testid') ? 35 : 30;
  if (selector.type === 'aria') score += selector.selector.includes('aria-label') ? 30 : 25;
  if (selector.type === 'semantic') score += 20;
  if (selector.type === 'id' && !selector.obfuscated) score += 20;
  if (selector.type === 'class' && !selector.obfuscated) score += 15;
  if (selector.matchCount === 1) score += 10;
  if (selector.obfuscated) score -= 40;
  if (selector.matchCount > 50) score -= 15;
  return Math.max(0, Math.min(100, score));
}

export function analyzeHtml(html) {
  const tags = [];
  for (const match of html.matchAll(/<([a-z][\w:-]*)([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    if (['script', 'style', 'link', 'meta', 'head', 'html', 'noscript', 'svg'].includes(tag)) continue;
    tags.push({ tag, attributes: parseAttributes(match[2]) });
  }
  const selectors = [];
  const seen = new Set();
  const add = (selector, type, rawName, tag, matchCount, description, obfuscated = false) => {
    if (seen.has(selector)) return;
    seen.add(selector);
    const record = { selector, type, rawName, element: tag, matchCount, stability: obfuscated ? 'obfuscated' : 'stable', obfuscated, description };
    record.score = scoreSelector(record);
    selectors.push(record);
  };
  const count = (predicate) => tags.filter(predicate).length;
  for (const item of tags) {
    const attrs = item.attributes;
    if (attrs.id) {
      const profile = obfuscationProfile(attrs.id);
      add('#' + escapeCss(attrs.id), 'id', attrs.id, item.tag, count(x => x.attributes.id === attrs.id), 'ID', profile.obfuscated);
    }
    for (const className of (attrs.class || '').split(/\s+/).filter(Boolean)) {
      const profile = obfuscationProfile(className);
      add('.' + escapeCss(className), 'class', className, item.tag, count(x => (x.attributes.class || '').split(/\s+/).includes(className)), 'Class', profile.obfuscated);
    }
    for (const [name, value] of Object.entries(attrs)) {
      if (!name.startsWith('data-')) continue;
      add('[' + name + '="' + escapeCss(value) + '"]', 'data-attr', name, item.tag, count(x => x.attributes[name] === value), 'data-attr: ' + name);
      add('[' + name + ']', 'data-attr', name, item.tag, count(x => name in x.attributes), 'data-attr: ' + name);
    }
    if (attrs.role) add('[role="' + escapeCss(attrs.role) + '"]', 'aria', attrs.role, item.tag, count(x => x.attributes.role === attrs.role), 'ARIA role: ' + attrs.role);
    if (attrs['aria-label']) add('[aria-label="' + escapeCss(attrs['aria-label']) + '"]', 'aria', attrs['aria-label'], item.tag, count(x => x.attributes['aria-label'] === attrs['aria-label']), 'ARIA label');
    if (SEMANTIC.has(item.tag)) add(item.tag, 'semantic', item.tag, item.tag, count(x => x.tag === item.tag), 'Semantic element');
  }
  return selectors.sort((a, b) => b.score - a.score || a.selector.length - b.selector.length);
}

export function analyzeInput(text) {
  const parts = parseMhtml(text);
  const htmlPart = parts.find(part => part.contentType.includes('html')) || parts[0];
  const selectors = analyzeHtml(htmlPart?.decoded || '');
  const missingModules = [];
  const html = htmlPart?.decoded || '';
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
    const value = match[1];
    if (!/\.(?:js|mjs|css)(?:[?#]|$)/i.test(value)) continue;
    const present = parts.some(part => part.location === value || part.location.endsWith(value));
    if (!present) missingModules.push({ value, present: false });
  }
  return { parts, htmlPart, selectors, missingModules };
}

export function dashboardHtml(report) {
  const data = JSON.stringify(report).replace(/</g, '\\u003c');
  return [
    '<!doctype html><meta charset="utf-8"><title>MHTMLens selector health</title>',
    '<style>body{font:14px system-ui;background:#1e1e2e;color:#cdd6f4;padding:24px}article{background:#313244;padding:16px;border-radius:8px;margin:12px 0}code{color:#f5c2e7}th,td{text-align:left;padding:5px;border-bottom:1px solid #585b70}</style>',
    '<h1>MHTMLens selector health</h1><div id="app"></div><script>',
    'const data=', data, ';const rows=data.selectors.map(function(s){return "<tr><td><code>"+s.selector.replace(/</g,"&lt;")+"</code></td><td>"+s.score+"</td><td>"+s.matchCount+"</td></tr>";}).join("");document.getElementById("app").innerHTML="<article><b>Selectors: "+data.selectors.length+"</b><p>"+data.file+"</p></article><article><table><tr><th>Selector</th><th>Score</th><th>Matches</th></tr>"+rows+"</table></article>";',
    '</script>',
  ].join('');
}

export function readInput(inputPath) {
  return fs.readFileSync(inputPath, 'utf8');
}
