import { UserStatus, parseUserStatus } from '@/lib/utils';
import { useEffect, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';

export function useUserStatus(userId: number) {
    const status = useUserStore(
        state => parseUserStatus(state.users.find(u => u.id === userId)?.status || 'active')
    );

    const { updateLocalStatus, updateStatus: updateStoreStatus, fetchUsers } = useUserStore();

    const updateStatus = useCallback(async (newStatus: UserStatus) => {
        updateLocalStatus(userId, newStatus);
        await updateStoreStatus(newStatus);
    }, [userId, updateLocalStatus, updateStoreStatus]);

    useEffect(() => {
        const store = useUserStore.getState();
        store.initializeWebSocket();
        if (store.users.length === 0) {
            fetchUsers();
        }
    }, [fetchUsers]);

    return { status, updateStatus };
} 