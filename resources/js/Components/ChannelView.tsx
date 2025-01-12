import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import { useEffect, useRef } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import EmojiMenu from './EmojiMenu';
import MessageListView from '@/Components/MessageListView';
import MessageInput from '@/Components/MessageInput';
import { Loader2 } from 'lucide-react';

export default function ChannelView() {
    return (
        <article className="col-start-2 row-start-2 grid grid-rows-[1fr_auto] overflow-hidden bg-muted">
            <ScrollRegion />
            <MessageInput />
        </article>
    );
} 

function ScrollRegion() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { hideNewMsgIndicator, messages } = useMessagesWebsocket();
    const isLoading = useMessageStore(state => state.isLoading);

    useEffect(() => {
      // flex-col-reverse affects scrollTop; this represents 100px from bottom
      if ((wrapperRef.current?.scrollTop ?? 0) < -100) return; 
        document.getElementById('messages-end')?.scrollIntoView({ behavior: 'smooth' });
        hideNewMsgIndicator();
    }, [messages]);

    return (
        <main ref={wrapperRef} className="flex-1 overflow-y-auto bg-panel py-4 relative flex flex-col-reverse">
            {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Loader2 className="size-12 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <MessageListView />
            )}
            <EmojiMenu />
        </main>
    );
}