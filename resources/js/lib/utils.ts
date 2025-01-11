import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDMChannelName(csvStr: string, exclude: string): string {
  return csvStr.split(', ').filter(name => name !== exclude).join(', ');
}

export enum ChannelType {
  Public = 0,
  Private = 1,
  Direct = 2,
}

// Optional: Add a helper function to get the label, mirroring the PHP enum's label() method
export function getChannelTypeLabel(type: ChannelType): string {
  return {
    [ChannelType.Public]: 'Public Channel',
    [ChannelType.Private]: 'Private Channel',
    [ChannelType.Direct]: 'Direct Message',
  }[type];
}

export enum UserStatus {
    Active = '🟢 Active',
    Away = '🌙 Away',
    DND = '⛔ Do Not Disturb',
    Offline = '⭕ Offline'
}

export const statusColors: Record<UserStatus, string> = {
    [UserStatus.Active]: 'bg-emerald-500',
    [UserStatus.Away]: 'bg-yellow-500',
    [UserStatus.DND]: 'bg-red-500',
    [UserStatus.Offline]: 'bg-gray-400',
};

export function parseUserStatus(status: string): UserStatus {
    const lowered = status.toLowerCase();
    if (lowered.includes('active')) return UserStatus.Active;
    if (lowered.includes('away')) return UserStatus.Away;
    if (lowered.includes('dnd') || lowered.includes('disturb')) return UserStatus.DND;
    if (lowered.includes('offline')) return UserStatus.Offline;
    return UserStatus.Active; // Default to Active for unrecognized status
}
