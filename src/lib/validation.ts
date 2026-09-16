export function sanitizeText(str: any, maxLength: number = 255, ...rest: any[]): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

export function sanitizePhoneNumber(phone: any, fallback: string = '', ...rest: any[]): string {
  if (!phone) return fallback;
  const str = String(phone).trim();
  let cleaned = str.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned || fallback;
}

export function validateAndCleanPhone(phone: any, ...rest: any[]): { isValid: boolean; cleaned: string; error?: string } {
  const cleaned = sanitizePhoneNumber(phone);
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      cleaned,
      error: 'Mobile number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.',
    };
  }
  return { isValid: true, cleaned };
}

export function validateEmail(email: any, ...rest: any[]): { isValid: boolean; cleaned: string; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, cleaned: '', error: 'Email address is required.' };
  }
  const cleaned = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(cleaned)) {
    return {
      isValid: false,
      cleaned,
      error: 'Please enter a valid email address (e.g. student@gmail.com).',
    };
  }
  return { isValid: true, cleaned };
}

export function sanitizeMarks(marks: any, fallback: number = 0, ...rest: any[]): number {
  if (marks === undefined || marks === null || marks === '') return fallback;
  const num = Number(marks);
  if (isNaN(num)) return fallback;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return Math.round(num * 100) / 100;
}

export function sanitizeAmount(amount: any, fallback: number = 0, ...rest: any[]): number {
  if (amount === undefined || amount === null || amount === '') return fallback;
  const num = Number(amount);
  if (isNaN(num) || num < 0) return fallback;
  return Math.round(num);
}