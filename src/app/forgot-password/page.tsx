'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        body: JSON.stringify({ identifier, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ text: data.message, type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setMessage({ text: data.error || 'Password reset failed', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-xl mx-auto flex items-center justify-center">
            HT
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-3">Reset Account Password</h2>
          <p className="text-xs text-slate-500">Enter your registered 10-digit phone number and new password</p>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs font-bold ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registered Phone Number</label>
            <input
              type="text"
              required
              maxLength={10}
              placeholder="e.g. 9845027337"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
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
            {loading ? 'Updating Password...' : 'Update Password & Sign In'}
          </button>
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