import { Suspense, useEffect } from 'react';
import { useChannelStore } from '@/stores/channelStore';
import MessageInput from '@/Components/MessageInput';
import MessagesArea from '@/Components/MessagesArea';
import MainHeader from '@/Components/MainHeader';
import Dashboard from '@/Layouts/Dashboard';

type Props = {
    channel?: string;
};

export default function ChannelView({ channel }: Props) {
    const { fetch: fetchChannels, setCurrentChannel } = useChannelStore();

    useEffect(() => {
        // Initial load - fetch channels and set current if specified in URL
        fetchChannels().then(() => {
            if (channel) {
                setCurrentChannel(Number(channel));
            }
        });
    }, []); // Only run on mount

    return (
        <Dashboard>
            <Suspense fallback={<div>Loading...</div>}>
                <MainHeader />
            </Suspense>
            <main className="col-start-2 row-start-2 grid grid-rows-[1fr_auto] overflow-hidden bg-muted">
                <Suspense fallback={<div>Loading...</div>}>
                    <MessagesArea />
                </Suspense>
                <MessageInput />
            </main>
        </Dashboard>
    );
}
