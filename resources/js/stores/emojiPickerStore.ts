import { create } from 'zustand'
import { Message } from '@/types/slack'

interface Position {
  x: number
  y: number
}

interface EmojiPickerState {
  targetMessage: Message | null
  position: Position | null
  open: (message: Message, position: Position) => void
  close: () => void
}

export const useEmojiPickerStore = create<EmojiPickerState>((set) => ({
  targetMessage: null,
  position: null,
  open: (message, position) => set({ targetMessage: message, position }),
  close: () => set({ targetMessage: null, position: null }),
})) 