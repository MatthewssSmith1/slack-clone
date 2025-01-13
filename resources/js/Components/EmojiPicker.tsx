import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useEmojiPickerStore } from '@/stores/emojiPickerStore'
import { useChannelStore } from '@/stores/channelStore'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import * as React from 'react'
import axios from 'axios'

const COMMON_EMOJIS = [
  '👍', '❤️', '🎉', '💯', '🚀', '⭐', '✨', '🌟',
  '😊', '😅', '😆', '🥹', '🥲', '🫡',
  '👋', '🙏', '🤝', '👊', '✌️', '🫶', '👀', '💪',
  '🔥', '💡', '✅', '❌', '⚡', '💫', '🎯', '💎'
]

export default function EmojiPicker() {
  const { isOpen, targetMessage, position, close } = useEmojiPickerStore()
  const { updateReaction } = useChannelStore()
  const { user } = useAuth()
  const [selectedEmoji, setSelectedEmoji] = React.useState<string | null>(null)

  if (!isOpen || !position || !targetMessage || !user) return null

  const handleEmojiSelect = async (emoji: string) => {
    try {
      updateReaction(targetMessage.id, user, emoji, false)
      
      await axios.post(route('reactions.store', { message: targetMessage.id }), {
        emoji_code: emoji,
      })
      setSelectedEmoji(null)
      close()
    } catch (error) {
      updateReaction(targetMessage.id, user, emoji, true)
      console.error('Failed to add reaction:', error)
    }
  }

  const handleConfirm = () => {
    if (selectedEmoji) {
      handleEmojiSelect(selectedEmoji)
    }
  }

  // Calculate if we should show above or below based on position
  const viewportHeight = window.innerHeight
  const shouldShowAbove = position.y > viewportHeight / 2

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
    >
      <Popover open={isOpen} onOpenChange={(open) => !open && close()}>
        <PopoverTrigger asChild>
          <button 
            className="w-1 h-1 p-0 m-0 opacity-0"
            style={{ position: 'absolute' }}
          />
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2 flex flex-col gap-2"
          side={shouldShowAbove ? "top" : "bottom"}
          align="start"
          sideOffset={5}
          onInteractOutside={() => close()}
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
    </div>
  )
} 