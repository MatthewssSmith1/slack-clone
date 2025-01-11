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
    const { message, isSubmitting } = get();
    if (!message.trim() || isSubmitting) return;

    set({ isSubmitting: true });
    try {
      const response = await axios.post<Message>(
        route('messages.store', channelId),
        { content: message }
      );

      useMessageStore.getState().addMessage(response.data, true);
      set({ message: '', isSubmitting: false });
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isSubmitting: false });
    }
  }
})); 