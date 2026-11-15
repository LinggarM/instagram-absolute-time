const defaults = { isActive: true, timezone: 'Asia/Jakarta', dateFormat: 'default' };

// Terjemahkan semua elemen dengan atribut data-i18n
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const text = chrome.i18n.getMessage(key);
    if (text) el.textContent = text;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyI18n();

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
      status.textContent = chrome.i18n.getMessage('saved');
      setTimeout(() => { status.textContent = ''; }, 1500);
      
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, { action: 'settingsUpdated', settings });
      });
    });
  };

  ['isActive', 'timezone', 'dateFormat'].forEach(id => {
    document.getElementById(id).addEventListener('change', saveSettings);
  });
});