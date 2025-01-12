import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Message } from '@/types/slack';
import * as React from 'react';
import { Button } from '@/components/ui/button';

// Common emojis for reactions - we can expand this later
const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🙏', '👀', '🚀', '💯'];

interface EmojiSelectProps {
    message: Message;
    children: React.ReactNode;
    onEmojiSelect?: (emoji: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function EmojiSelect({ children, onEmojiSelect, open, onOpenChange }: EmojiSelectProps) {
    const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null);

    const handleConfirm = () => {
        if (selectedEmoji) {
            onEmojiSelect?.(selectedEmoji);
            setSelectedEmoji(null);
            onOpenChange?.(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent 
                className="w-auto p-2 flex flex-col gap-2" 
                align="start"
                side="top"
            >
                <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {COMMON_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => setSelectedEmoji(emoji)}
                            className={`hover:bg-muted p-1.5 rounded-md text-lg transition-colors ${
                                selectedEmoji === emoji ? 'bg-muted ring-2 ring-primary' : ''
                            }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
                <Button 
                    onClick={handleConfirm}
                    disabled={!selectedEmoji}
                    className="w-full mt-1"
                    size="sm"
                >
                    Add Reaction
                </Button>
            </PopoverContent>
        </Popover>
    );
} 