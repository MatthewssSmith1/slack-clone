import { ChannelType } from '@/lib/utils';

export interface User {
    id: number;
    name: string;
    email: string;
    status?: string;
    is_current?: boolean;
}

export interface Reaction {
    user: User;
    emoji_code: string;
}

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
    isContinuation?: boolean;
    formatted_reactions: Reaction[];
}

export interface Channel {
    id: number;
    name: string;
    description: string | null;
    channel_type: ChannelType;
    users: User[];
    users_count: number;
} 