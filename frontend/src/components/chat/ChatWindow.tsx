// frontend/src/components/chat/ChatWindow.tsx
import React, { useState, useRef, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { chatStore } from '../../stores';
import ChatMessageItem from './ChatMessageItem';
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import CpuChipIcon from '@heroicons/react/24/outline/CpuChipIcon';

const ChatWindow: React.FC = observer(() => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null); // For auto-scrolling

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatStore.messages]); // Scroll on new messages

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !chatStore.isLoadingReply) {
      chatStore.sendMessage(inputText);
      setInputText('');
    }
  };

  if (!chatStore.isOpen) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "circOut" }}
      className="fixed bottom-20 right-6 z-[99] w-[90vw] max-w-md h-[70vh] max-h-[550px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
        <h3 className="text-md font-semibold text-gray-800 dark:text-black">CodeNest AI Assistant</h3>
        <div className="flex items-center space-x-2">
            <button
                onClick={chatStore.clearChat}
                title="Clear Chat"
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                disabled={chatStore.isLoadingReply}
            >
                <ArrowPathIcon className="w-5 h-5"/>
            </button>
            <button
                onClick={chatStore.toggleChat}
                title="Close Chat"
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /> {/* ChevronDown or XMark */}
                </svg>
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow p-4 overflow-y-auto space-y-1">
        <AnimatePresence initial={false}> {/* Manages exit animations for messages */}
          {chatStore.messages.map((msg:any) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
        </AnimatePresence>
        {chatStore.isLoadingReply && (
          <motion.div layout className="flex justify-start items-end mb-3">
             <CpuChipIcon className="w-7 h-7 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0" />
             <div className="max-w-[70%] p-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none">
                <div className="flex items-center space-x-1">
                   <span className="text-sm">Typing</span>
                   <div className="typing-indicator"><span></span><span></span><span></span></div>
                </div>
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} /> {/* Anchor for scrolling */}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
        {chatStore.error && !chatStore.isLoadingReply && (
            <p className="text-xs text-red-500 mb-1 px-1">{chatStore.error}</p>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about CodeNest or academics..."
            className="flex-grow p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={chatStore.isLoadingReply}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={chatStore.isLoadingReply || !inputText.trim()}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
});

export default ChatWindow;