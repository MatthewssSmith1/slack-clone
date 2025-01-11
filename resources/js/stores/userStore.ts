import { UserStatus } from '@/lib/status';
import { create } from 'zustand';
import { User } from '@/types/slack';
import axios from 'axios';

interface UserState {
    users: User[];
    currentUserId: number | null;
    fetchUsers: () => Promise<void>;
    updateStatus: (status: UserStatus, customMessage?: string) => Promise<void>;
    currentUser: User | undefined;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],
    currentUserId: null,
    currentUser: undefined,

    fetchUsers: async () => {
        try {
            const response = await axios.get<User[]>(route('users.index'));
            const currentUser = response.data.find(user => user.is_current);

            console.log({ currentUser, users: response.data });

            set({
                users: response.data,
                currentUserId: currentUser?.id || null,
                currentUser: currentUser || undefined
            });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    },

    updateStatus: async (status: UserStatus, customMessage?: string) => {
        const state = useUserStore.getState();
        if (!state.currentUserId) return;

        const statusString = customMessage ? `${status}:${customMessage}` : status;

        // Only update the current user's status
        const updateUserState = (state: UserState) => {
            const updatedUsers = state.users.map(user =>
                user.id === state.currentUserId 
                    ? { ...user, status: statusString } 
                    : user
            );

            return {
                users: updatedUsers,
                currentUser: updatedUsers.find(u => u.id === state.currentUserId)
            };
        };

        // Optimistic update for current user only
        set(updateUserState);

        try {
            await axios.post(route('user.status.update'), { status: statusString });
        } catch (error) {
            console.error('Failed to update status:', error);
            // Revert on error
            set(state => ({
                users: state.users.map(user =>
                    user.id === state.currentUserId 
                        ? { ...user, status: state.currentUser?.status || status } 
                        : user
                ),
                currentUser: state.currentUser
            }));
        }
    },
})); 