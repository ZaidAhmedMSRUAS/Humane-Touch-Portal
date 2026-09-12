/**
 * Validation and sanitization helpers for Humane Touch Udaan Portal
 */

// 1. Sanitize & Validate 10-digit Indian Mobile Numbers
export function sanitizePhoneNumber(phone: string | number): string | null {
  if (!phone) return null;
  
  // Strip all non-digit characters (+91, spaces, dashes, parentheses)
  let cleaned = String(phone).replace(/\D/g, '');

  // Remove leading 91 (country code) if 12 digits
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  }

  // Remove leading 0 if 11 digits
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Check if exactly 10 digits starting with 6, 7, 8, or 9
  const isValid = /^[6-9]\d{9}$/.test(cleaned);
  return isValid ? cleaned : null;
}

// 2. Validate Monetary Amounts (Tuition fee, Income, Sanction amount)
export function sanitizeAmount(value: any, fallback: number = 0): number {
  const num = Number(String(value).replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num < 0) return fallback;
  return Math.round(num * 100) / 100;
}

// 3. Validate Percentage / Academic Marks (0 to 100)
export function sanitizeMarks(value: any, fallback: number = 75.0): number {
  const num = Number(String(value).replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num < 0 || num > 100) return fallback;
  return Math.round(num * 100) / 100;
}

// 4. Sanitize General Text Strings
export function sanitizeText(str: any, maxLength: number = 255): string {
  if (!str) return '';
  return String(str).trim().slice(0, maxLength);
}