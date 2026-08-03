chrome.runtime.onMessage.addListener(message => {
  if (message.type === 'mhtmlens-capture-ready' || message.type === 'mhtmlens-error') {
    window.postMessage({ source: 'mhtmlens-companion', ...message }, '*');
  }
});

window.addEventListener('message', event => {
  if (event.source !== window || event.data?.source !== 'mhtmlens-page') return;
  if (event.data.type === 'capture') {
    chrome.runtime.sendMessage({
      type: 'mhtmlens-capture',
      openToolkit: event.data.openToolkit !== false,
      compare: event.data.compare === true,
    });
  }
});
