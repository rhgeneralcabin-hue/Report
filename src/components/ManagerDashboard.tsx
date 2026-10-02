import React, { useState, useMemo } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  Archive, 
  Trash2, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  RotateCcw,
  Search,
  Filter,
  CheckSquare,
  Square,
  X
} from 'lucide-react';
import { FeedbackItem, FeedbackType } from '../types/index.ts';
import { exportFeedbackToExcel } from '../utils/excel.ts';
import { getShamsiDate, toPersianDigits } from '../utils/shamsi.ts';
import { 
  archiveAndRemoveFeedback, 
  restoreArchivedFeedback, 
  permanentlyDeleteFeedback 
} from '../utils/storage.ts';

interface ManagerDashboardProps {
  items: FeedbackItem[];
  onRefreshItems: () => void;
  onOpenChangePassword: () => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  items,
  onRefreshItems,
  onOpenChangePassword,
}) => {
  const currentShamsi = getShamsiDate();

  // Active view tab: active items vs archived items
  const [viewArchived, setViewArchived] = useState<boolean>(false);

  // Month filter: default to current month
  const [selectedMonth, setSelectedMonth] = useState<string>(currentShamsi.monthName);
  
  // Type filter & Search
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected item IDs for batch operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'archive_selected' | 'archive_month' | 'permanent_delete';
    ids?: string[];
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'archive_selected',
  });

  // Detailed view of a single message
  const [viewingItem, setViewingItem] = useState<FeedbackItem | null>(null);

  // Separate active vs archived items
  const activeItems = useMemo(() => items.filter((i) => !i.isArchived), [items]);
  const archivedItems = useMemo(() => items.filter((i) => i.isArchived), [items]);

  const displayedSource = viewArchived ? archivedItems : activeItems;

  // Available months categorized
  const availableMonths = useMemo(() => {
    const map = new Map<string, number>();
    displayedSource.forEach((item) => {
      map.set(item.shamsiMonthName, (map.get(item.shamsiMonthName) || 0) + 1);
    });

    const list = Array.from(map.entries()).map(([monthName, count]) => ({
      name: monthName,
      count,
    }));

    if (!viewArchived && !list.some((m) => m.name === currentShamsi.monthName)) {
      list.unshift({ name: currentShamsi.monthName, count: 0 });
    }

    return list;
  }, [displayedSource, currentShamsi.monthName, viewArchived]);

  // Filtered items for display
  const filteredItems = useMemo(() => {
    return displayedSource.filter((item) => {
      // Month
      if (selectedMonth !== 'all' && item.shamsiMonthName !== selectedMonth) {
        return false;
      }
      // Type
      if (filterType !== 'all' && item.type !== filterType) {
        return false;
      }
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesMsg = item.message.toLowerCase().includes(q);
        const matchesName = item.customName.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        if (!matchesMsg && !matchesName && !matchesType) return false;
      }
      return true;
    });
  }, [displayedSource, selectedMonth, filterType, searchTerm]);

  // Checkbox handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // EXCEL DOWNLOADS
  const handleDownloadExcel = (targetMonth: string) => {
    const toExport = targetMonth === 'all'
      ? displayedSource
      : displayedSource.filter((i) => i.shamsiMonthName === targetMonth);

    if (toExport.length === 0) {
      alert(`نظری برای ${targetMonth === 'all' ? 'این بخش' : `ماه ${targetMonth}`} جهت استخراج موجود نیست.`);
      return;
    }

    exportFeedbackToExcel(toExport, {
      monthName: targetMonth === 'all' ? (viewArchived ? 'آرشیو_کل' : 'جامع_همه_ماهها') : targetMonth,
      year: currentShamsi.jy,
    });
  };

  // ARCHIVE & DELETE ACTIONS WITH MANDATORY CONFIRMATION
  const promptArchiveSelected = () => {
    if (selectedIds.length === 0) {
      alert('لطفاً حداقل یک نظر را جهت آرشیو انتخاب نمایید.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'تایید آرشیو و پاک‌سازی از صفحه',
      message: `آیا مطمئن هستید که می‌خواهید ${toPersianDigits(selectedIds.length)} نظر انتخاب‌شده را از صفحه فعال پاک کرده و به بخش آرشیو منتقل نمایید؟`,
      actionType: 'archive_selected',
      ids: selectedIds,
    });
  };

  const promptArchiveEntireMonth = () => {
    const monthItems = filteredItems.map((i) => i.id);
    if (monthItems.length === 0) {
      alert('نظری برای پاک‌سازی در این ماه وجود ندارد.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: `تایید آرشیو و پاک‌سازی نظرات ماه ${selectedMonth}`,
      message: `آیا از پاک کردن تمامی نظرات ماه «${selectedMonth}» (${toPersianDigits(monthItems.length)} پیام) و انتقال آن‌ها به بایگانی آرشیو اطمینان دارید؟`,
      actionType: 'archive_month',
      ids: monthItems,
    });
  };

  const promptPermanentDelete = () => {
    if (selectedIds.length === 0) {
      alert('لطفاً حداقل یک نظر را انتخاب فرمایید.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'حذف دائمی نظرات',
      message: `هشدار: با این اقدام ${toPersianDigits(selectedIds.length)} نظر به صورت دائمی حذف خواهند شد و قابل بازیابی نخواهند بود. آیا ادامه می‌دهید؟`,
      actionType: 'permanent_delete',
      ids: selectedIds,
    });
  };

  const handleExecuteConfirmedAction = () => {
    if (!confirmModal.ids || confirmModal.ids.length === 0) return;

    if (confirmModal.actionType === 'archive_selected' || confirmModal.actionType === 'archive_month') {
      archiveAndRemoveFeedback(confirmModal.ids);
    } else if (confirmModal.actionType === 'permanent_delete') {
      permanentlyDeleteFeedback(confirmModal.ids);
    }

    setSelectedIds([]);
    setConfirmModal({ isOpen: false, title: '', message: '', actionType: 'archive_selected' });
    onRefreshItems();
  };

  const handleRestoreSelected = () => {
    if (selectedIds.length === 0) return;
    restoreArchivedFeedback(selectedIds);
    setSelectedIds([]);
    onRefreshItems();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* 1. TOP SECTION: PROMINENT EXCEL DOWNLOAD BUTTONS (as requested: "ابتدا دکمه دانلود اکسل نظرات وجود داشته باشد") */}
      <div className="bg-zinc-900 border-2 border-red-600 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          
          <div className="space-y-1.5 text-right w-full md:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/40 text-xs font-bold">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>خروجی رسمی مایکروسافت اکسل (.XLSX)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              دانلود اکسل نظرات پرسنل
            </h2>
            <p className="text-xs text-zinc-300 max-w-xl">
              تمامی نظرات ثبت شده در طول روزها و ماه‌ها در سامانه نگهداری می‌شوند. با فشردن دکمه زیر می‌توانید فایل اکسل کامل را دریافت کنید.
            </p>
          </div>

          {/* Download Action Buttons (20% Red Dominant) */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => handleDownloadExcel(selectedMonth)}
              className="py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-sm transition-all shadow-xl shadow-red-950/70 flex items-center justify-center gap-2.5 border border-red-500 cursor-pointer"
            >
              <Download className="w-5 h-5 text-white" />
              <span>
                دانلود اکسل نظرات {selectedMonth === 'all' ? 'کل ماه‌ها' : `ماه ${selectedMonth}`}
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-xs font-mono">
                XLSX
              </span>
            </button>

            {selectedMonth !== 'all' && (
              <button
                onClick={() => handleDownloadExcel('all')}
                className="py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition-all flex items-center gap-2"
                title="دانلود فایل اکسل حاوی تمامی نظرات همه ماه‌ها"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>دانلود کل ماه‌ها</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. MONTH CATEGORIZATION & ARCHIVE TABS */}
      <div className="bg-zinc-800/90 border border-zinc-700 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        
        {/* Upper Switch: Active vs Archived */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-700/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewArchived(false);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                !viewArchived
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              نظرات فعال ({toPersianDigits(activeItems.length)})
            </button>

            <button
              onClick={() => {
                setViewArchived(true);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-1.5 ${
                viewArchived
                  ? 'bg-red-600 border-red-500 text-white shadow-md'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>بایگانی آرشیو شده‌ها ({toPersianDigits(archivedItems.length)})</span>
            </button>
          </div>

          {/* Quick Management Buttons: Archive & Clear */}
          {!viewArchived ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={promptArchiveSelected}
                disabled={selectedIds.length === 0}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-750 disabled:opacity-40 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5"
                title="آرشیو و پاک‌سازی موارد انتخاب شده از صفحه با درخواست تایید"
              >
                <Archive className="w-4 h-4 text-amber-500" />
                <span>آرشیو و پاک‌سازی انتخاب‌شده‌ها ({toPersianDigits(selectedIds.length)})</span>
              </button>

              <button
                onClick={promptArchiveEntireMonth}
                disabled={filteredItems.length === 0}
                className="px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-200 transition-all flex items-center gap-1.5"
                title="آرشیو و پاک‌سازی کل نظرات این ماه با تایید مدیر"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>پاک‌سازی نظرات این ماه</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestoreSelected}
                disabled={selectedIds.length === 0}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-emerald-400 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>بازگردانی به صفحه فعال</span>
              </button>

              <button
                onClick={promptPermanentDelete}
                disabled={selectedIds.length === 0}
                className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-300 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>حذف دائمی</span>
              </button>
            </div>
          )}
        </div>

        {/* Month Tabs */}
        <div>
          <span className="text-xs font-bold text-zinc-400 block mb-2">
            دسته‌بندی بر اساس ماه‌های ثبت شده:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {availableMonths.map((m) => {
              const isSelected = selectedMonth === m.name;
              return (
                <button
                  key={m.name}
                  onClick={() => setSelectedMonth(m.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    isSelected
                      ? 'bg-zinc-900 border-red-500 text-white ring-1 ring-red-500'
                      : 'bg-zinc-900/60 border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-red-500' : 'text-zinc-500'}`} />
                  <span>{m.name} ماه</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                    {toPersianDigits(m.count)}
                  </span>
                </button>
              );
            })}

            <button
              onClick={() => setSelectedMonth('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                selectedMonth === 'all'
                  ? 'bg-zinc-900 border-red-500 text-white ring-1 ring-red-500'
                  : 'bg-zinc-900/60 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              <span>همه ماه‌ها</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                {toPersianDigits(displayedSource.length)}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="bg-zinc-800/90 border border-zinc-700 p-3.5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در پیام‌ها یا نام..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5" />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-zinc-400 whitespace-nowrap">نوع پیام:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500"
          >
            <option value="all">همه گزینه‌ها</option>
            <option value="انتقادات">انتقادات</option>
            <option value="پیشنهادات">پیشنهادات</option>
            <option value="شکایات">شکایات</option>
            <option value="امنیتی">امنیتی</option>
          </select>

          {/* Select all button */}
          <button
            onClick={handleToggleSelectAll}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all flex items-center gap-1.5"
          >
            {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
              <CheckSquare className="w-3.5 h-3.5 text-red-500" />
            ) : (
              <Square className="w-3.5 h-3.5 text-zinc-500" />
            )}
            <span>انتخاب همه</span>
          </button>
        </div>

      </div>

      {/* 4. UNDERNEATH EXCEL: THE LIST OF COMMENTS (as requested: "و در زیر آن لیست نظرات را ببیند") */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>لیست نظرات ثبت شده پرسنل</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-red-600/20 text-red-400 border border-red-500/30">
              {toPersianDigits(filteredItems.length)} مورد
            </span>
          </h3>
          <span className="text-xs text-zinc-500">
            {viewArchived ? 'نمایش در وضعیت بایگانی' : 'تمام نظرات در این لیست محفوظ هستند'}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <AlertTriangle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-base font-bold text-zinc-300">نظری در این دسته‌بندی یافت نشد.</p>
            <p className="text-xs text-zinc-500 mt-1">تمام پیام‌های پرسنل با ثبت در فرم فوراً در این لیست نمایان خواهند شد.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-zinc-950 text-zinc-400 border-b border-zinc-800 font-bold">
                <tr>
                  <th className="py-3 px-4 w-10 text-center">انتخاب</th>
                  <th className="py-3 px-4 w-12 text-center">ردیف</th>
                  <th className="py-3 px-4 whitespace-nowrap">تاریخ و ساعت</th>
                  <th className="py-3 px-4 whitespace-nowrap">نوع پیام</th>
                  <th className="py-3 px-4 whitespace-nowrap">نام دلخواه</th>
                  <th className="py-3 px-4">متن پیام</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">مشاهده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {filteredItems.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);

                  // Badge color for the 4 types
                  let badgeColor = 'bg-zinc-800 text-zinc-300 border-zinc-700';
                  if (item.type === 'شکایات') badgeColor = 'bg-red-950/80 text-red-300 border-red-600';
                  if (item.type === 'پیشنهادات') badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-600';
                  if (item.type === 'انتقادات') badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-600';
                  if (item.type === 'امنیتی') badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-600';

                  return (
                    <tr 
                      key={item.id}
                      onClick={() => handleToggleSelectItem(item.id)}
                      className={`hover:bg-zinc-800/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-zinc-800/90' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleToggleSelectItem(item.id)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-red-500" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-600" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono text-zinc-500">
                        {toPersianDigits(index + 1)}
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300 whitespace-nowrap">
                        <span className="font-bold text-white block">{item.shamsiDate}</span>
                        <span className="text-[10px] text-zinc-400">{item.shamsiTime}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${badgeColor}`}>
                          {item.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-200 whitespace-nowrap font-medium">
                        {item.customName || 'ناشناس'}
                      </td>

                      <td className="py-3.5 px-4 max-w-lg text-zinc-100">
                        <p className="line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setViewingItem(item)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-red-600 text-zinc-300 hover:text-white rounded-lg text-xs font-bold transition-all border border-zinc-700 hover:border-red-500 inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 5. MANDATORY CONFIRMATION MODAL BEFORE ARCHIVE/DELETE (as requested: "قبل از پاک کردن حتما پیام تایید از مدیر بخواهد") */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-zinc-900 border-2 border-red-600 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-white mb-2">
              {confirmModal.title}
            </h3>

            <p className="text-xs text-zinc-300 text-center leading-relaxed mb-6">
              {confirmModal.message}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="flex-1 py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl border border-zinc-700 transition-all"
              >
                انصراف و لغو
              </button>

              <button
                onClick={handleExecuteConfirmedAction}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-red-950/60"
              >
                بله، تایید و پاک‌سازی شود
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SINGLE ITEM DETAIL MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1.5 w-full bg-red-600 absolute top-0 left-0 right-0"></div>

            <div className="flex items-center justify-between mb-4 pt-1 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">نوع:</span>
                <span className="px-2.5 py-1 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-bold">
                  {viewingItem.type}
                </span>
              </div>
              <button 
                onClick={() => setViewingItem(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-right">
              <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-800 p-3 rounded-xl border border-zinc-700">
                <div>
                  <span className="text-zinc-400 block mb-0.5">نام دلخواه ثبت‌کننده:</span>
                  <span className="text-white font-bold">{viewingItem.customName || 'ناشناس'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block mb-0.5">تاریخ و ساعت ثبت:</span>
                  <span className="text-white font-bold">{viewingItem.shamsiDate} ({viewingItem.shamsiTime})</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-1.5">
                  متن کامل پیام پرسنل:
                </label>
                <div className="p-4 bg-zinc-800/90 rounded-xl border border-zinc-700 text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
                  {viewingItem.message}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setViewingItem(null)}
                  className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold border border-zinc-600"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
