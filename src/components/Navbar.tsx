import React from 'react';
import { User } from 'firebase/auth';
import {
  Plus,
  Settings,
  LogOut,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'list' | 'editor';
  onViewChange: (view: 'list' | 'editor') => void;
  onOpenSettings: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  isCloudSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenSettings,
  user,
  onSignIn,
  onSignOut,
  isLoggingIn,
  isCloudSynced = true,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200/90 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onViewChange('list')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              AD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 tracking-tight text-base">AutoDoc</span>
                <span className="text-[10px] font-semibold uppercase bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded">
                  Suite
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                ระบบออกเอกสารอัตโนมัติ (RC • QT • IN • CF)
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentView === 'list'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              เอกสารทั้งหมด
            </button>
            <button
              onClick={() => onViewChange('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                currentView === 'editor'
                  ? 'bg-zinc-100 text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>สร้างเอกสาร</span>
            </button>
          </nav>
        </div>

        {/* Right Section: Real-time Cloud Status, Settings, User Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="ตั้งค่าบริษัท สาขา ห้องพัก รายการ และลายเซ็น"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Real-time Cloud Authentication & Live Indicator */}
          {user ? (
            <div className="flex items-center gap-2.5 border-l border-zinc-200 pl-3">
              {/* Live Real-time Indicator Badge */}
              <div
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium"
                title="ระบบเชื่อมต่อฐานข้อมูลคลาวด์แล้ว ทุกอุปกรณ์จะอัปเดตตรงกันทันทีแบบ Real-time"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>คลาวด์ Real-time ซิงค์สด</span>
              </div>

              {/* User Avatar & Info */}
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-zinc-200 shadow-2xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-zinc-800 leading-tight">
                    {user.displayName || 'ผู้ใช้งานระบบ'}
                  </div>
                  <div className="text-[10px] text-zinc-400 leading-tight truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  title="ออกจากระบบ"
                  className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="border-l border-zinc-200 pl-3">
              <button
                onClick={onSignIn}
                disabled={isLoggingIn}
                className="text-xs py-1.5 px-3 border border-zinc-300 rounded-lg shadow-2xs hover:bg-zinc-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 bg-white"
                title="เข้าสู่ระบบด้วย Google เพื่อซิงค์ข้อมูลสาขา ห้องพัก และเอกสารข้ามอุปกรณ์แบบ Real-time"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                <span className="font-semibold text-zinc-700">
                  {isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
