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
  Plus,
  Bed,
  ListPlus,
  Hotel,
  Cloud,
  Download,
  FileUp,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  onSave: (newSettings: CompanySettings) => void;
  onReset: () => void;
  isCloudConnected?: boolean;
  onSyncCloud?: () => Promise<void>;
  isSyncing?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings: initialSettings,
  onSave,
  onReset,
  isCloudConnected = false,
  onSyncCloud,
  isSyncing = false,
}) => {
  const [settings, setSettings] = useState<CompanySettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<'company' | 'payment' | 'terms' | 'presets' | 'rooms' | 'cloud'>('company');

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

  // Export settings as a downloadable JSON file
  const handleExportJson = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(settings, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `autodoc_settings_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch {
      alert('ไม่สามารถส่งออกไฟล์ JSON ได้');
    }
  };

  // Import settings from a JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported && typeof imported === 'object' && imported.companyName !== undefined) {
            setSettings(imported);
            alert('นำเข้าไฟล์การตั้งค่าสำเร็จ! กรุณากดปุ่ม "บันทึกการตั้งค่า" ด้านล่างเพื่อนำไปใช้งาน');
          } else {
            alert('โครงสร้างไฟล์ JSON ไม่ถูกต้องสำหรับ AutoDoc Settings');
          }
        } catch {
          alert('ไม่สามารถอ่านไฟล์ JSON ได้ กรุณาตรวจสอบไฟล์');
        }
      };
      reader.readAsText(file);
    }
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
        <div className="flex border-b border-zinc-200 bg-zinc-50/70 px-6 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('company')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'company'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>ข้อมูลผู้ออกเอกสาร & โลโก้</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ListPlus className="w-4 h-4 text-indigo-600" />
            <span>ตั้งค่ารายการสินค้า/บริการ</span>
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Hotel className="w-4 h-4 text-amber-600" />
            <span>ตั้งค่าห้องพัก & สาขา (CF)</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
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
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>หมายเหตุ & เงื่อนไขแต่ละเอกสาร</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cloud'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Cloud className="w-4 h-4 text-sky-600" />
            <span>คลาวด์ & ซิงค์ข้ามอุปกรณ์</span>
            <span
              className={`w-2 h-2 rounded-full inline-block ml-0.5 ${
                isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
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

                {/* Signature Image Upload */}
                <div className="md:col-span-2 bg-zinc-50 p-4 rounded-xl border border-zinc-200/80">
                  <label className="block font-semibold text-zinc-700 mb-2">
                    รูปลายเซ็นดิจิทัลสำหรับผู้มีอำนาจลงนาม (Authorized Signature Image)
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.signatureImageUrl ? (
                      <div className="relative group bg-white border border-zinc-200 rounded-lg p-2 w-44 h-16 flex items-center justify-center">
                        <img
                          src={settings.signatureImageUrl}
                          alt="Signature Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setSettings({ ...settings, signatureImageUrl: '' })}
                          className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition-colors"
                          title="ลบลายเซ็น"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-44 h-16 rounded-lg border-2 border-dashed border-zinc-300 flex items-center justify-center text-zinc-400 bg-white">
                        <span className="text-[11px]">ยังไม่มีรูปลายเซ็น</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg cursor-pointer transition-colors text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>อัปโหลดรูปลายเซ็น</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert('กรุณาเลือกไฟล์ภาพลายเซ็นขนาดไม่เกิน 2MB');
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setSettings({
                                  ...settings,
                                  signatureImageUrl: event.target?.result as string,
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-zinc-400">
                        แนะนำภาพพื้นหลังโปร่งใส (PNG) ความกว้างประมาณ 200-400px
                      </p>
                    </div>
                  </div>
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
          {/* Presets Tab: Preset Line Items */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm">
                    รายการสินค้า / บริการที่ใช้บ่อย (Preset Line Items)
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    ตั้งค่ารายการไว้ล่วงหน้าเพื่อเลือกจาก Dropdown ในหน้าออกเอกสารได้ทันที
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newItem = {
                      id: `pre-${Date.now()}`,
                      name: '',
                      description: '',
                      unit: 'รายการ',
                      unitPrice: 0,
                    };
                    setSettings({
                      ...settings,
                      presetItems: [...(settings.presetItems || []), newItem],
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มรายการแม่แบบ</span>
                </button>
              </div>

              <div className="space-y-3">
                {(settings.presetItems || []).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-3 bg-zinc-50 rounded-xl border border-zinc-200/80 grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
                  >
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        ชื่อรายการสินค้า / บริการ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...(settings.presetItems || [])];
                          updated[index] = { ...updated[index], name: e.target.value };
                          setSettings({ ...settings, presetItems: updated });
                        }}
                        placeholder="เช่น ค่าห้องพัก Deluxe Villa"
                        className="w-full text-xs px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                        รายละเอียดเพิ่มเติม
                      </label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => {
                          const updated = [...(settings.presetItems || [])];
                          updated[index] = { ...updated[index], description: e.target.value };
                          setSettings({ ...settings, presetItems: updated });
                        }}
                        placeholder="คำอธิบายย่อยที่จะแสดงในใบเสร็จ/ใบแจ้งหนี้"
                        className="w-full text-xs px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-zinc-700 mb-1">หน่วย</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => {
                          const updated = [...(settings.presetItems || [])];
                          updated[index] = { ...updated[index], unit: e.target.value };
                          setSettings({ ...settings, presetItems: updated });
                        }}
                        placeholder="คืน, ชุด, รายการ"
                        className="w-full text-xs text-center px-2 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                    </div>

                    <div className="md:col-span-2 flex items-end gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                          ราคา/หน่วย
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const updated = [...(settings.presetItems || [])];
                            updated[index] = {
                              ...updated[index],
                              unitPrice: parseFloat(e.target.value) || 0,
                            };
                            setSettings({ ...settings, presetItems: updated });
                          }}
                          className="w-full text-xs text-right font-mono px-2 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = settings.presetItems.filter((_, i) => i !== index);
                          setSettings({ ...settings, presetItems: updated });
                        }}
                        className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {(!settings.presetItems || settings.presetItems.length === 0) && (
                  <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-zinc-50">
                    ยังไม่มีรายการแม่แบบ คลิก "เพิ่มรายการแม่แบบ" เพื่อสร้างรายการเริ่มต้น
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rooms Tab: Room Types linked with Room Numbers, and Hotel Branches */}
          {activeTab === 'rooms' && (
            <div className="space-y-6">
              {/* Hotel Branches Management */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-xs">
                      สาขาของที่พัก / กิจการ (Branches)
                    </h4>
                    <p className="text-zinc-500 text-[11px]">
                      สำหรับแสดงเป็นตัวเลือก Dropdown ในใบยืนยันการจองห้องพัก (CF)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedBranches = [...(settings.branches || []), ''];
                      setSettings({ ...settings, branches: updatedBranches });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-zinc-300 hover:bg-zinc-100 rounded text-xs font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มสาขา</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(settings.branches || []).map((branch, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => {
                          const updated = [...(settings.branches || [])];
                          updated[bIdx] = e.target.value;
                          setSettings({ ...settings, branches: updated });
                        }}
                        placeholder="เช่น สาขาแม่ริม (สำนักงานใหญ่)"
                        className="flex-1 text-xs px-3 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = settings.branches.filter((_, i) => i !== bIdx);
                          setSettings({ ...settings, branches: updated });
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                        title="ลบสาขา"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Types & Linked Room Numbers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div>
                    <h4 className="font-bold text-zinc-900 text-sm">
                      ประเภทห้องพักและหมายเลขห้องที่ลิงก์กัน (Room Types & Linked Room Numbers)
                    </h4>
                    <p className="text-zinc-500 text-xs">
                      เมื่อเลือกประเภทห้องในใบจอง CF ระบบจะดึงหมายเลขห้องที่สังกัดประเภทนั้นมาให้เลือกทันที
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newRt = {
                        id: `rt-${Date.now()}`,
                        name: '',
                        defaultPrice: 0,
                        roomNumbers: [''],
                      };
                      setSettings({
                        ...settings,
                        presetRoomTypes: [...(settings.presetRoomTypes || []), newRt],
                      });
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มประเภทห้องพัก</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(settings.presetRoomTypes || []).map((rt, rtIdx) => (
                    <div
                      key={rt.id || rtIdx}
                      className="p-4 bg-amber-50/40 rounded-xl border border-amber-200 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                              ชื่อประเภทห้องพัก <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={rt.name}
                              onChange={(e) => {
                                const updated = [...(settings.presetRoomTypes || [])];
                                updated[rtIdx] = { ...updated[rtIdx], name: e.target.value };
                                setSettings({ ...settings, presetRoomTypes: updated });
                              }}
                              placeholder="เช่น Deluxe Villa, Suite, Standard"
                              className="w-full text-xs px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                              ราคาเริ่มต้น (บาท/คืน)
                            </label>
                            <input
                              type="number"
                              step="any"
                              value={rt.defaultPrice || 0}
                              onChange={(e) => {
                                const updated = [...(settings.presetRoomTypes || [])];
                                updated[rtIdx] = {
                                  ...updated[rtIdx],
                                  defaultPrice: parseFloat(e.target.value) || 0,
                                };
                                setSettings({ ...settings, presetRoomTypes: updated });
                              }}
                              className="w-full text-xs font-mono px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = settings.presetRoomTypes.filter((_, i) => i !== rtIdx);
                            setSettings({ ...settings, presetRoomTypes: updated });
                          }}
                          className="p-2 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="ลบประเภทห้องพักนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Linked Room Numbers */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-semibold text-zinc-700">
                            หมายเลขห้องพักที่สังกัดประเภทนี้ (เช่น 101, 102, Villa A):
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(settings.presetRoomTypes || [])];
                              updated[rtIdx] = {
                                ...updated[rtIdx],
                                roomNumbers: [...(updated[rtIdx].roomNumbers || []), ''],
                              };
                              setSettings({ ...settings, presetRoomTypes: updated });
                            }}
                            className="text-[11px] text-amber-700 hover:text-amber-900 flex items-center gap-0.5 cursor-pointer font-medium"
                          >
                            <Plus className="w-3 h-3" />
                            <span>เพิ่มหมายเลขห้อง</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {(rt.roomNumbers || []).map((rn, rnIdx) => (
                            <div
                              key={rnIdx}
                              className="flex items-center gap-1 bg-white border border-zinc-200 px-2 py-1 rounded-md"
                            >
                              <input
                                type="text"
                                value={rn}
                                onChange={(e) => {
                                  const updated = [...(settings.presetRoomTypes || [])];
                                  const currentNumbers = [...(updated[rtIdx].roomNumbers || [])];
                                  currentNumbers[rnIdx] = e.target.value;
                                  updated[rtIdx] = {
                                    ...updated[rtIdx],
                                    roomNumbers: currentNumbers,
                                  };
                                  setSettings({ ...settings, presetRoomTypes: updated });
                                }}
                                placeholder="101"
                                className="w-20 text-xs text-center font-mono focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...(settings.presetRoomTypes || [])];
                                  updated[rtIdx] = {
                                    ...updated[rtIdx],
                                    roomNumbers: updated[rtIdx].roomNumbers.filter(
                                      (_, i) => i !== rnIdx
                                    ),
                                  };
                                  setSettings({ ...settings, presetRoomTypes: updated });
                                }}
                                className="text-zinc-400 hover:text-rose-600 cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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

          {activeTab === 'cloud' && (
            <div className="space-y-6">
              {/* Cloud Sync Status Card */}
              <div
                className={`p-5 rounded-2xl border ${
                  isCloudConnected
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50/60 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isCloudConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isCloudConnected ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-zinc-900">
                        {isCloudConnected
                          ? 'ระบบคลาวด์เชื่อมต่อแล้ว (Google Sheets & Drive Database)'
                          : 'ยังไม่ได้เชื่อมต่อระบบคลาวด์ Google บนอุปกรณ์นี้'}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isCloudConnected
                            ? 'bg-emerald-200 text-emerald-900'
                            : 'bg-amber-200 text-amber-900'
                        }`}
                      >
                        {isCloudConnected ? 'ออนไลน์' : 'ออฟไลน์ (เครื่องนี้)'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {isCloudConnected
                        ? 'ข้อมูลผู้ออกเอกสาร โลโก้ ลายเซ็น รายการสินค้า ห้องพัก และเงื่อนไขต่าง ๆ จะถูกบันทึกขึ้นแท็บ "Settings" ใน Google Sheets อัตโนมัติ ทำให้คุณเปิดใช้งานจากคอมพิวเตอร์ โน้ตบุ๊ก แท็บเล็ต หรือมือถือเครื่องใดก็ได้ แล้วได้ข้อมูลตรงกันตลอดเวลา'
                        : 'ปัจจุบันการตั้งค่าของคุณถูกบันทึกไว้ในเบราว์เซอร์ของเครื่องนี้เท่านั้น หากคุณเปิดจากอุปกรณ์อื่น ระบบจะยังไม่เห็นข้อมูลการตั้งค่านี้ กรุณากดปุ่ม "เชื่อมต่อ Google" ที่แถบด้านบน เพื่อเริ่มแชร์ข้อมูลอัตโนมัติ'}
                    </p>

                    {isCloudConnected && (
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {onSyncCloud && (
                          <button
                            type="button"
                            onClick={() => onSyncCloud()}
                            disabled={isSyncing}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 text-xs"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                            <span>{isSyncing ? 'กำลังดึงข้อมูล...' : 'ดึงการตั้งค่าล่าสุดจาก Google Sheets'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSave}
                          className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer text-xs"
                        >
                          <Cloud className="w-3.5 h-3.5 text-sky-400" />
                          <span>บันทึกและส่งขึ้น Google Sheets ทันที</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Offline Backup & Restore Section */}
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3">
                <div>
                  <h4 className="font-bold text-xs text-zinc-800 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-zinc-600" />
                    <span>สำรองข้อมูลการตั้งค่าและย้ายเครื่อง (Backup & Restore JSON)</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    คุณสามารถดาวน์โหลดไฟล์การตั้งค่าทั้งหมด (รวมโลโก้ ลายเซ็น รายการ และห้องพัก) เก็บไว้เป็นไฟล์ หรือนำไปเปิดบนอุปกรณ์อื่นได้ทันที
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg text-zinc-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-700" />
                    <span>ส่งออกไฟล์สำรอง (.json)</span>
                  </button>

                  <label className="px-3.5 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg text-zinc-700 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-2xs">
                    <FileUp className="w-3.5 h-3.5 text-zinc-700" />
                    <span>นำเข้าไฟล์สำรอง (.json)</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportJson}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
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
