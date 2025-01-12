import ChannelView from '@/Components/ChannelView';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Dashboard() {
    return (
        <AuthLayout>
            <ChannelView />
        </AuthLayout>
    );
} 