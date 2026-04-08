import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Users, Sun, Heart, GraduationCap, Landmark, ArrowRight, Play, Sparkles } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Placeholder images using reliable CDN
  const images = {
    farmer: "https://picsum.photos/id/264/800/500",
    children: "https://picsum.photos/id/20/800/500",
    village: "https://picsum.photos/id/15/800/500",
    healthcare: "https://picsum.photos/id/116/800/500",
    education: "https://picsum.photos/id/30/800/500",
    farming: "https://picsum.photos/id/276/800/500"
  };

  const features = [
    { id: 'voice', icon: Mic, title: 'बोलकर पूछें', titleEn: 'Ask by Voice', color: 'from-purple-500 to-pink-500', delay: 0, action: () => navigate('/login') },
    { id: 'agriculture', icon: Sun, title: 'खेती', titleEn: 'Farming', color: 'from-green-500 to-emerald-500', delay: 100, action: () => navigate('/login') },
    { id: 'healthcare', icon: Heart, title: 'स्वास्थ्य', titleEn: 'Health', color: 'from-red-500 to-rose-500', delay: 200, action: () => navigate('/login') },
    { id: 'education', icon: GraduationCap, title: 'शिक्षा', titleEn: 'Education', color: 'from-blue-500 to-cyan-500', delay: 300, action: () => navigate('/login') },
    { id: 'schemes', icon: Landmark, title: 'योजनाएं', titleEn: 'Schemes', color: 'from-yellow-500 to-orange-500', delay: 400, action: () => navigate('/login') },
    { id: 'community', icon: Users, title: 'समुदाय', titleEn: 'Community', color: 'from-orange-500 to-red-500', delay: 500, action: () => navigate('/login') }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Clean, no green banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block mb-6 animate-float">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-5 shadow-xl">
              <Mic size={56} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4 animate-slide-up">
            Sahaayak AI
          </h1>
          <p className="text-2xl text-green-600 mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            आपका मददगार
          </p>
          <p className="text-gray-500 text-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Voice Assistant for Rural India
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-8 bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            Get Started <Play size={18} />
          </button>
        </div>
      </div>

      {/* Image Section 1 - Farmer with Ken Burns Effect */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12 scroll-reveal-left">
          <div className="md:w-1/2 overflow-hidden rounded-2xl shadow-2xl image-zoom">
            <img 
              src={images.farmer}
              alt="Indian Farmer"
              className="w-full h-96 object-cover animate-ken-burns"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-block bg-green-100 rounded-full px-4 py-1 mb-4">
              <span className="text-green-600 text-sm font-semibold">🌾 किसान सहायता</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Farmers First</h2>
            <p className="text-gray-600 text-lg mb-6">Get real-time weather updates, crop advisory, MSP rates, and government schemes tailored for farmers.</p>
            <button 
              onClick={() => navigate('/login')}
              className="text-green-600 font-semibold hover:text-green-700 inline-flex items-center gap-2"
            >
              Learn More <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Image Section 2 - Children with Parallax */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12 scroll-reveal-right">
            <div className="md:w-1/2 overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={images.children}
                alt="Rural Children"
                className="w-full h-96 object-cover animate-parallax"
              />
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <div className="inline-block bg-blue-100 rounded-full px-4 py-1 mb-4">
                <span className="text-blue-600 text-sm font-semibold">📚 शिक्षा</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Education For All</h2>
              <p className="text-gray-600 text-lg mb-6">Free digital learning resources, scholarships, and skill development programs for rural students.</p>
              <button 
                onClick={() => navigate('/login')}
                className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-2"
              >
                Learn More <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Section 3 - Village with Ken Burns Right */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12 scroll-reveal-left">
          <div className="md:w-1/2 overflow-hidden rounded-2xl shadow-2xl">
            <img 
              src={images.village}
              alt="Rural Village"
              className="w-full h-96 object-cover animate-ken-burns-right"
            />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-block bg-orange-100 rounded-full px-4 py-1 mb-4">
              <span className="text-orange-600 text-sm font-semibold">🏡 ग्रामीण विकास</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Village Development</h2>
            <p className="text-gray-600 text-lg mb-6">Access government welfare schemes, healthcare facilities, and infrastructure information.</p>
            <button 
              onClick={() => navigate('/login')}
              className="text-orange-600 font-semibold hover:text-orange-700 inline-flex items-center gap-2"
            >
              Learn More <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4 scroll-reveal">
            Our Services
          </h2>
          <p className="text-center text-gray-500 mb-12 scroll-reveal">Voice-first assistance in your language</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {features.map((feature, index) => (
              <button
                key={feature.id}
                onClick={feature.action}
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 scroll-reveal"
                style={{ transitionDelay: `${feature.delay}ms` }}
              >
                <div className="p-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon size={28} className="text-white" />
                  </div>
                  <p className="font-bold text-gray-800">{feature.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{feature.titleEn}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 scroll-reveal">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row justify-around items-center gap-8">
            <div className="text-center scroll-reveal" style={{ transitionDelay: '0s' }}>
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <span className="text-3xl text-white">1️⃣</span>
              </div>
              <p className="font-bold text-gray-800 text-lg">Press Mic</p>
              <p className="text-gray-500">माइक दबाएं</p>
            </div>
            <ArrowRight size={40} className="text-green-500 hidden md:block animate-pulse" />
            <div className="text-center scroll-reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <span className="text-3xl text-white">2️⃣</span>
              </div>
              <p className="font-bold text-gray-800 text-lg">Speak</p>
              <p className="text-gray-500">बोलें</p>
            </div>
            <ArrowRight size={40} className="text-green-500 hidden md:block animate-pulse" />
            <div className="text-center scroll-reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-float">
                <span className="text-3xl text-white">3️⃣</span>
              </div>
              <p className="font-bold text-gray-800 text-lg">Get Answer</p>
              <p className="text-gray-500">जवाब पाएं</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4 scroll-reveal">
            Ready to Get Started?
          </h2>
          <p className="text-green-100 mb-8 text-lg scroll-reveal">
            Join thousands of rural citizens accessing government services
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="bg-white text-green-700 px-10 py-4 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105 inline-flex items-center gap-2 scroll-reveal"
          >
            Start Now <Sparkles size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;