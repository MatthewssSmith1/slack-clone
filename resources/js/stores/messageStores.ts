import { Message } from '@/types/slack';
import { create } from 'zustand';
import axios from 'axios';

export interface MessagesState {
    isThread: boolean;

    scrollContainer: React.RefObject<HTMLDivElement> | null;
    setScrollContainer: (ref: React.RefObject<HTMLDivElement>) => void;

    showIndicator: boolean;
    setIndicator: (isVisible: boolean) => void;

    messages: Message[] | null;
    loadMessages: (channelId: number, parentId?: number) => Promise<void>;
    addMessage: (message: Message, shouldScroll: boolean) => void;
    updateReaction: (messageId: number, userId: number, emojiCode: string) => void;
}

const createMessagesStore = (isThread: boolean) => create<MessagesState>((set, get): MessagesState => ({
    isThread,

    scrollContainer: null,
    setScrollContainer: (ref) => set({ scrollContainer: ref }),

    showIndicator: false,
    setIndicator: (isVisible: boolean) => set({ showIndicator: isVisible }),

    messages: null,
    loadMessages: async (channelId: number, parentId?: number) => {
        try {
            const response = await axios.get(route('messages.index', { channelId, parentId }));
            set({ messages: response.data.data.messages });
        } catch (error) {
            set({ messages: [] });
            throw error;
        }
    },

    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state) => {
            if (!state.messages) return state;

            const [prevMessage] = state.messages;
            message.isContinuation = prevMessage ? message.user.id === prevMessage.user.id : false;

            return {
                messages: [message, ...state.messages],
                showIndicator: !shouldScroll
            };
        });

        if (!shouldScroll) {
            setTimeout(() => {
                get().setIndicator(false);
            }, 3000);
        }
    },

    updateReaction: (messageId: number, userId: number, emojiCode: string) => {
        set((state) => {
            if (!state.messages) return state;

            return {
                messages: state.messages.map(msg => {
                    if (msg.id !== messageId) return msg;

                    const reactions = [...(msg.reactions || [])];
                    const existingReaction = reactions.find(r => r.emoji === emojiCode);

                    if (emojiCode === '') {
                        const updatedReactions = reactions.map(reaction => ({
                            ...reaction,
                            userIds: reaction.userIds.filter(id => id !== userId)
                        })).filter(reaction => reaction.userIds.length > 0);
                        return { ...msg, reactions: updatedReactions };
                    }

                    if (!existingReaction) {
                        reactions.push({ emoji: emojiCode, userIds: [userId] });
                    } else if (!existingReaction.userIds.includes(userId)) {
                        existingReaction.userIds.push(userId);
                    }

                    return { ...msg, reactions };
                })
            };
        });
    }
}));

export const useChannelStore = createMessagesStore(false);
export const useThreadStore = createMessagesStore(true);
