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
    const { user: authUser } = useAuth();
    const channelStore = useChannelStore();

    useEffect(() => {
        if (!currentChannel || !authUser) return;
        
        const channelId = `channel.${currentChannel.id}`;
        window.Echo?.leave(channelId);

        window.Echo.private(channelId)
            .listen('MessagePosted', ({ message }: { message: Message }) => 
                (message.user?.id !== authUser.id && channelStore.addMessage(message, false)))
            .listen('ReactionPosted', (e: ReactionPostedEvent) => 
                (e.user_id !== authUser.id && channelStore.updateReaction(e.message_id, e.user_id, e.emoji_code)));

        return () => window.Echo?.leave(channelId);
    }, [currentChannel?.id, authUser.id]);

    return channelStore;
} 