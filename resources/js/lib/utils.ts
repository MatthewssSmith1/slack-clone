import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDMChannelName(csvStr: string, exclude: string): string {
  return csvStr.split(', ').filter(name => name !== exclude).join(', ');
}
