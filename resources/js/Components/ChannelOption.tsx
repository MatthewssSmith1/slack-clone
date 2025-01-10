import { cn, formatDMChannelName, ChannelType } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useChannelStore } from '@/stores/channelStore';
import type { Channel } from '@/types/slack';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface Props {
    channel: Channel;
    isCurrent: boolean;
    userName: string;
}

export default function ChannelOption({
    channel,
    isCurrent,
    userName,
}: Props) {
    const { setCurrentChannel } = useChannelStore();

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
            {channel.channel_type === ChannelType.Direct && (
                <div className="relative">
                    <Avatar className="size-5">
                        <AvatarFallback className="text-xs">
                            <User className="size-3" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 size-[7px] rounded-full bg-emerald-400" />
                </div>
            )}
            {channel.channel_type === ChannelType.Direct ? 
                formatDMChannelName(channel.name, userName) : 
                `#${channel.name}`}
        </Button>
    );
} 