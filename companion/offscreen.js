chrome.runtime.onMessage.addListener(async message => {
  if (message.type !== 'mhtmlens-save-blob' || !message.blob) return;
  const objectUrl = URL.createObjectURL(message.blob);
  try {
    await chrome.downloads.download({ url: objectUrl, filename: message.filename, saveAs: false });
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  }
});
