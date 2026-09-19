import { UserRole } from '@prisma/client';

export interface DesignationUser {
  fullName?: string | null;
  name?: string | null;
  role?: string | UserRole | null;
  phone?: string | null;
}

/**
 * Returns the official designation label.
 * Prioritizes the database 'role' above all else.
 * A user with the role 'STUDENT' is ALWAYS a 'Student Scholar', regardless of name.
 */
export function getDesignation(
  userOrName?: DesignationUser | string | null,
  roleArg?: string | UserRole | null,
  phoneArg?: string | null
): string {
  let fullName: string | null = null;
  let role: string | null = null;
  let phone: string | null = null;

  if (typeof userOrName === 'object' && userOrName !== null) {
    fullName = userOrName.fullName || userOrName.name || null;
    role = (userOrName.role as string) || null;
    phone = userOrName.phone || null;
  } else {
    fullName = userOrName || null;
    role = (roleArg as string) || null;
    phone = phoneArg || null;
  }

  const normalizedRole = role ? String(role).toUpperCase().trim() : null;

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
    if (fullName && /oomer|tazaiyun/i.test(fullName)) {
      return 'Secretary & Trustee';
    }
    return 'Board of Trustees';
  }

  // 4. VOLUNTEER: ONLY if database role is explicitly VOLUNTEER
  if (normalizedRole === 'VOLUNTEER' || normalizedRole === UserRole.VOLUNTEER) {
    if (phone === '9972533519' || (fullName && /nimra/i.test(fullName))) {
      return 'Head Volunteer Coordinator';
    }
    return 'Field Verification Volunteer';
  }

  // 5. Default fallback: NEVER infer Admin, Trustee, or Volunteer from a name
  return 'Student Scholar';
}