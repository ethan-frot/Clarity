/**
 * Fusion intelligente de classes CSS Tailwind
 *
 * @example
 * cn('px-2 py-1', 'px-4')  // 'py-1 px-4' (résout conflit px)
 * cn('text-red-500', isActive && 'text-blue-500')
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
