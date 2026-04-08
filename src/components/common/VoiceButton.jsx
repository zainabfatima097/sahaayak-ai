import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const VoiceButton = ({ onResult, onError, language = 'hi-IN' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      onError?.('Voice input is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language;
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice input:', transcript);
      onResult?.(transcript);
      setIsListening(false);
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      onError?.(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);
  }, [language, onResult, onError]);

  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        onError?.('Please allow microphone access to use voice input');
      }
    }
  };

  if (!isSupported) {
    return (
      <button 
        className="w-12 h-12 rounded-full bg-gray-300 cursor-not-allowed flex items-center justify-center shadow-md"
        disabled
      >
        <MicOff size={20} className="text-gray-500" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleListening}
      className={`relative group transition-all duration-300 transform hover:scale-110 active:scale-95 ${
        isListening ? 'animate-pulse' : ''
      }`}
      aria-label={isListening ? 'Listening...' : 'Click to speak'}
    >
      {/* Outer ring animation when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping"></span>
          <span className="absolute inset-0 rounded-full bg-green-300 opacity-50 animate-pulse"></span>
        </>
      )}
      
      {/* Main button - Green circle with white mic */}
      <div className={`relative w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg flex items-center justify-center transition-all duration-300 ${
        isListening ? 'shadow-xl ring-4 ring-green-300 ring-opacity-50' : 'hover:shadow-xl'
      }`}>
        {isListening ? (
          <Loader size={22} className="text-white animate-spin" />
        ) : (
          <Mic size={22} className="text-white" />
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {isListening ? 'Listening...' : 'Voice Input'}
        </div>
      </div>
    </button>
  );
};

export default VoiceButton;