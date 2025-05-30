// frontend/src/components/chat/ChatIcon.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { chatStore } from '../../stores';
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from '@heroicons/react/24/solid'; // Or other suitable icons
import { motion } from 'framer-motion';

const ChatIcon: React.FC = observer(() => {
  return (
    <motion.button
      onClick={chatStore.toggleChat}
      className="fixed bottom-6 right-6 z-[100] bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={chatStore.isOpen ? "Close chat" : "Open chat"}
    >
      {chatStore.isOpen ? (
        <XMarkIcon className="w-7 h-7" />
      ) : (
        <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />
      )}
    </motion.button>
  );
});

export default ChatIcon;