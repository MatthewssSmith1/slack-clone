import { Activity, Clock, Moon, BellOff, Pencil, LucideIcon } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/use-auth';

export enum UserStatus {
    Active = 'Active',
    Away = 'Away',
    DND = 'Do Not Disturb',
    Offline = 'Offline',
    Custom = 'Custom',
}

export function useUserStatus(userId?: number) {
    const { users } = useUserStore();
    const { user } = useAuth();
    const targetId = userId ?? user.id;
    
    return parseUserStatus(users.find(u => u.id === targetId)?.status || UserStatus.Active);
} 

export function parseUserStatus(status: string): UserStatus {
    const lowered = status.toLowerCase();
    if (lowered.includes('active')) return UserStatus.Active;
    if (lowered.includes('away')) return UserStatus.Away;
    if (lowered.includes('dnd') || lowered.includes('disturb')) return UserStatus.DND;
    if (lowered.includes('offline')) return UserStatus.Offline;
    return UserStatus.Custom;
}

export function colorOfStatus(status?: UserStatus): string {
    const colors = {
        [UserStatus.Active]: '#10b981',
        [UserStatus.Away]: '#f59e0b',
        [UserStatus.DND]: '#ef4444',
        [UserStatus.Offline]: '#6b7280',
        [UserStatus.Custom]: '#a855f7',
    };
    return status ? colors[status] : 'bg-gray-400';
}

export function labelOfStatus(status: UserStatus): string {
    const labels = {
        [UserStatus.Active]: 'Active',
        [UserStatus.Away]: 'Away',
        [UserStatus.DND]: 'Do not disturb',
        [UserStatus.Offline]: 'Offline',
        [UserStatus.Custom]: 'Custom Status',
    };
    return labels[status];
}

export function iconOfStatus(status: UserStatus): LucideIcon {
    const icons = {
        [UserStatus.Active]: Activity,
        [UserStatus.Away]: Clock,
        [UserStatus.DND]: BellOff,
        [UserStatus.Offline]: Moon,
        [UserStatus.Custom]: Pencil,
    };
    return icons[status];
}

export function getAllStatuses(): UserStatus[] {
    return Object.values(UserStatus);
}