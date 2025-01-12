import { create } from 'zustand';
import { useMessageStore } from './messageStore';
import axios from 'axios';
import { Message } from '@/types/slack';

interface MessageInputState {
  message: string;
  isSubmitting: boolean;
  showRichText: boolean;
  setMessage: (message: string) => void;
  setShowRichText: (show: boolean) => void;
  sendMessage: (channelId: number) => Promise<void>;
}

export const useMessageInputStore = create<MessageInputState>((set, get) => ({
  message: '',
  isSubmitting: false,
  showRichText: false,

  setMessage: (message: string) => set({ message }),

  setShowRichText: (show: boolean) => set({ showRichText: show }),

  sendMessage: async (channelId: number) => {
    const content = get().message.trim();
    if (!content) return;

    try {
      const response = await axios.post(
        route('messages.store'),
        {
          content,
          channelId
        }
      );

      set({ message: '' });
      useMessageStore.getState().addMessage(response.data, true);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }
})); 