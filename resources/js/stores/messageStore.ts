import { Message } from '@/types/slack';
import { create } from 'zustand';
import axios from 'axios';

interface MessageState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    showNewMsgIndicator: boolean;
    loadChannelMessages: (channelId: number) => Promise<void>;
    addMessage: (message: Message, shouldScroll: boolean) => void;
    hideNewMsgIndicator: () => void;
}

export const useMessageStore = create<MessageState>((set, get): MessageState => ({
    messages: [],
    isLoading: false,
    error: null,
    showNewMsgIndicator: false,

    loadChannelMessages: async (channelId: number) => {
        set({ isLoading: true, error: null });
        
        try {
            const response = await axios.get<{ data: { messages: Message[] } }>(`/channels/${channelId}/messages`);
            const rawMessages = response.data.data.messages;

            // Process messages to add continuation flags
            const processedMessages = [...rawMessages]
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((msg, idx, arr) => {
                    const prevMsg = arr[idx - 1];
                    const isContinuation = prevMsg && msg.user.id === prevMsg.user.id;
                    return { ...msg, isContinuation };
                })
                .reverse();

            set({ messages: processedMessages });
        } catch (error) {
            console.error('Failed to load messages:', error);
            set({ error: 'Failed to load messages', messages: [] });
        } finally {
            set({ isLoading: false });
        }
    },

    hideNewMsgIndicator: () => set({ showNewMsgIndicator: false }),

    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state) => {
            const [latestMessage] = state.messages;

            const timeDiff = latestMessage ?
                (new Date(message.created_at).getTime() - new Date(latestMessage.created_at).getTime()) / 1000 : null;

            const sameUser = latestMessage ? message.user.id === latestMessage.user.id : false;
            const withinTimeLimit = timeDiff !== null && timeDiff < 300;

            const newMessage = {
                ...message,
                isContinuation: sameUser && withinTimeLimit
            };

            return {
                messages: [newMessage, ...state.messages],
                showNewMsgIndicator: !shouldScroll
            };
        });

        if (!shouldScroll) {
            setTimeout(() => {
                get().hideNewMsgIndicator();
            }, 3000);
        }
    }
})); 