import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  auth, 
  onAuthStateChanged, 
  signInWithGoogle, 
  signOutUser, 
  createUserProfile, 
  getUserProfile, 
  updateUserProfile 
} from '../components/services/firebase/config';
import { saveUserProfile, getUserProfile as getLocalProfile } from '../components/services/offline/indexedDB';

const UserContext = createContext(null);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userContext, setUserContext] = useState({
    uid: null,
    name: '',
    email: '',
    phone: '',
    location: 'rural',
    occupation: 'farmer',
    income_level: 'below_poverty_line',
    language: 'Hindi',
    literacy_level: 'basic',
    voice_preferred: true,
    isAuthenticated: false,
    isGuest: false,
    authMethod: null,
    isLoading: true
  });
  
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (initialLoadDone.current) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile.success) {
          setUserContext({
            uid: user.uid,
            name: profile.data.displayName || user.displayName || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            location: profile.data.location || 'rural',
            occupation: profile.data.occupation || 'farmer',
            income_level: profile.data.incomeLevel || 'below_poverty_line',
            language: profile.data.language || 'Hindi',
            voice_preferred: profile.data.voicePreferred !== false,
            isAuthenticated: true,
            isGuest: false,
            authMethod: 'firebase',
            isLoading: false
          });
        } else {
          await createUserProfile(user);
          setUserContext({
            uid: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            location: 'rural',
            occupation: 'farmer',
            income_level: 'below_poverty_line',
            language: 'Hindi',
            voice_preferred: true,
            isAuthenticated: true,
            isGuest: false,
            authMethod: 'firebase',
            isLoading: false
          });
        }
      } else {
        // Check local storage for guest user
        const localProfile = await getLocalProfile('sahaayak_user');
        if (localProfile && localProfile.isGuest) {
          setUserContext({
            ...localProfile,
            isLoading: false
          });
        } else {
          setUserContext({
            uid: null,
            name: '',
            email: '',
            phone: '',
            location: 'rural',
            occupation: 'farmer',
            income_level: 'below_poverty_line',
            language: 'Hindi',
            voice_preferred: true,
            isAuthenticated: false,
            isGuest: false,
            authMethod: null,
            isLoading: false
          });
        }
      }
      initialLoadDone.current = true;
    });

    return () => unsubscribe();
  }, []);

  const updateUserContext = async (updates) => {
    const newContext = { ...userContext, ...updates };
    
    if (userContext.isAuthenticated && userContext.uid) {
      await updateUserProfile(userContext.uid, {
        displayName: updates.name,
        location: updates.location,
        occupation: updates.occupation,
        incomeLevel: updates.income_level,
        language: updates.language,
        voicePreferred: updates.voice_preferred
      });
    }
    
    // Save locally for offline
    await saveUserProfile('sahaayak_user', newContext);
    setUserContext(newContext);
  };

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result.success) {
      await createUserProfile(result.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      setUserContext({
        uid: null,
        name: '',
        email: '',
        phone: '',
        location: 'rural',
        occupation: 'farmer',
        income_level: 'below_poverty_line',
        language: 'Hindi',
        voice_preferred: true,
        isAuthenticated: false,
        isGuest: false,
        authMethod: null,
        isLoading: false
      });
      await saveUserProfile('sahaayak_user', {
        isAuthenticated: false,
        isGuest: false
      });
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const value = {
    userContext,
    updateUserContext,
    handleGoogleLogin,
    handleLogout
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;