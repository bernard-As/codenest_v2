// frontend/src/types/chat.ts
export interface ChatMessage {
  id: string; // Unique ID for each message (e.g., UUID)
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean; // For bot messages that are being generated
  error?: string; // For error messages from the bot
}

export interface ChatHistoryEntry { // For sending to backend
    role: 'user' | 'model'; // 'model' for bot replies
    text: string;
}