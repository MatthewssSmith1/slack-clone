import { User as UserIcon, Reply, SmilePlus } from 'lucide-react';
import { Message, Reaction } from '@/types/slack';
import { useMemo } from 'react';
import { useMessageStore } from '@/stores/messageStore';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { useEmojiPickerStore } from '@/stores/emojiPickerStore';
import axios from 'axios';
import { cn } from '@/lib/utils';

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit'
};

interface GroupedReaction {
    emoji_code: string;
    users: Reaction['user'][];
    count: number;
}

export default function MessageView({ message }: { message: Message }) {
    const isContinuation = message.isContinuation;
    const { user } = useAuth();
    const { updateReaction } = useMessageStore();

    if (!user) return null;

    const isCurrentUser = message.user.id === user.id;

    const handleRemoveReaction = async () => {
        try {
            updateReaction(message.id, user, '', true);
            
            await axios.delete(route('reactions.destroy', { message: message.id }));
        } catch (error) {
            updateReaction(message.id, user, '', false);
            console.error('Failed to remove reaction:', error);
        }
    };

    return (
        <div className="flex items-start gap-3 px-4 py-1 group hover:bg-background relative">
            <div className={cn(
                "w-8 mt-1.5",
                isContinuation ? "h-2" : "h-8 rounded-full bg-muted flex items-center justify-center"
            )}>
                {!isContinuation && <UserIcon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex-1">
                {!isContinuation && (
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium">{message.user.name}</span>
                        <span className="text-xs mt-[1px] text-muted-foreground select-none">
                            {new Date(message.created_at).toLocaleTimeString([], TIME_FORMAT)}
                        </span>
                    </div> 
                )}
                <p className="text-sm text-foreground">
                    {message.content}
                </p>
                <ReactionList 
                    reactions={message.reactions}
                    userId={user.id}
                    message={message}
                    onRemoveReaction={handleRemoveReaction}
                />
            </div>
            {!isCurrentUser && (
                <MessageHoverMenu message={message} />
            )}
        </div>
    );
}

interface ReactionListProps {
    reactions: Reaction[];
    userId: number;
    message: Message;
    onRemoveReaction: () => void;
}

function ReactionList({ reactions, userId, message, onRemoveReaction }: ReactionListProps) {
    const { open } = useEmojiPickerStore();
    const groupedReactions = useMemo(() => {
        if (!reactions) return [];

        const groups = reactions.reduce((acc, reaction) => {
            const existing = acc.find(g => g.emoji_code === reaction.emoji_code);
            if (existing) {
                existing.users.push(reaction.user);
                existing.count++;
            } else {
                acc.push({
                    emoji_code: reaction.emoji_code,
                    users: [reaction.user],
                    count: 1
                });
            }
            return acc;
        }, [] as GroupedReaction[]);

        return groups;
    }, [reactions]);

    if (groupedReactions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
            {groupedReactions.map(({ emoji_code, count, users }) => {
                const hasReacted = users.some(u => u?.id === userId);
                return (
                    <button
                        key={emoji_code}
                        onClick={(e) => {
                            if (hasReacted) {
                                onRemoveReaction();
                            } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                open(message, { x: rect.left, y: rect.bottom });
                            }
                        }}
                        className={`inline-flex items-center gap-1 text-xs rounded-full px-1 py-0.5 hover:bg-muted transition-colors ${
                            hasReacted ? 'bg-muted' : 'bg-background'
                        }`}
                        title={users.map(u => u?.name).join(', ')}
                    >
                        <span>{emoji_code}</span>
                        <span className="text-muted-foreground">{count}</span>
                    </button>
                );
            })}
        </div>
    );
}

interface MessageHoverMenuProps {
    message: Message;
}

function MessageHoverMenu({ message }: MessageHoverMenuProps) {
    const { open } = useEmojiPickerStore();

    return (
        <div className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-0.5 bg-background border rounded-md shadow-sm">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        open(message, { x: rect.left, y: rect.bottom });
                    }}
                >
                    <SmilePlus className="h-4 w-4" />
                    <span className="sr-only">React</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                    <Reply className="h-4 w-4" />
                    <span className="sr-only">Reply</span>
                </Button>
            </div>
        </div>
    );
} 