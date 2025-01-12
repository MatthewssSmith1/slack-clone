import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Bold, Italic, ALargeSmall, Code, Link as LinkIcon, Send, Plus, ChevronDown, Strikethrough, List, ListOrdered, Quote, CodeSquare } from 'lucide-react';
import { useMessageInputStore } from '@/stores/messageInputStore';
import { useChannelStore } from '@/stores/channelStore';
import { useMessageStore } from '@/stores/messageStore';
import { ChannelType } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function MessageInput() {
    const { sendMessage } = useMessageInputStore();
    const { openChannel } = useChannelStore();
    
    if (!openChannel) return null;

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        openChannel && sendMessage(openChannel.id);
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
    const { showRichText } = useMessageInputStore();

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
    const { showRichText, setShowRichText, isSubmitting, message } = useMessageInputStore();
    const hasMessage = message.trim().length > 0;
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
                        <Button type="submit" disabled={isSubmitting || !hasMessage} size="sm" variant="ghost" className="h-8 w-8 p-0">
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

function NewMessageIndicator() {
    const { showNewMsgIndicator, hideNewMsgIndicator } = useMessageStore();
    
    const scrollToBottom = () => {
        const messagesEnd = document.getElementById('messages-end');
        messagesEnd?.scrollIntoView({ behavior: 'smooth' });
        hideNewMsgIndicator();
    };
    
    if (!showNewMsgIndicator) return null;
    
    return (
        <div 
            onClick={scrollToBottom}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary/70 text-primary-foreground rounded-full text-sm animate-in fade-in cursor-pointer hover:bg-primary/90 flex items-center gap-1.5 shadow-md"
        >
            <span>New message</span>
            <ChevronDown className="h-4 w-4" />
        </div>
    );
}

function InputArea() {
    const { message, setMessage, isSubmitting, sendMessage } = useMessageInputStore();
    const { openChannel } = useChannelStore();
    const { user } = useAuth();

    let placeholder = '';
    
    if (openChannel && user) {
        if (openChannel.channel_type === ChannelType.Direct) {
            const otherUsers = openChannel.name
                .split(', ')
                .filter(name => name !== user.name);
            placeholder = `Message ${otherUsers}`;
        } else {
            placeholder = `Message #${openChannel.name}`;
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
                if (!message.trim() || isSubmitting || !openChannel) return;
                sendMessage(openChannel.id);
            }} 
            className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none px-3 py-[10px]" 
        />
    );
} 