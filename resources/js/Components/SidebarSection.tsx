import { Plus, Settings, Check, ChevronDown } from 'lucide-react';
import ChannelOption, { SkeletonOption } from '@/Components/ChannelOption';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import { ChannelType } from '@/lib/utils';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Dropdown from '@/Components/Dropdown';
import { cn } from '@/lib/utils';

interface Props {
    title: string;
    channelType: ChannelType;
    className?: string;
    addButtonText: string;
    onAddClick?: () => void;
}

export default function SidebarSection({
    title,
    channelType,
    className,
    addButtonText,
    onAddClick,
}: Props) {
    const { channels, currentChannel } = useWorkspaceStore();
    const filteredChannels = channels.filter(channel => channel.channel_type === channelType);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Dropdown as="section" className={cn("first:mt-2 last:mb-2", className)}>
                <Dropdown.Trigger>
                    <Button variant="ghost" className="w-full justify-between font-semibold text-lg text-gray-800 dark:text-gray-200 h-auto py-1">
                        {title} <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </Dropdown.Trigger>
                <DropdownMenu addButtonText={addButtonText} onAddClick={onAddClick} />
                {filteredChannels.map(channel => (
                    <ChannelOption key={channel.id} channel={channel} isCurrent={channel.id === currentChannel?.id} />
                ))}
                { channels.length === 0 && (
                    <>
                        <SkeletonOption />
                        <SkeletonOption />
                        <SkeletonOption />
                    </>
                )}
            </Dropdown>
        </Suspense>
    );
}

function DropdownMenu({ addButtonText, onAddClick }: { addButtonText: string; onAddClick?: () => void }) {
    const buttonClassName = "w-full justify-start h-auto px-4 py-2 font-normal";

    return (
        <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-card [&_svg]:mr-2 [&_svg]:size-4">
            <Button 
                variant="ghost" 
                className={buttonClassName}
                onClick={onAddClick}
                disabled={!onAddClick}
            >
                <Plus />{addButtonText}
            </Button>
            <Button variant="ghost" disabled className={buttonClassName}><Settings />Manage</Button>
            <Button variant="ghost" disabled className={buttonClassName}><Check />Mark all as read</Button>
        </Dropdown.Content>
    );
} 