import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Sprout, Heart, GraduationCap, Landmark,
  History, Settings, LogOut, Mic, Plus, MessageCircle,
  Sparkles, ChevronRight, User, Sun, Moon, Info
} from 'lucide-react';
import ChatInterface from '../chat/ChatInterface';
import { useUserContext } from '../../context/UserContext';

const ChatLayout = ({ children, domain = 'general' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { userContext, updateUserContext } = useUserContext();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { id: 'agriculture', name: 'Agriculture', icon: Sprout, path: '/agriculture', color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-50', textColor: 'text-green-600', description: 'Farming tips & weather' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, path: '/healthcare', color: 'from-red-500 to-rose-500', bgColor: 'bg-red-50', textColor: 'text-red-600', description: 'Health guidance' },
    { id: 'education', name: 'Education', icon: GraduationCap, path: '/education', color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-50', textColor: 'text-blue-600', description: 'Learning resources' },
    { id: 'schemes', name: 'Govt Schemes', icon: Landmark, path: '/schemes', color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', description: 'Welfare programs' }
  ];

  const handleLogout = () => {
    updateUserContext({ isAuthenticated: false });
    navigate('/');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark');
  };

  const showMoreInfo = () => {
    const infoMessages = {
      agriculture: "🌾 Agriculture Support:\n\n• Weather forecasts\n• Crop advisory\n• MSP rates\n• Fertilizer information\n• Pest control tips\n• Government schemes for farmers",
      healthcare: "🏥 Healthcare Services:\n\n• Health guidance\n• Nearby hospitals\n• Telemedicine\n• Ayushman Bharat scheme\n• Vaccination info\n• First aid tips",
      education: "📚 Education Resources:\n\n• School information\n• Scholarship details\n• Digital learning\n• Skill development\n• Free courses\n• Career guidance",
      schemes: "📋 Government Schemes:\n\n• PM-KISAN\n• Ayushman Bharat\n• Ration Card\n• Housing schemes\n• Education scholarships\n• Pension schemes",
      general: "🤝 About Sahaayak AI:\n\n• Voice-first assistant\n• Supports Hindi & English\n• Works offline\n• Free to use\n• 24/7 available\n• Privacy focused"
    };
    alert(infoMessages[domain] || infoMessages.general);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-white relative">
      {/* Desktop Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-80' : 'w-20'
        } bg-white/80 backdrop-blur-xl border-r border-gray-200 transition-all duration-500 ease-in-out hidden md:flex flex-col shadow-xl z-20`}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between group">
          {isSidebarOpen && (
            <div className="flex items-center gap-3 animate-slide-right">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2.5 shadow-lg">
                  <Mic size={22} className="text-white" />
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-800 text-lg">Sahaayak AI</span>
                <p className="text-xs text-gray-500">v1.0.0</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            {isSidebarOpen && <span className="font-medium">New Chat</span>}
          </button>
        </div>
        // Add to your existing ChatLayout sidebar, after the New Chat button and before domain navigation

{/* Chat History Dropdown Section */}
<div className="px-3 py-2 border-t border-gray-100">
  <ChatHistory 
    domain={domain}
    onSelectSession={(sessionId) => {
      // Load selected session
      setCurrentSessionId(sessionId);
      navigate(`/${domain}?session=${sessionId}`);
    }}
    currentSessionId={currentSessionId}
    onNewChat={() => {
      setCurrentSessionId(null);
      navigate(`/${domain}`);
    }}
  />
</div>

        {/* Domain Navigation */}
        <div className="flex-1 px-3 space-y-2 overflow-y-auto">
          {menuItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full group relative transition-all duration-300 ${
                location.pathname === item.path ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                location.pathname === item.path ? `${item.bgColor} shadow-md` : 'hover:bg-gray-50'
              }`}>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} bg-opacity-10 transition-all duration-300 group-hover:scale-110`}>
                  <item.icon size={20} className={item.textColor} />
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${location.pathname === item.path ? item.textColor : 'text-gray-700'}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                )}
                {location.pathname === item.path && isSidebarOpen && (
                  <ChevronRight size={16} className={`${item.textColor} animate-pulse`} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Menu */}
        <div className="border-t border-gray-100 p-3 space-y-2">
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
          >
            <User size={18} className="text-gray-500 group-hover:text-green-600 transition-colors" />
            {isSidebarOpen && <span className="text-sm text-gray-700 group-hover:text-green-600 transition-colors">Profile</span>}
          </button>
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
          >
            {isDarkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-500" />}
            {isSidebarOpen && <span className="text-sm text-gray-700">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-all duration-300 group"
          >
            <LogOut size={18} className="text-red-500 group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="text-sm text-red-600">Logout</span>}
          </button>
        </div>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-100 animate-slide-up">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gradient-to-r from-gray-50 to-white">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">👤</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {userContext.name || 'Guest User'}
                </p>
                <p className="text-xs text-gray-500">{userContext.language} • {userContext.occupation || 'Rural'}</p>
              </div>
              <Sparkles size={14} className="text-green-500 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-72 h-full bg-white shadow-xl animate-slide-left" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2.5">
                  <Mic size={22} className="text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-lg">Sahaayak AI</span>
                  <p className="text-xs text-gray-500">v1.0.0</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl flex items-center justify-center gap-2">
                <Plus size={18} /> New Chat
              </button>
            </div>
            <div className="px-3 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl ${
                    location.pathname === item.path ? item.bgColor : 'hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} className={item.textColor} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </button>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50">
                <LogOut size={18} className="text-red-500" />
                <span className="text-sm text-red-600">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
        {/* Chat Header with More Info Button at Top Right */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="animate-slide-right">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {domain === 'agriculture' && 'Agriculture Assistant'}
                {domain === 'healthcare' && 'Healthcare Assistant'}
                {domain === 'education' && 'Education Assistant'}
                {domain === 'schemes' && 'Government Schemes Assistant'}
                {domain === 'general' && 'Sahaayak AI Assistant'}
              </h1>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <span>Ask me anything - I speak {userContext.language}</span>
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-green-600">Online</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* More Info Button - Now at Top Right */}
              <button
                onClick={showMoreInfo}
                className="group px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Info size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="font-medium hidden sm:inline">More Info</span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-300 hover:scale-110 group">
                <MessageCircle size={20} className="text-gray-500 group-hover:text-green-600 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {children || <ChatInterface domain={domain} />}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;