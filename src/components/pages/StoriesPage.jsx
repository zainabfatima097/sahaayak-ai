import React, { useState, useEffect, useRef } from 'react';
import { useStories } from '../../hooks/useStories';
import StoryCard from '../../components/stories/StoryCard';
import PostStoryModal from '../../components/stories/PostStoryModal';
import { MessageCircle, Filter, Sparkles, Loader2, Plus, BookOpen, Heart, Users, Star } from 'lucide-react';

/* ─── Injected global styles (matching HomePage) ─────────────────── */
const StoriesGlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    :root {
      --green-50:  #f0fdf4;
      --green-100: #dcfce7;
      --green-200: #bbf7d0;
      --green-500: #22c55e;
      --green-600: #16a34a;
      --green-700: #15803d;
      --green-800: #166534;
      --green-900: #14532d;
      --emerald-500: #10b981;
      --amber-400: #fbbf24;
      --font-display: 'Baloo 2', 'Noto Sans Devanagari', sans-serif;
      --font-body: 'Noto Sans', sans-serif;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-xl: 28px;
      --radius-full: 9999px;
    }

    .stories-page { font-family: var(--font-body); }

    /* scroll reveal */
    .s-reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.65s ease, transform 0.65s ease; }
    .s-reveal.visible { opacity: 1; transform: none; }

    /* hero image crossfade */
    .s-hero-img {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 1.2s ease;
    }
    .s-hero-img.active { opacity: 1; }

    /* ken-burns */
    @keyframes sKenBurns {
      0%   { transform: scale(1.0); }
      50%  { transform: scale(1.06) translate(-0.5%, -0.5%); }
      100% { transform: scale(1.0); }
    }
    .s-kb { animation: sKenBurns 18s ease-in-out infinite; }

    /* float badge */
    @keyframes sFloat {
      0%,100% { transform: translateY(0); }
      50%      { transform: translateY(-8px); }
    }
    .s-float { animation: sFloat 4s ease-in-out infinite; }

    /* badge shimmer */
    @keyframes sShimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .s-badge-shimmer {
      background: linear-gradient(90deg, #dcfce7 25%, #bbf7d0 50%, #dcfce7 75%);
      background-size: 200% 100%;
      animation: sShimmer 2.5s linear infinite;
    }

    /* card hover */
    .s-card-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .s-card-lift:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }

    /* filter pill active */
    .s-filter-active { background: #16a34a !important; color: #fff !important; }

    /* story card domain colors */
    .s-domain-agriculture { border-color: #bbf7d0 !important; }
    .s-domain-healthcare   { border-color: #fecdd3 !important; }
    .s-domain-education    { border-color: #bfdbfe !important; }
    .s-domain-schemes      { border-color: #fde68a !important; }

    /* scroll indicator */
    @keyframes sScrollDown {
      0%   { transform: translateY(0); opacity:1; }
      100% { transform: translateY(10px); opacity:0; }
    }
    .s-scroll-dot { animation: sScrollDown 1.5s ease-in-out infinite; }

    /* pulse */
    @keyframes sPulse {
      0%,100% { opacity:1; } 50% { opacity:0.5; }
    }
    .s-pulse { animation: sPulse 2s ease-in-out infinite; }

    /* stat pop */
    @keyframes sStatPop { from { opacity:0; transform: scale(0.75); } to { opacity:1; transform: scale(1); } }
    .s-stat-pop { animation: sStatPop 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }

    /* marquee */
    @keyframes sMarquee { 0%{ transform:translateX(0) } 100%{ transform:translateX(-50%) } }
    .s-marquee-inner { display:flex; gap:12px; animation: sMarquee 32s linear infinite; }
    .s-marquee-inner:hover { animation-play-state: paused; }
  `}</style>
);

/* ─── Scroll reveal hook ─────────────────────────────────────────── */
function useScrollReveal(dep) {
  useEffect(() => {
    const els = document.querySelectorAll('.s-reveal');
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
}

/* ─── Stat counter ───────────────────────────────────────────────── */
const StatBadge = ({ icon: Icon, value, label, color, bg, delay = 0 }) => (
  <div className="s-stat-pop" style={{
    animationDelay: `${delay}ms`,
    background: '#fff', borderRadius: 'var(--radius-lg)',
    padding: '20px 16px', textAlign: 'center',
    border: `1.5px solid ${bg}`,
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    minWidth: 120,
  }}>
    <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#14532d', marginBottom: 2 }}>{value}</div>
    <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.4 }}>{label}</p>
  </div>
);

/* ─── Domain pill for marquee ────────────────────────────────────── */
const DomainPill = ({ icon, text, color, textColor }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 18px', borderRadius: 'var(--radius-full)',
    background: color, whiteSpace: 'nowrap', flexShrink: 0,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  }}>
    <span style={{ fontSize: 16 }}>{icon}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: textColor || '#14532d', fontFamily: 'var(--font-display)' }}>{text}</span>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const StoriesPage = () => {
  const { stories, isLoading, filters, setFilters, postStory, handleHelpful, deleteStory, updateStory } = useStories();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useScrollReveal(stories.length);

  // Hero images — rural India storytelling vibe
  const heroImages = [
    'https://images.pexels.com/photos/3807571/pexels-photo-3807571.jpeg?auto=compress&cs=tinysrgb&w=1920&h=700&fit=crop',
    'https://images.pexels.com/photos/2519370/pexels-photo-2519370.jpeg?auto=compress&cs=tinysrgb&w=1920&h=700&fit=crop',
    'https://images.pexels.com/photos/5212361/pexels-photo-5212361.jpeg?auto=compress&cs=tinysrgb&w=1920&h=700&fit=crop',
  ];

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Stats intersection observer
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const domains = [
    { id: 'all',         name: 'All Stories',  icon: '🌟' },
    { id: 'agriculture', name: 'Agriculture',  icon: '🌾' },
    { id: 'healthcare',  name: 'Healthcare',   icon: '🏥' },
    { id: 'education',   name: 'Education',    icon: '📚' },
    { id: 'schemes',     name: 'Schemes',      icon: '📋' },
  ];

  const languages = [
    { id: 'all',     name: 'All Languages' },
    { id: 'Hindi',   name: 'हिन्दी' },
    { id: 'English', name: 'English' },
    { id: 'Marathi', name: 'मराठी' },
    { id: 'Telugu',  name: 'తెలుగు' },
    { id: 'Tamil',   name: 'தமிழ்' },
    { id: 'Bengali', name: 'বাংলা' },
  ];

  const domainPills = [
    { icon: '🌾', text: 'किसान की कहानी', color: '#dcfce7', textColor: '#166534' },
    { icon: '🏥', text: 'Health Journey', color: '#ffe4e6', textColor: '#be123c' },
    { icon: '📚', text: 'शिक्षा की राह', color: '#dbeafe', textColor: '#1d4ed8' },
    { icon: '📋', text: 'Scheme Success', color: '#fef3c7', textColor: '#b45309' },
    { icon: '🌱', text: 'New Beginnings', color: '#ccfbf1', textColor: '#0f766e' },
    { icon: '💪', text: 'जज़्बा', color: '#ede9fe', textColor: '#6d28d9' },
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const statsData = [
    { icon: BookOpen, value: `${stories.length || '0'}+`, label: 'Stories Shared',   color: '#16a34a', bg: '#dcfce7' },
    { icon: Heart,    value: '12K+',                      label: 'Lives Inspired',   color: '#e11d48', bg: '#ffe4e6' },
    { icon: Users,    value: '50K+',                      label: 'Readers Monthly',  color: '#2563eb', bg: '#dbeafe' },
    { icon: Star,     value: '4.9★',                      label: 'Avg Rating',       color: '#d97706', bg: '#fef3c7' },
  ];

  return (
    <div className="stories-page" style={{ background: '#fff', overflowX: 'hidden', minHeight: '100vh' }}>
      <StoriesGlobalStyles />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {heroImages.map((src, i) => (
          <img key={i} src={src} alt="" className={`s-hero-img s-kb ${i === imgIdx ? 'active' : ''}`} />
        ))}

        {/* Layered overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,30,0,0.6) 50%, rgba(0,0,0,0.72) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,83,45,0.6) 0%, transparent 60%)' }} />

        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '8%', right: '6%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '4%', width: 180, height: 180, borderRadius: '50%', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 720, margin: '0 auto' }}>
          {/* Floating icon */}
          <div className="s-float" style={{ marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg,#22c55e,#10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
              boxShadow: '0 0 0 8px rgba(34,197,94,0.2), 0 8px 32px rgba(34,197,94,0.4)',
            }}>
              <MessageCircle size={34} color="#fff" />
            </div>
          </div>

          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(34,197,94,0.2)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(34,197,94,0.3)',
            padding: '5px 16px', borderRadius: 'var(--radius-full)',
            marginBottom: 16,
          }}>
            <span className="s-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#86efac', letterSpacing: '0.08em', fontFamily: 'var(--font-display)' }}>
              REAL STORIES · असली अनुभव
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3.6rem)',
            fontWeight: 800, color: '#fff', lineHeight: 1.15, marginBottom: 14,
            letterSpacing: '-0.01em',
          }}>
            Success Stories
          </h1>
          <p style={{ fontSize: 'clamp(0.95rem,2vw,1.15rem)', color: 'rgba(255,255,255,0.72)', marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
            Real experiences from real people — read how others transformed their lives with our assistance.
            <br />
            <span style={{ color: '#86efac', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
              असली लोग, असली बदलाव।
            </span>
          </p>

          {/* CTA */}
          <button
            onClick={() => setShowPostModal(true)}
            style={{
              background: 'linear-gradient(135deg,#22c55e,#10b981)', color: '#fff',
              border: 'none', padding: '14px 36px', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 32px rgba(34,197,94,0.5)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(34,197,94,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(34,197,94,0.5)'; }}
          >
            <Plus size={18} /> Share Your Story &nbsp;/ अपनी कहानी लिखें
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 24, height: 38, border: '2px solid rgba(255,255,255,0.35)', borderRadius: 12, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
            <div className="s-scroll-dot" style={{ width: 4, height: 7, borderRadius: 2, background: '#86efac' }} />
          </div>
        </div>
      </section>

      {/* ── DOMAIN MARQUEE ───────────────────────────────────────── */}
      <div style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0', padding: '14px 0', overflow: 'hidden' }}>
        <div className="s-marquee-inner">
          {[...domainPills, ...domainPills, ...domainPills, ...domainPills].map((p, i) => (
            <DomainPill key={i} {...p} />
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <section ref={statsRef} style={{ padding: '52px 24px', background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(34,197,94,0.06)' }} />
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
            {statsVisible && statsData.map((s, i) => (
              <StatBadge key={i} {...s} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTERS + CONTENT ────────────────────────────────────── */}
      <section style={{ padding: '52px 24px 80px', background: '#fff' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Section header */}
          <div className="s-reveal" style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="s-badge-shimmer" style={{
              display: 'inline-block', padding: '5px 18px', borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 700, color: '#15803d', letterSpacing: '0.06em', marginBottom: 12,
            }}>
              📖 COMMUNITY STORIES
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 800, color: '#14532d', marginBottom: 8 }}>
              जीवन बदलने वाली कहानियां
            </h2>
            <p style={{ color: '#6b7280', fontSize: 16 }}>
              Read how Sahaayak AI helped real families across rural India
            </p>
          </div>

          {/* Action row */}
          <div className="s-reveal" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowPostModal(true)}
              style={{
                flex: 1, minWidth: 200,
                background: 'linear-gradient(135deg,#16a34a,#10b981)', color: '#fff',
                border: 'none', padding: '13px 24px', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <Plus size={17} /> Share Your Story
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '13px 22px', borderRadius: 'var(--radius-full)',
                background: showFilters ? '#dcfce7' : '#fff',
                border: `1.5px solid ${showFilters ? '#86efac' : '#e5e7eb'}`,
                color: showFilters ? '#15803d' : '#374151',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              <Filter size={16} /> Filter {showFilters ? '▲' : '▼'}
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="s-reveal visible" style={{
              background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
              border: '1.5px solid #bbf7d0', borderRadius: 'var(--radius-xl)',
              padding: '24px', marginBottom: 28,
              boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            }}>
              {/* Domain filter */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#15803d', marginBottom: 10, letterSpacing: '0.04em' }}>
                  FILTER BY DOMAIN
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {domains.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleFilterChange('domain', d.id)}
                      style={{
                        padding: '8px 18px', borderRadius: 'var(--radius-full)',
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                        transition: 'all 0.2s',
                        background: filters.domain === d.id ? '#16a34a' : '#fff',
                        color: filters.domain === d.id ? '#fff' : '#374151',
                        boxShadow: filters.domain === d.id ? '0 4px 14px rgba(22,163,74,0.35)' : '0 1px 4px rgba(0,0,0,0.08)',
                      }}
                    >
                      {d.icon} {d.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language filter */}
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#15803d', marginBottom: 10, letterSpacing: '0.04em' }}>
                  FILTER BY LANGUAGE
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {languages.map(lang => (
                    <button
                      key={lang.id}
                      onClick={() => handleFilterChange('language', lang.id)}
                      style={{
                        padding: '8px 18px', borderRadius: 'var(--radius-full)',
                        border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14,
                        transition: 'all 0.2s',
                        background: filters.language === lang.id ? '#16a34a' : '#fff',
                        color: filters.language === lang.id ? '#fff' : '#374151',
                        boxShadow: filters.language === lang.id ? '0 4px 14px rgba(22,163,74,0.35)' : '0 1px 4px rgba(0,0,0,0.08)',
                      }}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stories feed */}
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg,#22c55e,#10b981)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 8px rgba(34,197,94,0.15)',
              }}>
                <Loader2 size={30} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', color: '#16a34a', fontWeight: 600, fontSize: 16 }}>
                कहानियां लोड हो रही हैं…
              </p>
            </div>
          ) : stories.length === 0 ? (
            <div className="s-reveal" style={{
              textAlign: 'center', padding: '80px 24px',
              background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)',
              borderRadius: 'var(--radius-xl)', border: '2px dashed #bbf7d0',
            }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>📖</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: '#14532d', marginBottom: 8 }}>
                अभी तक कोई कहानी नहीं
              </h3>
              <p style={{ color: '#6b7280', marginBottom: 24 }}>
                Be the first to share your success story and inspire thousands!
              </p>
              <button
                onClick={() => setShowPostModal(true)}
                style={{
                  background: 'linear-gradient(135deg,#16a34a,#10b981)', color: '#fff',
                  border: 'none', padding: '12px 32px', borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
                }}
              >
                <Sparkles size={16} style={{ display: 'inline', marginRight: 6 }} />
                Share First Story
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {stories.map((story, i) => (
  <div
    key={story.id}
    className="s-reveal s-card-lift"
    style={{ transitionDelay: `${Math.min(i * 60, 300)}ms` }}
  >
    <StoryCard 
      story={story} 
      onHelpful={handleHelpful}
      onDelete={deleteStory}
      onEdit={updateStory}
    />
  </div>
))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA STRIP ────────────────────────────────────────────── */}
      <section style={{
        padding: '64px 24px',
        background: 'linear-gradient(135deg,#14532d 0%,#166534 40%,#15803d 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div className="s-reveal" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Sparkles size={28} color="#86efac" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>
            आपकी कहानी भी मायने रखती है
          </h2>
          <p style={{ color: '#86efac', fontSize: 16, marginBottom: 6 }}>
            Your story could inspire someone else's breakthrough.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 32 }}>
            हज़ारों लोग आपकी कहानी पढ़कर बदलाव ला सकते हैं।
          </p>
          <button
            onClick={() => setShowPostModal(true)}
            style={{
              background: '#fff', color: '#15803d',
              border: 'none', padding: '14px 40px', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16,
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
          >
            <Plus size={18} /> Share Your Story
          </button>
        </div>
      </section>

      {/* Post Story Modal */}
      <PostStoryModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={async (storyData) => {
          const result = await postStory(storyData);
          if (result.success) alert('Your story has been submitted for review!');
          return result;
        }}
        domain={filters.domain !== 'all' ? filters.domain : 'agriculture'}
      />
    </div>
  );
};

export default StoriesPage;