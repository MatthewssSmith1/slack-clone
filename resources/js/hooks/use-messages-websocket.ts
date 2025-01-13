import { useChannelStore } from '@/stores/channelStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Message, User } from '@/types/slack';

export function useMessagesWebsocket() {
    const { currentChannel } = useWorkspaceStore();
    const { user } = useAuth();
    const store = useChannelStore();

    useEffect(() => {
        if (!currentChannel) return;
        
        const channelId = `channel.${currentChannel.id}`;
        window.Echo?.leave(channelId);

        window.Echo.private(channelId)
            .listen('MessagePosted', ({ message }: { message: Message }) => {
                if (message.user.id !== user.id) 
                    store.addMessage(message, false);
            })
            .listen('ReactionPosted', ({ 
                message_id, 
                user: reactionUser, 
                emoji_code, 
                removed 
            }: { 
                message_id: number;
                user: User;
                emoji_code: string;
                removed: boolean;
            }) => {
                if (reactionUser.id !== user.id) {
                    store.updateReaction(message_id, reactionUser, emoji_code);
                }
            });

        return () => window.Echo?.leave(channelId);
    }, [currentChannel?.id, user.id]);

    return store;
} 