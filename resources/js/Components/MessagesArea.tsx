import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import { useRef, useEffect } from 'react';
import MessageView from './MessageView';

export default function MessagesArea() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const { localMessages: messages, hideNewMsgIndicator } = useMessagesWebsocket();

    useEffect(() => {
        // `flex-col-reverse` makes scrollTop negative: -100px represents being near bottom
        if ((wrapperRef.current?.scrollTop ?? 0) < -100) return;
        
        wrapperRef.current?.querySelector('#messages-end')?.scrollIntoView({ behavior: 'smooth' });
        hideNewMsgIndicator();
    }, [messages]);

    return (
        <div 
            ref={wrapperRef}
            className="flex-1 overflow-y-auto bg-panel py-4 relative flex flex-col-reverse"
        >
            <div className="flex flex-col-reverse gap-[1px]">
                <div id="messages-end" />
                {messages.map((message) => (
                    <MessageView key={message.id} message={message} />
                ))}
            </div>
        </div>
    );
}