import { formatDMChannelName, ChannelType } from '@/lib/utils';
import type { Message, Channel } from '@/lib/utils';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useMessageStore } from '@/stores/messageStore';
import type { PageProps } from '@/types';
import MessageInput from '@/Components/MessageInput';
import MessagesArea from '@/Components/MessagesArea';
import { UsersIcon } from 'lucide-react';
import { useEffect } from 'react';
import { Head } from '@inertiajs/react';

interface Props extends PageProps<{ 
    channels: Channel[];
    currentChannel: Channel;
}> {}

export default function Dashboard({ channels, currentChannel, auth }: Props) {
    const { 
        localMessages, 
        setLocalMessages, 
        addMessage
    } = useMessageStore();

    useEffect(() => {
        setLocalMessages(currentChannel.messages);
    }, [currentChannel.id]);

    useEffect(() => {
        // Clean up previous WebSocket subscription if any
        window.Echo?.leave(`channel.${currentChannel.id}`);
        
        window.Echo
            .private(`channel.${currentChannel.id}`)
            .listen('MessagePosted', (event: { message: Message }) => {
                // Only add the message if it's not from the current user
                if (event.message.user.id === auth.user.id) return;

                // Let MessagesArea determine if we should scroll
                addMessage(event.message, false);
            });

        return () => {
            window.Echo?.leave(`channel.${currentChannel.id}`);
        };
    }, [currentChannel.id, auth.user.id]);

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
                            {currentChannel.channel_type !== ChannelType.Direct ? 
                                `#${currentChannel.name}` : 
                                formatDMChannelName(currentChannel.name, auth.user.name)}
                        </h1>
                        {currentChannel.channel_type !== ChannelType.Direct && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <UsersIcon className="w-4 h-4" />
                                <span className="text-sm">{currentChannel.users_count}</span>
                            </div>
                        )}
                    </div>
                </div>

                <MessagesArea currentUserId={auth.user.id} />

                <MessageInput 
                    currentChannel={currentChannel}
                    currentUserName={auth.user.name}
                />
            </div>
        </AuthenticatedLayout>
    );
}
