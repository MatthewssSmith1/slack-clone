import { Bold, Italic, ALargeSmall, Code, Link as LinkIcon, Send, Plus, Strikethrough, List, ListOrdered, Quote, CodeSquare } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useNewMessageStore } from '@/stores/newMessageStore';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import NewMessageIndicator from './NewMessageIndicator';
import { ChannelType } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import React from 'react';

export default function MessageInput() {
    const { sendMessage } = useNewMessageStore();
    const { currentChannel } = useWorkspaceStore();

    if (!currentChannel) return null;

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        currentChannel && sendMessage(currentChannel.id);
    }

    return (
        <footer className="bg-background m-4 mt-0 rounded-md relative [&_button]:rounded-full">
            <NewMessageIndicator />
            <form onSubmit={onSubmit} className="border border-border rounded-md bg-card">
                <RichTextButtons />
                <InputArea />
                <BottomButtonRow />
            </form>
        </footer>
    );
}

function RichTextButtons() {
    const { showRichText } = useNewMessageStore();
    if (!showRichText) return null;

    return (
        <div className="flex items-center gap-1 p-2 [&>button]:h-8 [&>button]:w-8 [&>button]:p-0 [&_svg]:h-4 [&_svg]:w-4">
            <Button type="button" variant="ghost" size="sm" aria-label="Bold">           <Bold />          </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Italic">         <Italic />        </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Strikethrough">  <Strikethrough /> </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button type="button" variant="ghost" size="sm" aria-label="Link">           <LinkIcon />      </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Ordered List">   <ListOrdered />   </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Unordered List"> <List />          </Button>
            <Separator orientation="vertical" className="h-5 mx-1" />
            <Button type="button" variant="ghost" size="sm" aria-label="Block Quote">    <Quote />         </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Code">           <Code />          </Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Code Square">    <CodeSquare />    </Button>
        </div>
    );
}

function BottomButtonRow() {
    const { message, showRichText, setShowRichText } = useNewMessageStore();

    return (
        <div className="flex p-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Attach</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowRichText(!showRichText)}>
                            <ALargeSmall className="h-4 w-4" />
                            <span className="sr-only">Hide/Show Formatting</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{showRichText ? 'Hide' : 'Show'} Formatting</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <div className="grow" />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" disabled={message.trim().length === 0} size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Send</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

function InputArea() {
    const { message, setMessage, sendMessage } = useNewMessageStore();
    const { currentChannel } = useWorkspaceStore();
    const { user } = useAuth();

    let placeholder = '';

    if (currentChannel && user) {
        if (currentChannel.channel_type === ChannelType.Direct) {
            const otherUsers = currentChannel.name
                .split(', ')
                .filter(name => name !== user.name);
            placeholder = `Message ${otherUsers}`;
        } else {
            placeholder = `Message #${currentChannel.name}`;
        }
    }

    return (
        <Textarea
            value={message}
            placeholder={placeholder}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
                if (e.key !== 'Enter' || e.shiftKey) return;
                e.preventDefault();
                if (!message.trim() || !currentChannel) return;
                sendMessage(currentChannel.id);
            }}
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none px-3 py-[10px]"
        />
    );
} 