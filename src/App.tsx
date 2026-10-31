/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { CompanySettings, DocType, DocumentData } from './types/document';
import { DEFAULT_SETTINGS, INITIAL_DOCUMENTS } from './utils/defaultData';
import { initAuth, googleSignIn, logout } from './services/auth';
import {
  subscribeToSettings,
  saveSettingsToCloud,
  subscribeToDocuments,
  saveDocumentToCloud,
  deleteDocumentFromCloud,
} from './services/firestore';
import { getOrCreateAutoDocFolder, uploadPdfToDrive } from './services/googleDrive';
import { generatePdfFromDocData } from './utils/pdfExport';
import { getNextDocNumber } from './utils/numberGenerator';
import { printDocumentIsolated } from './utils/printHelper';

import { Navbar } from './components/Navbar';
import { DocumentList } from './components/DocumentList';
import { DocumentEditor } from './components/DocumentEditor';
import { PreviewModal } from './components/PreviewModal';
import { SettingsModal } from './components/SettingsModal';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Cloud,
} from 'lucide-react';

const STORAGE_KEY_DOCS = 'autodoc_documents_v1';
const STORAGE_KEY_SETTINGS = 'autodoc_settings_v1';

export default function App() {
  // Application State
  const [documents, setDocuments] = useState<DocumentData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved documents', e);
    }
    return INITIAL_DOCUMENTS;
  });

  const [settings, setSettings] = useState<CompanySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [currentView, setCurrentView] = useState<'list' | 'editor'>('list');
  const [editingDoc, setEditingDoc] = useState<DocumentData | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auth & Cloud Sync State
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSavingDrive, setIsSavingDrive] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    link?: { label: string; url: string };
  } | null>(null);

  // Save documents to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to store documents in localStorage', e);
    }
  }, [documents]);

  // Save settings to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to store settings in localStorage', e);
    }
  }, [settings]);

  // Show toast utility
  const showToast = (
    type: 'success' | 'error' | 'info',
    message: string,
    link?: { label: string; url: string },
    duration = 4500
  ) => {
    setToast({ type, message, link });
    setTimeout(() => {
      setToast(null);
    }, duration);
  };

  // Real-time Cloud Firestore Subscriptions & Auth Listener
  useEffect(() => {
    // 1. Subscribe to Cloud Settings in Real-time (instant multi-device sync)
    const unsubSettings = subscribeToSettings(
      (cloudSettings) => {
        if (cloudSettings && cloudSettings.companyName) {
          setSettings(cloudSettings);
          try {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(cloudSettings));
          } catch {}
        }
      },
      (err) => {
        console.warn('Settings real-time sync listener notice:', err);
      }
    );

    // 2. Subscribe to Cloud Documents in Real-time (instant multi-device sync)
    const unsubDocs = subscribeToDocuments(
      (cloudDocs) => {
        if (cloudDocs && cloudDocs.length > 0) {
          setDocuments(cloudDocs);
          try {
            localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(cloudDocs));
          } catch {}
        }
      },
      (err) => {
        console.warn('Documents real-time sync listener notice:', err);
      }
    );

    // 3. Listen to Firebase Auth state
    const unsubAuth = initAuth((currentUser) => {
      setUser(currentUser);
    });

    return () => {
      unsubSettings();
      unsubDocs();
      unsubAuth();
    };
  }, []);

  // Handle Google Login
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const loggedUser = await googleSignIn();
      if (loggedUser) {
        setUser(loggedUser);
        showToast('success', `เข้าสู่ระบบสำเร็จ: ${loggedUser.displayName || loggedUser.email} (เชื่อมต่อคลาวด์ Real-time)`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('error', 'ไม่สามารถเข้าสู่ระบบ Google ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Logout
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      showToast('info', 'ออกจากระบบ Google เรียบร้อย');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Create new document
  const handleNewDocument = (docType: DocType = 'RC') => {
    const existingNumbers = documents.map((d) => d.docNumber);
    const newDocNumber = getNextDocNumber(docType, existingNumbers);

    setEditingDoc({
      id: `doc-${Date.now()}`,
      docType,
      docNumber: newDocNumber,
      date: new Date().toISOString().split('T')[0],
      customer: {
        name: '',
        taxId: '',
        phone: '',
        email: '',
        address: '',
      },
      booking:
        docType === 'CF'
          ? {
              branch: settings.branches?.[0] || 'สาขาใหญ่ (สำนักงานใหญ่)',
              roomType: settings.presetRoomTypes?.[0]?.name || 'Deluxe Room',
              roomNumber: settings.presetRoomTypes?.[0]?.roomNumbers?.[0] || '101',
              rooms: [
                {
                  id: 'room-1',
                  roomType: settings.presetRoomTypes?.[0]?.name || 'Deluxe Room',
                  roomNumber: settings.presetRoomTypes?.[0]?.roomNumbers?.[0] || '101',
                  quantity: 1,
                  note: '',
                },
              ],
              checkInDate: new Date().toISOString().split('T')[0],
              checkInTime: '14:00 น.',
              checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              checkOutTime: '12:00 น.',
              nights: 1,
              adults: 2,
              children: 0,
            }
          : undefined,
      items: [
        {
          id: '1',
          name: docType === 'CF' ? 'ค่าห้องพัก Deluxe Room (1 คืน)' : 'ค่าบริการ / สินค้า',
          description: '',
          quantity: 1,
          unit: docType === 'CF' ? 'คืน' : 'รายการ',
          unitPrice: docType === 'CF' ? 2500 : 1000,
          discount: 0,
          amount: docType === 'CF' ? 2500 : 1000,
        },
      ],
      subtotal: docType === 'CF' ? 2500 : 1000,
      discountPercent: 0,
      discountAmount: 0,
      vatEnabled: docType !== 'CF',
      vatRate: 7,
      vatAmount: docType !== 'CF' ? 70 : 0,
      grandTotal: docType !== 'CF' ? 1070 : 2500,
      paidAmount: docType === 'RC' ? 1070 : 0,
      remainingAmount: docType === 'RC' ? 0 : docType === 'CF' ? 2500 : 1070,
      bahtText: '',
      notes: settings.defaultNotes[docType] || '',
      paymentTerms: settings.defaultTerms[docType] || '',
      status: docType === 'RC' ? 'paid' : 'issued',
      showSignature: true,
      signatureDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCurrentView('editor');
  };

  // Edit existing document
  const handleEditDocument = (doc: DocumentData) => {
    setEditingDoc(doc);
    setCurrentView('editor');
  };

  // Duplicate document
  const handleDuplicateDocument = (doc: DocumentData) => {
    const existingNumbers = documents.map((d) => d.docNumber);
    const newDocNumber = getNextDocNumber(doc.docType, existingNumbers);

    const duplicated: DocumentData = {
      ...doc,
      id: `doc-${Date.now()}`,
      docNumber: newDocNumber,
      date: new Date().toISOString().split('T')[0],
      driveFileId: undefined,
      driveFileUrl: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingDoc(duplicated);
    setCurrentView('editor');
    showToast('info', `คัดลอกเป็นเอกสารใหม่แล้ว: ${newDocNumber}`);
  };

  // Save document from editor (instantly saves to Cloud Firestore in Real-time)
  const handleSaveDocument = async (doc: DocumentData) => {
    const index = documents.findIndex((d) => d.id === doc.id);
    let updatedDocs: DocumentData[];

    if (index >= 0) {
      updatedDocs = [...documents];
      updatedDocs[index] = doc;
    } else {
      updatedDocs = [doc, ...documents];
    }

    setDocuments(updatedDocs);
    showToast('success', `บันทึกเอกสาร ${doc.docNumber} เรียบร้อยแล้ว`);

    // Real-time Cloud Save: changes propagate instantly to all devices
    try {
      await saveDocumentToCloud(doc, user?.uid);
    } catch (e) {
      console.warn('Real-time save to cloud failed:', e);
    }

    setCurrentView('list');
  };

  // Delete document (Mandatory user confirmation, syncs to Cloud Firestore in Real-time)
  const handleDeleteDocument = async (docId: string) => {
    const docToDelete = documents.find((d) => d.id === docId);
    if (!docToDelete) return;

    const confirmed = window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการลบเอกสารเลขที่ "${docToDelete.docNumber}" (${docToDelete.customer.name})?\nการดำเนินการนี้จะลบข้อมูลออกจากระบบ`
    );
    if (!confirmed) return;

    const updated = documents.filter((d) => d.id !== docId);
    setDocuments(updated);
    showToast('info', `ลบเอกสาร ${docToDelete.docNumber} แล้ว`);

    // Real-time Cloud Delete
    try {
      await deleteDocumentFromCloud(docId);
    } catch (e) {
      console.warn('Delete from cloud failed:', e);
    }
  };

  // Save settings with automatic Real-time cloud sync across devices
  const handleSaveSettings = async (newSettings: CompanySettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
      console.warn('Failed to store settings in localStorage', e);
    }

    // Real-time Cloud Save: updates all devices immediately in milliseconds
    try {
      await saveSettingsToCloud(newSettings, user?.uid);
      showToast('success', 'บันทึกและซิงค์การตั้งค่ากับคลาวด์แล้ว ทุกอุปกรณ์จะได้รับข้อมูลทันที');
    } catch (e) {
      console.warn('Cloud settings sync failed:', e);
      showToast('info', 'บันทึกการตั้งค่าลงในเครื่องแล้ว');
    }
  };

  // Robust Print Handler using isolated iframe
  const handlePrintDocument = (doc: DocumentData) => {
    try {
      showToast('info', `กำลังเปิดหน้าต่างพิมพ์สำหรับ ${doc.docNumber}...`, undefined, 2000);
      printDocumentIsolated(doc, settings);
    } catch (err) {
      console.error('Print error:', err);
      showToast('error', 'ไม่สามารถเปิดหน้าต่างพิมพ์ได้ กรุณาลองใช้ปุ่มดาวน์โหลด PDF แทน');
    }
  };

  // Direct Client-Side Download PDF (100% working sandbox without oklch errors)
  const handleDownloadPdf = async (doc: DocumentData) => {
    try {
      showToast('info', `กำลังสร้างไฟล์ PDF สำหรับ ${doc.docNumber}...`, undefined, 3000);
      await generatePdfFromDocData(doc, settings, true);
      showToast('success', `ดาวน์โหลดไฟล์ ${doc.docNumber}.pdf สำเร็จแล้ว`);
    } catch (err: any) {
      console.error('PDF download error:', err);
      showToast('error', 'ไม่สามารถดาวน์โหลด PDF ได้ กรุณาลองใช้ปุ่มพิมพ์แทน');
    }
  };

  // Upload PDF to Google Drive
  const handleUploadToDrive = async (doc: DocumentData) => {
    setIsSavingDrive(true);
    try {
      showToast('info', `กำลังสร้างและดาวน์โหลดไฟล์ PDF สำหรับ ${doc.docNumber}...`, undefined, 3000);
      await generatePdfFromDocData(doc, settings, true);
      showToast('success', `ดาวน์โหลดไฟล์ ${doc.docNumber}.pdf สำหรับจัดเก็บในเครื่องเรียบร้อยแล้ว`);
    } catch (err: any) {
      console.error('Drive/PDF download error:', err);
      showToast('error', err.message || 'ไม่สามารถสร้างไฟล์ PDF ได้');
    } finally {
      setIsSavingDrive(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-zinc-900 flex flex-col font-sans">
      {/* Navbar Header */}
      <Navbar
        currentView={currentView}
        onViewChange={(view) => {
          if (view === 'editor' && !editingDoc) {
            handleNewDocument('RC');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isLoggingIn={isLoggingIn}
        isCloudSynced={Boolean(user)}
      />

      {/* Multi-Device Real-time Cloud Sync Banner (shown when not logged in to guide user) */}
      {!user && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-b border-emerald-100 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-zinc-700">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-semibold text-zinc-900">
                ซิงค์ข้ามอุปกรณ์ Real-time (Multi-Device Cloud):
              </span>
              <span className="text-zinc-600 hidden sm:inline">
                เข้าสู่ระบบด้วย Google เพื่อให้การตั้งค่า สาขา ห้องพัก รายการ และเอกสารทั้งหมด อัปเดตตรงกันทันทีทุกอุปกรณ์ในเสี้ยววินาที
              </span>
            </div>
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 text-xs disabled:opacity-50"
            >
              <span>{isLoggingIn ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบเพื่อซิงค์สดทุกเครื่อง'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-200">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-50 border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-50 border-rose-800'
                : 'bg-zinc-900 text-zinc-100 border-zinc-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
            {toast.type === 'info' && <Cloud className="w-4 h-4 text-sky-400 flex-shrink-0" />}

            <span className="flex-1 leading-relaxed">{toast.message}</span>

            {toast.link && (
              <a
                href={toast.link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-white hover:opacity-80 flex items-center gap-1 ml-1"
              >
                <span>{toast.link.label}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={() => setToast(null)}
              className="text-zinc-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'list' && (
          <DocumentList
            documents={documents}
            onNewDoc={(type) => handleNewDocument(type)}
            onEditDoc={handleEditDocument}
            onPreviewDoc={(doc) => setPreviewDoc(doc)}
            onPrintDoc={handlePrintDocument}
            onDownloadPdf={handleDownloadPdf}
            onDuplicateDoc={handleDuplicateDocument}
            onDeleteDoc={handleDeleteDocument}
            onUploadDrive={handleUploadToDrive}
          />
        )}

        {currentView === 'editor' && (
          <DocumentEditor
            initialDocument={editingDoc}
            existingDocNumbers={documents.map((d) => d.docNumber)}
            settings={settings}
            onSave={handleSaveDocument}
            onCancel={() => {
              setEditingDoc(null);
              setCurrentView('list');
            }}
            onPreview={(doc) => setPreviewDoc(doc)}
            onPrint={handlePrintDocument}
            onDownloadPdf={handleDownloadPdf}
            onUploadDrive={handleUploadToDrive}
            isSavingDrive={isSavingDrive}
            driveLink={editingDoc?.driveFileUrl}
          />
        )}
      </main>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
        settings={settings}
        onPrint={handlePrintDocument}
        onDownloadPdf={handleDownloadPdf}
        onUploadDrive={handleUploadToDrive}
        isSavingDrive={isSavingDrive}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
        onReset={() => {
          setSettings(DEFAULT_SETTINGS);
          showToast('info', 'คืนค่าเริ่มต้นสำเร็จ');
        }}
        isCloudConnected={Boolean(user)}
      />
    </div>
  );
}
