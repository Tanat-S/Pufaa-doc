/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { CompanySettings, DocType, DocumentData } from './types/document';
import { DEFAULT_SETTINGS, INITIAL_DOCUMENTS } from './utils/defaultData';
import { initAuth, googleSignIn, logout, getAccessToken } from './services/auth';
import {
  getOrCreateDatabaseSpreadsheet,
  loadDocumentsFromSheet,
  syncAllDocumentsToSheet,
} from './services/googleSheets';
import { getOrCreateAutoDocFolder, uploadPdfToDrive } from './services/googleDrive';
import { generatePdfFromDocData } from './utils/pdfExport';
import { getNextDocNumber } from './utils/numberGenerator';
import { printDocumentIsolated } from './utils/printHelper';

import { Navbar } from './components/Navbar';
import { DocumentList } from './components/DocumentList';
import { DocumentEditor } from './components/DocumentEditor';
import { DocumentPaper } from './components/DocumentPaper';
import { PreviewModal } from './components/PreviewModal';
import { SettingsModal } from './components/SettingsModal';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileSpreadsheet,
  Cloud,
} from 'lucide-react';

const STORAGE_KEY_DOCS = 'autodoc_documents_v1';
const STORAGE_KEY_SETTINGS = 'autodoc_settings_v1';
const STORAGE_KEY_SHEET_ID = 'autodoc_sheet_id_v1';
const STORAGE_KEY_SHEET_URL = 'autodoc_sheet_url_v1';

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

  // Print state
  const [printDoc, setPrintDoc] = useState<DocumentData | null>(null);

  // Auth & Cloud Sync State
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY_SHEET_ID)
  );
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY_SHEET_URL)
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>();

  // Toast notifications
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    link?: { label: string; url: string };
  } | null>(null);

  // Hidden print paper container reference
  const printPaperRef = useRef<HTMLDivElement>(null);

  // Save documents to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.warn('Failed to store documents in localStorage', e);
    }
  }, [documents]);

  // Save settings to localStorage whenever changed
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

  // Google Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Handle Google Login
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showToast('success', `เชื่อมต่อ Google สำเร็จ: ${result.user.displayName || result.user.email}`);

        // Automatically initialize or find Google Sheet database
        await handleSyncGoogleSheets(result.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast('error', 'ไม่สามารถเชื่อมต่อ Google ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google Logout
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      showToast('info', 'ออกจากระบบ Google เรียบร้อย');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Sync with Google Sheets
  const handleSyncGoogleSheets = async (customToken?: string) => {
    const activeToken = customToken || token || (await getAccessToken());
    if (!activeToken) {
      showToast('info', 'กรุณาเชื่อมต่อ Google ก่อน เพื่อใช้งานฐานข้อมูลบนคลาวด์');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. Get or create spreadsheet
      const sheetRecord = await getOrCreateDatabaseSpreadsheet(activeToken);
      setSpreadsheetId(sheetRecord.spreadsheetId);
      setSpreadsheetUrl(sheetRecord.spreadsheetUrl);
      localStorage.setItem(STORAGE_KEY_SHEET_ID, sheetRecord.spreadsheetId);
      localStorage.setItem(STORAGE_KEY_SHEET_URL, sheetRecord.spreadsheetUrl);

      // 2. Load any documents from sheet to merge
      const remoteDocs = await loadDocumentsFromSheet(activeToken, sheetRecord.spreadsheetId);

      // Merge remote documents with local documents by ID
      const docsMap = new Map<string, DocumentData>();
      documents.forEach((d) => docsMap.set(d.id, d));
      remoteDocs.forEach((d) => docsMap.set(d.id, d)); // remote takes update priority if exists

      const mergedList = Array.from(docsMap.values());
      // Sort newest first
      mergedList.sort(
        (a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );

      // 3. Write merged list back to sheet
      await syncAllDocumentsToSheet(activeToken, sheetRecord.spreadsheetId, mergedList);

      setDocuments(mergedList);
      const timeStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(timeStr);

      showToast(
        'success',
        `ซิงค์ข้อมูลลง Google Sheets เรียบร้อย (${mergedList.length} รายการ)`,
        {
          label: 'เปิดดูใน Sheets',
          url: sheetRecord.spreadsheetUrl,
        }
      );
    } catch (err: any) {
      console.error('Sync error:', err);
      showToast('error', err.message || 'เกิดข้อผิดพลาดในการซิงค์กับ Google Sheets');
    } finally {
      setIsSyncing(false);
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
              roomType: 'Deluxe Room',
              roomNumber: '101',
              checkInDate: new Date().toISOString().split('T')[0],
              checkInTime: '14:00 น.',
              checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              checkOutTime: '12:00 น.',
              nights: 1,
              adults: 2,
              children: 0,
              mealPlan: 'รวมอาหารเช้า (Breakfast Included)',
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

  // Save document from editor
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

    // Auto-sync to Google Sheets if connected
    const activeToken = token || (await getAccessToken());
    if (activeToken && spreadsheetId) {
      try {
        await syncAllDocumentsToSheet(activeToken, spreadsheetId, updatedDocs);
        setLastSyncedAt(
          new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        );
      } catch (e) {
        console.warn('Auto sync to sheet failed', e);
      }
    }

    setCurrentView('list');
  };

  // Delete document (Mandatory user confirmation)
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

    // Sync deletion to Google Sheets if connected
    const activeToken = token || (await getAccessToken());
    if (activeToken && spreadsheetId) {
      try {
        await syncAllDocumentsToSheet(activeToken, spreadsheetId, updated);
      } catch (e) {
        console.warn('Sync deletion failed', e);
      }
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

  // Upload PDF to Google Drive (with auto-login if not authenticated)
  const handleUploadToDrive = async (doc: DocumentData) => {
    let activeToken = token || (await getAccessToken());

    // If not authenticated yet, automatically trigger Google Sign-In popup!
    if (!activeToken) {
      try {
        showToast('info', 'กรุณาเข้าสู่ระบบ Google ในหน้าต่างที่เปิดขึ้น...');
        const authResult = await googleSignIn();
        if (authResult) {
          setUser(authResult.user);
          setToken(authResult.accessToken);
          activeToken = authResult.accessToken;
          showToast('success', `เชื่อมต่อ Google สำเร็จ: ${authResult.user.displayName || authResult.user.email}`);
        } else {
          showToast('info', 'ยกเลิกการเชื่อมต่อ Google');
          return;
        }
      } catch (authErr: any) {
        console.error('Google Sign In failed:', authErr);
        showToast('error', 'ไม่สามารถเข้าสู่ระบบ Google ได้ กรุณาลองใหม่อีกครั้ง');
        return;
      }
    }

    if (!activeToken) return;

    setIsSavingDrive(true);
    try {
      showToast('info', `กำลังแปลงไฟล์และส่งไปยัง Google Drive...`, undefined, 4000);

      // Generate PDF blob in isolated sandbox (no oklch color error)
      const pdfBlob = await generatePdfFromDocData(doc, settings, false);

      // Ensure 'AutoDoc Documents' folder exists in user's Drive (auto-created if not exists)
      const folderId = await getOrCreateAutoDocFolder(activeToken);

      // Upload file to Drive
      const uploadResult = await uploadPdfToDrive(
        activeToken,
        pdfBlob,
        `${doc.docNumber}.pdf`,
        folderId
      );

      // Update doc record with Drive link
      const updatedDoc = {
        ...doc,
        driveFileId: uploadResult.fileId,
        driveFileUrl: uploadResult.webViewLink,
        updatedAt: new Date().toISOString(),
      };

      const updatedList = documents.map((d) => (d.id === doc.id ? updatedDoc : d));
      setDocuments(updatedList);

      if (editingDoc && editingDoc.id === doc.id) {
        setEditingDoc(updatedDoc);
      }
      if (previewDoc && previewDoc.id === doc.id) {
        setPreviewDoc(updatedDoc);
      }

      // Auto-sync updated link to Google Sheets
      if (spreadsheetId) {
        try {
          await syncAllDocumentsToSheet(activeToken, spreadsheetId, updatedList);
        } catch (e) {
          console.warn('Sync to sheet failed after drive upload', e);
        }
      }

      showToast(
        'success',
        `บันทึกเอกสาร ${doc.docNumber} ลงใน Google Drive สำเร็จ!`,
        {
          label: 'เปิดดูใน Drive',
          url: uploadResult.webViewLink,
        },
        8000
      );
    } catch (err: any) {
      console.error('Drive upload error:', err);
      showToast('error', err.message || 'ไม่สามารถอัปโหลดไฟล์ไปยัง Google Drive ได้');
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
        onSyncSheets={() => handleSyncGoogleSheets()}
        isSyncing={isSyncing}
        spreadsheetUrl={spreadsheetUrl || undefined}
        lastSyncedAt={lastSyncedAt}
      />

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
            {toast.type === 'info' && <Cloud className="w-4 h-4 text-blue-400 flex-shrink-0" />}

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
        onSave={(newSettings) => {
          setSettings(newSettings);
          showToast('success', 'บันทึกการตั้งค่าเรียบร้อยแล้ว');
        }}
        onReset={() => {
          setSettings(DEFAULT_SETTINGS);
          showToast('info', 'คืนค่าเริ่มต้นสำเร็จ');
        }}
      />
    </div>
  );
}
