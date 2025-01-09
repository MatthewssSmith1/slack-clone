import { useChannelMessages } from '@/hooks/use-channel-messages';
import { useRef, useEffect } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useChannelStore } from '@/stores/channelStore';
import MessageView from './MessageView';

export default function MessagesArea() {
    const { currentChannel } = useChannelStore();
    const { localMessages, hideNewMsgIndicator } = useMessageStore();
    useChannelMessages(currentChannel);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // pixels from top because 'flex-col-reverse' below changes scroll direction
    const shouldScrollToBottom = () => (messagesContainerRef.current?.scrollTop ?? 0) > -100;

    // Handle scroll behavior for new messages
    useEffect(() => {
        if (shouldScrollToBottom()) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            hideNewMsgIndicator();
        }
    }, [localMessages]);

    return (
        <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto bg-panel py-4 relative flex flex-col-reverse"
        >
            <div className="flex flex-col-reverse gap-[1px]">
                <div ref={messagesEndRef} id="messages-end" />
                {localMessages.map((message) => (
                    <MessageView key={message.id} message={message} />
                ))}
            </div>
        </div>
    );
}