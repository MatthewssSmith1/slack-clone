import { User, ChevronDown } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { useAuth } from '@/hooks/use-auth';

export default function SidebarHeader() {
    const { user } = useAuth();

    return (
        <Dropdown className="col-start-1 row-start-1 px-2 py-1 border-b border-r border-border bg-card">
            <Dropdown.Trigger className="flex items-center justify-between h-full">
                <button className="my-auto flex items-center w-full text-left rounded-md hover:bg-muted/50 p-2">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center me-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content>
                <Dropdown.Link href={route('profile.edit')}>
                    Profile
                </Dropdown.Link>
                <Dropdown.Link href={route('logout')} method="post" as="button">
                    Log Out
                </Dropdown.Link>
            </Dropdown.Content>
        </Dropdown>
    );
} 