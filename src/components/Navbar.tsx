'use client';
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { getDesignation } from '@/lib/designations';

export default function Navbar() {
  const { data: session } = useSession();

  const fullName = session?.user?.name || 'Staff Member';
  const role = (session?.user as any)?.role;
  const phone = (session?.user as any)?.phone || session?.user?.email;
  const designation = getDesignation(fullName, role, phone);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Brand Logo & Portal Title */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-white text-base shadow-sm">
                HT
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-slate-900 block leading-tight">
                  Humane Touch
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 block">
                  Udaan Scholarship
                </span>
              </div>
            </Link>
          </div>

          {/* User Session & Status Badge */}
          <div className="flex items-center space-x-3">
            {session?.user ? (
              <div className="flex items-center space-x-3">
                
                {/* Updated Pill Badge: [Name] • [Designation] */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs font-bold text-slate-800 shadow-sm">
                  <span>🎴</span>
                  <span className="font-extrabold text-slate-900">{fullName}</span>
                  <span className="text-slate-400 font-normal">•</span>
                  <span className="font-semibold text-amber-700">{designation}</span>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition border border-rose-100"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}