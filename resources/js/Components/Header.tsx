import { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export function HeaderTitle({ children, className }: PropsWithChildren<{ className?: string }>) {
    return (
        <h1 className={cn(
            "text-xl font-semibold flex items-center gap-2 select-none",
            className
        )}>
            {children}
        </h1>
    );
}

export function HeaderWrapper({ children, className }: PropsWithChildren<{ className?: string }>) {
    return (
        <nav className={cn(
            "row-start-1 flex items-center justify-between bg-card",
            "border-border border-r border-b",
            "[&_*:first-child]:ml-4 [&_*:last-child]:mr-6 overflow-hidden min-w-0",
            className
        )}>
            {children}
        </nav>
    );
} 