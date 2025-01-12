import SidebarHeader from '@/Components/SidebarHeader';
import ChannelHeader from '@/Components/ChannelHeader';
import ChannelView from '@/Components/ChannelView';
import AuthLayout from '@/Layouts/AuthLayout';
import Sidebar from '@/Components/Sidebar';

export default function Dashboard() {
    return (
        <AuthLayout>
            <SidebarHeader />
            <Sidebar />
            <ChannelHeader />
            <ChannelView />
        </AuthLayout>
    );
} 