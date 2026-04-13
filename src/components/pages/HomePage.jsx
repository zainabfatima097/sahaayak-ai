import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic, Users, Sun, Heart, GraduationCap, Landmark, ArrowRight,
  Play, Sparkles, ChevronRight, Award, Clock, Shield,
  Zap, Globe, MessageCircle, CheckCircle, Phone,
} from 'lucide-react';

/* ─── Injected global styles ─────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Noto+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --green-50:  #f0fdf4;
      --green-100: #dcfce7;
      --green-200: #bbf7d0;
      --green-300: #86efac;
      --green-400: #4ade80;
      --green-500: #22c55e;
      --green-600: #16a34a;
      --green-700: #15803d;
      --green-800: #166534;
      --green-900: #14532d;
      --emerald-500: #10b981;
      --amber-400: #fbbf24;
      --amber-500: #f59e0b;
      --orange-500: #f97316;
      --red-500: #ef4444;
      --blue-500: #3b82f6;
      --purple-500: #8b5cf6;
      --font-display: 'Baloo 2', 'Noto Sans Devanagari', sans-serif;
      --font-body: 'Noto Sans', sans-serif;
      --radius-sm: 8px;
      --radius-md: 14px;
      --radius-lg: 20px;
      --radius-xl: 28px;
      --radius-full: 9999px;
    }

    body { font-family: var(--font-body); }

    /* scroll reveal */
    .reveal { opacity: 0; transform: translateY(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal.visible { opacity: 1; transform: none; }
    .reveal-left { opacity: 0; transform: translateX(-32px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-left.visible { opacity: 1; transform: none; }
    .reveal-right { opacity: 0; transform: translateX(32px); transition: opacity 0.7s ease, transform 0.7s ease; }
    .reveal-right.visible { opacity: 1; transform: none; }

    /* hero image ken-burns */
    @keyframes kenBurns {
      0%   { transform: scale(1.0) translate(0, 0); }
      50%  { transform: scale(1.08) translate(-1%, -1%); }
      100% { transform: scale(1.0) translate(0, 0); }
    }
    .kb { animation: kenBurns 20s ease-in-out infinite; }

    /* hero image crossfade */
    .hero-img {
      position: absolute; inset: 0;
      width: 100%; height: 100%; object-fit: cover;
      opacity: 0; transition: opacity 1.2s ease;
    }
    .hero-img.active { opacity: 1; }

    /* float mic */
    @keyframes floatMic {
      0%, 100% { transform: translateY(0); }
      50%       { transform: translateY(-10px); }
    }
    .float-mic { animation: floatMic 3s ease-in-out infinite; }

    /* pulse ring */
    @keyframes pulseRing {
      0%   { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.7); opacity: 0; }
    }
    .pulse-ring::before,
    .pulse-ring::after {
      content: '';
      position: absolute; inset: 0;
      border-radius: 50%;
      background: rgba(34,197,94,0.4);
      animation: pulseRing 2s ease-out infinite;
    }
    .pulse-ring::after { animation-delay: 1s; }

    /* typing cursor */
    @keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
    .cursor { display:inline-block; width:2px; height:1em; background:#22c55e; margin-left:2px; vertical-align:middle; border-radius:2px; animation: blink 1s step-end infinite; }

    /* scroll indicator */
    @keyframes scrollDown {
      0%   { transform: translateY(0); opacity:1; }
      100% { transform: translateY(10px); opacity:0; }
    }
    .scroll-dot { animation: scrollDown 1.5s ease-in-out infinite; }

    /* badge shimmer */
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    .badge-shimmer {
      background: linear-gradient(90deg, #dcfce7 25%, #bbf7d0 50%, #dcfce7 75%);
      background-size: 200% 100%;
      animation: shimmer 2.5s linear infinite;
    }

    /* card hover lift */
    .card-lift { transition: transform 0.35s ease, box-shadow 0.35s ease; }
    .card-lift:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.12); }

    /* step connector */
    .step-line {
      flex: 1;
      height: 2px;
      background: linear-gradient(90deg, #22c55e, #10b981);
      opacity: 0.3;
      margin: 0 8px;
      display: none;
    }
    @media(min-width:768px){ .step-line { display: block; } }

    /* language marquee */
    @keyframes marquee { 0%{ transform: translateX(0) } 100%{ transform: translateX(-50%) } }
    .marquee-inner { display: flex; animation: marquee 28s linear infinite; }
    .marquee-inner:hover { animation-play-state: paused; }

    /* stat counter pulse on enter */
    @keyframes countUp { from { opacity:0; transform: scale(0.7); } to { opacity:1; transform: scale(1); } }
    .stat-card.visible .stat-num { animation: countUp 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }

    /* wave divider */
    .wave { display:block; width:100%; overflow:hidden; line-height:0; }
    .wave svg { display:block; }

    /* mobile menu open */
    .nav-open { display: flex !important; }
  `}</style>
);

/* ─── Scroll reveal hook ─────────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.12 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Typing animation hook ──────────────────────────────────────── */
function useTypingCycle(strings, speed = 70, pause = 2200) {
  const [display, setDisplay] = useState('');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('typing');
  const charRef = useRef(0);

  useEffect(() => {
    let timer;
    const current = strings[idx];
    if (phase === 'typing') {
      if (charRef.current < current.length) {
        timer = setTimeout(() => {
          charRef.current += 1;
          setDisplay(current.slice(0, charRef.current));
        }, speed);
      } else {
        timer = setTimeout(() => setPhase('erasing'), pause);
      }
    } else {
      if (charRef.current > 0) {
        timer = setTimeout(() => {
          charRef.current -= 1;
          setDisplay(current.slice(0, charRef.current));
        }, speed / 2);
      } else {
        setIdx(i => (i + 1) % strings.length);
        setPhase('typing');
      }
    }
    return () => clearTimeout(timer);
  }, [display, phase, idx, strings, speed, pause]);

  return display;
}

/* ─── Language tag pill ──────────────────────────────────────────── */
const LangPill = ({ lang, text, color }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '10px 20px', borderRadius: 'var(--radius-full)',
    background: color, whiteSpace: 'nowrap', flexShrink: 0,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  }}>
    <span style={{ fontSize: 11, fontWeight: 600, color: '#166534', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{lang}</span>
    <span style={{ fontSize: 15, fontWeight: 600, color: '#14532d', fontFamily: 'var(--font-display)' }}>{text}</span>
  </div>
);

/* ─── Service Card Component ─────────────────────────────────────── */
const ServiceCard = ({ icon: Icon, title, titleHi, description, bg, accent, light, img, stats, onClick }) => (
  <div
    onClick={onClick}
    className="card-lift"
    style={{
      flex: 1,
      minWidth: 0,
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      background: bg,
      border: `1.5px solid ${light}`,
      cursor: 'pointer',
      transition: 'transform 0.35s ease, box-shadow 0.35s ease',
    }}
  >
    <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
      <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 14, left: 14, width: 44, height: 44, borderRadius: 12, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
        <Icon size={22} color="#fff" />
      </div>
    </div>
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#14532d' }}>{title}</h3>
        <span style={{ fontSize: 13, color: accent, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{titleHi}</span>
      </div>
      <p style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>{description}</p>
      <div style={{ display: 'inline-block', fontSize: 11, color: accent, fontWeight: 600, background: light, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
        {stats}
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────────── */
const HomePage = () => {
  const navigate = useNavigate();

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

  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setImgIdx(i => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, []);

  useScrollReveal();

  const taglines = [
    'अपनी भाषा में बोलें, हम समझेंगे',
    'आपका डिजिटल मददगार',
    'Your voice, your rights, your future',
    'మీ భాషలో మీ సమస్యలు చెప్పండి',
    'உங்கள் மொழியில் கேளுங்கள்',
  ];
  const typedText = useTypingCycle(taglines, 65, 2000);

  const services = [
    {
      id: 'healthcare',
      icon: Heart,
      title: 'Healthcare',
      titleHi: 'स्वास्थ्य सेवा',
      description: 'Get health guidance, nearby hospital info, telemedicine support, and Ayushman Bharat scheme details.',
      bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)',
      accent: '#e11d48',
      light: '#fecdd3',
      img: 'https://media.gettyimages.com/id/1500323507/photo/a-doctor-examining-a-young-pregnant-woman-as-part-of-a-medical-health-care-camp-in-a-village.jpg?s=612x612&w=gi&k=20&c=7gmaFqcK-dVWLoLuvKeGNnzE8Hdk6yJ5I1jVR1tyKR4=',
      stats: '24/7 emergency support',
      path: '/healthcare',
    },
    {
      id: 'agriculture',
      icon: Sun,
      title: 'Agriculture',
      titleHi: 'कृषि सहायता',
      description: 'Weather forecasts, mandi prices, MSP rates, fertilizer info, and expert farming tips.',
      bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
      accent: '#16a34a',
      light: '#bbf7d0',
      img: 'https://thumbs.dreamstime.com/b/indian-village-life-18326271.jpg',
      stats: '50K+ farmers helped',
      path: '/agriculture',
    },
    {
      id: 'education',
      icon: GraduationCap,
      title: 'Education',
      titleHi: 'शिक्षा मार्गदर्शन',
      description: 'Find scholarships, government schools, free courses, digital learning resources, and career guidance.',
      bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
      accent: '#2563eb',
      light: '#bfdbfe',
      img: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202004/children-876543_1280__1__1.jpeg?size=690:388',
      stats: '100+ free courses',
      path: '/education',
    },
    {
      id: 'schemes',
      icon: Landmark,
      title: 'Govt Schemes',
      titleHi: 'सरकारी योजनाएं',
      description: 'Discover PM-KISAN, Ayushman Bharat, Ration Card, Housing schemes, and 50+ welfare programs.',
      bg: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
      accent: '#d97706',
      light: '#fde68a',
      img: 'https://img-cdn.publive.online/fit-in/640x430/filters:format(webp)/english-betterindia/media/post_attachments/uploads/2017/11/Children-eating-a-meal..jpg',
      stats: '50+ active schemes',
      path: '/schemes',
    },
  ];

  const impactStats = [
    { icon: MessageCircle, value: '1M+', label: 'Queries Answered', labelHi: 'सवालों के जवाब', color: '#2563eb', bg: '#dbeafe' },
    { icon: Award, value: '50+', label: 'Govt Schemes', labelHi: 'सरकारी योजनाएं', color: '#d97706', bg: '#fef3c7' },
    { icon: Globe, value: '5+', label: 'Indian Languages', labelHi: 'भाषाएं', color: '#7c3aed', bg: '#ede9fe' },
    { icon: Clock, value: '24/7', label: 'Support Available', labelHi: 'सहायता उपलब्ध', color: '#e11d48', bg: '#ffe4e6' },
    { icon: Shield, value: '100%', label: 'Free Service', labelHi: 'मुफ़्त सेवा', color: '#0d9488', bg: '#ccfbf1' },
  ];

  const langPills = [
    { lang: 'हिन्दी', text: 'आपका मददगार', color: '#dcfce7' },
    { lang: 'English', text: 'Your Helper', color: '#dbeafe' },
    { lang: 'मराठी', text: 'तुमचा मदतगार', color: '#fef3c7' },
    { lang: 'తెలుగు', text: 'మీ సహాయకుడు', color: '#ede9fe' },
    { lang: 'தமிழ்', text: 'உங்கள் உதவியாளர்', color: '#ffe4e6' },
    { lang: 'বাংলা', text: 'আপনার সাহায্যকারী', color: '#ccfbf1' },
  ];

  const steps = [
    { num: '01', icon: Mic, label: 'Press & Speak', labelHi: 'बोलें', color: '#16a34a', bg: '#dcfce7',
      desc: 'Just tap the mic and speak naturally. No typing or reading needed.', img: '🎙️' },
    { num: '02', icon: Zap, label: 'AI Understands', labelHi: 'AI समझेगा', color: '#7c3aed', bg: '#ede9fe',
      desc: 'Our AI understands your dialect, corrects errors and finds the right answer.', img: '🤖' },
    { num: '03', icon: CheckCircle, label: 'Get Help', labelHi: 'मदद पाएं', color: '#2563eb', bg: '#dbeafe',
      desc: 'Receive answers in audio so even non-readers can benefit instantly.', img: '✅' },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: '#fff', overflowX: 'hidden' }}>
      <GlobalStyles />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {heroImages.map((src, i) => (
          <img key={i} src={src} alt="" className={`hero-img kb ${i === imgIdx ? 'active' : ''}`} />
        ))}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,30,0,0.55) 50%, rgba(0,0,0,0.7) 100%)' }} />
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '3%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }} />

        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 32 }} className="float-mic pulse-ring">
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: 'linear-gradient(135deg,#22c55e,#10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(34,197,94,0.2)',
            }}>
              <Mic size={44} color="#fff" />
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem,6vw,4.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.01em', marginBottom: 12 }}>
            Sahaayak AI
          </h1>
          <div style={{ fontSize: 'clamp(1.1rem,2.5vw,1.6rem)', color: '#86efac', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: 8, minHeight: '2.2em', letterSpacing: '0.01em' }}>
            {typedText}<span className="cursor" />
          </div>
          <p style={{ fontSize: 'clamp(0.95rem,2vw,1.15rem)', color: 'rgba(255,255,255,0.7)', marginBottom: 36 }}>
            Voice AI for every village in India
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(135deg,#22c55e,#10b981)', color: '#fff',
                border: 'none', padding: '14px 36px', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 8px 32px rgba(34,197,94,0.45)',
                transition: 'transform 0.2s,box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 40px rgba(34,197,94,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 32px rgba(34,197,94,0.45)'; }}
            >
              शुरू करें &nbsp;/ Get Started <Play size={18} />
            </button>
            <button
              style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
                color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)',
                padding: '14px 36px', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
            >
              Watch Demo <ArrowRight size={18} />
            </button>
          </div>

          <div style={{
            display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap',
            borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 28,
          }}>
            {[['100%','Free'],['5+','Languages'],['50+','Govt Schemes'],['24/7','Support']].map(([v,l],i) => (
              <div key={i} style={{ padding: '0 28px', textAlign: 'center', borderRight: i<3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#86efac', fontFamily: 'var(--font-display)' }}>{v}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 26, height: 42, border: '2px solid rgba(255,255,255,0.4)', borderRadius: 13, display: 'flex', justifyContent: 'center', paddingTop: 7 }}>
            <div className="scroll-dot" style={{ width: 4, height: 8, borderRadius: 2, background: '#86efac' }} />
          </div>
        </div>
      </section>

      {/* ── LANGUAGE MARQUEE ─────────────────────────────────────── */}
      <div style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0', padding: '18px 0', overflow: 'hidden' }}>
        <div className="marquee-inner" style={{ gap: 14 }}>
          {[...langPills, ...langPills, ...langPills, ...langPills].map((p, i) => (
            <LangPill key={i} {...p} />
          ))}
        </div>
      </div>

      {/* ── SERVICES SECTION (4 cards in one line, even spacing) ──── */}
      <section style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="badge-shimmer reveal" style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700, color: '#15803d', letterSpacing: '0.06em', marginBottom: 14 }}>
              OUR SERVICES
            </span>
            <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: '#14532d', marginBottom: 14, lineHeight: 1.2 }}>
              जो आपको चाहिए, बस एक टैप पे · What You Need, One Tap Away
            </h2>
            <p className="reveal" style={{ color: '#6b7280', fontSize: 17, maxWidth: 580, margin: '0 auto' }}>
              Voice-powered help for farming, health, education and government schemes
            </p>
          </div>

          {/* 4 cards in a single row with flex and even spacing */}
          <div className="reveal" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                icon={service.icon}
                title={service.title}
                titleHi={service.titleHi}
                description={service.description}
                bg={service.bg}
                accent={service.accent}
                light={service.light}
                img={service.img}
                stats={service.stats}
                onClick={() => navigate(service.path)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(34,197,94,0.07)' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(16,185,129,0.07)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span className="reveal" style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700, color: '#15803d', background: '#bbf7d0', letterSpacing: '0.06em', marginBottom: 14 }}>
              📊 OUR IMPACT
            </span>
            <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: '#14532d', marginBottom: 12 }}>
              असली बदलाव · Real Change in Rural India
            </h2>
            <p className="reveal" style={{ color: '#4b7c5e', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
              Measurable impact on the ground, one village at a time
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 20 }}>
            {impactStats.map((s, i) => (
              <div
                key={i}
                className={`reveal stat-card card-lift`}
                style={{ transitionDelay: `${i*80}ms`, background: '#fff', borderRadius: 'var(--radius-lg)', padding: '28px 20px', textAlign: 'center', border: `1.5px solid ${s.bg}`, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <s.icon size={24} color={s.color} />
                </div>
                <div className="stat-num" style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: '#14532d', marginBottom: 4 }}>{s.value}</div>
                <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.4 }}>{s.label}</p>
                <p style={{ color: s.color, fontSize: 12, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{s.labelHi}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding: '96px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <span className="reveal" style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', letterSpacing: '0.06em', marginBottom: 14 }}>
              🚀 HOW IT WORKS
            </span>
            <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3.5vw,2.8rem)', fontWeight: 800, color: '#1e3a5f', marginBottom: 12 }}>
              3 आसान कदम · 3 Simple Steps
            </h2>
            <p className="reveal" style={{ color: '#6b7280', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
              No smartphone expertise needed. Even first-time users can get help in under 60 seconds.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
            {steps.map((step, i) => (
              <React.Fragment key={step.num}>
                <div className="reveal" style={{ transitionDelay: `${i*120}ms`, flex: '1 1 260px', maxWidth: 320, textAlign: 'center', padding: '0 16px' }}>
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                    <div style={{ width: 100, height: 100, borderRadius: 'var(--radius-xl)', background: step.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, border: `2px solid ${step.light || step.bg}`, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
                      {step.img}
                    </div>
                    <div style={{ position: 'absolute', top: -8, right: -8, width: 28, height: 28, borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                      {step.num.slice(1)}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: '#14532d', marginBottom: 4 }}>{step.label}</h3>
                  <p style={{ fontFamily: 'var(--font-display)', color: step.color, fontWeight: 600, fontSize: 15, marginBottom: 10 }}>{step.labelHi}</p>
                  <p style={{ color: '#6b7280', fontSize: 14.5, lineHeight: 1.65 }}>{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="step-line" style={{ alignSelf: 'center', marginBottom: 60 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: '100px 24px', background: 'linear-gradient(135deg,#14532d 0%,#166534 40%,#15803d 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <Sparkles size={34} color="#86efac" />
          </div>
          <h2 className="reveal" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, color: '#fff', marginBottom: 14 }}>
            अभी शुरू करें · Join the Movement
          </h2>
          <p className="reveal" style={{ color: '#86efac', fontSize: 18, marginBottom: 10 }}>
            Thousands of farmers, students and families are already getting help.
          </p>
          <p className="reveal" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 40 }}>
            Thousands of farmers, students and families are already getting help.
          </p>
          <div className="reveal" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#fff', color: '#15803d',
                border: 'none', padding: '16px 44px', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s,box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 16px 50px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 40px rgba(0,0,0,0.2)'; }}
            >
              Get Started Free <Sparkles size={20} />
            </button>
            <button
              style={{
                background: 'transparent', color: '#fff',
                border: '2px solid rgba(255,255,255,0.4)', padding: '16px 36px', borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                transition: 'border-color 0.2s,background 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.7)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.4)'; e.currentTarget.style.background='transparent'; }}
            >
              <Phone size={18} /> Contact Us
            </button>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
            No credit card · No registration fees · Always free
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;