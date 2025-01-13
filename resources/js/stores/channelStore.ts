import { Message, User, Reaction } from '@/types/slack';
import { create } from 'zustand';
import axios from 'axios';

export interface ChannelState {
    scrollContainer: React.RefObject<HTMLDivElement> | null;
    setScrollContainer: (ref: React.RefObject<HTMLDivElement>) => void;

    showIndicator: boolean;
    setIndicator: (isVisible: boolean) => void;

    messages: Message[];
    loadMessages: (id: number) => Promise<void>;
    addMessage: (message: Message, shouldScroll: boolean) => void;
    updateReaction: (messageId: number, user: User, emojiCode: string) => void;
}

export const useChannelStore = create<ChannelState>((set, get): ChannelState => ({
    scrollContainer: null,
    setScrollContainer: (ref) => set({ scrollContainer: ref }),

    showIndicator: false,
    setIndicator: (isVisible: boolean) => set({ showIndicator: isVisible }),

    messages: [],
    loadMessages: async (channelId: number) => {
        set({ messages: [] });

        try {
            const response = await axios.get(route('messages.index', { channelId }));
            const rawMessages = response.data.data.messages;

            // Process messages to add continuation flags
            const messages = [...rawMessages]
                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                .map((msg, idx, arr) => {
                    const prevMsg = arr[idx - 1];
                    const isContinuation = prevMsg && msg.user.id === prevMsg.user.id;
                    return { ...msg, isContinuation };
                })
                .reverse();

            set({ messages });
        } catch (error) {
            console.error('Failed to load messages:', error);
            set({ messages: [] });
        }
    },

    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state) => {
            const [prevMessage] = state.messages;

            const newMessage = {
                ...message,
                isContinuation: prevMessage ? message.user.id === prevMessage.user.id : false
            };

            return {
                messages: [newMessage, ...state.messages],
                showIndicator: !shouldScroll
            };
        });

        if (!shouldScroll) {
            setTimeout(() => {
                get().setIndicator(false);
            }, 3000);
        }
    },

    updateReaction: (messageId: number, user: User, emojiCode: string) => {
        set((state) => ({
            messages: state.messages.map(msg => {
                if (msg.id !== messageId) return msg;

                const reactions = [...(msg.reactions || [])];
                const existingIndex = reactions.findIndex(r => r.user.id === user.id);

                if (emojiCode === '') {
                    if (existingIndex > -1) reactions.splice(existingIndex, 1);
                } else if (existingIndex === -1) {
                    reactions.push({ user, emoji_code: emojiCode });
                } else {
                    reactions[existingIndex].emoji_code = emojiCode;
                }

                return { ...msg, reactions };
            })
        }));
    }
})); 