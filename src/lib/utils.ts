import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatIST(date: Date, options: Intl.DateTimeFormatOptions = {}) {
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...options
  });
}

export function formatTimeIST(date: Date) {
  return formatIST(date, { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatDateIST(date: Date) {
  return formatIST(date, { day: '2-digit', month: 'short', year: 'numeric' });
}
