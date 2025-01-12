import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/stores/userStore';
import { User } from '@/types/slack';

export function useStatusWebsocket() {
    const { user } = useAuth();
    const { updateStatus } = useUserStore();

    useEffect(() => {
        window.Echo?.leave('status');

        window.Echo.channel('status')
            .listen('StatusChanged', ({ 
                user: updatedUser,
                status 
            }: { 
                user: User;
                status: string;
            }) => {
                if (updatedUser.id !== user.id) {
                    updateStatus(updatedUser.id, status);
                }
            });

        return () => window.Echo?.leave('status');
    }, [user.id]);
} 