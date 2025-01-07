import { create, type StateCreator } from 'zustand';
import { Message } from '@/lib/utils';
import axios from 'axios';

interface MessageState {
    message: string;
    isSubmitting: boolean;
    localMessages: Message[];
    showNewMessageIndicator: boolean;
    setMessage: (message: string) => void;
    setLocalMessages: (messages: Message[]) => void;
    addMessage: (message: Message, shouldScroll: boolean) => void;
    hideNewMessageIndicator: () => void;
    sendMessage: (channelId: number) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get): MessageState => ({
    message: '',
    isSubmitting: false,
    localMessages: [],
    showNewMessageIndicator: false,
    
    setMessage: (message: string) => set({ message }),
    
    setLocalMessages: (messages: Message[]) => set({ 
        localMessages: [...messages].reverse(),
        showNewMessageIndicator: false 
    }),
    
    hideNewMessageIndicator: () => set({ showNewMessageIndicator: false }),
    
    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state: MessageState) => ({ 
            localMessages: [message, ...state.localMessages],
            showNewMessageIndicator: !shouldScroll
        }));

        // Hide indicator after 3 seconds if it was shown
        if (!shouldScroll) {
            setTimeout(() => {
                get().hideNewMessageIndicator();
            }, 3000);
        }
    },

    sendMessage: async (channelId: number) => {
        const { message, isSubmitting } = get();
        if (!message.trim() || isSubmitting) return;

        set({ isSubmitting: true });
        try {
            const response = await axios.post<Message>(
                route('messages.store', channelId), 
                { content: message }
            );

            // When sending our own message, we always want to scroll
            get().addMessage(response.data, true);
            set({ message: '', isSubmitting: false });
        } catch (error) {
            console.error('Failed to send message:', error);
            set({ isSubmitting: false });
        }
    }
})); 