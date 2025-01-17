import { useStatusWebsocket } from '@/hooks/use-status-websocket';
import CreateChannelModal from '@/Components/CreateChannelModal';
import { ChannelType } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import SidebarSection from '@/Components/SidebarSection';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Sidebar() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    useStatusWebsocket();

    return (
        <>
            <ScrollArea as="aside" className="col-start-1 row-start-2 flex flex-col gap-6 px-2 border-r border-border bg-card">
                <SidebarSection channelType={ChannelType.Assistant} />
                <Divider />
                <SidebarSection title="Channels" channelType={ChannelType.Public}>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-2 px-2 py-2 h-auto hover:bg-muted/80"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="size-4 shrink-0 text-muted-foreground" /> New Channel
                    </Button>
                </SidebarSection>
                <Divider />
                <SidebarSection title="Direct Messages" channelType={ChannelType.Direct}>
                    {/* <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-2 h-auto hover:bg-muted/80">
                        <Plus className="size-4 shrink-0 text-muted-foreground" /> New Message
                    </Button> */}
                </SidebarSection>
            </ScrollArea>

            <CreateChannelModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} />
        </>
    );
}

function Divider() {
    return <div className="mx-3 my-2 bg-border h-px" />;
}