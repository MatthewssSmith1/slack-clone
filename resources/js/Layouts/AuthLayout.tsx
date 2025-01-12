import { PropsWithChildren, useEffect } from 'react';
import SidebarHeader from '@/Components/SidebarHeader';
import ChannelHeader from '@/Components/ChannelHeader';
import Sidebar from '@/Components/Sidebar';
import { useChannelStore } from '@/stores/channelStore';

type Props = PropsWithChildren<{
    channel?: string;
}>;

export default function AuthLayout({ children, channel }: Props) {
    const { fetchChannels, setCurrentChannel } = useChannelStore();

    useEffect(() => {
        fetchChannels();
    }, []);

    useEffect(() => {
        if (channel) setCurrentChannel(Number(channel));
    }, [channel]);

    return (
        <div className="grid h-screen grid-cols-[var(--sidebar-width)_1fr] grid-rows-[var(--header-height)_1fr]">
            <SidebarHeader />
            <ChannelHeader />
            <Sidebar />
            {children}
        </div>
    );
}
