import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import { useChannelStore, useThreadStore } from '@/stores/messageStores';
import ChatView from '@/Components/ChatView';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Dashboard() {
    useMessagesWebsocket();

    return (
        <AuthLayout>
            <ChatView useStore={useChannelStore} />
            <ChatView useStore={useThreadStore} />
        </AuthLayout>
    );
} 