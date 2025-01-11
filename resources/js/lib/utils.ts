import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDMChannelName(csvStr: string, exclude: string): string {
  return csvStr.split(', ').filter(name => name !== exclude).join(', ');
}

export enum ChannelType {
  Public = 0,
  Private = 1,
  Direct = 2,
}

// Optional: Add a helper function to get the label, mirroring the PHP enum's label() method
export function getChannelTypeLabel(type: ChannelType): string {
  return {
    [ChannelType.Public]: 'Public Channel',
    [ChannelType.Private]: 'Private Channel',
    [ChannelType.Direct]: 'Direct Message',
  }[type];
}
