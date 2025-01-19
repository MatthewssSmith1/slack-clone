import { HeaderWrapper, HeaderTitle } from './Header';
import { formatDMChannelName } from '@/lib/utils';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { UsersIcon } from 'lucide-react';
import { ChannelType } from '@/lib/utils';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import ChannelIcon from './ChannelIcon';
import { Head } from '@inertiajs/react';
import AssistantOptions from './AssistantOptions';

export default function ChannelHeader() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Content />
        </Suspense>
    );
}

function Content() {
    const { user } = useAuth();
    const { currentChannel, userCount } = useWorkspaceStore();

    if (!currentChannel) return null;

    const channelType = currentChannel.channel_type;
    const displayName = channelType !== ChannelType.Direct
        ? currentChannel.name
        : formatDMChannelName(currentChannel.name, user.name);

    return (
        <>
            <Head title={`${channelType === ChannelType.Direct ? '' : '#'}${displayName} | Slack Clone`} />
            <HeaderWrapper className="col-start-2">
                <HeaderTitle>
                    <ChannelIcon channelType={channelType} className="size-5" />
                    {displayName}
                </HeaderTitle>

                <div className="grow" />

                {channelType === ChannelType.Public && <MemberCount count={userCount} />}
                {channelType === ChannelType.Assistant && <AssistantOptions />}
            </HeaderWrapper>
        </>
    );
}

function MemberCount({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-2 text-muted-foreground select-none" title={`${count} members in channel`}>
            <UsersIcon className="h-4 w-4" />
            <span className="text-sm">{count}</span>
        </div>
    );
}