#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { analyzeInput, dashboardHtml, readInput } from './core.mjs';

function usage() {
  console.log([
    'MHTMLens CLI',
    '',
    'Usage:',
    '  node cli/mhtmlens.mjs score <input.mhtml|input.html> [--out selectors.json] [--dashboard report.html] [--fail-below N]',
    '',
    'The CLI is dependency-free and emits JSON suitable for CI selector-health checks.',
  ].join('\n'));
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(0);
}
const command = args.shift();
if (command !== 'score' || !args[0]) {
  usage();
  process.exit(2);
}

const inputPath = path.resolve(args.shift());
const report = analyzeInput(readInput(inputPath));
const output = {
  format: 'mhtmlens-selector-report',
  version: '0.3.0',
  file: path.basename(inputPath),
  parts: report.parts.map(part => ({ location: part.location, contentType: part.contentType, encoding: part.encoding })),
  selectors: report.selectors,
  missingModules: report.missingModules,
  health: {
    total: report.selectors.length,
    stable: report.selectors.filter(selector => selector.score >= 70).length,
    obfuscated: report.selectors.filter(selector => selector.obfuscated).length,
    missingModules: report.missingModules.length,
  },
};

const getOption = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const outPath = getOption('--out');
const dashboardPath = getOption('--dashboard');
if (outPath) fs.writeFileSync(path.resolve(outPath), JSON.stringify(output, null, 2));
if (dashboardPath) fs.writeFileSync(path.resolve(dashboardPath), dashboardHtml(output));
if (!outPath && !dashboardPath) console.log(JSON.stringify(output, null, 2));
const failBelow = Number(getOption('--fail-below'));
if (Number.isFinite(failBelow) && output.health.stable < failBelow) process.exit(3);
