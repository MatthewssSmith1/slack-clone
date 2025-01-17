import { Message } from '@/types/slack';
import { create } from 'zustand';
import axios from 'axios';

export interface MessagesState {
    isThread: boolean;

    instantScroll: boolean;
    setInstantScroll: (isInstant: boolean) => void;

    scrollContainer: React.RefObject<HTMLDivElement> | null;
    setScrollContainer: (ref: React.RefObject<HTMLDivElement>) => void;

    showIndicator: boolean;
    setIndicator: (isVisible: boolean) => void;

    isLoading: boolean;
    nextCursor: number | null; // unix timestamp
    messages: Message[] | null;
    loadMessages: (channelId: number, parentId?: number, cursor?: number) => Promise<void>;
    addMessage: (message: Message, shouldScroll: boolean) => void;
    updateReaction: (messageId: number, userId: number, emojiCode: string) => void;
}

const createMessagesStore = (isThread: boolean) => create<MessagesState>((set, get): MessagesState => ({
    isThread,

    instantScroll: true,
    setInstantScroll: (isInstant: boolean) => set({ instantScroll: isInstant }),

    scrollContainer: null,
    setScrollContainer: (ref) => set({ scrollContainer: ref }),

    showIndicator: false,
    setIndicator: (isVisible: boolean) => set({ showIndicator: isVisible }),

    isLoading: false,
    nextCursor: null,
    messages: null,
    loadMessages: async (channelId: number, parentId?: number, cursor?: number) => {
        set({ 
            isLoading: true,
            ...(cursor === undefined && { messages: null })
        });

        try {
            const params = { channel: channelId, parentId, ...(cursor && { cursor }) };
            const response = await axios.get(route('messages.index', params));
            const { nextCursor, messages } = response.data;

            // console.log(messages);

            set((state) => {
                const newMessages = cursor && state.messages ? [...state.messages, ...messages] : messages;
                return { 
                    nextCursor,
                    messages: newMessages,
                    instantScroll: newMessages.length <= 50
                };
            })

            setTimeout(() => set({ isLoading: false }), 500);
        } catch (error) {
            set({ isLoading: false, messages: [] });
            throw error;
        }
    },

    addMessage: (message: Message, shouldScroll: boolean) => {
        set((state) => {
            if (!state.messages) return state;

            const [prevMessage] = state.messages;
            message.is_continuation = prevMessage ? message.user?.id === prevMessage.user?.id : false;

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

                    if (emojiCode === '') {
                        return {
                            ...msg,
                            reactions: msg.reactions.map(reaction => ({
                                ...reaction,
                                userIds: reaction.userIds.filter(id => id !== userId)
                            })).filter(reaction => reaction.userIds.length > 0)
                        };
                    }

                    const reactions = [...(msg.reactions || [])];
                    const existingReaction = reactions.find(r => r.emoji === emojiCode);

                    if (!existingReaction) {
                        reactions.push({
                            emoji: emojiCode,
                            userIds: [userId]
                        });
                    } else if (!existingReaction.userIds.includes(userId)) {
                        existingReaction.userIds = [...existingReaction.userIds, userId];
                    }

                    return { ...msg, reactions };
                })
            };
        });
    }
}));

export const useChannelStore = createMessagesStore(false);
export const useThreadStore = createMessagesStore(true);
