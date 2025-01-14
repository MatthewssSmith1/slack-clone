import { useChannelStore } from '@/stores/messageStores';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Message } from '@/types/slack';

interface ReactionPostedEvent {
    message_id: number;
    user_id: number;
    emoji_code: string;
}

export function useMessagesWebsocket() {
    const { currentChannel } = useWorkspaceStore();
    const { user } = useAuth();
    const store = useChannelStore();

    useEffect(() => {
        if (!currentChannel || !user) return;
        
        const channelId = `channel.${currentChannel.id}`;
        window.Echo?.leave(channelId);

        window.Echo.private(channelId)
            .listen('MessagePosted', ({ message }: { message: Message }) => {
                if (message.user.id !== user.id) 
                    store.addMessage(message, false);
            })
            .listen('ReactionPosted', ({ message_id, user_id, emoji_code }: ReactionPostedEvent) => {
                if (user_id !== user.id) 
                    store.updateReaction(message_id, user_id, emoji_code);
            });

        return () => window.Echo?.leave(channelId);
    }, [currentChannel?.id, user.id]);

    return store;
} 