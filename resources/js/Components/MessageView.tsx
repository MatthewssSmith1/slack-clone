import { User as UserIcon } from 'lucide-react';
import { Message } from '@/types/slack';
import { cn } from '@/lib/utils';

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
};

interface MessageViewProps {
    message: Message;
}

export default function MessageView({ message }: MessageViewProps) {
    const isContinuation = message.isContinuation;

    return (
        <div className="flex items-start gap-3 px-4 py-1 group hover:bg-background">
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
        </div>
    );
} 