import { create } from 'zustand';
import axios from 'axios';
import { User } from '@/types';

interface UserState {
    users: User[];
    isLoading: boolean;
    error: string | null;
    fetchUsers: () => Promise<void>;
    // TODO: Add workspace filtering when workspaces are implemented
    // getCurrentWorkspaceUsers: () => User[];
}

export const useUserStore = create<UserState>((set, get) => ({
    users: [],
    isLoading: true,
    error: null,

    fetchUsers: async () => {
        const { users, isLoading } = get();
        // Skip if already loaded or currently loading
        if (users.length > 0 || isLoading) return;

        try {
            set({ isLoading: true, error: null });
            const response = await axios.get<User[]>(route('users.index'));
            set({ users: response.data, isLoading: false });
        } catch (error) {
            set({ 
                error: 'Failed to fetch users', 
                isLoading: false 
            });
            console.error('Failed to fetch users:', error);
        }
    },
})); 