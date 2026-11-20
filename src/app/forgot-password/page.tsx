'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AccountRole = 'STUDENT' | 'VOLUNTEER' | 'TRUSTEE';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>('STUDENT');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setMessage({ text: 'Enter a valid 10-digit Indian mobile number.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, type: 'FORGOT_PASSWORD', role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not send verification code.');
      }

      setOtpSent(true);
      setOtpCode('');
      setMessage({ text: data.message, type: 'success' });
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Network error. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      setMessage({ text: 'Request a verification code before resetting your password.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, role, otpCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setMessage({ text: data.message, type: 'success' });
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Network error. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, '').slice(0, 10));
    setOtpSent(false);
    setOtpCode('');
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-xl mx-auto flex items-center justify-center">
            HT
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-3">Reset Account Password</h2>
          <p className="text-xs text-slate-500">Verify your registered mobile number with a one-time code.</p>
        </div>

        {message && (
          <div
            role="alert"
            className={`p-3.5 rounded-xl text-xs font-bold ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="account-role" className="block text-xs font-bold text-slate-700 mb-1">Account type</label>
            <select
              id="account-role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as AccountRole);
                setOtpSent(false);
                setOtpCode('');
                setMessage(null);
              }}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="STUDENT">Student</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="TRUSTEE">Trustee</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-slate-700 mb-1">Registered mobile number</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              required
              maxLength={10}
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
          >
            {loading ? 'Sending code…' : otpSent ? 'Resend verification code' : 'Send verification code'}
          </button>

          {otpSent && (
            <>
              <div>
                <label htmlFor="otp" className="block text-xs font-bold text-slate-700 mb-1">6-digit verification code</label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  placeholder="Enter the code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono tracking-widest"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-xs font-bold text-slate-700 mb-1">New password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-bold text-slate-700 mb-1">Confirm new password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition disabled:opacity-50"
              >
                {loading ? 'Updating password…' : 'Reset password'}
              </button>
            </>
          )}
        </form>

        <div className="text-center pt-2">
          <Link href="/login" className="text-xs font-bold text-amber-700 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
