import React, { useState, useRef, useEffect } from 'react';
import VoiceButton from '../common/VoiceButton';
import { geminiClient } from '../services/ai/geminiClient';
import { useUserContext } from '../../context/UserContext';
import { saveChatMessage, getChatHistory, cacheResponse, getCachedResponse } from '../services/offline/indexedDB';
import { Send, Copy, Volume2, ThumbsUp, ThumbsDown } from 'lucide-react';

const ChatInterface = ({ domain = 'general' }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const messagesEndRef = useRef(null);
  const { userContext } = useUserContext();

  useEffect(() => {
    loadChatHistory();
    
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [domain]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    const history = await getChatHistory();
    const domainHistory = history.filter(msg => msg.domain === domain);
    setMessages(domainHistory);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateQueryHash = (query) => {
    return btoa(unescape(encodeURIComponent(query + domain))).substring(0, 50);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    const userMessage = {
      type: 'user',
      text: text,
      domain: domain,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    await saveChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);
    
    if (isOffline) {
      const offlineResponse = {
        type: 'ai',
        text: "⚠️ आप ऑफलाइन हैं। कृपया इंटरनेट कनेक्ट करें।\n⚠️ You are offline. Please connect to internet.",
        domain: domain,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, offlineResponse]);
      setIsLoading(false);
      return;
    }
    
    const queryHash = generateQueryHash(text);
    const cached = await getCachedResponse(queryHash);
    
    if (cached) {
      setMessages(prev => [...prev, cached]);
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await geminiClient.generateResponse(text, userContext, domain);
      
      const aiMessage = {
        type: 'ai',
        text: response.text,
        actionable: response.actionable,
        domain: domain,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      await saveChatMessage(aiMessage);
      await cacheResponse(queryHash, aiMessage);
      
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
        timestamp: Date.now(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceResult = (text) => {
    setInputText(text);
    handleSendMessage(text);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = userContext.language === 'Hindi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fixed: Added 'schemes' to the suggested questions object
  const suggestedQuestions = {
    agriculture: [
      "🌾 धान की खेती कैसे करें?",
      "💊 उर्वरक की जानकारी",
      "☀️ मौसम पूर्वानुमान",
      "💰 MSP दर क्या है?"
    ],
    healthcare: [
      "🤒 बुखार का घरेलू इलाज",
      "🏥 नजदीकी अस्पताल",
      "💊 आयुष्मान कार्ड",
      "📞 108 हेल्पलाइन"
    ],
    education: [
      "📚 स्कूल दाखिला",
      "🎓 छात्रवृत्ति योजना",
      "💻 डिजिटल शिक्षा",
      "📖 मुफ्त कोर्स"
    ],
    schemes: [
      "🌾 PM-KISAN योजना",
      "🍽️ राशन कार्ड",
      "🏠 आवास योजना",
      "💊 आयुष्मान भारत"
    ],
    general: [
      "सरकारी योजनाएं",
      "कृषि सलाह",
      "स्वास्थ्य सुझाव",
      "शिक्षा जानकारी"
    ]
  };

  // Get questions for current domain, fallback to general if domain not found
  const currentQuestions = suggestedQuestions[domain] || suggestedQuestions.general;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area - DeepSeek Style */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-500">
                Ask me anything about {domain === 'schemes' ? 'Government Schemes' : domain}
              </p>
              
              {/* Suggested Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
                {currentQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(question)}
                    className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
                  >
                    <span className="text-gray-700">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${msg.type === 'user' ? 'order-2' : 'order-1'}`}>
                {msg.type === 'user' ? (
                  <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-2">
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200">
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs">🤖</span>
                        </div>
                        <span className="text-xs font-medium text-gray-500">Sahaayak AI</span>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap text-sm">
                        {msg.text}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => copyToClipboard(msg.text)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Copy"
                        >
                          <Copy size={14} className="text-gray-400" />
                        </button>
                        <button
                          onClick={() => speakMessage(msg.text)}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Listen"
                        >
                          <Volume2 size={14} className="text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Helpful">
                          <ThumbsUp size={14} className="text-gray-400" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded" title="Not helpful">
                          <ThumbsDown size={14} className="text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-200 px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input Area - DeepSeek Style */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputText)}
                placeholder="Ask Sahaayak anything..."
                rows="1"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-green-500 resize-none"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isLoading}
                className="absolute right-2 bottom-2 p-2 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
            <VoiceButton
              onResult={handleVoiceResult}
              onError={(error) => console.error(error)}
              language={userContext.language === 'Hindi' ? 'hi-IN' : 'en-IN'}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            Sahaayak AI may make mistakes. Check important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;