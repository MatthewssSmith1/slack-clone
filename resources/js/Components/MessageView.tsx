import { useWorkspaceStore } from '@/stores/workspaceStore';
import { User as UserIcon } from 'lucide-react';
import MessageHoverMenu from '@/Components/MessageHoverMenu';
import ResourcePreview from '@/Components/ResourcePreview';
import ReactionList from '@/Components/ReactionList';
import { useAuth } from '@/hooks/use-auth';
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
                <nav className="flex flex-wrap gap-2 mt-2">
                    {message.links?.map((link, i) => (
                        <ResourcePreview
                            key={i}
                            link={link}
                            onClick={() => {
                                if (link.attachment_path) {
                                    window.location.href = route('attachments.download', { message: message.id });
                                } else if (link.message_id) {
                                    const { currentChannel, setCurrentChannel } = useWorkspaceStore.getState();
                                    if (currentChannel?.id !== link.channel_id) {
                                        setCurrentChannel(link.channel_id);
                                    }
                                    // TODO: scroll to message
                                }
                            }}
                        />
                    ))}
                </nav>
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
    const { user } = useAuth();

    if (message.is_continuation) return null;

    let name = 'You';
    if (message?.user?.id !== user?.id) 
        name = message.user?.name || 'Assistant';

    return (
        <div className="flex items-center gap-2 mb-0.5">
            <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>
            <span className="text-xs mt-[1px] text-muted-foreground select-none whitespace-nowrap">
                {new Date(message.created_at).toLocaleTimeString([], TIME_FORMAT)}
            </span>
        </div>
    );
}