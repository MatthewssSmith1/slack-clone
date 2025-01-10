import { ChannelType } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import SidebarSection from '@/Components/SidebarSection';

export default function Sidebar() {
    return (
        <ScrollArea 
            as="aside" 
            className="col-start-1 row-start-2 flex flex-col items-stretch gap-6 border-r border-border bg-card"
        >
            <SidebarSection title="Channels"        channelType={ChannelType.Public} addButtonText="Add Channel" />
            <div className="mx-3 my-4 bg-border h-px" />
            <SidebarSection title="Direct Messages" channelType={ChannelType.Direct} addButtonText="New Message" />
        </ScrollArea>
    );
}