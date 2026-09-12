/**
 * Maps users to their official Trust designation
 */
export function getDesignation(name?: string | null, role?: string | null, phone?: string | null): string {
  if (!name && !role) return 'Portal User';

  const n = (name || '').toLowerCase();
  const p = (phone || '').trim();

  // 1. Specific Designated Officers
  if (n.includes('nimra') || p === '9972533519') return 'Head Volunteer';
  if (n.includes('tazaiyun') || p === '9845027337') return 'Secretary & Trustee';
  if (n.includes('nazia') || p === '9880118223') return 'Trustee';
  if (n.includes('zaiba') || p === '9845196360') return 'Trustee';
  if (n.includes('zaid') || p === '9902751305') return 'Admin';

  // 2. Generic Role Formatter
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'TRUSTEE':
      return 'Trustee';
    case 'VOLUNTEER':
      return 'Volunteer';
    case 'STUDENT':
      return 'Student Scholar';
    default:
      return role || 'Member';
  }
}