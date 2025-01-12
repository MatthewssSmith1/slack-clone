import { useUserStatus, colorOfStatus } from '@/lib/status';
import { cn } from '@/lib/utils';

export default function StatusIndicator({ userId, className }: { userId: number; className?: string;}) {
    const status = useUserStatus(userId);

    if (!status) return null;

    return (
        <div
            role="status"
            aria-label={`Status: ${status}`}
            style={{ backgroundColor: colorOfStatus(status) }}
            className={cn(
                'absolute -bottom-0.5 -right-0.5 size-[7px] rounded-full z-10 content-[""]',
                className
            )}
        >
            <span className="sr-only">{status}</span>
        </div>  
    );
} 
