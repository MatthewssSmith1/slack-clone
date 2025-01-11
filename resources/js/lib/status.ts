import { useUserStore } from '@/stores/userStore';

export function useUserStatus(userId: number) {
    const store = useUserStore();
    return parseUserStatus(store.users.find(u => u.id === userId)?.status || UserStatus.Active);
} 

export enum UserStatus {
    Active = 'Active',
    Away = 'Away',
    DND = 'Do Not Disturb',
    Offline = 'Offline',
    Custom = 'Custom'
}

export function parseUserStatus(status: string): UserStatus {
    const lowered = status.toLowerCase();
    if (lowered.includes('active')) return UserStatus.Active;
    if (lowered.includes('away')) return UserStatus.Away;
    if (lowered.includes('dnd') || lowered.includes('disturb')) return UserStatus.DND;
    if (lowered.includes('offline')) return UserStatus.Offline;
    return UserStatus.Custom; // Default to Custom for unrecognized status
}