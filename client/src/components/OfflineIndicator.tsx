/**
 * Offline Indicator Component
 * Shows when user is offline and syncs data when back online
 */

import { usePWA } from "@/hooks/usePWA";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
    } else {
      // Hide indicator after 2 seconds when coming back online
      const timer = setTimeout(() => setShowIndicator(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 max-w-sm mx-auto px-4 py-3 rounded-lg border flex items-center gap-3 transition-all duration-300 ${
        isOnline
          ? "bg-green-500/10 border-green-500/30 text-green-400"
          : "bg-red-500/10 border-red-500/30 text-red-400"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span className="text-sm">Conectado novamente</span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm">Você está offline</span>
        </>
      )}
    </div>
  );
}
