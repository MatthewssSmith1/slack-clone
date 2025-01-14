import { ChannelType } from '@/lib/utils';

export interface User {
    id: number;
    name: string;
    email: string;
    status?: string;
    is_current?: boolean;
    email_verified_at?: string;
}

export interface Channel {
    id: number;
    name: string;
    description: string | null;
    channel_type: ChannelType;
    users: User[];
} 

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
    isContinuation?: boolean;
    reactions: Reaction[];
}

export interface Reaction {
    userIds: number[];
    emoji: string;
}