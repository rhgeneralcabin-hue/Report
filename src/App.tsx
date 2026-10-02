import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { PersonnelForm } from './components/PersonnelForm.tsx';
import { ManagerDashboard } from './components/ManagerDashboard.tsx';
import { ManagerLoginModal } from './components/ManagerLoginModal.tsx';
import { ChangePasswordModal } from './components/ChangePasswordModal.tsx';
import { FeedbackItem } from './types/index.ts';
import { getAllFeedback, isManagerLoggedIn, logoutManager } from './utils/storage.ts';
import { ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'personnel' | 'manager'>('personnel');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);

  useEffect(() => {
    refreshItems();
    setIsLoggedIn(isManagerLoggedIn());
  }, []);

  const refreshItems = () => {
    const loaded = getAllFeedback();
    setItems(loaded);
  };

  const handleNavigate = (view: 'personnel' | 'manager') => {
    if (view === 'manager') {
      if (!isLoggedIn) {
        setShowLoginModal(true);
        return;
      }
    }
    setCurrentView(view);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setCurrentView('manager');
  };

  const handleLogout = () => {
    logoutManager();
    setIsLoggedIn(false);
    setCurrentView('personnel');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-['Vazirmatn',sans-serif] selection:bg-red-600 selection:text-white" dir="rtl">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'personnel' ? (
          <PersonnelForm onFeedbackSubmitted={refreshItems} />
        ) : (
          <ManagerDashboard
            items={items}
            onRefreshItems={refreshItems}
            onOpenChangePassword={() => setShowChangePasswordModal(true)}
          />
        )}
      </main>

      {/* Manager Login Modal */}
      <ManagerLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-6 px-4 text-xs text-zinc-400 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600"></span>
            <span className="text-white font-bold">صدای پرسنل</span>
            <span className="text-zinc-500">|</span>
            <span>بایگانی مستمر نظرات و استخراج ماهانه در قالب فایل اکسل</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>هویت ثبت‌کننده کاملاً ناشناس می‌باشد</span>
            </span>

            {!isLoggedIn && (
              <>
                <span className="text-zinc-600">•</span>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>ورود مدیر</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
