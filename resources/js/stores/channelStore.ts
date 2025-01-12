import { create, StateCreator } from 'zustand';
import { useMessageStore } from '@/stores/messageStore';
import { Channel } from '@/types/slack';
import axios from 'axios';

interface ChannelStore {
    channels: Channel[];
    openChannel: Channel | null;
    userCount: number;
    fetchChannels: () => Promise<void>;
    setOpenChannel: (channelId: number) => void;
}

const storeCreator: StateCreator<ChannelStore> = (set, get) => ({
    channels: [],
    openChannel: null,
    userCount: 0,

    fetchChannels: async () => {
        try {
            const response = await axios.get<{ channels: Channel[] }>(route('channels.index'));
            const channels = response.data.channels;
            const openChannel = getChannelFromUrl(channels);
            const userCount = 1 + (openChannel?.users.length ?? 0);

            set({ channels, openChannel, userCount });

            if (openChannel) await useMessageStore.getState().loadChannelMessages(openChannel.id);
        } catch (error) {
            console.error('Failed to fetch channels', error);
        }
    },

    setOpenChannel: async (channelId: number) => {
        const channel = get().channels.find(c => c.id === channelId);
        const userCount = 1 + (channel?.users.length ?? 0);
        if (!channel) return;

        set({ openChannel: channel, userCount });
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