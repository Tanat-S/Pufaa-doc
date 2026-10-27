export type DocType = 'RC' | 'QT' | 'IN' | 'CF';

export interface DocItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface BookingDetails {
  roomType: string;
  roomNumber?: string;
  checkInDate: string;
  checkInTime?: string;
  checkOutDate: string;
  checkOutTime?: string;
  nights: number;
  adults: number;
  children: number;
  mealPlan?: string;
}

export interface CustomerInfo {
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  branch?: string;
}

export type DocStatus = 'draft' | 'issued' | 'paid' | 'cancelled';

export interface DocumentData {
  id: string;
  docType: DocType;
  docNumber: string; // XX2026-001
  date: string;
  dueDate?: string;
  customer: CustomerInfo;
  booking?: BookingDetails;
  items: DocItem[];
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  vatEnabled: boolean;
  vatRate: number; // default 7
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  remainingAmount: number;
  bahtText: string;
  notes: string;
  paymentTerms: string;
  status: DocStatus;
  driveFileId?: string;
  driveFileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanySettings {
  companyName: string;
  companyNameEn?: string;
  taxId: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  logoUrl: string;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  promptPayNo: string;
  defaultNotes: Record<DocType, string>;
  defaultTerms: Record<DocType, string>;
  signatureName: string;
  signatureTitle: string;
  googleSpreadsheetId?: string;
  googleDriveFolderId?: string;
}

export const DOC_TYPE_CONFIG: Record<
  DocType,
  {
    prefix: string;
    thTitle: string;
    enTitle: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    badgeColor: string;
  }
> = {
  RC: {
    prefix: 'RC',
    thTitle: 'ใบเสร็จรับเงิน',
    enTitle: 'RECEIPT',
    color: '#059669', // Emerald
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  QT: {
    prefix: 'QT',
    thTitle: 'ใบเสนอราคา',
    enTitle: 'QUOTATION',
    color: '#4f46e5', // Indigo
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  IN: {
    prefix: 'IN',
    thTitle: 'ใบแจ้งหนี้',
    enTitle: 'INVOICE',
    color: '#0284c7', // Sky / Blue
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  CF: {
    prefix: 'CF',
    thTitle: 'ใบยืนยันการจองห้องพัก',
    enTitle: 'BOOKING CONFIRMATION',
    color: '#d97706', // Amber
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
};
