import { DocType } from '../types/document';

/**
 * Generates the next sequential document number in the format: XX2026-001
 * Where XX is the DocType prefix ('RC', 'QT', 'IN', 'CF')
 * 2026 is the year
 * 001 is a 3-digit zero-padded incremental sequence
 */
export function getNextDocNumber(
  docType: DocType,
  existingDocNumbers: string[],
  targetYear?: number
): string {
  const year = targetYear || new Date().getFullYear();
  const prefix = `${docType}${year}-`;

  let maxSeq = 0;
  for (const num of existingDocNumbers) {
    if (typeof num === 'string' && num.startsWith(prefix)) {
      const rest = num.substring(prefix.length);
      const parsed = parseInt(rest, 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return `${prefix}${padded}`;
}

export function parseDocNumber(docNumber: string): {
  prefix: string;
  year?: number;
  sequence?: number;
  isValid: boolean;
} {
  const match = docNumber.match(/^([A-Z]{2})(\d{4})-(\d+)$/i);
  if (match) {
    return {
      prefix: match[1].toUpperCase(),
      year: parseInt(match[2], 10),
      sequence: parseInt(match[3], 10),
      isValid: true,
    };
  }
  return {
    prefix: '',
    isValid: false,
  };
}
