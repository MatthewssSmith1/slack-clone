import { useChannelStore } from './channelStore';
import { create } from 'zustand';
import axios from 'axios';

interface NewMessageState {
  message: string;
  setMessage: (message: string) => void;
  sendMessage: (channelId: number) => Promise<void>;
  showRichText: boolean;
  setShowRichText: (show: boolean) => void;
}

export const useNewMessageStore = create<NewMessageState>((set, get) => ({
  message: '',

  setMessage: (message: string) => set({ message }),

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
      useChannelStore.getState().addMessage(response.data, true);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  showRichText: false,

  setShowRichText: (showRichText: boolean) => set({ showRichText }),
})); 