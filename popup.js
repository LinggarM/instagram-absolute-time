const defaults = { isActive: true, timezone: 'Asia/Jakarta', dateFormat: 'default' };

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(defaults, (items) => {
    document.getElementById('isActive').checked = items.isActive;
    document.getElementById('timezone').value = items.timezone;
    document.getElementById('dateFormat').value = items.dateFormat;
  });

  const saveSettings = () => {
    const settings = {
      isActive: document.getElementById('isActive').checked,
      timezone: document.getElementById('timezone').value,
      dateFormat: document.getElementById('dateFormat').value
    };
    
    chrome.storage.local.set(settings, () => {
      const status = document.getElementById('status');
      status.textContent = 'Tersimpan!';
      setTimeout(() => { status.textContent = ''; }, 1500);
      
      // Kirim pesan ke tab aktif untuk update real-time
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated', settings });
      });
    });
  };

  ['isActive', 'timezone', 'dateFormat'].forEach(id => {
    document.getElementById(id).addEventListener('change', saveSettings);
  });
});