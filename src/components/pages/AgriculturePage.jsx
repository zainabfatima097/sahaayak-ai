import ChatLayout from '../layout/ChatLayout';
import ChatInterface from '../chat/ChatInterface';

const AgriculturePage = () => {
  return (
    <ChatLayout domain="agriculture">
      <ChatInterface domain="agriculture" />
    </ChatLayout>
  );
};

export default AgriculturePage;