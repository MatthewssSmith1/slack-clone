import { useRef, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import { useMessageStore } from '@/stores/messageStore';

export default function MessagesArea() {
    const { localMessages, hideNewMsgIndicator } = useMessageStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const shouldScrollToBottom = () => {
        const container = messagesContainerRef.current;
        if (!container) return false;
        
        const threshold = 100; // pixels from top (since container is reversed)
        return container.scrollTop > -threshold;
    };

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
                    <div key={message.id} className="flex items-start gap-3 px-4 py-1 group hover:bg-background">
                        <div className="w-8 h-8 mt-1.5 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{message.user.name}</span>
                                <span className="text-xs mt-[1px] text-muted-foreground select-none">
                                    {new Date(message.created_at).toLocaleTimeString([], { 
                                        hour: 'numeric', 
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-foreground">{message.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}