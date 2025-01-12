import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Message } from '@/types/slack';

// Common emojis for reactions - we can expand this later
const COMMON_EMOJIS = ['👍', '❤️', '😂', '🎉', '🙏', '👀', '🚀', '💯'];

interface EmojiSelectProps {
    message: Message;
    children: React.ReactNode;
    onEmojiSelect?: (emoji: string) => void;
}

export default function EmojiSelect({ message, children, onEmojiSelect }: EmojiSelectProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent 
                className="w-auto p-2" 
                align="start"
                side="top"
            >
                <div className="flex gap-1 flex-wrap max-w-[200px]">
                    {COMMON_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => onEmojiSelect?.(emoji)}
                            className="hover:bg-muted p-1.5 rounded-md text-lg transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
} 