import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import { Suspense } from 'react';
import MessageView from './MessageView';

function List() {
    const { localMessages } = useMessagesWebsocket();

    return (
        <div className="flex flex-col-reverse gap-[1px]">
            <div id="messages-end" />
            {localMessages.map((msg) => (
                <MessageView key={msg.id} message={msg} />
            ))}
        </div>
    );
}

export default function MessageListView() {
    return (
        <Suspense fallback={<div>Loading messages...</div>}>
            <List />
        </Suspense>
    );
} 