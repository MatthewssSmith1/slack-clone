import { Earth, CircleSlash, User2 } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUserStore } from "@/stores/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Control } from "react-hook-form";
import SelectPill from "@/Components/SelectPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Channel, User } from "@/types/slack";
import { useEffect } from "react";
import axios from "axios";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";

const formSchema = z.object({
    name: z.string()
        .min(1, "Channel name is required")
        .max(30, "Channel name cannot exceed 30 characters"),
    selectedUsers: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateChannelModal({ open, onOpenChange }: Props) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            selectedUsers: [],
        },
    });

    const { users } = useUserStore();
    useEffect(() => {
        if (users.length > 0) {
            const filteredUserIds = users
                .filter(user => !user.is_current)
                .map(user => user.id);
                
            form.reset({
                ...form.getValues(),
                selectedUsers: filteredUserIds,
            });
        }
    }, [users]);

    const canSubmit = Boolean(form.watch("name")) && form.watch("selectedUsers").length > 0;

    async function onSubmit(values: FormValues) {
        try {
            const response = await axios.post<{ channel: Channel }>(route('channels.store'), values);
            useWorkspaceStore.getState().appendChannel(response.data.channel);
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create channel:', error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[80vw] max-w-[550px]">
                <DialogHeader className="text-center w-full mb-3">
                    <DialogTitle className="select-nonecenter">New Channel</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Organize conversations with a dedicated channel for your group.
                </DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
                        <NameField control={form.control} />
                        <UsersSelect control={form.control} users={users} watch={form.watch} />
                        <DialogFooter className="flex justify-center sm:justify-center">
                            <Button 
                                type="submit" 
                                disabled={!canSubmit}
                            >
                                Create Channel
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

function NameField({ control }: { control: Control<FormValues> }) {
    return (
        <FormField
            control={control}
            name="name"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                        <Input placeholder="general" {...field} />
                    </FormControl>
                    <FormDescription>
                        Choose a name for your channel.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

function UsersSelect({ control, users, watch }: { 
    control: Control<FormValues>;
    users: User[];
    watch: (name: "selectedUsers") => number[];
}) {
    const filteredUsers = users.filter(user => !user.is_current);
    const selectedUsers = watch("selectedUsers");
    const allUserIds = filteredUsers.map(u => u.id);
    const allSelected = selectedUsers?.length === filteredUsers.length && 
        allUserIds.every(id => selectedUsers.includes(id));

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
                <FormLabel className="font-semibold">Select members</FormLabel>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredUsers.map((user) => (
                    <SelectPill 
                        key={user.id} 
                        text={user.name}
                        icon={User2}
                        value={user.id}
                        control={control} 
                    />
                ))}
                <SelectPill
                    text={allSelected ? "Deselect All" : "Select All"}
                    icon={allSelected ? CircleSlash : Earth}
                    value={allUserIds}
                    control={control}
                    ariaLabel={allSelected ? "Deselect all users" : "Select all users"}
                />
            </div>
        </div>
    );
} 