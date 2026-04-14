import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ variant = 'floating', className = '' }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const floatingStyle = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 1000,
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: isDarkMode ? '#374151' : '#fff',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: isDarkMode ? '#fbbf24' : '#374151',
    transition: 'all 0.3s ease',
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={toggleTheme}
        style={floatingStyle}
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      className={className}
      title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;