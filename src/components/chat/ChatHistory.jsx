import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Trash2, Edit2, Check, X, Clock, 
  Calendar, ChevronRight, FolderOpen, Plus
} from 'lucide-react';
import { getUserChatSessions, deleteChatSession, renameChatSession } from '../../services/firebase/config';
import { useUserContext } from '../../context/UserContext';

const ChatHistory = ({ domain, onSelectSession, currentSessionId, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { userContext } = useUserContext();

  useEffect(() => {
    loadChatSessions();
  }, [domain, userContext.uid]);

  const loadChatSessions = async () => {
    setIsLoading(true);
    const result = await getUserChatSessions(userContext.uid, domain);
    if (result.success) {
      setSessions(result.sessions);
    }
    setIsLoading(false);
  };

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat session?')) {
      const result = await deleteChatSession(sessionId);
      if (result.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId && onNewChat) {
          onNewChat();
        }
      }
    }
  };

  const handleRename = async (sessionId, e) => {
    e.stopPropagation();
    if (editingId === sessionId) {
      if (editingTitle.trim()) {
        const result = await renameChatSession(sessionId, editingTitle);
        if (result.success) {
          setSessions(sessions.map(s => 
            s.id === sessionId ? { ...s, title: editingTitle } : s
          ));
        }
      }
      setEditingId(null);
      setEditingTitle('');
    } else {
      const session = sessions.find(s => s.id === sessionId);
      setEditingId(sessionId);
      setEditingTitle(session.title);
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-3 py-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Chats
          </h3>
          <button 
            onClick={onNewChat}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="New Chat"
          >
            <Plus size={14} className="text-gray-500" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No chat history</p>
            <p className="text-xs text-gray-400 mt-1">Start a new conversation</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentSessionId === session.id
                    ? 'bg-green-50 border border-green-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageCircle size={14} className={`mt-0.5 flex-shrink-0 ${
                    currentSessionId === session.id ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    {editingId === session.id ? (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="flex-1 text-xs border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-green-500"
                          autoFocus
                        />
                        <button onClick={(e) => handleRename(session.id, e)} className="p-0.5 hover:bg-green-100 rounded">
                          <Check size={12} className="text-green-600" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-0.5 hover:bg-red-100 rounded">
                          <X size={12} className="text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className={`text-sm font-medium truncate ${
                          currentSessionId === session.id ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {session.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Clock size={10} className="text-gray-400" />
                            <span className="text-xs text-gray-400">{formatDate(session.updatedAt)}</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-400">{session.messageCount} messages</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleRename(session.id, e)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Rename"
                    >
                      <Edit2 size={12} className="text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;