import { Message } from '@/types/slack';
import { useAuth } from '@/hooks/use-auth';

interface ReactionListProps {
    message: Message;
}

export default function ReactionList({ message }: ReactionListProps) {
    const { reactions } = message;
    const { user } = useAuth();

    if (!reactions?.length) return null;

    return (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
            {reactions.map(({ emoji, userIds }) => {
                const hasReacted = userIds.includes(user.id);
                return (
                    <button
                        key={emoji}
                        className={`inline-flex items-center gap-1 text-xs rounded-full px-1 py-0.5 hover:bg-muted transition-colors ${
                            hasReacted ? 'bg-muted' : 'bg-background'
                        }`}
                        title={`${userIds.length} reaction${userIds.length !== 1 ? 's' : ''}`}
                    >
                        <span>{emoji}</span>
                        <span className="text-muted-foreground">{userIds.length}</span>
                    </button>
                );
            })}
        </div>
    );
} 