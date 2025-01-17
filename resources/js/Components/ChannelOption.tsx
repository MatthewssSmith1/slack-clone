import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import type { Channel } from '@/types/slack';
import StatusIndicator from './StatusIndicator';
import { ChannelType } from '@/lib/utils';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ChannelIcon from './ChannelIcon';

export function SkeletonOption() {
    return <div className="animate-pulse h-9 mt-1 w-full bg-muted rounded-md select-none"></div>;
}

export default function ChannelOption({ channel, isCurrent }: { channel: Channel; isCurrent: boolean }) {
    const { setCurrentChannel } = useWorkspaceStore();

    const otherUserId = channel.channel_type === ChannelType.Direct
        ? channel.user_ids[0] : undefined;
    
    return (
        <div
            className={cn(
                "group flex items-center w-full gap-2 rounded-md hover:bg-muted/80",
                isCurrent && "bg-muted"
            )}
        >
            <Button
                variant="ghost"
                onClick={() => setCurrentChannel(channel.id)}
                className="flex-1 justify-start gap-2 px-2 py-1.5 h-auto hover:bg-transparent"
            >
                { channel.channel_type === ChannelType.Direct 
                    ? <UserProfile userId={otherUserId} /> 
                    : <ChannelIcon channelType={channel.channel_type} /> }
                { channel.name }
            </Button>
        </div>
    );
} 

function UserProfile({ userId }: { userId?: number }) {
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