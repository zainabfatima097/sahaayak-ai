import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Briefcase, DollarSign, Globe, Volume2, Save, 
  Trash2, Edit2, CheckCircle, XCircle, Bell, Shield, 
  Smartphone, Languages, Eye, Type, LogOut, HelpCircle,
  Award, Clock, Database, Download
} from 'lucide-react';
import { getChatHistory, initDB } from '../services/offline/indexedDB';

const ProfilePage = () => {
  const { userContext, updateUserContext } = useUserContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userContext);
  const [stats, setStats] = useState({
    totalQueries: 0,
    savedSchemes: 0,
    daysActive: 1
  });
  const [notifications, setNotifications] = useState({
    schemeAlerts: true,
    weatherAlerts: true,
    healthReminders: false
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const history = await getChatHistory();
    setStats(prev => ({
      ...prev,
      totalQueries: history.length,
      savedSchemes: history.filter(m => m.text?.includes('scheme')).length
    }));
  };

  const handleSave = async () => {
    await updateUserContext(formData);
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const clearHistory = async () => {
    if (confirm('Are you sure? This will delete all your chat history. This action cannot be undone.')) {
      const db = await initDB();
      const tx = db.transaction('chat_history', 'readwrite');
      await tx.objectStore('chat_history').clear();
      await tx.done;
      alert('Chat history cleared successfully');
      loadStats();
    }
  };

  const exportData = async () => {
    const history = await getChatHistory();
    const data = {
      profile: userContext,
      chatHistory: history,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sahaayak_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const occupations = [
    { value: 'farmer', label: 'किसान / Farmer', icon: '🌾' },
    { value: 'labor', label: 'मजदूर / Labor', icon: '🔨' },
    { value: 'homemaker', label: 'गृहिणी / Homemaker', icon: '🏠' },
    { value: 'student', label: 'विद्यार्थी / Student', icon: '📚' },
    { value: 'teacher', label: 'शिक्षक / Teacher', icon: '👨‍🏫' },
    { value: 'small_business', label: 'छोटा व्यवसाय / Small Business', icon: '🏪' },
    { value: 'other', label: 'अन्य / Other', icon: '👤' }
  ];

  const incomeLevels = [
    { value: 'below_poverty_line', label: 'BPL (Below Poverty Line)', icon: '📉' },
    { value: 'low', label: 'Low Income', icon: '📊' },
    { value: 'middle', label: 'Middle Income', icon: '📈' },
    { value: 'above_average', label: 'Above Average', icon: '💰' }
  ];

  const languages = [
    'Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Bengali', 
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia'
  ];

  const getOccupationLabel = (value) => {
    return occupations.find(o => o.value === value)?.label || value;
  };

  const getIncomeLabel = (value) => {
    return incomeLevels.find(i => i.value === value)?.label || value;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">मेरी प्रोफाइल</h1>
        <p className="text-purple-100">My Profile & Settings</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
              <User size={40} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-800">
                {userContext.name || 'Rural Citizen'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date().getFullYear()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  Active
                </div>
                <div className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {userContext.voice_preferred ? 'Voice Enabled' : 'Text Mode'}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1 text-purple-600 text-sm font-medium hover:text-purple-700"
          >
            {isEditing ? (
              <XCircle size={16} />
            ) : (
              <Edit2 size={16} />
            )}
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {!isEditing ? (
          // View Mode
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
                <MapPin size={18} className="text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium">{userContext.location || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
                <Briefcase size={18} className="text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Occupation</p>
                  <p className="text-sm font-medium">{getOccupationLabel(userContext.occupation)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
                <DollarSign size={18} className="text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Income Level</p>
                  <p className="text-sm font-medium">{getIncomeLabel(userContext.income_level)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-700 p-2 bg-gray-50 rounded-lg">
                <Globe size={18} className="text-purple-600" />
                <div>
                  <p className="text-xs text-gray-500">Language</p>
                  <p className="text-sm font-medium">{userContext.language}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                <MapPin size={14} className="inline mr-1" />
                Location (District, State)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
                placeholder="e.g., Sitapur, Uttar Pradesh"
              />
              <p className="text-xs text-gray-400 mt-1">For personalized scheme recommendations</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                <Briefcase size={14} className="inline mr-1" />
                Occupation
              </label>
              <select
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              >
                {occupations.map(occ => (
                  <option key={occ.value} value={occ.value}>
                    {occ.icon} {occ.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                <DollarSign size={14} className="inline mr-1" />
                Income Level
              </label>
              <select
                value={formData.income_level}
                onChange={(e) => setFormData({ ...formData, income_level: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              >
                {incomeLevels.map(inc => (
                  <option key={inc.value} value={inc.value}>
                    {inc.icon} {inc.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                <Globe size={14} className="inline mr-1" />
                Preferred Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-purple-500"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Volume2 size={18} className="text-purple-600" />
                <span className="text-sm">Enable voice responses</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.voice_preferred}
                  onChange={(e) => setFormData({ ...formData, voice_preferred: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 font-medium"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Award size={18} className="text-purple-600" />
          Your Activity
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.totalQueries}</div>
            <div className="text-xs text-gray-600 mt-1">Total Queries</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-700">{stats.savedSchemes}</div>
            <div className="text-xs text-gray-600 mt-1">Schemes Found</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-700">{stats.daysActive}</div>
            <div className="text-xs text-gray-600 mt-1">Days Active</div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Bell size={18} className="text-purple-600" />
          Notification Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Scheme Alerts</p>
              <p className="text-xs text-gray-500">New government schemes for you</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.schemeAlerts}
                onChange={(e) => setNotifications({ ...notifications, schemeAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Weather Alerts</p>
              <p className="text-xs text-gray-500">Farming weather updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.weatherAlerts}
                onChange={(e) => setNotifications({ ...notifications, weatherAlerts: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Eye size={18} className="text-purple-600" />
          Accessibility
        </h3>
        <div className="space-y-2 text-sm">
          <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between">
            <span>High Contrast Mode</span>
            <span className="text-gray-400">Coming Soon</span>
          </button>
          <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between">
            <span>Large Text Mode</span>
            <span className="text-gray-400">Coming Soon</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-red-600">
          <Database size={18} />
          Data Management
        </h3>
        <div className="space-y-2">
          <button
            onClick={exportData}
            className="w-full border border-blue-300 text-blue-600 py-2 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-2 text-sm"
          >
            <Download size={16} />
            Export My Data
          </button>
          <button
            onClick={clearHistory}
            className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            Clear Chat History
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Your data is stored locally on your device. Export your data before clearing.
        </p>
      </div>

      {/* Help & Support */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <HelpCircle size={18} className="text-purple-600" />
          Help & Support
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between">
            <span>📖 User Guide</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between">
            <span>📞 Contact Support</span>
            <span className="text-gray-400">→</span>
          </button>
          <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between">
            <span>ℹ️ About Sahaayak AI</span>
            <span className="text-gray-400">→</span>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-xs text-gray-400 py-4 space-y-1">
        <p>Sahaayak AI v1.0.0</p>
        <p>Made with ❤️ for Rural India</p>
        <p>Voice-First AI Assistant</p>
      </div>
    </div>
  );
};

export default ProfilePage;