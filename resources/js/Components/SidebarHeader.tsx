import StatusModal, { useStatusModal } from '@/Components/StatusModal';
import Dropdown, { DropDownContext } from '@/Components/Dropdown';
import { User, ChevronDown } from 'lucide-react';
import { useUserStatus } from '@/lib/status';
import StatusIndicator from '@/Components/StatusIndicator';
import { useContext } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function SidebarHeader() {
    return (
        <>
            <Dropdown as="nav" className="col-start-1 row-start-1 p-1.5 bg-card border-border border-b border-r">
                <Trigger />
                <Content />
            </Dropdown>

            <StatusModal />
        </>
    );
}

function Trigger() {
    const { user } = useAuth();

    return (
        <Dropdown.Trigger>
            <Button
                variant="ghost"
                className="w-full justify-start h-auto p-2"
            >
                <div className="relative w-8 h-8 rounded-full bg-muted flex items-center justify-center me-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <StatusIndicator userId={user.id} className="size-[9px] right-0 bottom-0" />
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
    );
}

function Content() {
    const { setOpen } = useContext(DropDownContext);
    const { open } = useStatusModal();
    const status = useUserStatus();

    return (
        <Dropdown.Content>
            <Dropdown.Link href="#" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                open(status);
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
    );
}