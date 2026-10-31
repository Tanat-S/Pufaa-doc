import { DocumentData, CompanySettings } from '../types/document';

/**
 * Google Sheets API service for storing and synchronizing document records
 */

export const SPREADSHEET_TITLE = 'AutoDoc Database - บันทึกเอกสาร';
export const SHEET_NAME = 'Documents';
export const SETTINGS_SHEET_NAME = 'Settings';

export interface SheetDocRecord {
  spreadsheetId: string;
  spreadsheetUrl: string;
}

/**
 * Searches for or creates a Google Sheet named 'AutoDoc Database - บันทึกเอกสาร'
 * and ensures both 'Documents' and 'Settings' sheet tabs exist.
 */
export async function getOrCreateDatabaseSpreadsheet(token: string): Promise<SheetDocRecord> {
  // First search if spreadsheet already exists in user's Drive
  const query = encodeURIComponent(
    `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const file = searchData.files[0];
      const spreadsheetId = file.id;

      // Ensure 'Settings' tab exists in existing spreadsheet
      await ensureSettingsSheetExists(token, spreadsheetId);

      return {
        spreadsheetId,
        spreadsheetUrl: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
      };
    }
  }

  // Create new Spreadsheet with formatted headers for both Documents and Settings
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: SETTINGS_SHEET_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error('Failed to create spreadsheet:', errorText);
    throw new Error('ไม่สามารถสร้าง Google Sheet ฐานข้อมูลได้');
  }

  const createdSheet = await createRes.json();
  const spreadsheetId = createdSheet.spreadsheetId;

  // Set up header columns for Documents sheet
  const headerRow = [
    'ID',
    'เลขที่เอกสาร (Doc Number)',
    'ประเภท (Type)',
    'วันที่ (Date)',
    'ลูกค้า / ผู้เข้าพัก (Customer)',
    'เบอร์โทร (Phone)',
    'ยอดรวมทั้งสิ้น (Grand Total)',
    'สถานะ (Status)',
    'ลิงก์ PDF Drive (Drive URL)',
    'สร้างเมื่อ (Created At)',
    'อัปเดตเมื่อ (Updated At)',
    'ข้อมูลเต็ม JSON (Full Data)',
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SHEET_NAME
    )}!A1:L1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [headerRow],
      }),
    }
  );

  // Set up header columns for Settings sheet
  const settingsHeader = [
    'Key (หัวข้อการตั้งค่า)',
    'Description (คำอธิบาย / สรุปย่อ)',
    'Updated At (อัปเดตล่าสุดเมื่อ)',
    'Full Settings JSON (ข้อมูลเต็มระบบ)',
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SETTINGS_SHEET_NAME
    )}!A1:D1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [settingsHeader],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
  };
}

/**
 * Ensures that the 'Settings' sheet tab exists in an existing spreadsheet
 */
async function ensureSettingsSheetExists(token: string, spreadsheetId: string): Promise<void> {
  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!metaRes.ok) return;

    const meta = await metaRes.json();
    const sheetTitles: string[] = (meta.sheets || []).map((s: any) => s.properties?.title);

    if (!sheetTitles.includes(SETTINGS_SHEET_NAME)) {
      // Add 'Settings' sheet tab
      const addRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: SETTINGS_SHEET_NAME,
                    gridProperties: {
                      frozenRowCount: 1,
                    },
                  },
                },
              },
            ],
          }),
        }
      );

      if (addRes.ok) {
        // Initialize header
        const settingsHeader = [
          'Key (หัวข้อการตั้งค่า)',
          'Description (คำอธิบาย / สรุปย่อ)',
          'Updated At (อัปเดตล่าสุดเมื่อ)',
          'Full Settings JSON (ข้อมูลเต็มระบบ)',
        ];
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
            SETTINGS_SHEET_NAME
          )}!A1:D1?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              values: [settingsHeader],
            }),
          }
        );
      }
    }
  } catch (err) {
    console.warn('Could not verify or add Settings sheet:', err);
  }
}

/**
 * Loads all document records from the Google Sheet
 */
export async function loadDocumentsFromSheet(
  token: string,
  spreadsheetId: string
): Promise<DocumentData[]> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SHEET_NAME
      )}!A2:L?valueRenderOption=UNFORMATTED_VALUE`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.warn('Could not read sheet values', await res.text());
      return [];
    }

    const data = await res.json();
    const rows = data.values || [];
    const documents: DocumentData[] = [];

    for (const row of rows) {
      const jsonPayload = row[11];
      if (jsonPayload) {
        try {
          const doc: DocumentData = JSON.parse(jsonPayload);
          documents.push(doc);
        } catch {
          // If json parsing fails, fallback construct from row columns
          const fallbackDoc: DocumentData = {
            id: String(row[0] || Date.now()),
            docNumber: String(row[1] || ''),
            docType: (row[2] || 'RC') as any,
            date: String(row[3] || ''),
            customer: {
              name: String(row[4] || ''),
              phone: String(row[5] || ''),
            },
            items: [],
            subtotal: Number(row[6]) || 0,
            discountPercent: 0,
            discountAmount: 0,
            vatEnabled: false,
            vatRate: 7,
            vatAmount: 0,
            grandTotal: Number(row[6]) || 0,
            paidAmount: Number(row[6]) || 0,
            remainingAmount: 0,
            bahtText: '',
            notes: '',
            paymentTerms: '',
            status: (row[7] || 'issued') as any,
            driveFileUrl: String(row[8] || ''),
            createdAt: String(row[9] || new Date().toISOString()),
            updatedAt: String(row[10] || new Date().toISOString()),
          };
          documents.push(fallbackDoc);
        }
      }
    }

    return documents;
  } catch (err) {
    console.error('Error loading documents from sheet:', err);
    return [];
  }
}

/**
 * Syncs full document list to the Google Sheet (replaces sheet content starting at row 2)
 */
export async function syncAllDocumentsToSheet(
  token: string,
  spreadsheetId: string,
  documents: DocumentData[]
): Promise<void> {
  // Clear existing data rows starting from row 2
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SHEET_NAME
    )}!A2:L:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (documents.length === 0) return;

  const rows = documents.map((doc) => [
    doc.id,
    doc.docNumber,
    doc.docType,
    doc.date,
    doc.customer.name || '',
    doc.customer.phone || '',
    doc.grandTotal,
    doc.status,
    doc.driveFileUrl || '',
    doc.createdAt,
    doc.updatedAt,
    JSON.stringify(doc),
  ]);

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SHEET_NAME
    )}!A2:L${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    console.error('Failed to sync documents to sheet:', errorText);
    throw new Error('ไม่สามารถบันทึกข้อมูลลงใน Google Sheet ได้');
  }
}

/**
 * Saves company and system settings to the 'Settings' sheet tab
 */
export async function saveSettingsToSheet(
  token: string,
  spreadsheetId: string,
  settings: CompanySettings
): Promise<void> {
  // Ensure the Settings tab exists
  await ensureSettingsSheetExists(token, spreadsheetId);

  const now = new Date().toISOString();
  const summary = `บริษัท: ${settings.companyName || '-'}, สาขา: ${(settings.branches || []).join(', ')}, รายการตั้งค่า: ${settings.presetItems?.length || 0} รายการ, ประเภทห้อง: ${settings.presetRoomTypes?.length || 0} แบบ`;

  // Row 2 contains main JSON payload
  const mainRow = [
    'SYSTEM_CONFIG',
    summary,
    now,
    JSON.stringify(settings),
  ];

  // Additional rows for quick human readability when opened in Google Sheets
  const rows = [
    mainRow,
    ['companyName', settings.companyName || '', now, ''],
    ['companyNameEn', settings.companyNameEn || '', now, ''],
    ['taxId', settings.taxId || '', now, ''],
    ['phone', settings.phone || '', now, ''],
    ['email', settings.email || '', now, ''],
    ['address', settings.address || '', now, ''],
    ['branches', (settings.branches || []).join(' | '), now, ''],
    ['bankInfo', `${settings.bankName || ''} - ${settings.bankAccountNo || ''} (${settings.bankAccountName || ''})`, now, ''],
    ['promptPayNo', settings.promptPayNo || '', now, ''],
    ['signatureName', `${settings.signatureName || ''} (${settings.signatureTitle || ''})`, now, ''],
    ['hasSignatureImage', settings.signatureImageUrl ? 'Yes' : 'No', now, ''],
    ['hasLogo', settings.logoUrl ? 'Yes' : 'No', now, ''],
    ['roomTypes', (settings.presetRoomTypes || []).map((r) => `${r.name} (${(r.roomNumbers || []).join(',')})`).join(' | '), now, ''],
    ['presetItemsCount', String(settings.presetItems?.length || 0), now, ''],
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      SETTINGS_SHEET_NAME
    )}!A2:D${rows.length + 1}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const errorText = await updateRes.text();
    console.error('Failed to save settings to sheet:', errorText);
    throw new Error('ไม่สามารถบันทึกการตั้งค่าลงใน Google Sheet ได้');
  }
}

/**
 * Loads company and system settings from the 'Settings' sheet tab
 */
export async function loadSettingsFromSheet(
  token: string,
  spreadsheetId: string
): Promise<CompanySettings | null> {
  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
        SETTINGS_SHEET_NAME
      )}!A2:D2?valueRenderOption=UNFORMATTED_VALUE`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      console.warn('Could not read settings from sheet:', await res.text());
      return null;
    }

    const data = await res.json();
    const rows = data.values || [];
    if (!rows.length || !rows[0]) return null;

    const firstRow = rows[0];
    // Cell D2 holds the full JSON payload
    const jsonPayload = firstRow[3] || firstRow[1];
    if (jsonPayload && typeof jsonPayload === 'string') {
      try {
        const parsed = JSON.parse(jsonPayload);
        if (parsed && typeof parsed === 'object' && parsed.companyName !== undefined) {
          return parsed as CompanySettings;
        }
      } catch (err) {
        console.warn('Failed to parse settings JSON payload from sheet', err);
      }
    }

    return null;
  } catch (err) {
    console.error('Error loading settings from sheet:', err);
    return null;
  }
}
