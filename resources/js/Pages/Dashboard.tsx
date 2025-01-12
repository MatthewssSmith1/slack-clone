import { useEffect } from 'react';
import { useChannelStore } from '@/stores/channelStore';
import SidebarHeader from '@/Components/SidebarHeader';
import ChannelView from '@/Components/ChannelView';
import ChannelHeader from '@/Components/ChannelHeader';
import AuthLayout from '@/Layouts/AuthLayout';
import Sidebar from '@/Components/Sidebar';

export default function Dashboard() {
    const { fetchChannels } = useChannelStore();

    useEffect(() => {
        fetchChannels();
    }, []);

    return (
        <AuthLayout>
            <SidebarHeader />
            <Sidebar />
            <ChannelHeader />
            <ChannelView />
        </AuthLayout>
    );
} 