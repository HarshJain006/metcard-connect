import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

const OfflineWarning = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-2 animate-fade-in">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">
        No internet connection. Please connect to the internet.
      </span>
    </div>
  );
};

export default OfflineWarning;
