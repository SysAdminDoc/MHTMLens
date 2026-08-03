const status = document.getElementById('status');
const setStatus = text => { status.textContent = text; };
let activeTab;
chrome.tabs.query({ active: true, currentWindow: true }).then(tabs => { activeTab = tabs[0]; });
document.getElementById('capture').onclick = async () => {
  if (!activeTab?.id) return setStatus('No active tab');
  await chrome.runtime.sendMessage({ type: 'mhtmlens-capture', tabId: activeTab.id, openToolkit: true });
  setStatus('Capture requested; the file will download.');
};
async function refreshAutoLabel() {
  const { autoRefresh } = await chrome.storage.local.get({ autoRefresh: false });
  document.getElementById('auto').textContent = autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh';
  return autoRefresh;
}
document.getElementById('auto').onclick = async () => {
  const enabled = await refreshAutoLabel();
  await chrome.runtime.sendMessage({ type: 'mhtmlens-set-auto-refresh', enabled: !enabled });
  await refreshAutoLabel();
  setStatus(!enabled ? 'Auto-refresh enabled' : 'Auto-refresh disabled');
};
refreshAutoLabel();
