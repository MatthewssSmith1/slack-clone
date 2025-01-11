import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserStatus } from '@/lib/utils';
import { Activity, Clock, Moon, BellOff } from 'lucide-react';
import { create } from 'zustand';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/use-auth';

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
    { id: UserStatus.Active, label: 'Active', icon: Activity },
    { id: UserStatus.Away, label: 'Away', icon: Clock },
    { id: UserStatus.Offline, label: 'Offline', icon: Moon },
    { id: UserStatus.DND, label: 'Do not disturb', icon: BellOff },
] as const;

export default function StatusModal({ currentStatus }: StatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<UserStatus>(currentStatus);
    const { isOpen, close } = useStatusModal();
    const { user } = useAuth();
    const { updateStatus, updateLocalStatus } = useUserStore();

    const handleStatusChange = async () => {
        updateLocalStatus(user.id, selectedStatus);
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
                className="sm:max-w-md"
                onInteractOutside={(e) => {
                    e.preventDefault();
                }}
            >
                <DialogHeader>
                    <DialogTitle>Set your status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        {statusOptions.map(({ id, label, icon: Icon }) => (
                            <Button
                                key={id}
                                variant={selectedStatus === id ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setSelectedStatus(id)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {label}
                            </Button>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button onClick={handleStatusChange}>
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 