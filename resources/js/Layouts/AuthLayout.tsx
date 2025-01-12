import { PropsWithChildren, useEffect } from 'react';
import { useChannelStore } from '@/stores/channelStore';
import { useUserStore } from '@/stores/userStore';
import SidebarHeader from '@/Components/SidebarHeader';
import ChannelHeader from '@/Components/ChannelHeader';
import Sidebar from '@/Components/Sidebar';

export default function AuthLayout({ children }: PropsWithChildren) {
    const { fetchChannels } = useChannelStore();
    const { fetchUsers } = useUserStore();

    useEffect(() => {
        fetchChannels()
        fetchUsers()
    }, []);

    return (
        <div className="grid h-screen grid-cols-[var(--sidebar-width)_1fr] grid-rows-[var(--header-height)_1fr]">
            <SidebarHeader />
            <ChannelHeader />
            <Sidebar />
            {children}
        </div>
    );
}
