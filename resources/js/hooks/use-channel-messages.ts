import { useEffect } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuth } from '@/hooks/use-auth';

export function useChannelMessages(channel: Channel | null) {
    const { user } = useAuth();
    const { setLocalMessages, addMessage } = useMessageStore();

    useEffect(() => {
        if (!channel) return;
        
        setLocalMessages(channel.messages);

        window.Echo?.leave(`channel.${channel.id}`);

        window.Echo
            .private(`channel.${channel.id}`)
            .listen('MessagePosted', (event: { message: Message }) => {
                if (event.message.user.id === user.id) return;
                addMessage(event.message, false);
            });

        return () => {
            window.Echo?.leave(`channel.${channel.id}`);
        };
    }, [channel?.id, user.id]);
} 