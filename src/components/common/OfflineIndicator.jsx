import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

const OfflineIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bg-red-500 text-white px-4 py-2 z-40 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <WifiOff size={18} />
          <span className="text-sm">⚠️ No internet connection. Using cached information.</span>
        </div>
        <button onClick={() => setIsVisible(false)} className="p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default OfflineIndicator;