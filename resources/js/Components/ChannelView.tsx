import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import { useEffect, useRef } from 'react';
import MessageListView from '@/Components/MessageListView';
import MessageInput from '@/Components/MessageInput';

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
    const { localMessages } = useMessagesWebsocket();
    const { hideNewMsgIndicator } = useMessagesWebsocket();

    useEffect(() => {
      // flex-col-reverse affects scrollTop; this represents 100px from bottom
      if ((wrapperRef.current?.scrollTop ?? 0) < -100) return; 
        document.getElementById('messages-end')?.scrollIntoView({ behavior: 'smooth' });
        hideNewMsgIndicator();
    }, [localMessages]);

    return (
        <main ref={wrapperRef} className="flex-1 overflow-y-auto bg-panel py-4 relative flex flex-col-reverse">
            <MessageListView />
        </main>
    );
}