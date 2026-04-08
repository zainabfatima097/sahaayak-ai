import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { OfflineProvider } from './context/OfflineContext';
import HomePage from './components/pages/HomePage';
import LoginPage from './components/pages/LoginPage';
import ChatPage from './components/pages/ChatPage';
import AgriculturePage from './components/pages/AgriculturePage';
import HealthcarePage from './components/pages/HealthcarePage';
import EducationPage from './components/pages/EducationPage';
import SchemesPage from './components/pages/SchemesPage';
import ProfilePage from './components/pages/ProfilePage';
import OfflinePage from './components/pages/OfflinePage';

function App() {
  return (
    <UserProvider>
      <OfflineProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/agriculture" element={<AgriculturePage />} />
            <Route path="/healthcare" element={<HealthcarePage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/schemes" element={<SchemesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/offline" element={<OfflinePage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </OfflineProvider>
    </UserProvider>
  );
}

export default App;