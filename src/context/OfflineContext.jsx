import React, { createContext, useState, useContext, useEffect } from 'react';
import { getOfflineQueue, addToOfflineQueue, removeFromOfflineQueue } from '../components/services/offline/indexedDB';

const OfflineContext = createContext();

export const useOfflineContext = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOfflineContext must be used within OfflineProvider');
  }
  return context;
};

export const OfflineProvider = ({ children }) => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      syncPendingRequests();
    };
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    loadPendingCount();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingCount = async () => {
    const queue = await getOfflineQueue();
    setPendingRequests(queue.length);
  };

  const syncPendingRequests = async () => {
    const queue = await getOfflineQueue();
    for (const request of queue) {
      try {
        // Retry the request
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body
        });
        if (response.ok) {
          await removeFromOfflineQueue(request.id);
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
    await loadPendingCount();
  };

  const queueRequest = async (request) => {
    await addToOfflineQueue(request);
    setPendingRequests(prev => prev + 1);
  };

  return (
    <OfflineContext.Provider value={{ isOffline, pendingRequests, queueRequest }}>
      {children}
    </OfflineContext.Provider>
  );
};