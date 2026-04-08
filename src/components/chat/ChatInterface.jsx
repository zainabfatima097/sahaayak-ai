import React, { useState, useRef, useEffect } from 'react';
import VoiceButton from '../common/VoiceButton';
import { geminiClient } from '../../components/services/ai/geminiClient';
import { useUserContext } from '../../context/UserContext';
import { 
  saveChatMessageToFirebase, 
  getChatMessages, 
  createChatSession,
  updateUserStats 
} from '../../components/services/firebase/config';
import { saveChatMessage as saveLocalMessage, getChatHistory, cacheResponse, getCachedResponse } from '../../components/services/offline/indexedDB';
import { Send, Copy, Volume2, ThumbsUp, ThumbsDown, Sparkles, Bot, User, Loader2 } from 'lucide-react';

const ChatInterface = ({ domain = 'general', sessionId: propSessionId, onSessionChange }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(propSessionId);
  const [showVoiceHint, setShowVoiceHint] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { userContext, updateUserContext } = useUserContext();

  useEffect(() => {
    if (currentSessionId) {
      loadSessionMessages();
    }
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const timer = setTimeout(() => setShowVoiceHint(false), 5000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [domain, currentSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const loadSessionMessages = async () => {
    if (!currentSessionId) return;
    const result = await getChatMessages(currentSessionId);
    if (result.success && result.messages.length > 0) {
      setMessages(result.messages);
    }
  };

  const createNewSession = async () => {
    const result = await createChatSession(userContext.uid, domain, `New ${domain} chat`);
    if (result.success) {
      setCurrentSessionId(result.sessionId);
      setMessages([]);
      onSessionChange?.(result.sessionId);
    }
    return result.sessionId;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    // Create session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createNewSession();
    }
    
    const userMessage = {
      type: 'user',
      text: text,
      domain: domain,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    
    // Save to Firebase
    if (!isOffline && userContext.isAuthenticated) {
      await saveChatMessageToFirebase(sessionId, userContext.uid, userMessage, domain);
    }
    
    if (isOffline) {
      const offlineResponse = {
        type: 'ai',
        text: "आप ऑफलाइन हैं। कृपया इंटरनेट कनेक्ट करें।\n⚠️ You are offline. Please connect to internet.",
        domain: domain,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, offlineResponse]);
      setIsLoading(false);
      setIsTyping(false);
      return;
    }
    
    try {
      const response = await geminiClient.generateResponse(text, userContext, domain);
      
      const aiMessage = {
        type: 'ai',
        text: response.text,
        actionable: response.actionable,
        domain: domain,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to Firebase
      await saveChatMessageToFirebase(sessionId, userContext.uid, aiMessage, domain);
      
      // Update user stats
      await updateUserStats(userContext.uid, { field: 'totalQueries', increment: 1 });
      
      if (userContext.voice_preferred && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.text.substring(0, 200));
        utterance.lang = userContext.language === 'Hindi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage = {
        type: 'ai',
        text: "क्षमा करें, सेवा में तकनीकी समस्या है। कृपया पुनः प्रयास करें।\nSorry, technical issue. Please try again.",
        domain: domain,
        timestamp: new Date(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsTyping(false), 500);
    }
  };

  const handleVoiceResult = (text) => {
    setInputText(text);
    handleSendMessage(text);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full text-sm shadow-lg animate-slide-up z-50';
    notification.textContent = '✓ Copied to clipboard!';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = userContext.language === 'Hindi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Rest of your existing JSX remains the same...
  // (keeping the same UI as before)

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white">
      {/* Your existing JSX here - same as before */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {/* Same message area */}
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative group">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputText)}
                placeholder="Ask Sahaayak anything... (Shift + Enter for new line)"
                rows="1"
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-200 resize-none transition-all duration-300"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover:scale-110 transition-transform" />}
              </button>
            </div>
            <VoiceButton
              onResult={handleVoiceResult}
              onError={(error) => console.error(error)}
              language={userContext.language === 'Hindi' ? 'hi-IN' : 'en-IN'}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-xs text-gray-400">🔒 Your conversations are private and secure</p>
            </div>
            <p className="text-xs text-gray-400">🎤 Click mic to speak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;