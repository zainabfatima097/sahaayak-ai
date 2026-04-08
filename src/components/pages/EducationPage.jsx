import React from 'react';
import ChatLayout from '../layout/ChatLayout';
import ChatInterface from '../chat/ChatInterface';

const EducationPage = () => {
  return (
    <ChatLayout domain="education">
      <ChatInterface domain="education" />
    </ChatLayout>
  );
};

export default EducationPage;