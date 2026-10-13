'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'VOLUNTEER' | 'ADMIN' | 'TRUSTEE'>('ADMIN');
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
        setErrorMsg(
          role === 'ADMIN'
            ? 'No active ADMIN profile found for this mobile number or incorrect password.'
            : res.error
        );
      } else if (res?.ok) {
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TRUSTEE') router.push('/trustee');
        else if (role === 'VOLUNTEER') router.push('/volunteer');
        else router.push('/student');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      {/* Outer Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        
        {/* Top Tab Bar: Sign In vs New Student Register */}
        <div className="grid grid-cols-2 p-1.5 bg-[#f0f4f9] rounded-2xl mb-6">
          <button
            type="button"
            className="py-2.5 px-4 bg-white rounded-xl shadow-sm font-bold text-slate-800 text-sm transition"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => router.push('/apply')}
            className="py-2.5 px-4 font-semibold text-slate-500 hover:text-slate-800 text-sm transition cursor-pointer"
          >
            New Student Register
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200/70 rounded-2xl flex items-center gap-3 text-rose-800 text-xs sm:text-sm font-medium mb-6">
            <span className="text-amber-500 text-base">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sign In As Role Section */}
        <div className="space-y-2 mb-6">
          <label className="block text-xs font-bold text-slate-500 tracking-wider">
            SIGN IN AS ROLE:
          </label>
          <div className="grid grid-cols-4 p-1.5 bg-[#f0f4f9] rounded-2xl gap-1 items-center">
            {[
              { id: 'STUDENT', label: 'Student', icon: '🎓' },
              { id: 'VOLUNTEER', label: 'Volunteer', icon: '🗂️' },
              { id: 'ADMIN', label: 'Admin', icon: '⚙️' },
              { id: 'TRUSTEE', label: 'Trustee', icon: '🏛️' },
            ].map((item) => {
              const isActive = role === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setRole(item.id as any);
                    setErrorMsg(null);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-[#111827] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wider">
              REGISTERED MOBILE NUMBER
            </label>
            <div className="flex items-center bg-[#eef4ff] border border-blue-200/60 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-amber-500 focus-within:bg-white transition">
              <span className="text-slate-400 font-bold text-sm mr-2 select-none">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9902751305"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-transparent outline-none font-semibold text-slate-900 text-sm tracking-wide placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password with Forgot Password link and Eye Toggle */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-700 tracking-wider">
                PASSWORD
              </label>
              <button
                type="button"
                onClick={() => alert('Please contact the portal administrator to reset your password.')}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative flex items-center bg-[#eef4ff] border border-blue-200/60 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-amber-500 focus-within:bg-white transition">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none font-semibold text-slate-900 text-sm tracking-widest placeholder:tracking-normal placeholder:text-slate-400 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer select-none"
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

          {/* Solid Amber Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-black font-extrabold text-sm tracking-wider uppercase rounded-2xl shadow-md transition duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'SIGNING IN...' : `SIGN IN AS ${role}`}
          </button>
        </form>

        {/* Return to Main Page Link */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            ← Return to Main Page
          </button>
        </div>

      </div>
    </div>
  );
}
