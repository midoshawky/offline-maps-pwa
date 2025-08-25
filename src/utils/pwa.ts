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

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });

    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  }
};

export const installPWA = (): void => {
  let deferredPrompt: any;
  let installButton: HTMLElement | null = null;

  const showInstallPrompt = (): void => {
    // Remove existing install button if any
    if (installButton) {
      installButton.remove();
    }

    // Create install button or notification
    installButton = document.createElement('div');
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
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
      ">
        📱 Install App
      </div>
    `;
    
    // Add hover effect
    const buttonDiv = installButton.querySelector('div');
    if (buttonDiv) {
      buttonDiv.addEventListener('mouseenter', () => {
        buttonDiv.style.transform = 'scale(1.05)';
        buttonDiv.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      });
      
      buttonDiv.addEventListener('mouseleave', () => {
        buttonDiv.style.transform = 'scale(1)';
        buttonDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      });
    }
    
    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        try {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
            hideInstallPrompt();
          } else {
            console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
        } catch (error) {
          console.error('Error showing install prompt:', error);
        }
      }
    });
    
    document.body.appendChild(installButton);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (installButton && document.body.contains(installButton)) {
        hideInstallPrompt();
      }
    }, 10000);
  };

  const hideInstallPrompt = (): void => {
    if (installButton) {
      installButton.remove();
      installButton = null;
    }
  };

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event fired');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Show install button or notification
    showInstallPrompt();
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', (evt) => {
    console.log('PWA was installed');
    // Hide the install prompt
    hideInstallPrompt();
    // Clear the deferredPrompt
    deferredPrompt = null;
    
    // Show success message
    showInstallSuccess();
  });

  const showInstallSuccess = (): void => {
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50;
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 1001;
        font-family: Arial, sans-serif;
        text-align: center;
        animation: fadeIn 0.3s ease;
      ">
        <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">App Installed!</div>
        <div style="font-size: 14px; opacity: 0.9;">Your Offline Maps PWA is now installed</div>
      </div>
    `;
    
    document.body.appendChild(successMessage);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (document.body.contains(successMessage)) {
        successMessage.remove();
      }
    }, 3000);
  };

  // Check if app is already installed
  const isAppInstalled = (): boolean => {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    if ((window.navigator as any).standalone) {
      return true;
    }
    return false;
  };

  // Only show install prompt if app is not already installed
  if (!isAppInstalled()) {
    // Check if we should show install prompt after a delay
    setTimeout(() => {
      if (deferredPrompt && !installButton) {
        showInstallPrompt();
      }
    }, 2000);
  }
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

// Add CSS for animations
const addInstallStyles = (): void => {
  if (!document.getElementById('pwa-install-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-install-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      
      #install-prompt div {
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
};

// Initialize styles
addInstallStyles();
