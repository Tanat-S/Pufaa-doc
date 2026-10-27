import React, { useState } from 'react';
import { CompanySettings, DocType, DOC_TYPE_CONFIG } from '../types/document';
import {
  X,
  Upload,
  Building,
  CreditCard,
  FileText,
  Shield,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSave: (newSettings: CompanySettings) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
  onReset,
}) => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'company' | 'payment' | 'terms' | 'sync'>('company');

  if (!isOpen) return null;

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('กรุณาเลือกไฟล์รูปภาพขนาดไม่เกิน 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSettings({ ...settings, logoUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setSettings({ ...settings, logoUrl: '' });
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div>
            <h2 className="text-base font-bold text-zinc-900">ตั้งค่าระบบและผู้ออกเอกสาร</h2>
            <p className="text-xs text-zinc-500">
              กำหนดข้อมูลบริษัท/ร้านค้า โลโก้ บัญชีธนาคาร และเงื่อนไขเริ่มต้นของแต่ละเอกสาร
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 bg-zinc-50/70 px-6 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'company'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>ข้อมูลผู้ออกเอกสาร & โลโก้</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'payment'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>ช่องทางการชำระเงิน</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>หมายเหตุ & เงื่อนไขแต่ละเอกสาร</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {activeTab === 'company' && (
            <div className="space-y-4">
              {/* Logo Upload Section */}
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
                <label className="block text-xs font-semibold text-zinc-700 mb-2">
                  โลโก้ผู้ออกเอกสาร (Company Logo)
                </label>
                <div className="flex items-center gap-5">
                  {settings.logoUrl ? (
                    <div className="relative group">
                      <img
                        src={settings.logoUrl}
                        alt="Company Logo Preview"
                        className="w-20 h-20 object-contain rounded-lg border border-zinc-200 bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition-colors"
                        title="ลบโลโก้"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center text-zinc-400 bg-white">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">ไม่มีโลโก้</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>อัปโหลดโลโก้ใหม่</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      รองรับไฟล์ PNG, JPG, WebP ขนาดแนะนำสี่เหลี่ยมจัตุรัส ไม่เกิน 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    ชื่อบริษัท / กิจการ (ภาษาไทย) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    ชื่อบริษัท / กิจการ (ภาษาอังกฤษ)
                  </label>
                  <input
                    type="text"
                    value={settings.companyNameEn || ''}
                    onChange={(e) => setSettings({ ...settings, companyNameEn: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    เลขประจำตัวผู้เสียภาษีอากร 13 หลัก
                  </label>
                  <input
                    type="text"
                    value={settings.taxId}
                    onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">อีเมล</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">เว็บไซต์</label>
                  <input
                    type="text"
                    value={settings.website || ''}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    placeholder="www.yourcompany.com"
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-semibold text-zinc-700 mb-1">ที่อยู่</label>
                  <textarea
                    rows={2}
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    ชื่อผู้ลงนามผู้ออกเอกสาร
                  </label>
                  <input
                    type="text"
                    value={settings.signatureName}
                    onChange={(e) => setSettings({ ...settings, signatureName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    ตำแหน่งผู้ลงนาม
                  </label>
                  <input
                    type="text"
                    value={settings.signatureTitle}
                    onChange={(e) => setSettings({ ...settings, signatureTitle: e.target.value })}
                    placeholder="เช่น ผู้จัดการทั่วไป, กรรมการผู้จัดการ"
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">ธนาคาร</label>
                  <input
                    type="text"
                    value={settings.bankName}
                    onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                    placeholder="เช่น ธนาคารกสิกรไทย, ธนาคารกรุงเทพ"
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">เลขที่บัญชี</label>
                  <input
                    type="text"
                    value={settings.bankAccountNo}
                    onChange={(e) => setSettings({ ...settings, bankAccountNo: e.target.value })}
                    placeholder="123-4-56789-0"
                    className="w-full text-xs font-mono px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">ชื่อบัญชี</label>
                  <input
                    type="text"
                    value={settings.bankAccountName}
                    onChange={(e) => setSettings({ ...settings, bankAccountName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    เบอร์พร้อมเพย์ (PromptPay) / เลขผู้เสียภาษี
                  </label>
                  <input
                    type="text"
                    value={settings.promptPayNo}
                    onChange={(e) => setSettings({ ...settings, promptPayNo: e.target.value })}
                    className="w-full text-xs font-mono px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-6">
              {(['RC', 'QT', 'IN', 'CF'] as DocType[]).map((type) => {
                const cfg = DOC_TYPE_CONFIG[type];
                return (
                  <div key={type} className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-bold"
                        style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}
                      >
                        {cfg.prefix}
                      </span>
                      <h4 className="font-bold text-zinc-900 text-xs">
                        {cfg.thTitle} ({cfg.enTitle})
                      </h4>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-medium mb-1">
                        หมายเหตุเริ่มต้น (Default Notes)
                      </label>
                      <textarea
                        rows={2}
                        value={settings.defaultNotes[type] || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            defaultNotes: { ...settings.defaultNotes, [type]: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-medium mb-1">
                        เงื่อนไข / ข้อตกลงเริ่มต้น (Default Terms)
                      </label>
                      <textarea
                        rows={2}
                        value={settings.defaultTerms[type] || ''}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            defaultTerms: { ...settings.defaultTerms, [type]: e.target.value },
                          })
                        }
                        className="w-full text-xs px-3 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-zinc-50/70">
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-zinc-500 hover:text-zinc-800 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้น</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>บันทึกการตั้งค่า</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
