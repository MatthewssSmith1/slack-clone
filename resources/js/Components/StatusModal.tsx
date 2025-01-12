import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS, UserStatus, getAllStatuses, parseUserStatus } from '@/lib/status';
import { useUserStore } from '@/stores/userStore';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { create } from 'zustand';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { useMemo } from 'react';

interface StatusModalStore {
    isOpen: boolean;
    newStatus: string;
    setNewStatus: (newStatus: string) => void;
    open: (newStatus: string) => void;
    close: () => void;
}

export const useStatusModal = create<StatusModalStore>((set) => ({
    isOpen: false,
    newStatus: UserStatus.Active,
    setNewStatus: (newStatus: string) => set({ newStatus }),
    open: (newStatus: string) => set({ isOpen: true, newStatus }),
    close: () => set({ isOpen: false }),
}));

export default function StatusModal() {
    const { isOpen, close, newStatus, setNewStatus } = useStatusModal();
    const { updateStatus } = useUserStore();
    const { user } = useAuth();

    const derivedStatus = useMemo(() => {
        return parseUserStatus(newStatus);
    }, [newStatus]);

    const saveStatus = async () => {
        await updateStatus(user.id, newStatus);
        await axios.patch(route('users.update', user.id), { status: newStatus });
        close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }} >
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
                            const Icon = STATUS_ICONS[status];
                            return (
                                <Button
                                    key={status}
                                    variant={newStatus === status ? "secondary" : "ghost"}
                                    className="w-full justify-start select-none"
                                    onClick={() => setNewStatus(status)}
                                >
                                    <Icon
                                        className="mr-2 size-4 rounded-full transition-colors"
                                        style={{ color: STATUS_COLORS[status] }}
                                    />
                                    {STATUS_LABELS[status]}
                                </Button>
                            );
                        })}
                    </div>

                    <div className={cn(
                        "space-y-2 transition-opacity duration-200",
                        derivedStatus === UserStatus.Custom
                            ? "opacity-100 pointer-events-auto"
                            : "opacity-0 pointer-events-none"
                    )}>
                        <Input
                            id="custom-status"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
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
                    <Button onClick={saveStatus}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 