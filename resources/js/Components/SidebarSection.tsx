import { ChannelType } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Plus, Settings, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useChannelStore } from '@/stores/channelStore';
import Dropdown from '@/Components/Dropdown';
import ChannelOption from '@/Components/ChannelOption';
import { Suspense } from 'react';

interface Props {
    title: string;
    channelType: ChannelType;
    className?: string;
    addButtonText: string;
}

export default function SidebarSection({
    title,
    channelType,
    className,
    addButtonText,
}: Props) {
    const { user } = useAuth();
    const { channels, currentChannel } = useChannelStore();
    const filteredChannels = channels.filter(channel => channel.channel_type === channelType);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Dropdown as="section" role="menu" className={cn("px-2 first:mt-2 last:mb-2", className)}>
                <Dropdown.Trigger>
                    <Button variant="ghost" className="w-full justify-between font-semibold text-lg text-gray-800 dark:text-gray-200 h-auto py-1">
                        {title} <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </Dropdown.Trigger>
                <DropdownMenu addButtonText={addButtonText} />
                {filteredChannels.map(channel => (
                    <ChannelOption key={channel.id} channel={channel} isCurrent={channel.id === currentChannel?.id} userName={user.name} />
                ))}
            </Dropdown>
        </Suspense>
    );
}

function DropdownMenu({ addButtonText }: { addButtonText: string; }) {
    const buttonClassName = "w-full justify-start h-auto px-4 py-2 font-normal";

    return (
        <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-card [&_svg]:mr-2 [&_svg]:size-4">
            <Button variant="ghost" disabled className={buttonClassName}><Plus />{addButtonText}</Button>
            <Button variant="ghost" disabled className={buttonClassName}><Settings />Manage</Button>
            <Button variant="ghost" disabled className={buttonClassName}><Check />Mark all as read</Button>
        </Dropdown.Content>
    );
} 