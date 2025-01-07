import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UsersIcon, Bold, Italic, Underline, Code, Link as LinkIcon, Send, Plus, User } from 'lucide-react';
import { PageProps } from '@/types';
import { FormEvent, useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface User {
    id: number;
    name: string;
    profile_picture: string | null;
}

interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
}

interface Channel {
    id: number;
    name: string;
    users_count: number;
    messages: Message[];
}

interface Props extends PageProps {
    channels: Channel[];
    currentChannel: Channel;
}

export default function Dashboard({ channels, currentChannel, auth }: Props) {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localMessages, setLocalMessages] = useState<Message[]>(
        currentChannel.messages
    );
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    // Subscribe to WebSocket events
    useEffect(() => {
        // Clean up previous subscription if any
        window.Echo?.leave(`channel.${currentChannel.id}`);
        
        // Subscribe to the new channel
        const channel = window.Echo
            .private(`channel.${currentChannel.id}`)
            .listen('MessagePosted', (event: { message: Message }) => {
                // Only add the message if it's not from the current user
                if (event.message.user.id !== auth.user.id) {
                    setLocalMessages(prev => [...prev, event.message]);
                }
            });

        // Cleanup on unmount or channel change
        return () => {
            window.Echo?.leave(`channel.${currentChannel.id}`);
        };
    }, [currentChannel.id, auth.user.id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post<Message>(route('messages.store', currentChannel.id), {
                content: message,
            });

            setLocalMessages(prev => [...prev, response.data]);
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            channels={channels}
            currentChannel={currentChannel}
        >
            <Head title={`#${currentChannel.name} | Dashboard`} />

            <div className="flex flex-col h-screen">
                {/* Channel Header */}
                <div className="border-b border-border bg-card">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h1 className="text-xl font-semibold">
                            #{currentChannel.name}
                        </h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UsersIcon className="w-4 h-4" />
                            <span className="text-sm">{currentChannel.users_count}</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-background p-4">
                    <div className="space-y-4">
                        {localMessages.map((message) => (
                            <div key={message.id} className="flex items-start gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{message.user.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(message.created_at).toLocaleTimeString([], { 
                                                hour: 'numeric', 
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input Area */}
                <div className="bg-background p-4">
                    <form onSubmit={handleSubmit} className="border border-border rounded-md bg-card">
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
                            placeholder={`Message #${currentChannel.name}`}
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
            </div>
        </AuthenticatedLayout>
    );
}
