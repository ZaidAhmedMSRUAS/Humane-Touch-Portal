'use client';

import React, { useState } from 'react';
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
        // Route dynamically based on user role
        if (role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'TRUSTEE') router.push('/trustee/dashboard');
        else if (role === 'VOLUNTEER') router.push('/volunteer/dashboard');
        else router.push('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden selection:bg-zinc-700 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-10 right-1/4 w-[400px] h-[300px] bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '36px 36px'
        }}
      />

      <div className="relative w-full max-w-md space-y-6">
        {/* Brand / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur-md shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
              Humane Touch Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Access Portal
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to manage scholarship dossiers and verification records.
          </p>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60 space-y-6">
          {/* Role Switcher */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono tracking-wider uppercase text-zinc-400">
              Select Role
            </label>
            <div className="grid grid-cols-4 p-1 rounded-xl bg-zinc-950/80 border border-zinc-800/70 gap-1">
              {(['STUDENT', 'VOLUNTEER', 'ADMIN', 'TRUSTEE'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setErrorMsg(null);
                  }}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 ${
                    role === r
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  {r.charAt(0) + r.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2.5">
              <span className="text-rose-400 text-sm font-mono mt-[-1px]">⚠</span>
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-zinc-300">
                Registered Mobile Number
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm font-mono text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-medium text-zinc-300">
                  Password
                </label>
                {role === 'STUDENT' && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Default: Phone number
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-200 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white text-zinc-950 font-semibold text-xs tracking-tight transition hover:bg-zinc-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-950" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying Credentials...
                </span>
              ) : (
                `Sign in as ${role.charAt(0) + role.slice(1).toLowerCase()}`
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
            <span>New applicant?</span>
            <button
              type="button"
              onClick={() => router.push('/apply')}
              className="text-zinc-300 hover:text-white font-medium underline underline-offset-4"
            >
              Submit Application Dossier
            </button>
          </div>
        </div>

        {/* System Status Pill */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Systems operational &middot; Encrypted SHA-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
