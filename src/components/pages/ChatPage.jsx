import React from 'react';
import ChatLayout from '../layout/ChatLayout';
import ChatInterface from '../chat/ChatInterface';

const ChatPage = () => {
  return (
    <ChatLayout domain="general">
      <ChatInterface domain="general" />
    </ChatLayout>
  );
};

export default ChatPage;