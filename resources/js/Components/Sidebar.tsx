import { useStatusWebsocket } from '@/hooks/use-status-websocket';
import CreateChannelModal from '@/Components/CreateChannelModal';
import SearchModal from '@/Components/SearchModal';
import { ChannelType } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SidebarSection from '@/Components/SidebarSection';
import { useState } from 'react';

export default function Sidebar() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    useStatusWebsocket();

    return (
        <>
            <ScrollArea 
                as="aside" 
                className="col-start-1 row-start-2 flex flex-col gap-6 px-2 border-r border-border bg-card"
            >
                    <Button
                        variant="outline"
                        className="justify-between w-full my-2"
                        onClick={() => setIsSearchModalOpen(true)}
                    >
                        Search Workspace 
                        <Search className="h-4 w-4" />
                    </Button> 
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
            <SearchModal
                open={isSearchModalOpen}
                onOpenChange={setIsSearchModalOpen}
            />
        </>
    );
}