import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { 
  User, Mail, Phone, MapPin, Briefcase, DollarSign, Globe, 
  Volume2, Save, Edit2, Camera, Bell, Shield, Smartphone, 
  Languages, Award, Clock, Database, LogOut, ChevronRight,
  CheckCircle, AlertCircle, Moon, Sun, Heart, Sprout, GraduationCap,
  Calendar, TrendingUp, MessageCircle, Star, Zap, Settings
} from 'lucide-react';
import { getChatHistory } from '../services/offline/indexedDB';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userContext, updateUserContext } = useUserContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    occupation: 'farmer',
    income_level: 'below_poverty_line',
    language: 'Hindi',
    voice_preferred: true,
    notifications_enabled: true,
    dark_mode: false
  });
  const [stats, setStats] = useState({
    totalQueries: 0,
    savedSchemes: 0,
    daysActive: 1,
    questionsAsked: 0,
    lastActive: null
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = () => {
    setFormData({
      name: userContext.name || '',
      email: userContext.email || '',
      phone: userContext.phone || '',
      location: userContext.location || '',
      occupation: userContext.occupation || 'farmer',
      income_level: userContext.income_level || 'below_poverty_line',
      language: userContext.language || 'Hindi',
      voice_preferred: userContext.voice_preferred !== false,
      notifications_enabled: userContext.notifications_enabled !== false,
      dark_mode: userContext.dark_mode || false
    });
  };

  const loadStats = async () => {
    const history = await getChatHistory();
    const lastActive = localStorage.getItem('lastActive');
    
    setStats({
      totalQueries: history.length,
      savedSchemes: history.filter(m => m.text?.includes('scheme') || m.text?.includes('योजना')).length,
      daysActive: Math.floor((Date.now() - (parseInt(localStorage.getItem('joinDate')) || Date.now())) / (1000 * 60 * 60 * 24)) + 1,
      questionsAsked: history.filter(m => m.type === 'user').length,
      lastActive: lastActive ? new Date(parseInt(lastActive)) : new Date()
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserContext(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      updateUserContext({ isAuthenticated: false });
      navigate('/');
    }
  };

  const occupations = [
    { value: 'farmer', label: 'किसान / Farmer', icon: '🌾', description: 'Agriculture' },
    { value: 'labor', label: 'मजदूर / Labor', icon: '🔨', description: 'Daily Wage' },
    { value: 'homemaker', label: 'गृहिणी / Homemaker', icon: '🏠', description: 'Household' },
    { value: 'student', label: 'विद्यार्थी / Student', icon: '📚', description: 'Education' },
    { value: 'teacher', label: 'शिक्षक / Teacher', icon: '👨‍🏫', description: 'Education' },
    { value: 'small_business', label: 'छोटा व्यवसाय / Small Business', icon: '🏪', description: 'Business' },
    { value: 'other', label: 'अन्य / Other', icon: '👤', description: 'Other' }
  ];

  const incomeLevels = [
    { value: 'below_poverty_line', label: 'BPL (Below Poverty Line)', icon: '📉', color: 'text-red-600' },
    { value: 'low', label: 'Low Income', icon: '📊', color: 'text-orange-600' },
    { value: 'middle', label: 'Middle Income', icon: '📈', color: 'text-yellow-600' },
    { value: 'above_average', label: 'Above Average', icon: '💰', color: 'text-green-600' }
  ];

  const languages = [
    'Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Bengali', 
    'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'
  ];

  const getOccupationLabel = (value) => {
    return occupations.find(o => o.value === value)?.label || value;
  };

  const getIncomeLabel = (value) => {
    return incomeLevels.find(i => i.value === value)?.label || value;
  };

  const getIncomeColor = (value) => {
    return incomeLevels.find(i => i.value === value)?.color || 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-20">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
            <CheckCircle size={18} />
            <span>Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header with Cover Image */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-600"></div>
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
              <div className="w-full h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform">
              <Camera size={14} className="text-green-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-16 max-w-2xl">
        {/* User Name & Edit Button */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {formData.name || 'Rural Citizen'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Active</span>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
              {formData.voice_preferred ? '🎤 Voice Enabled' : '⌨️ Text Mode'}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageCircle size={14} className="text-green-600" />
            </div>
            <div className="text-xl font-bold text-gray-800">{stats.totalQueries}</div>
            <div className="text-xs text-gray-500">Total Queries</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star size={14} className="text-blue-600" />
            </div>
            <div className="text-xl font-bold text-gray-800">{stats.savedSchemes}</div>
            <div className="text-xs text-gray-500">Schemes Found</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Calendar size={14} className="text-orange-600" />
            </div>
            <div className="text-xl font-bold text-gray-800">{stats.daysActive}</div>
            <div className="text-xs text-gray-500">Days Active</div>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp size={14} className="text-purple-600" />
            </div>
            <div className="text-xl font-bold text-gray-800">{stats.questionsAsked}</div>
            <div className="text-xs text-gray-500">Questions</div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={18} className="text-green-600" />
              <h2 className="font-semibold text-gray-800">Personal Information</h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1 text-green-600 text-sm font-medium hover:text-green-700 transition-colors"
            >
              <Edit2 size={14} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          <div className="p-6">
            {!isEditing ? (
              // View Mode
              <div className="space-y-4">
                {formData.name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <User size={18} className="text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="text-sm font-medium text-gray-800">{formData.name}</p>
                    </div>
                  </div>
                )}
                {formData.email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Mail size={18} className="text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="text-sm font-medium text-gray-800">{formData.email}</p>
                    </div>
                  </div>
                )}
                {formData.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Phone size={18} className="text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="text-sm font-medium text-gray-800">{formData.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin size={18} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-800">{formData.location || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Briefcase size={18} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Occupation</p>
                    <p className="text-sm font-medium text-gray-800">{getOccupationLabel(formData.occupation)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <DollarSign size={18} className={getIncomeColor(formData.income_level)} />
                  <div>
                    <p className="text-xs text-gray-500">Income Level</p>
                    <p className={`text-sm font-medium ${getIncomeColor(formData.income_level)}`}>
                      {getIncomeLabel(formData.income_level)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Globe size={18} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Preferred Language</p>
                    <p className="text-sm font-medium text-gray-800">{formData.language}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (District, State)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Sitapur, Uttar Pradesh"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">For personalized scheme recommendations</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <select
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    {occupations.map(occ => (
                      <option key={occ.value} value={occ.value}>
                        {occ.icon} {occ.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Income Level</label>
                  <select
                    value={formData.income_level}
                    onChange={(e) => setFormData({ ...formData, income_level: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    {incomeLevels.map(inc => (
                      <option key={inc.value} value={inc.value}>
                        {inc.icon} {inc.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-green-600" />
              <h2 className="font-semibold text-gray-800">Preferences</h2>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Voice Responses</p>
                  <p className="text-xs text-gray-500">Get spoken responses</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.voice_preferred}
                  onChange={(e) => setFormData({ ...formData, voice_preferred: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Notifications</p>
                  <p className="text-xs text-gray-500">Scheme alerts and updates</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notifications_enabled}
                  onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {formData.dark_mode ? <Moon size={18} className="text-green-600" /> : <Sun size={18} className="text-green-600" />}
                <div>
                  <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                  <p className="text-xs text-gray-500">Switch theme</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.dark_mode}
                  onChange={(e) => setFormData({ ...formData, dark_mode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-green-600" />
              <h2 className="font-semibold text-gray-800">Account Settings</h2>
            </div>
          </div>
          <div className="p-6 space-y-2">
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">Change Password</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">Download My Data</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <Languages size={18} className="text-gray-500" />
                <span className="text-sm text-gray-700">Language Preferences</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-2xl border border-red-200 mb-6 overflow-hidden">
          <div className="border-b border-red-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-600" />
              <h2 className="font-semibold text-red-800">Danger Zone</h2>
            </div>
          </div>
          <div className="p-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
            <p className="text-xs text-red-600 text-center mt-3">
              Logging out will clear your session
            </p>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center pb-6">
          <p className="text-xs text-gray-400">
            Sahaayak AI v1.0.0
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Made with ❤️ for Rural India
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <button className="text-xs text-green-600 hover:text-green-700">Privacy Policy</button>
            <span className="text-xs text-gray-300">•</span>
            <button className="text-xs text-green-600 hover:text-green-700">Terms of Service</button>
            <span className="text-xs text-gray-300">•</span>
            <button className="text-xs text-green-600 hover:text-green-700">Help Center</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;