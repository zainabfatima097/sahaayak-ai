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
      <button className="voice-button bg-gray-400 cursor-not-allowed" disabled>
        <MicOff size={32} />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleListening}
      className={`voice-button ${isListening ? 'listening' : ''}`}
      aria-label={isListening ? 'Listening...' : 'Click to speak'}
    >
      {isListening ? <Loader size={32} className="animate-spin" /> : <Mic size={32} />}
    </button>
  );
};

export default VoiceButton;