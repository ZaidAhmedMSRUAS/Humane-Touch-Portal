'use client';

import React, { useState, useRef, MouseEvent } from 'react';
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

  // Spotlight mouse-tracking effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

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
        if (role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'TRUSTEE') router.push('/trustee/dashboard');
        else if (role === 'VOLUNTEER') router.push('/volunteer/dashboard');
        else router.push('/student/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication handshake failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-zinc-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden select-none selection:bg-white/20 selection:text-white">
      {/* 1. Ambient Background Meshes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-sky-600/15 via-emerald-500/10 to-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-24 -right-12 w-[500px] h-[350px] bg-gradient-to-tl from-purple-600/10 to-transparent blur-[100px] pointer-events-none rounded-full" />

      {/* 2. Precision Dot-Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #71717a 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Brand Telemetry Badge */}
        <div className="flex flex-col items-center space-y-3">
          <div className="group relative inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-zinc-900/60 backdrop-blur-xl shadow-lg shadow-black/40 hover:border-white/20 transition-all duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-300 font-medium">
              HUMANE TOUCH PORTAL
            </span>
            <span className="text-[10px] text-zinc-500 font-mono pl-1 border-l border-zinc-800">
              v2.4
            </span>
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
              Sign In
            </h1>
            <p className="text-xs text-zinc-400 font-normal">
              Scholarship verification and governance network
            </p>
          </div>
        </div>

        {/* 3. Interactive Spotlight Card */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-3xl border border-white/10 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 hover:border-white/20"
        >
          {/* Spotlight Highlight Layer */}
          <div
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              opacity: mousePos.x === -1000 ? 0 : 1,
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.06), transparent 70%)`,
            }}
          />

          {/* Role Segmented Tabs */}
          <div className="relative space-y-2 mb-6">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 font-semibold">
                Access Level
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {role}
              </span>
            </div>

            <div className="grid grid-cols-4 p-1 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md gap-1">
              {(['STUDENT', 'VOLUNTEER', 'ADMIN', 'TRUSTEE'] as const).map((r) => {
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      setErrorMsg(null);
                    }}
                    className={`relative py-2 text-[11px] font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-zinc-800/90 border border-white/10 shadow-inner" />
                    )}
                    <span className="relative z-10">
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Banner with Slide-in Transition */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl border border-rose-500/20 bg-rose-950/40 text-rose-300 text-xs flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 font-mono text-xs">
                !
              </span>
              <p className="leading-snug">{errorMsg}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phone Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-300">
                Mobile Number
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Enter 10-digit registered number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm font-mono text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/30 focus:ring-2 focus:ring-white/10 group-hover:border-white/20"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 tracking-wider">
                  +91
                </span>
              </div>
            </div>

            {/* Password Input with Interactive Toggle */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-medium text-zinc-300">
                  Password
                </label>
                {role === 'STUDENT' && (
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Default: Mobile No.
                  </span>
                )}
              </div>

              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder:text-zinc-600 outline-none transition-all duration-200 focus:border-white/30 focus:ring-2 focus:ring-white/10 group-hover:border-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors duration-150 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Eye Off */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    /* Eye On */
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Shimmer Light-Sweep Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="relative group w-full mt-2 py-3 px-4 rounded-xl bg-white text-zinc-950 font-bold text-xs tracking-wide transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden shadow-lg"
            >
              {/* Internal light shimmer sweep */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5 text-zinc-950" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authorizing Session...
                </span>
              ) : (
                `Enter as ${role.charAt(0) + role.slice(1).toLowerCase()} →`
              )}
            </button>
          </form>

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>First time student applicant?</span>
            <button
              type="button"
              onClick={() => router.push('/apply')}
              className="text-white hover:text-emerald-400 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
            >
              Start Application
            </button>
          </div>
        </div>

        {/* Global System Telemetry Status Footer */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>PostgreSQL Pool: Ready</span>
          </div>
          <span>&middot;</span>
          <span>NextAuth JWT</span>
          <span>&middot;</span>
          <span>TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}
