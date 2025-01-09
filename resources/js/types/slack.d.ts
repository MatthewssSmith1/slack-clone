export interface User {
    id: number;
    name: string;
    email: string;
    profile_picture?: string | null;
}

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
}

export interface Channel {
    id: number;
    name: string;
    users_count: number;
    channel_type: ChannelType;
    messages: Message[];
}

export type ChannelType = 'public' | 'private' | 'direct'; 