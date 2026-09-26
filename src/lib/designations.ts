import { UserRole } from '@prisma/client';

export interface DesignationUser {
  fullName?: string | null;
  name?: string | null;
  role?: string | UserRole | null;
  phone?: string | null;
}

/**
 * Returns official designation label.
 * Prioritizes the database 'role' above all else.
 * Any account with role 'STUDENT' is strictly 'Student Scholar'.
 */
export function getDesignation(
  userOrName?: DesignationUser | string | null,
  roleArg?: string | UserRole | null,
  phoneArg?: string | null
): string {
  let fullName = '';
  let role = '';
  let phone = '';

  if (typeof userOrName === 'object' && userOrName !== null) {
    fullName = String(userOrName.fullName || userOrName.name || '');
    role = String(userOrName.role || '');
    phone = String(userOrName.phone || '');
  } else if (typeof userOrName === 'string') {
    fullName = userOrName;
    role = typeof roleArg === 'string' ? roleArg : '';
    phone = typeof phoneArg === 'string' ? phoneArg : '';
  }

  const normalizedRole = role.toUpperCase().trim();

  // 1. HARD RULE: Any user with the STUDENT role is strictly a "Student Scholar"
  if (normalizedRole === 'STUDENT' || normalizedRole === UserRole.STUDENT) {
    return 'Student Scholar';
  }

  // 2. ADMIN: ONLY if database role is explicitly ADMIN
  if (normalizedRole === 'ADMIN' || normalizedRole === UserRole.ADMIN) {
    return 'Portal Administrator';
  }

  // 3. TRUSTEE: ONLY if database role is explicitly TRUSTEE
  if (normalizedRole === 'TRUSTEE' || normalizedRole === UserRole.TRUSTEE) {
    if (/oomer|tazaiyun/i.test(fullName)) {
      return 'Secretary & Trustee';
    }
    return 'Board of Trustees';
  }

  // 4. VOLUNTEER: ONLY if database role is explicitly VOLUNTEER
  if (normalizedRole === 'VOLUNTEER' || normalizedRole === UserRole.VOLUNTEER) {
    if (phone === '9972533519' || /nimra/i.test(fullName)) {
      return 'Head Volunteer Coordinator';
    }
    return 'Field Verification Volunteer';
  }

  // 5. Default fallback
  return 'Student Scholar';
}
