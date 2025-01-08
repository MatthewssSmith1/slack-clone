import { create } from 'zustand';
import { Message } from '@/lib/utils';
import axios from 'axios';

interface MessageState {
    message: string;
    isSubmitting: boolean;
    localMessages: Message[];
    showNewMsgIndicator: boolean;
    setMessage: (message: string) => void;
    setLocalMessages: (messages: Message[]) => void;
    addMessage: (message: Message, shouldScroll: boolean) => void;
    hideNewMsgIndicator: () => void;
    sendMessage: (channelId: number) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get): MessageState => ({
    message: '',
    isSubmitting: false,
    localMessages: [],
    showNewMsgIndicator: false,
    
    setMessage: (message: string) => set({ message }),
    
    setLocalMessages: (messages: Message[]) => set({ 
        localMessages: [...messages].reverse(),
        showNewMsgIndicator: false 
    }),
    
    hideNewMsgIndicator: () => set({ showNewMsgIndicator: false }),
    
    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state: MessageState) => ({ 
            localMessages: [message, ...state.localMessages],
            showNewMsgIndicator: !shouldScroll
        }));

        if (!shouldScroll) {
            setTimeout(() => {
                get().hideNewMsgIndicator();
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

            get().addMessage(response.data, true);
            set({ message: '', isSubmitting: false });
        } catch (error) {
            console.error('Failed to send message:', error);
            set({ isSubmitting: false });
        }
    }
})); 