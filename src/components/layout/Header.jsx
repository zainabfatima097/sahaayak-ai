import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Volume2, Eye, Type, Sun, Moon } from 'lucide-react';
import { useUserContext } from '../../context/UserContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const { userContext, updateUserContext } = useUserContext();

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast);
    document.body.classList.toggle('high-contrast');
  };

  const toggleLargeText = () => {
    setIsLargeText(!isLargeText);
    document.body.classList.toggle('large-text');
  };

  const changeLanguage = () => {
    const newLang = userContext.language === 'Hindi' ? 'English' : 'Hindi';
    updateUserContext({ language: newLang });
  };

  return (
    <header className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white p-1.5 rounded-full">
              <Volume2 size={20} className="text-green-700" />
            </div>
            <span className="font-bold text-lg">Sahaayak AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-green-200">Home</Link>
            <Link to="/agriculture" className="hover:text-green-200">Agriculture</Link>
            <Link to="/healthcare" className="hover:text-green-200">Healthcare</Link>
            <Link to="/education" className="hover:text-green-200">Education</Link>
            <Link to="/schemes" className="hover:text-green-200">Schemes</Link>
            <Link to="/profile" className="hover:text-green-200">Profile</Link>
          </div>

          {/* Accessibility Tools */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleLargeText}
              className="p-2 hover:bg-green-600 rounded-lg transition-colors"
              title="Toggle Large Text"
            >
              <Type size={18} />
            </button>
            <button
              onClick={toggleHighContrast}
              className="p-2 hover:bg-green-600 rounded-lg transition-colors"
              title="Toggle High Contrast"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={changeLanguage}
              className="px-3 py-1 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-500"
            >
              {userContext.language === 'Hindi' ? 'English' : 'हिंदी'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-green-600 rounded-lg"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-green-600">
            <div className="flex flex-col space-y-2">
              <Link to="/" className="py-2 px-3 hover:bg-green-600 rounded" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/agriculture" className="py-2 px-3 hover:bg-green-600 rounded" onClick={() => setIsMenuOpen(false)}>Agriculture</Link>
              <Link to="/healthcare" className="py-2 px-3 hover:bg-green-600 rounded" onClick={() => setIsMenuOpen(false)}>Healthcare</Link>
              <Link to="/education" className="py-2 px-3 hover:bg-green-600 rounded" onClick={() => setIsMenuOpen(false)}>Education</Link>
              <Link to="/schemes" className="py-2 px-3 hover:bg-green-600 rounded" onClick={() => setIsMenuOpen(false)}>Schemes</Link>
              <Link to="/profile" className="py-2 px-3 hover:bg-green-600 rounded" onClick={() => setIsMenuOpen(false)}>Profile</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;