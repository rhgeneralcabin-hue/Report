import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react';
import { setManagerPassword } from '../utils/storage.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim() || newPassword.length < 4) {
      setError('رمز عبور باید حداقل شامل ۴ کاراکتر باشد.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('تکرار رمز عبور با رمز عبور جدید همخوانی ندارد.');
      return;
    }

    setManagerPassword(newPassword.trim());
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 w-full bg-red-600 absolute top-0 left-0 right-0"></div>

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
            <Key className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-center text-white mb-1">
            تغییر رمز عبور مدیریت
          </h3>
          <p className="text-xs text-center text-zinc-400 mb-5">
            رمز عبور جدید خود را جهت ورود به پنل نظرات وارد نمایید
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                رمز عبور جدید:
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="رمز جدید..."
                  dir="ltr"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 pl-9 text-white text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-2.5 text-zinc-500 hover:text-zinc-300 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                تکرار رمز عبور جدید:
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز جدید..."
                dir="ltr"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:border-red-500"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center justify-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>رمز عبور با موفقیت به‌روزرسانی شد!</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs rounded-xl transition-all shadow-md mt-2"
            >
              ذخیره رمز عبور جدید
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
