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

export function getISTDateBounds() {
  const now = new Date();
  
  // Convert current time to IST explicit timestamp
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));
  
  const startOfTodayIST = new Date(istDate);
  startOfTodayIST.setHours(0, 0, 0, 0);
  
  const endOfTodayIST = new Date(istDate);
  endOfTodayIST.setHours(23, 59, 59, 999);
  
  // Convert bounds back from IST definition to the literal UTC time standard expected by Prisma DateTime
  const startUTC = new Date(startOfTodayIST.getTime() - (3600000 * 5.5));
  const endUTC = new Date(endOfTodayIST.getTime() - (3600000 * 5.5));
  
  return { startUTC, endUTC };
}
