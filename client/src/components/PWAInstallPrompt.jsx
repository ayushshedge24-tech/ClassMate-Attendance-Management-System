import React, { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';

/**
 * PWA Install Prompt Component
 * Captures the standard browser 'beforeinstallprompt' event and offers
 * a clean, native-feeling one-click install button for desktop and Android browsers.
 */
const PWAInstallPrompt = ({ variant = 'header' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone display mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      // Prevent automatic mini-infobar on mobile Chrome
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('[ClassMate PWA] App was successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[ClassMate PWA] User install choice: ${outcome}`);
    setDeferredPrompt(null);
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleInstallClick}
        className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:opacity-95 transition"
      >
        <FiDownload className="h-4 w-4" />
        <span>Install ClassMate App</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleInstallClick}
      title="Install ClassMate as a Desktop or Mobile App"
      className="hidden sm:inline-flex items-center space-x-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition shadow-sm animate-pulse"
    >
      <FiDownload className="h-3.5 w-3.5 text-indigo-600" />
      <span>Install App</span>
    </button>
  );
};

export default PWAInstallPrompt;
