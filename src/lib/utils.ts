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
  const istOffset = 5.5 * 3600000;
  // Create a date object that shifts UTC to IST "wall clock"
  const logicalDate = new Date(baseDate.getTime() + istOffset);
  
  // If it's before 4 AM IST, it belongs to the previous business day
  if (logicalDate.getUTCHours() < 4) {
    logicalDate.setUTCDate(logicalDate.getUTCDate() - 1);
  }
  
  // Start is 4:00:00.000 IST
  const startOfISTDay = Date.UTC(
    logicalDate.getUTCFullYear(),
    logicalDate.getUTCMonth(),
    logicalDate.getUTCDate(),
    4, 0, 0, 0
  ) - istOffset;
  
  // End is 03:59:59.999 IST next morning
  const endOfISTDay = Date.UTC(
    logicalDate.getUTCFullYear(),
    logicalDate.getUTCMonth(),
    logicalDate.getUTCDate() + 1,
    3, 59, 59, 999
  ) - istOffset;
  
  return { 
    startUTC: new Date(startOfISTDay), 
    endUTC: new Date(endOfISTDay) 
  };
}

export function getISTMonthBounds(baseDate: Date = new Date()) {
  const istOffset = 5.5 * 3600000;
  const logicalDate = new Date(baseDate.getTime() + istOffset);
  
  // If first day of month but before 4 AM, logical month is previous month
  if (logicalDate.getUTCDate() === 1 && logicalDate.getUTCHours() < 4) {
    logicalDate.setUTCMonth(logicalDate.getUTCMonth() - 1);
  }
  
  const startOfMonthIST = Date.UTC(logicalDate.getUTCFullYear(), logicalDate.getUTCMonth(), 1, 4, 0, 0, 0) - istOffset;
  const endOfMonthIST = Date.UTC(logicalDate.getUTCFullYear(), logicalDate.getUTCMonth() + 1, 1, 3, 59, 59, 999) - istOffset;
  
  return { 
    startUTC: new Date(startOfMonthIST), 
    endUTC: new Date(endOfMonthIST) 
  };
}

