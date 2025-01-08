declare interface User {
    id: number;
    name: string;
    profile_picture: string | null;
}

declare interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
}

declare interface Channel {
    id: number;
    name: string;
    users_count: number;
    channel_type: ChannelType;
    messages: Message[];
} 