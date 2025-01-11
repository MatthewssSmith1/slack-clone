import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserStatus } from '@/lib/status';
import { Activity, Clock, Moon, BellOff, Pencil } from 'lucide-react';
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
    { id: UserStatus.Custom, label: 'Custom Status', icon: Pencil, color: 'text-purple-500' },
] as const;

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
        if (selectedStatus === 'custom') {
            await updateStatus(UserStatus.Active, customStatus.trim() || undefined);
        } else {
            await updateStatus(selectedStatus);
        }
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

                    <div className={cn(
                        "space-y-2 transition-opacity duration-200",
                        selectedStatus === 'custom' 
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