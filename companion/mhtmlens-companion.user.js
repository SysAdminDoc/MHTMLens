// ==UserScript==
// @name         MHTMLens page snapshot companion
// @namespace    https://github.com/SysAdminDoc/MHTMLens
// @version      0.3.0
// @description  Open a local page-state snapshot in MHTMLens.
// @match        *://*/*
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';
  const TOOLKIT = 'https://sysadmindoc.github.io/MHTMLens/';
  const encode = value => {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  };
  function openSnapshot() {
    const html = '<!doctype html><meta charset="utf-8"><base href="' + location.href + '">' + document.documentElement.outerHTML;
    const payload = encode(html);
    if (payload.length < 1500000) {
      window.open(TOOLKIT + '#snapshot=' + encodeURIComponent(payload), '_blank', 'noopener');
      return;
    }
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    link.download = 'mhtmlens-' + location.hostname + '.html';
    link.click();
    URL.revokeObjectURL(link.href);
    window.open(TOOLKIT + '?companion=downloaded', '_blank', 'noopener');
  }
  GM_registerMenuCommand('Open current page in MHTMLens', openSnapshot);
  window.postMessage({ source: 'mhtmlens-page', type: 'companion-ready' }, '*');
})();
