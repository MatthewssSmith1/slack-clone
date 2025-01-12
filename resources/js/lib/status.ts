import { Activity, Clock, Moon, BellOff, Pencil } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/use-auth';

export enum UserStatus {
    Active = 'Active',
    Away = 'Away',
    DND = 'Do Not Disturb',
    Offline = 'Offline',
    Custom = 'Custom',
}

export function getAllStatuses(): UserStatus[] {
    return Object.values(UserStatus);
}

export function useUserStatus(userId?: number) {
    const { users } = useUserStore();
    const { user } = useAuth();
    userId ??= user.id;
    
    return parseUserStatus(users.find(u => u.id === userId)?.status || UserStatus.Active);
} 

export function parseUserStatus(status: string): UserStatus {
    const str = status.toLowerCase();
    if (str.includes('active')) return UserStatus.Active;
    if (str.includes('away')) return UserStatus.Away;
    if (str.includes('disturb')) return UserStatus.DND;
    if (str.includes('offline')) return UserStatus.Offline;
    return UserStatus.Custom;
}

export const STATUS_COLORS = {
    [UserStatus.Active]: '#10b981',
    [UserStatus.Away]: '#f59e0b',
    [UserStatus.DND]: '#ef4444',
    [UserStatus.Offline]: '#6b7280',
    [UserStatus.Custom]: '#a855f7',
} as const;

export const STATUS_LABELS = {
    [UserStatus.Active]: 'Active',
    [UserStatus.Away]: 'Away',
    [UserStatus.DND]: 'Do not disturb',
    [UserStatus.Offline]: 'Offline',
    [UserStatus.Custom]: 'Custom Status',
} as const;

export const STATUS_ICONS = {
    [UserStatus.Active]: Activity,
    [UserStatus.Away]: Clock,
    [UserStatus.DND]: BellOff,
    [UserStatus.Offline]: Moon,
    [UserStatus.Custom]: Pencil,
} as const;