import { ChannelType } from '@/lib/utils';

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
    description: string | null;
    channel_type: ChannelType;
    created_at: string;
    updated_at: string;
    users: User[];
    users_count: number;
} 