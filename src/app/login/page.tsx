'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'VOLUNTEER' | 'ADMIN' | 'TRUSTEE'>('STUDENT');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        phone: phone.trim(),
        password: password,
        role: role,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else if (res?.ok) {
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TRUSTEE') router.push('/trustee');
        else if (role === 'VOLUNTEER') router.push('/volunteer');
        else router.push('/student');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50/40 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-200/80 overflow-hidden">
        {/* Yellowish / Amber Header with Logo */}
        <div className="bg-gradient-to-b from-amber-500 to-amber-600 p-6 text-white text-center flex flex-col items-center">
          {/* Logo container */}
          <div className="w-16 h-16 bg-white rounded-full p-2 shadow-md flex items-center justify-center mb-3">
            <img
              src="/logo.png"
              alt="Humane Touch Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback if logo.png is named logo.svg or missing
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight drop-shadow-sm">HUMANE TOUCH</h1>
          <p className="text-amber-100 text-xs mt-0.5 font-medium">Scholarship & Verification Portal</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* New Student Registration Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-950 font-semibold">New student applicant?</span>
            <button
              type="button"
              onClick={() => router.push('/apply')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition shadow-sm cursor-pointer"
            >
              Register Here
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <span className="text-rose-500 font-bold text-sm">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Role Segmented Tabs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              SIGN IN AS ROLE:
            </label>
            <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
              {(['STUDENT', 'VOLUNTEER', 'ADMIN', 'TRUSTEE'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setErrorMsg(null);
                  }}
                  className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    role === r
                      ? 'bg-white text-amber-700 shadow-sm border border-slate-200 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Registered Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
              />
            </div>

            {/* Password with View Toggle */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-slate-700">
                  Password <span className="text-rose-500">*</span>
                </label>
                {role === 'STUDENT' && (
                  <span className="text-[10px] text-slate-400">Default: Mobile Number</span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Yellow / Amber Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Signing In...' : `Sign In as ${role.charAt(0) + role.slice(1).toLowerCase()}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
