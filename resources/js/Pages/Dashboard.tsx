import { useChannelStore, useThreadStore } from '@/stores/messageStores';
import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import AuthLayout from '@/Layouts/AuthLayout';
import ChatView from '@/Components/ChatView';

export default function Dashboard() {
    useMessagesWebsocket();

    return (
        <AuthLayout>
            <ChatView useStore={useChannelStore} />
            <ChatView useStore={useThreadStore} />
        </AuthLayout>
    );
} 