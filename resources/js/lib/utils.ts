import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export interface User {
    id: number;
    name: string;
    profile_picture: string | null;
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
    channel_type: number;
    messages: Message[];
}

export enum ChannelType {
  Public = 0,
  Private = 1,
  Direct = 2
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDMChannelName(channelName: string, currentUserName: string): string {
  // Split the channel name into individual user names
  const userNames = channelName.split(', ');
  
  // Filter out the current user's name and join the remaining names
  return userNames
    .filter(name => name !== currentUserName)
    .join(', ');
}
