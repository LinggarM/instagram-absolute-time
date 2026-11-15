let settings = { isActive: true, timezone: 'Asia/Jakarta', dateFormat: 'default' };

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ isActive: true, timezone: 'Asia/Jakarta', dateFormat: 'default' }, (items) => {
      settings = items;
      resolve(settings);
    });
  });
}

function formatDate(date, timezone, format) {
  const tz = timezone === 'local' ? undefined : timezone;
  const baseOptions = { timeZone: tz };

  if (format === 'iso') {
    return date.toLocaleString('sv-SE', { ...baseOptions, hour12: false });
  } else if (format === 'short') {
    return date.toLocaleString('id-ID', { ...baseOptions, year: 'numeric', month: '2-digit', day: '2-digit' });
  } else {
    return date.toLocaleString('id-ID', { 
      ...baseOptions, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  }
}

// Fungsi baru: bersihkan semua span tambahan & reset flag
function clearAllTimestamps() {
  document.querySelectorAll('time[datetime] span[data-iat]').forEach(span => span.remove());
  document.querySelectorAll('time[datetime]').forEach(el => delete el.dataset.replaced);
}

function updateInstagramTimestamps() {
  const timeElements = document.querySelectorAll('time[datetime]');
  
  timeElements.forEach(el => {
    // Jika dinonaktifkan, hapus span tambahan saja
    if (!settings.isActive) {
      const existingSpan = el.querySelector('span[data-iat]');
      if (existingSpan) existingSpan.remove();
      delete el.dataset.replaced;
      return;
    }

    if (el.dataset.replaced) return;

    const date = new Date(el.getAttribute('datetime'));
    if (isNaN(date.getTime())) return;

    const formattedElement = document.createElement('span');
    formattedElement.textContent = ` · ${formatDate(date, settings.timezone, settings.dateFormat)}`;
    formattedElement.style.color = '#0095f6';
    formattedElement.style.fontWeight = '500';
    formattedElement.dataset.iat = 'true';
    
    el.appendChild(formattedElement);
    el.dataset.replaced = 'true';
  });
}

// Inisialisasi
loadSettings().then(updateInstagramTimestamps);

// Dengarkan perubahan dari popup
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'settingsUpdated') {
    settings = request.settings;
    // Kunci perbaikan: bersihkan dulu, baru format ulang
    clearAllTimestamps();
    updateInstagramTimestamps();
  }
});

// Observer untuk halaman SPA
const observer = new MutationObserver(() => {
  setTimeout(updateInstagramTimestamps, 100);
});
observer.observe(document.body, { childList: true, subtree: true });