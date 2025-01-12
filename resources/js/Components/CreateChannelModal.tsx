import { Earth, CircleSlash } from "lucide-react";
import { useUserStore } from "@/stores/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserPill from "@/Components/UserPill";
import * as z from "zod";
import { useEffect } from "react";
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
} from "@/components/ui/dialog";

const formSchema = z.object({
    name: z.string()
        .min(1, "Channel name is required")
        .max(80, "Channel name cannot exceed 80 characters")
        .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens are allowed"),
    isPublic: z.boolean().default(true),
    selectedUsers: z.array(z.number()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateChannelModal({ open, onOpenChange }: Props) {
    const users = useUserStore(state => state.users);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            isPublic: true,
            selectedUsers: [],
        },
    });

    useEffect(() => {
        if (users.length > 0) {
            form.reset({
                ...form.getValues(),
                selectedUsers: users.map(user => user.id),
            });
        }
    }, [users]);

    function onSubmit(values: FormValues) {
        console.log(values);
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader className="text-center w-full mb-3">
                    <DialogTitle className="select-nonecenter">New Channel</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="project-name" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use lowercase letters, numbers, and hyphens only.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <FormLabel className="font-semibold">Add members</FormLabel>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {users.map((user) => (
                                    <UserPill 
                                        key={user.id} 
                                        user={user} 
                                        control={form.control} 
                                    />
                                ))}
                                <FormField
                                    control={form.control}
                                    name="selectedUsers"
                                    render={({ field }) => {
                                        const allSelected = users.length === (field.value?.length || 0);
                                        
                                        return (
                                            <FormItem>
                                                <FormControl>
                                                    <button
                                                        type="button"
                                                        role="checkbox"
                                                        aria-checked={allSelected}
                                                        aria-label={allSelected ? "Deselect all users" : "Select all users"}
                                                        className={`w-full h-9 px-3 rounded-full text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden flex items-center justify-start gap-2
                                                            ${allSelected 
                                                                ? 'bg-primary text-primary-foreground' 
                                                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                                            }`}
                                                        onClick={() => {
                                                            field.onChange(allSelected ? [] : users.map(u => u.id));
                                                        }}
                                                    >
                                                        {allSelected ? (
                                                            <CircleSlash className="h-4 w-4 shrink-0 relative z-10 text-primary-foreground" />
                                                        ) : (
                                                            <Earth className="h-4 w-4 shrink-0 relative z-10 text-muted-foreground" />
                                                        )}
                                                        <span className="relative z-10 truncate min-w-0">
                                                            {allSelected ? "Deselect All" : "Select All"}
                                                        </span>
                                                        <div 
                                                            aria-hidden="true"
                                                            className={`absolute inset-0 transition-transform duration-200 ease-in-out bg-primary
                                                                ${allSelected ? 'translate-x-0' : 'translate-x-[calc(-100%_-_4px)]'}`}
                                                        />
                                                    </button>
                                                </FormControl>
                                            </FormItem>
                                        );
                                    }}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="isPublic"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md my-2">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormLabel>Public channel</FormLabel>
                                    <FormDescription>
                                        Anyone in the workspace can view and join
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex justify-center sm:justify-center">
                            <Button type="submit">Create Channel</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 