import { Suspense, useEffect } from 'react';
import { useChannelStore } from '@/stores/channelStore';
import MessageInput from '@/Components/MessageInput';
import MessagesArea from '@/Components/MessagesArea';
import MainHeader from '@/Components/MainHeader';
import Dashboard from '@/Layouts/Dashboard';

type Params = {
    channel?: string;
};

export default function ChannelView({ params }: { params: Params }) {
    const { fetch: fetchChannels, setCurrentChannel } = useChannelStore();
    const channelId = params?.channel;

    useEffect(() => {
        fetchChannels().then(() => {
            if (channelId) {
                setCurrentChannel(Number(channelId));
            }
        });
    }, [channelId]);

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
