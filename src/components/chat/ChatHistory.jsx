import { useState, useEffect } from 'react';
import { 
  MessageCircle, Trash2, Edit2, Check, X, Clock, 
  Plus, FolderOpen
} from 'lucide-react';
import { db, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from '../../components/services/firebase/config';
import { useUserContext } from '../../context/UserContext';

const ChatHistory = ({ domain, onSelectSession, currentSessionId, onNewChat }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { userContext } = useUserContext();

  const domainConfig = {
    agriculture: { color: '#15803d', lightBg: '#dcfce7' },
    healthcare:  { color: '#dc2626', lightBg: '#fee2e2' },
    education:   { color: '#1d4ed8', lightBg: '#dbeafe' },
    schemes:     { color: '#b45309', lightBg: '#fef3c7' },
    general:     { color: '#6d28d9', lightBg: '#ede9fe' },
  };
  const config = domainConfig[domain] || domainConfig.general;

  useEffect(() => {
    if (userContext.isAuthenticated && userContext.uid) {
      loadChatSessions();
    }
  }, [domain, userContext.uid]);

  const loadChatSessions = async () => {
    setIsLoading(true);
    try {
      const sessionsRef = collection(db, 'chat_sessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userContext.uid),
        where('domain', '==', domain)
      );
      
      const querySnapshot = await getDocs(q);
      const loadedSessions = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedSessions.push({ 
          id: doc.id, 
          ...data,
          updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || new Date(),
          createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date()
        });
      });
      
      loadedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      setSessions(loadedSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
      try {
        // Delete all messages in the session
        const messagesQuery = query(collection(db, 'chat_messages'), where('sessionId', '==', sessionId));
        const messagesSnapshot = await getDocs(messagesQuery);
        const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Delete the session
        await deleteDoc(doc(db, 'chat_sessions', sessionId));
        
        // Remove from state
        setSessions(sessions.filter(s => s.id !== sessionId));
        
        // If the deleted session was currently active, create a new chat
        if (currentSessionId === sessionId && onNewChat) {
          onNewChat();
        }
        
        alert('Chat deleted successfully!');
      } catch (error) {
        console.error('Error deleting session:', error);
        alert('Failed to delete session. Please try again.');
      }
    }
  };

  // FIXED: Rename function
  const startRename = (sessionId, currentTitle) => {
    setEditingId(sessionId);
    setEditingTitle(currentTitle);
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveRename = async (sessionId) => {
    if (!editingTitle.trim()) {
      cancelRename();
      return;
    }
    
    try {
      const sessionRef = doc(db, 'chat_sessions', sessionId);
      await updateDoc(sessionRef, { 
        title: editingTitle.trim(), 
        updatedAt: new Date() 
      });
      
      // Update local state
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, title: editingTitle.trim() } : s
      ));
      
      alert('Chat renamed successfully!');
      cancelRename();
    } catch (error) {
      console.error('Error renaming session:', error);
      alert('Failed to rename session. Please try again.');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (days === 0) {
      if (hours === 0) return 'Just now';
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ marginTop: 4 }}>
      {/* New Chat button */}
      <button
        onClick={onNewChat}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 8,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: config.color,
          fontSize: 12,
          fontWeight: 500,
          transition: 'background 0.2s',
          marginBottom: 8
        }}
        onMouseEnter={e => e.currentTarget.style.background = config.lightBg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Plus size={12} />
        <span>New {domain} chat</span>
      </button>

      {isLoading ? (
        <div style={{ padding: '8px 12px' }}>
          <div style={{ height: 32, background: '#f3f4f6', borderRadius: 8 }} />
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ padding: '16px 12px', textAlign: 'center' }}>
          <FolderOpen size={20} color="#9ca3af" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: 11, color: '#9ca3af' }}>No chats yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: currentSessionId === session.id ? config.lightBg : 'transparent',
                border: currentSessionId === session.id ? `1px solid ${config.color}` : '1px solid transparent',
              }}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageCircle size={12} color={currentSessionId === session.id ? config.color : '#9ca3af'} />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === session.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      style={{ 
                        flex: 1, 
                        fontSize: 12, 
                        border: `1px solid ${config.color}`, 
                        borderRadius: 4, 
                        padding: '4px 6px', 
                        outline: 'none',
                        backgroundColor: '#fff'
                      }}
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          saveRename(session.id);
                        }
                      }}
                    />
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        saveRename(session.id); 
                      }} 
                      style={{ 
                        padding: 4, 
                        background: '#22c55e', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: '#fff',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Save"
                    >
                      <Check size={12} />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        cancelRename(); 
                      }} 
                      style={{ 
                        padding: 4, 
                        background: '#ef4444', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: '#fff',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ 
                      fontSize: 12, 
                      fontWeight: currentSessionId === session.id ? 500 : 400, 
                      color: currentSessionId === session.id ? config.color : '#374151', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {session.title || `Chat ${new Date(session.createdAt).toLocaleDateString()}`}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={8} color="#9ca3af" />
                      <span style={{ fontSize: 9, color: '#9ca3af' }}>{formatDate(session.updatedAt)}</span>
                      {session.messageCount > 0 && (
                        <>
                          <span style={{ fontSize: 9, color: '#d1d5db' }}>•</span>
                          <span style={{ fontSize: 9, color: '#9ca3af' }}>{session.messageCount} msgs</span>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Action Buttons */}
              {editingId !== session.id && (
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(session.id, session.title);
                    }} 
                    style={{ 
                      padding: 4, 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#6b7280',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Rename"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(session.id);
                    }} 
                    style={{ 
                      padding: 4, 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer', 
                      color: '#ef4444',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;