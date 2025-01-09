import { PropsWithChildren } from 'react';
import SidebarHeader from '@/Components/SidebarHeader';
import Sidebar from '@/Components/Sidebar';

export default function Dashboard({ children }: PropsWithChildren) {
    return (
        <div className="grid h-screen grid-cols-[var(--sidebar-width)_1fr] grid-rows-[var(--header-height)_1fr]">
            <SidebarHeader />
            <Sidebar />
            {children}
        </div>
    );
}
