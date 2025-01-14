import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ALargeSmall, Send, Plus } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import NewMessageIndicator from './NewMessageIndicator';
import React, { useState } from 'react';
import { MessagesState } from '@/stores/messageStores';
import RichTextButtons from './RichTextButtons';
import { ChannelType } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import axios from 'axios';

interface Props {
    addMessage: MessagesState['addMessage'];
    parentId?: number;
    isThread: boolean;
}

export default function MessageInput({ addMessage, parentId, isThread }: Props) {
    const [message, setMessage] = useState('');
    const [showRichText, setShowRichText] = useState(false);
    const { currentChannel } = useWorkspaceStore();

    if (!currentChannel) return null;

    async function sendMessage(channelId: number) {
        const content = message.trim();
        if (!content) return;

        try {
            const response = await axios.post(
                route('messages.store'),
                { content, channelId, parentId }
            );
            setMessage('');
            addMessage(response.data, true);
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        currentChannel && sendMessage(currentChannel.id);
    }

    return (
        <footer className="bg-background m-4 mt-0 rounded-md relative [&_button]:rounded-full">
            <NewMessageIndicator />
            <form onSubmit={onSubmit} className="border border-border rounded-md bg-card">
                {showRichText && <RichTextButtons />}
                <InputArea 
                    message={message} 
                    setMessage={setMessage} 
                    sendMessage={sendMessage} 
                    isThread={isThread}
                />
                <BottomButtonRow 
                    message={message}
                    showRichText={showRichText}
                    setShowRichText={setShowRichText}
                />
            </form>
        </footer>
    );
}

interface BottomButtonRowProps {
    message: string;
    showRichText: boolean;
    setShowRichText: (show: boolean) => void;
}

function BottomButtonRow({ message, showRichText, setShowRichText }: BottomButtonRowProps) {
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

interface InputAreaProps {
    message: string;
    setMessage: (message: string) => void;
    sendMessage: (channelId: number) => Promise<void>;
    isThread: boolean;
}

function InputArea({ message, setMessage, sendMessage, isThread }: InputAreaProps) {
    const { currentChannel } = useWorkspaceStore();
    const { user } = useAuth();

    let placeholder = '';

    if (isThread) {
        placeholder = 'Reply...';
    } else if (currentChannel && user) {
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