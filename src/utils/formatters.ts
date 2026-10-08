/**
 * Utility functions for formatting VND currency, Vietnamese dates, and month math
 */

export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('vi-VN').format(rounded) + ' ₫';
}

/**
 * Format raw number input with thousands separators (e.g. 1500000 -> "1.500.000")
 */
export function formatNumberWithDots(val: number | string): string {
  if (!val && val !== 0) return '';
  const cleanNumber = typeof val === 'number' ? val : parseInt(String(val).replace(/\D/g, ''), 10);
  if (isNaN(cleanNumber)) return '';
  return new Intl.NumberFormat('vi-VN').format(cleanNumber);
}

/**
 * Parse string with dots or commas into pure integer amount
 */
export function parseVNDInput(input: string): number {
  if (!input) return 0;
  const digits = input.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/**
 * Format YYYY-MM-DD to DD/MM/YYYY
 */
export function formatDateVI(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format YYYY-MM-DD to "Thứ Hai, 08/10/2026" or "Hôm nay, 08/10/2026"
 */
export function formatDateWithDayVI(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  
  const todayStr = getTodayString();
  const isToday = dateStr === todayStr;
  
  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = isToday ? 'Hôm nay' : daysOfWeek[d.getDay()];
  
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  
  return `${dayName}, ${formattedDay}/${formattedMonth}/${year}`;
}

export function formatMonthYearVI(month: number, year: number): string {
  return `Tháng ${month}/${year}`;
}

/**
 * Default to October 2026 as current context or system date
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
