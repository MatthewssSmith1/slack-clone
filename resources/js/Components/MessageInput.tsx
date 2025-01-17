import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FileUpload, FileWithPreview } from '@/components/ui/file-upload';
import React, { useMemo, useState } from 'react';
import { useAssistantFilterStore } from './AssistantFilter';
import { useWorkspaceStore } from '@/stores/workspaceStore';
import NewMessageIndicator from './NewMessageIndicator';
import { MessagesState } from '@/stores/messageStores';
import { ChannelType } from '@/lib/utils';
import { Send, Plus } from 'lucide-react';
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
    const { currentChannel } = useWorkspaceStore();
    // const [showRichText, setShowRichText] = useState(false);
    const [showFileUpload, setShowFileUpload] = useState(false);

    const [message, setMessage] = useState<string>('');
    const [attachment, setAttachment] = useState<FileWithPreview | null>(null);
    const canSendMessage = useMemo(
        () => message.trim() !== '' || attachment !== null, 
        [message, attachment]
    );

    if (!currentChannel) return null;

    async function sendMessage() {
        if (!canSendMessage || !currentChannel) return;

        const content = message.trim();
        
        const formData = new FormData();
        formData.append('content', content);
        // should this be a string if its `['sometimes', 'integer', 'exists:messages,id']` on the backend:
        if (parentId) formData.append('parentId', parentId.toString()); 
        if (attachment) formData.append('attachment', attachment);

        if (currentChannel.channel_type === ChannelType.Assistant)
            formData.append('assistantOpts', JSON.stringify(useAssistantFilterStore.getState()));

        setMessage('');
        setAttachment(null);
        setShowFileUpload(false);

        try {
            // TODO: optimistic update
            const response = await axios.post(route('messages.store', { channel: currentChannel.id }), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            addMessage(response.data, true);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        sendMessage();
    }

    const handleFilesUploaded = (files: FileWithPreview | FileWithPreview[] | null) => {
        if (!files) return;
        const file = Array.isArray(files) ? files[0] : files;
        setAttachment(file);
    };

    return (
        <footer className="bg-background m-4 mt-0 rounded-md relative [&_button]:rounded-full">
            <NewMessageIndicator />
            <form onSubmit={onSubmit} className="border border-border rounded-md bg-card">
                {/* {showRichText && <RichTextButtons />} */}
                <InputArea
                    message={message}
                    setMessage={setMessage}
                    sendMessage={sendMessage}
                    isThread={isThread}
                />
                {showFileUpload && <FileUpload onFilesUploaded={handleFilesUploaded} />}
                <BottomButtonRow
                    // message={message}
                    // showRichText={showRichText}
                    // setShowRichText={setShowRichText}
                    showFileUpload={showFileUpload}
                    setShowFileUpload={setShowFileUpload}
                    canSendMessage={canSendMessage}
                />
            </form>
        </footer>
    );
}

interface BottomButtonRowProps {
    // showRichText: boolean;
    // setShowRichText: (show: boolean) => void;
    showFileUpload: boolean;
    setShowFileUpload: (show: boolean) => void;
    canSendMessage: boolean;
}

function BottomButtonRow({ showFileUpload, setShowFileUpload, canSendMessage }: BottomButtonRowProps) {
    return (
        <div className="flex p-2 border-border/50 border-t">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => setShowFileUpload(!showFileUpload)}
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
            {/* <TooltipProvider>
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
            </TooltipProvider> */}
            <div className="grow" />
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" disabled={!canSendMessage} size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Send className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Send message</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

interface InputAreaProps {
    message: string;
    setMessage: (message: string) => void;
    sendMessage: () => Promise<void>;
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
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            }}
            className="min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 rounded-none px-3 py-[10px]"
        />
    );
} 