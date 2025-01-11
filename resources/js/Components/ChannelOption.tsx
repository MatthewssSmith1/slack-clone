import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChannelStore } from '@/stores/channelStore';
import type { Channel } from '@/types/slack';
import { Button } from '@/components/ui/button';
import StatusIndicator from './StatusIndicator';
import { User, Hash } from 'lucide-react';
import { ChannelType } from '@/lib/utils';

interface Props {
    channel: Channel;
    isCurrent: boolean;
}

function DirectPrefix({ userId }: { userId: number }) {
    return (
        <div className="relative overflow-visible">
            <Avatar className="size-5">
                <AvatarFallback className="text-xs">
                    <User className="size-3" />
                </AvatarFallback>
            </Avatar>
            <StatusIndicator userId={userId} />
        </div>
    );
}

function PublicPrefix() {
    return <Hash className="size-4 shrink-0 text-muted-foreground" />;
}

export default function ChannelOption({ channel, isCurrent }: Props) {
    const { setCurrentChannel } = useChannelStore();

    // For DM channels, find the other user's ID
    const otherUserId = channel.channel_type === ChannelType.Direct
        ? channel.users[0]?.id
        : null;
    
    return (
        <Button
            variant="ghost"
            role="menuitem"
            onClick={() => setCurrentChannel(channel.id)}
            className={cn(
                "w-full justify-start gap-2 px-2 py-2 h-auto hover:bg-muted/50",
                isCurrent && "bg-muted"
            )}
        >
            {channel.channel_type === ChannelType.Direct ? 
                otherUserId && <DirectPrefix userId={otherUserId} /> :
                <PublicPrefix />}
            {channel.name}
        </Button>
    );
} 