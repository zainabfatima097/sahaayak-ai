import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sprout, Heart, GraduationCap, Landmark, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/agriculture', icon: Sprout, label: 'Farming' },
    { path: '/healthcare', icon: Heart, label: 'Health' },
    { path: '/education', icon: GraduationCap, label: 'Education' },
    { path: '/schemes', icon: Landmark, label: 'Schemes' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
              }`
            }
          >
            <item.icon size={22} />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;