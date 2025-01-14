import { StoreApi, UseBoundStore } from 'zustand';
import { useEffect, useRef } from 'react';
import { MessagesState } from '@/stores/messageStores';
import MessageInput from '@/Components/MessageInput';
import EmojiPicker from '@/Components/EmojiPicker';
import { Loader2 } from 'lucide-react';
import MessageView from './MessageView';
import { Message } from '@/types/slack';
import { cn } from '@/lib/utils';

interface ChatViewProps {
    useStore: UseBoundStore<StoreApi<MessagesState>>;
    className?: string;
}

export default function ChatView({ useStore, className }: ChatViewProps) {
    const { isThread, messages, setScrollContainer, updateReaction, addMessage } = useStore();

    const scrollContainer = useRef<HTMLDivElement>(null);    
    useEffect(() => setScrollContainer(scrollContainer), [scrollContainer]);

    const parentId = isThread ? messages?.[0]?.id : undefined;

    return (
        <article className={cn("row-start-2 grid grid-rows-[1fr_auto] overflow-hidden bg-muted", className)}>
            <main ref={scrollContainer} className="overflow-y-auto bg-panel py-4 relative flex flex-col">
                <ScrollRegion messages={messages} isThread={isThread} />
            </main>
            <MessageInput addMessage={addMessage} parentId={parentId} isThread={isThread} />
            <EmojiPicker updateReaction={updateReaction} />
        </article>
    );
}

function ScrollRegion({ messages, isThread }: { messages: Message[] | null, isThread: boolean }) {
    if (!messages) return <LoadingSpinner />;

    return (<div className="flex flex-col-reverse gap-[1px]">
        {messages.map((msg) => (
            <MessageView key={msg.id} message={msg} isThread={isThread} />
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