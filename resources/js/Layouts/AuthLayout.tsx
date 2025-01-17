import { PropsWithChildren, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useThreadStore, useChannelStore } from '@/stores/messageStores';
import { useUserStore } from '@/stores/userStore';
import SidebarHeader from '@/Components/SidebarHeader';
import ChannelHeader from '@/Components/ChannelHeader';
import ThreadHeader from '@/Components/ThreadHeader';
import EmojiPicker from '@/Components/EmojiPicker';
import Sidebar from '@/Components/Sidebar';
import { cn } from '@/lib/utils';

export default function AuthLayout({ children }: PropsWithChildren) {
    const { fetchChannels } = useWorkspaceStore();
    const { fetchUsers } = useUserStore();
    const { messages: threadMessages, updateReaction: updateThreadReaction } = useThreadStore();
    const { updateReaction: updateChannelReaction } = useChannelStore();

    const threadOpen = threadMessages !== null;

    useEffect(() => {
        fetchChannels()
        fetchUsers()
    }, []);

    const handleReactionUpdate = (messageId: number, userId: number, emojiCode: string) => {
        updateChannelReaction(messageId, userId, emojiCode);
        updateThreadReaction(messageId, userId, emojiCode);
    };

    return (
        <div className={cn(
            "grid h-[100dvh] transition-all grid-rows-[var(--header-height)_1fr] grid-cols-[var(--sidebar-width)_1fr]",
            threadOpen 
                ? "lg:grid-cols-[var(--sidebar-width)_1fr_1fr]"
                : "lg:grid-cols-[var(--sidebar-width)_1fr_0fr]"
        )}>
            <SidebarHeader />
            <ChannelHeader />
            <ThreadHeader />
            <Sidebar />
            {children}
            <EmojiPicker updateReaction={handleReactionUpdate} />
        </div>
    );
}
