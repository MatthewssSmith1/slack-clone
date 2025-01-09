import { Channel } from '@/types/slack';
import { create } from 'zustand';
import axios from 'axios';

interface ChannelStore {
    channels: Channel[];
    currentChannel: Channel | null;
    isLoading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    addChannel: (channel: Channel) => void;
    setCurrentChannel: (channelId: number) => void;
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
        if (currentState.isLoading) return;
        
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get<{ channels: Channel[] }>('/channels');
            const channels = response.data.channels;
            
            // Get channel ID from URL or use first channel
            const urlParams = new URLSearchParams(window.location.search);
            const channelId = parseInt(urlParams.get('channel') || '0');
            const currentChannel = channels.find(c => c.id === channelId) || channels[0] || null;

            if (!urlParams.has('channel') && currentChannel) 
                window.history.replaceState({}, '', `/dashboard?channel=${currentChannel.id}`);
           

            set({ 
                channels,
                currentChannel,
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
            // Update URL silently without page reload
            window.history.replaceState({}, '', `/dashboard?channel=${channelId}`);
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