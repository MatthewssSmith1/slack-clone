import { Bold, Italic, Underline, Code, Link as LinkIcon, Send, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ChannelType, type Channel } from '@/lib/utils';
import { useMessageStore } from '@/stores/messageStore';

interface Props {
    currentChannel: Channel;
    currentUserName: string;
}

export default function MessageInput({ 
    currentChannel,
    currentUserName,
}: Props) {
    const { message, isSubmitting, setMessage, sendMessage, showNewMessageIndicator, hideNewMessageIndicator } = useMessageStore();

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        e.preventDefault();
        
        if (message.trim() && !isSubmitting) sendMessage(currentChannel.id);
    };

    const getPlaceholder = () => {
        if (currentChannel.channel_type === ChannelType.Direct) {
            const otherUsers = currentChannel.name.split(', ').filter(name => name !== currentUserName);
            return `Message ${otherUsers.join(', ')}`;
        }
        return `Message #${currentChannel.name}`;
    };

    return (
        <div className="bg-background m-4 mt-0 rounded-md relative">
            {showNewMessageIndicator && (
                <div 
                    onClick={() => {
                        const messagesEnd = document.getElementById('messages-end');
                        messagesEnd?.scrollIntoView({ behavior: 'smooth' });
                        hideNewMessageIndicator();
                    }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-primary/70 text-primary-foreground rounded-full text-sm animate-in fade-in cursor-pointer hover:bg-primary/90 flex items-center gap-1.5 shadow-md"
                >
                    <span>New message</span>
                    <ChevronDown className="h-4 w-4" />
                </div>
            )}
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(currentChannel.id);
                }} 
                className="border border-border rounded-md bg-card"
            >
                {/* Top Button Row */}
                <div className="flex gap-2 p-2">
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Bold className="h-4 w-4" />
                        <span className="sr-only">Bold</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Italic className="h-4 w-4" />
                        <span className="sr-only">Italic</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Underline className="h-4 w-4" />
                        <span className="sr-only">Underline</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Code className="h-4 w-4" />
                        <span className="sr-only">Code</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <LinkIcon className="h-4 w-4" />
                        <span className="sr-only">Link</span>
                    </Button>
                </div>

                {/* Textarea */}
                <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={getPlaceholder()}
                    className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none px-3 py-2"
                />

                {/* Bottom Button Row */}
                <div className="flex justify-between p-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    type="button" 
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                >
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
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting || !message.trim()}
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Send</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </form>
        </div>
    );
} 