import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Shield, Smartphone, ChevronRight } from 'lucide-react';

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

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const result = await handleGoogleLogin();
    if (result.success) {
      navigate('/chat');
    } else {
      alert('Login failed: ' + result.error);
    }
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate email login - In production, connect to Firebase Email/Password auth
    setTimeout(() => {
      updateUserContext({ 
        isAuthenticated: true, 
        authMethod: 'email', 
        email,
        name: name || email.split('@')[0]
      });
      navigate('/chat');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-slide-up">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4 mb-4 shadow-xl animate-float">
            <img src="https://img.icons8.com/fluency/48/microphone.png" alt="Mic" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Sahaayak AI
          </h1>
          <p className="text-gray-500 mt-2">{isLogin ? 'Welcome back!' : 'Create your account'}</p>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 mb-8 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 transform ${
              isLogin 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md scale-105' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 transform ${
              !isLogin 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md scale-105' 
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl mb-4 flex items-center justify-center gap-3 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-medium">Continue with Google</span>
          <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white text-gray-400">or continue with email</span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative group">
            <Mail size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              required
            />
          </div>

          <div className="relative group">
            <Lock size={18} className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isLogin && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Login' : 'Create Account'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Guest Access */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              updateUserContext({ isAuthenticated: true, isGuest: true, name: 'Guest User' });
              navigate('/chat');
            }}
            className="text-green-600 text-sm hover:text-green-700 transition-colors inline-flex items-center gap-1 group"
          >
            <span>Continue as Guest</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Features List */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield size={14} className="text-green-500" />
              <span>Secure Login</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Smartphone size={14} className="text-green-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Terms & Privacy */}
        <p className="text-xs text-gray-400 text-center mt-6">
          By continuing, you agree to our <button className="text-green-600 hover:underline">Terms</button> & 
          {' '}<button className="text-green-600 hover:underline">Privacy Policy</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;