import { useStatusWebsocket } from '@/hooks/use-status-websocket';
import CreateChannelModal from '@/Components/CreateChannelModal';
import { ChannelType } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import SidebarSection from '@/Components/SidebarSection';
import { useState } from 'react';

export default function Sidebar() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    useStatusWebsocket();

    return (
        <>
            <ScrollArea 
                as="aside" 
                className="col-start-1 row-start-2 flex flex-col items-stretch gap-6 border-r border-border bg-card"
            >
                <SidebarSection 
                    title="Channels" 
                    channelType={ChannelType.Public} 
                    addButtonText="Add Channel" 
                    onAddClick={() => setIsCreateModalOpen(true)}
                />
                <div className="mx-3 my-4 bg-border h-px" />
                <SidebarSection 
                    title="Direct Messages" 
                    channelType={ChannelType.Direct} 
                    addButtonText="New Message" 
                />
            </ScrollArea>

            <CreateChannelModal 
                open={isCreateModalOpen} 
                onOpenChange={setIsCreateModalOpen} 
            />
        </>
    );
}