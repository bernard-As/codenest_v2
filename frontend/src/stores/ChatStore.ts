// frontend/src/stores/ChatStore.ts
import { makeAutoObservable, runInAction } from 'mobx';
import type { ChatMessage, ChatHistoryEntry } from '../types/chat';
import { chatService } from '../services/chatService'; // Create this service
import { v4 as uuidv4 } from 'uuid'; // npm install uuid @types/uuid

const MAX_HISTORY_LENGTH = 10; // Max number of (user + bot) message pairs to send as history

class ChatStore {
  isOpen: boolean = false;
  messages: ChatMessage[] = [];
  isLoadingReply: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    // Optionally load chat history from localStorage if you want persistence
  }

  toggleChat = () => {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
        // Add an initial greeting from the bot
        this.addMessage({
            id: uuidv4(),
            text: "Hello! I'm CodeNest AI. How can I assist you today with your academic or technical queries?",
            sender: 'bot',
            timestamp: new Date(),
        });
    }
  };

  addMessage = (message: ChatMessage) => {
    this.messages.push(message);
    // Optionally save to localStorage
  };

  sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    this.addMessage(userMessage);
    this.isLoadingReply = true;
    this.error = null;

    // Prepare chat history to send to the backend
    // Send last N messages (user and bot)
    const historyToSend: ChatHistoryEntry[] = this.messages
        .slice(-MAX_HISTORY_LENGTH * 2) // Approx last N pairs
        .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'model' as const,
            text: msg.text
        }))
        // Remove the current user message from history as it's sent as 'message'
        .filter((_, index, arr) => index < arr.length -1);


    try {
      const botReplyText = await chatService.sendMessageToBot(text, historyToSend);
      const botMessage: ChatMessage = {
        id: uuidv4(),
        text: botReplyText,
        sender: 'bot',
        timestamp: new Date(),
      };
      runInAction(() => {
        this.addMessage(botMessage);
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage = err.response?.data?.error || err.message || "Sorry, I couldn't get a response.";
      runInAction(() => {
        this.error = errorMessage;
        this.addMessage({ // Add an error message to the chat UI
            id: uuidv4(),
            text: `Error: ${errorMessage}`,
            sender: 'bot',
            timestamp: new Date(),
            error: errorMessage
        });
      });
    } finally {
      runInAction(() => {
        this.isLoadingReply = false;
      });
    }
  };

  clearChat = () => {
    this.messages = [];
    // Add initial greeting again
    this.addMessage({
        id: uuidv4(),
        text: "Hello! I'm CodeNest AI. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date(),
    });
    this.error = null;
    // Optionally clear localStorage
  }
}

export default ChatStore;