import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import ChannelView from '@/Components/ChannelView';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Dashboard() {
    useMessagesWebsocket();

    return (
        <AuthLayout>
            <ChannelView />
        </AuthLayout>
    );
} 