import { useEffect, useRef, useCallback } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { MessagesState } from '@/stores/messageStores';
import MessageInput from '@/Components/MessageInput';
import EmojiPicker from '@/Components/EmojiPicker';
import { Loader2 } from 'lucide-react';
import MessageView from './MessageView';
import { Message } from '@/types/slack';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface ChatViewProps {
    useStore: UseBoundStore<StoreApi<MessagesState>>;
    className?: string;
}

export default function ChatView({ useStore, className }: ChatViewProps) {
    const { isThread, messages, instantScroll, setInstantScroll, setScrollContainer, updateReaction, addMessage } = useStore();

    const scrollContainer = useRef<HTMLDivElement>(null);    

    useEffect(() => setScrollContainer(scrollContainer), [scrollContainer]);
    useEffect(() => {
        if (!messages || !scrollContainer.current) return;

        // Scroll to bottom (newest messages) when messages first load
        if (instantScroll) {
            scrollContainer.current
                ?.querySelector('.message:first-child')
                ?.scrollIntoView({behavior: 'instant'});
            setInstantScroll(false);
        }
        
    }, [messages, scrollContainer, instantScroll, setInstantScroll]);

    const parentId = isThread ? messages?.at(-1)?.id : undefined;

    return (
        <article className={cn("row-start-2 grid grid-rows-[1fr_auto] overflow-hidden bg-muted", className)}>
            <main ref={scrollContainer} className="overflow-y-auto bg-panel py-4 relative flex flex-col">
                <ScrollRegion useStore={useStore} />
            </main>
            <MessageInput addMessage={addMessage} parentId={parentId} isThread={isThread} />
            <EmojiPicker updateReaction={updateReaction} />
        </article>
    );
}

function ScrollRegion({ useStore }: { useStore: UseBoundStore<StoreApi<MessagesState>> }) {
    const { messages, isThread, isLoading, loadMessages, nextCursor } = useStore();
    const observerTarget = useRef<HTMLDivElement>(null);

    const { currentChannel } = useWorkspaceStore();
    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && currentChannel && nextCursor) {
            // TODO: insert new messages without scrolling to the top 
            const parentId = isThread ? messages?.at(-1)?.id : undefined;
            loadMessages(currentChannel.id, parentId , nextCursor);
        }
    }, [isLoading]);

    useEffect(() => {
        const observer = new IntersectionObserver(handleIntersection, {
            root: null,
            rootMargin: '100px',
            threshold: 0.1
        });

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [handleIntersection]);

    if (!messages) return <LoadingSpinner />;

    return (
        <div className="flex flex-col-reverse gap-[1px]">
            {messages.map((msg) => (
                <MessageView key={msg.id} message={msg} isThread={isThread} />
            ))}

            {nextCursor && <div ref={observerTarget} className="h-4" />}
        </div>
    );
}

function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="size-12 animate-spin text-muted-foreground" />
        </div>
    );
}