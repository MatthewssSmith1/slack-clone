import { Suspense, useEffect } from 'react';
import { useChannelStore } from '@/stores/channelStore';
import MessageInput from '@/Components/MessageInput';
import MessagesArea from '@/Components/MessagesArea';
import MainHeader from '@/Components/MainHeader';
import AuthLayout from '@/Layouts/AuthLayout';

export default function Dashboard({ channel }: { channel?: string }) {
    const { fetchChannels, setCurrentChannel } = useChannelStore();

    useEffect(() => {
        fetchChannels().then(() => {
            if (channel) setCurrentChannel(Number(channel));
        });
    }, []);

    return (
        <AuthLayout>
            <Suspense fallback={<div>Loading...</div>}>
                <MainHeader />
            </Suspense>
            <main className="col-start-2 row-start-2 grid grid-rows-[1fr_auto] overflow-hidden bg-muted">
                <Suspense fallback={<div>Loading...</div>}>
                    <MessagesArea />
                </Suspense>
                <MessageInput />
            </main>
        </AuthLayout>
    );
} 