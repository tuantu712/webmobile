import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineDetector() {
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
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 shadow-md animate-fade-in">
      <WifiOff size={16} />
      <span>No internet connection. Operating in offline mode.</span>
    </div>
  );
}
