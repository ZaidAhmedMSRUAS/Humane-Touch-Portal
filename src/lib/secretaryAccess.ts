const SECRETARY_EMAILS = new Set([
  'tazaiyun.oomer@humanetouch.org',
  'tazaiyun@humanetouch.org',
]);

export function isSecretaryAccount(user: any): boolean {
  return user?.role === 'TRUSTEE' && SECRETARY_EMAILS.has(String(user.email || '').trim().toLowerCase());
}
