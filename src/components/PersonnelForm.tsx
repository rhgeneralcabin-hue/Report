import React, { useState } from 'react';
import { Send, ShieldCheck, Check, WifiOff, AlertCircle, MessageSquare } from 'lucide-react';
import { FeedbackType } from '../types/index.ts';
import { addFeedback } from '../utils/storage.ts';

interface PersonnelFormProps {
  onFeedbackSubmitted: () => void;
}

export const PersonnelForm: React.FC<PersonnelFormProps> = ({ onFeedbackSubmitted }) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('پیشنهادات');
  const [customName, setCustomName] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Network check helper
  const checkInternetConnection = async (): Promise<boolean> => {
    // 1. Check browser navigator status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    // 2. Perform a lightweight ping to verify actual connectivity
    try {
      // Fetch with cache-busting and short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      await fetch(window.location.origin + '/?ping=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return true;
    } catch {
      // If navigator is still online, we might be in local mode or offline
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return false;
      }
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(null);

    if (!message.trim()) {
      setNetworkError('لطفاً متن پیام خود را وارد نمایید.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check internet connectivity
      const isOnline = await checkInternetConnection();
      if (!isOnline) {
        setNetworkError('اینترنت خود را بررسی کنید و مجددا تلاش نمایید');
        setIsSubmitting(false);
        return;
      }

      // Add feedback
      addFeedback({
        type: feedbackType,
        customName: customName.trim() || 'ناشناس',
        message: message.trim(),
      });

      // Clear fields and show green checkmark success
      setSubmitted(true);
      setMessage('');
      setCustomName('');
      onFeedbackSubmitted();

      // Scroll to notification smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setNetworkError('اینترنت خود را بررسی کنید و مجددا تلاش نمایید');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      
      {/* Page Title: "صدای پرسنل" */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-950/60 border border-red-500/40 mb-4">
          <MessageSquare className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          صدای پرسنل
        </h1>
        <div className="w-16 h-1 bg-red-600 mx-auto mt-3 rounded-full"></div>
      </div>

      {/* Success Notification with Green Checkmark: "پیام شما با موفقیت ارسال شد" */}
      {submitted && (
        <div className="mb-8 p-6 sm:p-8 bg-zinc-900 border-2 border-emerald-500 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-950/50">
            <Check className="w-9 h-9 text-emerald-400 stroke-[3]" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
            پیام شما با موفقیت ارسال شد
          </h3>
          
          <p className="text-xs sm:text-sm text-zinc-300 mb-6 max-w-md mx-auto leading-relaxed">
            پیام شما به صورت کاملاً ناشناس و محرمانه در سامانه ذخیره گردید و در گزارش ماهانه مدیریت کارخانه بررسی خواهد شد.
          </p>

          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all border border-zinc-700 hover:border-zinc-500"
          >
            ثبت یک پیام دیگر
          </button>
        </div>
      )}

      {/* Form Container (65% Grey, 20% Red, 15% White) */}
      <div className="bg-zinc-800/90 border border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Caption: "هویت ثبت کننده ناشناس میباشد" */}
        <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
            <strong className="text-white font-bold">توجه: </strong>
            هویت ثبت‌کننده کاملاً ناشناس می‌باشد و هیچ‌گونه مشخصاتی از شما ثبت نخواهد شد.
          </p>
        </div>

        {/* The Exact Form with ONLY the requested fields */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Listbox with 4 options: انتقادات، پیشنهادات، شکایات، امنیتی */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              نوع پیام:
            </label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer font-medium"
            >
              <option value="انتقادات">انتقادات</option>
              <option value="پیشنهادات">پیشنهادات</option>
              <option value="شکایات">شکایات</option>
              <option value="امنیتی">امنیتی</option>
            </select>
          </div>

          {/* 2. Custom Desired Name */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              نام دلخواه:
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="یک نام دلخواه بنویسید (اختیاری)"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          {/* 3. Message */}
          <div>
            <label className="block text-sm font-bold text-white mb-2">
              پیام:
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (networkError) setNetworkError(null);
              }}
              placeholder="متن پیام خود را اینجا بنویسید..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all leading-relaxed"
            />
          </div>

          {/* Internet Network Error Message: "اینترنت خود را بررسی کنید و مجددا تلاش نمایید" */}
          {networkError && (
            <div className="p-4 rounded-xl bg-red-950/90 border-2 border-red-600 text-xs sm:text-sm font-bold text-red-200 flex items-center gap-3 animate-in shake duration-200">
              <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{networkError}</span>
            </div>
          )}

          {/* 4. Send Message Button (20% Red dominant) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white font-extrabold text-base transition-all shadow-xl shadow-red-950/60 flex items-center justify-center gap-2.5 border border-red-500/50 cursor-pointer"
          >
            <Send className="w-5 h-5 text-white" />
            <span>{isSubmitting ? 'در حال ارسال...' : 'ارسال پیام'}</span>
          </button>

        </form>

      </div>
    </div>
  );
};
