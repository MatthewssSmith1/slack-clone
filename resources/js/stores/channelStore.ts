import { create } from 'zustand';
import axios from 'axios';

interface ChannelStore {
    channels: Channel[];
    currentChannel: Channel | null;
    isLoading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    setCurrentChannel: (channelId: number) => void;
    addChannel: (channel: Channel) => void;
    updateChannel: (channelId: number, updates: Partial<Channel>) => void;
    removeChannel: (channelId: number) => void;
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
    channels: [],
    currentChannel: null,
    isLoading: false,
    error: null,

    fetch: async () => {
        console.log('fetching channels');
        const currentState = get();
        // Don't fetch if we're already loading
        if (currentState.isLoading) return;
        
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get<{ channels: Channel[] }>('/channels');
            const channels = response.data.channels;
            
            // Preserve current channel if it exists in new channel list
            const currentChannel = currentState.currentChannel;
            const updatedCurrentChannel = currentChannel
                ? channels.find(c => c.id === currentChannel.id) || channels[0] || null
                : channels[0] || null;

            set({ 
                channels,
                currentChannel: updatedCurrentChannel,
                isLoading: false 
            });
        } catch (error) {
            set(state => ({ 
                ...state,
                error: 'Failed to fetch channels',
                isLoading: false 
            }));
        }
    },

    setCurrentChannel: (channelId: number) => {
        const channel = get().channels.find(c => c.id === channelId);
        if (channel) {
            set({ currentChannel: channel });
        }
    },

    addChannel: (channel: Channel) => {
        set(state => ({
            channels: [...state.channels, channel],
            currentChannel: state.currentChannel || channel
        }));
    },

    updateChannel: (channelId: number, updates: Partial<Channel>) => {
        set(state => ({
            channels: state.channels.map(c => c.id === channelId ? { ...c, ...updates } : c),
            currentChannel: state.currentChannel?.id === channelId ? { ...state.currentChannel, ...updates } : state.currentChannel
        }));
    },

    removeChannel: (channelId: number) => {
        set(state => ({
            channels: state.channels.filter(c => c.id !== channelId),
            currentChannel: state.currentChannel?.id === channelId ? state.channels[0] || null : state.currentChannel
        }));
    }
})); 