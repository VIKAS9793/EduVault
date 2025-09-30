/**
 * useOfflineDetection Hook
 * Provides real-time online/offline status
 */

import { useState, useEffect } from 'react';

interface OfflineStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export const useOfflineDetection = (): OfflineStatus => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = (): void => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset wasOffline after 5 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 5000);
    };

    const handleOffline = (): void => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
};
