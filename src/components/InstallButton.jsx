// ✅ Enhanced InstallButton.jsx to match pink theme + consistent UI
import { useEffect, useState } from 'react';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('App installed');
          logEvent(analytics, 'pwa_install', {
            method: 'custom_install_button'
          });
        }
        setDeferredPrompt(null);
      });
    }
  };

  return (
    deferredPrompt && (
      <button
        onClick={handleInstall}
        className="fixed bottom-20 right-6 z-40 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-full shadow-lg transition-transform transform hover:scale-105 text-sm"
      >
        📲 Install App
      </button>
    )
  );
}

export default InstallButton;