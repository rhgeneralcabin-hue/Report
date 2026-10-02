import { FeedbackItem, FeedbackType } from '../types/index.ts';
import { getShamsiDate } from './shamsi.ts';

const STORAGE_KEY = 'factory_staff_voice_records_v2';
const AUTH_KEY = 'factory_manager_auth_v2';
const PASSWORD_KEY = 'factory_manager_password_v2';

export const DEFAULT_ADMIN_PASSWORD = 'General*1397';

function createSeedData(): FeedbackItem[] {
  const now = new Date();
  
  const dToday = new Date(now);
  const dYesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const d3DaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const d6DaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
  const d35DaysAgo = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000); // previous month

  const sToday = getShamsiDate(dToday);
  const sYesterday = getShamsiDate(dYesterday);
  const s3DaysAgo = getShamsiDate(d3DaysAgo);
  const s6DaysAgo = getShamsiDate(d6DaysAgo);
  const s35DaysAgo = getShamsiDate(d35DaysAgo);

  return [
    {
      id: 'fb-001',
      type: 'شکایات',
      customName: 'پرسنل شیفت شب',
      message: 'سرد بودن و کیفیت نامناسب غذای توزیع شده در شیفت شب سالن تولید. خواهشمند است به پیمانکار کترینگ تذکر داده شود.',
      createdAt: dToday.toISOString(),
      shamsiDate: sToday.formattedDate,
      shamsiTime: '۱۰:۱۵',
      shamsiMonthName: sToday.monthName,
      shamsiYear: sToday.jy,
      shamsiMonth: sToday.jm,
      isArchived: false,
    },
    {
      id: 'fb-002',
      type: 'پیشنهادات',
      customName: 'همکار خط مونتاژ',
      message: 'نصب فن مکنده تهویه در انتهای خط مونتاژ به دلیل حرارت کوره، جهت تهویه بهتر سالن و افزایش بازدهی کارکنان.',
      createdAt: dYesterday.toISOString(),
      shamsiDate: sYesterday.formattedDate,
      shamsiTime: '۱۶:۴۰',
      shamsiMonthName: sYesterday.monthName,
      shamsiYear: sYesterday.jy,
      shamsiMonth: sYesterday.jm,
      isArchived: false,
    },
    {
      id: 'fb-003',
      type: 'امنیتی',
      customName: 'ناشناس',
      message: 'نقص در روشنایی درب غربی انبار و خرابی یکی از دوربین‌های محوطه پشتی که نیازمند بررسی توسط انتظامات است.',
      createdAt: d3DaysAgo.toISOString(),
      shamsiDate: s3DaysAgo.formattedDate,
      shamsiTime: '۰۸:۵۰',
      shamsiMonthName: s3DaysAgo.monthName,
      shamsiYear: s3DaysAgo.jy,
      shamsiMonth: s3DaysAgo.jm,
      isArchived: false,
    },
    {
      id: 'fb-004',
      type: 'انتقادات',
      customName: 'کارگر فنی',
      message: 'عدم موجودی به موقع قطعات مصرفی و یدکی در انبار فنی که موجب تاخیر در رفع توقفات خطوط تولید می‌شود.',
      createdAt: d6DaysAgo.toISOString(),
      shamsiDate: s6DaysAgo.formattedDate,
      shamsiTime: '۱۱:۲۰',
      shamsiMonthName: s6DaysAgo.monthName,
      shamsiYear: s6DaysAgo.jy,
      shamsiMonth: s6DaysAgo.jm,
      isArchived: false,
    },
    {
      id: 'fb-005',
      type: 'پیشنهادات',
      customName: 'امید',
      message: 'ایجاد ایستگاه آبسردکن دوم در سالن شماره ۲ جهت دسترسی سریع‌تر پرسنل و جلوگیری از اتلاف وقت.',
      createdAt: d35DaysAgo.toISOString(),
      shamsiDate: s35DaysAgo.formattedDate,
      shamsiTime: '۱۴:۱۰',
      shamsiMonthName: s35DaysAgo.monthName,
      shamsiYear: s35DaysAgo.jy,
      shamsiMonth: s35DaysAgo.jm,
      isArchived: false,
    }
  ];
}

export function getAllFeedback(): FeedbackItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seed = createSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return createSeedData();
  }
}

export function addFeedback(data: { type: FeedbackType; customName?: string; message: string }): FeedbackItem {
  const current = getAllFeedback();
  const date = new Date();
  const shamsi = getShamsiDate(date);

  const newItem: FeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: data.type,
    customName: data.customName?.trim() || 'ناشناس',
    message: data.message.trim(),
    createdAt: date.toISOString(),
    shamsiDate: shamsi.formattedDate,
    shamsiTime: shamsi.time,
    shamsiMonthName: shamsi.monthName,
    shamsiYear: shamsi.jy,
    shamsiMonth: shamsi.jm,
    isArchived: false,
  };

  const updated = [newItem, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newItem;
}

export function archiveAndRemoveFeedback(ids: string[]): void {
  const current = getAllFeedback();
  const idSet = new Set(ids);
  
  // Mark as archived or filter out
  const updated = current.map((item) => {
    if (idSet.has(item.id)) {
      return {
        ...item,
        isArchived: true,
        archivedAt: new Date().toISOString(),
      };
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function permanentlyDeleteFeedback(ids: string[]): void {
  const current = getAllFeedback();
  const idSet = new Set(ids);
  const updated = current.filter((item) => !idSet.has(item.id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function restoreArchivedFeedback(ids: string[]): void {
  const current = getAllFeedback();
  const idSet = new Set(ids);
  const updated = current.map((item) => {
    if (idSet.has(item.id)) {
      return {
        ...item,
        isArchived: false,
      };
    }
    return item;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Authentication
export function getManagerPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
}

export function setManagerPassword(newPassword: string): void {
  localStorage.setItem(PASSWORD_KEY, newPassword);
}

export function isManagerLoggedIn(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === 'true';
}

export function loginManager(password: string): boolean {
  const currentPassword = getManagerPassword();
  if (password === currentPassword) {
    sessionStorage.setItem(AUTH_KEY, 'true');
    return true;
  }
  return false;
}

export function logoutManager(): void {
  sessionStorage.removeItem(AUTH_KEY);
}
