import { Message } from '@/types/slack';
import { useMessageStore } from '@/stores/messageStore';
import { useChannelStore } from '@/stores/channelStore';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

export function useWebsocket() {
    const { currentChannel } = useChannelStore();
    const { setLocalMessages, addMessage } = useMessageStore();
    const { user } = useAuth();

    useEffect(() => {
        if (!currentChannel) return;
        
        setLocalMessages(currentChannel.messages);

        window.Echo?.leave(`channel.${currentChannel.id}`);

        window.Echo
            .private(`channel.${currentChannel.id}`)
            .listen('MessagePosted', (event: { message: Message }) => {
                if (event.message.user.id === user.id) return;
                addMessage(event.message, false);
            });

        return () => {
            window.Echo?.leave(`channel.${currentChannel.id}`);
        };
    }, [currentChannel?.id, user.id]);
} 