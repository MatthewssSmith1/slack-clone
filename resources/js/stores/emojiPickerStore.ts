import { create } from 'zustand'
import { Message } from '@/types/slack'

interface Position {
  x: number
  y: number
}

interface EmojiPickerState {
  isOpen: boolean
  targetMessage: Message | null
  position: Position | null
  open: (message: Message, position: Position) => void
  close: () => void
}

export const useEmojiPickerStore = create<EmojiPickerState>((set) => ({
  isOpen: false,
  targetMessage: null,
  position: null,
  open: (message, position) => set({ isOpen: true, targetMessage: message, position }),
  close: () => set({ isOpen: false, targetMessage: null, position: null }),
})) 