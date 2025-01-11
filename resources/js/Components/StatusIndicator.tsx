import { useUserStatus, UserStatus } from '@/lib/status';
import { cn } from '@/lib/utils';

export default function StatusIndicator({ userId, className }: { userId: number; className?: string;}) {
    const status = useUserStatus(userId);

    if (!status) return null;

    return (
        <div
            role="status"
            aria-label={`Your status is ${status}`}
            className={cn(
                'absolute -bottom-0.5 -right-0.5 size-[7px] rounded-full z-10 content-[""] saturate-[0.9] brightness-[1.1]',
                colorOfStatus(status), 
                className
            )}
            style={{
                backgroundColor: colorOfStatus(status),
            }}
        >
            <span className="sr-only">{status}</span>
        </div>  
    );
} 

export function colorOfStatus(status: UserStatus | null | undefined): string {
    const colors = {
        'Active': '#10b981',
        'Away': '#f59e0b',
        'Do Not Disturb': '#ef4444',
        'Offline': '#6b7280',
        'Custom': '#a855f7',
    };
    return status ? colors[status] : 'bg-gray-400';
}