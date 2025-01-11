import { ChannelType } from '@/lib/utils';

export interface User {
    id: number;
    name: string;
    email: string;
    status?: string;
    is_current?: boolean;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
    isContinuation?: boolean;
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
    messages: Message[];
} 