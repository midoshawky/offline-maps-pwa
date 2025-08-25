export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              if (window.confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

export const installPWA = (): void => {
  let deferredPrompt: any;

  const showInstallPrompt = (): void => {
    // Create install button or notification
    const installButton = document.createElement('div');
    installButton.id = 'install-prompt';
    installButton.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        cursor: pointer;
        font-family: Arial, sans-serif;
      ">
        📱 Install App
      </div>
    `;
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
        hideInstallPrompt();
      }
    });
    
    document.body.appendChild(installButton);
  };

  const hideInstallPrompt = (): void => {
    const installPrompt = document.getElementById('install-prompt');
    if (installPrompt) {
      installPrompt.remove();
    }
  };

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    showInstallPrompt();
  });

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    // Hide the install prompt
    hideInstallPrompt();
  });
};

export const checkOnlineStatus = (): boolean => {
  return navigator.onLine;
};

export const addOnlineStatusListener = (callback: (isOnline: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
