import { format, getDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: vi });
};

export const formatDayOfWeek = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[getDay(dateObj)];
};

export const getWeekDates = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDates = (date: Date = new Date()): Date[] => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return eachDayOfInterval({ start, end });
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  return time.substring(0, 5);
};
