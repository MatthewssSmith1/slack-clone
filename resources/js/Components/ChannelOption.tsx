import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChannelStore } from '@/stores/channelStore';
import type { Channel } from '@/types/slack';
import StatusIndicator from './StatusIndicator';
import { ChannelType } from '@/lib/utils';
import { User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function SkeletonOption() {
    return <div className="animate-pulse h-9 mt-1 w-full bg-muted rounded-md"></div>;
}

export default function ChannelOption({ channel, isCurrent }: { channel: Channel; isCurrent: boolean }) {
    const { setOpenChannel } = useChannelStore();

    // For DM channels, find the other user's ID
    const otherUserId = channel.channel_type === ChannelType.Direct
        ? channel.users[0]?.id
        : undefined;
    
    return (
        <Button
            variant="ghost"
            onClick={() => setOpenChannel(channel.id)}
            className={cn(
                "w-full justify-start gap-2 px-2 py-2 h-auto hover:bg-muted/50",
                isCurrent && "bg-muted"
            )}
        >
            {channel.channel_type === ChannelType.Direct ? 
                <DirectPrefix userId={otherUserId} /> :
                <PublicPrefix />}
            {channel.name}
        </Button>
    );
} 

function DirectPrefix({ userId }: { userId?: number }) {
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