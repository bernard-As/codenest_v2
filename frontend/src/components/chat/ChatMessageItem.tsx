// frontend/src/components/chat/ChatMessageItem.tsx
import React from 'react';
import type { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { UserCircleIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { Link as RouterLink } from 'react-router-dom'; // For internal navigation

interface ChatMessageItemProps {
  message: ChatMessage;
}

// Function to parse and render message text with special links
const renderMessageText = (text: string): React.ReactNode => {
  // Regex to find @@LINK[display text](url)@@
  const linkRegex = /@@LINK\[(.*?)\]\((.*?)\)@@/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const displayText = match[1];
    const url = match[2];

    // Check if it's an internal CodeNest route or an external/PDF link
    if (url.startsWith('/')) { // Assume internal routes start with /
      parts.push(
        <RouterLink key={match.index} to={url} className="text-blue-400 dark:text-blue-300 hover:underline font-semibold">
          {displayText}
        </RouterLink>
      );
    } else { // External or PDF link
      parts.push(
        <a
          key={match.index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 dark:text-blue-300 hover:underline font-semibold"
        >
          {displayText}
        </a>
      );
    }
    lastIndex = linkRegex.lastIndex;
  }

  // Add any remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>) : text;
};


const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: isUser ? 10 : -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn('flex mb-3 items-end', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <CpuChipIcon className="w-7 h-7 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" />
      )}
      <div
        className={cn(
          'max-w-[70%] p-3 rounded-xl break-words text-sm md:text-base',
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none',
          message.error ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border border-red-400 dark:border-red-600' : ''
        )}
      >
        {renderMessageText(message.text)} {/* Use the renderer here */}
      </div>
      {isUser && (
        <UserCircleIcon className="w-7 h-7 text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0" />
      )}
    </motion.div>
  );
};

export default ChatMessageItem;