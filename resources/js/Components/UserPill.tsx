import { User2 } from "lucide-react";
import { User } from "@/types/slack";
import { Control } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
} from "@/components/ui/form";

interface UserPillProps {
    user: User;
    control: Control<any>;
}

export default function UserPill({ user, control }: UserPillProps) {
    return (
        <FormField
            control={control}
            name="selectedUsers"
            render={({ field }) => {
                const isSelected = field.value?.includes(user.id);
                return (
                    <FormItem>
                        <FormControl>
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={isSelected}
                                aria-label={`Select ${user.name}`}
                                className={`w-full h-9 px-3 rounded-full text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden flex items-center justify-start gap-2
                                    ${isSelected 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                    }`}
                                onClick={() => {
                                    const currentValue = field.value || [];
                                    const newValue = isSelected
                                        ? currentValue.filter((id: number) => id !== user.id)
                                        : [...currentValue, user.id];
                                    field.onChange(newValue);
                                }}
                            >
                                <User2 className={`h-4 w-4 shrink-0 relative z-10 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                <span className="relative z-10 truncate min-w-0">{user.name}</span>
                                <div 
                                    aria-hidden="true"
                                    className={`absolute inset-0 transition-transform duration-200 ease-in-out bg-primary
                                        ${isSelected ? 'translate-x-0' : 'translate-x-[calc(-100%_-_4px)]'}`}
                                />
                            </button>
                        </FormControl>
                    </FormItem>
                );
            }}
        />
    );
} 