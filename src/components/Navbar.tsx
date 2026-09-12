'use client';
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Humane Touch Trust"
              className="h-9 w-auto object-contain group-hover:scale-105 transition duration-200"
            />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none">
              Humane Touch Trust
            </h1>
            <span className="text-[11px] font-semibold text-amber-600 block mt-0.5">
              Udaan Scholarship Platform
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation & Session Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-bold">
          {status === 'authenticated' && user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Active Role Badge */}
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {user.role === 'ADMIN' ? '⚙️ Admin' : user.role === 'TRUSTEE' ? '🏛️ Trustee' : user.role === 'VOLUNTEER' ? '📱 Volunteer' : '🎓 Student'} • {user.phone}
              </span>

              {/* Direct Dashboard Link */}
              <Link
                href={
                  user.role === 'ADMIN'
                    ? '/admin'
                    : user.role === 'TRUSTEE'
                    ? '/trustee'
                    : user.role === 'VOLUNTEER'
                    ? '/volunteer'
                    : '/student'
                }
                className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition"
              >
                Dashboard
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-sm"
              >
                Sign In / Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}