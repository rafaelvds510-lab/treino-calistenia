/**
 * PWA Install Button Component
 * Displays install prompt for users to add app to home screen
 */

import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Download, Check, Smartphone, X } from "lucide-react";
import { useState, useEffect } from "react";

export function PWAInstallButton() {
  const { canInstall, isInstalled, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa-banner-dismissed") === "true";
    }
    return false;
  });

  useEffect(() => {
    if (canInstall && !dismissed) {
      // Small delay so the page loads first
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, dismissed]);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FF88]/10 border border-[#00FF88]/30 text-[#00FF88] text-xs font-medium">
        <Check size={14} />
        <span>Instalado</span>
      </div>
    );
  }

  return (
    <>
      {/* Inline button (header) */}
      {canInstall && !dismissed && (
        <Button
          onClick={installApp}
          variant="outline"
          size="sm"
          className="gap-2 border-[#00FF88]/40 text-[#00FF88] hover:bg-[#00FF88]/10 text-xs hidden sm:flex"
        >
          <Download size={14} />
          <span>Instalar App</span>
        </Button>
      )}

      {/* Mobile bottom banner */}
      {showBanner && !dismissed && (
        <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-4 sm:w-96 z-40 pb-2 pt-3 px-3 sm:p-4 animate-in slide-in-from-bottom-4 duration-300">
          <div
            className="relative flex items-center gap-4 p-4 rounded-2xl border border-[#00FF88]/30 backdrop-blur-md"
            style={{ background: "rgba(10, 14, 39, 0.95)" }}
          >
            {/* Icon */}
            <div className="h-12 w-12 rounded-xl overflow-hidden flex-shrink-0 border border-[#00FF88]/20">
              <img
                src="/icons/icon-192x192.png"
                alt="Calistenia"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Instalar Calistenia Trainer</p>
              <p className="text-xs text-muted-foreground">Adicione à tela inicial para acesso rápido</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={() => {
                  installApp();
                  setShowBanner(false);
                }}
                size="sm"
                className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold text-xs gap-1.5"
              >
                <Smartphone size={13} />
                Instalar
              </Button>
            </div>

            {/* Close */}
            <button
              onClick={() => { 
                setShowBanner(false); 
                setDismissed(true); 
                localStorage.setItem("pwa-banner-dismissed", "true");
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
