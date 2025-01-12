import { create, StateCreator } from 'zustand';
import { useMessageStore } from '@/stores/messageStore';
import { Channel } from '@/types/slack';
import axios from 'axios';

interface ChannelStore {
    channels: Channel[];
    currentChannel: Channel | null;
    isLoading: boolean;
    error: string | null;
    fetchChannels: () => Promise<void>;
    setCurrentChannel: (channelId: number) => void;
}

const storeCreator: StateCreator<ChannelStore> = (set, get) => ({
    channels: [],
    currentChannel: null,
    isLoading: false,
    error: null,

    fetchChannels: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.get<{ channels: Channel[] }>(route('channels.index'));
            console.log('Channel data from API:', response.data);
            const channels = response.data.channels;

            const currentChannel = getChannelFromUrl(channels);

            set({
                channels,
                currentChannel,
                isLoading: false
            });

            if (currentChannel) await useMessageStore.getState().loadChannelMessages(currentChannel.id);
        } catch (error) {
            set(state => ({ ...state, error: 'Failed to fetch channels', isLoading: false }));
        }
    },

    setCurrentChannel: async (channelId: number) => {
        const channel = get().channels.find(c => c.id === channelId);
        if (!channel) return;

        set({ currentChannel: channel });
        window.history.replaceState({}, '', `/dashboard?channel=${channelId}`);
        await useMessageStore.getState().loadChannelMessages(channelId);
    },
});

export const useChannelStore = create<ChannelStore>(storeCreator);

const getChannelFromUrl = (channels: Channel[]): Channel | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = parseInt(urlParams.get('channel') || '0');
    const channel = channels.find(c => c.id === channelId) || channels[0] || null;

    if (!urlParams.has('channel') && channel) {
        window.history.replaceState({}, '', `/dashboard?channel=${channel.id}`);
    }

    return channel;
}; 