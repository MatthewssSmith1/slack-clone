import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEmojiPickerStore } from '@/stores/emojiPickerStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Reply, SmilePlus } from 'lucide-react';
import { useThreadStore } from '@/stores/messageStores';
import { Message } from '@/types/slack';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function MessageHoverMenu({ message, isThread }: { message: Message, isThread: boolean }) {
    return (
        <TooltipProvider>
            <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5 bg-background border rounded-md shadow-sm [&_svg]:size-4">
                <ReactionButton message={message} />
                <ThreadButton message={message} isThread={isThread} />
            </div>
        </TooltipProvider>
    );
} 

function ReactionButton({ message }: { message: Message }) {
    const { open } = useEmojiPickerStore();
    const { user } = useAuth();

    if (user?.id === message.user?.id) return null;

    const openEmojis = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        open(message, { x: rect.left, y: rect.bottom });
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2" aria-label="React" onClick={openEmojis}>
                    <SmilePlus />
                </Button>
            </TooltipTrigger>
            <TooltipContent>React</TooltipContent>
        </Tooltip>
    );
}

function ThreadButton({ message, isThread }: { message: Message, isThread: boolean }) {
    const { currentChannel } = useWorkspaceStore();
    const { loadMessages } = useThreadStore();

    if (isThread) return null;

    const openThread = () => {
        useThreadStore.setState({ messages: [{...message, is_continuation: false}] });
        currentChannel && loadMessages(currentChannel.id, message.id);
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2" aria-label="Reply" onClick={openThread}>
                    <Reply />
                </Button>
            </TooltipTrigger>
            <TooltipContent>Thread</TooltipContent>
        </Tooltip>
    );
}