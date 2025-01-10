import { Bold, Italic, ALargeSmall, Code, Link as LinkIcon, Send, Plus, ChevronDown, Strikethrough, List, ListOrdered, Quote, CodeSquare } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useMessageStore } from '@/stores/messageStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChannelStore } from '@/stores/channelStore';
import { ChannelType } from '@/lib/utils';

export default function MessageInput() {
    const { message, isSubmitting, setMessage, sendMessage, showNewMsgIndicator, hideNewMsgIndicator } = useMessageStore();
    const [showRichText, setShowRichText] = useState(false);
    const { user } = useAuth();
    const { currentChannel } = useChannelStore();
    if (!currentChannel) return null;

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== 'Enter' || e.shiftKey) return;
        e.preventDefault();
        
        if (message.trim() && !isSubmitting) sendMessage(currentChannel.id);
    };

    const getPlaceholder = () => {
        if (currentChannel.channel_type === ChannelType.Direct) {
            const otherUsers = currentChannel.name.split(', ').filter(name => name !== user.name);
            return `Message ${otherUsers.join(', ')}`;
        }
        return `Message #${currentChannel.name}`;
    };

    return (
        <div className="bg-background m-4 mt-0 rounded-md relative [&_button]:rounded-full">
            {showNewMsgIndicator && (
                <div 
                    onClick={() => {
                        const messagesEnd = document.getElementById('messages-end');
                        messagesEnd?.scrollIntoView({ behavior: 'smooth' });
                        hideNewMsgIndicator();
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
                {showRichText && (
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
                )}

                {/* Textarea */}
                <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder={getPlaceholder()}
                    className="min-h-[100px] resize-none border-0 focus-visible:ring-0 rounded-none px-3 py-[10px]"
                />

                {/* Bottom Button Row */}
                <div className="flex p-2">
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
                                    type="button" 
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setShowRichText(!showRichText)}
                                >
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