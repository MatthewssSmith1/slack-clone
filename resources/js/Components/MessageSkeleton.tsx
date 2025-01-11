import { cn } from '../lib/utils';

interface MessageSkeletonProps {
    delay?: number;
    className?: string;
}

export default function MessageSkeleton({ delay = 0, className }: MessageSkeletonProps) {
    return (
        <div 
            className={cn("flex gap-3 px-4 animate-pulse", className)}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="space-y-3 flex-1">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
        </div>
    );
} 