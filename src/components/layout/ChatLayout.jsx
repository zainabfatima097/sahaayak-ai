import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Sprout, Heart, GraduationCap, Landmark,
  History, Settings, LogOut, Mic, Plus
} from 'lucide-react';
import ChatInterface from '../chat/ChatInterface';
import { useUserContext } from '../../context/UserContext';

const ChatLayout = ({ children, domain = 'general' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { userContext, updateUserContext } = useUserContext();

  const menuItems = [
    { id: 'agriculture', name: 'Agriculture', icon: Sprout, path: '/agriculture', color: 'text-green-600' },
    { id: 'healthcare', name: 'Healthcare', icon: Heart, path: '/healthcare', color: 'text-red-600' },
    { id: 'education', name: 'Education', icon: GraduationCap, path: '/education', color: 'text-blue-600' },
    { id: 'schemes', name: 'Govt Schemes', icon: Landmark, path: '/schemes', color: 'text-yellow-600' }
  ];

  const handleLogout = () => {
    updateUserContext({ isAuthenticated: false });
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <Mic size={24} className="text-green-600" />
              <span className="font-bold text-gray-800">Sahaayak AI</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => navigate('/chat')}
            className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            {isSidebarOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* Domain Navigation */}
        <div className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-green-50 text-green-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon size={20} className={location.pathname === item.path ? item.color : ''} />
              {isSidebarOpen && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </div>

        {/* Bottom Menu */}
        <div className="border-t border-gray-200 p-3 space-y-1">
          <button
            onClick={() => navigate('/history')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <History size={18} />
            {isSidebarOpen && <span className="text-sm">History</span>}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
          >
            <Settings size={18} />
            {isSidebarOpen && <span className="text-sm">Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>

        {/* User Info */}
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">👤</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {userContext.name || 'Guest User'}
                </p>
                <p className="text-xs text-gray-500">{userContext.language}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {domain === 'agriculture' && '🌾 Agriculture Assistant'}
                {domain === 'healthcare' && '🏥 Healthcare Assistant'}
                {domain === 'education' && '📚 Education Assistant'}
                {domain === 'schemes' && '📋 Government Schemes Assistant'}
                {domain === 'general' && '💬 Sahaayak AI Assistant'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Ask me anything - I speak {userContext.language}
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Mic size={20} className="text-green-600" />
            </button>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          {children || <ChatInterface domain={domain} />}
        </div>

        {/* More Info Button - Floating */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => alert(`More information about ${domain} will be added soon!`)}
            className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span>ℹ️</span>
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;