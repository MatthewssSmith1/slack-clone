import { useChannelStore } from '@/stores/channelStore';
import { UsersIcon, Hash } from 'lucide-react';
import { formatDMChannelName } from '@/lib/utils';
import { ChannelType } from '@/lib/utils';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Head } from '@inertiajs/react';

export default function ChannelHeader() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HeaderContent />
        </Suspense>
    );
}

function HeaderContent() {
    const { user } = useAuth();
    const currentChannel = useChannelStore(state => state.currentChannel);
    const users_count = useChannelStore(state => state.currentChannel?.users_count ?? 0);
    
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
                
                {currentChannel.channel_type !== ChannelType.Direct && (
                    <MemberCount count={users_count} />
                )}
            </nav>
        </>
    );
}

function ChannelPrefix() {
    return <Hash className="size-5 shrink-0 text-muted-foreground" />;
}

function MemberCount({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground" title={`${count} members in channel`}>
            <UsersIcon className="h-4 w-4" />
            <span className="text-sm">{count}</span>
        </div>
    );
} 