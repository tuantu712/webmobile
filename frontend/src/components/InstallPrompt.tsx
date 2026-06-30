import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install promotion UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already run in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-card-dark border border-primary-light p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center text-accent">
          <Download size={24} />
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">fuzzy app</h4>
          <p className="text-xs text-slate-400">Install to your home screen</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors duration-200"
        >
          Add
        </button>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-white p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
