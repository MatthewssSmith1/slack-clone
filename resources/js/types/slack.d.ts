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
    user_ids: number[];
} 

export interface Link {
    tooltip: string;
    rank: number | null;
    channel_id: number;
    message_id: number | null;
    title: string;
    created_at: string;
    // For file attachments and references
    attachment_path?: string;
    attachment_name?: string;
    // For grouping chunks from the same file
    chunk_index?: number;
}

export interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
    reactions: Reaction[];
    is_continuation?: boolean;
    parent_id?: number;
    links: Link[];
}

export interface Reaction {
    userIds: number[];
    emoji: string;
}