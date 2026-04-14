import { useState, useRef, useEffect } from 'react';
import VoiceButton from '../common/VoiceButton';
import { geminiClient } from '../../components/services/ai/geminiClient';
import { useUserContext } from '../../context/UserContext';
import {
  db, collection, query, where, getDocs, addDoc, updateDoc, doc, orderBy, increment
} from '../../components/services/firebase/config';
import { Send, Copy, Volume2, ThumbsUp, ThumbsDown, Bot, User, Loader2, Globe, Sparkles, Paperclip, File, X } from 'lucide-react';

/* ── Injected styles (scoped to chat) ──────────────────────────────── */
const ChatStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    .ci-wrap { --green: #16a34a; --emerald: #10b981; --green-light: #dcfce7; --green-pale: #f0fdf4; font-family: 'Noto Sans', 'Noto Sans Devanagari', sans-serif; }
    .ci-wrap * { box-sizing: border-box; }

    .ci-dot { width:8px;height:8px;border-radius:50%;background:#86efac;display:inline-block;animation:ci-bounce 1.3s ease-in-out infinite; }
    .ci-dot:nth-child(2){animation-delay:0.16s;}
    .ci-dot:nth-child(3){animation-delay:0.32s;}

    @keyframes ci-bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
    @keyframes ci-msg-in { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    .ci-msg { animation: ci-msg-in 0.35s cubic-bezier(0.34,1.2,0.64,1) both; }
    @keyframes ci-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.85)} }
    .ci-pulse { animation: ci-pulse 2s ease-in-out infinite; }
    .ci-pill { transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease; }
    .ci-pill:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(22,163,74,0.18); background: #bbf7d0 !important; }
    .ci-send { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .ci-send:hover:not(:disabled) { transform: scale(1.12); box-shadow: 0 4px 16px rgba(16,185,129,0.45); }
    .ci-send:disabled { opacity:0.45; cursor:not-allowed; }
    .ci-textarea:focus { outline: none; border-color: #22c55e !important; box-shadow: 0 0 0 3px rgba(34,197,94,0.18); }
    .ci-action { transition: background 0.18s, color 0.18s, transform 0.18s; border-radius: 8px; }
    .ci-action:hover { background: #dcfce7; color: #15803d; transform: scale(1.1); }
    .ci-feedback-active { background: #dcfce7 !important; color: #15803d !important; }
    @keyframes ci-dropdown { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    .ci-dropdown { animation: ci-dropdown 0.2s ease both; }
    @keyframes ci-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .ci-float { animation: ci-float 3.5s ease-in-out infinite; }
    .ci-scroll::-webkit-scrollbar { width:5px; }
    .ci-scroll::-webkit-scrollbar-track { background:transparent; }
    .ci-scroll::-webkit-scrollbar-thumb { background:#bbf7d0; border-radius:8px; }
    .file-input-hidden { display: none; }
    .file-preview { background: var(--bg-secondary); border-radius: 12px; padding: 8px 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); animation: slideIn 0.2s ease; }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .file-preview-remove { cursor: pointer; padding: 4px; border-radius: 50%; transition: background 0.2s; }
    .file-preview-remove:hover { background: #fee2e2; }
    .attach-btn { transition: all 0.2s ease; }
    .attach-btn:hover { transform: scale(1.05); background: var(--bg-secondary) !important; }
    @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  `}</style>
);

const ChatInterface = ({ domain = 'general', sessionId: propSessionId, onSessionChange }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isTyping, setIsTyping] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(propSessionId);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [liked, setLiked] = useState({});
  const [disliked, setDisliked] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { userContext, updateUserContext } = useUserContext();

  const languages = [
    { code: 'hi', name: 'हिन्दी', nativeName: 'हिन्दी' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'te', name: 'తెలుగు', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'मराठी', nativeName: 'मराठी' },
    { code: 'bn', name: 'বাংলা', nativeName: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்', nativeName: 'தமிழ்' },
  ];

  useEffect(() => {
    if (propSessionId) {
      setCurrentSessionId(propSessionId);
      loadSessionMessages(propSessionId);
    } else {
      setCurrentSessionId(null);
      setMessages([]);
    }
  }, [propSessionId]);

  useEffect(() => {
    if (currentSessionId && !propSessionId) loadSessionMessages(currentSessionId);
  }, [currentSessionId]);

  useEffect(() => {
    const on = () => setIsOffline(false);
    const off = () => setIsOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const loadSessionMessages = async (sid) => {
    if (!sid) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'chat_messages'), where('sessionId', '==', sid), orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data(), timestamp: d.data().timestamp?.toDate?.() || new Date() })));
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const createNewSession = async () => {
    try {
      const sessionsRef = collection(db, 'chat_sessions');
      const newSession = {
        userId: userContext.uid,
        domain: domain,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Chat - ${new Date().toLocaleString()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageCount: 0,
        lastMessage: ''
      };
      const docRef = await addDoc(sessionsRef, newSession);
      console.log('✅ New session created:', docRef.id);
      setCurrentSessionId(docRef.id);
      onSessionChange?.(docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const saveMessage = async (sid, msg) => {
    try {
      await addDoc(collection(db, 'chat_messages'), {
        sessionId: sid,
        userId: userContext.uid,
        domain: domain,
        type: msg.type,
        text: msg.text,
        timestamp: new Date(),
        actionable: msg.actionable || null
      });
      const sessionRef = doc(db, 'chat_sessions', sid);
      await updateDoc(sessionRef, {
        updatedAt: new Date(),
        messageCount: increment(1)
      });
      console.log('✅ Message saved to session:', sid);
    } catch (e) { console.error('Error saving message:', e); }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    
    console.log('📤 Sending message:', text);
    
    let sid = currentSessionId;
    if (!sid && userContext.isAuthenticated) {
      console.log('Creating new session for first message...');
      sid = await createNewSession();
      if (!sid) return;
      console.log('✅ Session created and set:', sid);
    }
    
    const userMsg = { 
      id: Date.now(), 
      type: 'user', 
      text: text, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    
    if (sid && userContext.isAuthenticated && !isOffline) {
      saveMessage(sid, userMsg);
    }
    
    if (isOffline) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: "⚠️ आप ऑफलाइन हैं। कृपया इंटरनेट कनेक्ट करें।",
        timestamp: new Date()
      }]);
      setIsLoading(false);
      setIsTyping(false);
      return;
    }
    
    try {
      console.log('🤖 Calling Gemini API for message:', text);
      const resp = await geminiClient.generateResponse(text, userContext, domain);
      console.log('✅ Gemini response received');
      
      const aiMsg = { 
        id: Date.now() + 1, 
        type: 'ai', 
        text: resp.text, 
        actionable: resp.actionable, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, aiMsg]);
      
      if (sid && userContext.isAuthenticated) {
        saveMessage(sid, aiMsg);
      }
      
      if (userContext.voice_preferred && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(resp.text.substring(0, 200));
        utterance.lang = langCode(userContext.language);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('AI response error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        error: true,
        text: "क्षमा करें, सेवा उपलब्ध नहीं है। कृपया पुनः प्रयास करें।",
        timestamp: new Date()
      }]);
    } finally { 
      setIsLoading(false); 
      setTimeout(() => setIsTyping(false), 500); 
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('File too large! Max 5MB'); return; }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type)) { showToast('Only images, PDFs, and text files are supported'); return; }
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else { setFilePreview(null); }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzingFile(true);
    setIsLoading(true);
    setIsTyping(true);
    try {
      let sid = currentSessionId;
      if (!sid && userContext.isAuthenticated) {
        sid = await createNewSession();
        if (!sid) return;
      }
      const queryText = inputText.trim() || "Analyze this file";
      const userMsg = { id: Date.now(), type: 'user', text: `📎 ${selectedFile.name}\n\n${queryText}`, timestamp: new Date() };
      setMessages(p => [...p, userMsg]);
      setInputText('');
      if (sid && userContext.isAuthenticated && !isOffline) await saveMessage(sid, userMsg);
      const response = await geminiClient.analyzeFile(selectedFile, queryText, userContext, domain);
      const aiMsg = { id: Date.now() + 1, type: 'ai', text: response.text, actionable: response.actionable, timestamp: new Date() };
      setMessages(p => [...p, aiMsg]);
      if (sid && userContext.isAuthenticated) await saveMessage(sid, aiMsg);
      clearSelectedFile();
    } catch (error) {
      console.error('File analysis failed:', error);
      showToast('File analysis failed. Please try again.');
    } finally {
      setIsAnalyzingFile(false);
      setIsLoading(false);
      setTimeout(() => setIsTyping(false), 500);
    }
  };

  const langCode = (lang) => ({ Hindi:'hi-IN', Telugu:'te-IN', Marathi:'mr-IN', Bengali:'bn-IN', Tamil:'ta-IN' }[lang] || 'en-IN');
  const handleVoiceResult = (text) => { setInputText(text); handleSendMessage(text); };

  const showToast = (msg) => {
    const el = Object.assign(document.createElement('div'), { textContent: msg });
    Object.assign(el.style, { position:'fixed', bottom:'80px', left:'50%', transform:'translateX(-50%)', background:'#15803d', color:'#fff', padding:'8px 20px', borderRadius:'999px', fontSize:'13px', zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.18)', fontFamily:'Noto Sans, sans-serif', transition:'opacity 0.4s' });
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; setTimeout(()=>el.remove(),400); },1800);
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); showToast('✓ Copied!'); };
  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = langCode(userContext.language);
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };
  const changeLanguage = (code, name) => { updateUserContext({ language: name }); setShowLanguageMenu(false); showToast(`Language → ${name}`); };

  const suggestedQuestions = {
    agriculture: ['धान की खेती कैसे करें?','मौसम पूर्वानुमान','MSP दर क्या है?','उर्वरक की जानकारी'],
    healthcare:  ['बुखार का घरेलू इलाज','नजदीकी अस्पताल','आयुष्मान कार्ड','108 हेल्पलाइन'],
    education:   ['स्कूल दाखिला','छात्रवृत्ति योजना','मुफ्त कोर्स','डिजिटल शिक्षा'],
    schemes:     ['PM-KISAN योजना','राशन कार्ड','आवास योजना','आयुष्मान भारत'],
    general:     ['सरकारी योजनाएं','कृषि सलाह','स्वास्थ्य सुझाव','शिक्षा जानकारी'],
  };
  
  const domainMeta = {
    agriculture: { icon:'🌾', title:'किसान साथी', subtitle:'Farmer Assistant', color:'#15803d', bg:'#dcfce7', img:'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&w=600&h=300&fit=crop' },
    healthcare:  { icon:'🏥', title:'स्वास्थ्य साथी', subtitle:'Health Assistant', color:'#dc2626', bg:'#fee2e2', img:'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&w=600&h=300&fit=crop' },
    education:   { icon:'📚', title:'शिक्षा साथी', subtitle:'Education Assistant', color:'#1d4ed8', bg:'#dbeafe', img:'https://images.pexels.com/photos/8471844/pexels-photo-8471844.jpeg?auto=compress&w=600&h=300&fit=crop' },
    schemes:     { icon:'📋', title:'योजना साथी', subtitle:'Schemes Assistant', color:'#b45309', bg:'#fef3c7', img:'https://images.pexels.com/photos/8942991/pexels-photo-8942991.jpeg?auto=compress&w=600&h=300&fit=crop' },
    general:     { icon:'🤖', title:'सहायक AI', subtitle:'General Assistant', color:'#6d28d9', bg:'#ede9fe', img:'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&w=600&h=300&fit=crop' },
  };
  
  const meta = domainMeta[domain] || domainMeta.general;
  const questions = suggestedQuestions[domain] || suggestedQuestions.general;

  return (
    <div className="ci-wrap" style={{ display:'flex', flexDirection:'column', height:'100%', background:'var(--bg-secondary)', fontFamily:"'Noto Sans','Noto Sans Devanagari',sans-serif" }}>
      <ChatStyles />

      <div className="ci-scroll" style={{ flex:1, overflowY:'auto', padding:'24px 16px 8px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', display:'flex', flexDirection:'column', gap:16 }}>
          {messages.length === 0 && !isLoading && (
            <div style={{ textAlign:'center', padding:'40px 16px 24px' }}>
              <div style={{ borderRadius:20, overflow:'hidden', marginBottom:24, position:'relative', height:160, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
                <img src={meta.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 100%)' }} />
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:6 }}>
                  <div className="ci-float" style={{ fontSize:44 }}>{meta.icon}</div>
                  <div style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:800, fontSize:22, color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>{meta.title}</div>
                  <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{meta.subtitle}</div>
                </div>
              </div>
              <p style={{ color:'var(--text-secondary)', fontSize:15, marginBottom:20 }}>
                मुझसे कुछ भी पूछें · Ask me anything in <strong style={{ color: meta.color }}>{userContext.language || 'Hindi'}</strong> or English
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', maxWidth:560, margin:'0 auto' }}>
                {questions.map((q, i) => (
                  <button
                    key={i}
                    className="ci-pill"
                    onClick={() => handleSendMessage(q)}
                    style={{ padding:'10px 18px', borderRadius:999, background:'var(--bg-primary)', border:`1.5px solid var(--border)`, color:'var(--text-primary)', fontSize:14, cursor:'pointer', fontFamily:"'Baloo 2',sans-serif", fontWeight:600, display:'flex', alignItems:'center', gap:8, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}
                  >
                    <span style={{ fontSize:16 }}>💬</span> {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className="ci-msg" style={{ display:'flex', justifyContent: msg.type==='user' ? 'flex-end' : 'flex-start', gap:10 }}>
              {msg.type === 'user' ? (
                <div style={{ display:'flex', alignItems:'flex-end', gap:8, maxWidth:'80%' }}>
                  <div style={{ background:'linear-gradient(135deg,#16a34a,#10b981)', color:'#fff', borderRadius:'20px 20px 4px 20px', padding:'12px 18px', boxShadow:'0 4px 16px rgba(22,163,74,0.25)', fontSize:15, lineHeight:1.6, whiteSpace:'pre-wrap', fontFamily:"'Noto Sans','Noto Sans Devanagari',sans-serif" }}>{msg.text}</div>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--bg-secondary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><User size={15} color="var(--text-secondary)" /></div>
                </div>
              ) : (
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, maxWidth:'85%' }}>
                  <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(34,197,94,0.3)' }}><Bot size={18} color="#fff" /></div>
                  <div style={{ background:'var(--bg-primary)', borderRadius:'4px 20px 20px 20px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid var(--border)', overflow:'hidden' }}>
                    <div style={{ padding:'10px 16px 8px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:700, fontSize:13, color:'#15803d' }}>Sahaayak AI</span>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} className="ci-pulse" />
                      <span style={{ fontSize:11, color:'var(--text-secondary)', marginLeft:'auto' }}>{msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : 'Now'}</span>
                    </div>
                    <div style={{ padding:'12px 16px', fontSize:15, color: msg.error ? '#dc2626' : 'var(--text-primary)', lineHeight:1.75, whiteSpace:'pre-wrap', fontFamily:"'Noto Sans','Noto Sans Devanagari',sans-serif" }}>{msg.text}</div>
                    <div style={{ padding:'8px 12px', borderTop:'1px solid var(--border)', display:'flex', gap:4, alignItems:'center' }}>
                      {[{ icon: Copy, label:'Copy', action: ()=>copyToClipboard(msg.text) }, { icon: Volume2, label:'Listen', action: ()=>speakMessage(msg.text) }].map(({icon:Icon, label, action}) => (
                        <button key={label} className="ci-action" onClick={action} title={label} style={{ padding:'5px 8px', background:'transparent', border:'none', cursor:'pointer', color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4, fontSize:12 }}>
                          <Icon size={13} /> <span style={{ fontFamily:"'Noto Sans',sans-serif" }}>{label}</span>
                        </button>
                      ))}
                      <div style={{ flex:1 }} />
                      <button className={`ci-action ${liked[msg.id] ? 'ci-feedback-active' : ''}`} onClick={()=>setLiked(p=>({...p,[msg.id]:!p[msg.id]}))} style={{ padding:'5px 8px', background:'transparent', border:'none', cursor:'pointer', color:'var(--text-secondary)', borderRadius:8 }} title="Helpful"><ThumbsUp size={13} /></button>
                      <button className={`ci-action ${disliked[msg.id] ? 'ci-feedback-active' : ''}`} onClick={()=>setDisliked(p=>({...p,[msg.id]:!p[msg.id]}))} style={{ padding:'5px 8px', background:'transparent', border:'none', cursor:'pointer', color:'var(--text-secondary)', borderRadius:8 }} title="Not helpful"><ThumbsDown size={13} /></button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="ci-msg" style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Bot size={18} color="#fff" /></div>
              <div style={{ background:'var(--bg-primary)', borderRadius:'4px 20px 20px 20px', padding:'16px 20px', boxShadow:'0 4px 20px rgba(0,0,0,0.07)', border:'1.5px solid var(--border)', display:'flex', alignItems:'center', gap:5 }}>
                <span className="ci-dot" /><span className="ci-dot" /><span className="ci-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={{ borderTop:'1.5px solid var(--border)', background:'var(--bg-primary)', backdropFilter:'blur(12px)', padding:'14px 16px' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          {isOffline && (<div style={{ background:'#fef3c7', border:'1px solid #fde68a', borderRadius:12, padding:'8px 14px', marginBottom:10, display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#92400e' }}><span>⚠️</span> आप ऑफलाइन हैं · You are offline</div>)}

          {selectedFile && (
            <div className="file-preview">
              {filePreview ? <img src={filePreview} alt="Preview" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} /> : <File size={20} color="#15803d" />}
              <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedFile.name}</p><p style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{(selectedFile.size / 1024).toFixed(1)} KB</p></div>
              <button onClick={clearSelectedFile} className="file-preview-remove" style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} color="var(--text-secondary)" /></button>
              <button onClick={handleFileAnalysis} disabled={isAnalyzingFile} style={{ padding: '6px 12px', background: 'linear-gradient(135deg,#22c55e,#10b981)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, cursor: isAnalyzingFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: isAnalyzingFile ? 0.6 : 1 }}>{isAnalyzingFile ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} Analyze</button>
            </div>
          )}

          <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
            <div style={{ flex:1, position:'relative' }}>
              <textarea
                ref={inputRef}
                className="ci-textarea"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage(inputText))}
                placeholder={`${userContext.language || 'Hindi'} या English में लिखें... (Shift+Enter नई लाइन)`}
                rows={1}
                style={{ width:'100%', border:'1.5px solid var(--border)', borderRadius:16, padding:'13px 52px 13px 16px', fontSize:15, fontFamily:"'Noto Sans','Noto Sans Devanagari',sans-serif", resize:'none', minHeight:50, maxHeight:120, background:'var(--bg-primary)', color:'var(--text-primary)', transition:'border-color 0.2s, box-shadow 0.2s', lineHeight:1.6 }}
              />
              <button
                className="ci-send"
                onClick={() => handleSendMessage(inputText)}
                disabled={!inputText.trim() || isLoading || isAnalyzingFile}
                style={{ position:'absolute', right:8, bottom:8, width:36, height:36, borderRadius:10, background: inputText.trim() ? 'linear-gradient(135deg,#22c55e,#10b981)' : 'var(--border)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow: inputText.trim() ? '0 4px 12px rgba(34,197,94,0.35)' : 'none', transition:'background 0.2s, box-shadow 0.2s' }}
              >
                {isLoading ? <Loader2 size={16} color="#fff" style={{ animation:'spin 1s linear infinite' }} /> : <Send size={16} color={inputText.trim() ? '#fff' : 'var(--text-secondary)'} />}
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt" onChange={handleFileSelect} className="file-input-hidden" style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} className="attach-btn" disabled={isLoading || isAnalyzingFile} style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#15803d', transition: 'all 0.2s', opacity: isLoading || isAnalyzingFile ? 0.5 : 1 }} title="Attach file (Image, PDF, or Text)"><Paperclip size={18} /></button>
            <VoiceButton onResult={handleVoiceResult} onError={e => console.error(e)} language={langCode(userContext.language)} />
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:7 }}><span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} className="ci-pulse" /><span style={{ fontSize:12, color:'var(--text-secondary)' }}>Private & secure · हिन्दी, English, తెలుగు, मराठी, বাংলা, தமிழ்</span></div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Attach files</span>
              <div style={{ position:'relative' }}>
                <button onClick={() => setShowLanguageMenu(v => !v)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'#15803d', fontSize:12, cursor:'pointer', fontFamily:"'Baloo 2',sans-serif", fontWeight:600, transition:'background 0.2s' }}><Globe size={13} /> {userContext.language || 'Hindi'}</button>
                {showLanguageMenu && (
                  <div className="ci-dropdown" style={{ position:'absolute', bottom:'calc(100% + 6px)', right:0, background:'var(--bg-primary)', borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.14)', border:'1.5px solid var(--border)', overflow:'hidden', zIndex:100, minWidth:140 }}>
                    {languages.map(lang => (<button key={lang.code} onClick={() => changeLanguage(lang.code, lang.nativeName)} style={{ width:'100%', padding:'9px 14px', textAlign:'left', border:'none', background: userContext.language===lang.nativeName ? '#f0fdf4' : 'var(--bg-primary)', color: userContext.language===lang.nativeName ? '#15803d' : 'var(--text-primary)', fontSize:14, cursor:'pointer', fontFamily:"'Noto Sans Devanagari','Noto Sans',sans-serif", fontWeight: userContext.language===lang.nativeName ? 600 : 400, transition:'background 0.15s', display:'flex', alignItems:'center', gap:8 }}>{userContext.language===lang.nativeName && <span style={{ color:'#22c55e' }}>✓</span>} {lang.nativeName}</button>))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;