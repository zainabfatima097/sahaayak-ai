import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { 
  User, Mail, Phone, MapPin, Briefcase, DollarSign, Globe,
  Volume2, Save, Edit2, Bell, LogOut,
  CheckCircle,  Settings,
  MessageCircle, Star, Calendar, TrendingUp, Mic, ArrowRight
} from 'lucide-react';
import { getChatHistory } from '../../components/services/offline/indexedDB';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';

/* ── Styles (matching login page with dark mode support) ──────────── */
const ProfileStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    .pp-wrap, .pp-wrap * { box-sizing: border-box; }
    .pp-wrap { font-family: 'Noto Sans','Noto Sans Devanagari',sans-serif; }

    /* hero image crossfade */
    .pp-hero-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.2s ease; }
    .pp-hero-img.active { opacity: 1; }

    /* card entrance */
    @keyframes pp-card-in { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
    .pp-card-in { animation: pp-card-in 0.55s cubic-bezier(0.34, 1.1, 0.64, 1) both; }

    /* mic float */
    @keyframes pp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
    .pp-float { animation: pp-float 3s ease-in-out infinite; }

    /* input styles */
    .pp-input { width: 100%; border: 1.5px solid var(--border); border-radius: 14px; padding: 13px 14px; font-size: 15px; font-family: 'Noto Sans',sans-serif; color: var(--text-primary); background: var(--bg-primary); transition: border-color 0.2s, box-shadow 0.2s; outline: none; }
    .pp-input:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
    .pp-input::placeholder { color: var(--text-tertiary); }

    .pp-select { width: 100%; border: 1.5px solid var(--border); border-radius: 14px; padding: 13px 14px; font-size: 15px; font-family: 'Noto Sans',sans-serif; color: var(--text-primary); background: var(--bg-primary); transition: border-color 0.2s, box-shadow 0.2s; outline: none; cursor: pointer; appearance: none; }
    .pp-select:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }

    /* primary button */
    .pp-btn-primary { width: 100%; background: linear-gradient(135deg, #16a34a, #10b981); color: #fff; border: none; border-radius: 14px; padding: 14px; font-family: 'Baloo 2',sans-serif; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s; }
    .pp-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(22,163,74,0.4); }
    .pp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    /* logout button */
    .pp-btn-logout { width: 100%; background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; border: none; border-radius: 14px; padding: 14px; font-family: 'Baloo 2',sans-serif; font-weight: 700; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s; }
    .pp-btn-logout:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(239,68,68,0.4); }

    /* edit button */
    .pp-btn-edit { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 12px; border: 1.5px solid #dcfce7; background: var(--bg-primary); color: #15803d; font-size: 13px; font-family: 'Baloo 2',sans-serif; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .pp-btn-edit:hover { background: #f0fdf4; transform: translateY(-1px); }

    /* toggle switch */
    .pp-toggle { position: relative; width: 46px; height: 26px; cursor: pointer; flex-shrink: 0; }
    .pp-toggle input { opacity: 0; width: 0; height: 0; }
    .pp-slider { position: absolute; inset: 0; background: var(--border); border-radius: 999px; transition: background 0.25s; }
    .pp-slider::before { content: ''; position: absolute; width: 20px; height: 20px; border-radius: 50%; background: #fff; top: 3px; left: 3px; transition: transform 0.25s; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .pp-toggle input:checked + .pp-slider { background: linear-gradient(135deg, #22c55e, #10b981); }
    .pp-toggle input:checked + .pp-slider::before { transform: translateX(20px); }

    /* stat card */
    .pp-stat-card { background: var(--card-bg); border-radius: 16px; padding: 12px; text-align: center; border: 1.5px solid var(--border); transition: all 0.2s; }
    .pp-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

    @keyframes pp-spin { to { transform: rotate(360deg); } }
    .pp-spin { animation: pp-spin 1s linear infinite; }

    /* toast */
    @keyframes pp-toast-in { from { opacity: 0; transform: translate(-50%, -16px); } to { opacity: 1; transform: translate(-50%, 0); } }
    .pp-toast { animation: pp-toast-in 0.35s cubic-bezier(0.34,1.2,0.64,1) both; }

    /* scrollbar hide */
    .pp-wrap { overflow: hidden; }
  `}</style>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { userContext, updateUserContext } = useUserContext();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', location: '',
    occupation: 'farmer', income_level: 'below_poverty_line',
    language: 'Hindi', voice_preferred: true,
    notifications_enabled: true, dark_mode: false
  });
  const [stats, setStats] = useState({ totalQueries: 0, savedSchemes: 0, daysActive: 1, questionsAsked: 0 });

  // Hero images for right panel (rural India scenes)
   const heroImages = [
    'https://www.actionaidindia.org/wp-content/uploads/2021/01/The-story-of-114-Odisha-villages-Inside-Image.jpg',
    'https://media-cdn.tripadvisor.com/media/photo-s/17/7d/66/f2/children-playing-in-the.jpg',
    'https://scoonews.com/wp-content/uploads/2022/07/kids-school-60cc773e912d316243546261624354626.jpg',
    'https://i.pinimg.com/736x/7d/3d/db/7d3ddb1f8b6a15564a890b68de8fd82d.jpg',
    'https://images.indianexpress.com/2019/07/tribal-student.jpg?w=1200',
    'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202004/children-876543_1280__1__1.jpeg?size=690:388',
    'https://media.gettyimages.com/id/1500323507/photo/a-doctor-examining-a-young-pregnant-woman-as-part-of-a-medical-health-care-camp-in-a-village.jpg?s=612x612&w=gi&k=20&c=7gmaFqcK-dVWLoLuvKeGNnzE8Hdk6yJ5I1jVR1tyKR4=',
    'https://i.ytimg.com/vi/2TvLVI82qvg/hq720.jpg?sqi=2',
  ];

  useEffect(() => {
    const interval = setInterval(() => setImgIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setFormData({
      name: userContext.name || '',
      email: userContext.email || '',
      phone: userContext.phone || '',
      location: userContext.location || '',
      occupation: userContext.occupation || 'farmer',
      income_level: userContext.income_level || 'below_poverty_line',
      language: userContext.language || 'Hindi',
      voice_preferred: userContext.voice_preferred !== false,
      notifications_enabled: userContext.notifications_enabled !== false,
      dark_mode: userContext.dark_mode || false
    });
    (async () => {
      const history = await getChatHistory();
      setStats({
        totalQueries: history.length,
        savedSchemes: history.filter(m => m.text?.includes('scheme') || m.text?.includes('योजना')).length,
        daysActive: Math.max(1, Math.floor((Date.now() - (parseInt(localStorage.getItem('joinDate')) || Date.now())) / 86400000) + 1),
        questionsAsked: history.filter(m => m.type === 'user').length,
      });
    })();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateUserContext(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditing(false);
    } catch { alert('Failed to save. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      updateUserContext({ isAuthenticated: false });
      navigate('/');
    }
  };

  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const occupations = [
    { value: 'farmer', label: 'किसान / Farmer', icon: '🌾' },
    { value: 'labor', label: 'मजदूर / Labor', icon: '🔨' },
    { value: 'homemaker', label: 'गृहिणी / Homemaker', icon: '🏠' },
    { value: 'student', label: 'विद्यार्थी / Student', icon: '📚' },
    { value: 'teacher', label: 'शिक्षक / Teacher', icon: '👨‍🏫' },
    { value: 'small_business', label: 'छोटा व्यवसाय / Business', icon: '🏪' },
    { value: 'other', label: 'अन्य / Other', icon: '👤' },
  ];
  const incomeLevels = [
    { value: 'below_poverty_line', label: 'BPL – Below Poverty Line', color: '#dc2626', bg: '#fee2e2' },
    { value: 'low', label: 'Low Income', color: '#ea580c', bg: '#ffedd5' },
    { value: 'middle', label: 'Middle Income', color: '#ca8a04', bg: '#fef9c3' },
    { value: 'above_average', label: 'Above Average', color: '#15803d', bg: '#dcfce7' },
  ];
  const languages = ['Hindi', 'English', 'Marathi', 'Telugu', 'Tamil', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese'];

  const getOccLabel = v => occupations.find(o => o.value === v)?.label || v;
  const getOccIcon = v => occupations.find(o => o.value === v)?.icon || '👤';
  const getIncLabel = v => incomeLevels.find(i => i.value === v)?.label || v;
  const getIncColor = v => incomeLevels.find(i => i.value === v)?.color || '#6b7280';

  const statCards = [
    { icon: MessageCircle, value: stats.totalQueries, label: 'Queries', labelHi: 'सवाल', color: '#15803d', bg: '#dcfce7' },
    { icon: Star, value: stats.savedSchemes, label: 'Schemes', labelHi: 'योजनाएं', color: '#1d4ed8', bg: '#dbeafe' },
    { icon: Calendar, value: stats.daysActive, label: 'Days', labelHi: 'दिन', color: '#ea580c', bg: '#ffedd5' },
    { icon: TrendingUp, value: stats.questionsAsked, label: 'Questions', labelHi: 'प्रश्न', color: '#7c3aed', bg: '#ede9fe' },
  ];

  const langPills = [
    { text: 'हिन्दी', bg: '#dcfce7', color: '#15803d' },
    { text: 'English', bg: '#dbeafe', color: '#1d4ed8' },
    { text: 'मराठी', bg: '#fef3c7', color: '#b45309' },
    { text: 'తెలుగు', bg: '#ede9fe', color: '#6d28d9' },
    { text: 'தமிழ்', bg: '#fee2e2', color: '#dc2626' },
    { text: 'বাংলা', bg: '#ccfbf1', color: '#0f766e' },
  ];

  return (
    <div className="pp-wrap" style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <ProfileStyles />

      <ThemeToggle variant="floating" />

      {/* Success Toast */}
      {showSuccess && (
        <div className="pp-toast" style={{ position: 'fixed', top: 20, left: '50%', zIndex: 9999, background: 'linear-gradient(135deg,#15803d,#16a34a)', color: '#fff', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 28px rgba(22,163,74,0.35)', whiteSpace: 'nowrap' }}>
          <CheckCircle size={17} /> Profile saved successfully!
        </div>
      )}

      {/* ── LEFT PANEL — Profile Form ── */}
      <div style={{ flex: '1 1 50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '32px 20px', overflowY: 'auto', minHeight: '100vh' }}>
        <div className="pp-card-in" style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }} className="pp-float">
              <div style={{ position: 'relative', width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 8px 28px rgba(34,197,94,0.35)' }}>
                <Mic size={32} color="#fff" />
              </div>
            </div>
            <h1 style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 26, color: 'var(--text-primary)' }}>My Profile</h1>
            <p style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", color: '#22c55e', fontSize: 14, fontWeight: 600 }}>मेरी प्रोफाइल</p>
          </div>

          {/* Header with edit button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', marginBottom: 4 }}>
                {formData.name || 'Rural Citizen'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Member since {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
            <button className="pp-btn-edit" onClick={() => setIsEditing(v => !v)}>
              <Edit2 size={14} /> {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: "'Baloo 2',sans-serif" }}>✓ Active</span>
            <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: "'Baloo 2',sans-serif" }}>
              {formData.voice_preferred ? '🎤 Voice On' : '⌨️ Text Mode'}
            </span>
            <span style={{ background: '#fef3c7', color: '#b45309', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: "'Baloo 2',sans-serif" }}>
              {getOccIcon(formData.occupation)} {getOccLabel(formData.occupation).split('/')[0].trim()}
            </span>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
            {statCards.map((s, i) => (
              <div key={i} className="pp-stat-card">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>
                  <s.icon size={14} color={s.color} />
                </div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Profile Info Card */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} color="#15803d" />
              </div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Personal Information</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>व्यक्तिगत जानकारी</div>
              </div>
            </div>

            <div style={{ padding: '16px 18px' }}>
              {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Mail size={14} color="#15803d" />
                    <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Email</div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{formData.email || '—'}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Phone size={14} color="#15803d" />
                    <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Phone</div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{formData.phone || '—'}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MapPin size={14} color="#15803d" />
                    <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Location</div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{formData.location || 'Not set'}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Briefcase size={14} color="#15803d" />
                    <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Occupation</div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{getOccLabel(formData.occupation)}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <DollarSign size={14} color={getIncColor(formData.income_level)} />
                    <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Income Level</div><div style={{ fontSize: 13, fontWeight: 500, color: getIncColor(formData.income_level) }}>{getIncLabel(formData.income_level)}</div></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Globe size={14} color="#15803d" />
                    <div><div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Language</div><div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{formData.language}</div></div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input className="pp-input" type="text" value={formData.name} onChange={e => set('name', e.target.value)} placeholder="Full name" />
                  <input className="pp-input" type="email" value={formData.email} onChange={e => set('email', e.target.value)} placeholder="Email" />
                  <input className="pp-input" type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)} placeholder="Phone" />
                  <input className="pp-input" type="text" value={formData.location} onChange={e => set('location', e.target.value)} placeholder="Location (District, State)" />
                  <select className="pp-select" value={formData.occupation} onChange={e => set('occupation', e.target.value)}>
                    {occupations.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
                  </select>
                  <select className="pp-select" value={formData.income_level} onChange={e => set('income_level', e.target.value)}>
                    {incomeLevels.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                  </select>
                  <select className="pp-select" value={formData.language} onChange={e => set('language', e.target.value)}>
                    {languages.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button className="pp-btn-primary" onClick={handleSave} disabled={isLoading}>
                    {isLoading ? <div style={{ width: 20, height: 20, border: '2.5px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} className="pp-spin" /> : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preferences Card */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, border: '1.5px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Settings size={16} color="#1d4ed8" />
              </div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Preferences</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>प्राथमिकताएं</div>
              </div>
            </div>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: Volume2, label: 'Voice Responses', key: 'voice_preferred' },
                { icon: Bell, label: 'Notifications', key: 'notifications_enabled' },
              ].map(({ icon: Icon, label, key }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color="#15803d" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                  </div>
                  <label className="pp-toggle">
                    <input type="checkbox" checked={formData[key]} onChange={e => set(key, e.target.checked)} />
                    <span className="pp-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button className="pp-btn-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 20, paddingBottom: 16 }}>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Sahaayak AI · Made with ❤️ for Rural India</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Hero Image & Branding ── */}
      <div style={{ flex: '1 1 50%', position: 'relative', display: 'none', minHeight: '100vh' }} className="pp-right">
        <style>{`@media(min-width: 900px) { .pp-right { display: block !important; } }`}</style>

        {heroImages.map((src, i) => (
          <img key={i} src={src} alt="" className={`pp-hero-img ${i === imgIdx ? 'active' : ''}`} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,40,0,0.7) 0%, rgba(0,80,0,0.4) 60%, rgba(0,0,0,0.5) 100%)' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px 48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ position: 'relative' }} className="pp-float">
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 8px rgba(34,197,94,0.2)' }}>
                  <Mic size={28} color="#fff" />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 26, color: '#fff', lineHeight: 1.2 }}>Sahaayak AI</div>
                <div style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", fontSize: 13, color: '#86efac', fontWeight: 600 }}>आपका मददगार</div>
              </div>
            </div>

            <h2 style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 800, fontSize: 32, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>
              Your Profile<br/>Your Journey
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, maxWidth: 380, marginBottom: 28 }}>
              Track your activity, manage preferences, and access all your conversations in one place.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {langPills.map(p => (
                <span key={p.text} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: '#fff', padding: '5px 14px', borderRadius: 999, fontSize: 12, fontFamily: "'Noto Sans Devanagari','Baloo 2',sans-serif", fontWeight: 600, border: '1px solid rgba(255,255,255,0.2)' }}>
                  {p.text}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[['🆓', '100% Free'], ['🎙️', 'Voice First'], ['📶', 'Works on 2G'], ['🔒', 'Private']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                  <span>{icon}</span><span style={{ fontFamily: "'Baloo 2',sans-serif", fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 24, right: 48, display: 'flex', gap: 6 }}>
          {heroImages.map((_, i) => (
            <div key={i} style={{ width: i === imgIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === imgIdx ? '#22c55e' : 'rgba(255,255,255,0.4)', transition: 'width 0.4s, background 0.4s' }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;