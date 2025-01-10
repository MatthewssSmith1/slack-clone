import { cn, formatDMChannelName, ChannelType } from '@/lib/utils';
import { useChannelStore } from '@/stores/channelStore';
import type { Channel } from '@/types/slack';
import { Button } from '@/components/ui/button';

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
                "w-full justify-start px-2 py-2 h-auto hover:bg-muted/50",
                isCurrent && "bg-muted"
            )}
        >
            {channel.channel_type === ChannelType.Direct ? 
                formatDMChannelName(channel.name, userName) : 
                `#${channel.name}`}
        </Button>
    );
} 