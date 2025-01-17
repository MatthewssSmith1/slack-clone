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
  Assistant = 3,
  All = 4,
}