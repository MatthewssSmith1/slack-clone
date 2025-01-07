import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, User } from 'lucide-react';
import { PageProps } from '@/types';
import { formatDMChannelName, ChannelType } from '@/lib/utils';

interface Channel {
    id: number;
    name: string;
    users_count: number;
    channel_type: number;
}

interface Props extends PropsWithChildren {
    channels?: Channel[];
    currentChannel?: Channel;
}

export default function Authenticated({
    children,
    channels = [],
    currentChannel,
}: Props) {
    const { props } = usePage<PageProps>();
    
    // Separate channels by type
    const regularChannels = channels.filter(c => c.channel_type !== ChannelType.Direct);
    const directMessages = channels.filter(c => c.channel_type === ChannelType.Direct);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <div className="w-64 border-r bg-white dark:bg-gray-800 dark:border-gray-700">
                {/* User Profile Section */}
                <div className="p-4 border-b dark:border-gray-700">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center w-full text-left">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center me-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{props.auth.user.name}</div>
                                    <div className="text-xs text-gray-500">{props.auth.user.email}</div>
                                </div>
                                <svg
                                    className="ms-2 h-4 w-4 text-gray-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content>
                            <Dropdown.Link href={route('profile.edit')}>
                                Profile
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>

                {/* Channels and DMs */}
                <ScrollArea className="h-[calc(100vh-5rem)]">
                    <div className="px-4 py-2">
                        {/* Channels Section */}
                        <div className="py-2">
                            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                                Channels
                            </h2>
                            <div className="space-y-1">
                                {regularChannels.map((channel) => (
                                    <Button
                                        key={channel.id}
                                        variant={channel.id === currentChannel?.id ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href={route('channels.show', channel.id)}>
                                            # {channel.name}
                                        </Link>
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Channel
                                </Button>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Direct Messages Section */}
                        <div className="py-2">
                            <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-200">
                                Direct Messages
                            </h2>
                            <div className="space-y-1">
                                {directMessages.map((channel) => (
                                    <Button
                                        key={channel.id}
                                        variant={channel.id === currentChannel?.id ? "secondary" : "ghost"}
                                        className="w-full justify-start"
                                        asChild
                                    >
                                        <Link href={route('channels.show', channel.id)}>
                                            {formatDMChannelName(channel.name, props.auth.user.name)}
                                        </Link>
                                    </Button>
                                ))}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-muted-foreground"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
