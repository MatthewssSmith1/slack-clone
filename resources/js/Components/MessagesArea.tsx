import { useRef, useEffect } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useWebsocket } from '@/hooks/use-websocket';
import MessageView from './MessageView';

export default function MessagesArea() {
    const { localMessages, hideNewMsgIndicator } = useMessageStore();
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // `flex-col-reverse` below makes scrollTop negative: -100px represents being near bottom
        if ((wrapperRef.current?.scrollTop ?? 0) < -100) return;
        
        const endElement = wrapperRef.current?.querySelector('#messages-end');
        endElement?.scrollIntoView({ behavior: 'smooth' });
        hideNewMsgIndicator();
    }, [localMessages]);

    useWebsocket();

    return (
        <div 
            ref={wrapperRef}
            className="flex-1 overflow-y-auto bg-panel py-4 relative flex flex-col-reverse"
        >
            <div className="flex flex-col-reverse gap-[1px]">
                <div id="messages-end" />
                {localMessages.map((message) => (
                    <MessageView key={message.id} message={message} />
                ))}
            </div>
        </div>
    );
}