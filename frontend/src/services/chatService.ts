// frontend/src/services/chatService.ts
import apiClient from './apiClient';
import type { ChatHistoryEntry } from '../types/chat';

interface BotResponse {
  reply: string;
}

const sendMessageToBot = async (message: string, history: ChatHistoryEntry[]): Promise<string> => {
  try {
    const response = await apiClient.post<BotResponse>('/ai/chat/gemini/', { message, history });
    return response.data.reply;
  } catch (error: any) {
    // Let the store handle detailed error presentation
    console.error("Error sending message to bot service:", error.response?.data || error.message);
    throw error; // Re-throw to be caught by the store
  }
};

export const chatService = {
  sendMessageToBot,
};