import { useMessagesWebsocket } from '@/hooks/use-messages-websocket';
import ChannelView from '@/Components/ChannelView';
import AuthLayout from '@/Layouts/AuthLayout';
import EmojiPicker from '@/Components/EmojiPicker';

export default function Dashboard() {
    useMessagesWebsocket();

    return (
        <AuthLayout>
            <ChannelView />
            <EmojiPicker />
        </AuthLayout>
    );
} 