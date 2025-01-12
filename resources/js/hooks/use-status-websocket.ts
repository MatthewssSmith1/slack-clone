import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserStore } from '@/stores/userStore';

export function useStatusWebsocket() {
    const { user } = useAuth();
    const { updateStatus } = useUserStore();

    useEffect(() => {
        window.Echo?.leave('status');

        window.Echo.channel('status')
            .listen('StatusChanged', ({ userId, status }: { userId: number; status: string }) => {
                if (userId === user.id) return;
                
                updateStatus(userId, status);
            });

        return () => window.Echo?.leave('status');
    }, [user.id]);
} 