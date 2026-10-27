/**
 * Converts a numeric value into Thai Baht text representation
 * Example: 1250.75 -> "หนึ่งพันสองร้อยห้าสิบบาทเจ็ดสิบห้าสตางค์"
 * Example: 5000 -> "ห้าพันบาทถ้วน"
 */

const THAI_NUMBERS = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_UNITS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

function convertIntegerPart(numStr: string): string {
  let result = '';
  const len = numStr.length;

  for (let i = 0; i < len; i++) {
    const digit = parseInt(numStr[i], 10);
    const unitIndex = (len - 1 - i) % 6;

    if (digit !== 0) {
      if (unitIndex === 1 && digit === 1) {
        // e.g. 10 -> 'สิบ' instead of 'หนึ่งสิบ'
        result += '';
      } else if (unitIndex === 1 && digit === 2) {
        // e.g. 20 -> 'ยี่สิบ'
        result += 'ยี่';
      } else if (unitIndex === 0 && digit === 1 && len > 1 && numStr[i - 1] !== '0') {
        // e.g. 21 -> 'ยี่สิบเอ็ด'
        result += 'เอ็ด';
      } else {
        result += THAI_NUMBERS[digit];
      }

      result += THAI_UNITS[unitIndex];
    }

    if (unitIndex === 0 && i < len - 1) {
      result += 'ล้าน';
    }
  }

  return result;
}

export function formatThaiBahtText(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) {
    return 'ศูนย์บาทถ้วน';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const fixed = absNum.toFixed(2);
  const [bahtStr, satangStr] = fixed.split('.');

  let text = '';
  if (isNegative) text += 'ลบ';

  if (parseInt(bahtStr, 10) === 0) {
    text += '';
  } else {
    text += convertIntegerPart(bahtStr) + 'บาท';
  }

  const satangVal = parseInt(satangStr, 10);
  if (satangVal === 0) {
    text += 'ถ้วน';
  } else {
    if (text === '' || text === 'ลบ') {
      text += '';
    }
    text += convertIntegerPart(satangStr) + 'สตางค์';
  }

  return text;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
