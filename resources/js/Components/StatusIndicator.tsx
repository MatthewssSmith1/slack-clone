import { cn } from '@/lib/utils';
import { statusColors } from '@/lib/utils';
import { useUserStatus } from '@/hooks/use-user-status';

interface StatusIndicatorProps {
    userId: number;
    className?: string;
}

export default function StatusIndicator({ userId, className }: StatusIndicatorProps) {
    const { status } = useUserStatus(userId);

    return (
        <div 
            className={cn(
                'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background',
                statusColors[status],
                'z-10',
                className
            )}
            aria-label={`User status: ${status}`}
        />
    );
} 