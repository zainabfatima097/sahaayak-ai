import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import { getChatHistory } from '../services/offline/indexedDB';
import { TrendingUp, Clock, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { userContext } = useUserContext();
  const [recentQueries, setRecentQueries] = useState([]);
  const [stats, setStats] = useState({
    totalQueries: 0,
    schemesFound: 0,
    lastActive: null
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const history = await getChatHistory(100);
    setRecentQueries(history.slice(-5).reverse());
    setStats({
      totalQueries: history.length,
      schemesFound: history.filter(m => m.text?.includes('scheme') || m.text?.includes('योजना')).length,
      lastActive: history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleDateString() : 'Never'
    });
  };

  const recommendations = [
    {
      title: "PM-KISAN Scheme",
      description: "₹6000 per year for farmers",
      eligibility: "Land-owning farmers",
      icon: "🌾",
      link: "/schemes"
    },
    {
      title: "Ayushman Bharat",
      description: "Free health insurance up to ₹5 lakh",
      eligibility: "Below poverty line",
      icon: "🏥",
      link: "/healthcare"
    },
    {
      title: "Digital Literacy Program",
      description: "Free computer training",
      eligibility: "Rural youth",
      icon: "💻",
      link: "/education"
    }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          नमस्ते! 👋
        </h1>
        <p className="text-green-100">
          {userContext.occupation === 'farmer' ? 'किसान' : 
           userContext.occupation === 'labor' ? 'मजदूर' : 
           userContext.occupation === 'student' ? 'विद्यार्थी' : 'साथी'}, 
          आज हम आपकी कैसे मदद कर सकते हैं?
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-2xl font-bold text-green-700">{stats.totalQueries}</div>
          <div className="text-sm text-gray-600">Total Queries</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-green-700">{stats.schemesFound}</div>
          <div className="text-sm text-gray-600">Schemes Found</div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div>
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
          <TrendingUp size={20} className="text-green-600" />
          Recommended for You
        </h2>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <Link to={rec.link} key={idx} className="card block hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-3">
                <div className="text-3xl">{rec.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <p className="text-xs text-green-600 mt-2">✓ {rec.eligibility}</p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {recentQueries.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Clock size={20} className="text-green-600" />
            Recent Activity
          </h2>
          <div className="space-y-2">
            {recentQueries.map((query, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  {query.type === 'user' ? '🗣️ You asked: ' : '🤖 Sahaayak: '}
                  <span className="font-medium">{query.text?.substring(0, 60)}...</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(query.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Bell size={18} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Quick Tip</p>
            <p className="text-xs text-blue-700 mt-1">
              Try saying: "मुझे कौन सी सरकारी योजनाएं मिल सकती हैं?" or 
              "Show me government schemes for farmers"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;