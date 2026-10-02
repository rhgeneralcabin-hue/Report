import React from 'react';
import { MessageSquare, Lock, LogOut, Key, ArrowRightLeft } from 'lucide-react';

interface NavbarProps {
  currentView: 'personnel' | 'manager';
  onNavigate: (view: 'personnel' | 'manager') => void;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isLoggedIn,
  onOpenLogin,
  onLogout,
  onOpenChangePassword,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 shadow-xl">
      {/* 20% Red Accent Banner Line */}
      <div className="h-1.5 w-full bg-red-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title: صدای پرسنل */}
          <div 
            onClick={() => onNavigate('personnel')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-950/50 border border-red-500/40 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight block">
                صدای پرسنل
              </span>
              <span className="text-[11px] text-zinc-400">
                سامانه ثبت نظرات و ارتباط با مدیریت
              </span>
            </div>
          </div>

          {/* Manager Actions */}
          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Switch between form and manager list */}
                <button
                  onClick={() => onNavigate(currentView === 'manager' ? 'personnel' : 'manager')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-bold text-zinc-200 hover:text-white transition-all"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-red-500" />
                  <span className="hidden sm:inline">
                    {currentView === 'manager' ? 'فرم ثبت نظر' : 'پنل مدیریت'}
                  </span>
                </button>

                {/* Change password button - explicitly next to logout! */}
                <button
                  onClick={onOpenChangePassword}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-white transition-all shadow-sm"
                  title="تغییر رمز عبور مدیریت"
                >
                  <Key className="w-3.5 h-3.5 text-red-500" />
                  <span>تغییر رمز مدیریت</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-xs font-bold text-red-200 transition-all shadow-sm"
                  title="خروج از پنل مدیریت"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-400" />
                  <span>خروج مدیر</span>
                </button>
              </div>
            ) : (
              /* Login button for Manager */
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black transition-all shadow-lg shadow-red-950/50 border border-red-500/50"
              >
                <Lock className="w-4 h-4 text-white" />
                <span>لاگین مدیر</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
