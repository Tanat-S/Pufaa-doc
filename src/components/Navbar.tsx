import React from 'react';
import { User } from 'firebase/auth';
import {
  FileText,
  Plus,
  Settings,
  RefreshCw,
  LogOut,
  ExternalLink,
  CloudCheck,
  Check,
  FolderOpen,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'list' | 'editor';
  onViewChange: (view: 'list' | 'editor') => void;
  onOpenSettings: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  onSyncSheets: () => void;
  isSyncing: boolean;
  spreadsheetUrl?: string;
  lastSyncedAt?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenSettings,
  user,
  onSignIn,
  onSignOut,
  isLoggingIn,
  onSyncSheets,
  isSyncing,
  spreadsheetUrl,
  lastSyncedAt,
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

        {/* Right Section: Workspace Auth, Sheets Sync, Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="ตั้งค่าบริษัทและเงื่อนไขเอกสาร"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Google Workspace Authentication & Sync */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
              {/* Sync with Google Sheets Button (Docs + Settings) */}
              <button
                onClick={onSyncSheets}
                disabled={isSyncing}
                title={lastSyncedAt ? `ซิงค์ล่าสุดเมื่อ ${lastSyncedAt} (เอกสาร + การตั้งค่า)` : 'ซิงค์เอกสารและการตั้งค่าทั้งหมดกับ Google Sheets'}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูล & ตั้งค่า'}
                </span>
              </button>

              {spreadsheetUrl && (
                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="เปิดดูฐานข้อมูลใน Google Sheets"
                  className="p-1.5 text-zinc-500 hover:text-emerald-700 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-7 h-7 rounded-full border border-zinc-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold">
                    {(user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onSignOut}
                  title="ออกจากระบบ Google"
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
                className="gsi-material-button text-xs py-1.5 px-3 border border-zinc-300 rounded-lg shadow-2xs hover:bg-zinc-50 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 block">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="font-medium text-zinc-700">
                  {isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
