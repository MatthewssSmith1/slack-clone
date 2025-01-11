import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserStatus } from '@/lib/status';
import { Activity, Clock, Moon, BellOff } from 'lucide-react';
import { create } from 'zustand';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface StatusModalStore {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

export const useStatusModal = create<StatusModalStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));

interface StatusModalProps {
    currentStatus: UserStatus;
}

const statusOptions = [
    { id: UserStatus.Active, label: 'Active', icon: Activity, color: 'text-emerald-500' },
    { id: UserStatus.Away, label: 'Away', icon: Clock, color: 'text-yellow-500' },
    { id: UserStatus.Offline, label: 'Offline', icon: Moon, color: 'text-gray-400' },
    { id: UserStatus.DND, label: 'Do not disturb', icon: BellOff, color: 'text-red-500' },
] as const;

export default function StatusModal({ currentStatus }: StatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<UserStatus>(currentStatus);
    const { isOpen, close } = useStatusModal();
    const { updateStatus } = useUserStore();

    const handleStatusChange = async () => {
        await updateStatus(selectedStatus);
        close();
    };

    return (
        <Dialog 
            open={isOpen} 
            onOpenChange={(open) => {
                if (!open) close();
            }}
        >
            <DialogContent 
                className="sm:max-w-sm"
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Set your status</DialogTitle>
                    <DialogDescription>
                        Choose your availability status to let others know when you're around.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <div className="grid gap-2">
                        {statusOptions.map(({ id, label, icon: Icon, color }) => (
                            <Button
                                key={id}
                                variant={selectedStatus === id ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start",
                                )}
                                onClick={() => setSelectedStatus(id)}
                            >
                                <Icon className={cn("mr-2 size-4 rounded-full transition-colors", color)} />
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={close}>
                        Cancel
                    </Button>
                    <Button onClick={handleStatusChange}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 