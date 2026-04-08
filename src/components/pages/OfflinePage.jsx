import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Database, Clock, BookOpen, Phone, MapPin } from 'lucide-react';
import { getChatHistory, getOfflineQueue } from '../services/offline/indexedDB';

const OfflinePage = () => {
  const [cachedContent, setCachedContent] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadCachedContent();
    loadPendingCount();
  }, []);

  const loadCachedContent = async () => {
    const history = await getChatHistory(20);
    setCachedContent(history.filter(msg => msg.type === 'ai'));
  };

  const loadPendingCount = async () => {
    const queue = await getOfflineQueue();
    setPendingRequests(queue.length);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCachedContent();
    await loadPendingCount();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const offlineResources = [
    {
      title: "Emergency Helplines",
      icon: Phone,
      content: [
        "Ambulance: 108",
        "Police: 100",
        "Fire: 101",
        "Women Helpline: 1090",
        "Child Helpline: 1098"
      ]
    },
    {
      title: "Nearby Services (Offline Guide)",
      icon: MapPin,
      content: [
        "PHC: Within 5km",
        "Police Station: Within 10km",
        "CSC Center: Village level",
        "Krishi Vigyan Kendra: District level"
      ]
    },
    {
      title: "Essential Tips",
      icon: BookOpen,
      content: [
        "Drink clean water",
        "Wash hands regularly",
        "Visit PHC for fever",
        "Call 108 for emergency"
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Offline Banner */}
      <div className="bg-red-600 rounded-xl p-6 text-white text-center">
        <div className="flex justify-center mb-3">
          <WifiOff size={48} />
        </div>
        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
        <p className="text-red-100 text-sm">
          Internet connection is not available. You can still access cached information.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <Database size={24} className="mx-auto mb-2 text-blue-600" />
          <div className="text-2xl font-bold text-blue-700">{cachedContent.length}</div>
          <div className="text-xs text-gray-600">Cached Responses</div>
        </div>
        <div className="card text-center">
          <Clock size={24} className="mx-auto mb-2 text-orange-600" />
          <div className="text-2xl font-bold text-orange-700">{pendingRequests}</div>
          <div className="text-xs text-gray-600">Pending Sync</div>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Cached Data'}
      </button>

      {/* Offline Resources */}
      <div>
        <h2 className="text-xl font-bold mb-3">Offline Resources</h2>
        <div className="space-y-4">
          {offlineResources.map((resource, idx) => (
            <div key={idx} className="card">
              <div className="flex items-center gap-2 mb-3">
                <resource.icon size={20} className="text-green-600" />
                <h3 className="font-semibold">{resource.title}</h3>
              </div>
              <div className="space-y-2">
                {resource.content.map((item, itemIdx) => (
                  <div key={itemIdx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cached Conversations */}
      {cachedContent.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3">Previously Viewed</h2>
          <div className="space-y-3">
            {cachedContent.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {item.text?.substring(0, 100)}...
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">💡 Offline Tips</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Your questions will be saved and answered when online</li>
          <li>• Emergency numbers work without internet</li>
          <li>• Visit nearest CSC center for online services</li>
          <li>• Connect to WiFi at Common Service Centres</li>
        </ul>
      </div>

      {/* Connection Checker */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="text-green-600 text-sm underline"
        >
          Check connection again →
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;