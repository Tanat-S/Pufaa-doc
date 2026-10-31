import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocFromServer,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { CompanySettings, DocumentData } from '../types/document';
import { DEFAULT_SETTINGS } from '../utils/defaultData';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// CRITICAL: Must pass firestoreDatabaseId if provided in config
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing');
    }
  }
}
testConnection();

// Global Settings Real-time subscription
export function subscribeToSettings(
  onSettingsUpdate: (settings: CompanySettings) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const settingsDocRef = doc(db, 'settings', 'global');
  
  return onSnapshot(
    settingsDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.companySettings) {
          onSettingsUpdate(data.companySettings as CompanySettings);
        }
      }
    },
    (error) => {
      console.warn('Settings subscription listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    }
  );
}

// Save Settings to Cloud Firestore
export async function saveSettingsToCloud(
  settings: CompanySettings,
  userUid?: string
): Promise<void> {
  const path = 'settings/global';
  try {
    const settingsDocRef = doc(db, 'settings', 'global');
    await setDoc(
      settingsDocRef,
      {
        id: 'global',
        companySettings: settings,
        updatedAt: new Date().toISOString(),
        updatedBy: userUid || auth.currentUser?.uid || 'system',
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Documents Real-time subscription
export function subscribeToDocuments(
  onDocsUpdate: (docs: DocumentData[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docsColRef = collection(db, 'documents');

  return onSnapshot(
    docsColRef,
    (snapshot) => {
      const list: DocumentData[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && data.documentData) {
          list.push(data.documentData as DocumentData);
        }
      });
      // Sort newest first
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      onDocsUpdate(list);
    },
    (error) => {
      console.warn('Documents subscription listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'documents');
    }
  );
}

// Save or Update Document in Cloud Firestore
export async function saveDocumentToCloud(
  docData: DocumentData,
  userUid?: string
): Promise<void> {
  const path = `documents/${docData.id}`;
  try {
    const docRef = doc(db, 'documents', docData.id);
    await setDoc(
      docRef,
      {
        id: docData.id,
        docType: docData.docType,
        docNumber: docData.docNumber,
        docDate: docData.date,
        branch: docData.booking?.branch || 'สำนักงานใหญ่',
        documentData: docData,
        createdBy: userUid || auth.currentUser?.uid || 'system',
        createdAt: docData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Delete Document from Cloud Firestore
export async function deleteDocumentFromCloud(docId: string): Promise<void> {
  const path = `documents/${docId}`;
  try {
    const docRef = doc(db, 'documents', docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
