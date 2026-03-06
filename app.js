const statusEl = document.getElementById('status');
const installBtn = document.getElementById('installBtn');

let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('/sw.js');
      statusEl.textContent = 'PWA готово: service worker зарегистрирован.';
    } catch (error) {
      statusEl.textContent = `Ошибка регистрации service worker: ${error}`;
    }
  });
} else {
  statusEl.textContent = 'Service worker не поддерживается в этом браузере.';
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.hidden = false;
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.hidden = true;
  deferredPrompt = null;
});
