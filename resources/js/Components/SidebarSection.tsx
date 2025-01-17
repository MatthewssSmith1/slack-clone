import ChannelOption, { SkeletonOption } from '@/Components/ChannelOption';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ChannelType } from '@/lib/utils';
import { PropsWithChildren } from 'react';

interface Props {
    title?: string;
    channelType: ChannelType;
}

export default function SidebarSection({
    title,
    channelType,
    children,
}: PropsWithChildren<Props>) {
    const { channels, currentChannel } = useWorkspaceStore();
    const filteredChannels = channels.filter(channel => channel.channel_type === channelType);

    return (
        <section className="first:mt-2 last:mb-2 space-y-1">
            {title && <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200 px-2 py-1 select-none">
                {title}
            </h2>}
            
            {filteredChannels.map(channel => (
                <ChannelOption key={channel.id} channel={channel} isCurrent={channel.id === currentChannel?.id} />
            ))}
            
            {channels.length === 0 && (
                <>
                    <SkeletonOption />
                    <SkeletonOption />
                    <SkeletonOption />
                </>
            )}

            {children}
        </section>
    );
} 