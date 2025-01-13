import { useChannelStore } from '@/stores/channelStore';
import { ChevronDown } from 'lucide-react';
import { useEffect } from 'react';

export default function NewMessageIndicator() {
    const { showIndicator, setIndicator, scrollContainer, messages } = useChannelStore();

    const scrollToBottom = () => {
        scrollContainer?.current
            ?.querySelector('.message:first-child')
            ?.scrollIntoView({ behavior: 'smooth' });
        setIndicator(false);
    };

    useEffect(() => {
        // flex-col-reverse affects scrollTop; this represents distance scroll up from the bottom
        if (!scrollContainer?.current || scrollContainer.current.scrollTop < -150) return;
        scrollToBottom();
    }, [messages]);

    if (!showIndicator) return null;

    return (
        <div 
            onClick={scrollToBottom}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary/70 text-primary-foreground rounded-full text-sm animate-in fade-in cursor-pointer hover:bg-primary/90 flex items-center gap-1.5 shadow-md"
        >
            <span>New message</span>
            <ChevronDown className="h-4 w-4" />
        </div>
    );
} 