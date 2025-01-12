import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/use-auth';

export function useUserStatus(userId?: number) {
    const store = useUserStore();
    const { user } = useAuth();
    const targetId = userId ?? user.id;
    
    return parseUserStatus(store.users.find(u => u.id === targetId)?.status || UserStatus.Active);
} 

export enum UserStatus {
    Active = 'Active',
    Away = 'Away',
    DND = 'Do Not Disturb',
    Offline = 'Offline'
}

export function parseUserStatus(status: string): UserStatus {
    const lowered = status.toLowerCase();
    if (lowered.includes('away')) return UserStatus.Away;
    if (lowered.includes('dnd') || lowered.includes('disturb')) return UserStatus.DND;
    if (lowered.includes('offline')) return UserStatus.Offline;
    return UserStatus.Active; // Default to Active for unrecognized status
}