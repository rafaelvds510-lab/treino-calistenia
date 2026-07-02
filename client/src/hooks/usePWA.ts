/**
 * Hook for PWA functionality
 * Handles service worker registration, install prompts, and offline detection
 */

import { useEffect, useState } from "react";

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(
    null
  );
  const [isInstalled, setIsInstalled] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[PWA] Service worker registered:", registration);
          setSwRegistration(registration);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
        })
        .catch((error) => {
          console.error("[PWA] Service worker registration failed:", error);
        });
    }
  }, []);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("[PWA] Install prompt available");
      setInstallPrompt(e as unknown as PWAInstallPrompt);
    };

    const handleAppInstalled = () => {
      console.log("[PWA] App installed");
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log("[PWA] Online");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("[PWA] Offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Install app
  const installApp = async () => {
    if (!installPrompt) {
      console.warn("[PWA] Install prompt not available");
      return;
    }

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`[PWA] User response: ${outcome}`);

      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } catch (error) {
      console.error("[PWA] Installation failed:", error);
    }
  };

  // Check for updates
  const checkForUpdates = async () => {
    if (!swRegistration) {
      console.warn("[PWA] Service worker not registered");
      return;
    }

    try {
      await swRegistration.update();
      console.log("[PWA] Checked for updates");
    } catch (error) {
      console.error("[PWA] Update check failed:", error);
    }
  };

  // Update app
  const updateApp = () => {
    if (!swRegistration?.waiting) {
      console.warn("[PWA] No waiting service worker");
      return;
    }

    swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });

    // Reload page when new service worker is activated
    let refreshing = false;
    navigator.serviceWorker.oncontrollerchange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
  };

  return {
    isOnline,
    isInstalled,
    canInstall: !!installPrompt && !isInstalled,
    installApp,
    checkForUpdates,
    updateApp,
    hasUpdate: !!swRegistration?.waiting,
  };
}
