'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'REQUEST_OTP' | 'RESET_PASSWORD'>('REQUEST_OTP');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, type: 'FORGOT_PASSWORD' }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess('OTP verification code sent! Check your phone/terminal.');
        if (data.devCode) {
          setOtpCode(data.devCode);
        }
        setStep('RESET_PASSWORD');
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error resetting password.');
    }
  };

  return (
    <div 
      className="relative min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden rounded-3xl my-4 bg-cover bg-center bg-no-repeat shadow-2xl border border-slate-300"
      style={{ backgroundImage: "url('/banner.jpeg')" }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 p-8 z-10 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-block bg-white px-3 py-1.5 rounded-2xl shadow-sm border border-slate-100 mb-2">
            <img src="/logo.png" alt="Humane Touch" className="h-8 object-contain" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Account Recovery</h2>
          <p className="text-xs text-slate-500">Humane Touch Trust • Udaan Scholarship Platform</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {step === 'REQUEST_OTP' ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Registered Mobile Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full text-sm border border-slate-300 rounded-xl pl-12 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phone}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Enter 6-Digit OTP Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-lg font-mono font-bold tracking-widest border border-slate-300 rounded-xl py-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/40"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                New Password (Min 6 chars)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Reset Password & Proceed'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('REQUEST_OTP')}
                className="text-slate-400 hover:text-slate-700 text-[11px] font-semibold"
              >
                ← Resend OTP or Change Mobile
              </button>
            </div>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/login" className="text-xs font-bold text-amber-600 hover:text-amber-800 transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}