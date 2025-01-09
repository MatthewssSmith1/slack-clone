import { UsersIcon } from 'lucide-react';
import { ChannelType } from '@/lib/constants';
import { formatDMChannelName } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { useChannelStore } from '@/stores/channelStore';

export default function MainHeader() {
    const { user } = useAuth();
    const { currentChannel } = useChannelStore();
    if (!currentChannel) return null;
    
    const displayName = currentChannel.channel_type !== ChannelType.Direct 
        ? `#${currentChannel.name}` 
        : formatDMChannelName(currentChannel.name, user.name);

    return (
        <>
            <Head title={`${displayName} | Slacking Off`} />
            <nav className="col-start-2 row-start-1 flex items-center justify-between border-b border-border bg-card pl-4 pr-8">
                <h1 className="text-xl font-semibold">
                    {displayName}
                </h1>
                
                <div className="grow" />
                
                {currentChannel.channel_type !== ChannelType.Direct && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <UsersIcon className="h-4 w-4" />
                        <span className="text-sm">{currentChannel.users_count}</span>
                    </div>
                )}
            </nav>
        </>
    );
} 