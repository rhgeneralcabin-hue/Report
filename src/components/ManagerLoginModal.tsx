import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, X } from 'lucide-react';
import { loginManager } from '../utils/storage.ts';

interface ManagerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ManagerLoginModal: React.FC<ManagerLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginManager(password)) {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-red-600"></div>

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="w-14 h-14 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-950/40">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black text-center text-white">
            ورود مدیریت
          </h3>
          <p className="text-xs text-center text-zinc-400 mt-1.5 mb-6">
            جهت مشاهده لیست نظرات پرسنل و دانلود فایل اکسل ماهانه، رمز عبور را وارد فرمایید.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                رمز عبور مدیر:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  autoFocus
                  placeholder="رمز ورود مدیر..."
                  dir="ltr"
                  className={`w-full bg-zinc-800 border rounded-xl py-3 pr-10 pl-10 text-white text-sm focus:outline-none transition-all ${
                    error
                      ? 'border-red-500 ring-1 ring-red-500'
                      : 'border-zinc-700 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  }`}
                />
                <KeyRound className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-zinc-500 hover:text-zinc-300 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>رمز عبور اشتباه است. لطفاً دقت فرمایید.</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 border border-red-500/50 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ورود به پنل مدیریت</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
              <span className="text-zinc-400">رمز عبور پیش‌فرض:</span>
              <code className="text-white font-mono font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-700" dir="ltr">
                General*1397
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
