import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { OfflineProvider } from './context/OfflineContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import ChatPage from './components/pages/ChatPage';
import AgriculturePage from './components/pages/AgriculturePage';
import HealthcarePage from './components/pages/HealthcarePage';
import EducationPage from './components/pages/EducationPage';
import SchemesPage from './components/pages/SchemesPage';
import StoriesPage from './components/pages/StoriesPage';  // NEW
import StoryDetailPage from './components/pages/StoryDetailPage';
import ProfilePage from './components/pages/ProfilePage';
import OfflinePage from './components/pages/OfflinePage';
import { db, collection, addDoc } from './components/services/firebase/config';

const TestFirebase = () => {
  useEffect(() => {
    const testFirebase = async () => {
      try {
        const testRef = collection(db, 'test_connection');
        await addDoc(testRef, {
          message: 'Firebase is working!',
          timestamp: new Date()
        });
        console.log('✅ Firebase connected successfully!');
      } catch (error) {
        console.error('❌ Firebase connection error:', error);
      }
    };
    testFirebase();
  }, []);
  
  return null;
};

function App() {
  return (
    <ThemeProvider>
    <UserProvider>
      <OfflineProvider>
        <Router future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <TestFirebase />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/agriculture" element={<AgriculturePage />} />
            <Route path="/healthcare" element={<HealthcarePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/stories" element={<StoriesPage />} />  {/* NEW */}
            <Route path="/story/:storyId" element={<StoryDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </OfflineProvider>
    </UserProvider>
    </ThemeProvider>
  );
}

export default App;