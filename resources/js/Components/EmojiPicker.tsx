import { useRef, useState, useEffect } from 'react'
import { useEmojiPickerStore } from '@/stores/emojiPickerStore'
import { MessagesState } from '@/stores/messageStores'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import axios from 'axios'

const COMMON_EMOJIS = [
  '👍', '❤️', '🎉', '💯', '🚀', '⭐', '✨', '🌟',
  '😊', '😅', '😆', '🥹', '🥲', '🫡',
  '👋', '🙏', '🤝', '👊', '✌️', '🫶', '👀', '💪',
  '🔥', '💡', '✅', '❌', '⚡', '💫', '🎯', '💎'
]

interface Props {
  updateReaction: MessagesState['updateReaction']
}

export default function EmojiPicker({ updateReaction }: Props) {
  const { position, targetMessage, close } = useEmojiPickerStore()
  const { user } = useAuth()
  const panelRef = useRef<HTMLDivElement>(null)
  const [emoji, setEmoji] = useState<string | null>(null)

  if (!position || !targetMessage || !user) return null

  const submitEmoji = async () => {
    if (!emoji) return;

    try {
      updateReaction(targetMessage.id, user.id, emoji);
      close();
      await axios.post(route('reactions.store', { message: targetMessage.id }), {
        emoji_code: emoji,
      });
      setEmoji(null);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      close();
    } 
  };

  return (
    <div
      ref={panelRef}
      className="fixed flex flex-col p-2 items-center z-50 bg-popover rounded-md shadow-md border"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translateX(-100%) ${position.y > window.innerHeight / 2 ? 'translateY(-100%)' : ''}`
      }}
    >
      <div className="grid grid-cols-6 w-max">
        {COMMON_EMOJIS.map((char, idx) => (
          <button
            key={idx}
            onClick={() => setEmoji(char)}
            className={cn(
              'hover:bg-muted p-1.5 rounded-md text-lg transition-colors',
              emoji === char && 'bg-muted ring-2 ring-primary'
            )}
          >
            {char}
          </button>
        ))}
      </div>
      <Button
        onClick={submitEmoji}
        disabled={!emoji}
        size="sm"
      >
        Add Reaction
      </Button>
    </div>
  )
} 