import { useState, useEffect } from 'react';
import { 
  MessageCircle, Trash2, Edit2, Check, X, Clock, 
  Plus, FolderOpen
} from 'lucide-react';
import { db, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from '../../components/services/firebase/config';
import { useUserContext } from '../../context/UserContext';

// This component now ONLY renders the list of chats, no header
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

  const handleDelete = async (sessionId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this chat session?')) {
      try {
        const messagesQuery = query(collection(db, 'chat_messages'), where('sessionId', '==', sessionId));
        const messagesSnapshot = await getDocs(messagesQuery);
        const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, 'chat_sessions', sessionId));
        setSessions(sessions.filter(s => s.id !== sessionId));
        if (currentSessionId === sessionId && onNewChat) {
          onNewChat();
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const handleRename = async (sessionId, e) => {
    e.stopPropagation();
    if (editingId === sessionId) {
      if (editingTitle.trim()) {
        try {
          const sessionRef = doc(db, 'chat_sessions', sessionId);
          await updateDoc(sessionRef, { title: editingTitle, updatedAt: new Date() });
          setSessions(sessions.map(s => s.id === sessionId ? { ...s, title: editingTitle } : s));
        } catch (error) {
          console.error('Error renaming session:', error);
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
      {/* New Chat button inside dropdown */}
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
          marginBottom: 4
        }}
        onMouseEnter={e => e.currentTarget.style.background = config.lightBg}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Plus size={12} />
        <span>New {domain} chat</span>
      </button>

      {isLoading ? (
        <div style={{ padding: '8px 12px' }}>
          <div style={{ height: 32, background: '#f3f4f6', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ padding: '16px 12px', textAlign: 'center' }}>
          <FolderOpen size={20} color="#9ca3af" style={{ margin: '0 auto 4px' }} />
          <p style={{ fontSize: 11, color: '#9ca3af' }}>No chats yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: currentSessionId === session.id ? config.lightBg : 'transparent',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => { if (currentSessionId !== session.id) e.currentTarget.style.background = '#f9fafb'; }}
              onMouseLeave={e => { if (currentSessionId !== session.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <MessageCircle size={12} color={currentSessionId === session.id ? config.color : '#9ca3af'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === session.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      style={{ flex: 1, fontSize: 12, border: `1px solid ${config.color}`, borderRadius: 4, padding: '2px 6px', outline: 'none' }}
                      autoFocus
                    />
                    <button onClick={(e) => handleRename(session.id, e)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}><Check size={10} /></button>
                    <button onClick={() => setEditingId(null)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={10} /></button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: 12, fontWeight: currentSessionId === session.id ? 500 : 400, color: currentSessionId === session.id ? config.color : '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
              <div style={{ display: 'flex', gap: 2, opacity: 0, transition: 'opacity 0.2s' }} className="chat-actions">
                <button onClick={(e) => handleRename(session.id, e)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={10} /></button>
                <button onClick={(e) => handleDelete(session.id, e)} style={{ padding: 2, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><Trash2 size={10} /></button>
              </div>
              <style>{`
                .chat-actions { opacity: 0; transition: opacity 0.2s; }
                div:hover .chat-actions { opacity: 1; }
              `}</style>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;