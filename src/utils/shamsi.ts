/**
 * Jalali (Solar Hijri) calendar utilities and Persian formatting
 */

export const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export function toPersianDigits(input: string | number): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (w) => PERSIAN_DIGITS[+w]);
}

/**
 * Convert Gregorian date to Jalali (Solar Hijri) date
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy: number;
  if (gy > 1600) {
    jy = 979;
    gy -= 1600;
  } else {
    jy = 0;
    gy -= 621;
  }
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

export interface ShamsiDateInfo {
  jy: number;
  jm: number;
  jd: number;
  monthName: string;
  formattedDate: string; // e.g. "۱۴۰۵/۰۷/۱۱"
  formattedDateEn: string; // e.g. "1405/07/11"
  time: string; // e.g. "۱۴:۳۵"
}

export function getShamsiDate(date: Date = new Date()): ShamsiDateInfo {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const { jy, jm, jd } = gregorianToJalali(gy, gm, gd);

  const mm = jm < 10 ? `0${jm}` : `${jm}`;
  const dd = jd < 10 ? `0${jd}` : `${jd}`;
  const formattedDateEn = `${jy}/${mm}/${dd}`;
  const formattedDate = toPersianDigits(formattedDateEn);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const time = toPersianDigits(`${hours}:${minutes}`);

  return {
    jy,
    jm,
    jd,
    monthName: PERSIAN_MONTHS[jm - 1] || 'نامشخص',
    formattedDate,
    formattedDateEn,
    time,
  };
}

export function getDepartmentLabel(dept: string): string {
  switch (dept) {
    case 'production_1':
      return 'خط تولید شماره ۱';
    case 'production_2':
      return 'خط تولید شماره ۲';
    case 'warehouse':
      return 'انبار قطعات و محصول';
    case 'qc_qa':
      return 'کنترل و تضمین کیفیت (QC/QA)';
    case 'maintenance':
      return 'فنی و نگهداری تعمیرات (نت)';
    case 'admin_hr':
      return 'اداری، مالی و منابع انسانی';
    case 'catering_welfare':
      return 'خدمات رفاهی، رستوران و تغذیه';
    case 'hse_safety':
      return 'ایمنی، بهداشت و محیط زیست (HSE)';
    case 'security':
      return 'حراست و انتظامات کارخانه';
    case 'management_other':
      return 'مدیریت و سایر واحدها';
    default:
      return dept;
  }
}

export function getTypeLabel(type: string): { label: string; color: string; badgeBg: string } {
  switch (type) {
    case 'complaint':
      return { label: 'شکایت پرسنلی', color: 'text-red-400', badgeBg: 'bg-red-900/60 border-red-600 text-red-100' };
    case 'criticism':
      return { label: 'انتقاد سازنده', color: 'text-amber-400', badgeBg: 'bg-amber-950/60 border-amber-600 text-amber-100' };
    case 'suggestion':
      return { label: 'پیشنهاد و ایده', color: 'text-emerald-400', badgeBg: 'bg-emerald-950/60 border-emerald-600 text-emerald-100' };
    case 'safety':
      return { label: 'گزارش ایمنی و خطر', color: 'text-rose-400', badgeBg: 'bg-rose-900/60 border-rose-600 text-rose-100' };
    default:
      return { label: type, color: 'text-zinc-300', badgeBg: 'bg-zinc-800 border-zinc-700 text-zinc-100' };
  }
}

export function getUrgencyLabel(urgency: string): { label: string; color: string } {
  switch (urgency) {
    case 'urgent':
      return { label: 'فوری و حیاتی', color: 'text-red-500 font-bold' };
    case 'important':
      return { label: 'مهم', color: 'text-amber-400' };
    case 'normal':
    default:
      return { label: 'عادی', color: 'text-zinc-300' };
  }
}

export function getStatusLabel(status: string): { label: string; badge: string } {
  switch (status) {
    case 'pending':
      return { label: 'در انتظار بررسی', badge: 'bg-zinc-800 text-zinc-200 border-zinc-600' };
    case 'reviewing':
      return { label: 'در حال بررسی توسط مدیریت', badge: 'bg-blue-900/50 text-blue-200 border-blue-500' };
    case 'acted':
      return { label: 'اقدام و رسیدگی شده', badge: 'bg-emerald-900/50 text-emerald-200 border-emerald-500' };
    case 'archived':
      return { label: 'بایگانی شده', badge: 'bg-zinc-900 text-zinc-400 border-zinc-700' };
    default:
      return { label: status, badge: 'bg-zinc-800 text-zinc-200 border-zinc-600' };
  }
}
