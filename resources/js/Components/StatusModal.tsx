import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';
import { colorOfStatus, UserStatus, labelOfStatus, iconOfStatus, getAllStatuses } from '@/lib/status';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import axios from 'axios';

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

export default function StatusModal({ currentStatus }: StatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<UserStatus | 'custom'>(currentStatus);
    const [customStatus, setCustomStatus] = useState('');
    const { isOpen, close } = useStatusModal();
    const { user } = useAuth();
    const { updateStatus } = useUserStore();

    useEffect(() => {
        if (user?.status && user.status.includes(':')) {
            const [_, message] = user.status.split(':');
            setCustomStatus(message);
            setSelectedStatus('custom');
        } else {
            setCustomStatus('');
        }
    }, [user?.status]);

    const handleStatusChange = async () => {
        await updateStatus(user.id, selectedStatus);
        await axios.patch(route('users.update', user.id), { status: selectedStatus });
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
                        {getAllStatuses().map((status) => {
                            const Icon = iconOfStatus(status);
                            return (
                                <Button
                                    key={status}
                                    variant={selectedStatus === status ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    <Icon 
                                        className="mr-2 size-4 rounded-full transition-colors" 
                                        style={{ color: colorOfStatus(status) }} 
                                    />
                                    {labelOfStatus(status)}
                                </Button>
                            );
                        })}
                    </div>

                    <div className={cn(
                        "space-y-2 transition-opacity duration-200",
                        selectedStatus === 'Custom' 
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    )}>
                        <Input
                            id="custom-status"
                            value={customStatus}
                            onChange={(e) => setCustomStatus(e.target.value)}
                            placeholder="What's on your mind?"
                            maxLength={100}
                            className="focus-visible:ring-2"
                        />
                    </div>
                </div>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={close}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleStatusChange}
                        disabled={selectedStatus === 'custom' && !customStatus.trim()}
                    >
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 