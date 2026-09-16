import { UserRole } from '@prisma/client';

export function getDesignation(fullName?: string | null, role?: string | null, phone?: string | null): string {
  // 1. Check exact role first
  if (role === UserRole.ADMIN || role === 'ADMIN') {
    return 'Portal Administrator';
  }

  if (role === UserRole.TRUSTEE || role === 'TRUSTEE') {
    if (fullName?.toLowerCase().includes('oomer')) return 'Secretary & Trustee';
    return 'Board of Trustees';
  }

  if (role === UserRole.VOLUNTEER || role === 'VOLUNTEER') {
    // Nimra M is the Head Volunteer
    if (phone === '9972533519' || fullName?.toLowerCase().includes('nimra')) {
      return 'Head Volunteer Coordinator';
    }
    return 'Field Verification Volunteer';
  }

  // 2. Default strictly to Student
  return 'Scholarship Applicant (Student)';
}