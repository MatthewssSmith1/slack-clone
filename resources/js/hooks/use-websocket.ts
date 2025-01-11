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
        
        console.log(`WebSocket: Initializing channel ${currentChannel.id}`);
        setLocalMessages(currentChannel.messages);

        window.Echo?.leave(`channel.${currentChannel.id}`);
        console.log(`WebSocket: Left channel ${currentChannel.id}`);

        const channel = window.Echo
            .private(`channel.${currentChannel.id}`)
            .listen('MessagePosted', (event: { message: Message }) => {
                console.log(`WebSocket: Received message in channel ${currentChannel.id}`, event);
                if (event.message.user.id === user.id) {
                    console.log('WebSocket: Ignoring own message');
                    return;
                }
                addMessage(event.message, false);
            })
            .subscribed(() => {
                console.log(`WebSocket: Subscribed to channel ${currentChannel.id}`);
            })
            .error((error: any) => {
                console.error(`WebSocket: Error in channel ${currentChannel.id}:`, error);
            });

        return () => {
            console.log(`WebSocket: Cleanup for channel ${currentChannel.id}`);
            window.Echo?.leave(`channel.${currentChannel.id}`);
        };
    }, [currentChannel?.id, user.id]);
} 