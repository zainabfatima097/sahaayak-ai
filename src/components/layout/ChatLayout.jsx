import { useState, useEffect, cloneElement, Children } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Sprout, Heart, GraduationCap, Landmark,
  LogOut, Mic,  Sparkles, 
  User, Sun, Moon, Plus, History, ChevronDown
} from 'lucide-react';
import ChatInterface from '../chat/ChatInterface';
import ChatHistory from '../chat/ChatHistory';
import { useUserContext } from '../../context/UserContext';

/* ── Injected styles ────────────────────────────────────────────────── */
const LayoutStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    .cl-wrap, .cl-wrap * { box-sizing: border-box; font-family: 'Noto Sans','Noto Sans Devanagari',sans-serif; }

    /* sidebar slide */
    @keyframes cl-slide-left { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
    .cl-sidebar-anim { animation: cl-slide-left 0.35s cubic-bezier(0.34,1.2,0.64,1) both; }

    /* header entrance */
    @keyframes cl-fade-down { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
    .cl-header-anim { animation: cl-fade-down 0.4s ease both; }

    /* nav item hover */
    .cl-nav-item { transition: all 0.2s ease; cursor: pointer; }
    .cl-nav-item:hover { background: #f0fdf4 !important; transform: translateX(3px); }
    .cl-nav-item.active { background: linear-gradient(135deg,#dcfce7,#f0fdf4) !important; box-shadow: 0 2px 12px rgba(22,163,74,0.12); }

    /* dropdown animation */
    @keyframes dropdown-slide {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-animation {
      animation: dropdown-slide 0.2s ease-out forwards;
    }

    /* bottom button hover */
    .cl-btn { transition: background 0.18s, color 0.18s; }
    .cl-btn:hover { background: #f9fafb !important; }
    .cl-btn-danger:hover { background: #fef2f2 !important; color: #dc2626 !important; }

    /* mobile overlay fade */
    @keyframes cl-overlay { from{opacity:0} to{opacity:1} }
    .cl-overlay { animation: cl-overlay 0.25s ease both; }

    /* mobile menu slide */
    @keyframes cl-mobile-slide { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:none} }
    .cl-mobile-menu { animation: cl-mobile-slide 0.3s cubic-bezier(0.34,1.1,0.64,1) both; }

    /* pulse dot */
    @keyframes cl-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
    .cl-pulse { animation: cl-pulse 2s ease-in-out infinite; }

    /* tooltip */
    .cl-tooltip { position:relative; }
    .cl-tooltip .cl-tip { visibility:hidden; opacity:0; position:absolute; left:calc(100% + 10px); top:50%; transform:translateY(-50%); background:#1f2937; color:#fff; padding:5px 10px; borderRadius:8px; font-size:12px; white-space:nowrap; transition:opacity 0.15s; pointer-events:none; z-index:100; }
    .cl-tooltip:hover .cl-tip { visibility:visible; opacity:1; }

    /* scrollbar */
    .cl-scroll::-webkit-scrollbar { width:4px; }
    .cl-scroll::-webkit-scrollbar-thumb { background:#dcfce7; border-radius:8px; }
  `}</style>
);

const ChatLayout = ({ children, domain = 'general' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { userContext, updateUserContext } = useUserContext();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('session');
    setCurrentSessionId(s || null);
  }, [location.search]);

  useEffect(() => { 
    setIsMobileMenuOpen(false); 
  }, [location.pathname]);

  // Auto-expand the current domain
  useEffect(() => {
    const currentDomain = menuItems.find(item => location.pathname === item.path)?.id;
    if (currentDomain) {
      setExpandedDomain(currentDomain);
    }
  }, [location.pathname]);

  const menuItems = [
    { id:'agriculture', name:'Agriculture', nameHi:'कृषि',   icon:Sprout,       path:'/agriculture', grad:'from-green-500 to-emerald-500', text:'text-green-700',   desc:'Farming & weather', color:'#15803d', lightBg:'#dcfce7' },
    { id:'healthcare',  name:'Healthcare',  nameHi:'स्वास्थ्य', icon:Heart,        path:'/healthcare',  grad:'from-red-500 to-rose-500',     text:'text-red-600',     desc:'Health guidance', color:'#dc2626', lightBg:'#fee2e2' },
    { id:'education',   name:'Education',   nameHi:'शिक्षा',  icon:GraduationCap,path:'/education',   grad:'from-blue-500 to-cyan-500',    text:'text-blue-700',    desc:'Learning resources', color:'#1d4ed8', lightBg:'#dbeafe' },
    { id:'schemes',     name:'Govt Schemes',nameHi:'योजनाएं', icon:Landmark,     path:'/schemes',     grad:'from-amber-500 to-orange-500', text:'text-amber-700',   desc:'Welfare programs', color:'#b45309', lightBg:'#fef3c7' },
  ];

  const domainColors = {
    agriculture: { primary:'#15803d', light:'#dcfce7', grad:'linear-gradient(135deg,#15803d,#16a34a)' },
    healthcare:  { primary:'#dc2626', light:'#fee2e2', grad:'linear-gradient(135deg,#dc2626,#e11d48)' },
    education:   { primary:'#1d4ed8', light:'#dbeafe', grad:'linear-gradient(135deg,#1d4ed8,#2563eb)' },
    schemes:     { primary:'#b45309', light:'#fef3c7', grad:'linear-gradient(135deg,#b45309,#d97706)' },
    general:     { primary:'#6d28d9', light:'#ede9fe', grad:'linear-gradient(135deg,#6d28d9,#7c3aed)' },
  };
  const domColor = domainColors[domain] || domainColors.general;

  const domainTitles = {
    agriculture: { en:'Agriculture Assistant', hi:'किसान साथी' },
    healthcare:  { en:'Healthcare Assistant',  hi:'स्वास्थ्य साथी' },
    education:   { en:'Education Assistant',   hi:'शिक्षा साथी' },
    schemes:     { en:'Govt Schemes Assistant',hi:'योजना साथी' },
    general:     { en:'Sahaayak AI',           hi:'सहायक AI' },
  };
  const dtitle = domainTitles[domain] || domainTitles.general;
  const domainIcons = { agriculture:'🌾', healthcare:'🏥', education:'📚', schemes:'📋', general:'🤖' };

  const handleLogout = () => { updateUserContext({ isAuthenticated:false }); navigate('/'); };
  const handleNewChat = () => { setCurrentSessionId(null); navigate(`/${domain}`); };
  const handleSelectSession = (sid) => { setCurrentSessionId(sid); navigate(`/${domain}?session=${sid}`); };
  const toggleDomain = (domainId) => { setExpandedDomain(expandedDomain === domainId ? null : domainId); };

  const renderChildren = () => {
    if (!children) {
      return (
        <ChatInterface 
          key={currentSessionId || 'new-chat'}
          domain={domain} 
          sessionId={currentSessionId} 
          onSessionChange={setCurrentSessionId} 
        />
      );
    }
    return Children.map(children, child => {
      if (child && child.type === ChatInterface) {
        return cloneElement(child, { 
          sessionId: currentSessionId, 
          onSessionChange: setCurrentSessionId, 
          domain: domain,
          key: currentSessionId || 'new-chat'
        });
      }
      return child;
    });
  };

  const isActive = (path) => location.pathname === path;

  // Domain Header Component with integrated dropdown
  const DomainSection = ({ item }) => {
    const isDomainActive = isActive(item.path);
    const isExpanded = expandedDomain === item.id && isDomainActive;
    
    return (
      <div style={{ marginBottom: 8 }}>
        {/* Domain Header Button - Click to navigate AND toggle dropdown */}
        <button
          onClick={() => {
            if (isDomainActive) {
              // If already on this domain, just toggle dropdown
              toggleDomain(item.id);
            } else {
              // Navigate to new domain - this will auto-expand it via useEffect
              handleNewChat();
              navigate(item.path);
            }
          }}
          className={`cl-nav-item ${isDomainActive ? 'active' : ''}`}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isSidebarOpen ? '10px 12px' : '10px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: isDomainActive ? '' : 'transparent',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: isDomainActive ? item.lightBg : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.2s'
            }}>
              <item.icon size={18} color={isDomainActive ? item.color : '#6b7280'} />
            </div>
            {isSidebarOpen && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    fontFamily: "'Baloo 2',sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: isDomainActive ? item.color : '#374151',
                    lineHeight: 1.3
                  }}>{item.name}</span>
                  <span style={{
                    fontSize: 11,
                    color: isDomainActive ? item.color : '#9ca3af',
                    fontFamily: "'Noto Sans Devanagari',sans-serif"
                  }}>{item.nameHi}</span>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{item.desc}</p>
              </div>
            )}
          </div>
          {/* Show chevron only when on this domain AND sidebar is open */}
          {isSidebarOpen && isDomainActive && (
            <ChevronDown 
              size={16} 
              color={item.color}
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                flexShrink: 0
              }}
            />
          )}
          {!isSidebarOpen && <span className="cl-tip">{item.name} · {item.nameHi}</span>}
        </button>

        {/* Dropdown Content - Shows directly under the button when expanded */}
        {isSidebarOpen && isDomainActive && isExpanded && (
          <div className="dropdown-animation" style={{ marginTop: 8, paddingLeft: 46 }}>
            <ChatHistory
              domain={item.id}
              onSelectSession={handleSelectSession}
              currentSessionId={currentSessionId}
              onNewChat={handleNewChat}
            />
          </div>
        )}
      </div>
    );
  };

  const SidebarNav = () => (
    <div className="cl-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
      <div style={{ marginBottom: 8, padding: '0 8px' }}>
        {isSidebarOpen && (
          <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
            Services
          </p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {menuItems.map(item => (
          <DomainSection key={item.id} item={item} />
        ))}
      </div>

      {/* New Chat shortcut */}
      {isSidebarOpen && (
        <button
          onClick={handleNewChat}
          style={{
            width: '100%',
            marginTop: 16,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
            border: '1.5px dashed #86efac',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            color: '#15803d',
            fontSize: 13,
            fontFamily: "'Baloo 2',sans-serif",
            fontWeight: 600,
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(34,197,94,0.2)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
          <Plus size={16} /> New Chat · नई बातचीत
        </button>
      )}
    </div>
  );

  const BottomMenu = () => (
    <div style={{ borderTop: '1px solid #f0fdf4', padding: '8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[
        { icon: User, label: 'Profile', labelHi: 'प्रोफाइल', action: () => navigate('/profile'), cls: 'cl-btn' },
        {
          icon: isDarkMode ? Sun : Moon,
          label: isDarkMode ? 'Light Mode' : 'Dark Mode',
          labelHi: isDarkMode ? 'हल्का' : 'डार्क',
          action: () => { setIsDarkMode(v => !v); document.body.classList.toggle('dark'); },
          cls: 'cl-btn'
        },
        { icon: LogOut, label: 'Logout', labelHi: 'लॉग आउट', action: handleLogout, cls: 'cl-btn cl-btn-danger', red: true },
      ].map(({ icon: Icon, label, labelHi, action, cls, red }) => (
        <button
          key={label}
          className={`cl-tooltip ${cls}`}
          onClick={action}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 10px',
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: red ? '#ef4444' : '#6b7280',
            textAlign: 'left',
            transition: 'background 0.2s, color 0.2s'
          }}
        >
          <Icon size={17} />
          {isSidebarOpen && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 600, fontSize: 13, color: red ? '#ef4444' : '#374151' }}>
                {label}
              </span>
              <span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 11, color: '#9ca3af' }}>
                {labelHi}
              </span>
            </div>
          )}
          {!isSidebarOpen && <span className="cl-tip">{label}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="cl-wrap" style={{ display: 'flex', height: '100vh', background: '#f9fafb', overflow: 'hidden' }}>
      <LayoutStyles />

      {/* Desktop Sidebar */}
      <aside
        className="cl-sidebar-anim"
        style={{
          width: isSidebarOpen ? 280 : 68,
          background: '#fff',
          borderRight: '1.5px solid #f0fdf4',
          display: 'none',
          flexDirection: 'column',
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.04)',
          zIndex: 20,
          overflow: 'hidden'
        }}
      >
        {/* Sidebar top */}
        <div style={{
          padding: isSidebarOpen ? '18px 14px 14px' : '18px 10px 14px',
          borderBottom: '1px solid #f0fdf4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8
        }}>
          {isSidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#22c55e,#10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(34,197,94,0.35)'
                }}>
                  <Mic size={20} color="#fff" />
                </div>
                <div className="cl-pulse" style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #fff'
                }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: '#14532d', lineHeight: 1.2 }}>
                  Sahaayak AI
                </div>
                <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: '0.05em' }}>आपका मददगार</div>
              </div>
            </div>
          )}
          {!isSidebarOpen && (
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg,#22c55e,#10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <Mic size={18} color="#fff" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(v => !v)}
            style={{
              padding: 6,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#9ca3af',
              transition: 'background 0.15s, color 0.15s',
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
          >
            {isSidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>

        <SidebarNav />
        <BottomMenu />

        {/* User card */}
        {isSidebarOpen && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid #f0fdf4' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 12,
              background: 'linear-gradient(135deg,#f0fdf4,#fff)',
              border: '1px solid #dcfce7'
            }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#22c55e,#10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                flexShrink: 0
              }}>👤</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: "'Baloo 2',sans-serif",
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#14532d',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userContext.name || 'Guest User'}
                </p>
                <p style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userContext.language || 'Hindi'} · {userContext.occupation || 'Rural'}
                </p>
              </div>
              <Sparkles size={13} color="#22c55e" className="cl-pulse" />
            </div>
          </div>
        )}
      </aside>

      <style>{`.cl-wrap aside { display: flex !important; } @media(max-width:767px){ .cl-wrap aside { display: none !important; } }`}</style>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(v => !v)}
        style={{
          position: 'fixed',
          top: 14,
          left: 14,
          zIndex: 50,
          width: 40,
          height: 40,
          borderRadius: 10,
          background: '#fff',
          border: '1px solid #dcfce7',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        className="mobile-ham"
      >
        {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
      <style>{`@media(max-width:767px){ .mobile-ham { display:flex !important; } }`}</style>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="cl-overlay" onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 40 }}>
          <div className="cl-mobile-menu" onClick={e => e.stopPropagation()} style={{ width: 280, height: '100%', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '8px 0 32px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '18px 14px', borderBottom: '1px solid #f0fdf4', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 15, color: '#14532d' }}>Sahaayak AI</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>आपका मददगार</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
              {menuItems.map(item => (
                <div key={item.id}>
                  <button
                    onClick={() => { handleNewChat(); navigate(item.path); setIsMobileMenuOpen(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: isActive(item.path) ? item.lightBg : 'transparent', textAlign: 'left' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: isActive(item.path) ? '#fff' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={17} color={isActive(item.path) ? item.color : '#6b7280'} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: isActive(item.path) ? item.color : '#374151' }}>{item.name} · {item.nameHi}</div>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>{item.desc}</p>
                    </div>
                  </button>
                  {isActive(item.path) && (
                    <div style={{ marginLeft: 12, paddingLeft: 8, borderLeft: `2px solid ${item.lightBg}` }}>
                      <ChatHistory domain={item.id} onSelectSession={(sid) => { handleSelectSession(sid); setIsMobileMenuOpen(false); }} currentSessionId={currentSessionId} onNewChat={handleNewChat} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 8px', borderTop: '1px solid #f0fdf4' }}>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontFamily: "'Baloo 2',sans-serif", fontWeight: 600, fontSize: 13 }}>
                <LogOut size={16} /> Logout · लॉग आउट
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Chat Header */}
        <header className="cl-header-anim" style={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1.5px solid #f0fdf4',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: domColor.grad,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 14px ${domColor.primary}33`
            }}>
              <span style={{ fontSize: 22 }}>{domainIcons[domain]}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 18, color: '#14532d', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{dtitle.hi}</h1>
                <span style={{ fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>{dtitle.en}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span className="cl-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Online</span>
                <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Ask in {userContext.language || 'Hindi'} or English</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              onClick={handleNewChat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: `1.5px solid ${domColor.light}`,
                background: '#fff',
                color: domColor.primary,
                fontSize: 13,
                fontFamily: "'Baloo 2',sans-serif",
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = domColor.light; e.currentTarget.style.boxShadow = `0 4px 16px ${domColor.primary}22`; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
            >
              <Plus size={15} />
              <span style={{ display: 'none' }} className="sm-inline">New Chat</span>
            </button>
            <style>{`@media(min-width:520px){ .sm-inline { display:inline !important; } }`}</style>

            <button
              title="Chat History"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                border: '1.5px solid #f0fdf4',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#9ca3af',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#15803d'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              <History size={17} />
            </button>

            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#22c55e,#10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(34,197,94,0.3)'
              }}
              onClick={() => navigate('/profile')}
            >
              👤
            </div>
          </div>
        </header>

        {/* Chat Body */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {renderChildren()}
        </div>
      </main>
    </div>
  );
};

export default ChatLayout;