import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { LucideIcon } from "lucide-react";
import { Control } from "react-hook-form";

export interface SelectPillProps {
    text: string;
    icon: LucideIcon;
    control: Control<any>;
    fieldName?: string;
    value?: number | number[];
    onToggle?: (isSelected: boolean) => void;
    ariaLabel?: string;
}

export default function SelectPill({ 
    text, 
    icon: Icon, 
    control, 
    fieldName = "selectedUsers",
    value,
    onToggle,
    ariaLabel,
}: SelectPillProps) {
    return (
        <FormField
            control={control}
            name={fieldName}
            render={({ field }) => {
                const isSelected = value !== undefined 
                    ? Array.isArray(value) 
                        ? value.length === field.value?.length 
                        : field.value?.includes(value)
                    : false;

                return (
                    <FormItem>
                        <FormControl>
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={isSelected}
                                aria-label={ariaLabel || `Select ${text}`}
                                className={`w-full h-9 px-3 rounded-full text-sm font-medium transition-all duration-200 ease-in-out relative overflow-hidden flex items-center justify-start gap-2
                                    ${isSelected 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                    }`}
                                onClick={() => {
                                    if (onToggle) {
                                        onToggle(isSelected);
                                    } else if (value !== undefined) {
                                        const currentValue = field.value || [];
                                        const newValue = Array.isArray(value)
                                            ? (isSelected ? [] : value)
                                            : (isSelected
                                                ? currentValue.filter((id: number) => id !== value)
                                                : [...currentValue, value]);
                                        field.onChange(newValue);
                                    }
                                }}
                            >
                                <Icon className={`h-4 w-4 shrink-0 relative z-10 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                <span className="relative z-10 truncate min-w-0">{text}</span>
                                <AnimatedBackground isVisible={isSelected} />
                            </button>
                        </FormControl>
                    </FormItem>
                );
            }}
        />
    );
}

interface AnimatedBackgroundProps {
    isVisible: boolean;
}

export function AnimatedBackground({ isVisible }: AnimatedBackgroundProps) {
    return (
        <div 
            aria-hidden="true"
            className={`absolute inset-0 transition-transform duration-100 ease-in-out bg-primary origin-center
                ${isVisible ? 'scale-100' : 'scale-0'}`}
        />
    );
}