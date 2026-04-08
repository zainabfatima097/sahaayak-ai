import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { Mic, Mail, Phone, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { updateUserContext } = useUserContext();
  const [isLogin, setIsLogin] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleGoogleLogin = () => {
    // Firebase Google Auth will be integrated here
    updateUserContext({ isAuthenticated: true, authMethod: 'google' });
    navigate('/chat');
  };

  const handlePhoneSubmit = () => {
    if (!showOtpInput) {
      // Send OTP logic here
      setShowOtpInput(true);
    } else {
      // Verify OTP logic here
      updateUserContext({ isAuthenticated: true, authMethod: 'phone', phoneNumber });
      navigate('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block bg-green-600 rounded-full p-4 mb-4">
            <Mic size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sahaayak AI</h1>
          <p className="text-gray-600 mt-2">Sign in to continue</p>
        </div>

        {/* Toggle Login/Signup */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              isLogin ? 'bg-green-600 text-white' : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
              !isLogin ? 'bg-green-600 text-white' : 'text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg mb-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-gray-700">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* Phone Login */}
        <div className="space-y-3">
          <div className="relative">
            <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Mobile Number"
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>

          {showOtpInput && (
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-green-500"
              />
            </div>
          )}

          <button
            onClick={handlePhoneSubmit}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <span>{showOtpInput ? 'Verify & Login' : 'Send OTP'}</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Guest Access */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              updateUserContext({ isAuthenticated: true, isGuest: true });
              navigate('/chat');
            }}
            className="text-green-600 text-sm hover:underline"
          >
            Continue as Guest →
          </button>
        </div>

        {/* Info Text - Minimal */}
        <p className="text-xs text-gray-400 text-center mt-8">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default LoginPage;