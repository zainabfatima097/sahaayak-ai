import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  WifiOff, RefreshCw, Database, Clock, BookOpen, Phone, MapPin, 
  AlertCircle, CheckCircle, XCircle, Battery, Signal, CloudOff,
  ArrowLeft, Home, MessageCircle, Heart, Sprout, GraduationCap
} from 'lucide-react';
import { getChatHistory, getOfflineQueue } from '../services/offline/indexedDB';

const OfflinePage = () => {
  const navigate = useNavigate();
  const [cachedContent, setCachedContent] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    loadCachedContent();
    loadPendingCount();
    loadLastSyncTime();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming online
      setTimeout(() => handleRefresh(), 1000);
    };
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedContent = async () => {
    const history = await getChatHistory(50);
    setCachedContent(history.filter(msg => msg.type === 'ai'));
  };

  const loadPendingCount = async () => {
    const queue = await getOfflineQueue();
    setPendingRequests(queue.length);
  };

  const loadLastSyncTime = () => {
    const lastSync = localStorage.getItem('lastSyncTime');
    if (lastSync) {
      setLastSyncTime(new Date(parseInt(lastSync)));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCachedContent();
    await loadPendingCount();
    localStorage.setItem('lastSyncTime', Date.now().toString());
    setLastSyncTime(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const offlineResources = [
    {
      title: "🚨 Emergency Helplines",
      icon: Phone,
      color: "from-red-500 to-rose-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      content: [
        { label: "Ambulance", number: "108", action: "tel:108" },
        { label: "Police", number: "100", action: "tel:100" },
        { label: "Fire", number: "101", action: "tel:101" },
        { label: "Women Helpline", number: "1090", action: "tel:1090" },
        { label: "Child Helpline", number: "1098", action: "tel:1098" }
      ]
    },
    {
      title: "🏥 Healthcare (Offline Guide)",
      icon: Heart,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      content: [
        { label: "Primary Health Centre", info: "Within 5km", action: null },
        { label: "Community Health Centre", info: "Within 10km", action: null },
        { label: "First Aid", info: "Keep basic medicines at home", action: null },
        { label: "COVID Helpline", number: "1075", action: "tel:1075" }
      ]
    },
    {
      title: "🌾 Agriculture Support",
      icon: Sprout,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      content: [
        { label: "Krishi Vigyan Kendra", info: "District level", action: null },
        { label: "Soil Testing", info: "Free at KVK", action: null },
        { label: "MSP Helpline", number: "1800-180-1551", action: "tel:18001801551" }
      ]
    },
    {
      title: "📚 Education Resources",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      content: [
        { label: "DIKSHA App", info: "Offline learning", action: null },
        { label: "SWAYAM Courses", info: "Download for offline", action: null },
        { label: "Scholarship Helpline", number: "1800-11-8004", action: "tel:1800118004" }
      ]
    }
  ];

  const getQuickActions = () => {
    return [
      { icon: Home, label: "Home", path: "/", color: "bg-green-500" },
      { icon: MessageCircle, label: "Chat", path: "/chat", color: "bg-blue-500" },
      { icon: Heart, label: "Health", path: "/healthcare", color: "bg-red-500" },
      { icon: Sprout, label: "Farming", path: "/agriculture", color: "bg-yellow-500" }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-20">
      {/* Offline Banner with Animation */}
      <div className={`${isOnline ? 'bg-green-600' : 'bg-gradient-to-r from-red-600 to-rose-600'} rounded-2xl m-4 p-6 text-white shadow-xl animate-slide-up`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} bg-opacity-30 backdrop-blur-sm`}>
            {isOnline ? <Signal size={32} /> : <WifiOff size={32} />}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {isOnline ? "You're Back Online! 🎉" : "You're Offline"}
            </h1>
            <p className="text-sm opacity-90 mt-1">
              {isOnline 
                ? "Your connection has been restored. Syncing data..." 
                : "Internet connection is not available. Access cached information."}
            </p>
          </div>
          {!isOnline && (
            <div className="text-right">
              <Battery size={24} className="inline-block opacity-75" />
              <p className="text-xs mt-1">Offline Mode</p>
            </div>
          )}
        </div>
      </div>

      {/* Connection Status Card */}
      <div className="mx-4 mb-6">
        <div className={`rounded-xl p-4 border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} animate-slide-up`} style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? <CheckCircle size={24} className="text-green-600" /> : <AlertCircle size={24} className="text-yellow-600" />}
              <div>
                <p className={`font-semibold ${isOnline ? 'text-green-700' : 'text-yellow-700'}`}>
                  {isOnline ? "Connected to Internet" : "No Internet Connection"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isOnline 
                    ? "You can access all features" 
                    : "Limited functionality - Using cached data"}
                </p>
              </div>
            </div>
            {lastSyncTime && (
              <p className="text-xs text-gray-400">
                Last sync: {lastSyncTime.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mx-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Database size={20} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Cached Responses</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{cachedContent.length}</div>
          <p className="text-xs text-gray-400 mt-1">Available offline</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Clock size={20} className="text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">Pending Sync</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">{pendingRequests}</div>
          <p className="text-xs text-gray-400 mt-1">Will sync when online</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mx-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <CloudOff size={18} className="text-gray-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {getQuickActions().map((action, idx) => (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="bg-white rounded-xl p-3 text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <action.icon size={18} className="text-white" />
              </div>
              <span className="text-xs font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mx-4 mb-6">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Cached Data'}
        </button>
      </div>

      {/* Offline Resources Section */}
      <div className="mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
          <BookOpen size={20} className="text-green-600" />
          Offline Resources
        </h2>
        <div className="space-y-4">
          {offlineResources.map((resource, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-slide-up" style={{ animationDelay: `${0.4 + idx * 0.1}s` }}>
              <div className={`bg-gradient-to-r ${resource.color} p-3`}>
                <div className="flex items-center gap-2 text-white">
                  <resource.icon size={18} />
                  <h3 className="font-semibold">{resource.title}</h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {resource.content.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">•</span>
                      <span className="text-sm text-gray-700">{item.label}</span>
                      {item.info && (
                        <span className="text-xs text-gray-400">({item.info})</span>
                      )}
                    </div>
                    {item.number && (
                      <a 
                        href={item.action}
                        className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                      >
                        Call {item.number}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cached Conversations */}
      {cachedContent.length > 0 && (
        <div className="mx-4 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            Previously Viewed
          </h2>
          <div className="space-y-3">
            {cachedContent.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-700 line-clamp-2">
                  {item.text?.substring(0, 120)}...
                </p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </p>
                  <button 
                    onClick={() => navigate('/chat')}
                    className="text-xs text-green-600 hover:text-green-700 font-medium"
                  >
                    View Full →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Tips */}
      <div className="mx-4 mt-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-2">Offline Tips</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li className="flex items-center gap-2">
                  <span>•</span> Your questions will be saved and answered when online
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span> Emergency numbers work without internet
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span> Visit nearest CSC center for free WiFi
                </li>
                <li className="flex items-center gap-2">
                  <span>•</span> Download important info while connected
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Checker & Navigation */}
      <div className="flex items-center justify-center gap-4 mx-4 mt-6 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          <RefreshCw size={16} />
          Check Connection
        </button>
      </div>
    </div>
  );
};

export default OfflinePage;