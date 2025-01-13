import { useEffect, useRef } from 'react';
import { useChannelStore } from '@/stores/channelStore';
import MessageInput from '@/Components/MessageInput';
import { Loader2 } from 'lucide-react';
import MessageView from './MessageView';
import { Message } from '@/types/slack';

export default function ChannelView() {
    const { messages, setscrollContainer } = useChannelStore();

    const scrollContainer = useRef<HTMLDivElement>(null);    
    useEffect(() => setscrollContainer(scrollContainer), [scrollContainer]);

    return (
        <article className="col-start-2 row-start-2 grid grid-rows-[1fr_auto] overflow-hidden bg-muted">
            <main ref={scrollContainer} className="flex-1 overflow-y-auto bg-panel py-4 relative flex flex-col-reverse">
                <ScrollRegion messages={messages} />
            </main>
            <MessageInput />
        </article>
    );
}

function ScrollRegion({ messages }: { messages: Message[] }) {

    if (messages.length === 0) return <LoadingSpinner />;

    return (<div className="flex flex-col-reverse gap-[1px]">
        {messages.map((msg) => (
            <MessageView key={msg.id} message={msg} />
        ))}
    </div>);
}

function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="size-12 animate-spin text-muted-foreground" />
        </div>
    );
}