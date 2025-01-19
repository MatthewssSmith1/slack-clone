import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, FileCode, FileImage, FileAudio, FileVideo, File, Link } from 'lucide-react';

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

export const FILE_ICONS: Record<string, typeof FileText> = {
  // Code files
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  php: FileCode,
  // Images
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  // Audio
  mp3: FileAudio,
  wav: FileAudio,
  // Video
  mp4: FileVideo,
  mov: FileVideo,
};

export function getResourceIcon(type: 'file' | 'message', fileName?: string) {
  if (type === 'message') return Link;
  
  const extension = fileName?.split('.').pop()?.toLowerCase();
  return extension ? (FILE_ICONS[extension] ?? FileText) : File;
}

export function getResourceDisplayText(type: 'file' | 'message', fileName?: string, tooltip?: string, chunkIndex?: number) {
  if (type === 'file') return fileName;
  
  return chunkIndex !== undefined
    ? `${tooltip} (${chunkIndex})`
    : tooltip?.split('\n').slice(1).join('\n').substring(0, 20) + '...';
}