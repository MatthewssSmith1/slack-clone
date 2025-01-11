import { Message } from '@/types/slack';
import { create } from 'zustand';
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
    
    setLocalMessages: (messages: Message[]) => {
        const processedMessages = [...messages]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((msg, idx, arr) => {
                let isContinuation = false;

                if (idx > 0) {
                    const prevMsg = arr[idx - 1];
                    isContinuation = msg.user.id === prevMsg.user.id;
                }
                
                return {
                    ...msg,
                    isContinuation: isContinuation
                };
            })
            .reverse();

        set({ 
            localMessages: processedMessages,
            showNewMsgIndicator: false 
        });
    },
    
    hideNewMsgIndicator: () => set({ showNewMsgIndicator: false }),
    
    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state: MessageState) => {
            const [latestMessage] = state.localMessages;
            
            const timeDiff = latestMessage ? 
                (new Date(message.created_at).getTime() - new Date(latestMessage.created_at).getTime()) / 1000 : null;
            
            const sameUser = latestMessage ? message.user.id === latestMessage.user.id : false;
            const withinTimeLimit = timeDiff !== null && timeDiff < 300;

            const newMessage = { 
                ...message, 
                isContinuation: sameUser && withinTimeLimit 
            };
            
            return { 
                localMessages: [newMessage, ...state.localMessages],
                showNewMsgIndicator: !shouldScroll
            };
        });

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