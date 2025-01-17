import { Bot, Globe, Hash, User } from 'lucide-react';
import { ChannelType } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ChannelIconProps {
    channelType: ChannelType;
    className?: string;
}

export default function ChannelIcon({ channelType, className }: ChannelIconProps) {
    const classes = cn("size-4 shrink-0 text-muted-foreground", className);

    if (channelType === ChannelType.All)
        return <Globe className={classes} />;

    if (channelType === ChannelType.Assistant)
        return <Bot className={classes} />;

    if (channelType === ChannelType.Public) 
        return <Hash className={classes} />;

    if (channelType === ChannelType.Direct)
        return <User className={classes} />;

    return null;
} 