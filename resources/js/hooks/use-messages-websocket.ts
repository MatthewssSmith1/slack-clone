import { useMessageStore } from '@/stores/messageStore';
import { useChannelStore } from '@/stores/channelStore';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Message } from '@/types/slack';

export function useMessagesWebsocket() {
    const { currentChannel } = useChannelStore();
    const { user } = useAuth();
    const store = useMessageStore();

    useEffect(() => {
        if (currentChannel) store.setLocalMessages(currentChannel.messages);
    }, [currentChannel?.id]);

    useEffect(() => {
        if (!currentChannel) return;
        
        const channelId = `channel.${currentChannel.id}`;
        window.Echo?.leave(channelId);

        window.Echo.private(channelId)
            .listen('MessagePosted', ({ message }: { message: Message }) => {
                if (message.user.id !== user.id) 
                    store.addMessage(message, false);
            });

        return () => window.Echo?.leave(channelId);
    }, [currentChannel?.id, user.id]);

    return store;
} 