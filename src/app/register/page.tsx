'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    otpCode: '',
    accountType: 'STUDENT' as 'STUDENT' | 'VOLUNTEER' | 'TRUSTEE',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const sendOtp = async () => {
    const email = formData.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address before requesting your OTP.'); return; }
    setOtpLoading(true); setError(null);
    try {
      const res = await fetch('/api/auth/otp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: email, type: 'EMAIL_VERIFY' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send verification code.');
      setOtpSent(true);
    } catch (err: any) { setError(err.message || 'Could not send verification code.'); }
    finally { setOtpLoading(false); }
  };

  // Filter phone input to strictly numbers and max 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: onlyDigits });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Full Name check
    if (formData.fullName.trim().length < 3) {
      setError('Full Name must be at least 3 characters long.');
      return;
    }

    // 2. Mobile number constraint check
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Mobile number must be exactly 10 digits starting with 6, 7, 8, or 9.');
      return;
    }

    // 3. Email constraint check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    // 4. Password constraint check
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // 5. Confirm password
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          otpCode: formData.otpCode,
          role: formData.accountType,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Account request submitted.');
        router.push('/login');
      } else {
        setError(data.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setError(err.message || 'A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl border border-slate-200 space-y-6">
        
        <div className="text-center space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
            Humane Touch Trust
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Create Your Portal Account</h1>
          <p className="text-xs text-slate-500">
            Register as a student, volunteer, or trustee
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-xs font-bold text-rose-800 flex items-start gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Register as <span className="text-rose-500">*</span></label>
            <select required value={formData.accountType} onChange={(e) => setFormData({ ...formData, accountType: e.target.value as typeof formData.accountType })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold">
              <option value="STUDENT">Student</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="TRUSTEE">Trustee</option>
            </select>
            {formData.accountType !== 'STUDENT' && <p className="mt-1 text-[10px] text-amber-800">Volunteer and trustee accounts need admin approval before sign in.</p>}
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Full Legal Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Mohammed Farhan"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mobile Number (10 Digits) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono font-bold text-slate-400 text-xs">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold tracking-wider"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Must start with 6, 7, 8, or 9 (no +91 or 0 prefix needed).</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. farhan@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email verification code <span className="text-rose-500">*</span></label>
              <input type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required placeholder="6 digit OTP" value={formData.otpCode} onChange={(e) => setFormData({ ...formData, otpCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-widest" />
            </div>
            <button type="button" onClick={sendOtp} disabled={otpLoading} className="px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-700 disabled:opacity-50">{otpLoading ? 'Sending…' : otpSent ? 'Resend code' : 'Send OTP'}</button>
            {otpSent && <p className="col-span-2 text-[11px] text-emerald-700 font-semibold">A verification code was sent to your email. It expires in 10 minutes.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl shadow transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Submitting...' : formData.accountType === 'STUDENT' ? 'Create Student Account' : `Request ${formData.accountType === 'VOLUNTEER' ? 'Volunteer' : 'Trustee'} Account`}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-amber-700 hover:underline">
            Log In Here
          </Link>
        </div>

      </div>
    </div>
  );
}
