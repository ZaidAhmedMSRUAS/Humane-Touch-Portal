// Clean text strings and limit max length
export function sanitizeText(str: any, maxLength: number = 255): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
}

// Strictly validate and clean 10-digit mobile number (Indian format: starts with 6-9)
export function validateAndCleanPhone(phone: any): { isValid: boolean; cleaned: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, cleaned: '', error: 'Mobile number is required.' };
  }

  // Strip spaces, dashes, parentheses, and leading +91 / 0
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Check for exactly 10 digits starting with 6, 7, 8, or 9
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

// Strictly validate email format
export function validateEmail(email: any): { isValid: boolean; cleaned: string; error?: string } {
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

// Strictly sanitize and validate academic marks (0 to 100%)
export function sanitizeMarks(marks: any): number {
  const num = Number(marks);
  if (isNaN(num)) {
    throw new Error('Previous academic marks must be a valid numerical value.');
  }
  if (num < 0 || num > 100) {
    throw new Error('Previous academic marks cannot exceed 100% or be less than 0%.');
  }
  return Math.round(num * 100) / 100; // Round to 2 decimal places
}

// Clean and sanitize monetary amounts
export function sanitizeAmount(amount: any): number {
  const num = Number(amount);
  if (isNaN(num) || num < 0) {
    return 0;
  }
  return Math.round(num);
}