import ChatLayout from '../layout/ChatLayout';
import ChatInterface from '../chat/ChatInterface';

const HealthcarePage = () => {
  return (
    <ChatLayout domain="healthcare">
      <ChatInterface domain="healthcare" />
    </ChatLayout>
  );
};

export default HealthcarePage;