import { User as UserIcon, Link as LinkIcon } from 'lucide-react';
import MessageHoverMenu from '@/Components/MessageHoverMenu';
import ReactionList from '@/Components/ReactionList';
import { Message } from '@/types/slack';
import { cn } from '@/lib/utils';

export default function MessageView({ message, isThread }: { message: Message, isThread: boolean }) {
    const { is_continuation } = message;

    // TODO: consider replacing with css grid
    return (
        <div className="message group relative flex items-start gap-3 px-4 py-1 hover:bg-background transition-colors">
            <div className={cn(
                "w-8 mt-1.5",
                is_continuation ? "h-2 [&_svg]:hidden" : "h-8 rounded-full bg-muted flex items-center justify-center"
            )}>
                <UserIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
                <Header message={message} />
                <p className="text-sm text-foreground">{message.content}</p>
                <AttachmentView message={message} />
                <ReactionList message={message} />
            </div>
            <MessageHoverMenu message={message} isThread={isThread} />
        </div>
    );
}

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
};

function Header({ message }: { message: Message }) {
    if (message.is_continuation) return null;

    return (
        <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{message.user?.name || 'Assistant'}</span>
            <span className="text-xs mt-[1px] text-muted-foreground select-none whitespace-nowrap">
                {new Date(message.created_at).toLocaleTimeString([], TIME_FORMAT)}
            </span>
        </div>
    );
} 

function AttachmentView({ message }: { message: Message }) {
    if (!message.attachment_name) return null;

    return (
        <a
            href={route('attachments.download', { message: message.id })}
            className={cn(
                "inline-flex items-center gap-2 my-1 p-1.5 pr-2 cursor-pointer transition-all",
                "rounded-lg bg-background group-hover:bg-muted shadow-inner hover:shadow"
            )}
        >
            <LinkIcon className="size-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{message.attachment_name}</span>
        </a>
    );
}