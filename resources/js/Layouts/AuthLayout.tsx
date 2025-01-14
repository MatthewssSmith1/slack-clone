import { PropsWithChildren, useEffect } from 'react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useThreadStore } from '@/stores/messageStores';
import { useUserStore } from '@/stores/userStore';
import SidebarHeader from '@/Components/SidebarHeader';
import ChannelHeader from '@/Components/ChannelHeader';
import ThreadHeader from '@/Components/ThreadHeader';
import Sidebar from '@/Components/Sidebar';
import { cn } from '@/lib/utils';

export default function AuthLayout({ children }: PropsWithChildren) {
    const { fetchChannels } = useWorkspaceStore();
    const { fetchUsers } = useUserStore();
    const { messages } = useThreadStore();

    const threadOpen = messages !== null;

    useEffect(() => {
        fetchChannels()
        fetchUsers()
    }, []);

    return (
        <div className={cn(
            "grid h-screen grid-rows-[var(--header-height)_1fr] transition-all",
            threadOpen 
                ? "grid-cols-[var(--sidebar-width)_1fr_1fr]"
                : "grid-cols-[var(--sidebar-width)_1fr_0fr]"
        )}>
            <SidebarHeader />
            <ChannelHeader />
            <ThreadHeader />
            <Sidebar />
            {children}
        </div>
    );
}
