import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn, getResourceIcon, getResourceDisplayText } from '@/lib/utils';
import { Link as MessageLink } from '@/types/slack';
import { format } from 'date-fns';
import { useWorkspaceStore } from '@/stores/workspaceStore';

interface ResourcePreviewProps {
    link: MessageLink;
    onClick: () => void;
}

export default function ResourcePreview({ link, onClick }: ResourcePreviewProps) {
    const isOwnedAttachment = link?.rank === null && link?.attachment_name;
    const type = isOwnedAttachment ? 'file' : 'message';
    const Icon = getResourceIcon(type, isOwnedAttachment ? link.attachment_name : link.title);
    const displayText = isOwnedAttachment 
        ? link.attachment_name 
        : getResourceDisplayText(type, link.title, link.tooltip, link.chunk_index);

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <button
                    onClick={onClick}
                    className={cn(
                        "inline-flex items-center gap-2 my-1 p-1.5 pr-2",
                        "rounded-lg bg-background group-hover:bg-muted shadow-inner hover:shadow",
                        "transition-all cursor-pointer"
                    )}
                >
                    <Icon className="size-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {displayText}
                    </span>
                </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <div className="space-y-2">
                    <PreviewContent link={link} />
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

function PreviewContent({ link }: { link: MessageLink }) {
    const channels = useWorkspaceStore(state => state.channels);
    const channelName = link?.channel_id ? channels.find(c => c.id === link.channel_id)?.name : '';
    const isOwnedAttachment = link?.rank === null && link?.attachment_name;

    return (
        <div className="space-y-1">
            <div className="flex flex-col">
                {isOwnedAttachment ? (
                    <>
                        <span className="text-sm font-medium">Attached File</span>
                        <span className="text-xs text-muted-foreground">{link.attachment_name}</span>
                    </>
                ) : link.message_id ? (
                    <>
                        <span className="text-sm font-medium">Referenced Message</span>
                        <span className="text-xs text-muted-foreground">
                            {channelName && `#${channelName} • `}
                            {format(new Date(link.created_at), 'MMM d, yyyy')}
                        </span>
                        {link.tooltip && (
                            <p className="text-sm mt-2 text-muted-foreground line-clamp-3">{link.tooltip}</p>
                        )}
                    </>
                ) : (
                    <>
                        <span className="text-sm font-medium">Referenced File</span>
                        <span className="text-xs text-muted-foreground">{link.title}</span>
                        {link.tooltip && (
                            <p className="text-sm mt-2 text-muted-foreground line-clamp-3">{link.tooltip}</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 