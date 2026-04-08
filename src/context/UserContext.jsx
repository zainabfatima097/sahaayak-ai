import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUserProfile, saveUserProfile } from '../components/services/offline/indexedDB';

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userContext, setUserContext] = useState({
    userId: null,
    name: '',
    location: 'rural',
    occupation: 'farmer',
    income_level: 'below_poverty_line',
    language: 'Hindi',
    literacy_level: 'basic',
    voice_preferred: true,
    isAuthenticated: false,
    isGuest: false,
    authMethod: null,
    phoneNumber: null,
    email: null
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const profile = await getUserProfile('sahaayak_user');
    if (profile) {
      setUserContext(profile);
    }
  };

  const updateUserContext = async (updates) => {
    const newContext = { ...userContext, ...updates };
    setUserContext(newContext);
    await saveUserProfile('sahaayak_user', newContext);
  };

  return (
    <UserContext.Provider value={{ userContext, updateUserContext }}>
      {children}
    </UserContext.Provider>
  );
};