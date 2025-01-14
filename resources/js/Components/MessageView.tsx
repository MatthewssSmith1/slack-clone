import { User as UserIcon, Reply, SmilePlus } from 'lucide-react';
import { useEmojiPickerStore } from '@/stores/emojiPickerStore';
import { useThreadStore } from '@/stores/messageStores';
import ReactionList from '@/Components/ReactionList';
import { Message } from '@/types/slack';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/workspaceStore';

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
};

export default function MessageView({ message, isThread }: { message: Message, isThread: boolean }) {
    const isContinuation = message.isContinuation;
    const { user } = useAuth();

    if (!user) return null;

    const isCurrentUser = message.user.id === user.id;

    return (
        <div className="message flex items-start gap-3 px-4 py-1 group hover:bg-background relative">
            <div className={cn(
                "w-8 mt-1.5",
                isContinuation ? "h-2 [&_svg]:hidden" : "h-8 rounded-full bg-muted flex items-center justify-center"
            )}>
                <UserIcon className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
                {!isContinuation && (
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium">{message.user.name}</span>
                        <span className="text-xs mt-[1px] text-muted-foreground select-none">
                            {new Date(message.created_at).toLocaleTimeString([], TIME_FORMAT)}
                        </span>
                    </div> 
                )}
                <p className="text-sm text-foreground">{message.content}</p>
                <ReactionList message={message} />
            </div>
            {!isCurrentUser && (<MessageHoverMenu message={message} isThread={isThread} />)}
        </div>
    );
}

function MessageHoverMenu({ message, isThread }: { message: Message, isThread: boolean }) {
    const { open } = useEmojiPickerStore();

    const openEmojis = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        open(message, { x: rect.left, y: rect.bottom });
    };

    const { currentChannel } = useWorkspaceStore();
    const { loadMessages } = useThreadStore();
    const openThread = () => {
        useThreadStore.setState({ messages: [{...message, isContinuation: false}] });
        currentChannel && loadMessages(currentChannel.id, message.id);
    };

    return (
        <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-background border rounded-md shadow-sm [&_svg]:size-4">
            <Button variant="ghost" size="sm" className="h-7 px-2" aria-label="React" onClick={openEmojis}>
                <SmilePlus />
            </Button>
            {!isThread && (
                <Button variant="ghost" size="sm" className="h-7 px-2" aria-label="Reply" onClick={openThread}>
                    <Reply />
                </Button>
            )}
        </div>
    );
} 