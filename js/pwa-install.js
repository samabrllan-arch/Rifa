/**
 * GESTOR DE INSTALACIÓN PWA EN CELULARES (ANDROID & IOS)
 * Gran Rifa Oficial - Olla Kalley + $200.000 COP
 */

let deferredInstallPrompt = null;

// 1. Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then((reg) => {
        console.log('[PWA] Service Worker registrado con éxito. Scope:', reg.scope);
        reg.update();
      })
      .catch((err) => {
        console.warn('[PWA] Error al registrar Service Worker:', err);
      });
  });
}

// 2. Detección de Plataforma
const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
};

// 3. Captura del evento beforeinstallprompt (Android / Chrome)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;

  // Mostrar el único botón de instalación en el header
  const btnHeader = document.getElementById('btnInstallHeader');
  if (btnHeader) btnHeader.style.display = 'inline-flex';
});

// 4. Manejo del click de instalación
window.triggerPwaInstall = async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    console.log('[PWA] Respuesta de usuario a instalación:', outcome);
    deferredInstallPrompt = null;

    const btnHeader = document.getElementById('btnInstallHeader');
    if (btnHeader) btnHeader.style.display = 'none';
  } else if (isIos()) {
    // Si es iPhone/iPad, mostrar instrucciones de Safari
    const iosModal = document.getElementById('iosInstallModal');
    if (iosModal) iosModal.classList.add('active');
  } else {
    // Ya está instalado o en escritorio
    alert('¡La aplicación ya está instalada o puedes añadirla desde el menú de opciones de tu navegador (Instalar aplicación)!');
  }
};

// Ocultar botón si ya está ejecutándose como aplicación instalada
window.addEventListener('DOMContentLoaded', () => {
  if (isInStandaloneMode()) {
    const btnHeader = document.getElementById('btnInstallHeader');
    if (btnHeader) btnHeader.style.display = 'none';
  }
});
