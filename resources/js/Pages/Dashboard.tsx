import SidebarHeader from '@/Components/SidebarHeader';
import ChannelView from '@/Components/ChannelView';
import MainHeader from '@/Components/MainHeader';
import AuthLayout from '@/Layouts/AuthLayout';
import Sidebar from '@/Components/Sidebar';

export default function Dashboard({ channel }: { channel?: string }) {
    return (
        <AuthLayout channel={channel}>
            <SidebarHeader />
            <MainHeader />
            <Sidebar />
            <ChannelView />
        </AuthLayout>
    );
} 