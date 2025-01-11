import StatusModal, { useStatusModal } from '@/Components/StatusModal';
import { User, ChevronDown } from 'lucide-react';
import { useUserStatus } from '@/lib/status';
import StatusIndicator from '@/Components/StatusIndicator';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Dropdown from '@/Components/Dropdown';

export default function SidebarHeader() {
    const { user } = useAuth();
    const { open } = useStatusModal();
    const status = useUserStatus(user.id);

    return (
        <>
            <Dropdown className="col-start-1 row-start-1 px-2 py-1 border-b border-r border-border bg-card">
                <Dropdown.Trigger>
                    <Button 
                        variant="ghost" 
                        className="w-full justify-start h-auto py-2 px-2"
                    >
                        <div className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center me-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <StatusIndicator userId={user.id} className="size-[9px]" />
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                            <div className="text-xs text-gray-500">
                                {user.email}
                            </div>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                    </Button>
                </Dropdown.Trigger>

                <Dropdown.Content>
                    <Dropdown.Link href="#" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        open();
                    }}>
                        Set Status
                    </Dropdown.Link>
                    <Dropdown.Link href={route('profile.edit')}>
                        Profile
                    </Dropdown.Link>
                    <Dropdown.Link href={route('logout')} method="post">
                        Log Out
                    </Dropdown.Link>
                </Dropdown.Content>
            </Dropdown>

            <StatusModal currentStatus={status || 'Active'} />
        </>
    );
} 