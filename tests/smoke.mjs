import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const htmlPath = path.join(root, 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const openScripts = (html.match(/<script(?:\s[^>]*)?>/gi) || []).length;
const closeScripts = (html.match(/<\/script>/gi) || []).length;
assert.equal(openScripts, 2, 'the app and generated dashboard template should have two source script tags');
assert.equal(closeScripts, 1, 'generated dashboard closing tag must be escaped in the app source');
const source = html.slice(html.indexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));
new vm.Script(source, { filename: 'index-inline.js' });
for (const marker of ['collectShadowRoots', 'dependencyGraph', 'runMultiCompare', 'frameworkTemplates', 'exportReviewBundle', 'readZipEntries', 'loadSnapshotHash']) {
  assert.ok(source.includes(marker), 'missing enhancement marker: ' + marker);
}
for (const companionFile of ['manifest.json', 'background.js', 'content.js', 'offscreen.js', 'popup.js', 'mhtmlens-companion.user.js']) {
  assert.ok(fs.existsSync(path.join(root, 'companion', companionFile)), 'missing companion file: ' + companionFile);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mhtmlens-smoke-'));
try {
  const cli = path.join(root, 'cli', 'mhtmlens.mjs');
  const fixture = path.join(root, 'tests', 'fixtures', 'sample.html');
  const result = spawnSync(process.execPath, [cli, 'score', fixture], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(result.stdout);
  assert.ok(report.selectors.some(selector => selector.selector === '[data-testid="save-panel"]'));
  assert.ok(report.selectors.some(selector => selector.stability === 'obfuscated'));
  assert.ok(report.health.stable >= 1);
  const dashboard = path.join(tempDir, 'dashboard.html');
  const dashboardRun = spawnSync(process.execPath, [cli, 'score', fixture, '--dashboard', dashboard], { encoding: 'utf8' });
  assert.equal(dashboardRun.status, 0, dashboardRun.stderr);
  assert.ok(fs.readFileSync(dashboard, 'utf8').includes('MHTMLens selector health'));
  const failed = spawnSync(process.execPath, [cli, 'score', fixture, '--fail-below', '999'], { encoding: 'utf8' });
  assert.equal(failed.status, 3);
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
console.log('MHTMLens smoke tests: ok');
