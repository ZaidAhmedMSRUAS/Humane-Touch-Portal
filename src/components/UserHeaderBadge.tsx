'use client';
import React from 'react';
import { useSession } from 'next-auth/react';
import { getDesignation } from '@/lib/designations';

export default function UserHeaderBadge() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const fullName = session.user.name || 'Humane Touch Member';
  const role = (session.user as any).role;
  const phone = (session.user as any).phone || session.user.email;
  const designation = getDesignation(fullName, role, phone);

  return (
    <div className="flex items-center space-x-3 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800 shadow-sm">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow">
        {fullName.charAt(0).toUpperCase()}
      </div>
      <div className="text-left">
        <h4 className="text-xs font-black text-white leading-tight">{fullName}</h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-[11px] font-bold text-amber-300 tracking-wide">{designation}</span>
        </div>
      </div>
    </div>
  );
}