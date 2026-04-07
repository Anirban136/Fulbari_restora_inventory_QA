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

export function getISTDateBounds(baseDate: Date = new Date()) {
  // Convert current time to IST explicit timestamp
  const utc = baseDate.getTime() + (baseDate.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * 5.5));
  
  const logicalDate = new Date(istDate);
  if (logicalDate.getHours() < 4) {
    logicalDate.setDate(logicalDate.getDate() - 1);
  }
  
  const startOfTodayIST = new Date(logicalDate);
  startOfTodayIST.setHours(4, 0, 0, 0);
  
  const endOfTodayIST = new Date(logicalDate);
  endOfTodayIST.setDate(endOfTodayIST.getDate() + 1);
  endOfTodayIST.setHours(3, 59, 59, 999);
  
  // Convert bounds back from IST definition to the literal UTC time standard expected by Prisma DateTime
  const startUTC = new Date(startOfTodayIST.getTime() - (3600000 * 5.5));
  const endUTC = new Date(endOfTodayIST.getTime() - (3600000 * 5.5));
  
  return { startUTC, endUTC };
}

export function getISTMonthBounds(baseDate: Date = new Date()) {
  // IST is UTC + 5:30
  const istOffset = 5.5 * 3600000;
  const utc = baseDate.getTime() + (baseDate.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + istOffset);
  
  const logicalDate = new Date(istDate);
  if (logicalDate.getDate() === 1 && logicalDate.getHours() < 4) {
    logicalDate.setMonth(logicalDate.getMonth() - 1);
  }
  
  const startOfMonthIST = new Date(logicalDate.getFullYear(), logicalDate.getMonth(), 1, 4, 0, 0, 0);
  const endOfMonthIST = new Date(logicalDate.getFullYear(), logicalDate.getMonth() + 1, 1, 3, 59, 59, 999);
  
  // Convert back to UTC for Prisma
  const startUTC = new Date(startOfMonthIST.getTime() - istOffset);
  const endUTC = new Date(endOfMonthIST.getTime() - istOffset);
  
  return { startUTC, endUTC };
}

