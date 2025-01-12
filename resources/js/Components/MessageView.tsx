import { User as UserIcon, Reply, SmilePlus } from 'lucide-react';
import { Message } from '@/types/slack';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import EmojiSelect from './EmojiSelect';

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
};

interface MessageViewProps {
    message: Message;
}

export default function MessageView({ message }: MessageViewProps) {
    const isContinuation = message.isContinuation;
    const { user } = useAuth();
    const isCurrentUser = message.user.id === user.id;

    const handleEmojiSelect = (emoji: string) => {
        // TODO: Implement reaction API call
        console.log('Selected emoji:', emoji, 'for message:', message.id);
    };

    return (
        <div className="flex items-start gap-3 px-4 py-1 group hover:bg-background relative">
            {isContinuation 
                ? (<div className="w-8 h-2 mt-1.5" />) 
                : (
                    <div className="w-8 h-8 mt-1.5 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                )
            }
            <div className="flex-1">
                {!isContinuation && (
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium">{message.user.name}</span>
                        <span className="text-xs mt-[1px] text-muted-foreground select-none">
                            {new Date(message.created_at).toLocaleTimeString([], TIME_FORMAT_OPTIONS)}
                        </span>
                    </div> 
                )}
                <p className="text-sm text-foreground">
                    {message.content}
                </p>
            </div>
            {!isCurrentUser && (
                <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-0.5 bg-background border rounded-md shadow-sm">
                        <EmojiSelect message={message} onEmojiSelect={handleEmojiSelect}>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                                <SmilePlus className="h-4 w-4" />
                                <span className="sr-only">React</span>
                            </Button>
                        </EmojiSelect>
                        <Button variant="ghost" size="sm" className="h-7 px-2">
                            <Reply className="h-4 w-4" />
                            <span className="sr-only">Reply</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
} 