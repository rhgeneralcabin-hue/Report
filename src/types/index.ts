export type FeedbackType = 'انتقادات' | 'پیشنهادات' | 'شکایات' | 'امنیتی';

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  customName: string; // نام دلخواه
  message: string; // پیام
  createdAt: string; // ISO String
  shamsiDate: string; // e.g. "۱۴۰۵/۰۷/۱۱"
  shamsiTime: string; // e.g. "۱۴:۳۰"
  shamsiMonthName: string; // e.g. "مهر"
  shamsiYear: number; // e.g. 1405
  shamsiMonth: number; // 1 to 12
  isArchived?: boolean; // آرشیو شده
  archivedAt?: string;
}
