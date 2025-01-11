import { create } from 'zustand';
import axios from 'axios';
import { User } from '@/types';
import { UserStatus } from '@/lib/utils';

interface UserState {
    users: User[];
    fetchUsers: () => Promise<void>;
    updateLocalStatus: (userId: number, status: UserStatus) => void;
    updateStatus: (status: UserStatus) => Promise<void>;
    initializeWebSocket: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],

    fetchUsers: async () => {
        try {
            const response = await axios.get<User[]>(route('users.index'));
            set({ users: response.data });
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    },

    updateLocalStatus: (userId: number, status: UserStatus) => {
        set(state => ({
            users: state.users.map(user => 
                user.id === userId ? { ...user, status } : user
            )
        }));
    },

    updateStatus: async (status: UserStatus) => {
        try {
            await axios.post(route('user.status.update'), { status });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    },

    initializeWebSocket: () => {
        window.Echo?.private('users')
            .listen('UserStatusChanged', (event: { user: { id: number, status: string } }) => {
                set(state => ({
                    users: state.users.map(user => 
                        user.id === event.user.id 
                            ? { ...user, status: event.user.status }
                            : user
                    )
                }));
            });
    }
})); 