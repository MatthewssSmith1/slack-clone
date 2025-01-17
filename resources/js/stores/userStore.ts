import { UserStatus } from '@/lib/status';
import { create } from 'zustand';
import { User } from '@/types/slack';
import axios from 'axios';

interface UserState {
    users: User[];
    fetchUsers: () => Promise<void>;
    updateStatus: (userId: number, status: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    users: [],

    fetchUsers: async () => {
        const response = await axios.get<User[]>(route('users.index'));

        console.log(response.data);

        if (response.status === 200) set({ users: response.data });
    },

    updateStatus: async (userId: number, status: string) => {
        set((state: UserState) => ({
            users: state.users.map(user => user.id === userId ? { ...user, status } : user)
        }));
    },
})); 