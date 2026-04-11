import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Shield, Smartphone, ChevronRight, Mic } from 'lucide-react';

/* ── Styles ───────────────────────────────────────────────────────── */
const LoginStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    .lp-wrap, .lp-wrap * { box-sizing: border-box; }
    .lp-wrap { font-family:'Noto Sans','Noto Sans Devanagari',sans-serif; }

    /* hero image crossfade */
    .lp-hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0; transition:opacity 1.2s ease; }
    .lp-hero-img.active { opacity:1; }

    /* card entrance */
    @keyframes lp-card-in { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }
    .lp-card-in { animation:lp-card-in 0.55s cubic-bezier(0.34,1.1,0.64,1) both; }

    /* mic float */
    @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .lp-float { animation:lp-float 3s ease-in-out infinite; }

    /* pulse rings */
    @keyframes lp-pulse-ring { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.8);opacity:0} }
    .lp-pulse::before,.lp-pulse::after { content:''; position:absolute; inset:-6px; border-radius:50%; background:rgba(34,197,94,0.3); animation:lp-pulse-ring 2s ease-out infinite; }
    .lp-pulse::after { animation-delay:1s; }

    /* tab indicator slide */
    @keyframes lp-tab-slide { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
    .lp-tab-active { animation:lp-tab-slide 0.25s ease both; }

    /* input styles */
    .lp-input { width:100%; border:1.5px solid #e5e7eb; border-radius:14px; padding:13px 14px 13px 42px; font-size:15px; font-family:'Noto Sans',sans-serif; color:#1f2937; background:#fff; transition:border-color 0.2s, box-shadow 0.2s; outline:none; }
    .lp-input:focus { border-color:#22c55e; box-shadow:0 0 0 3px rgba(34,197,94,0.15); }
    .lp-input::placeholder { color:#9ca3af; }

    /* primary button */
    .lp-btn-primary { width:100%; background:linear-gradient(135deg,#16a34a,#10b981); color:#fff; border:none; border-radius:14px; padding:14px; font-family:'Baloo 2',sans-serif; font-weight:700; font-size:16px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:transform 0.2s, box-shadow 0.2s; }
    .lp-btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(22,163,74,0.4); }
    .lp-btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

    /* google button */
    .lp-btn-google { width:100%; background:#fff; border:1.5px solid #e5e7eb; border-radius:14px; padding:13px 20px; display:flex; align-items:center; justify-content:center; gap:10px; font-family:'Baloo 2',sans-serif; font-weight:600; font-size:15px; color:#374151; cursor:pointer; transition:all 0.2s; }
    .lp-btn-google:hover:not(:disabled) { border-color:#22c55e; box-shadow:0 4px 16px rgba(0,0,0,0.08); transform:translateY(-1px); }

    /* guest link */
    .lp-guest { background:none; border:none; color:#15803d; font-size:14px; cursor:pointer; display:inline-flex; align-items:center; gap:5px; padding:0; font-family:'Baloo 2',sans-serif; font-weight:600; transition:color 0.15s; }
    .lp-guest:hover { color:#166534; }

    /* language pills row */
    .lp-lang-pill { display:inline-flex; align-items:center; padding:4px 12px; borderRadius:999px; fontSize:12px; fontWeight:600; whiteSpace:nowrap; }

    @keyframes lp-spin { to{transform:rotate(360deg)} }
    .lp-spin { animation:lp-spin 1s linear infinite; }

    /* scrollbar */
    .lp-wrap::-webkit-scrollbar { display:none; }
  `}</style>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleGoogleLogin, updateUserContext } = useUserContext();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [name, setName] = useState('');
  const [imgIdx, setImgIdx] = useState(0);

  /* hero images — rural India */
  const heroImages = [
    'https://images.pexels.com/photos/2132180/pexels-photo-2132180.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop',
    'https://images.pexels.com/photos/3601421/pexels-photo-3601421.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop',
    'https://images.pexels.com/photos/8471844/pexels-photo-8471844.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop',
    'https://images.pexels.com/photos/1459936/pexels-photo-1459936.jpeg?auto=compress&cs=tinysrgb&w=1400&h=900&fit=crop',
  ];

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i+1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const result = await handleGoogleLogin();
    if (result.success) navigate('/chat');
    else alert('Login failed: ' + result.error);
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      updateUserContext({ isAuthenticated:true, authMethod:'email', email, name: name || email.split('@')[0] });
      navigate('/chat');
      setIsLoading(false);
    }, 1000);
  };

  const langPills = [
    { text:'हिन्दी', bg:'#dcfce7', color:'#15803d' },
    { text:'English', bg:'#dbeafe', color:'#1d4ed8' },
    { text:'मराठी', bg:'#fef3c7', color:'#b45309' },
    { text:'తెలుగు', bg:'#ede9fe', color:'#6d28d9' },
    { text:'தமிழ்', bg:'#fee2e2', color:'#dc2626' },
    { text:'বাংলা', bg:'#ccfbf1', color:'#0f766e' },
  ];

  return (
    <div className="lp-wrap" style={{ minHeight:'100vh', display:'flex', position:'relative', overflow:'hidden' }}>
      <LoginStyles />

      {/* ── Left panel — hero image (desktop) ── */}
      <div style={{ flex:'1 1 50%', position:'relative', display:'none', minHeight:'100vh' }} className="lp-left">
        <style>{`@media(min-width:900px){ .lp-left{ display:block !important; } }`}</style>

        {heroImages.map((src, i) => (
          <img key={i} src={src} alt="" className={`lp-hero-img ${i===imgIdx?'active':''}`} />
        ))}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(0,40,0,0.7) 0%, rgba(0,80,0,0.4) 60%, rgba(0,0,0,0.5) 100%)' }} />

        {/* Left overlay content */}
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 48px' }}>
          {/* Logo */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:36 }}>
            <div style={{ position:'relative' }} className="lp-float">
              <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 0 0 10px rgba(34,197,94,0.2)' }}>
                <Mic size={30} color="#fff" />
              </div>
            </div>
            <div>
              <div style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:800, fontSize:28, color:'#fff', lineHeight:1.1 }}>Sahaayak AI</div>
              <div style={{ fontFamily:"'Noto Sans Devanagari',sans-serif", fontSize:14, color:'#86efac', fontWeight:600 }}>आपका मददगार</div>
            </div>
          </div>

          <h2 style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:800, fontSize:34, color:'#fff', lineHeight:1.3, marginBottom:16 }}>
            Voice AI for<br/>Every Village<br/>in India 🇮🇳
          </h2>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:15, lineHeight:1.7, maxWidth:380, marginBottom:32 }}>
            Helping farmers, students and families access government services, health info and education — in their own language.
          </p>

          {/* Language pills */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:32 }}>
            {langPills.map(p => (
              <span key={p.text} style={{ background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', color:'#fff', padding:'5px 14px', borderRadius:999, fontSize:13, fontFamily:"'Noto Sans Devanagari','Baloo 2',sans-serif", fontWeight:600, border:'1px solid rgba(255,255,255,0.2)' }}>
                {p.text}
              </span>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            {[['🆓','100% Free'],['🎙️','Voice First'],['📶','Works on 2G'],['🔒','Private']].map(([icon,label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.85)', fontSize:13 }}>
                <span>{icon}</span><span style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Image dots */}
        <div style={{ position:'absolute', bottom:24, left:48, display:'flex', gap:6 }}>
          {heroImages.map((_,i) => (
            <div key={i} style={{ width: i===imgIdx ? 20 : 6, height:6, borderRadius:3, background: i===imgIdx ? '#22c55e' : 'rgba(255,255,255,0.4)', transition:'width 0.4s, background 0.4s' }} />
          ))}
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex:'1 1 50%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(160deg,#f0fdf4,#fff)', padding:'32px 20px', overflowY:'auto', minHeight:'100vh' }}>

        {/* Mobile background blur blobs */}
        <div style={{ position:'absolute', top:-60, right:-60, width:240, height:240, borderRadius:'50%', background:'rgba(34,197,94,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:-40, width:180, height:180, borderRadius:'50%', background:'rgba(16,185,129,0.08)', pointerEvents:'none' }} />

        <div className="lp-card-in" style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>

          {/* Mobile logo (hidden on desktop) */}
          <div className="lp-mobile-logo" style={{ textAlign:'center', marginBottom:28 }}>
            <style>{`@media(min-width:900px){ .lp-mobile-logo{ display:none; } }`}</style>
            <div style={{ position:'relative', display:'inline-block', marginBottom:12 }} className="lp-float">
              <div className="lp-pulse" style={{ position:'relative', width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', boxShadow:'0 8px 28px rgba(34,197,94,0.35)' }}>
                <Mic size={32} color="#fff" />
              </div>
            </div>
            <h1 style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:800, fontSize:26, color:'#14532d' }}>Sahaayak AI</h1>
            <p style={{ fontFamily:"'Noto Sans Devanagari',sans-serif", color:'#22c55e', fontSize:14, fontWeight:600 }}>आपका मददगार</p>
          </div>

          {/* Form header */}
          <div style={{ marginBottom:24 }}>
            <h2 style={{ fontFamily:"'Baloo 2',sans-serif", fontWeight:800, fontSize:22, color:'#14532d', marginBottom:4 }}>
              {isLogin ? 'Welcome back! 👋' : 'Create Account'}
            </h2>
            <p style={{ color:'#6b7280', fontSize:14 }}>
              {isLogin ? 'Log in to access your services · अपनी सेवाओं तक पहुंचें' : 'Join thousands of rural citizens · आज शामिल हों'}
            </p>
          </div>

          {/* Login / Sign up toggle */}
          <div style={{ display:'flex', background:'#f3f4f6', borderRadius:14, padding:4, marginBottom:24 }}>
            {[{ val:true, label:'Login · लॉग इन' },{ val:false, label:'Sign Up · साइन अप' }].map(({ val, label }) => (
              <button key={String(val)} onClick={() => setIsLogin(val)}
                className={isLogin===val ? 'lp-tab-active' : ''}
                style={{ flex:1, padding:'10px', borderRadius:11, border:'none', cursor:'pointer', fontFamily:"'Baloo 2',sans-serif", fontWeight:700, fontSize:14, transition:'all 0.25s',
                  background: isLogin===val ? 'linear-gradient(135deg,#16a34a,#10b981)' : 'transparent',
                  color: isLogin===val ? '#fff' : '#6b7280',
                  boxShadow: isLogin===val ? '0 4px 16px rgba(22,163,74,0.3)' : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button className="lp-btn-google" onClick={handleGoogleAuth} disabled={isLoading} style={{ marginBottom:16 }}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
            <ChevronRight size={16} color="#9ca3af" />
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
            <span style={{ fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>or with email · ईमेल से</span>
            <div style={{ flex:1, height:1, background:'#e5e7eb' }} />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {!isLogin && (
              <div style={{ position:'relative' }}>
                <User size={17} color="#9ca3af" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input className="lp-input" type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Full name · पूरा नाम" required={!isLogin} />
              </div>
            )}

            <div style={{ position:'relative' }}>
              <Mail size={17} color="#9ca3af" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input className="lp-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address · ईमेल" required />
            </div>

            <div style={{ position:'relative' }}>
              <Lock size={17} color="#9ca3af" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input className="lp-input" type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password · पासवर्ड" required style={{ paddingRight:44 }} />
              <button type="button" onClick={()=>setShowPassword(v=>!v)}
                style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af', padding:0, display:'flex' }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {isLogin && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'#6b7280' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}
                    style={{ width:15, height:15, accentColor:'#16a34a' }} />
                  Remember me · याद रखें
                </label>
                <button type="button" style={{ fontSize:13, color:'#15803d', background:'none', border:'none', cursor:'pointer', fontFamily:"'Baloo 2',sans-serif", fontWeight:600 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button className="lp-btn-primary" type="submit" disabled={isLoading} style={{ marginTop:4 }}>
              {isLoading
                ? <div style={{ width:20, height:20, border:'2.5px solid #fff', borderTopColor:'transparent', borderRadius:'50%' }} className="lp-spin" />
                : <>{isLogin ? 'Login · लॉग इन' : 'Create Account · अकाउंट बनाएं'} <ArrowRight size={18} /></>}
            </button>
          </form>

          {/* Guest access */}
          <div style={{ textAlign:'center', marginTop:16 }}>
            <button className="lp-guest" onClick={() => { updateUserContext({ isAuthenticated:true, isGuest:true, name:'Guest User' }); navigate('/chat'); }}>
              👤 Continue as Guest · अतिथि के रूप में जारी रखें <ArrowRight size={14} />
            </button>
          </div>

          {/* Trust row */}
          <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid #f0fdf4', display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
            {[{ icon:Shield, label:'Secure', labelHi:'सुरक्षित' },{ icon:Smartphone, label:'24/7 Help', labelHi:'सहायता' }].map(({ icon:Icon, label, labelHi }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Icon size={14} color="#22c55e" />
                <span style={{ fontSize:12, color:'#6b7280' }}>{label}</span>
                <span style={{ fontSize:11, color:'#9ca3af', fontFamily:"'Noto Sans Devanagari',sans-serif" }}>· {labelHi}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginTop:12 }}>
            By continuing, you agree to our{' '}
            <button style={{ color:'#15803d', background:'none', border:'none', cursor:'pointer', fontSize:11, textDecoration:'underline' }}>Terms</button>
            {' & '}
            <button style={{ color:'#15803d', background:'none', border:'none', cursor:'pointer', fontSize:11, textDecoration:'underline' }}>Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;