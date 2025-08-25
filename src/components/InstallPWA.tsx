import React, { useState, useEffect } from 'react';

interface InstallPWAProps {
  className?: string;
}

const InstallPWA: React.FC<InstallPWAProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualButton, setShowManualButton] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return true;
      }
      if ((window.navigator as any).standalone) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // Check if already installed
    if (checkIfInstalled()) {
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setShowManualButton(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowManualButton(false);
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show manual button after a delay if no automatic prompt
    const timer = setTimeout(() => {
      if (!isInstalled && !isInstallable) {
        setShowManualButton(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstalled, isInstallable]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          console.log('User accepted the install prompt');
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          setShowManualButton(false);
        } else {
          console.log('User dismissed the install prompt');
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
        // Fallback: show manual install instructions
        showManualInstallInstructions();
      }
    } else {
      // No deferred prompt, show manual instructions
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const instructions = `
      To install this app:
      
      📱 Mobile (Chrome/Edge):
      • Tap the menu (⋮) button
      • Select "Add to Home Screen" or "Install App"
      
      💻 Desktop (Chrome/Edge):
      • Look for the install icon (📱) in the address bar
      • Click it to install the app
      
      🔍 Alternative:
      • Open in Chrome/Edge browser
      • Use browser's install option
    `;
    
    alert(instructions);
  };

  // Don't show anything if already installed
  if (isInstalled) {
    return null;
  }

  // Don't show if not installable and no manual button needed
  if (!isInstallable && !showManualButton) {
    return null;
  }

  return (
    <div className={`install-pwa-container ${className}`}>
      <button
        onClick={handleInstallClick}
        className={`install-pwa-button ${isInstallable ? 'installable' : 'manual'}`}
        title={isInstallable ? 'Install Offline Maps PWA' : 'Installation Instructions'}
      >
        {isInstallable ? (
          <>
            📱 Install App
            <span className="install-hint">Tap to install</span>
          </>
        ) : (
          <>
            📱 Install App
            <span className="install-hint">Tap for instructions</span>
          </>
        )}
      </button>
      
      {isInstallable && (
        <div className="install-tip">
          💡 This app can be installed on your device for offline use
        </div>
      )}
    </div>
  );
};

export default InstallPWA;
