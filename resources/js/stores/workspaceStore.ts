import { create, StateCreator } from 'zustand';
import { useChannelStore } from '@/stores/channelStore';
import { Channel } from '@/types/slack';
import axios from 'axios';

interface WorkspaceStore {
    channels: Channel[];
    currentChannel: Channel | null;
    userCount: number;
    fetchChannels: () => Promise<void>;
    setCurrentChannel: (channelId: number) => void;
}

const storeCreator: StateCreator<WorkspaceStore> = (set, get) => ({
    channels: [],
    currentChannel: null,
    userCount: 0,

    fetchChannels: async () => {
        try {
            const response = await axios.get<{ channels: Channel[] }>(route('channels.index'));
            const channels = response.data.channels;
            const currentChannel = getChannelFromUrl(channels);
            const userCount = 1 + (currentChannel?.users.length ?? 0);

            set({ channels, currentChannel, userCount });

            if (currentChannel) await useChannelStore.getState().loadMessages(currentChannel.id);
        } catch (error) {
            console.error('Failed to fetch channels', error);
        }
    },

    setCurrentChannel: async (channelId: number) => {
        const channel = get().channels.find(c => c.id === channelId);
        const userCount = 1 + (channel?.users.length ?? 0);
        if (!channel) return;

        set({ currentChannel: channel, userCount });
        window.history.replaceState({}, '', `/dashboard?channel=${channelId}`);
        await useChannelStore.getState().loadMessages(channelId);
    },
});

export const useWorkspaceStore = create<WorkspaceStore>(storeCreator);

const getChannelFromUrl = (channels: Channel[]): Channel | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const channelId = parseInt(urlParams.get('channel') || '0');
    const channel = channels.find(c => c.id === channelId) || channels[0] || null;

    if (!urlParams.has('channel') && channel) {
        window.history.replaceState({}, '', `/dashboard?channel=${channel.id}`);
    }

    return channel;
}; 