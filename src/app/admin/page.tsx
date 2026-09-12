import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PendingDeletionsAdminPanel from '@/components/admin/PendingDeletionsAdminPanel';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            Executive Control
          </span>
          <h1 className="text-2xl font-black mt-2">Admin Management Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">Supervise scholarship disbursements, staff records, and authorize student deletions</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/historical-import"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            📥 Import Historical Data
          </Link>
        </div>
      </div>

      {/* Admin Student Deletion Authorization Panel */}
      <PendingDeletionsAdminPanel />
    </div>
  );
}