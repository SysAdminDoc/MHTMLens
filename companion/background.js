const DEFAULT_TOOLKIT_URL = 'https://sysadmindoc.github.io/MHTMLens/';
const OFFSCREEN_URL = 'offscreen.html';

async function ensureOffscreenDocument() {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  if (contexts.some(context => context.documentUrl?.endsWith(OFFSCREEN_URL))) return;
  await chrome.offscreen.createDocument({
    url: OFFSCREEN_URL,
    reasons: ['BLOBS'],
    justification: 'Create a temporary object URL for the captured MHTML download.',
  });
}

async function saveBlob(blob, filename) {
  await ensureOffscreenDocument();
  await chrome.runtime.sendMessage({ type: 'mhtmlens-save-blob', blob, filename });
}

async function captureTab(tab, options = {}) {
  if (!tab?.id) return;
  chrome.pageCapture.saveAsMHTML({ tabId: tab.id }, async blob => {
    if (chrome.runtime.lastError || !blob) {
      await chrome.tabs.sendMessage(tab.id, { type: 'mhtmlens-error', message: chrome.runtime.lastError?.message || 'Capture failed' }).catch(() => {});
      return;
    }
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = 'mhtmlens/' + (new URL(tab.url || 'https://capture.invalid').hostname || 'capture') + '-' + stamp + '.mhtml';
    await saveBlob(blob, filename);
    const record = { filename, url: tab.url || '', title: tab.title || '', capturedAt: Date.now() };
    const stored = await chrome.storage.local.get(['mhtmlensCaptures']);
    const captures = [record, ...(stored.mhtmlensCaptures || [])].slice(0, 10);
    await chrome.storage.local.set({ mhtmlensCaptures: captures });
    await chrome.tabs.sendMessage(tab.id, { type: 'mhtmlens-capture-ready', record, compare: options.compare === true }).catch(() => {});
    if (options.openToolkit !== false) {
      const settings = await chrome.storage.local.get({ toolkitUrl: DEFAULT_TOOLKIT_URL });
      await chrome.tabs.create({ url: settings.toolkitUrl + (settings.toolkitUrl.includes('?') ? '&' : '?') + 'companion=1' });
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: 'mhtmlens-analyze', title: 'Analyze page in MHTMLens', contexts: ['page'] });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'mhtmlens-analyze') captureTab(tab);
});
chrome.action.onClicked.addListener(tab => captureTab(tab));
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'mhtmlens-capture') {
    const target = sender.tab || (message.tabId ? await chrome.tabs.get(message.tabId) : null);
    captureTab(target, { openToolkit: message.openToolkit !== false, compare: message.compare === true });
    sendResponse({ ok: true });
    return true;
  }
  if (message.type === 'mhtmlens-set-auto-refresh') {
    chrome.storage.local.set({ autoRefresh: Boolean(message.enabled) });
    sendResponse({ ok: true, enabled: Boolean(message.enabled) });
    return true;
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab?.url || /^chrome(-extension)?:/i.test(tab.url)) return;
  const settings = await chrome.storage.local.get({ autoRefresh: false, lastAutoRefreshUrl: '' });
  if (!settings.autoRefresh || settings.lastAutoRefreshUrl === tab.url) return;
  await chrome.storage.local.set({ lastAutoRefreshUrl: tab.url });
  await captureTab(tab, { openToolkit: false, compare: true });
});
