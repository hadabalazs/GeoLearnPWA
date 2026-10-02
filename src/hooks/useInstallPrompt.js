import { useEffect, useState } from 'react';

// Module-level store for the deferred install prompt captured from the
// `beforeinstallprompt` event. Shared across all hook instances so the
// prompt is preserved even when the modal isn't mounted.
let deferredPrompt = null;

export function getDeferredPrompt() {
  return deferredPrompt;
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

// Captures the `beforeinstallprompt` event so we can trigger the native
// install prompt later from the Android CTA button. Returns `canInstall`
// state so components re-render when the event fires.
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(() => !!deferredPrompt);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  return canInstall;
}

// First-visit auto-show logic — returns true if the guide should appear.
export function shouldAutoShow() {
  if (typeof window === 'undefined') return false;
  if (isStandalone()) return false;
  return !localStorage.getItem('install_guide_seen');
}

export function markInstallGuideSeen() {
  localStorage.setItem('install_guide_seen', 'true');
}