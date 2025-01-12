import { Message, Reaction, User } from '@/types/slack';
import { useEmojiPickerStore } from '@/stores/emojiPickerStore';
import { useMemo } from 'react';

interface GroupedReaction {
    emoji_code: string;
    users: User[];
    count: number;
}

interface ReactionListProps {
    reactions: Reaction[];
    userId: number;
    message: Message;
    onRemoveReaction: () => void;
}

export default function ReactionList({ reactions, userId, message, onRemoveReaction }: ReactionListProps) {
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