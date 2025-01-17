import { useChannelStore, useThreadStore } from '@/stores/messageStores';
import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import AuthLayout from '@/Layouts/AuthLayout';
import ChatView from '@/Components/ChatView';
import { cn } from '@/lib/utils';

export default function Dashboard() {
    useMessagesWebsocket();
    const { messages } = useThreadStore();
    const isThreadClosed = messages === null;

    return (
        <AuthLayout>
            <ChatView useStore={useChannelStore} className="col-start-2" />
            <ChatView useStore={useThreadStore} className={cn(
                "col-start-2 lg:col-start-3 transition-all duration-100",
                isThreadClosed && "opacity-0 pointer-events-none"
            )} />
        </AuthLayout>
    );
} 