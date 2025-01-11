import { UsersIcon, Hash } from 'lucide-react';
import { ChannelType } from '@/lib/utils';
import { formatDMChannelName } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { useAuth } from '@/hooks/use-auth';
import { useChannelStore } from '@/stores/channelStore';
import { Suspense } from 'react';

export default function MainHeader() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HeaderContent />
        </Suspense>
    );
}

function HeaderContent() {
    const { user } = useAuth();
    const { currentChannel } = useChannelStore();
    if (!currentChannel) return null;
    
    const displayName = currentChannel.channel_type !== ChannelType.Direct 
        ? currentChannel.name 
        : formatDMChannelName(currentChannel.name, user.name);

    return (
        <>
            <Head title={`${currentChannel.channel_type === ChannelType.Direct ? '' : '#'}${displayName} | Slacking Off`} />
            <nav className="col-start-2 row-start-1 flex items-center justify-between border-b border-border bg-card pl-4 pr-8">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                    {currentChannel.channel_type !== ChannelType.Direct && <ChannelPrefix />}
                    {displayName}
                </h1>
                
                <div className="grow" />
                
                {currentChannel.channel_type !== ChannelType.Direct && <MemberCount count={currentChannel.users_count} />}
            </nav>
        </>
    );
}

function ChannelPrefix() {
    return <Hash className="size-5 shrink-0 text-muted-foreground" />;
}

function MemberCount({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
            <span className="text-sm">{count}</span>
        </div>
    );
} 