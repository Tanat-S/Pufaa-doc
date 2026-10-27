/**
 * Google Drive API service for uploading and managing generated PDF documents
 */

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink: string;
}

/**
 * Searches for or creates a folder named 'AutoDoc Documents' in user's Google Drive
 */
export async function getOrCreateAutoDocFolder(token: string): Promise<string> {
  const query = encodeURIComponent(
    "name = 'AutoDoc Documents' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
  );
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    console.error('Failed to search Drive folders:', errorText);
    throw new Error('ไม่สามารถค้นหาโฟลเดอร์ใน Google Drive ได้');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Folder does not exist, create it
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'AutoDoc Documents',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'โฟลเดอร์จัดเก็บเอกสาร PDF จากระบบ AutoDoc',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    console.error('Failed to create Drive folder:', errorText);
    throw new Error('ไม่สามารถสร้างโฟลเดอร์ใน Google Drive ได้');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Uploads a PDF Blob to Google Drive using multipart upload
 */
export async function uploadPdfToDrive(
  token: string,
  pdfBlob: Blob,
  fileName: string,
  folderId?: string
): Promise<DriveUploadResult> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
    mimeType: 'application/pdf',
  };

  if (folderId) {
    metadata.parents = [folderId];
  }

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;

  const pdfArrayBuffer = await pdfBlob.arrayBuffer();
  const pdfBytes = new Uint8Array(pdfArrayBuffer);

  const header = new TextEncoder().encode(
    `${metadataPart}${delimiter}Content-Type: application/pdf\r\n\r\n`
  );
  const footer = new TextEncoder().encode(closeDelimiter);

  const combinedBody = new Uint8Array(header.length + pdfBytes.length + footer.length);
  combinedBody.set(header, 0);
  combinedBody.set(pdfBytes, header.length);
  combinedBody.set(footer, header.length + pdfBytes.length);

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combinedBody,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    console.error('Failed to upload PDF to Drive:', errorText);
    throw new Error('เกิดข้อผิดพลาดในการอัปโหลดไฟล์ PDF ไปยัง Google Drive');
  }

  const data = await uploadRes.json();
  return {
    fileId: data.id,
    name: data.name,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
  };
}
