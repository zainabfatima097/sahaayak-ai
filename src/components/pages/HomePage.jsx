import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, Users, Sun, Heart, GraduationCap, Landmark, ArrowRight, 
  Play, Sparkles, ChevronRight, Award, Clock, Shield, TrendingUp,
  Zap, Globe, MessageCircle, Star, CheckCircle, Phone, Mail,
  MapPin, Calendar, DollarSign, Briefcase, UserCheck
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    'https://images.pexels.com/photos/17101963/pexels-photo-17101963.jpeg?w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/2443580/pexels-photo-2443580.jpeg?w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/11663024/pexels-photo-11663024.jpeg?w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/11133417/pexels-photo-11133417.jpeg?w=1920&h=1080&fit=crop'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-up, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const features = [
    { id: 'voice', icon: Mic, title: 'Voice First', description: 'Speak naturally in Hindi or English', color: 'from-purple-500 to-pink-500', iconBg: 'bg-purple-100', textColor: 'text-purple-600', stats: '10K+ queries/day' },
    { id: 'agriculture', icon: Sun, title: 'Agriculture', description: 'Weather, crop prices & farming tips', color: 'from-green-500 to-emerald-500', iconBg: 'bg-green-100', textColor: 'text-green-600', stats: '50K+ farmers' },
    { id: 'healthcare', icon: Heart, title: 'Healthcare', description: 'Health guidance & telemedicine', color: 'from-red-500 to-rose-500', iconBg: 'bg-red-100', textColor: 'text-red-600', stats: '24/7 support' },
    { id: 'education', icon: GraduationCap, title: 'Education', description: 'Scholarships & learning resources', color: 'from-blue-500 to-cyan-500', iconBg: 'bg-blue-100', textColor: 'text-blue-600', stats: '100+ courses' },
    { id: 'schemes', icon: Landmark, title: 'Govt Schemes', description: 'Welfare programs & benefits', color: 'from-yellow-500 to-orange-500', iconBg: 'bg-yellow-100', textColor: 'text-yellow-600', stats: '50+ schemes' },
    { id: 'community', icon: Users, title: 'Community', description: 'Connect with local support', color: 'from-orange-500 to-red-500', iconBg: 'bg-orange-100', textColor: 'text-orange-600', stats: '100+ villages' }
  ];

  const impactStats = [
    { icon: Users, value: '100K+', label: 'Active Users', color: 'from-blue-500 to-cyan-500', delay: 0 },
    { icon: MessageCircle, value: '1M+', label: 'Queries Answered', color: 'from-green-500 to-emerald-500', delay: 100 },
    { icon: Award, value: '50+', label: 'Govt Schemes', color: 'from-yellow-500 to-orange-500', delay: 200 },
    { icon: Globe, value: '20+', label: 'Languages', color: 'from-purple-500 to-pink-500', delay: 300 },
    { icon: Clock, value: '24/7', label: 'Support Available', color: 'from-red-500 to-rose-500', delay: 400 },
    { icon: Shield, value: '100%', label: 'Free Service', color: 'from-indigo-500 to-purple-500', delay: 500 }
  ];

  const testimonials = [
    {
      name: 'Ram Singh',
      role: 'Farmer, Uttar Pradesh',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'Sahaayak AI helped me get PM-KISAN benefits. The voice feature is so easy to use!',
      rating: 5,
      achievement: 'Received ₹6000 scheme benefit'
    },
    {
      name: 'Sneha Sharma',
      role: 'Student, Bihar',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      content: 'I found scholarship information easily. The app speaks in Hindi which helps my mother too!',
      rating: 5,
      achievement: 'Got education scholarship'
    },
    {
      name: 'Lakshmi Bai',
      role: 'Self-help Group, MP',
      image: 'https://randomuser.me/api/portraits/women/45.jpg',
      content: 'Healthcare information helped my family during emergency. Very grateful for this service!',
      rating: 5,
      achievement: 'Accessed emergency care'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImages[currentImageIndex]}
            alt="Rural India"
            className="w-full h-full object-cover"
            style={{ animation: 'kenBurns 20s ease-in-out infinite' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="animate-float inline-block mb-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-5 shadow-2xl">
              <Mic size={56} className="text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-slide-up">
            Sahaayak AI
          </h1>
          <p className="text-2xl text-green-200 mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            आपका मददगार
          </p>
          <p className="text-xl text-white/80 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Voice Assistant for Rural India
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 shadow-lg"
            >
              Get Started <Play size={18} />
            </button>
            <button className="bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-full font-semibold hover:bg-white/30 transition-all duration-300 inline-flex items-center gap-2 border border-white/30">
              Watch Demo <ArrowRight size={18} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">100K+</div>
              <div className="text-sm text-white/70">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">500+</div>
              <div className="text-sm text-white/70">Villages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">20+</div>
              <div className="text-sm text-white/70">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">24/7</div>
              <div className="text-sm text-white/70">Support</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Features Section - Modern Cards */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 rounded-full px-4 py-1 mb-4">
              <span className="text-green-600 text-sm font-semibold">✨ Our Services</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 scroll-reveal-up">
              Everything You Need in One Place
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto scroll-reveal-up">
              Voice-first assistance for agriculture, healthcare, education, and government schemes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                onClick={() => navigate('/login')}
                className="group cursor-pointer scroll-reveal-up"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                  <div className="p-8">
                    <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon size={32} className={feature.textColor} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-500 mb-4">{feature.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{feature.stats}</span>
                      <span className={`${feature.textColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                        <ChevronRight size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Section - Modern Stats Cards */}
      <div className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-200 rounded-full px-4 py-1 mb-4">
              <span className="text-green-700 text-sm font-semibold">📊 Our Impact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 scroll-reveal-up">
              Making a Difference in Rural India
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto scroll-reveal-up">
              Real impact on the ground with measurable results
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 scroll-reveal-up"
                style={{ transitionDelay: `${stat.delay}ms` }}
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <stat.icon size={32} className="text-white" />
                </div>
                <div className="text-4xl font-bold text-gray-800 mb-2">{stat.value}</div>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 rounded-full px-4 py-1 mb-4">
              <span className="text-blue-600 text-sm font-semibold">🚀 How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 scroll-reveal-up">
              Simple Steps to Get Started
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto scroll-reveal-up">
              Just three simple steps to access all services
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-around items-center gap-8">
            <div className="text-center scroll-reveal-up" style={{ transitionDelay: '0s' }}>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-6 group-hover:rotate-0 transition-transform">
                  <span className="text-4xl text-white">1️⃣</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              </div>
              <p className="font-bold text-gray-800 text-lg mt-4">Press Mic</p>
              <p className="text-gray-500">माइक दबाएं</p>
            </div>
            <ChevronRight size={40} className="text-green-500 hidden md:block animate-pulse" />
            <div className="text-center scroll-reveal-up" style={{ transitionDelay: '0.2s' }}>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform">
                  <span className="text-4xl text-white">2️⃣</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              </div>
              <p className="font-bold text-gray-800 text-lg mt-4">Speak</p>
              <p className="text-gray-500">बोलें</p>
            </div>
            <ChevronRight size={40} className="text-green-500 hidden md:block animate-pulse" />
            <div className="text-center scroll-reveal-up" style={{ transitionDelay: '0.4s' }}>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="text-4xl text-white">3️⃣</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              </div>
              <p className="font-bold text-gray-800 text-lg mt-4">Get Answer</p>
              <p className="text-gray-500">जवाब पाएं</p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-yellow-100 rounded-full px-4 py-1 mb-4">
              <span className="text-yellow-600 text-sm font-semibold">⭐ Testimonials</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 scroll-reveal-up">
              What Our Users Say
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto scroll-reveal-up">
              Trusted by rural communities across India
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 scroll-reveal-up"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-gray-800">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-3">"{testimonial.content}"</p>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <CheckCircle size={14} className="text-green-500" />
                  <p className="text-xs text-green-600">{testimonial.achievement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Highlight Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-reveal-left">
              <div className="inline-block bg-green-100 rounded-full px-4 py-1 mb-4">
                <span className="text-green-600 text-sm font-semibold">🌟 Why Choose Us</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Empowering Rural Communities Through Technology
              </h2>
              <p className="text-gray-500 mb-6">
                Sahaayak AI bridges the digital divide by providing voice-first assistance in local languages, making essential services accessible to everyone.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700">Voice-first interface in 20+ languages</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700">Offline access to cached information</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700">100% free with no hidden costs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-600" />
                  </div>
                  <span className="text-gray-700">24/7 support and emergency helplines</span>
                </div>
              </div>
            </div>
            <div className="scroll-reveal-right">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-8 text-white">
                <Zap size={48} className="mb-4" />
                <h3 className="text-2xl font-bold mb-2">Coming Soon!</h3>
                <p className="text-green-100 mb-4">Exciting new features on the way</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">• Offline-first architecture</li>
                  <li className="flex items-center gap-2">• AI-powered scheme recommendations</li>
                  <li className="flex items-center gap-2">• Real-time weather alerts for farmers</li>
                  <li className="flex items-center gap-2">• Community support forums</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 scroll-reveal-up">
              Ready to Transform Your Life?
            </h2>
            <p className="text-green-100 text-lg mb-8 scroll-reveal-up">
              Join thousands of rural citizens accessing government services with just a tap
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-green-700 px-10 py-4 rounded-full font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Get Started Now <Sparkles size={18} />
              </button>
              <button className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold hover:bg-white/10 transition-all duration-300 inline-flex items-center justify-center gap-2">
                Contact Sales <Phone size={18} />
              </button>
            </div>
            <p className="text-green-200 text-sm mt-8">
              No credit card required • Free forever • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;