import * as XLSX from 'xlsx';
import { FeedbackItem } from '../types/index.ts';

export interface ExcelExportOptions {
  monthName?: string;
  year?: number;
  filenamePrefix?: string;
}

export function exportFeedbackToExcel(items: FeedbackItem[], options: ExcelExportOptions = {}): boolean {
  if (!items || items.length === 0) {
    return false;
  }

  const excelData = items.map((item, index) => {
    return {
      'ردیف': index + 1,
      'تاریخ ثبت': item.shamsiDate,
      'ساعت': item.shamsiTime,
      'ماه': item.shamsiMonthName,
      'نوع پیام': item.type,
      'نام دلخواه ثبت‌کننده': item.customName || 'ناشناس',
      'متن پیام پرسنل': item.message,
      'وضعیت آرشیو': item.isArchived ? 'آرشیو شده' : 'فعال',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelData);

  if (!worksheet['!views']) {
    worksheet['!views'] = [{ rightToLeft: true }];
  }

  worksheet['!cols'] = [
    { wch: 8 },  // ردیف
    { wch: 14 }, // تاریخ
    { wch: 10 }, // ساعت
    { wch: 12 }, // ماه
    { wch: 16 }, // نوع پیام
    { wch: 22 }, // نام دلخواه
    { wch: 60 }, // متن پیام
    { wch: 14 }, // وضعیت
  ];

  const workbook = XLSX.utils.book_new();
  
  let sheetName = 'صدای پرسنل';
  if (options.monthName) {
    sheetName = `نظرات ${options.monthName}`;
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  let filename = 'نظرات_صدای_پرسنل.xlsx';
  if (options.monthName && options.year) {
    filename = `نظرات_پرسنل_${options.monthName}_${options.year}.xlsx`;
  } else if (options.monthName) {
    filename = `نظرات_پرسنل_${options.monthName}.xlsx`;
  }

  XLSX.writeFile(workbook, filename);
  return true;
}
